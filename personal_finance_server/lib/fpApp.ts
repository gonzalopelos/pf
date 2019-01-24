
import * as express from "express";
import * as bodyParser from "body-parser";
import { Routes } from "./routes/crmRoutes";
import * as mongoose from "mongoose";
var cors = require('cors')

class FpApp {

    public expressApp: express.Application;
    public routePrv: Routes = new Routes();
    public mongoUrl: string = 'mongodb://localhost/personal_finances';
    
    constructor() {
        this.expressApp = express();
        this.config();        
        this.routePrv.routes(this.expressApp);  
        this.mongoSetup();   
    }

    private config(): void{
        this.expressApp.use(bodyParser.json());
        this.expressApp.use(bodyParser.urlencoded({ extended: false }));
        this.expressApp.use(cors());
    }
    private mongoSetup(): void{
        // mongoose.Promise = global.Promise;
        mongoose.connect(this.mongoUrl);    
    }
}

export default new FpApp().expressApp;