import mongoose from "mongoose";

const AlertPack = mongoose.Schema({
    event_type: {
        type: String,
        required: false,
    },
    id: {
        type: String,
        required: false,
    },
    alert_name: {
        type: String,
        required: false,
    },
    tenant: {
        type: String,
        required: false,
    },
    owner_id: {
        type: String,
        required: false,
    },
    is_ticket: {
        type: Boolean,
        required: false,
    },
    create_time: {
        type: Date,
        required: false,
    },
    reviewed_time: {
        type: Date,
        required: false,
    },
    is_closed: {
        type: Boolean,
        required: false,
    },
    alert_detail: {
        type: Object,
        required: false,
    },
    alert_end_time: {
        type: Date,
        required: false,
    },
    alert_log_source_id: {
        type: Number,
        required: false,
    },
    alert_metadata: {
        type: Object,
        required: false,

    },
    alert_num_events: {
        type: Number,
        required: false,
    },
    alert_score: {
        type: String,
        required: false,
    },
    alert_start_time: {
        type: Date,
        required: false,
    },
    closing_reason: {
        type: String,
        required: false,
    }
})


export default mongoose.model('AlertPack', AlertPack)
