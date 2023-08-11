const express = require("express");
const router = express.Router()
const {body, validationResult} = require('express-validator');
const authenticateToken = require('../../middleware/auth');
const Order = require('../../models/Order');
const Product = require("../../models/Product");

router.post(
    '/',
    [authenticateToken,[body('productId', 'productId is required').notEmpty()]],
    async (req, res) => {
        try {
          const errors = validationResult(req)
          if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
          } 

          const id = req.user.id;
          const pId = req?.body?.productId

          const product = await Product.findById(pId)
          if(!product){
            return res.status(400).json({message: "Order not found!"})
          }
          const orderObj = {
            userId: id,
            productId: product._id,
            purchaseDate: new Date(),
            qty: req.body.qty ?? 1,
            status: 'in-progress',
            location: req.body.location ?? ""
          };

          orderObj.total = product.price * orderObj.qty

          const order = new Order(orderObj)
          await order.save();
          res.status(201).json(order);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Something is wrong" });
        }
      }
);


// router.get('/', authenticateToken, async (req, res) => {
//   try {
//     const id = req.user.id;
//     const orders = await Order.find({userId: id});
//     res.json(orders);
//   } catch (error) {
//     res.status(404).json({ message: "Order not found" });
//   }
// });

router.get("/", authenticateToken, async (req, res) => {
  try {
    const aggregate = [];
    //for showing specific product details
    // aggregate.push({
    //   $match: {
    //     _id : new mongoose.Types.ObjectId('64c494896223eca3413a442e') 
    //   }
    // })

    aggregate.push({
      $lookup:  {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "Customer",
      }
    })
    const orders = await Order.aggregate(aggregate);
    // const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    res.status(404).json({ message: "Order not found" });
  }
});

router.put(
  "/status/:id",
  [authenticateToken,[
    body('status','Status is required').notEmpty(),
    body('status','Status is invalid').isIn(['delivered','in-progress'])
  ]],
  async (req, res) => {
  try {
    const errors = validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
      } 
    
    const id = req.params.id;

    const status = req.body.status;
    const order = await Order.findOneAndUpdate({_id: id}, {status: status}, { new: true });
    if (order) {
      res.json(order);
      //task.save();
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});


router.put(
  "/:id",
  [authenticateToken,[
    body('status','Status is invalid').isIn([
      'delivered',
      'in-progress',
    ]),
  ],
], async (req, res) => {
  try {
    const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
      }

    const id = req.params.id;

    const body = req.body;
    const order = await Order.findOneAndUpdate({_id: id}, body, { new: true });
    if (order) {
      res.json(order);
      //order.save();
    } else {
      res.status(404).json({ message: "order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});


router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;

    const order = await Order.findOne({ _id: id});
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});
  
  
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;

      const order = await Order.findOneAndDelete({_id: id});
      if (order) {
        res.json(order);
      } else {
        res.status(404).json({ message: "order not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something is wrong" });
    }
  });

module.exports = router;

