let currentStep = 0;
const questions = [
    "What task are you working on today?",
    "How important is this task? (1-5)",
    "How much of the task did you complete? (0-100%)",
    "Did you face any adversity while completing the task?",
    "Any other major life events affecting your progress today?"
];

const categories = {
    "homework": "Academics",
    "study": "Academics",
    "essay": "Academics",
    "hockey": "Sports",
    "soccer": "Sports",
    "gym": "Physical Health",
    "family": "Family",
    "work": "Part-Time Job"
};

function categorizeTask() {
    const taskInput = document.getElementById("task").value.toLowerCase();
    let category = "Miscellaneous";
    
    // Simple keyword-based AI categorization
    for (const keyword in categories) {
        if (taskInput.includes(keyword)) {
            category = categories[keyword];
            break;
        }
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
