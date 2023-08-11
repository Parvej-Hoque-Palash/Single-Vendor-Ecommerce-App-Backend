const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        }, 
        desc: {
            type: String,
        },
        madeIn: {
            type: String,
        },
        price: {
            type: Number,
        },
        expireAt: {
            type: Date,
        },
        fileId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File'
        }, 
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },{
        timestamps: true,
    }
);

module.exports = Product = mongoose.model("Product", ProductSchema);