import express from 'express';
import { OK, SYSTEM_ERROR } from '../constant/HttpResponseCode.js';
import { login } from '../controllers/users/UsersController.js';
import { refreshToken } from '../token/ValidateToken.js';
const router = express.Router();


router.post('/login', async (req, res, next) => {
    let { email, password } = req.body;
    let response = await login(email, password)
    next(response);
})

router.post('/refreshToken', async (req, res, next) => {
    let { refreshtoken } = req.headers;
    let data = refreshToken(refreshtoken);
    let { status, accessToken } = data
    if (status === true) {
        next({ statusCode: OK, data: { accessToken } });
    } else {
        next({ statusCode: SYSTEM_ERROR, error: 'SYSTEM_ERROR', description: 'system error ne!!!' });
    }
})

export default router;
