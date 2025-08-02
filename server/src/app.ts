import Express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import temperatureRoutes from './routes/TemperatureRoute';

const App = Express();

// Middlewares
App.use(Express.json());
App.use('/assets', Express.static(path.join(__dirname, '../../front/assets')));

App.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON format' });
    }
    next();
});

// define index get route
App.get("/", (req: Request, res: Response)=>{
    // join the relative path to index
    const filePath = path.join(__dirname, "../../front/index.html");

    // read index async and response the data
    fs.readFile(filePath, (err, data)=>{
        res.status(200).send(data.toString());
    });
});

// API routes
App.use('/api', temperatureRoutes);

export default App;
