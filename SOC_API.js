import express, { urlencoded } from 'express';
import mongoose from "mongoose";
import myLogger from "./winstonLog/winston.js";
import dotenv from 'dotenv';
import cors from 'cors';
import mainAPI from './routers/MainRouters.js';
import dashboardAPI from './routers/DashRouter.js';
import userAPI from './routers/UserRouter.js';
import alertAPI from './routers/AlertRouter.js';
import authAPI from './routers/Authentication.js';
import tenantAPI from './routers/TenantRouter.js';
import { BAD_REQUEST, CREATED, NO_CONTENT, OK } from './constant/HttpResponseCode.js';
import cookieParser from 'cookie-parser';
import { publicMobile } from './Mqtt.js';
import { validateTokenStaffAccess } from './token/ValidateToken.js';

dotenv.config();
const app = express();
app.use(cors());
const dbname = process.env.SOC_API_DBNAME;
const host = process.env.SOC_API_HOSTDB;
const port = process.env.SOC_API_PORTDB;
const user = process.env.SOC_API_USERDB;
const pass = process.env.SOC_API_PASSWORDDB;

app.use(express.json())
app.use(urlencoded({ extended: false }));
app.use(cookieParser());
// app.use('/api', mainAPI);
app.use('/apiDash', validateTokenStaffAccess, dashboardAPI);
app.use('/apiUser',validateTokenStaffAccess, userAPI);
app.use('/apiAlert', validateTokenStaffAccess, alertAPI);
app.use('/apiTenant',validateTokenStaffAccess, tenantAPI);
app.use('/', authAPI)

app.use((data, req, res, next) => {
    let statusCode = data.statusCode;
    // myLogger.info(data)
    if (statusCode !== OK && statusCode !== CREATED && statusCode !== NO_CONTENT) {
        let { method, url } = req;
        // myLogger.info("Method:" + method + ", URl:" + url + ", Error: " + JSON.stringify(data), { label: "RESPONSE-ERROR" });
        res.status(statusCode || BAD_REQUEST).send({
            code: statusCode,
            error: data.data ? data.data : data.error,
            description: data.description
        })
    } else {
        let { method, url } = req;
        // myLogger.info("Method:" + method + ", URl:" + url + ", Data: %o", data.data, { label: "RESPONSE-OK" });
        // myLogger.info("Method:" + method + ", URl:" + url + ", Data: " + JSON.stringify(data.data), { label: "RESPONSE-OK" });
        res.status(statusCode).send(data.data)
    }
});



const dburl = `mongodb://${user}:${pass}@${host}:${port}/${dbname}?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=${dbname}&authMechanism=SCRAM-SHA-256`
mongoose.connect(dburl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) {
            myLogger.info("%o", err)
        } else {
            myLogger.info("OK")
        }
    })
//  publicMobile();
const portNode = process.env.SOC_API_PORTNODE || 3000
const host_node = '0.0.0.0';
function myListener() {
    myLogger.info(`Listening on port ${portNode}..`);
}
app.listen(portNode, host_node, myListener)