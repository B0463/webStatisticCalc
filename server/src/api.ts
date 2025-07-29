import Express from 'express';

class API {
    private App: Express.Application; // holds the App instance

    constructor(App: Express.Application) {
        this.App = App; // catch the App instante in construction
    }

    // function for /api/sum request
    private async sum(req: Express.Request, res: Express.Response) {
        const { a, b } = req.body;
        const sum = a + b;

        res.status(200).json({ result: sum });
    }

    public createRoutes() {
        // create the routes with path and functions
        this.App.post("/api/sum", this.sum);
    }
}

export default API;