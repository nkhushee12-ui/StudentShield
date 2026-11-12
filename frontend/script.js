
// ======================================
// STUDENTSHIELD AI - FRONTEND JAVASCRIPT
// ======================================

// Flask API endpoint
const API_URL = "http://127.0.0.1:5000/predict";

// Dashboard counters for this browser session
let totalCount = 0;
let lowCount = 0;
let mediumCount = 0;
let highCount = 0;


// Get HTML elements
const form = document.getElementById("predictionForm");
const predictBtn = document.getElementById("predictBtn");
const resultCard = document.getElementById("resultCard");
const emptyState = document.getElementById("emptyState");
const errorMessage = document.getElementById("errorMessage");


// ======================================
// FORM SUBMISSION
// ======================================

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    errorMessage.textContent = "";
    resultCard.hidden = true;

    // Collect input values
    
const studentData = {
    "Age at enrollment": Number(document.getElementById("age").value),

    "Debtor": Number(document.getElementById("debtor").value),

    "Tuition fees up to date": Number(document.getElementById("tuition").value),

    "Scholarship holder": Number(document.getElementById("scholarship").value),

    "Curricular units 1st sem (credited)": Number(document.getElementById("credited").value),

    "Curricular units 1st sem (enrolled)": Number(document.getElementById("enrolled").value),

    "Curricular units 1st sem (evaluations)": Number(document.getElementById("evaluations").value),

    "Curricular units 1st sem (approved)": Number(document.getElementById("approved").value),

    "Curricular units 1st sem (grade)": Number(document.getElementById("grade").value),

    "Curricular units 1st sem (without evaluations)": Number(document.getElementById("without_evaluations").value)
};



    // Validate values
    if (
        studentData.attendance < 0 ||
        studentData.attendance > 100 ||
        studentData.average_marks < 0 ||
        studentData.average_marks > 100 ||
        studentData.assignment_completion < 0 ||
        studentData.assignment_completion > 100 ||
        studentData.lms_activity < 0 ||
        studentData.previous_failures < 0 ||
        !Number.isInteger(studentData.previous_failures)
    ) {
        errorMessage.textContent = "Please enter valid student details.";
        return;
    }


    // Disable button while predicting
    predictBtn.disabled = true;
    predictBtn.textContent = "Analysing Student...";


    try {

        // Send POST request to Flask
        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(studentData)

        });


        // Read server response
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Prediction request failed.");
        }


        // Display prediction
        displayResult(data);


        // Update dashboard
        updateDashboard(data.risk_level);


    } catch (error) {

    console.error("Prediction error:", error);

    errorMessage.textContent = error.message;

    } finally {

        predictBtn.disabled = false;
        predictBtn.textContent = "Predict Student Risk →";

    }

});


// ======================================
// DISPLAY PREDICTION
// ======================================

function displayResult(data) {

    const resultCard = document.getElementById("resultCard");
    const emptyState = document.getElementById("emptyState");

    if (emptyState) {
        emptyState.hidden = true;
    }

    resultCard.hidden = false;

    document.getElementById("riskLevel").textContent = data.risk_level;

    document.getElementById("riskScore").textContent =
        data.dropout_probability + "%";


    // Display contributing factors
    const reasonsList = document.getElementById("reasonsList");

    reasonsList.replaceChildren();

    addListItems(reasonsList, data.reasons);


    // Display recommendations
    const recommendationsList =
        document.getElementById("recommendationsList");

    recommendationsList.replaceChildren();

    addListItems(recommendationsList, data.recommendations);

}


// Safely add text items to lists
function addListItems(list, items) {

    if (!Array.isArray(items) || items.length === 0) {

        const li = document.createElement("li");
        li.textContent = "No information provided by the backend.";
        list.appendChild(li);

        return;
    }

    items.forEach(item => {

        const li = document.createElement("li");
        li.textContent = String(item);
        list.appendChild(li);

    });

}


// ======================================
// UPDATE DASHBOARD
// ======================================

function updateDashboard(riskLevel) {

    totalCount++;

    const risk = String(riskLevel).toLowerCase();

    if (risk.includes("low")) {
        lowCount++;
    }

    else if (risk.includes("medium")) {
        mediumCount++;
    }

    else if (risk.includes("high")) {
        highCount++;
    }

    document.getElementById("totalCount").textContent = totalCount;

    document.getElementById("lowCount").textContent = lowCount;

    document.getElementById("mediumCount").textContent = mediumCount;

    document.getElementById("highCount").textContent = highCount;

}


// ======================================
// CLEAR FORM
// ======================================

form.addEventListener("reset", function() {

    errorMessage.textContent = "";

    resultCard.hidden = true;
    emptyState.hidden = false;

});
