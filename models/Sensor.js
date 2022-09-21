import mongoose from "mongoose";

const Sensor = mongoose.Schema({
    id: {
        type: String,
        required: false,
    },
    tenant: {
        type: String,
        required: false,
    },
    total: {
        type: String,
        required: false,
    },
    online: {
        type: Number,
        required: false,
    },
    offline: {
        type: Number,
        required: false,
    },
    uninstalled: {
        type: Number,
        required: false,
    },
    update_time: {
        type: Date,
        required: false,
    },
    password: {
        type: String,
        required: false,
    }
})


export default mongoose.model('Sensor', Sensor)
