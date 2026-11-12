
import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# 1. Load dataset
df = pd.read_csv("data.csv", sep=";")

print("Dataset loaded successfully!")

# 2. Select input features
features = [
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

X = df[features]
y = df["Target"]

# 3. Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# 4. Create Random Forest model
model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced",
    min_samples_leaf=2
)

# 5. Train model
print("\nTraining Random Forest Model...")

model.fit(X_train, y_train)

# 6. Make predictions
y_pred = model.predict(X_test)

# 7. Evaluate model
accuracy = accuracy_score(y_test, y_pred)

print("\nMODEL TRAINING COMPLETED!")
print("Accuracy:", round(accuracy * 100, 2), "%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# 8. Save model
os.makedirs("models", exist_ok=True)

joblib.dump(model, "models/dropout_model.joblib")

print("\nModel saved successfully!")
print("Location: models/dropout_model.joblib")
print("\nStudentShield AI ML Model Ready!")


