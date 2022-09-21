import mongoose from "mongoose";

const Role = mongoose.Schema({
    roleCode: {
        type: String,
        require: true
    },
    roleName: {
        type: String,
        require: true,
    },
    permissions: [
        {
            type: String,
        }
    ]
})


export default mongoose.model('Role', Role)
