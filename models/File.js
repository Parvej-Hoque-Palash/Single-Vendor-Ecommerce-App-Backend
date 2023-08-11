const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
        }, 
        path: {
            type: String,
        }
    },{
        timestamps: true,
    }
);

module.exports = File = mongoose.model("File", FileSchema);