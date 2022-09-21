import { BAD_REQUEST, OK, SYSTEM_ERROR, Unauthorized } from "../../constant/HttpResponseCode.js";
import User from "../../models/User.js";
import myLogger from "../../winstonLog/winston.js";
import bcrypt from 'bcrypt';
import { v1 as uuidv1, v1 } from 'uuid'
import { genRefreshTokenStaff, genTokenStaff } from "../../token/ValidateToken.js";
import Tenant from "../../models/Tenant.js";


// export async function getAlert(query, limit, sort, page) {
//     let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
//     let query1 = parseStringQuery(query);
//     myLogger.info("%o", query1);
//     let info = await Alert.find(query1).limit(limit).sort(sort);
//     ret = { statusCode: OK, data: { info } };
//     return ret;
// }

export async function getAllUser(tenantCodes, query, limit, sort, page) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let query1 = parseStringQuery(query);
    myLogger.info("%o", query1);
    
    query1 = {...query1, tenant:{$in:tenantCodes}};
    let info = await User.find(query1).limit(limit).sort(sort);
    ret = { statusCode: OK, data: { info } };
    return ret;

}


export async function queryAdvanced(queryObj) {
    myLogger.info("In ->>>>>>")
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    try {
        queryObj = { ...queryObj }
        const excludedFields = ['page', 'sort', 'limit', 'fields']
        excludedFields.forEach(el => delete queryObj[el])

        let queryString = JSON.stringify(queryObj)
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        let query = Alert.find(JSON.parse(queryString))


        if (sort) {
            const sortBy = query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-create_time')
        }

        const tours = await query
        ret = { statusCode: OK, data: tours };
        myLogger.info("OUT ->>>>>>")

    } catch (error) {
        ret = { statusCode: BAD_REQUEST, data: 'Bad request' };
    }
    return ret;
}

function parseStringQuery(query) {
    let ret = Object.create(null);
    //url =    path?query=name%like%Binh,Hung;status%eq%Closed
    // req.query = name%eq%Binh;status%eq%Closed
    if (query) {
        let qs = query.split(';'); // 
        for (let q of qs) { // q = name%eq%Binh
            let objs = q.split('%'); //[name,eq,Binh]
            if (objs.length === 3) {
                if (objs[1] === 'eq') {
                    ret[objs[0]] = objs[2];
                } else if (objs[1] === 'like') {
                    let objs1 = objs[2].split(',')
                    let m = objs1[0];
                    for (let i = 1; i < objs1.length; i++) {
                        m += `.*${objs1[i]}`;
                    }
                    // let t = {$or : m};
                    let temp = { $regex: m };

                    ret[objs[0]] = temp;
                } else if (objs[1] === 'neq') {
                    let temp = { $ne: objs[2] };
                    ret[objs[0]] = temp;
                }
            }
        }
    }
    return ret;
}


export async function createUser(email, fullname, is_active, password, phone, role, telegram, tier, tenant) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };

    let model = new User({
        id: v1(),
        fullname: fullname,
        email: email,
        password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
        is_active: is_active,
        role: role,
        tier: tier,
        create_time: new Date(),
        phone: phone,
        telegram: telegram,
        tenant: tenant
    })
    model.save();

    myLogger.info("%o", model)
    ret = { statusCode: OK, data: { model } };
    return ret;

}

export async function update(filter, body) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = await User.findOneAndUpdate(
        filter, body, { new: true }
    )
    myLogger.info("%o", model)
    ret = { statusCode: OK, data: model };
    return ret;
}


export async function resetFirstLogin2FA(id) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = await User.findOneAndUpdate(
        { id }, { firstLogin2FA: null }, { new: true }
    )

    myLogger.info("%o", model)
    ret = { statusCode: OK, data: model };
    return ret;
}

export async function changePassword(id, oldPass, newPass) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = await User.findOne(
        { id }
    )
    myLogger.info("%o", { model, oldPass, newPass, id })
    let { password } = model;
    let verify = bcrypt.compareSync(oldPass, password);

    if (verify == true) {
        await update({ id }, { password: await bcrypt.hash(newPass, await bcrypt.genSalt(10)) })
        ret = { statusCode: OK, data: { status: 'Success' } };
    } else {
        ret = { statusCode: BAD_REQUEST, data: { status: 'Faild: Password not match' } };

    }
    return ret;
}

export async function login(emailtxt, passwordtxt) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let model = await User.findOne(
        { email: emailtxt }
    )
    if (model) {

    let { password, roleCode, tenant, permissions, fullname, username, email } = model;
    myLogger.info("%o", { email, password, roleCode, tenant, permissions, fullname, username, email })


        let verify = bcrypt.compareSync(passwordtxt, password);
        if (verify) {
            let tenantModel = await Tenant.find(tenant === '$ALL' ? { is_active: false } : { code: tenant, is_active: false });
            let tenants = [];
            for (let tM of tenantModel) {
                let { code, name } = tM;
                tenants.push({ id: code, name });
            }
            myLogger.info("%o", tenants)
            let accessToken = genTokenStaff({ roleCode, tenants, permissions, fullname, email });
            let refreshToken = genRefreshTokenStaff({ roleCode, tenants, permissions, fullname, email });
            ret = { statusCode: OK, data: { status: 'Login Success', accessToken, refreshToken, role: roleCode, tenants, permissions, name: fullname, email } };
        } else {
            ret = { statusCode: BAD_REQUEST, data: { status: 'Faild: Password or email not match' } };
        }
    }
    else {
        ret = { statusCode: Unauthorized, data: { status: 'Login Failed' } };

    }
    return ret;
}