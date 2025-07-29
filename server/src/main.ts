import Express from 'express';
import path from 'path';
import fs from 'fs';

async function main() {
    const App = Express();
    
    App.get("/", async (req, res)=>{
        fs.readFile(path.join(__dirname, "../../front/index.html"), (err, data)=>{
            res.status(200).send(data.toString());
        });
    });

    App.listen(8080, async ()=>{
        console.log("Server listening on port 8080 [alt HTTP]");
    });
}

main();
