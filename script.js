let selectedTasks = [];
let currentStep = 0;

function addTask() {
    const taskInput = document.getElementById("task-input").value.trim();
    if (taskInput !== "") {
        selectedTasks.push({ name: taskInput, score: 3, completion: 0 }); // Default score 3/5 and 0% completion

        document.getElementById("task-input").value = ""; // Clear input field

        // Remove the "Submit Task" button after first task
        document.getElementById("submit-task-btn").style.display = "none";

        renderTaskList(); // Render task list with sliders and completion inputs
    }
}

function renderTaskList() {
    const taskListDiv = document.getElementById("task-list");
    taskListDiv.innerHTML = ""; // Clear the task list before re-rendering

    selectedTasks.forEach((task, index) => {
        const taskItem = document.createElement("div");
        taskItem.classList.add("task-item");

        // Task Name
        const taskName = document.createElement("p");
        taskName.innerText = task.name;

        // Slider for importance (1-5)
        const taskScoreSlider = document.createElement("input");
        taskScoreSlider.type = "range";
        taskScoreSlider.min = "1";
        taskScoreSlider.max = "5";
        taskScoreSlider.value = task.score;
        taskScoreSlider.oninput = function () {
            selectedTasks[index].score = taskScoreSlider.value;
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

function nextQuestion() {
    if (currentStep < questions.length - 1) {
        currentStep++;
        document.getElementById("question").innerText = questions[currentStep];
    } else {
        document.getElementById("question-box").innerHTML = `<p>Thanks for entering your tasks! Your motivation score will be calculated.</p>`;
        calculateMotivationScore();
    }
}

function calculateMotivationScore() {
    // Calculate total completion and average score
    let totalCompletion = selectedTasks.reduce((total, task) => total + parseInt(task.completion), 0) / selectedTasks.length;
    let averageScore = selectedTasks.reduce((total, task) => total + parseInt(task.score), 0) / selectedTasks.length;

    // For now, we'll assume full energy and no adversity
    let energyLevel = 100;
    let adversity = false;

    // Calculate the motivation score
    let motivationScore = (totalCompletion * (adversity ? 1.2 : 1)) / (100 / energyLevel) * averageScore;

    // Display the score
    document.getElementById('motivation-score').innerText = `Your Motivation Score: ${Math.round(motivationScore)}%`;

    // Generate a motivational message based on the score
    generateMotivationalMessage(Math.round(motivationScore), selectedTasks, adversity, energyLevel);
}

async function generateMotivationalMessage(score, tasks, adversity, energy) {
    const model = await transformers.AutoModelForCausalLM.fromPretrained('gpt2');
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('gpt2');

    let taskDetails = tasks.map(task => `${task.name}: ${task.completion}% completed, ${task.score}/5 importance`).join(', ');

    let prompt = `The user completed ${tasks.length} tasks, including ${taskDetails}. Their motivation score is ${score}%. Despite facing ${adversity ? "adversity" : "no adversity"} and working with ${energy}% energy, they have put in their best effort. Generate a motivational message acknowledging their hard work, encouraging them, and making them feel proud.`;

    const inputs = tokenizer.encode(prompt, { returnTensors: 'tf' });
    const outputs = await model.generate(inputs, { max_length: 150 });
    const generatedMessage = tokenizer.decode(outputs[0]);

    document.getElementById('motivation-message').innerText = generatedMessage;
}
