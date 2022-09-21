import { OK, SYSTEM_ERROR } from "../../constant/HttpResponseCode.js";
import Alert from "../../models/Alert.js";
import Sensor from "../../models/Sensor.js";
import Tenant from "../../models/Tenant.js";
import Ticket from "../../models/Ticket.js";
import { formatDateFMT, parseDate } from "../../validation/ValidationUtil.js";
import myLogger from "../../winstonLog/winston.js";

// lấy tổng ticket trong 1 tháng
export async function getCountTicket(tenantCodes, start_day, end_day, tenant) {
    let today = new Date();
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    let info = undefined;
    let day = new Date();
    day.setMonth(day.getMonth() - 1)
    // myLogger.info("%o", { start_day, end_day, tenant })
    let query = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },

        { tenant: { $in: tenantCodes } },
        { tenant },
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },
    ];
    info = await Ticket.find({ $and: query }).count();
    return info;
}

export async function getCountAlert(tenantCodes, start_day, end_day, tenant) {
    let today = new Date();
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    let info = undefined;
    let day = new Date();
    day.setMonth(day.getMonth() - 1)
    // myLogger.info("%o", { start_day, end_day, tenant })
    let query = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },

        { tenant: { $in: tenantCodes } },
        { tenant },
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },
    ];
    info = await Alert.find({ $and: query }).count();
    return info;
}
export async function getDashboard(tenantCodes, start_day, end_day, tenant) {
    let sensor = [];
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let topSourceIp = await getCountIP(tenantCodes, start_day, end_day, tenant, 'source', '$data');
    let topDestIp = await getCountIP(tenantCodes, start_day, end_day, tenant, 'destination', '$data');
    let topRules = await getCountRule(tenantCodes, start_day, end_day, tenant);
    let countTicket = await getCountTicket(tenantCodes, start_day, end_day, tenant);
    let countAlert = await getCountTicket(tenantCodes, start_day, end_day, tenant);
    let topSeverity = await getIncident(tenantCodes, start_day, end_day, tenant, '$severity');
    let topIsClosed = await getIncident(tenantCodes, start_day, end_day, tenant, '$is_closed');
    // myLogger.info("CLosed ->>>>>%o", topIsClosed[0])
    // let topClosed = [];
    // if(topIsClosed[0]._id == true){

    // }
    // id()
    // topClosed.push({})
    let Sensor = await getCountSensor(tenantCodes, tenant)
    let getLastTicketTop = await getLastTicketTop10(tenantCodes, start_day, end_day, tenant);
    // myLogger.info("Sensor ->>>>>%o", Sensor)
    // let { online } = await getCountSensor(tenant)
    // let { offline } = await getCountSensor(tenant)
    // let top10Ticket = await getTop10Ticket(start_day, end_day, tenant)
    let last30Days = await getCountLast30Days(tenantCodes, tenant)
    if (Sensor && Sensor.length > 0) {

        sensor.push(
            { "_id": "total", "count": Sensor[0].total },
            { "_id": "online", "count": Sensor[0].online1 },
            { "_id": "offline", "count": Sensor[0].offline1 },
        )
    } else {
        sensor.push(
            { "_id": "total", "count": 0 },
            { "_id": "online", "count": 0 },
            { "_id": "offline", "count": 0 },
        )
    }
    // let topRules2 = await getCountRule2(start_day, end_day, tenant);
    // let topRules = topRules1.concat(topRules2);
    // topRules.sort((a, b) => b.count - a.count);
    ret = { statusCode: OK, data: { topSourceIp, topDestIp, topRules, countTicket, countAlert, incidentSeverity: topSeverity, incidentStatus: topIsClosed, sensor, getLastTicketTop, last30Days } };

    return ret;
}
async function getCountIP(tenantCodes, start_day, end_day, tenant, destination_type, type) {

    let today = new Date();
    // myLogger.info("%o", { start_day, end_day, tenant, destination_type, type });
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    // myLogger.info("%o", { endDate, fromDate });
    let andCondition = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },

        { tenant: { $in: tenantCodes } },
        { tenant },
        { 'direction_type': destination_type }
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },
        { 'direction_type': destination_type }];
    // myLogger.info("%o", andCondition);
    let info = await Alert.aggregate([
        {
            "$match": {
                '$and': andCondition
            }
        },
        {
            "$group": {
                '_id': type,
                'count': { '$sum': 1 },
            }
        },
        {
            "$sort": {
                'count': -1
            }
        },

        { "$limit": 10 }
    ]);
    // myLogger.info('%o', info);

    return info;
}


async function getCountRule(tenantCodes, start_day, end_day, tenant) {
    let today = new Date();
    // myLogger.info("%o", { start_day, end_day, tenant });
    // let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    // myLogger.info("This is date new: %o", { fromDate, endDate });

    let andCondition = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },
        { tenant: { $in: tenantCodes } },
        { tenant },
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        }
    ];
    // myLogger.info("%o", andCondition);
    let info = await Alert.aggregate([
        {
            "$match": {
                '$and': andCondition
            }
        },
        {
            "$group": {
                '_id': "$rule_name",
                'count': { '$sum': 1 },
            }
        },
        {
            "$sort": {
                'count': -1
            }
        },

        { "$limit": 10 }
    ]);
    return info;
}

let tenant =

    [
        {
            id: '$All',
            name: "All"
        },
        {
            id: '4thaiduong',
            name: "sở TTTT Hải Dương"
        },
        {
            id: '4tsoctrang',
            name: "sở TTTT Sóc Trăng"
        },
        {
            id: 'bdi',
            name: "bdi"
        },
        {
            id: 'bsr',
            name: "bsr"
        },
        {
            id: 'bvb',
            name: "Ngân hàng TMCP Bản Việt "
        },
        {
            id: 'csvc',
            name: "China Steel And Nippon Steel Vietnam Joint Stock Company"
        },
        {
            id: 'egp',
            name: "hệ thống đấu thầu điện tử EGP"
        },
        {
            id: 'fis',
            name: "FPT IS"
        },
        {
            id: 'hino',
            name: "hino"
        },
        {
            id: 'molisa',
            name: "Bộ Lao động- Thương binh và Xã hội"
        },
        {
            id: 'snz',
            name: "sonadezi"
        },
        {
            id: 'vietlott',
            name: "Vietlott"
        },
        {
            id: 'vib',
            name: "Ngân hàng Quốc Tế VIB"
        },
        {
            id: 'slhb',
            name: "Ngân hàng LHB"
        },
        {
            id: 'lfvn',
            name: "Lotte Finance Vietnam"
        },
        {
            id: 'bgt',
            name: "Berjaya Gia Thịnh"
        },
        {
            id: 'acb',
            name: "Ngân hàng thương mại cổ phần Á Châu"
        },
        {
            id: 'wcm',
            name: "WINCOMMERCE"
        }
    ]
export async function getAllTenant() {
    let info = await Tenant.find({});
    myLogger.info("%o", info)
    let ret = [];
    for (let t of info) {
        let { code, name } = t;
        ret.push({ id: code.toUpperCase(), name })
    }
    return { statusCode: OK, data: { tenants: ret } };
}


export async function getCountSensor(tenantCodes, tenant) {
    let info = undefined;
    // myLogger.info("%o", { tenant })

    // let query = tenant ?
    //  {
    //     tenant
    // } : {}
    let query = tenant ? [
        { tenant: { $in: tenantCodes } },
        { tenant }
    ] : [{}]
    info = await Sensor.aggregate([
        {
            "$match": {
                $and: query
            }
        },
        {
            "$group": {
                '_id': '',
                'online': { '$sum': '$online' },
                'offline': { '$sum': '$offline' },
            }
        },
        {
            $project: {
                _id: 0,
                'online1': '$online',
                'offline1': '$offline',
                'total': {
                    $add: ['$online', '$offline']
                }
            }
        }
    ]);
    // myLogger.info("getCountSensor: %o", { info })
    // if (tenant == undefined) {
    //     info[0] = 0
    // }
    return info;
    // return info[0];
}

export async function getCountLast30Days(tenantCodes, tenant) {
    let today = new Date();
    let fromDate = new Date(today.setMonth(today.getMonth() - 1));
    let endDate = new Date(today.setMonth(today.getMonth() + 1));
    let andCondition = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },

        { tenant: { $in: tenantCodes } },
        { tenant },
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        }
    ];
    // myLogger.info("This is Log 30 lastt day andCondition ->>>>>>>>>>>>>>. %o%o", andCondition);
    let info = await Ticket.aggregate(
        [
            {
                $match: {
                    $and: andCondition
                }

            },
            {
                $group:
                {
                    _id:
                    {
                        day: { $dayOfMonth: "$create_time" },
                        month: { $month: "$create_time" },
                        year: { $year: "$create_time" }
                    },
                    count: { $sum: 1 },
                    date: { $first: "$create_time" }
                }
            },
            {
                $project:
                {
                    date:
                    {
                        $dateToString: { format: "%Y-%m-%d", date: "$date" }
                    },
                    count: 1,
                    _id: 0
                }
            },
            {
                "$sort": {
                    'date': -1
                }
            },
        ])
    // myLogger.info("This is Log 30 lastt day ->>>>>>>>>>>>>>. %o", info)
    return info;
}

async function getLastTicketTop10(tenantCodes, start_day, end_day, tenant) {
    let today = new Date();
    // myLogger.info("%o", { start_day, end_day, tenant });
    // let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    // myLogger.info("This is date new: %o", { fromDate, endDate });
    // myLogger.info("%o", andCondition);
    // let query = tenant ? {
    //     tenant,
    //     create_time: {
    //         '$gt': fromDate,
    //         '$lt': endDate
    //     }
    // } : {
    //     create_time: {
    //         '$gt': fromDate,
    //         '$lt': endDate
    //     }
    // }

    let query = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },

        { tenant: { $in: tenantCodes } },
        { tenant },
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },
    ];
    let info = await Ticket.find({ $and: query }).limit(10).sort({ create_time: -1 })
    return info;
}

async function getTop10Ticket(start_day, end_day, tenant) {
    let today = new Date();
    // myLogger.info("%o", { start_day, end_day, tenant });
    // let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    // myLogger.info("This is date new: %o", { fromDate, endDate });

    let andCondition = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },
        { tenant },
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        }
    ];
    // myLogger.info("%o", andCondition);
    let info = await Ticket.aggregate([
        {
            "$match": {
                '$and': andCondition
            }
        },
        {
            "$group": {
                '_id': "$ticket_name",
                'count': { '$sum': 1 },
            }
        },
        {
            "$sort": {
                'count': -1
            }
        },

        { "$limit": 10 }
    ]);
    return info;
}

export async function getIncidentTotal(start_day, end_day, tenant) {
    let ret = { statusCode: SYSTEM_ERROR, error: 'ERROR', description: 'First error!' };
    let topSeverity = await getIncident(start_day, end_day, tenant, '$severity');
    let topIsClosed = await getIncident(start_day, end_day, tenant, '$is_closed');
    ret = { statusCode: OK, data: { topSeverity, topIsClosed } };
    return ret;
}

async function getIncident(tenantCodes, start_day, end_day, tenant, type) {
    let today = new Date();
    // myLogger.info("get if incident: %o", { start_day, end_day, tenant, type });
    // let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let fromDate = start_day ? parseDate(start_day, 'yyyy-MM-DD').toDate() : new Date(today.setMonth(today.getMonth() - 1));
    let endDate = end_day ? parseDate(end_day, 'yyyy-MM-DD').toDate() : new Date(today.setDate(today.getDate() + 1));
    // myLogger.info("This is date new: %o", { fromDate, endDate });
    let andCondition = tenant ? [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        },
        { tenant: { $in: tenantCodes } },
        { tenant },
    ] : [
        {
            'create_time': {
                '$gt': fromDate,
                '$lt': endDate
            }
        }
    ];
    let configtype = type == '$is_closed' ? { "$cond": [{ "$eq": ["$is_closed", true] }, 'Open', 'Closed'] } : '$severity'
    // myLogger.info("%o", andCondition);
    let info = await Ticket.aggregate([
        {
            "$match": {
                '$and': andCondition
            }
        },
        {
            "$group": {
                '_id': configtype,
                'count': { '$sum': 1 },
            }
        },
        {
            "$sort": {
                'count': -1
            }
        },
        { "$limit": 10 }
    ]);
    return info;
}

