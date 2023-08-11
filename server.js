require("dotenv").config();
const express = require("express");
const app = express();
// const cors = require('cors');
const multer = require("multer");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");

app.use(bodyParser.json());

//Configuration for Multer
//const upload = multer({ dest: "./public/uploads/" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({ storage: storage })

// app.use(cors({
//     origin: 'http://localhost:5173/',
//   }));

connectDB()

//routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/tasks', require('./routes/api/tasks'));
app.use('/api/products', require('./routes/api/products'));
app.use('/api/orders', require('./routes/api/orders'));

//API to check connection
app.get("/", (req, res) => {
  res.json({ message: "Welcome to our app" });
});

app.post("/uploads", upload.single("file"), (req, res) => {
  res.json(req.file);
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

