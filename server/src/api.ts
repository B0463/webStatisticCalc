import {Application, Request, Response } from 'express';

type ApiRequest = {
    latitude: number;
    longitude: number;
    start_time: string;  // ISO date string
    end_time: string;    // ISO date string
}

class API {
    private App: Application; // holds the App instance

    constructor(App: Application) {
        this.App = App; // catch the App instante in construction
    }

    // request verification for /api/temperature request
    private async verifyRequest(body: ApiRequest) {
        const startDate = new Date(body.start_time);
        const endDate = new Date(body.end_time);
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
            return { error: "start_time need to be a valid ISO date" };
        
        if(isNaN(endDate.getTime()))
            return { error: "end_time need to be a valid ISO date" };

        if(body.latitude < -90 || body.latitude > 90)
            return { error: "latitude must be between -90 and 90" };

        if(body.longitude < -180 || body.longitude > 180)
            return { error: "longitude must be between -180 and 180" };

        // verify time
        if(startDate < minDate)
            return { error: "start_time must be after 1990-01-01" };

        if(endDate > cutoff)
            return { error: "end_time must be at least 24 hours before now" };

        if(deltaTime > 30*24*60*60*1000)
            return { error: "The time window must to be less then 30 days" };
    
        if(deltaTime < 0)
            return { error: "The start_time must to be less then end_time" };

        return {};
    }

    // function for /api/temperature request
    private async temperature(req: Request<{}, {}, ApiRequest>, res: Response) {
        const body: ApiRequest = req.body; // get input data
        
        const verification = await this.verifyRequest(body);

        if(verification.error)
            return res.status(400).json(verification);



        res.status(200).json({ message: "data ok" });
    }

    public createRoutes() {
        // create the routes with path and functions
        this.App.post("/api/temperature", this.temperature.bind(this));
    }
}

export default API;