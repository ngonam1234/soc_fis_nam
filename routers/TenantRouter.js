import express from 'express';
import { createTanent, getDetailTenant, updateActive } from '../controllers/tenant/TenantController.js';
import { validateTokenStaffAccess } from '../token/ValidateToken.js';
import myLogger from '../winstonLog/winston.js';
const router = express.Router();


// router.get('/', async (req, res, next) => {
//     let response = await getAllTenant();
//     next(response);
// })

router.post('/create', async (req, res, next) => {
    let { code, name } = req.body;
    let { email } = req.payload;
    let response = await createTanent(code, name, email);
    next(response);
})

router.put('/updateActive/:id', async (req, res, next) => {
    let { id } = req.params;
    let { email } = req.payload;
    let { is_active } = req.body;
    myLogger.info('%o', { id, email, is_active })

    let response = await updateActive({ _id: id }, { created_by_update: email, is_active, update_time: new Date() });
    next(response);
})


router.get('/:id', async (req, res, next) => {
    let { id } = req.params;
    let response = await getDetailTenant({ _id: id });
    next(response);
})

export default router;
