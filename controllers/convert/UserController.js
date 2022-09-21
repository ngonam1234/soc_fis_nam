import pkg from 'pg';
import { OK, SYSTEM_ERROR } from '../../constant/HttpResponseCode.js';
import myLogger from '../../winstonLog/winston.js';
import User from '../../models/User.js';
const { Client } = pkg;

const clientPg = new Client({
    host: '10.14.132.113',
    user: 'binhlt51',
    port: 15432,
    password: 'csc@123a',
    database: 'helion_new'
})
clientPg.connect();

export async function getAllUser() {
    let sql = `select * from "user" order by  create_time desc `;
    let ret = undefined;
    try {
        const result = await clientPg.query(sql);
        let res = result.rows;

        let users = [];
        for (let r of res) {
            let { id, fullname, email, password, is_active, role, tier, create_time, mattermost_id, phone, telegram } = r;
            users.push({
                id, fullname, email, password, is_active, role, tier, create_time, mattermost_id, phone, telegram
            })
            let userModel = new User({
                id: id,
                fullname: fullname,
                email: email,
                password: password,
                is_active: is_active,
                role: role,
                tier: tier,
                create_time: create_time,
                mattermost_id: mattermost_id,
                phone: phone,
                telegram: telegram
            })
            userModel.save();
        }
        ret = { statusCode: OK, data: users };
    } catch (e) {
        // myLogger.info("login e: %o", e);
        ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };

    } finally {

    }
    return ret;
}


