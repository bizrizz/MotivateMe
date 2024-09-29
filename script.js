let selectedTasks = [];

// Function to add tasks
async function addTask() {
    const taskInput = document.getElementById("task-input").value.trim();
    
    // Check if the input is empty
    if (taskInput === "") {
        alert("Please enter a task.");
        return; // Exit function if task is empty
    }

    // AI task categorization
    let taskCategory = await categorizeTaskWithAI(taskInput); // Categorize task using AI

    // Push task into the array
    selectedTasks.push({ name: taskInput, score: 3, completion: 0, category: taskCategory });

    // Clear input field after task is added
    document.getElementById("task-input").value = ""; 

    // Change the button text to show it's ready for the next task
    document.getElementById("submit-task-btn").innerText = "Add Another Task";

    // Show the "Next" button after the first task is added
    document.getElementById("next-btn").style.display = "block";

    // Re-render the task list to show sliders and inputs
    renderTaskList();
}

// Function to render task list with sliders for importance and completion inputs
function renderTaskList() {
    const taskListDiv = document.getElementById("task-list");
    taskListDiv.innerHTML = ""; // Clear the task list before re-rendering

    selectedTasks.forEach((task, index) => {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");

        // Display task name and its AI-assigned category
        const taskName = document.createElement("p");
        taskName.innerText = `${task.name} (${task.category})`;

        // Slider for task importance (1-5)
        const taskScoreSlider = document.createElement("input");
        taskScoreSlider.type = "range";
        taskScoreSlider.min = "1";
        taskScoreSlider.max = "5";
        taskScoreSlider.value = task.score;
        taskScoreSlider.oninput = function () {
            selectedTasks[index].score = taskScoreSlider.value;
            renderTaskList(); // Refresh the task list to update displayed score
        };

        // Input for task completion percentage (0-100%)
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
        taskItem.appendChild(document.createTextNode(" Importance: " + taskScoreSlider.value + "/5"));
        taskItem.appendChild(document.createElement("br"));
        taskItem.appendChild(document.createTextNode("Completion: "));
        taskItem.appendChild(taskCompletionInput);
        taskItem.appendChild(document.createTextNode("%"));

        // Append task item to task list div
        taskListDiv.appendChild(taskItem);
    });
}

// Function to move to next question (roadblocks and positive events)
function nextQuestion() {
    document.getElementById("question-box").style.display = "none"; // Hide task input section
    document.getElementById("extra-questions").style.display = "block"; // Show roadblock/positive event section
    document.getElementById("final-next-btn").style.display = "block"; // Show submit button
    document.getElementById("next-btn").style.display = "none"; // Hide the "Next" button
}

// Submit roadblocks and positive events, then calculate motivation score
async function submitExtraQuestions() {
    const roadblocksInput = document.getElementById("roadblocks-input").value.toLowerCase();
    const positiveEventsInput = document.getElementById("positive-events-input").value.toLowerCase();

    let adversityFactor = await categorizeAdversityWithAI(roadblocksInput);
    let positiveEventBoost = await categorizePositiveEventWithAI(positiveEventsInput);

    document.getElementById("extra-questions").style.display = "none";
    document.getElementById("final-next-btn").style.display = "none";
    document.getElementById("result").style.display = "block";

    calculateMotivationScore(adversityFactor, positiveEventBoost);
}

// Calculate the motivation score using AI factors
async function calculateMotivationScore(adversityFactor, positiveEventBoost) {
    let totalCompletion = selectedTasks.reduce((total, task) => total + parseInt(task.completion), 0) / selectedTasks.length;
    let averageScore = selectedTasks.reduce((total, task) => total + parseInt(task.score), 0) / selectedTasks.length;

    let motivationScore = (totalCompletion * adversityFactor * positiveEventBoost * averageScore) / 100;
    if (motivationScore > 100) motivationScore = 100; // Cap score at 100%

    document.getElementById('motivation-score').innerText = `Your Motivation Score: ${Math.round(motivationScore)}%`;
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks, adversityFactor, positiveEventBoost);
}

// Function to categorize tasks using AI
async function categorizeTaskWithAI(task) {
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('distilbert-base-uncased');
    const model = await transformers.AutoModelForSequenceClassification.fromPretrained('distilbert-base-uncased-finetuned-sst-2-english');
    const inputs = tokenizer(task, { returnTensors: 'tf' });
    const logits = model(inputs).logits;
    const predictions = Array.from(logits.dataSync());

    if (predictions[0] > 0.5) return 'Work';
    if (predictions[1] > 0.5) return 'Health';
    return 'Personal';
}

// AI-Based adversity classification
async function categorizeAdversityWithAI(roadblocks) {
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('distilbert-base-uncased');
    const model = await transformers.AutoModelForSequenceClassification.fromPretrained('distilbert-base-uncased-finetuned-sst-2-english');
    const inputs = tokenizer(roadblocks, { returnTensors: 'tf' });
    const logits = model(inputs).logits;
    const predictions = Array.from(logits.dataSync());

    if (predictions[0] > 0.5) return 1.3;
    if (predictions[1] > 0.5) return 1.2;
    return 1.1;
}

// AI-Based positive event classification
async function categorizePositiveEventWithAI(positiveEvent) {
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('distilbert-base-uncased');
    const model = await transformers.AutoModelForSequenceClassification.fromPretrained('distilbert-base-uncased-finetuned-sst-2-english');
    const inputs = tokenizer(positiveEvent, { returnTensors: 'tf' });
    const logits = model(inputs).logits;
    const predictions = Array.from(logits.dataSync());

    if (predictions[0] > 0.5) return 1.2;
    return 1.0;
}

// Generate a motivational message based on score and AI classification
async function generateMotivationalMessage(score, tasks, adversityFactor, positiveEventBoost) {
    const model = await transformers.AutoModelForCausalLM.fromPretrained('gpt2');
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('gpt2');

    let taskDetails = tasks.map(task => `${task.name}: ${task.completion}% completed, ${task.score}/5 importance`).join(', ');
    let prompt = `The user completed ${tasks.length} tasks, including ${taskDetails}. They faced adversity (${adversityFactor}) and positive events (${positiveEventBoost}). Generate a motivational message for a ${score}% motivation score.`;

    const inputs = tokenizer.encode(prompt, { returnTensors: 'tf' });
    const outputs = await model.generate(inputs, { max_length: 150 });
    const generatedMessage = tokenizer.decode(outputs[0]);

    document.getElementById('motivation-message').innerText = generatedMessage;
}
