let selectedTasks = [];
let currentStep = 0;
const questions = [
    "What tasks are you working on today? (You can add multiple)",
    "How important are these tasks? (1-5)",
    "How much of each task did you complete? (0-100%)",
    "Did you face any adversity while completing the tasks?",
    "Any other major life events affecting your progress today?"
];

async function suggestTasks() {
    const taskInput = document.getElementById("task-input").value.toLowerCase();
    const suggestionList = document.getElementById("suggestion-list");
    suggestionList.innerHTML = ""; // Clear existing suggestions

    if (taskInput.length > 1) {
        const categories = await categorizeTaskWithAI(taskInput);

        categories.forEach(category => {
            const suggestionItem = document.createElement("li");
            suggestionItem.innerText = `${category.label} (Confidence: ${category.confidence}%)`;
            suggestionItem.onclick = function() {
                document.getElementById("task-input").value = category.label;
                suggestionList.innerHTML = ""; // Clear suggestions after selecting
            };
            suggestionList.appendChild(suggestionItem);
        });
    }
}

async function categorizeTaskWithAI(task) {
    // Load the Hugging Face model for task classification
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('distilbert-base-uncased');
    const model = await transformers.AutoModelForSequenceClassification.fromPretrained('distilbert-base-uncased-finetuned-sst-2-english');

    // Encode the input task
    const inputs = tokenizer(task, { returnTensors: "tf" });
    const logits = model(inputs).logits;
    const predictions = Array.from(logits.dataSync());

    // Map predictions to broad categories (work, health, academics, etc.)
    const categories = [
        { label: 'Work', confidence: Math.round(predictions[0] * 100) },
        { label: 'Academics', confidence: Math.round(predictions[1] * 100) },
        { label: 'Health', confidence: Math.round(predictions[2] * 100) },
        { label: 'Personal', confidence: Math.round(predictions[3] * 100) }
    ];

    return categories;
}

function addTask() {
    const taskInput = document.getElementById("task-input").value;
    if (taskInput.trim() !== "") {
        selectedTasks.push(taskInput);
        document.getElementById("task-input").value = ""; // Clear input field

        // Display selected tasks
        const taskListDiv = document.getElementById("task-list");
        taskListDiv.innerHTML = "<strong>Selected Tasks:</strong> " + selectedTasks.join(", ");
    }
}

function nextQuestion() {
    if (currentStep < questions.length - 1) {
        currentStep++;
        document.getElementById("question").innerText = questions[currentStep];
    } else {
        document.getElementById("question-box").innerHTML = `<p>Thanks for entering your tasks! Your motivation score will be calculated.</p>`;
        calculateMotivationScore();
    }
}

async function generateMotivationalMessage(score, tasks, adversity, energy) {
    // Load Hugging Face GPT-2 model for generating a motivational message
    const model = await transformers.AutoModelForCausalLM.fromPretrained('gpt2');
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('gpt2');

    // Extract task details
    let tasksCompleted = tasks.length;
    let taskDetails = tasks.map(task => `${task}: completed`).join(', ');

    // Construct a highly detailed and personalized prompt
    let prompt = `The user completed ${tasksCompleted} tasks, including ${taskDetails}. 
    Their motivation score is ${score}%. 
    Despite facing ${adversity ? "adversity" : "no adversity"} and working with ${energy}% energy, 
    they have put in their best effort. Generate a motivational message that acknowledges their hard work, encourages them, and makes them feel proud.`;

    // Encode the prompt
    const inputs = tokenizer.encode(prompt, { returnTensors: 'tf' });

    // Generate text using GPT-2
    const outputs = await model.generate(inputs, { max_length: 150 });
    const generatedMessage = tokenizer.decode(outputs[0]);

    // Display the generated message
    document.getElementById('motivation-message').innerText = generatedMessage;
}

function calculateMotivationScore() {
    let completionPercentage = (selectedTasks.length > 0 ? 100 : 0);  // Simplified, but adjust based on real data
    let adversity = selectedTasks.some(task => task.adversity); // Whether adversity was faced
    let energyLevel = 80; // Example, you can make this dynamic based on user input

    // Calculate motivation score based on completion, adversity, and energy level
    let motivationScore = (completionPercentage * (adversity ? 1.2 : 1)) / (100 / energyLevel);

    // Generate a motivational message based on the calculated score and details
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks, adversity, energyLevel);

    // Display the score
    document.getElementById('motivation-score').innerText = `Your Motivation Score: ${Math.round(motivationScore)}%`;
}
