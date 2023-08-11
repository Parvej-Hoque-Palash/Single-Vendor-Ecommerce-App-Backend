const express = require("express");
const router = express.Router() //helps to find routes
const {body, validationResult} = require('express-validator');
const authenticateToken = require('../../middleware/auth');
const Task = require('../../models/Task');

//User can create a task
//Use Bearer token of user to create a task under that user
router.post(
    '/',
    [authenticateToken,[body('title', 'title is required').notEmpty()]],
    async (req, res) => {
        try {
          const errors = validationResult(req)
          if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
          } 

          const id = req.user.id; 
          const taskObj = {
            title: req.body.title,
            desc: req.body.desc ?? "",
            userId: id,
            //status: 'to-do'
          }
          const task = new Task(taskObj)
          await task.save();
          res.status(201).json(task);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Something is wrong" });
        }
      }
);

//User can see all his created task
//Use Bearer token of user find all the tasks created by that user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const id = req.user.id;
    const tasks = await Task.find({userId: id});
    res.json(tasks);
  } catch (error) {
    res.status(404).json({ message: "Task not found" });
  }
});

//User can change his task staus
//Use both Bearer token of user and task id to edit a task staus
router.put(
  "/status/:id",
  [authenticateToken,[
    body('status','Status is required').notEmpty(),
    body('status','Status is invalid').isIn(['to-do','in-progress','done'])
  ]],
  async (req, res) => {
  try {
    const errors = validationResult(req)
      if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
      } 
    
    const id = req.params.id;
    const userId = req.user.id;

    const status = req.body.status;
    const task = await Task.findOneAndUpdate({_id: id, userId: userId}, {status: status}, { new: true });
    if (task) {
      res.json(task);
      //task.save();
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});

//User can edit his created task
//Use both Bearer token of user and task id to edit a task
router.put(
  "/:id",
  [authenticateToken,[
    body('status','Status is invalid').isIn([
      'to-do',
      'in-progress',
      'done'
    ]),
  ],
], async (req, res) => {
  try {
    const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
      }

    const id = req.params.id;
    const userId = req.user.id;

    const body = req.body;
    const task = await Task.findOneAndUpdate({_id: id, userId: userId}, body, { new: true });
    if (task) {
      res.json(task);
      //task.save();
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});

//User can see one of his created task, another user can not see my tasks
//Use both Bearer token of user and task id to find a task
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const task = await Task.findOne({ _id: id, userId: userId});
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: "Task not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something is wrong" });
  }
});
  
  
//User can delete one of his created task
  router.delete("/:id", authenticateToken, async (req, res) => {
    try {
      const id = req.params.id;
      const userId = req.user.id;
      const task = await Task.findOneAndDelete({_id: id, userId: userId});
      if (task) {
        res.json(task);
      } else {
        res.status(404).json({ message: "Task not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Something is wrong" });
    }
  });

module.exports = router;

