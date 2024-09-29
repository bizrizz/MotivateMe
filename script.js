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
        "today was tough, but hey, you still made it through. {taskDetails}—seriously, that’s something.",
        "even if it doesn’t feel like much, you kept going today. {taskDetails}. tomorrow’s a new day.",
        "you faced some hard stuff today, but you still managed to get {taskDetails} done. rest up, you got this!"
    ],
    "6-10": [
        "you gave it your all. {taskDetails}, and that’s pretty impressive.",
        "it wasn’t easy today, but you made progress with {taskDetails}. keep your head up, tomorrow’s another chance.",
        "you kept going and got {taskDetails} done. you’ve got dedication, no doubt."
    ],
    "11-20": [
        "despite everything, you made solid progress today. {taskDetails}—keep going, you’re on the right track.",
        "you’re moving forward, and that’s awesome! you still managed to {taskDetails}. keep it up!",
        "your effort today was great. you completed {taskDetails}, keep pushing forward!"
    ],
    "21-40": [
        "you’ve been pretty productive today. you completed {taskDetails}, that’s solid.",
        "nice work! you managed to complete {taskDetails}—keep it going!",
        "you’ve accomplished a lot today, finishing {taskDetails}. that’s a win!"
    ],
    "41-60": [
        "awesome day! you finished {taskDetails}—keep that momentum going!",
        "you’re really pushing through. you completed {taskDetails}—that’s amazing.",
        "you’re doing great! {taskDetails}—this is progress!"
    ],
    "61-80": [
        "you crushed it today. {taskDetails}, and you really made great progress. keep up the great work!",
        "wow, you were on fire today! {taskDetails}, and you nailed it. nice job!",
        "you gave your best today and knocked out {taskDetails}. keep that going!"
    ],
    "81-90": [
        "incredible work! {taskDetails}, and you’re almost there. keep pushing!",
        "you did amazing today! {taskDetails}, that’s so close to perfection!",
        "you’ve achieved so much. {taskDetails}—keep going!"
    ],
    "91-99": [
        "you’re almost at perfection! you completed {taskDetails}. one last push and you’re there!",
        "so close! {taskDetails}, you’re almost at the top. you’ve got this!",
        "you’re nearly perfect today! {taskDetails}. keep it up!"
    ],
    "100": [
        "perfect score! you got {taskDetails} done and reached 100%. that’s beyond awesome!",
        "you totally nailed it today. {taskDetails}, you didn’t leave anything undone!",
        "you hit 100%! by finishing {taskDetails}, you’ve reached the top. keep that up!"
    ]
};

// Function to display energy bar with animation and synchronized percentage
function showEnergyBar(energy) {
    const energyBar = document.getElementById('energy-bar-fill');
    const energyPercentage = document.getElementById('energy-bar-percentage');

    energyBar.style.width = '0%'; // Reset the bar first
    energyPercentage.innerText = '0%'; // Reset the percentage

    let currentEnergy = 0; // Initialize the current energy to 0
    const fillDuration = 5000; // Total duration in milliseconds (5 seconds)
    const stepTime = Math.round(fillDuration / energy); // Calculate time for each percent increment

    const interval = setInterval(() => {
        if (currentEnergy < energy) {
            currentEnergy++;
            energyBar.style.width = `${currentEnergy}%`; // Update the width of the bar
            energyPercentage.innerText = `${currentEnergy}%`; // Update the percentage display
        } else {
            clearInterval(interval); // Stop the interval once the desired energy is reached
        }
    }, stepTime); // Control the speed of the bar and percentage increase
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
    } else if (energy > 80) {
        return "your energy was off the charts today! you got so much done, keep up the awesome work!";
    } else {
        return ""; // Fallback, just in case
    }
}

// Function to generate a motivational message based on task completion and energy
function generateMotivationalMessage(score, tasks, adversity, positiveEvents, energy) {
    let messageBankKey = getMessageBankKey(score);
    let taskDetails = tasks.map(task => getCompletionText(task.completion, task.name)).join(', ');

    // Select a random motivational message
    let message = motivationalMessages[messageBankKey][Math.floor(Math.random() * motivationalMessages[messageBankKey].length)];

    // Get energy message based on the energy level
    let energyMessage = getEnergyMessage(energy);

    // Add only one energy message to avoid conflicting statements
    message = message.replace("{energy}", energyMessage);

    // Personalize the adversity and positive event parts
    if (adversity) {
        message += ` Even though you were feeling ${adversity}, you still pushed through.`;
    }

    if (positiveEvents) {
        message += ` It’s cool how ${positiveEvents} kept you going!`;
    }

    // Finalize and display the motivational message
    document.getElementById('motivation-message').innerText = message;

    // Show the energy bar animation
    showEnergyBar(energy);

    // Trigger confetti and display avatars
    triggerConfetti();
    document.getElementById('left-avatar').style.display = 'block';
    document.getElementById('right-avatar').style.display = 'block';
}

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
