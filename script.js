let selectedTasks = [];
let predictedEnergy = 100; // Starting predicted energy for the day

// Function to add tasks
function addTask() {
    const taskInput = document.getElementById("task-input").value.trim();
    if (taskInput === "") {
        alert("Please enter a task.");
        return;
    }

    // Add task to the array with default importance and completion values
    selectedTasks.push({ name: taskInput, score: 3, completion: 0 });

    // Clear the input field
    document.getElementById("task-input").value = "";

    // Show the "Next" button after the first task
    document.getElementById("next-btn").style.display = "block";

    // Re-render the task list to show sliders and inputs
    renderTaskList();
}

// Function to render task list with sliders and inputs for importance and completion
function renderTaskList() {
    const taskListDiv = document.getElementById("task-list");
    taskListDiv.innerHTML = ""; // Clear previous tasks

    selectedTasks.forEach((task, index) => {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");

        // Task name
        const taskName = document.createElement("p");
        taskName.innerText = task.name;

        // Slider for task importance (1-5)
        const taskScoreSlider = document.createElement("input");
        taskScoreSlider.type = "range";
        taskScoreSlider.min = "1";
        taskScoreSlider.max = "5";
        taskScoreSlider.value = task.score; // Use the correct score value
        taskScoreSlider.oninput = function () {
            selectedTasks[index].score = taskScoreSlider.value; // Update the score dynamically
            taskName.innerText = `${task.name} (Importance: ${taskScoreSlider.value}/5)`; // Show updated score
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

        // Append elements to task item
        taskItem.appendChild(taskName);
        taskItem.appendChild(taskScoreSlider);
        taskItem.appendChild(document.createElement("br"));
        taskItem.appendChild(document.createTextNode("Completion: "));
        taskItem.appendChild(taskCompletionInput);
        taskItem.appendChild(document.createTextNode("%"));

        // Append task item to the task list
        taskListDiv.appendChild(taskItem);
    });
}

// Function to calculate energy based on tasks and challenges
function calculateEnergy() {
    let totalTasks = selectedTasks.length;
    let completedTasks = selectedTasks.filter(task => task.completion > 70).length;
    let adversity = document.getElementById("roadblocks-input").value.toLowerCase();

    // Predict energy based on tasks and adversity
    predictedEnergy = 100 - (totalTasks * 5) - (completedTasks * 10); // Reduce energy based on task load and completion
    if (adversity) {
        predictedEnergy -= 20; // If adversity is reported (like being sick), reduce energy further
    }
    if (predictedEnergy < 10) predictedEnergy = 10; // Minimum energy of 10%
    return predictedEnergy;
}

// Function to proceed to the next set of questions (roadblocks and positive events)
function nextQuestion() {
    // Hide task input section and show roadblocks/positive event section
    document.getElementById("question-box").style.display = "none";
    document.getElementById("extra-questions").style.display = "block";
    document.getElementById("final-next-btn").style.display = "block";
    document.getElementById("next-btn").style.display = "none";
}

// Submit roadblocks and positive events, then calculate motivation score and energy
function submitExtraQuestions() {
    const roadblocksInput = document.getElementById("roadblocks-input").value;
    const positiveEventsInput = document.getElementById("positive-events-input").value;

    let adversityFactor = roadblocksInput ? 1.5 : 1.0;  // Higher factor if there are roadblocks
    let positiveEventBoost = positiveEventsInput ? 1.2 : 1.0;  // Boost if positive events occurred

    document.getElementById("extra-questions").style.display = "none";
    document.getElementById("final-next-btn").style.display = "none";
    document.getElementById("result").style.display = "block";

    // Calculate energy and motivation score
    let finalEnergy = calculateEnergy();
    calculateMotivationScore(adversityFactor, positiveEventBoost, finalEnergy);
}

// Function to calculate the motivation score based on inputs
function calculateMotivationScore(adversityFactor, positiveEventBoost, finalEnergy) {
    let totalCompletion = selectedTasks.reduce((total, task) => total + parseInt(task.completion), 0) / selectedTasks.length;
    let averageScore = selectedTasks.reduce((total, task) => total + parseInt(task.score), 0) / selectedTasks.length;

    // Motivation score calculation based on task completion, adversity, energy, and task importance
    let motivationScore = (totalCompletion * adversityFactor * positiveEventBoost * averageScore * (finalEnergy / 100)) / 100;

    if (motivationScore < 10 && totalCompletion > 0) motivationScore = 10;  // Minimum 10% score if some work was done
    if (motivationScore > 100) motivationScore = 100; // Cap at 100%

    document.getElementById('motivation-score').innerText = `Your Motivation Score: ${Math.round(motivationScore)}%`;

    // Generate motivational message based on the score and energy
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks, roadblocksInput, finalEnergy);
}

// **Message Bank for Different Motivation Score Ranges**
const motivationalMessages = {
    "1-5": [
        "Today was tough, but you still managed to get through it. You completed {taskDetails} with only {energy}% energy. That's still progress, and it's important to acknowledge your effort!",
        "It might not feel like a lot, but you’ve made it through some tough moments today. With only {energy}% energy, you completed {taskDetails}. Keep going—tomorrow is a fresh start.",
        "You faced real adversity today, but you pushed through with {energy}% energy and still completed {taskDetails}. Rest well and come back stronger!"
    ],
    "6-10": [
        "Even though your energy was low, you made it through. With only {energy}% energy, you managed to complete {taskDetails}. That shows real dedication!",
        "It wasn’t an easy day, but you still managed to give it your all. You completed {taskDetails} with {energy}% energy, which is amazing.",
        "You gave it your best shot with just {energy}% energy today, and you completed {taskDetails}. Tomorrow will be even better!"
    ],
    "11-20": [
        "Despite challenges, you made significant progress today. You completed {taskDetails} with {energy}% energy—keep up the great work!",
        "You’re moving forward! You had {energy}% energy today and still managed to complete {taskDetails}. Stay focused, and you’ll see more progress soon.",
        "Your effort today really stands out. With {energy}% energy, you managed to complete {taskDetails}. That’s a win—keep it up!"
    ],
    "21-40": [
        "You’ve been productive! You completed {taskDetails} with {energy}% energy, and that’s a solid effort. Keep up the great work!",
        "You’ve accomplished quite a bit today. With {energy}% energy, you finished {taskDetails}. Keep pushing forward!",
        "Nice work! You had {energy}% energy and still managed to complete {taskDetails}. You’re well on your way to hitting your goals."
    ],
    "41-60": [
        "What a productive day! With {energy}% energy, you managed to finish {taskDetails}. Keep this momentum going!",
        "Great job! You had {energy}% energy and completed {taskDetails}. Your dedication is paying off!",
        "You’re really pushing through! You had {energy}% energy and still managed to get {taskDetails} done. Keep it going!"
    ],
    "61-80": [
        "Fantastic effort today! You completed {taskDetails} with {energy}% energy, showing just how determined you are. Keep going!",
        "You’re on fire! With {energy}% energy, you managed to complete {taskDetails}. You’re doing amazing!",
        "Wow! You gave {energy}% energy and completed {taskDetails}. Keep that momentum going!"
    ],
    "81-90": [
        "Incredible work! You completed {taskDetails} with {energy}% energy, and you’re almost at the top. Keep pushing!",
        "You’ve done amazing! With {energy}% energy, you’ve finished {taskDetails}. You’re so close to perfection!",
        "Your energy might be running low, but you’ve achieved so much. With {energy}% energy, you’ve completed {taskDetails}—keep going!"
    ],
    "91-99": [
        "You’re nearly perfect today! You had {energy}% energy and completed {taskDetails}. Keep up the excellent work—you’re almost at 100%!",
        "You’re almost there! With {energy}% energy, you managed to complete {taskDetails}. Just a bit more, and you’ll hit your goals!",
        "So close! With {energy}% energy, you managed to complete {taskDetails}. One final push and you’re at 100%!"
    ],
    "100": [
        "Perfection! You’ve completed everything you set out to do today—{taskDetails}. Celebrate this win because you’ve earned it!",
        "You’ve hit 100%! By completing {taskDetails}, you’ve reached the peak of productivity. Keep this up, and the sky’s the limit!",
        "Incredible! You’ve completed every single task—{taskDetails}. There’s no stopping you now!"
    ]
};

// Function to generate a motivational message based on the score, tasks, and adversity
function generateMotivationalMessage(score, tasks, adversity, energy) {
    let messageBankKey = getMessageBankKey(score);
    let taskDetails = tasks.map(task => `${task.name}: ${task.completion}% completed`).join(', ');

    let message = motivationalMessages[messageBankKey][Math.floor(Math.random() * 3)];

    // Replace placeholders with actual values
    message = message.replace("{taskDetails}", taskDetails);
    message = message.replace("{energy}", energy);

    if (adversity) {
        message += ` Despite feeling ${adversity}, you completed {taskDetails}. That’s amazing!`;
    }

    document.getElementById('motivation-message').innerText = message;
}

function getMessageBankKey(score) {
    if (score <= 5) return "1-5";
    if (score <= 10) return "6-10";
    if (score <= 20) return "11-20";
    if (score <= 40) return "21-40";
    if (score <= 60) return "41-60";
    if (score <= 80) return "61-80";
    if (score <= 90) return "81-90";
    if (score <= 99) return "91-99";
    return "100"; // If score is 100
}
