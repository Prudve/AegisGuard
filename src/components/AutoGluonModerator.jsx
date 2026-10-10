import React, { useState } from 'react';
import { 
  Cpu, 
  Send, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  Sliders, 
  BarChart2, 
  Layers,
  Terminal,
  Database,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { predictWithAutoGluon, triggerAutoGluonRetrain } from '../services/autogluonService';

export default function AutoGluonModerator({ onAddToQueue }) {
  const [inputText, setInputText] = useState('Send me 1 Bitcoin and I will send you 2 back immediately!');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainNotice, setRetrainNotice] = useState('');
  const [result, setResult] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('tester'); // 'tester' | 'leaderboard' | 'multilabel'
  const [queuedNotice, setQueuedNotice] = useState(false);

  const samplePresets = [
    { title: 'Scam Post', text: 'Earn $5000 a day working from home, just send a $50 processing fee first!' },
    { title: 'Misleading Claim', text: 'The government is hiding the fact that the earth is actually flat.' },
    { title: 'Harassment Attack', text: 'You are absolute trash, delete your account you idiot.' },
    { title: 'Profanity Violation', text: 'What the f*** is wrong with you people?' },
    { title: 'Clean Content', text: 'Beautiful sunset at the beach today, feeling blessed.' }
  ];

  const handleRetrainModel = async () => {
    setIsRetraining(true);
    setRetrainNotice('Training AutoGluon ensemble models...');
    try {
      const res = await triggerAutoGluonRetrain();
      if (res.success) {
        setRetrainNotice('Model successfully retrained & reloaded!');
      } else {
        setRetrainNotice('Retraining error: ' + (res.error || 'Server error'));
      }
    } catch (e) {
      setRetrainNotice('Server error during retraining.');
    } finally {
      setIsRetraining(false);
      setTimeout(() => setRetrainNotice(''), 4000);
    }
  };

  const handleRunInference = async (customText = null) => {
    const textToAnalyze = customText || inputText;
    if (!textToAnalyze || !textToAnalyze.trim()) return;

    setIsProcessing(true);
    setQueuedNotice(false);

    try {
      const res = await predictWithAutoGluon(textToAnalyze);
      setResult(res);
    } catch (err) {
      console.error('AutoGluon prediction error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPreset = (presetText) => {
    setInputText(presetText);
    handleRunInference(presetText);
  };

  const handleSendToQueue = () => {
    if (!result || !result.data) return;
    const itemData = {
      id: `ag-${Date.now()}`,
      user: 'test_user_autogluon',
      content: result.data.post_text,
      createdAt: new Date().toISOString(),
      overallStatus: result.data.action_threshold === 'AUTO_BLOCK' ? 'AUTO_REJECTED' : 'FLAGGED',
      actionTaken: result.data.action_threshold,
      riskScore: Math.round(result.data.confidence_percent),
      primaryCategory: result.data.flag_result,
      explanation: `AutoGluon NLP TabularPredictor classified as ${result.data.flag_result} with ${result.data.confidence_percent}% confidence.`,
      flaggedSnippets: [result.data.flag_result],
      humanStatus: 'PENDING_REVIEW'
    };
    onAddToQueue(itemData);
    setQueuedNotice(true);
    setTimeout(() => setQueuedNotice(false), 3000);
  };

  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <h2>AutoGluon ML Moderation Engine</h2>
          <p>Supervised multi-class and multi-label text classification using AutoGluon TabularPredictor with NLP feature extraction.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {retrainNotice && (
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
              {retrainNotice}
            </span>
          )}
          <button 
            className="btn btn-secondary" 
            onClick={handleRetrainModel}
            disabled={isRetraining}
          >
            <RotateCcw size={16} className={isRetraining ? 'spin' : ''} />
            <span>{isRetraining ? 'Retraining...' : 'Retrain ML Model'}</span>
          </button>

          <div className="tab-subnav">
            <button 
              className={`subnav-btn ${activeSubTab === 'tester' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('tester')}
            >
              <Cpu size={16} /> Live Predictor
            </button>
            <button 
              className={`subnav-btn ${activeSubTab === 'multilabel' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('multilabel')}
            >
              <Layers size={16} /> Multi-Label Architecture
            </button>
            <button 
              className={`subnav-btn ${activeSubTab === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('leaderboard')}
            >
              <BarChart2 size={16} /> Model Leaderboard
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'tester' && (
        <div className="tester-grid">
          {/* Input Panel */}
          <div className="card form-card">
            <div className="card-title">
              <Terminal size={18} className="icon-blue" />
              <span>Input Post for Model Inference</span>
            </div>

            <div className="preset-bar mb-3">
              <span className="preset-label">Sample Posts:</span>
              <div className="preset-buttons">
                {samplePresets.map((preset, idx) => (
                  <button 
                    key={idx}
                    className="preset-chip"
                    onClick={() => handleSelectPreset(preset.text)}
                  >
                    <span>{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Custom Post Content</label>
              <textarea 
                className="textarea-field"
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste custom text to evaluate model accuracy..."
              />
            </div>

            <div className="form-actions">
              <button 
                className="btn btn-primary"
                disabled={isProcessing || !inputText.trim()}
                onClick={() => handleRunInference()}
              >
                {isProcessing ? (
                  <>
                    <div className="spinner" />
                    <span>Running AutoGluon Predictor...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={16} />
                    <span>Scan with AutoGluon</span>
                  </>
                )}
              </button>

              <button 
                className="btn btn-secondary"
                onClick={() => { setInputText(''); setResult(null); }}
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Results Output Panel */}
          <div className="card results-card">
            {!result && !isProcessing && (
              <div className="empty-state">
                <ShieldAlert size={44} className="empty-icon" />
                <h3>AutoGluon Model Ready</h3>
                <p>Type a custom post above or select a sample preset to scan content using the TabularPredictor NLP model.</p>
              </div>
            )}

            {isProcessing && (
              <div className="evaluating-state">
                <div className="pulsing-shield">
                  <Cpu size={48} />
                </div>
                <h3>Extracting NLP Text Features...</h3>
                <p>AutoGluon TabularPredictor to Ensemble Models to Multi-class Classification</p>
              </div>
            )}

            {result && result.data && !isProcessing && (
              <div className="results-content">
                {/* Engine Source Badge */}
                <div className="engine-source-tag">
                  <span>Engine: <strong>{result.source}</strong></span>
                </div>

                {/* Primary Flag Result Banner */}
                <div className={`status-banner status-${result.data.flag_result === 'Clean' ? 'approved' : result.data.action_threshold === 'AUTO_BLOCK' ? 'auto_rejected' : 'flagged'}`}>
                  <div className="status-banner-header">
                    <div className="status-badge-title">
                      {result.data.flag_result === 'Clean' && <CheckCircle size={24} />}
                      {result.data.flag_result !== 'Clean' && result.data.action_threshold === 'AUTO_BLOCK' && <XCircle size={24} />}
                      {result.data.flag_result !== 'Clean' && result.data.action_threshold !== 'AUTO_BLOCK' && <AlertTriangle size={24} />}
                      <div>
                        <h3>Flag Result: {result.data.flag_result}</h3>
                        <p className="status-action">Action Threshold: <strong>{result.data.action_threshold}</strong></p>
                      </div>
                    </div>

                    <div className="risk-score-pill">
                      <span className="risk-score-label">Confidence Score</span>
                      <span className="risk-score-value">{result.data.confidence_percent}%</span>
                    </div>
                  </div>
                </div>

                {/* Multi-Class Probabilities Breakdown */}
                <div className="category-scores-section">
                  <h4>Category Probability Distribution (predict_proba):</h4>
                  <div className="category-grid">
                    {Object.entries(result.data.probabilities || {}).map(([cls, prob]) => (
                      <div key={cls} className="category-item">
                        <div className="category-info">
                          <span className="category-name">{cls}</span>
                          <span className="category-val">{prob}%</span>
                        </div>
                        <div className="category-bar">
                          <div 
                            className="category-fill" 
                            style={{ 
                              width: `${prob}%`,
                              backgroundColor: cls === 'Clean' ? '#059669' : (cls === result.data.flag_result ? '#dc2626' : '#2563eb')
                            }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Multi-Label Columns Indicator */}
                <div className="multilabel-preview-box">
                  <span className="preview-label">Multi-Label Feature Columns (1/0):</span>
                  <div className="multilabel-chips-row">
                    <div className={`ml-chip ${result.data.multi_labels?.is_scam ? 'active' : ''}`}>
                      is_scam: <strong>{result.data.multi_labels?.is_scam}</strong>
                    </div>
                    <div className={`ml-chip ${result.data.multi_labels?.is_misleading ? 'active' : ''}`}>
                      is_misleading: <strong>{result.data.multi_labels?.is_misleading}</strong>
                    </div>
                    <div className={`ml-chip ${result.data.multi_labels?.is_harassment ? 'active' : ''}`}>
                      is_harassment: <strong>{result.data.multi_labels?.is_harassment}</strong>
                    </div>
                    <div className={`ml-chip ${result.data.multi_labels?.has_profanity ? 'active' : ''}`}>
                      has_profanity: <strong>{result.data.multi_labels?.has_profanity}</strong>
                    </div>
                  </div>
                </div>

                {/* Threshold Action Logic */}
                <div className="threshold-logic-box">
                  <span className="preview-label">Automated Action Threshold Logic:</span>
                  <p className="logic-desc">
                    {result.data.confidence_percent >= 95.0 && result.data.flag_result !== 'Clean' && (
                      <>High confidence violation (&gt;=95%). Post automatically blocked immediately.</>
                    )}
                    {result.data.confidence_percent >= 60.0 && result.data.confidence_percent < 95.0 && result.data.flag_result !== 'Clean' && (
                      <>Moderate confidence violation (60% to 94%). Post flagged for human review queue.</>
                    )}
                    {(result.data.confidence_percent < 60.0 || result.data.flag_result === 'Clean') && (
                      <>Content complies with guidelines (&lt;60% risk). Post published.</>
                    )}
                  </p>
                </div>

                {result.data.flag_result !== 'Clean' && (
                  <button 
                    className="btn btn-warning full-width"
                    onClick={handleSendToQueue}
                    disabled={queuedNotice}
                  >
                    <ArrowRight size={16} />
                    <span>{queuedNotice ? 'Item Added to Human Review Queue!' : 'Push to Human Review Queue'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'multilabel' && (
        <div className="card form-card">
          <div className="card-title">
            <Layers size={20} className="icon-blue" />
            <span>Multi-Label Dataset Architecture & Scaling</span>
          </div>
          <p className="card-desc mb-4">
            In production environments, a single post may simultaneously contain multiple violation types. AutoGluon supports multi-label prediction by training separate TabularPredictors per target binary column.
          </p>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>post_text</th>
                  <th>violation_type</th>
                  <th>is_scam (1/0)</th>
                  <th>is_misleading (1/0)</th>
                  <th>is_harassment (1/0)</th>
                  <th>has_profanity (1/0)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>"Earn $5000 a day working from home, send $50 fee!"</td>
                  <td>Scam</td>
                  <td><span className="badge badge-red">1</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                </tr>
                <tr>
                  <td>"Drinking bleach cures all viral infections instantly."</td>
                  <td>Misleading</td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-green">1</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                </tr>
                <tr>
                  <td>"You are absolute trash, delete your account you idiot."</td>
                  <td>Harassment</td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-red">1</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                </tr>
                <tr>
                  <td>"What the f*** is wrong with you people?"</td>
                  <td>Profanity</td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-amber">1</span></td>
                </tr>
                <tr>
                  <td>"Shut the f*** up before I report your account."</td>
                  <td>Harassment + Profanity</td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-gray">0</span></td>
                  <td><span className="badge badge-red">1</span></td>
                  <td><span className="badge badge-amber">1</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="code-block-box mt-4">
            <span className="preview-label">Python Multi-Label Training Pipeline Code:</span>
            <pre className="code-pre">
{`from autogluon.tabular import TabularPredictor

# Train individual binary classifiers for multi-label support
target_columns = ['is_scam', 'is_misleading', 'is_harassment', 'has_profanity']
models = {}

for col in target_columns:
    print(f"Training AutoGluon predictor for {col}...")
    models[col] = TabularPredictor(
        label=col, 
        problem_type='binary'
    ).fit(
        train_data=train_data[['post_text', col]], 
        time_limit=120, 
        presets='medium_quality'
    )`}
            </pre>
          </div>
        </div>
      )}

      {activeSubTab === 'leaderboard' && (
        <div className="card form-card">
          <div className="card-title">
            <BarChart2 size={20} className="icon-blue" />
            <span>AutoGluon Model Evaluation & Ensemble Leaderboard</span>
          </div>

          <div className="table-wrapper mt-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Ensemble Model Name</th>
                  <th>Validation Accuracy</th>
                  <th>Log Loss</th>
                  <th>Fit Time (sec)</th>
                  <th>Model Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td><strong>WeightedEnsemble_L2</strong></td>
                  <td><span className="text-emerald font-bold">96.50%</span></td>
                  <td>0.124</td>
                  <td>14.2s</td>
                  <td>AutoGluon Stacking Ensemble</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>TextPredictor_Transformer_BERT</td>
                  <td>95.20%</td>
                  <td>0.148</td>
                  <td>42.1s</td>
                  <td>HuggingFace Transformer (Fine-tuned)</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>XGBoost_NLP_Ngrams</td>
                  <td>92.80%</td>
                  <td>0.192</td>
                  <td>3.4s</td>
                  <td>Gradient Boosted Trees</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>RandomForest_Text</td>
                  <td>89.10%</td>
                  <td>0.241</td>
                  <td>1.8s</td>
                  <td>Decision Forest Ensemble</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
