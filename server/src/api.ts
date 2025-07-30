import {Application, Request, Response } from 'express';
import statisticsUtils from './statisticsUtils';
import axios from 'axios';

type ApiRequest = {
    latitude: number;
    longitude: number;
    start_date: string;  // ISO date string
    end_date: string;    // ISO date string
}

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

class API {
    private App: Application; // holds the App instance

    constructor(App: Application) {
        this.App = App; // catch the App instante in construction
    }

    // request verification for /api/temperature request
    private async verifyRequest(body: ApiRequest) {
        const startDate = new Date(body.start_date);
        const endDate = new Date(body.end_date);
        const now = new Date();
        const minDate = new Date("1990-01-01");
        const deltaTime = endDate.getTime() - startDate.getTime();
        const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

        // verify data type and values
        if(typeof body.latitude !== 'number')
            return { error: "latitude need to be a number" };
        
        if(typeof body.longitude !== 'number')
            return { error: "longitude need to be a number" };
        
        if(isNaN(startDate.getTime()))
            return { error: "start_date need to be a valid ISO date" };
        
        if(isNaN(endDate.getTime()))
            return { error: "end_date need to be a valid ISO date" };

        if(body.latitude < -90 || body.latitude > 90)
            return { error: "latitude must be between -90 and 90" };

        if(body.longitude < -180 || body.longitude > 180)
            return { error: "longitude must be between -180 and 180" };

        // verify time
        if(startDate < minDate)
            return { error: "start_date must be after 1990-01-01" };

        if(endDate > cutoff)
            return { error: "end_date must be at least 24 hours before now" };

        if(deltaTime > 30*24*60*60*1000)
            return { error: "The time window must to be less then 30 days" };
    
        if(deltaTime < 0)
            return { error: "The start_date must to be less then end_date" };

        return {};
    }

    // get weather data and calculate statistics
    private async processTemperatures(body: ApiRequest): Promise<any|ApiResponse> {
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

    // function for /api/temperature request
    private async temperature(req: Request<{}, {}, ApiRequest>, res: Response) {
        const body: ApiRequest = req.body; // get input data
        
        // verify request
        const verification = await this.verifyRequest(body);
        if(verification.error)
            return res.status(400).json(verification);

        // process request
        const processing = await this.processTemperatures(body);
        if(processing.error)
            return res.status(400).json(processing);

        return res.status(200).json(processing.response);
    }

    public createRoutes() {
        // create the routes with path and functions
        this.App.post("/api/temperature", this.temperature.bind(this));
    }
}

export default API;