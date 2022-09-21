import mongoose from "mongoose";

const Tenant = mongoose.Schema({
    code: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: false,
    },
    create_time: {
        type: Date,
        required: false,
    },
    update_time: {
        type: Date,
        required: false,
    },
    is_active: {
        type: Boolean,
        required: false,
    },
    created_by: {
        type: String,
        required: false,
    },

    created_by_update: {
        type: String,
        required: false,
    },
})


export default mongoose.model('Tenant', Tenant)
