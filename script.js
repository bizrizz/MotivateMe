let selectedTasks = [];

// Function to add tasks
async function addTask() {
    const taskInput = document.getElementById("task-input").value.trim();
    if (taskInput !== "") {
        let taskCategory = await categorizeTaskWithAI(taskInput); // AI-based task categorization
        selectedTasks.push({ name: taskInput, score: 3, completion: 0, category: taskCategory });

        document.getElementById("task-input").value = ""; // Clear input field

        // Change the button text after the first task is added
        document.getElementById("submit-task-btn").innerText = "Add Another Task";
        document.getElementById("next-btn").style.display = "block";

        renderTaskList(); // Render the updated task list
    }
}

// Function to render the task list
function renderTaskList() {
    const taskListDiv = document.getElementById("task-list");
    taskListDiv.innerHTML = ""; // Clear the task list before re-rendering

    selectedTasks.forEach((task, index) => {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");

        // Task Name and Category
        const taskName = document.createElement("p");
        taskName.innerText = `${task.name} (${task.category})`;

        // Slider for importance (1-5)
        const taskScoreSlider = document.createElement("input");
        taskScoreSlider.type = "range";
        taskScoreSlider.min = "1";
        taskScoreSlider.max = "5";
        taskScoreSlider.value = task.score;
        taskScoreSlider.oninput = function () {
            selectedTasks[index].score = taskScoreSlider.value;
            renderTaskList(); // Refresh the task list to update the displayed score
        };

        // Input for completion percentage
        const taskCompletionInput = document.createElement("input");
        taskCompletionInput.type = "number";
        taskCompletionInput.min = "0";
        taskCompletionInput.max = "100";
        taskCompletionInput.value = task.completion;
        taskCompletionInput.onchange = function () {
            selectedTasks[index].completion = taskCompletionInput.value;
        };

        taskItem.appendChild(taskName);
        taskItem.appendChild(taskScoreSlider);
        taskItem.appendChild(document.createTextNode(" Importance: " + taskScoreSlider.value + "/5"));
        taskItem.appendChild(document.createElement("br"));
        taskItem.appendChild(document.createTextNode("Completion: "));
        taskItem.appendChild(taskCompletionInput);
        taskItem.appendChild(document.createTextNode("%"));

        taskListDiv.appendChild(taskItem);
    });
}

// Move to next question (for roadblocks and positive events)
function nextQuestion() {
    // Hide task input section and show roadblock/positive event section
    document.getElementById("question-box").style.display = "none";
    document.getElementById("extra-questions").style.display = "block";
    document.getElementById("final-next-btn").style.display = "block";
    document.getElementById("next-btn").style.display = "none";
}

// Submit roadblocks and positive events, calculate motivation score
async function submitExtraQuestions() {
    // Get roadblocks and positive events
    const roadblocksInput = document.getElementById("roadblocks-input").value.toLowerCase();
    const positiveEventsInput = document.getElementById("positive-events-input").value.toLowerCase();

    // Use AI to classify adversity and positive events
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

    // Calculate motivation score adjusted for adversity and positive events
    let motivationScore = (totalCompletion * adversityFactor * positiveEventBoost * averageScore) / 100;
    if (motivationScore > 100) motivationScore = 100; // Cap the score at 100%

    document.getElementById('motivation-score').innerText = `Your Motivation Score: ${Math.round(motivationScore)}%`;

    // Generate personalized motivational message
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks, adversityFactor, positiveEventBoost);
}

// AI-Based task categorization (no dictionaries)
async function categorizeTaskWithAI(task) {
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('distilbert-base-uncased');
    const model = await transformers.AutoModelForSequenceClassification.fromPretrained('distilbert-base-uncased-finetuned-sst-2-english');

    const inputs = tokenizer(task, { returnTensors: 'tf' });
    const logits = model(inputs).logits;
    const predictions = Array.from(logits.dataSync());

    if (predictions[0] > 0.5) {
        return 'Work'; // High confidence the task is work-related
    } else if (predictions[1] > 0.5) {
        return 'Health'; // High confidence the task is health-related
    } else {
        return 'Personal'; // Default to personal if unsure
    }
}

// AI-Based adversity classification
async function categorizeAdversityWithAI(roadblocks) {
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('distilbert-base-uncased');
    const model = await transformers.AutoModelForSequenceClassification.fromPretrained('distilbert-base-uncased-finetuned-sst-2-english');

    const inputs = tokenizer(roadblocks, { returnTensors: 'tf' });
    const logits = model(inputs).logits;
    const predictions = Array.from(logits.dataSync());

    if (predictions[0] > 0.5) {
        return 1.3; // Severe adversity detected (e.g., sick, very tired)
    } else if (predictions[1] > 0.5) {
        return 1.2; // Moderate adversity (e.g., mild tiredness)
    } else {
        return 1.1; // Mild adversity
    }
}

// AI-Based positive event classification
async function categorizePositiveEventWithAI(positiveEvent) {
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('distilbert-base-uncased');
    const model = await transformers.AutoModelForSequenceClassification.fromPretrained('distilbert-base-uncased-finetuned-sst-2-english');

    const inputs = tokenizer(positiveEvent, { returnTensors: 'tf' });
    const logits = model(inputs).logits;
    const predictions = Array.from(logits.dataSync());

    if (predictions[0] > 0.5) {
        return 1.2; // Strong positive event detected (e.g., energized)
    } else {
        return 1.0; // No positive event boost
    }
}

// Generate motivational message based on score and AI classification
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
