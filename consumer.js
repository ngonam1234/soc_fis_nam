import { Kafka } from 'kafkajs';
import Chance from 'chance';
import myLogger from './winstonLog/winston.js';
import { json } from 'express';
import AlertPack from './models/AlertPack.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();


const kafka = new Kafka({
    brokers:
        ['10.14.132.113:9092']
})

const consumer = kafka.consumer(
    { groupId: 'consumer-group', rackId: '1' });
const topic = 'helion';

const dbname = process.env.SOC_API_DBNAME;
const host = process.env.SOC_API_HOSTDB;
const port = process.env.SOC_API_PORTDB;
const user = process.env.SOC_API_USERDB;
const pass = process.env.SOC_API_PASSWORDDB;


const dburl = `mongodb://${user}:${pass}@${host}:${port}/${dbname}?serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&authSource=${dbname}&authMechanism=SCRAM-SHA-256`

myLogger.info(dburl)
mongoose.connect(dburl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err) => {
        if (err) {
            myLogger.info("%o", err)
        } else {
            myLogger.info("OK")
        }
    })

const run = async () => {
    await consumer.connect()
    await consumer.subscribe({ topic })
    await consumer.run({
        eachMessage: async ({
            topic, partition, message
        }) => {
            let info = JSON.parse(message.value.toString())
            // if(info.)
            let model = new AlertPack({
                event_type: info.event_type,
                id: info.data.id,
                alert_name: info.data.alert_name,
                tenant: info.data.tenant,
                owner_id: info.data.owner_id,
                is_ticket: info.data.is_ticket,
                create_time: info.data.create_time,
                reviewed_time: info.data.reviewed_time,
                is_closed: info.data.is_closed,
                alert_detail: info.data.alert_detail,
                alert_end_time: info.data.alert_end_time,
                alert_log_source_id: info.data.alert_log_source_id,
                alert_metadata: info.data.alert_metadata,
                alert_num_events: info.data.alert_num_events,
                alert_score: info.data.alert_score,
                alert_start_time: info.data.alert_start_time,
                closing_reason: info.data.closing_reason,
                // data_type: 
            })
            myLogger.info("This is log ===== %o", model)
            await model.save();
            process.exit();
        }
    })
}
run().catch(console.error)