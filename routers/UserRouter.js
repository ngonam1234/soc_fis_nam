import express from 'express';
import { OK, SYSTEM_ERROR } from '../constant/HttpResponseCode.js';
import { changePassword, createUser, getAllUser, login, resetFirstLogin2FA, update } from '../controllers/users/UsersController.js';
import { refreshToken, validateTokenStaffAccess } from '../token/ValidateToken.js';
import myLogger from '../winstonLog/winston.js';

const router = express.Router();



router.get('/getAllUser', async (req, res, next) => {
    let { query, limit, sort, page } = req.query;
    let { tenantCodes } = req;
    myLogger.info("tenantCodes: %o", tenantCodes)
    let response = await getAllUser(tenantCodes, query, limit, sort, page);
    next(response);
})

router.post('/createUser', async (req, res, next) => {
    let { email, fullname, is_active, password, phone, role, telegram, tier, tenant } = req.body;
    let response = await createUser(email, fullname, is_active, password, phone, role, telegram, tier, tenant);
    next(response);
})

router.put('/:id/password', async (req, res, next) => {
    let { oldPass, newPass } = req.body;
    let response = undefined;
    let { id } = req.params;
    response = await changePassword(id, oldPass, newPass)
    next(response);

})
router.put('/:id/', async (req, res, next) => {
    myLogger.info("in ---------------")
    let { is_active, fullname, email, twoFA, roleCode, permissions } = req.body;
    let response = undefined;
    let { id } = req.params;
    if (is_active !== undefined) {
        response = await update({ id }, { is_active });
    } else if (fullname !== undefined) {
        response = await update({ id }, { fullname });
    } else if (email !== undefined) {
        response = await update({ id }, { email });
    } else if (twoFA !== undefined) {
        response = await update({ id }, { twoFA })
    } else if (roleCode !== undefined) {
        response = await update({ id }, { roleCode })
    }
    else if (permissions !== undefined) {
        response = await update({ id }, { permissions })
    }
    else {
        response = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    }
    next(response);
})

router.put('/:id/resetFirstLogin2FA', async (req, res, next) => {
    let { id } = req.params;
    let response = await resetFirstLogin2FA(id)
    next(response);
})






export default router;
