import Role from "./models/Role.js";


export function publicMobile() {
   let model = new Role({
    roleCode: "SUPER_ADMIN",
    roleName: "super admin",
    permissions: ["CREATE_USER", "UPDATE_USER"]
   })
   model.save();
}
