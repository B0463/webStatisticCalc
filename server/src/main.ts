import Express from 'express';

async function main() {
    const App = Express();
    
    App.get("/", async (req, res)=>{
        res.status(200).send("test");
    });

    App.listen(8080, async ()=>{
        console.log("Server listening on port 8080 [alt HTTP]");
    });
}

main();
