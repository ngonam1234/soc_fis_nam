import { OK, SYSTEM_ERROR } from "../../constant/HttpResponseCode.js";
import Tenant from "../../models/Tenant.js";
import myLogger from "../../winstonLog/winston.js";

// export async function getAllTenant() {
//     const url = 'http://api.security.fis.vn/apiDash/getAllTenant'
//     let ret = await fetch(url, {
//         method: 'GET',
//     }).then(res => res.json());
//     let { tenants } = ret;
//     for (const l of tenants) {
//         let model = new Tenant({
//             code: l.id,
//             name: l.name,
//             is_active: false
//         })
//         model.save();
//     }
//     myLogger.info('%o', ret);
//     return { statusCode: OK, data: { tenants } };
// }


export async function createTanent(code, name, created_by) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = new Tenant({
        code: code,
        name: name,
        create_time: new Date(),
        is_active: false,
        created_by: created_by
    })
    model.save();

    myLogger.info("%o", model)
    ret = { statusCode: OK, data: { model } };
    return ret;

}


export async function updateActive(filter, body) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    myLogger.info('This is Log Filter ->>>>>>>>>%o', { filter, body })
    let info = await Tenant.findOneAndUpdate(
        filter, body, { new: true }
    )

    myLogger.info("%o", info)
    ret = { statusCode: OK, data: { info } };
    return ret;

}



export async function getDetailTenant(_id) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let info = await Tenant.findOne(
        { _id }
    )
    let details = [];
    let { name, code, is_active } = info
    details.push({ name, code, is_active })
    myLogger.info("%o", info)
    ret = { statusCode: OK, data: details[0] };
    return ret;

}

const template1 = {
    code:'Template1',
    content: "This is param1 = {{param1}}....",
    params:[
        "params1"
    ]
}

