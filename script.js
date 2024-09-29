let selectedTasks = [];
let predictedEnergy = 100; // Starting predicted energy for the day

// Function to add tasks
function addTask() {
    const taskInput = document.getElementById("task-input").value.trim();
    if (!taskInput) {
        alert("Please enter a task.");
        return;
    }

    // Add task to the array with default importance and completion values
    selectedTasks.push({ name: taskInput, score: 3, completion: 0 });
    document.getElementById("task-input").value = ""; // Clear the input field
    document.getElementById("next-btn").style.display = "block"; // Show 'Next' button
    renderTaskList(); // Re-render the task list
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
        taskScoreSlider.value = task.score;
        taskScoreSlider.oninput = function () {
            selectedTasks[index].score = taskScoreSlider.value;
            taskName.innerText = `${task.name} (Importance: ${taskScoreSlider.value}/5)`;
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
        taskListDiv.appendChild(taskItem);
    });
}

// Function to calculate energy based on tasks and challenges
function calculateEnergy() {
    let totalTasks = selectedTasks.length;
    let completedTasks = selectedTasks.filter(task => task.completion > 70).length;
    let adversity = document.getElementById("roadblocks-input").value.toLowerCase();

    // Predict energy based on tasks and adversity
    predictedEnergy = 100 - (totalTasks * 5) - (completedTasks * 10);
    if (adversity) {
        predictedEnergy -= 20; // If adversity is reported, reduce energy further
    }
    return Math.max(predictedEnergy, 10); // Minimum energy of 10%
}

// Function to proceed to the next set of questions (roadblocks and positive events)
function nextQuestion() {
    document.getElementById("question-box").style.display = "none";
    document.getElementById("extra-questions").style.display = "block";
    document.getElementById("final-next-btn").style.display = "block";
}

// Submit roadblocks and positive events, then calculate motivation score and energy
function submitExtraQuestions() {
    const roadblocksInput = document.getElementById("roadblocks-input").value;
    const positiveEventsInput = document.getElementById("positive-events-input").value;

    let adversityFactor = roadblocksInput ? 1.5 : 1.0;  // Higher factor if there are roadblocks
    let positiveEventBoost = positiveEventsInput ? 1.2 : 1.0;  // Boost if positive events occurred

    document.getElementById("extra-questions").style.display = "none";
    document.getElementById("result").style.display = "block";

    // Calculate energy and motivation score
    let finalEnergy = calculateEnergy();
    calculateMotivationScore(adversityFactor, positiveEventBoost, finalEnergy, roadblocksInput, positiveEventsInput);
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

// Function to calculate the motivation score
function calculateMotivationScore(adversityFactor, positiveEventBoost, finalEnergy, roadblocksInput, positiveEventsInput) {
    let totalCompletion = selectedTasks.reduce((total, task) => total + parseInt(task.completion), 0) / selectedTasks.length;
    let averageScore = selectedTasks.reduce((total, task) => total + parseInt(task.score), 0) / selectedTasks.length;

    // Motivation score calculation
    let motivationScore = (totalCompletion * adversityFactor * positiveEventBoost * averageScore * (finalEnergy / 100)) / 100;
    motivationScore = Math.max(10, Math.min(100, motivationScore)); // Cap score between 10 and 100%

    // Generate motivational message based on the score and energy
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks, roadblocksInput, positiveEventsInput, finalEnergy);
    triggerConfetti(); // Trigger confetti effect
}

// Energy message based on energy level
function getEnergyMessage(energy) {
    if (energy <= 20) {
        return "you had really low energy today, but you still managed to do something. that’s amazing.";
    } else if (energy > 20 && energy <= 40) {
        return "your energy was low, but you powered through some tasks. give yourself credit for that!";
    } else if (energy > 40 && energy <= 60) {
        return "you had decent energy today and made solid progress. keep this momentum going!";
    } else if (energy > 60 && energy <= 80) {
        return "your energy levels were good, and you crushed a lot of tasks. great job!";
    } else {
        return "your energy was off the charts today! you got so much done, keep up the awesome work!";
    }
}

// Helper function to map completion percentage to natural language descriptions
function getCompletionText(completion, taskName) {
    if (completion <= 10) {
        return `you didn’t get many ${taskName} done, but there's always tomorrow`;
    } else if (completion > 10 && completion <= 30) {
        return `you got some ${taskName} down, you can finish more tomorrow`;
    } else if (completion > 30 && completion <= 60) {
        return `you made decent progress on ${taskName}, keep it up`;
    } else if (completion > 60 && completion <= 80) {
        return `you got a good chunk of ${taskName} done, great job!`;
    } else {
        return `you crushed ${taskName}, almost finished it all!`;
    }
}

// Function to display energy bar with animation
function showEnergyBar(energy) {
    const energyBar = document.getElementById('energy-bar-fill');
    energyBar.style.width = '0%'; // Reset the bar to 0 first
    energyBar.style.transition = 'none'; // Remove transition for the reset
    setTimeout(() => {
        energyBar.style.transition = 'width 5s ease-in-out'; // Smooth animation over 5 seconds
        energyBar.style.width = `${energy}%`; // Fill the bar based on energy level
    }, 100); // Small delay to ensure the reset is seen before filling
}

function generateMotivationalMessage(score, tasks, adversity, positiveEvents, energy) {
    let messageBankKey = getMessageBankKey(score);
    let taskDetails = tasks.map(task => getCompletionText(task.completion, task.name)).join(', ');

    let message = motivationalMessages[messageBankKey][Math.floor(Math.random() * motivationalMessages[messageBankKey].length)];

    // Add personalized energy messages based on the energy intervals
    let energyMessage = getEnergyMessage(energy);

    // Replace placeholders with actual values
    message = message.replace("{taskDetails}", taskDetails);
    message = message.replace("{energy}", energy);

    // Personalize the adversity and positive event part
    if (adversity) {
        message += ` you were feeling ${adversity}, but you pushed through.`;
    }

    if (positiveEvents) {
        message += ` It’s cool how ${positiveEvents} kept you motivated today!`;
    }

    // Add the energy message at the end
    message += ` ${energyMessage}`;

    // Display the motivational message
    document.getElementById('motivation-message').innerText = message;

    // Show the energy bar
    showEnergyBar(energy);

    // Trigger confetti and avatars after showing message
    triggerConfetti();
    document.getElementById('left-avatar').style.display = 'block';
    document.getElementById('right-avatar').style.display = 'block';
}

// Function to get the message bank key based on score
function getMessageBankKey(score) {
    if (score <= 5) return "1-5";
    if (score <= 10) return "6-10";
    if (score <= 20) return "11-20";
    if (score <= 40) return "21-40";
    if (score <= 60) return "41-60";
    if (score <= 80) return "61-80";
    if (score <= 90) return "81-90";
    if (score <= 99) return "91-99";
    return "100";
}

// Confetti effect trigger
function triggerConfetti() {
    const confettiSettings = { target: 'confetti-canvas' };
    const confetti = new ConfettiGenerator(confettiSettings);
    confetti.render();
}
