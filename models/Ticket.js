import mongoose from "mongoose";

const Tickets = mongoose.Schema({
    id: {
        type: String,
        required: false,
    },
    alert_id: {
        type: String,
        required: false,
    },
    demisto_id: {
        type: String,
        required: false,
    },
    ticket_name: {
        type: String,
        required: false,
    },
    tenant: {
        type: String,
        required: false,
    },
    severity: {
        type: String,
        required: false,
    },
    create_time: {
        type: Date,
        required: false,
    },
    closed_time: {
        type: Date,
        required: false,
    },
    is_closed: {
        type: Boolean,
        required: false,
    },
    owner_id: {
        type: String,
        required: false,
    },
    details: {
        type: String,
        required: false,
    },
    created_by: {
        type: String,
        required: false,
    },
    parent_demisto_id: {
        type: String,
        required: false,

    },
    ticket_owners: {
        type: Object,
        required: false,
    },
    update_time: {
        type: Date,
        required: false,
    }
})


export default mongoose.model('Tickets', Tickets)
