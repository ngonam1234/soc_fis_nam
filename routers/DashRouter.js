import express from 'express';
import { getAllTenant, getCountAlert, getCountTicket, getDashboard, getIncidentTotal } from '../controllers/dashboard/Dashboard.js';
import { validateTokenStaffAccess } from '../token/ValidateToken.js';
import myLogger from '../winstonLog/winston.js';
const router = express.Router();


router.get('/getCountTicket', async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getCountTicket(start_day, end_day, tenant);
    next(response);
})

router.get('/getCountAlert', async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getCountAlert(start_day, end_day, tenant);
    next(response);
})

router.get('/getAllTenant', async (req, res, next) => {
    let response = await getAllTenant();
    next(response);
})


router.get('/getDashboard/', async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let { tenantCodes } = req;
    myLogger.info("tenantCodes: %o",  tenantCodes)
    let response = await getDashboard(tenantCodes, start_day, end_day, tenant);
    next(response);
})


router.get('/getIncident/', async (req, res, next) => {
    let {start_day, end_day, tenant} = req.query;
    let response = await getIncidentTotal( start_day, end_day, tenant);
    next(response);
})


export default router;