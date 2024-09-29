document.getElementById('trackerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form values
    let task = document.getElementById('task').value;
    let importance = parseInt(document.getElementById('importance').value);
    let completion = parseInt(document.getElementById('completion').value);
    let satisfaction = parseInt(document.getElementById('satisfaction').value);
    let adversity = document.getElementById('adversity').value;
    let lifeEventType = document.getElementById('life-event-type').value;

    // Adversity bonus
    let adversityBonus = adversity === 'yes' ? 1 : 0;

    // Life event multiplier based on type
    let lifeEventMultiplier;
    switch(lifeEventType) {
        case 'sickness':
            lifeEventMultiplier = 0.5; // Heavy penalty
            break;
        case 'social':
            lifeEventMultiplier = 0.9; // Light penalty
            break;
        case 'sports':
            lifeEventMultiplier = 0.8; // Light to moderate penalty
            break;
        case 'emergency':
            lifeEventMultiplier = 0.3; // Heavy penalty
            break;
        case 'clubs':
            lifeEventMultiplier = 0.9; // Light penalty
            break;
        case 'part-time job':
            lifeEventMultiplier = 0.7; // Moderate penalty
            break;
        case 'mental-health':
            lifeEventMultiplier = 0.5; // Heavy penalty
            break;
        case 'family':
            lifeEventMultiplier = 0.6; // Moderate penalty
            break;
        default:
            lifeEventMultiplier = 1; // No penalty if no major life event
    }

    // Predict energy level based on life events and task load
    let predictedEnergy = 100; // Default full energy
    if (lifeEventType === 'sickness' || lifeEventType === 'emergency') {
        predictedEnergy = 50; // Low energy for significant events
    } else if (lifeEventType === 'social' || lifeEventType === 'sports') {
        predictedEnergy = 80; // Slightly reduced energy
    }

    // Adjust predicted energy based on task completion (heavier task loads reduce energy)
    let taskLoadMultiplier = completion > 80 ? 1.2 : completion > 50 ? 1.0 : 0.8;
    predictedEnergy *= taskLoadMultiplier;

    // Ask the user if the predicted energy is correct
    let userEnergy = parseInt(prompt(`We predict your energy level to be around ${predictedEnergy}%. Does this feel right? If not, please enter your own energy level:`));
    
    // Use the user's input if they provide it, otherwise use the predicted energy
    let finalEnergy = isNaN(userEnergy) ? predictedEnergy : userEnergy;

    // Calculate the energy multiplier
    let energyMultiplier = 100 / finalEnergy;

    // Task score calculation
    let taskScore = (completion / 100) * importance * energyMultiplier + adversityBonus;
    taskScore *= lifeEventMultiplier; // Apply life event multiplier

    // Ensure the score doesn’t go negative
    taskScore = Math.max(0, taskScore);

    // Satisfaction bonus
    taskScore += satisfaction * 0.1;

    // Display result
    document.getElementById('motivation-score').innerText = `Your motivation score is: ${taskScore.toFixed(2)}`;
    document.getElementById('result').style.display = 'block';
});
