import pkg from 'pg';
import { OK, SYSTEM_ERROR } from '../../constant/HttpResponseCode.js';
import myLogger from '../../winstonLog/winston.js';
import Alert from '../../models/Alert.js';
const { Client } = pkg;

const clientPg = new Client({
    host: '10.14.132.113',
    user: 'binhlt51',
    port: 15432,
    password: 'csc@123a',
    database: 'helion_new'
})
clientPg.connect();
// clientPg.query(`Select * from alert limit 5`, (err, res) => {
//     if (!err) {
//         myLogger.info('%o' , res.rows);

//     } else {
//         myLogger.info(err.message);
//     }
//     clientPg.end;
// })

export async function getAllAlert() {
    let sql = `select  * from alert join alertrule a on alert.id = a.alert_id join alerthost a2 on alert.id = a2.alert_id order by create_time desc  limit  50000`;
    let ret = undefined;
    try {
        const result = await clientPg.query(sql);
        let res = result.rows;

        let alerts = [];
        for (let r of res) {
            let { id, alert_name, tenant, owner_id, is_ticket, create_time, reviewed_time,
                is_closed, alert_detail, alert_end_time, alert_log_source_id, alert_metadata
                , alert_num_events, alert_score, alert_start_time, closing_reason, direction_type, data_type, data, alert_id, rule_name } = r;
            alerts.push({
                id, alert_name, tenant, owner_id, is_ticket, create_time, reviewed_time,
                is_closed, alert_detail, alert_end_time, alert_log_source_id, alert_metadata
                , alert_num_events, alert_score, alert_start_time, closing_reason, direction_type, data_type, data, alert_id, rule_name
            })
            let alertModel = new Alert({
                id: id,
                alert_name: alert_name,
                tenant: tenant,
                owner_id: owner_id,
                is_ticket: is_ticket,
                create_time: create_time,
                reviewed_time: reviewed_time,
                is_closed: is_closed,
                alert_detail: alert_detail,
                alert_end_time: alert_end_time,
                alert_log_source_id: alert_log_source_id,
                alert_metadata: alert_metadata,
                alert_num_events: alert_num_events,
                alert_score: alert_score,
                alert_start_time: alert_start_time,
                closing_reason: closing_reason,
                direction_type: direction_type,
                data_type: data_type,
                data: data,
                alert_id: alert_id,
                rule_name: rule_name
            })
            alertModel.save();
        }
        ret = { statusCode: OK, data: alerts };
    } catch (e) {
        // myLogger.info("login e: %o", e);
        ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };

    } finally {

    }
    return ret;
}