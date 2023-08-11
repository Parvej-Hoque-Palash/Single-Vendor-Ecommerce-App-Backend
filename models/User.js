const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        fname: {
            type: String
        }, 
        lname: {
            type: String
        }, 
        email: {
            type: String
        },   
        password: {
            type: String
        }, 
        age: {
            type: Number
        },
        type: {
            type: String,
            enum: ['admin','customer'],
            default: 'customer'
        }
    },{
        timestamps: true
    }
);

module.exports = User = mongoose.model("User", userSchema);