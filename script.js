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
    calculateMotivationScore(adversityFactor, positiveEventBoost, finalEnergy, roadblocksInput, positiveEventsInput);
}

// Function to calculate the motivation score based on inputs
function calculateMotivationScore(adversityFactor, positiveEventBoost, finalEnergy, roadblocksInput) {
    let totalCompletion = selectedTasks.reduce((total, task) => total + parseInt(task.completion), 0) / selectedTasks.length;
    let averageScore = selectedTasks.reduce((total, task) => total + parseInt(task.score), 0) / selectedTasks.length;

    // Motivation score calculation based on task completion, adversity, energy, and task importance
    let motivationScore = (totalCompletion * adversityFactor * positiveEventBoost * averageScore * (finalEnergy / 100)) / 100;

    if (motivationScore < 10 && totalCompletion > 0) motivationScore = 10;  // Minimum 10% score if some work was done
    if (motivationScore > 100) motivationScore = 100; // Cap at 100%

    document.getElementById('motivation-score').style.display = 'none'; // Hide the motivation score

    // Generate motivational message based on the score and energy
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks, roadblocksInput, finalEnergy);

    // Trigger the confetti effect after the message is shown
    triggerConfetti();
}

function generateMotivationalMessage(score, tasks, adversity, positiveEvents, energy) {
    let messageBankKey = getMessageBankKey(score); // Fetch the correct message range
    let taskDetails = tasks.map(task => {
        let completionText;
        if (task.completion < 30) {
            completionText = `you gave it a start on ${task.name}, got about ${task.completion}% done`;
        } else if (task.completion >= 30 && task.completion < 70) {
            completionText = `you made some good progress on ${task.name}, hitting ${task.completion}%`;
        } else {
            completionText = `you did awesome and completed ${task.completion}% of ${task.name}`;
        }
        return completionText;
    }).join(', ');

    // Select a random message from the bank
    let message = motivationalMessages[messageBankKey][Math.floor(Math.random() * motivationalMessages[messageBankKey].length)];

    // Replace placeholders with actual values
    message = message.replace("{taskDetails}", taskDetails);
    message = message.replace("{energy}", energy);

    // Personalize the adversity and positive event part
    if (adversity) {
        message += ` even though you were feeling ${adversity}, you still pushed through.`;
    }

    if (positiveEvents) {
        message += ` it’s cool how ${positiveEvents} kept you going!`;
    }

    // Display the motivational message in the result box
    document.getElementById('motivation-message').innerText = message;
}

const motivationalMessages = {
    "1-5": [
        "today was tough, but hey, you still made it through. {taskDetails} with only {energy}% energy—seriously, that’s something.",
        "even if it doesn’t feel like much, you kept going today. {taskDetails} and you powered through with just {energy}% energy. tomorrow’s a new day.",
        "you faced some hard stuff today, but with {energy}% energy, you still managed to get {taskDetails} done. rest up, you got this!"
    ],
    "6-10": [
        "you gave it your all even with low energy. {taskDetails}, and with only {energy}% energy, that’s pretty impressive.",
        "it wasn’t easy today, but you made progress with {taskDetails}, even with {energy}% energy. keep your head up, tomorrow’s another chance.",
        "even with just {energy}% energy, you kept going and got {taskDetails} done. you’ve got dedication, no doubt."
    ],
    "11-20": [
        "despite everything, you made solid progress today. {taskDetails} with {energy}% energy—keep going, you’re on the right track.",
        "you’re moving forward, and that’s awesome! with {energy}% energy, you still managed to {taskDetails}. keep it up!",
        "your effort today was great. with {energy}% energy, you completed {taskDetails}. keep pushing forward!"
    ],
    "21-40": [
        "you’ve been pretty productive today. with {energy}% energy, you completed {taskDetails}, that’s solid.",
        "nice work! you managed to complete {taskDetails} with {energy}% energy—keep it going!",
        "you’ve accomplished a lot today, finishing {taskDetails}. that’s a win!"
    ],
    "41-60": [
        "awesome day! with {energy}% energy, you finished {taskDetails}—keep that momentum going!",
        "you’re really pushing through. you completed {taskDetails} with {energy}% energy—that’s amazing.",
        "you’re doing great! {taskDetails} with {energy}% energy—this is progress!"
    ],
    "61-80": [
        "you crushed it today. {taskDetails} and you did it with {energy}% energy. keep up the great work!",
        "wow, you were on fire today! {taskDetails} and you did it all with {energy}% energy. nice job!",
        "you gave {energy}% energy today and knocked out {taskDetails}. keep that going!"
    ],
    "81-90": [
        "incredible work! {taskDetails} with {energy}% energy, and you’re almost there. keep pushing!",
        "you did amazing today! {taskDetails} and with {energy}% energy, that’s so close to perfection!",
        "your energy might be running low, but you’ve achieved so much. {taskDetails} with {energy}% energy—keep going!"
    ],
    "91-99": [
        "you’re almost at perfection! with {energy}% energy, you completed {taskDetails}. one last push and you’re there!",
        "so close! {taskDetails} with {energy}% energy, you’re almost at the top. you’ve got this!",
        "you’re nearly perfect today! {taskDetails} with {energy}% energy. keep it up!"
    ],
    "100": [
        "perfect score! you got {taskDetails} done with {energy}% energy. that’s beyond awesome!",
        "you totally nailed it today. {taskDetails} with {energy}% energy, you didn’t leave anything undone!",
        "you hit 100%! by finishing {taskDetails}, you’ve reached the top. keep that up!"
    ]
};

// Function to calculate the motivation score based on inputs
function calculateMotivationScore(adversityFactor, positiveEventBoost, finalEnergy) {
    let totalCompletion = selectedTasks.reduce((total, task) => total + parseInt(task.completion), 0) / selectedTasks.length;
    let averageScore = selectedTasks.reduce((total, task) => total + parseInt(task.score), 0) / selectedTasks.length;

    // Motivation score calculation based on task completion, adversity, energy, and task importance
    let motivationScore = (totalCompletion * adversityFactor * positiveEventBoost * averageScore * (finalEnergy / 100)) / 100;

    if (motivationScore < 10 && totalCompletion > 0) motivationScore = 10;  // Minimum 10% score if some work was done
    if (motivationScore > 100) motivationScore = 100; // Cap at 100%

    // Hide the motivation score from the UI
    document.getElementById('motivation-score').style.display = 'none';

    // Generate the motivational message based on score
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks, roadblocksInput, finalEnergy);

    // Trigger the confetti effect after the message is shown
    triggerConfetti();
}

// Function to trigger confetti effect
function triggerConfetti() {
    const confettiSettings = { target: 'confetti-canvas' };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
}

function generateMotivationalMessage(score, tasks, adversity, energy) {
    console.log("Motivation score:", score);  // Debugging line
    console.log("Adversity:", adversity);     // Debugging line
    console.log("Energy:", energy);           // Debugging line

    let messageBankKey = getMessageBankKey(score);
    console.log("Message Bank Key:", messageBankKey);  // Debugging line

    let taskDetails = tasks.map(task => `${task.name}: ${task.completion}% completed`).join(', ');

    let message = motivationalMessages[messageBankKey][Math.floor(Math.random() * 3)];

    // Replace placeholders with actual values
    message = message.replace("{taskDetails}", taskDetails);
    message = message.replace("{energy}", energy);
    console.log("Generated message:", message); // Debugging line

    if (adversity) {
        message += ` Despite feeling ${adversity}, you completed ${taskDetails}. That’s amazing!`;
    }

    // Display the motivational message in the result box
    document.getElementById('motivation-message').innerText = message;
    console.log("Message displayed in HTML"); // Debugging line
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
    return "100";  // If score is 100
}

// Function to calculate motivation score and display a motivational message
function calculateMotivationScore(adversityFactor, positiveEventBoost, finalEnergy, roadblocksInput) {
    let totalCompletion = selectedTasks.reduce((total, task) => total + parseInt(task.completion), 0) / selectedTasks.length;
    let averageScore = selectedTasks.reduce((total, task) => total + parseInt(task.score), 0) / selectedTasks.length;

    // Motivation score calculation based on task completion, adversity, energy, and task importance
    let motivationScore = (totalCompletion * adversityFactor * positiveEventBoost * averageScore * (finalEnergy / 100)) / 100;

    if (motivationScore < 10 && totalCompletion > 0) motivationScore = 10;  // Minimum 10% score if some work was done
    if (motivationScore > 100) motivationScore = 100;  // Cap at 100%

    document.getElementById('motivation-score').style.display = 'none'; // Hide the motivation score

    // Generate motivational message based on the score and energy
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks, roadblocksInput, finalEnergy);

    // Trigger the confetti effect after the message is shown
    triggerConfetti();
}

// Function to trigger confetti effect after showing the motivational message
function triggerConfetti() {
    const confettiSettings = { target: 'confetti-canvas' }; // Target the canvas for confetti
    const confetti = new ConfettiGenerator(confettiSettings); // Initialize confetti generator
    confetti.render(); // Start the confetti animation
}

// Function to generate a personalized motivational message based on the score, tasks, adversity, and energy
function generateMotivationalMessage(score, tasks, adversity, energy) {
    let messageBankKey = getMessageBankKey(score); // Fetch the correct message range
    let taskDetails = tasks.map(task => `${task.name}: ${task.completion}% completed`).join(', ');

    let message = motivationalMessages[messageBankKey][Math.floor(Math.random() * 3)]; // Random message from bank

    // Replace placeholders with actual values
    message = message.replace("{taskDetails}", taskDetails);
    message = message.replace("{energy}", energy);

    // Add adversity-related message if any adversity was reported
    if (adversity) {
        message += ` Despite feeling ${adversity}, you completed ${taskDetails}. That’s amazing!`;
    }

    // Display the motivational message in the result box
    document.getElementById('motivation-message').innerText = message;
}

