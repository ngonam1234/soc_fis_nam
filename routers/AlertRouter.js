import express from 'express';
import { createTicket, getAlert, getAllAlert, getDetailAlert, reviewAlert } from '../controllers/alert/AlertController.js';
import { validateTokenStaffAccess } from '../token/ValidateToken.js';
import myLogger from '../winstonLog/winston.js';
const router = express.Router();


router.get('/getAllAlert', async (req, res, next) => {
    let { start_day, end_day, tenant, limit, page } = req.body;
    let response = await getAllAlert(start_day, end_day, tenant, limit, page);
    next(response);
})

router.get('/:id', async (req, res, next) => {
    let { id } = req.params;
    let response = await getDetailAlert(id);
    next(response);
})


router.get('/', async (req, res, next) => {
    let { query, limit, sort, page } = req.query;
    let response = await getAlert(query, limit, sort, page);
    next(response);
})

router.put('/:id/', async (req, res, next) => {
    myLogger.info("in ---------------")
    let { id } = req.params;
    let response = undefined;
    response = await reviewAlert({ id }, { reviewed_time: new Date() });
    next(response);
})

router.post('/create/:id', async (req, res, next) => {
    let { id } = req.params;
    let { severity, owners } = req.body;
    let { email } = req.payload;
    let acc = email.split("@");
    let response = await createTicket(id, severity, acc[0], owners);
    next(response)
})




export default router;
