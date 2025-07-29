import Express from 'express';
import path from 'path';
import fs from 'fs';
import API from './api';

async function main() {
    // create instances
    const App = Express();
    const APIInstance = new API(App);

    // create middlewares
    App.use(Express.json());

    // define index get route
    App.get("/", (req: Express.Request, res: Express.Response)=>{
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
