const express = require("express");
const router = express.Router(); //helps to find routes
const { body, validationResult } = require("express-validator");
const authenticateToken = require("../../middleware/auth");
const Product = require("../../models/Product");
const File = require("../../models/File");
const multer = require("multer");
const { default: mongoose } = require("mongoose");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/");
    // cb(null, '../../public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/uploads", upload.single("file"), async (req, res) => {
  const fileObj = {
    name: req.file.filename,
    path: req.file.path,
  };
  const file = new File(fileObj);
  await file.save();
  res.status(201).json(file);
  // res.json(req.file);
});
//User can create a task
//Use Bearer token of user to create a task under that user
router.post(
  "/",
  [authenticateToken, [body("name", "name is required").notEmpty()]],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (req?.user?.type != "admin") {
        //undefined thakle ? na dile crash kore, tai ? deya, jeno bujhte pare je undefined is psbl
        return res.status(400).json({ message: "You are not an admin" });
      }
      const id = req.user.id;
      const productObj = {
        name: req.body.name,
        desc: req.body.desc ?? "",
        madeIn: req.body.madeIn ?? "",
        price: req.body.price ?? 0,
        fileId: req.body.fileId ?? "",
        expireAt: new Date(),
        userId: id,
      };
      const product = new Product(productObj);
      await product.save();
      if (product?.fileId) {
        const createdProduct = await Product.findById(product._id).populate(
          "fileId"
        );
        res.status(201).json(createdProduct);
      } else {
        res.status(201).json(product);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something is wrong" });
    }
  }
);

// router.get("/", authenticateToken, async (req, res) => {
//   try {
//     const products = await Product.find({});
//     res.json(products);
//   } catch (error) {
//     res.status(404).json({ message: "Product not found" });
//   }
// });

router.get("/", authenticateToken, async (req, res) => {
  try {
    const aggregate = [];
    //for showing specific product details
    aggregate.push({
      $match: {
        _id : new mongoose.Types.ObjectId('64c494896223eca3413a442e') 
      }
    })
    aggregate.push({
      $sort: {
        createdAt: 1 //sorted ascending order
      }
    })
    // aggregate.push({
    //   $group: {_id: "$name",cumulativePrice: { $sum: "$price" }},
    //   $group: {_id: "$name",avgPrice: { $avg: "$price" }},
    // })
    aggregate.push({
      $lookup:  {
        from: "files",
        localField: "fileId",
        foreignField: "_id",
        as: "file",
      }
    })
    aggregate.push({
      $lookup:  {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "productOwner",
      }
    })
    const products = await Product.aggregate(aggregate);
    // const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(404).json({ message: "Product not found" });
  }
});

router.put(
  "/:id",
  authenticateToken, async (req, res) => {
  try {
    if (req?.user?.type != "admin") {
      return res.status(400).json({ message: "You are not an admin" });
    }
    const id = req.params.id;

    const body = req.body;
    const product = await Product.findByIdAndUpdate({_id: id}, body, { new: true });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ _id: id});
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req?.user?.type != "admin") {
      return res.status(400).json({ message: "You are not an admin" });
    }
    const id = req.params.id;
    const userId = req.user.id;
    const product = await Product.findOneAndDelete({_id: id});
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});
module.exports = router;
