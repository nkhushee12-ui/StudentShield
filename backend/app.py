
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load trained ML model
MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "models",
    "dropout_model.joblib"
)

model = joblib.load(MODEL_PATH)

print("StudentShield AI model loaded successfully!")

# Features used during model training
FEATURES = [
    "Age at enrollment",
    "Debtor",
    "Tuition fees up to date",
    "Scholarship holder",
    "Curricular units 1st sem (credited)",
    "Curricular units 1st sem (enrolled)",
    "Curricular units 1st sem (evaluations)",
    "Curricular units 1st sem (approved)",
    "Curricular units 1st sem (grade)",
    "Curricular units 1st sem (without evaluations)"
]


@app.route("/")
def home():
    return jsonify({
        "message": "Welcome to StudentShield AI API",
        "status": "Running"
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": True
    })


@app.route("/predict", methods=["POST"])
def predict():

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "error": "Please provide student details"
            }), 400

        # Check for missing features
        missing = [f for f in FEATURES if f not in data]

        if missing:
            return jsonify({
                "error": "Missing input features",
                "missing_features": missing
            }), 400

        # Convert input into model format
        input_data = pd.DataFrame(
            [[float(data[f]) for f in FEATURES]],
            columns=FEATURES
        )

        # Predict student outcome
        prediction = model.predict(input_data)[0]

        # Get prediction probabilities
        probabilities = model.predict_proba(input_data)[0]

        probability_map = {
            str(label): round(float(prob) * 100, 2)
            for label, prob in zip(model.classes_, probabilities)
        }

        dropout_probability = probability_map.get("Dropout", 0.0)

        # Risk category based on dropout probability
        if dropout_probability >= 70:
            risk_level = "High"
        elif dropout_probability >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return jsonify({
            "success": True,
            "predicted_outcome": str(prediction),
            "dropout_probability": dropout_probability,
            "risk_level": risk_level,
            "probabilities": probability_map
        })

    except (TypeError, ValueError):
        return jsonify({
            "error": "All input values must be valid numbers"
        }), 400

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)

