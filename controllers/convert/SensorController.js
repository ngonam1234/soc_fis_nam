import pkg from 'pg';
import { OK, SYSTEM_ERROR } from '../../constant/HttpResponseCode.js';
import Sensor from '../../models/Sensor.js';
import myLogger from '../../winstonLog/winston.js';
const { Client } = pkg;

const clientPg = new Client({
    host: '10.14.132.113',
    user: 'binhlt51',
    port: 15432,
    password: 'csc@123a',
    database: 'helion_new'
})
clientPg.connect();


export async function getAllSensor() {
    let sql = `select * from sensor`;
    let ret = undefined;
    try {
        const result = await clientPg.query(sql);
        let res = result.rows;

        let sensors = [];
        for (let r of res) {
            let { id, tenant, total, online, offline, uninstalled, update_time,
                password } = r;
            sensors.push({
                id, tenant, total, online, offline, uninstalled, update_time,
                password
            })
            let sensorModel = new Sensor({
                id: id,
                tenant: tenant,
                total: total,
                online: online,
                offline: offline,
                uninstalled: uninstalled,
                update_time: update_time,
                password: password
            })
            sensorModel.save();
        }
        ret = { statusCode: OK, data: sensors };
    } catch (e) {
        myLogger.info("login e: %o", e);
        ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };

    } finally {

    }
    return ret;
}