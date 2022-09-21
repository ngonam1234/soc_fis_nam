import mongoose from "mongoose";

const User = mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    fullname: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: false,
    },
    is_active: {
        type: Boolean,
        required: false,
    },
    role: {
        type: Number,
        required: false,
    },
    tier: {
        type: Number,
        required: false,
    },
    create_time: {
        type: Date,
        required: false,
    },
    mattermost_id: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    telegram: {
        type: String,
        required: false,
    },
    tenant: {
        type: String,
        required: true,
    },
    twoFA:{
        type: Boolean,
        required: false,
        default: true
    },
    firstLogin2FA:{
        type: Date,
        required: false,
        default: null
    },
    roleCode:{
        type: String,
        required: false,
        default: 'ALERT_OBSERVER'
    },

    permissions: [
        {
            type: String,
        }
    ]
    
})


export default mongoose.model('User', User)
