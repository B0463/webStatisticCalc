import { Request, Response } from 'express';
import TemperatureService from '../services/TemperatureService';

class TemperatureController {
    static async getTemperature(req: Request, res: Response) {
        const body = req.body;

        const result = await TemperatureService.processTemperatureRequest(body);

        if(result.error) {
            return res.status(400).json({ error: result.error });
        }

        return res.status(200).json(result.response);
    }
}

export default TemperatureController;