//-----------------------------↓ Setting up Dependencies ↓ ---------------------------


const express = require('express');      //Enables use of express.js framework / express is like bootstrap in HTML
const cors = require('cors');            //Enables Cross Origin Resources Sharing  (npm install cors)
const mongoose = require('mongoose');    // Enable Mongoose Database
require("dotenv").config();              // Enables use of .env file

//-----------------------------↓ Initial App configuration ↓ ----------------------------

const port = process.env.PORT || 3000;   //  
const app = express();  // Using Express.Js FRAMEWORK to power the app 



                                      //npm install express in the terminal

                          //-----------------------------↓ Middleware Setup ↓ ----------------------------            

app.use(express.json());  //Uses express in JSON format
app.use(cors('*'));   // Enables use of CORS - * means every domain is now allowed acces to this server to send and receive data - not secure - * is for development only = msgs from frontend to backend and vise versa.


 console.log("This is msg");



 //-----------------------------↓ Database connection + APP Startup ↓ ----------------------------       


 (async  ()=> {                   // Automatic envoked function  -- creating and running at the same time
    try {
        mongoose.set("autoIndex", false);

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connnected to MongoDB");

        await Task.syncIndexes();
        console.log(" Indexes created");;
        
        app.listen(port, () => {
        console.log(`😁 To Do App listening on port ${port}`);
        });

    } catch (error) {
        console.error(" Startup error", error);
        process.exit(1);
    }

 }) ();  // () calling this funcation right after creating it


// Define the task schema

const taskSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String, required:true},
    dueDate: {type: Date, required: true},
    createdOn: {type: Date, required: true, default: Date.now},
    completed: {type: Boolean, required: true, default: false}

});

 

taskSchema.index({ dueDate: 1 });
taskSchema.index({ dateCreated: 1 });




//From the Schema - we will create a dtabase model

const Task = mongoose.model("Task", taskSchema);




// ---------------------------------- ↓ API ROUTES (Example) ↓ --------------------------------------

// GET, POST, PUT, PATCH, DELETE
/*
app.get('/get/example', async (req, res) = > {
    res.send("Hello ! I am a mesage from the Backend");
});
*/

 

// ---------------------------------------------------- TASK ROUTES ----------------------------------------------------

/*
let taskId = 1;
const tasks = [
        { id: taskId++, completed: true, title: "Wash car", description: "My car dirty and needs detail wash", dueDate: "10/05/2025", createdOn: "05/05/2025"},
        { id: taskId++, completed: true, title: "Mow the lawn", description: "grass is overgrown need to mow it", dueDate: "12/05/2025", createdOn: "05/05/2025"},
        { id: taskId++, completed: false, title: "DOnt Wash car", description: "My car dirty and leave as it is", dueDate: "15/05/2025", createdOn: "01/05/2025"},
        { id: taskId++, completed: false, title: "Groecery", description: "Weekly groecery needs to be done", dueDate: "13/05/2025", createdOn: "02/05/2025"}
   ]
*/

// get all the Tasks

app.get('/tasks', async (req, res) => {
  
    try {
        const { sortBy } = req.query; // ?sortBy = dueDate or ?sortBy = dateCreated

        let sortOption = {};

        if (sortBy === "dueDate") {
            sortOption = { dueDate: 1 }  // Ascending
        } else if (sortBy === "dateCreated") {
            sortOption = { dateCreated: 1 };
        }

        const tasks = await Task.find({}).sort(sortOption);
         res.json(tasks);
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ message: "Error grabbing task"});
    }
});


//Create a new task and add it to the array
app.post('/tasks/todo', async (req, res) => {
try { 
    const {title, description, dueDate} = req.body;  //grabbing information

    const taskData = {title, description, dueDate};
    const createTask = new Task(taskData);
    const newTask = await createTask.save();

    res.json(newTask)
    
} catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Error creating a task! "});
}
});


// ----------To complete the Task and move the column

app.patch('/tasks/complete/:id', async (req, res) => {
    try {
        const { completed } = req.body;
        const taskId = req.params.id;

        const completedTask = await Task.findByIdAndUpdate(taskId, {completed}, {new: true});

        if (!completedTask) {
            return res.status(404).json({message: " Task Not Found"});
        }

        res.json ({task: completedTask, message: "Task Set to complete" });    
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({Errormsg: "Error setting task to complete "});
    }
});



// ----------To make the task not complete  and move the column

app.patch('/tasks/notComplete/:id', async (req, res) => {
    try {
        const { completed } = req.body;
        const taskId = req.params.id;

        const taskNotComplete = await Task.findByIdAndUpdate(taskId, {completed}, {new: true});

        if (!taskNotComplete) {
            return res.status(404).json({message: " Task Not Found"});
        }
       
        res.json ({task: taskNotComplete, message: "Task Set to NOT complete" });    

        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({Errormsg: "Error setting task to NOT complete "});
    }
});



// To delete the task

app.delete(`/tasks/delete/:id`, async (req, res) => {
    try {
        const taskId = req.params.id;
        const deletedTask = await Task.findByIdAndDelete(taskId);

        if(!deletedTask) {
            return res.status(404).json({ message: "Task not found!"});
        }
       
        res.json({ task: deletedTask, message: "Task Deleted successfully !"});
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({Errormsg: "Error Deleting the Task"});
    }
});




// To edit the task

app.put('/tasks/update/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const {title, description, dueDate} = req.body;

        const taskData =  {title, description, dueDate};
        const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, {new: true});

        if (!updatedTask) {
            return res.status(404).json({message: "Task not found"});
        }

        res.json({ task: updatedTask, message: "Task updated Successfully"});
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({Errormsg: "Error Updating the Task"});
    }
})















































             