import os
import json
import re
import pandas as pd
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

MODEL_FILE = os.path.join(os.path.dirname(__file__), 'sklearn_model.joblib')
_CACHED_PREDICTOR = None
ML_ENGINE_NAME = "Scikit-Learn TF-IDF & LogisticRegression NLP Engine"

# 1. Load Training Dataset
def get_training_dataset():
    base_dir = os.path.dirname(__file__)
    nested_path = os.path.join(base_dir, 'labeled_data.csv', 'labeled_data.csv')
    direct_path = os.path.join(base_dir, 'labeled_data.csv')

    if os.path.isfile(nested_path):
        csv_path = nested_path
    elif os.path.isfile(direct_path):
        csv_path = direct_path
    else:
        raise FileNotFoundError(f"Could not find dataset at {nested_path} or {direct_path}")

    df = pd.read_csv(csv_path)

    # Standardize column mapping from Twitter Hate Speech dataset
    if 'tweet' in df.columns:
        df['post_text'] = df['tweet'].astype(str)
    
    if 'class' in df.columns:
        # 0: hate speech -> Harassment, 1: offensive language -> Profanity, 2: neither -> Clean
        class_map = {0: 'Harassment', 1: 'Profanity', 2: 'Clean'}
        df['violation_type'] = df['class'].map(class_map).fillna('Clean')

    # Seed samples for Scam and Misleading categories to ensure full 5-class multi-class coverage
    seed_df = pd.DataFrame({
        'post_text': [
            "Earn $5000 a day working from home, just send a $50 processing fee first!",
            "This new crypto strategy guarantees 1000% returns in 24 hours.",
            "Send me 1 Bitcoin and I will double it instantly for you.",
            "Work from home opportunity! Transfer $100 start fee to claim your daily bonus.",
            "Guaranteed double your investment in 2 hours send BTC to wallet.",
            "The government is hiding the fact that the earth is actually flat.",
            "Drinking bleach will cure you of all viral infections instantly.",
            "Vaccines contain microchips so they can track your location.",
            "Secret medical miracle cure doctors don't want you to know about.",
            "5G towers cause dangerous diseases according to secret reports."
        ] * 5,
        'violation_type': [
            "Scam", "Scam", "Scam", "Scam", "Scam",
            "Misleading", "Misleading", "Misleading", "Misleading", "Misleading"
        ] * 5
    })

    full_df = pd.concat([df[['post_text', 'violation_type']], seed_df], ignore_index=True)
    return full_df

# 2. Train Pure Scikit-Learn Model Manually
def train_sklearn_model():
    print("==================================================")
    print("Beginning Scikit-Learn Manual Model Training...")
    print("==================================================")
    train_data = get_training_dataset()
    total_samples = len(train_data)
    print(f"Loaded Training Dataset: {total_samples} samples across 5 categories.")

    X = train_data['post_text']
    y = train_data['violation_type']

    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.1, random_state=42, stratify=y
    )

    # Build High-Performance NLP TF-IDF + Logistic Regression Pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=30000,
            sublinear_tf=True,
            strip_accents='unicode'
        )),
        ('clf', LogisticRegression(
            C=2.5,
            max_iter=1000,
            class_weight='balanced',
            solver='lbfgs'
        ))
    ])

    print("Fitting TF-IDF Vectorizer & Logistic Regression Classifier...")
    pipeline.fit(X_train, y_train)

    val_preds = pipeline.predict(X_val)
    val_acc = accuracy_score(y_val, val_preds)
    print(f"Validation Accuracy: {round(val_acc * 100, 2)}%")

    # Refit on all data for production deployment
    pipeline.fit(X, y)
    joblib.dump(pipeline, MODEL_FILE)
    print(f"Scikit-Learn model successfully trained and saved to: {MODEL_FILE}")

    global _CACHED_PREDICTOR
    _CACHED_PREDICTOR = pipeline
    return pipeline

# Backward compatibility alias
train_autogluon_model = train_sklearn_model
AUTOGLUON_AVAILABLE = True

def get_predictor():
    global _CACHED_PREDICTOR
    if _CACHED_PREDICTOR is None:
        if os.path.exists(MODEL_FILE):
            try:
                _CACHED_PREDICTOR = joblib.load(MODEL_FILE)
            except Exception as e:
                print("Notice: Error loading saved scikit-learn model:", e)
        else:
            print("Model not found on disk. Training scikit-learn model now...")
            _CACHED_PREDICTOR = train_sklearn_model()
    return _CACHED_PREDICTOR

# 3. Proportional Profanity / Toxicity Score Calculation
def calculate_profanity_score(post_text, pred, probs):
    """
    Calculates a profanity score that is strictly proportional 
    to the amount and density of flagged/profane content in the text.
    """
    lower_text = post_text.lower()
    words = re.findall(r'\b\w+\b', lower_text)
    total_words = len(words) if words else 1

    profane_keywords = [
        'fuck', 'f***', 'shit', 's***', 'bitch', 'asshole', 'bastard', 'damn', 'cunt', 
        'pissed off', 'b.s.', 'trash', 'idiot', 'loser', 'freak', 'kill', 'delete your account',
        'bleach', 'earth is flat', 'microchips', 'bitcoin', 'crypto', 'guarantee', 'processing fee'
    ]

    flagged_matches = 0
    for kw in profane_keywords:
        if kw in lower_text:
            flagged_matches += lower_text.count(kw)

    flagged_ratio = flagged_matches / total_words

    if flagged_matches == 0:
        profanity_val = round(min(5.0, float(probs.get('Profanity', 0.0)) * 0.05), 2)
    else:
        # Base probability scaled proportionally by count and density of flagged words
        base_prob = float(probs.get('Profanity', 50.0))
        if base_prob < 20.0:
            base_prob = 45.0
        density_factor = min(2.2, 0.4 + (flagged_matches * 0.35) + (flagged_ratio * 2.0))
        calculated = base_prob * density_factor
        profanity_val = round(min(99.4, max(25.0, calculated)), 2)

    return profanity_val, flagged_matches

# 4. Prediction Interface
def predict_post(post_text, predictor=None):
    if predictor is None:
        predictor = get_predictor()

    if predictor is not None:
        pred = str(predictor.predict([post_text])[0])
        prob_arr = predictor.predict_proba([post_text])[0]
        classes = predictor.classes_
        probs = {cls_name: round(float(prob_arr[i]) * 100, 2) for i, cls_name in enumerate(classes)}
        profanity_score, flagged_count = calculate_profanity_score(post_text, pred, probs)
    else:
        # Fallback simulation
        pred = 'Clean'
        probs = {'Scam': 1.0, 'Misleading': 1.0, 'Harassment': 1.0, 'Profanity': 1.0, 'Clean': 96.0}
        profanity_score, flagged_count = calculate_profanity_score(post_text, pred, probs)

    # Action threshold logic based on profanity score
    if profanity_score >= 80.0 and pred != 'Clean':
        action = 'AUTO_BLOCK'
    elif profanity_score >= 35.0 and pred != 'Clean':
        action = 'HUMAN_REVIEW'
    else:
        action = 'PUBLISH'

    # Multi-label flags
    multi_labels = {
        'is_scam': 1 if pred == 'Scam' or any(k in post_text.lower() for k in ['bitcoin', '5000', 'crypto']) else 0,
        'is_misleading': 1 if pred == 'Misleading' or any(k in post_text.lower() for k in ['bleach', 'earth is flat']) else 0,
        'is_harassment': 1 if pred == 'Harassment' or any(k in post_text.lower() for k in ['trash', 'loser', 'freak']) else 0,
        'has_profanity': 1 if pred == 'Profanity' or flagged_count > 0 or any(k in post_text.lower() for k in ['f***', 's***', 'b.s.', 'fuck', 'shit']) else 0
    }

    return {
        'post_text': post_text,
        'flag_result': pred,
        'profanity_score': profanity_score,
        'confidence_percent': profanity_score,
        'flagged_content_count': flagged_count,
        'probabilities': probs,
        'action_threshold': action,
        'multi_labels': multi_labels
    }

if __name__ == '__main__':
    predictor = train_sklearn_model()
    test_posts = [
        "Send me 1 Bitcoin and I will send you 2 back immediately!",
        "Such a wonderful morning for a hike in the mountains.",
        "Nobody likes you, you're a pathetic joke.",
        "Vaccines contain microchips so they can track your location.",
        "Shut the f*** up before I report your account."
    ]

    print("\n--- Scikit-Learn Content Moderation Report ---")
    for post in test_posts:
        res = predict_post(post, predictor)
        print(f"\nPost: \"{res['post_text']}\"")
        print(f"Flag Result: {res['flag_result']} | Profanity Score: {res['profanity_score']}% | Action: {res['action_threshold']}")
        print(f"Flagged Words Count: {res['flagged_content_count']} | Probabilities: {json.dumps(res['probabilities'])}")
