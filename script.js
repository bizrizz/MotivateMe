let selectedTasks = [];

// Function to add tasks
async function addTask() {
    const taskInput = document.getElementById("task-input").value.trim();

    if (taskInput === "") {
        alert("Please enter a task.");
        return; // Exit function if task is empty
    }

    // Add task to the array (category is assumed as simple placeholder)
    selectedTasks.push({ name: taskInput, score: 3, completion: 0 });

    // Clear input field
    document.getElementById("task-input").value = "";

    // Change button text after first task is added
    document.getElementById("submit-task-btn").innerText = "Add Another Task";

    // Show the "Next" button after the first task
    document.getElementById("next-btn").style.display = "block";

    // Re-render the task list to show sliders and inputs
    renderTaskList();
}

// Function to render the task list with sliders and completion inputs
function renderTaskList() {
    const taskListDiv = document.getElementById("task-list");
    taskListDiv.innerHTML = ""; // Clear previous task list

    selectedTasks.forEach((task, index) => {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");

        // Task Name
        const taskName = document.createElement("p");
        taskName.innerText = `${task.name}`;

        // Slider for task importance (1-5)
        const taskScoreSlider = document.createElement("input");
        taskScoreSlider.type = "range";
        taskScoreSlider.min = "1";
        taskScoreSlider.max = "5";
        taskScoreSlider.value = task.score;
        taskScoreSlider.oninput = function () {
            selectedTasks[index].score = taskScoreSlider.value;
        };

        // Input for task completion percentage
        const taskCompletionInput = document.createElement("input");
        taskCompletionInput.type = "number";
        taskCompletionInput.min = "0";
        taskCompletionInput.max = "100";
        taskCompletionInput.value = task.completion;
        taskCompletionInput.onchange = function () {
            selectedTasks[index].completion = taskCompletionInput.value;
        };

        // Append elements to the task item
        taskItem.appendChild(taskName);
        taskItem.appendChild(taskScoreSlider);
        taskItem.appendChild(document.createTextNode(" Importance: " + taskScoreSlider.value + "/5"));
        taskItem.appendChild(document.createElement("br"));
        taskItem.appendChild(document.createTextNode("Completion: "));
        taskItem.appendChild(taskCompletionInput);
        taskItem.appendChild(document.createTextNode("%"));

        // Append task item to the task list div
        taskListDiv.appendChild(taskItem);
    });
}

// Function to move to the next set of questions (roadblocks and positive events)
function nextQuestion() {
    // Hide the task input section and show roadblock/positive event section
    document.getElementById("question-box").style.display = "none";
    document.getElementById("extra-questions").style.display = "block";
    document.getElementById("final-next-btn").style.display = "block";
    document.getElementById("next-btn").style.display = "none";
}

// Function to submit roadblocks and positive events, then calculate motivation score
async function submitExtraQuestions() {
    // Get roadblocks and positive events inputs
    const roadblocksInput = document.getElementById("roadblocks-input").value.toLowerCase();
    const positiveEventsInput = document.getElementById("positive-events-input").value.toLowerCase();

    // For simplicity, categorize adversity and positive events as fixed
    let adversityFactor = roadblocksInput ? 1.2 : 1.0; // Example: if there's a roadblock, factor increases
    let positiveEventBoost = positiveEventsInput ? 1.1 : 1.0; // Example: positive events give a boost

    document.getElementById("extra-questions").style.display = "none";
    document.getElementById("final-next-btn").style.display = "none";
    document.getElementById("result").style.display = "block";

    // Calculate motivation score
    calculateMotivationScore(adversityFactor, positiveEventBoost);
}

// Function to calculate the motivation score based on inputs
function calculateMotivationScore(adversityFactor, positiveEventBoost) {
    // Calculate total completion and average score
    let totalCompletion = selectedTasks.reduce((total, task) => total + parseInt(task.completion), 0) / selectedTasks.length;
    let averageScore = selectedTasks.reduce((total, task) => total + parseInt(task.score), 0) / selectedTasks.length;

    // Motivation score formula
    let motivationScore = (totalCompletion * adversityFactor * positiveEventBoost * averageScore) / 100;
    if (motivationScore > 100) motivationScore = 100; // Cap at 100%

    document.getElementById('motivation-score').innerText = `Your Motivation Score: ${Math.round(motivationScore)}%`;

    // Generate personalized motivational message
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks);
}

// Function to generate a motivational message based on the score
function generateMotivationalMessage(score, tasks) {
    let taskDetails = tasks.map(task => `${task.name}: ${task.completion}% completed`).join(', ');
    let message = `Great job! You completed ${taskDetails}. Based on your effort today, your motivation score is ${score}%. Keep up the good work!`;
    
    document.getElementById('motivation-message').innerText = message;
}
