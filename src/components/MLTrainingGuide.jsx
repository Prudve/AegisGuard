import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Code2, 
  Layers, 
  Zap, 
  RefreshCw, 
  Terminal, 
  Check, 
  Copy, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Server
} from 'lucide-react';

export default function MLTrainingGuide() {
  const [activeStep, setActiveStep] = useState('architecture');
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const steps = [
    { id: 'architecture', label: '1. Architecture & Pipeline', icon: Layers },
    { id: 'dataset', label: '2. Datasets & Annotation', icon: Database },
    { id: 'nlp-training', label: '3. Train NLP Text Model', icon: Code2 },
    { id: 'vision-training', label: '4. Train Image Moderation', icon: Sparkles },
    { id: 'deployment', label: '5. ONNX Export & FastAPI', icon: Server },
    { id: 'active-learning', label: '6. Active Learning Loop', icon: RefreshCw }
  ];

  const pythonNlpCode = `import torch
import torch.nn as nn
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from datasets import load_dataset

# 1. Load Pretrained Foundation Transformer (DeBERTa-v3 or RoBERTa)
MODEL_NAME = "microsoft/deberta-v3-base"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# 2. Load Datasets (Multi-label toxic comments + spam)
# Categories: [toxic, severe_toxic, obscene, threat, insult, identity_hate, spam, misleading]
dataset = load_dataset("civil_comments")

def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=256)

tokenized_datasets = dataset.map(tokenize_function, batched=True)

# 3. Define Multi-Label Classification Head
num_labels = 6
model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_NAME, 
    num_labels=num_labels, 
    problem_type="multi_label_classification"
)

# 4. Training Arguments
training_args = TrainingArguments(
    output_dir="./results_moderation_deberta",
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    per_device_eval_batch_size=32,
    num_train_epochs=4,
    weight_decay=0.01,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    fp16=True, # Enable GPU mixed precision
    logging_steps=100
)

# 5. Initialize HuggingFace Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["validation"]
)

# 6. Execute Fine-Tuning
print("Starting Custom Content Moderation Model Training...")
trainer.train()

# 7. Save Fine-Tuned Weights
model.save_pretrained("./my_custom_moderation_model")
tokenizer.save_pretrained("./my_custom_moderation_model")
print("Model fine-tuning complete!")`;

  const visionCode = `import torch
import torchvision.models as models
from torchvision import transforms
from PIL import Image

# 1. Build Image Moderation Model (ResNet50 / EfficientNet)
class ImageModerationNet(torch.nn.Module):
    def __init__(self, num_classes=4):
        super().__init__()
        # Pretrained ResNet backbone
        self.backbone = models.resnet50(pretrained=True)
        # Custom head: [Safe, NSFW_Explicit, Graphic_Violence, Spam_Meme]
        in_features = self.backbone.fc.in_features
        self.backbone.fc = torch.nn.Sequential(
            torch.nn.Linear(in_features, 512),
            torch.nn.ReLU(),
            torch.nn.Dropout(0.3),
            torch.nn.Linear(512, num_classes)
        )
        
    def forward(self, x):
        return self.backbone(x)

# 2. Image Preprocessing Transforms
image_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# 3. Load & Run Inference
model = ImageModerationNet(num_classes=4)
model.eval()

img = Image.open("sample_user_upload.jpg")
input_tensor = image_transforms(img).unsqueeze(0)

with torch.no_grad():
    outputs = model(input_tensor)
    probabilities = torch.softmax(outputs, dim=1)
    
labels = ["Safe", "NSFW_Explicit", "Graphic_Violence", "Spam_Meme"]
print({labels[i]: float(probabilities[0][i]) for i in range(len(labels))})`;

  const fastapiCode = `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import numpy as np

app = FastAPI(title="Custom ML Moderation Microservice")

# Load model onto GPU / CPU on startup
MODEL_PATH = "./my_custom_moderation_model"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()

class PostRequest(BaseModel):
    text: str
    user_id: str

LABEL_NAMES = ["toxic", "severe_toxic", "obscene", "threat", "insult", "spam"]

@app.post("/api/v1/moderate")
async def moderate_text(request: PostRequest):
    inputs = tokenizer(request.text, return_tensors="pt", truncation=True, max_length=256)
    
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.sigmoid(logits).squeeze().numpy()
        
    category_scores = {LABEL_NAMES[i]: float(probs[i]) for i in range(len(LABEL_NAMES))}
    max_score = max(category_scores.values())
    
    is_flagged = max_score > 0.50
    
    return {
        "status": "FLAGGED" if is_flagged else "APPROVED",
        "max_risk_score": round(max_score * 100, 2),
        "category_scores": category_scores,
        "recommendation": "REVIEW_QUEUE" if is_flagged else "PUBLISH"
    }`;

  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <h2>How to Build & Train Your Own ML Moderation Model</h2>
          <p>Comprehensive step-by-step production guide for replacing third-party APIs with custom fine-tuned PyTorch / Hugging Face models.</p>
        </div>
      </div>

      {/* Steps Navigation Bar */}
      <div className="ml-steps-bar">
        {steps.map(step => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          return (
            <button 
              key={step.id} 
              className={`ml-step-chip ${isActive ? 'active' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <Icon size={16} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      {activeStep === 'architecture' && (
        <div className="ml-guide-card card">
          <div className="card-title">
            <Layers size={20} className="icon-blue" />
            <span>Production ML Content Moderation Architecture</span>
          </div>

          <p className="guide-intro">
            While LLM API keys (like Gemini) provide instant contextual understanding, production platforms processing millions of daily posts often train custom lightweight ML models (such as <strong>DeBERTa-v3</strong> or <strong>DistilBERT</strong>) to reduce per-request latency below <strong>15ms</strong> and cut cloud hosting costs by over 90%.
          </p>

          <div className="architecture-diagram-box">
            <div className="diagram-step">
              <div className="diagram-node">User Post</div>
              <ArrowRight className="arrow-icon" />
            </div>

            <div className="diagram-step">
              <div className="diagram-node node-fast">Rule 1: Fast Regex Filter (&lt;2ms)</div>
              <ArrowRight className="arrow-icon" />
            </div>

            <div className="diagram-step">
              <div className="diagram-node node-ml">Rule 2: Custom Fine-Tuned Model (&lt;15ms)</div>
              <ArrowRight className="arrow-icon" />
            </div>

            <div className="diagram-step">
              <div className="diagram-node node-llm">Rule 3: LLM API Fallback (Edge Cases)</div>
              <ArrowRight className="arrow-icon" />
            </div>

            <div className="diagram-step">
              <div className="diagram-node node-action">Review Queue & Decision</div>
            </div>
          </div>

          <div className="guide-highlights-grid">
            <div className="highlight-box">
              <h4>⚡ Speed & Latency</h4>
              <p>Custom ONNX-quantized transformer models run in 8–15ms on CPU/GPU vs 500–1200ms for API calls.</p>
            </div>
            <div className="highlight-box">
              <h4>🔒 Privacy & Compliance</h4>
              <p>All sensitive user messages stay completely on your self-hosted infrastructure without sending data to third parties.</p>
            </div>
            <div className="highlight-box">
              <h4>💰 90%+ Cost Reduction</h4>
              <p>Self-hosting fine-tuned small models handles millions of requests for fixed GPU server cost.</p>
            </div>
          </div>
        </div>
      )}

      {activeStep === 'dataset' && (
        <div className="ml-guide-card card">
          <div className="card-title">
            <Database size={20} className="icon-orange" />
            <span>Dataset Selection & Annotation Strategy</span>
          </div>

          <p className="guide-intro">
            High quality training data is the foundation of an accurate moderation system. Combine open-source benchmarks with your platform's flagged post history.
          </p>

          <div className="datasets-table-wrap">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Dataset Name</th>
                  <th>Target Violation Category</th>
                  <th>Size</th>
                  <th>Recommended Use Case</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Jigsaw Civil Comments</strong></td>
                  <td>Toxicity, Harassment, Identity Attack, Obscenity</td>
                  <td>2M+ rows</td>
                  <td>Fine-tuning core toxicity text model</td>
                </tr>
                <tr>
                  <td><strong>SMS & Email Spam Corpus</strong></td>
                  <td>Promotional Spam, Financial Phishing, Bot links</td>
                  <td>15,000+ rows</td>
                  <td>Spam & scam detection head</td>
                </tr>
                <tr>
                  <td><strong>LIAR & Fake News Corpus</strong></td>
                  <td>Misleading claims, fake news statements</td>
                  <td>12,800+ rows</td>
                  <td>Misleading information detection</td>
                </tr>
                <tr>
                  <td><strong>OpenNSFW2 & Yahoo NSFW</strong></td>
                  <td>Inappropriate images, graphic content</td>
                  <td>100,000+ images</td>
                  <td>Computer vision image classifier</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeStep === 'nlp-training' && (
        <div className="ml-guide-card card">
          <div className="card-title">
            <Code2 size={20} className="icon-blue" />
            <span>Python Script: Fine-Tuning DeBERTa-v3 NLP Moderation Model</span>
          </div>

          <p className="guide-intro">
            Here is the complete PyTorch & Hugging Face script to train your custom multi-label text classifier:
          </p>

          <div className="code-block-container">
            <div className="code-block-header">
              <span className="code-lang"><Terminal size={14} /> train_moderation_model.py</span>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(pythonNlpCode, 'nlp')}
              >
                {copiedCodeId === 'nlp' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCodeId === 'nlp' ? 'Copied!' : 'Copy PyTorch Code'}</span>
              </button>
            </div>
            <pre className="code-snippet"><code>{pythonNlpCode}</code></pre>
          </div>
        </div>
      )}

      {activeStep === 'vision-training' && (
        <div className="ml-guide-card card">
          <div className="card-title">
            <Sparkles size={20} className="icon-orange" />
            <span>Python Script: Image Moderation Classifier (ResNet / PyTorch)</span>
          </div>

          <p className="guide-intro">
            Train a computer vision classifier for attached images (detecting explicit content, graphic violence, meme spam):
          </p>

          <div className="code-block-container">
            <div className="code-block-header">
              <span className="code-lang"><Terminal size={14} /> train_vision_moderator.py</span>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(visionCode, 'vision')}
              >
                {copiedCodeId === 'vision' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCodeId === 'vision' ? 'Copied!' : 'Copy Vision Code'}</span>
              </button>
            </div>
            <pre className="code-snippet"><code>{visionCode}</code></pre>
          </div>
        </div>
      )}

      {activeStep === 'deployment' && (
        <div className="ml-guide-card card">
          <div className="card-title">
            <Server size={20} className="icon-blue" />
            <span>Model Deployment via FastAPI & ONNX Runtime</span>
          </div>

          <p className="guide-intro">
            Deploy your trained model as an ultra-fast REST microservice endpoint using FastAPI:
          </p>

          <div className="code-block-container">
            <div className="code-block-header">
              <span className="code-lang"><Terminal size={14} /> app.py (FastAPI Microservice)</span>
              <button 
                className="copy-btn" 
                onClick={() => copyToClipboard(fastapiCode, 'fastapi')}
              >
                {copiedCodeId === 'fastapi' ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCodeId === 'fastapi' ? 'Copied!' : 'Copy Microservice Code'}</span>
              </button>
            </div>
            <pre className="code-snippet"><code>{fastapiCode}</code></pre>
          </div>
        </div>
      )}

      {activeStep === 'active-learning' && (
        <div className="ml-guide-card card">
          <div className="card-title">
            <RefreshCw size={20} className="icon-orange" />
            <span>Continuous Active Learning Loop</span>
          </div>

          <p className="guide-intro">
            Improve your custom model over time by feeding human moderator decisions and appeal overturns back into your training pipeline.
          </p>

          <div className="active-learning-flow">
            <div className="flow-step-item">
              <div className="step-badge">Phase 1</div>
              <h4>Log Human Overrides</h4>
              <p>Every time a human moderator approves a false positive or rejects a false negative, flag the item for retraining.</p>
            </div>

            <div className="flow-step-item">
              <div className="step-badge">Phase 2</div>
              <h4>Weekly Incremental Fine-Tuning</h4>
              <p>Run automated weekly fine-tuning jobs on new flagged edge cases.</p>
            </div>

            <div className="flow-step-item">
              <div className="step-badge">Phase 3</div>
              <h4>A/B Testing & Shadow Deployment</h4>
              <p>Run the newly trained model in shadow mode alongside the active model to compare precision before promoting to production.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
