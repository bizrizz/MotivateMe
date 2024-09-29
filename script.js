const categories = {
    "academics": ["homework", "study", "essay", "assignment"],
    "sports": ["hockey", "soccer", "gym", "training"],
    "family": ["family", "siblings", "parents"],
    "work": ["job", "shift", "work", "office"]
};

async function categorizeTask() {
    const taskInput = document.getElementById("task").value.toLowerCase();
    let category = "Miscellaneous";

    // Load the Hugging Face model for text classification
    const tokenizer = await transformers.AutoTokenizer.fromPretrained('distilbert-base-uncased');
    const model = await transformers.AutoModelForSequenceClassification.fromPretrained('distilbert-base-uncased-finetuned-sst-2-english');

    // Encode the input task
    const inputs = tokenizer(taskInput, { returnTensors: "tf" });
    const logits = model(inputs).logits;
    const predictions = Array.from(logits.dataSync());

    // Map the predictions to categories
    const maxPrediction = Math.max(...predictions);
    if (predictions.indexOf(maxPrediction) === 0) {
        category = "Academics";
    } else if (predictions.indexOf(maxPrediction) === 1) {
        category = "Sports";
    } else if (predictions.indexOf(maxPrediction) === 2) {
        category = "Family";
    } else if (predictions.indexOf(maxPrediction) === 3) {
        category = "Work";
    }

    document.getElementById("category-suggestion").innerText = `This task is categorized under: ${category}`;
}

function nextQuestion() {
    const taskInput = document.getElementById("task").value;

    if (currentStep < questions.length - 1) {
        currentStep++;
        document.getElementById("question").innerText = questions[currentStep];

        if (currentStep === 1) {
            document.getElementById("task").type = "number"; // Changing input to number for task importance
        }

        if (currentStep > 0) {
            document.getElementById("category-suggestion").style.display = "none"; // Hide category suggestion after task
        }
    } else {
        document.getElementById("question-box").innerHTML = `<p>Thanks for entering your tasks! Your motivation score will be calculated.</p>`;
    }
}
