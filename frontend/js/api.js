// ------------------ ↓ GLOBAL VARIABLES (ALLOWED TO BE USED IN EVERY FUNCTION ONWARDS) ↓ ------------------
  
const taskForm = document.getElementById("taskForm");
const editTaskform = document.getElementById("editTaskForm");
const url = "http://localhost:3000";

// ----------------------------------------- ↓ GENERAL FUNCTIONS ↓ -----------------------------------------

 function resetForm() {
    taskForm.reset();
  }

// ----------------------------- ↓ GENERAL EVENT LISTENERS (TRIGGERS) ↓ ---------------------------------

const sortButton = document.getElementById("sortSelect");

window.addEventListener("DOMContentLoaded", () => {
    sortButton.value = "default";
});

sortButton.addEventListener("change", () => {
    console.log("Error found")
    displayTasks();
});

  window.addEventListener("DOMContentLoaded", () => {
    displayTasks();  //RUN this at the end of every task function to both reset the form and refresh the task list
  });


// ----------------------------- ↓ EVENT LISTENERS (TRIGGERS) FOR TASKS ↓ ---------------------------------
// To be used for all event listeners for each task action

    const toDoList = document.getElementById("toDoList");
    const completedList = document.getElementById("completedList");

//---To create a task on form
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();  // prevent the data to clear on the time of refresh
    console.log("A");
    createdNewTask();

  } );

  //--------To complete a Task

  toDoList.addEventListener("click", (event) => {
    if (event.target.classList.contains("done")) {

        const taskId = event.target.getAttribute("data-id");        
        completeTask(taskId);
    } 
  });


   //--------To not complete a Task

   completedList.addEventListener("click", (event) => {
     if (event.target.classList.contains("notDone")) {

        const taskId = event.target.getAttribute("data-id");
        taskNotCompleted(taskId);
    } 
   });


//--------Deleting a Task

[toDoList, completedList].forEach(list => {
    list.addEventListener("click", (event) => {
         if (event.target.classList.contains("delete")) {

        const taskId = event.target.getAttribute("data-id");
       deleteTask(taskId);
    } 
    });
});


// Editing the Task
toDoList.addEventListener("click", (event) => {
     if (event.target.classList.contains("edit")) {
        const taskId = event.target.getAttribute("data-id");
        const taskTitle = event.target.getAttribute("data-title");
        const taskDescription = event.target.getAttribute("data-description");
        const taskDueDate = new Date(event.target.getAttribute("data-due-date"));

        const editTaskName = document.getElementById("editTaskName");
        const editTaskDescription = document.getElementById("editTaskDescription");
        const editDueDate = document.getElementById("editDueDate");
        const saveChangesButton = document.getElementById("saveChangesButton");

        editTaskName.value = taskTitle;
        editTaskDescription.value = taskDescription;

// This is to convert the date format back to the ISO 8601 standard so that is able to be read by <input type="date">
        const formattedDueDate = taskDueDate.toISOString().split("T")[0];

        editDueDate.value = formattedDueDate;

        saveChangesButton.addEventListener("click", async () => {

             await editTask(taskId);
             const editTaskModal = bootstrap.Modal.getInstance(document.getElementById("editTaskWindow"));
             editTaskModal.hide();
            
        }, {once: true });

    }
       
});

// --------------------------------------------- ↓ TASK FUNCTIONS ↓ ---------------------------------------------



//-----------------------------------Get Tasks FUNTIONS------------

async function displayTasks() {
       try {

            const sortSelect = document.getElementById("sortSelect");
            const sortBy = sortSelect.value; // date created, due date or default

            let query = "";

            if (sortBy !== "default") {
                query = `?sortBy=${sortBy}`;
                console.log(query);
            }


        const response = await fetch(`${url}/tasks${query}`); //http://localhost:3000/tasks
        const data = await response.json();    

        function formatTask(task) {
            const li = document.createElement("li");
            li.classList.add("p-3", "mt-2", "shadow-sm", "card"); // Dynamically creating a format
            li.innerHTML = task.completed ?
                        //how are we displaying the completed task
            `
            <div class="d-flex justify-content-between align-items-start">
                <h4 class="col-11 text-decoration-line-through opacity-50">${task.title}</h4>
                <button data-id = "${task._id}" type = "button" class="btn-close delete" aria-label="Close"></button>
            </div>
            <p class="text-decoration-line-through opacity-50">${task.description}</p>
            <p class="text-decoration-line-through opacity-50"><strong>Due: </strong>${new Date(task.dueDate).toLocaleDateString()}</p>
            <div class="d-flex justify-content-between align-items-end">
                <div>
                    <button data-id = "${task._id}" type = "button" class="btn btn-dark shadow-sm notDone">Not Done</button>
                </div>
                <p class="mb-0"><strong>Created on: </strong>${new Date(task.createdOn).toLocaleDateString()}</p>
            </div>
            `
            :
             //how are we displaying the tasks not completed 
            `
            <div class="d-flex justify-content-between align-items-start">
                <h4 class="col-l1">${task.title}</h4>
                <button data-id = "${task._id}" type = "button" class="btn-close delete" aria-label="class"></button>
            </div> 
            <p>${task.description}</p>
            <p><strong>Due: </strong>${new Date(task.dueDate).toLocaleDateString()}</p>
            <div class="d-flex justify-content-between align-items-end">
                <div>
                    <button data-id="${task._id}" data-title="${task.title}" data-description="${task.description}" data-due-date="${task.dueDate}" data-bs-toggle="modal" data-bs-target="#editTaskWindow" class="btn btn-dark shadow-sm edit" type="button">Edit</button>
                    <button data-id = "${task._id}" type = "button" class="btn btn-dark shadow-sm done">Done</button>
                </div>
                <p class="mb-lg-0"><strong>Created on: </strong>${new Date(task.createdOn).toLocaleDateString()}</p>
            </div>
            `;
            return li;
        }

            toDoList.innerHTML = "";         //reset the column
            completedList.innerHTML = "";    //reset the column

            const tasks = data;

            tasks.forEach(task => { // task is a parameter that will be used inside the function. As soon as it is parsed  through the function, it holds a value it starts from here
            task.completed ? completedList.appendChild(formatTask(task)) : toDoList.appendChild(formatTask(task))
//          appendChild(formatTask(task)) & (formatTask(task)) After the parameter is created. it    
//          gets put through the function here
        });
        resetForm();
       } catch (error) {
        console.error("Error:", error);
       }     
    }


//------------------------------------Create New Task--------------------
// async 
 async function createdNewTask() {
   try {
        const taskDetails = {   // creating an object
            title: document.getElementById("taskName").value.trim(),
            description: document.getElementById("taskDescription").value.trim(),
            dueDate: document.getElementById("dueDate").value.trim(),
        }

        const response = await fetch(`${url}/tasks/todo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(taskDetails),
        });

        if(!response.ok) {
            throw new Error(`Failed to create tas: ${response.status}`);           
        }
      
        const data = await response.json();
        console.log("New task created", data);
        displayTasks();
    
    } catch (error) {
        console.error("Error:", error);
    
    }
}

  //----------------------------------To complete a task

async function completeTask(taskId) {
    try {
        const response = await fetch (`${url}/tasks/complete/${taskId}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({completed: true})
        });

        if(!response.ok) {
            throw new Error(`Failed to complete Task : ${response.status}`);
        }

        const data = await response.json();  // just grabbing the response and loggin into connsole

        console.log("Task Completed", data);

        displayTasks();
        
    } catch (error) {

        console.error("Error:", error);
    }
   
}


 //--------------------------------To Not Complete a Task

async function taskNotCompleted(taskId){
    try {
        const response = await fetch (`${url}/tasks/notComplete/${taskId}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({completed: false})
        });

         if(!response.ok) {
            throw new Error(`Failed to set the task not complete : ${response.status}`);
        }

        const data = await response.json();  // just grabbing the response and loggin into connsole
        console.log("Task set to Not Complete", data);
        displayTasks();
        
    } catch (error) {

        console.error("Error:", error);
    }
 };


 //----------------------Deleting Task
/*
 async function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(item => item.id == taskId);
    if (taskIndex !== -1) {
        tasks.splice(taskIndex, 1);
    }
    displayTasks();

 }*/


async function deleteTask(taskId) {
   try {
        const response = await fetch(`${url}/tasks/delete/${taskId}`, {
    
             method: 'DELETE',
             headers: {
                "Content-Type": "application/json"
             }
        });

          if(!response.ok) {
            throw new Error(`Failed to deete the task : ${response.status}`);
        }

        const data = await response.json();

        console.log("Task Deleted", data);

        displayTasks();
   
    } catch (error) {
    console.error("Error:", error);
   
   }
}



// Enable Editing of the Task

async function editTask(taskId) {
    const updatedTitle = editTaskName.value;
    const updatedDescription = editTaskDescription.value;
    const updatedDueDate = editDueDate.value;

    const updatedDetails = {
        title: updatedTitle,
        description: updatedDescription,
        dueDate: updatedDueDate
    }

    try {
        const response = await fetch(`${url}/tasks/update/${taskId}`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedDetails)
        });

        if (!response.ok) {
            throw new Error(`Failed to edit task: ${response.status}`);
        }

        const data = await response.json();
        console.log("Edited task:", data);
        displayTasks();
        
    } catch (error) {
        
        console.error("Error:", error);
    }
}