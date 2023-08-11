const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        qty: {
            type: Number,
        },
        total: {
            type: Number,
        },
        purchaseDate: {
            type: Date,
        }, 
        expectedDeliveryDate: {
            type: Date,
        },
        location: {
            type: String,
        },
        status: {
            type: String,
            enum: ['delivered', 'in-progress'],
            default: 'in-progress'
        }, 
        
    },{
        timestamps: true,
    }
);

module.exports = Order = mongoose.model("Order", OrderSchema);