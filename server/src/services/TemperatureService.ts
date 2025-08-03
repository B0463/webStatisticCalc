import axios from 'axios';
import statisticsUtils from '../utils/statisticsUtils';

type ApiRequest = {
    latitude: number;
    longitude: number;
    start_date: string;
    end_date: string;
};

type ApiResponse = {
    timestamps: string[];
    temperatures: number[];
    statistics: {
        mean: number;
        median: number;
        mode: number[];
        variance: number;
        stdDev: number;
        min: number;
        max: number;
        quartiles: {
            q1: number;
            q2: number;
            q3: number;
        };
        iqr: number;
    };
};

interface OpenMeteoResponse {
    hourly: {
        time: string[];
        temperature_2m: number[];
    };
}

class TemperatureService {
    static async verifyRequest(body: ApiRequest) {
        const startDate = new Date(body.start_date);
        const endDate = new Date(body.end_date);
        const now = new Date();
        const minDate = new Date("1990-01-01");
        const deltaTime = endDate.getTime() - startDate.getTime();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        if(typeof body.latitude !== 'number') return { error: "latitude must be a number" };
        if(typeof body.longitude !== 'number') return { error: "longitude must be a number" };
        if(isNaN(startDate.getTime())) return { error: "start_date must be a valid ISO date" };
        if(isNaN(endDate.getTime())) return { error: "end_date must be a valid ISO date" };
        if(body.latitude < -90 || body.latitude > 90) return { error: "latitude must be between -90 and 90" };
        if(body.longitude < -180 || body.longitude > 180) return { error: "longitude must be between -180 and 180" };
        if(startDate < minDate) return { error: "start_date must be after 1990-01-01" };
        if(endDate > cutoff) return { error: "end_date must be at least 24 hours before now" };
        if(deltaTime < 0) return { error: "start_date must be before end_date" };
        if(deltaTime > 365 * 24 * 60 * 60 * 1000) return { error: "The time window must be less than 365 days" };

        return {};
    }

    static async processTemperatureRequest(body: ApiRequest): Promise<{ response?: ApiResponse; error?: string }> {
        const verification = await this.verifyRequest(body);
        if(verification.error) return { error: verification.error };

        // access open-meteo API
        const url = 'https://archive-api.open-meteo.com/v1/archive';
        let response;

        try {
            // try to get data
            response = await axios.get<OpenMeteoResponse>(url, {
                params: {
                    latitude: body.latitude,
                    longitude: body.longitude,
                    hourly: 'temperature_2m',
                    start_date: body.start_date,
                    end_date: body.end_date,
                    timezone: 'America/Sao_Paulo'
                }
            });
        } catch (error) {
            return { error: `Error fetching weather data: ${error}` };
        }

        // calculate data
        const temperatures = response.data.hourly.temperature_2m;
        const timestamps = response.data.hourly.time;
        const statistics = {
            mean: statisticsUtils.mean(temperatures),
            median: statisticsUtils.median(temperatures),
            mode: statisticsUtils.mode(temperatures),
            variance: statisticsUtils.variance(temperatures),
            stdDev: statisticsUtils.stdDev(temperatures),
            min: statisticsUtils.min(temperatures),
            max: statisticsUtils.max(temperatures),
            quartiles: statisticsUtils.quartiles(temperatures),
            iqr: statisticsUtils.iqr(temperatures)
        };

        // create responde object and return
        const responseObj: ApiResponse = {
            timestamps,
            temperatures,
            statistics
        }
        return { response: responseObj }
    }
}

export default TemperatureService;
