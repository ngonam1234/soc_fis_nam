import pkg from 'pg';
import { OK, SYSTEM_ERROR } from '../../constant/HttpResponseCode.js';
import Ticket from '../../models/Ticket.js';
const { Client } = pkg;

const clientPg = new Client({
    host: '10.14.132.113',
    user: 'binhlt51',
    port: 15432,
    password: 'csc@123a',
    database: 'helion_new'
})
clientPg.connect();

export async function getAllTicket() {
    let sql = `select * from ticket order by  create_time desc`;
    let ret = undefined;
    try {
        const result = await clientPg.query(sql);
        let res = result.rows;

        let tickets = [];
        for (let r of res) {
            let { id, alert_id, demisto_id, ticket_name, tenant, severity, create_time,
                closed_time, is_closed, owner_id, details, created_by
                , parant_demisto_id, ticket_owners, update_time } = r;
            tickets.push({
                id, alert_id, demisto_id, ticket_name, tenant, severity, create_time,
                closed_time, is_closed, owner_id, details, created_by
                , parant_demisto_id, ticket_owners, update_time
            })
            let ticketModel = new Ticket({
                id: id,
                alert_id: alert_id,
                demisto_id: demisto_id,
                ticket_name: ticket_name,
                tenant: tenant,
                severity: severity,
                create_time: create_time,
                closed_time: closed_time,
                is_closed: is_closed,
                owner_id: owner_id,
                details: details,
                created_by: created_by,
                parant_demisto_id: parant_demisto_id,
                ticket_owners: ticket_owners,
                update_time: update_time
            })
            ticketModel.save();
        }
        ret = { statusCode: OK, data: tickets };
    } catch (e) {
        // myLogger.info("login e: %o", e);
        ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'System busy!' };

    } finally {

    }
    return ret;
}