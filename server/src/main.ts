import Express, {Request, Response, NextFunction} from 'express';
import path from 'path';
import fs from 'fs';
import API from './api';

async function main() {
    // create instances
    const App = Express();
    const APIInstance = new API(App);

    // create middlewares
    App.use(Express.json());

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

    APIInstance.createRoutes(); // create tha API post routes

    // start http server
    App.listen(8080, ()=>{
        console.log("Server listening on port 8080 [alt HTTP]");
    });
}

main();
