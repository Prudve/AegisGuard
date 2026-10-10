import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ShieldAlert, 
  Cpu, 
  Clock, 
  Info,
  ArrowRight,
  UploadCloud,
  FileText
} from 'lucide-react';
import { PRESET_TEST_CASES } from '../data/mockData';
import { runModerationPipeline } from '../services/moderationEngine';

export default function LiveModerator({ rulesConfig, apiKey, onAddToQueue }) {
  const [inputText, setInputText] = useState(PRESET_TEST_CASES[0].text);
  const [imageUrl, setImageUrl] = useState(PRESET_TEST_CASES[0].imageUrl || '');
  const [username, setUsername] = useState('demo_user_42');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [addedToQueueMessage, setAddedToQueueMessage] = useState(false);

  const handleSelectPreset = (preset) => {
    setInputText(preset.text);
    setImageUrl(preset.imageUrl || '');
    setUsername(preset.user || 'demo_user_42');
    setResult(null);
    setAddedToQueueMessage(false);
  };

  const handleRunModeration = async () => {
    if (!inputText.trim() && !imageUrl.trim()) return;

    setIsProcessing(true);
    setAddedToQueueMessage(false);
    
    try {
      const evalResult = await runModerationPipeline(
        { text: inputText, imageUrl, user: username },
        rulesConfig,
        apiKey
      );
      setResult(evalResult);
    } catch (err) {
      console.error('Moderation error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendToQueue = () => {
    if (!result) return;
    onAddToQueue(result);
    setAddedToQueueMessage(true);
    setTimeout(() => setAddedToQueueMessage(false), 4000);
  };

  const renderSnippetHighlighter = (text, snippets) => {
    if (!snippets || snippets.length === 0) return <span>{text}</span>;

    // Highlight text snippets
    let parts = [text];
    snippets.forEach(snippet => {
      let nextParts = [];
      parts.forEach(part => {
        if (typeof part !== 'string') {
          nextParts.push(part);
          return;
        }
        const index = part.toLowerCase().indexOf(snippet.toLowerCase());
        if (index !== -1) {
          const before = part.slice(0, index);
          const match = part.slice(index, index + snippet.length);
          const after = part.slice(index + snippet.length);
          if (before) nextParts.push(before);
          nextParts.push(
            <mark key={Math.random()} className="snippet-mark">
              {match}
            </mark>
          );
          if (after) nextParts.push(after);
        } else {
          nextParts.push(part);
        }
      });
      parts = nextParts;
    });

    return <>{parts}</>;
  };

  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <h2>Automated Moderation Pipeline Engine</h2>
          <p>Test real-time content evaluation across fast regex rules, heuristic scoring, and Gemini AI context analysis.</p>
        </div>
      </div>

      {/* Preset sample test cases */}
      <div className="preset-bar">
        <span className="preset-label">Quick Test Presets:</span>
        <div className="preset-buttons">
          {PRESET_TEST_CASES.map(preset => (
            <button 
              key={preset.id}
              className="preset-chip"
              onClick={() => handleSelectPreset(preset)}
            >
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tester-grid">
        {/* Input Form Column */}
        <div className="card form-card">
          <div className="card-title">
            <FileText size={20} className="icon-blue" />
            <span>Content Submission Form</span>
          </div>

          <div className="form-group">
            <label>Author Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. user_123"
            />
          </div>

          <div className="form-group">
            <label>Post Content Text</label>
            <textarea 
              className="textarea-field"
              rows={5}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to analyze for spam, harassment, or fake news..."
            />
          </div>

          <div className="form-group">
            <label>Optional Image Attachment URL</label>
            <div className="input-with-icon">
              <UploadCloud size={18} className="input-icon" />
              <input 
                type="text" 
                className="input-field icon-input"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or image link"
              />
            </div>
            {imageUrl && (
              <div className="image-preview-box">
                <img src={imageUrl} alt="Attached preview" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button 
              className="btn btn-primary"
              disabled={isProcessing || (!inputText.trim() && !imageUrl.trim())}
              onClick={handleRunModeration}
            >
              {isProcessing ? (
                <>
                  <div className="spinner" />
                  <span>Evaluating Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Run Moderation Rules</span>
                </>
              )}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => { setInputText(''); setImageUrl(''); setResult(null); }}
            >
              <RotateCcw size={16} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Results & Execution Trace Column */}
        <div className="card results-card">
          {!result && !isProcessing && (
            <div className="empty-state">
              <ShieldAlert size={48} className="empty-icon" />
              <h3>Ready to Evaluate</h3>
              <p>Click a preset sample above or type custom text, then hit <strong>"Run Moderation Rules"</strong> to view real-time rule execution logs.</p>
            </div>
          )}

          {isProcessing && (
            <div className="evaluating-state">
              <div className="pulsing-shield">
                <ShieldAlert size={56} />
              </div>
              <h3>Running Automated Rule Chain...</h3>
              <p>Executing Regex Filter → Heuristic Analysis → AI Contextual Engine</p>
            </div>
          )}

          {result && !isProcessing && (
            <div className="results-content">
              {/* Overall Decision Banner */}
              <div className={`status-banner status-${result.overallStatus.toLowerCase()}`}>
                <div className="status-banner-header">
                  <div className="status-badge-title">
                    {result.overallStatus === 'APPROVED' && <CheckCircle size={24} />}
                    {result.overallStatus === 'FLAGGED' && <AlertTriangle size={24} />}
                    {result.overallStatus === 'AUTO_REJECTED' && <XCircle size={24} />}
                    <div>
                      <h3>Decision: {result.overallStatus.replace('_', ' ')}</h3>
                      <p className="status-action">System Action: <strong>{result.actionTaken}</strong></p>
                    </div>
                  </div>
                  <div className="risk-score-pill">
                    <span className="risk-score-label">Risk Score</span>
                    <span className="risk-score-value">{result.riskScore}%</span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="risk-bar-container">
                  <div 
                    className="risk-bar-fill" 
                    style={{ 
                      width: `${result.riskScore}%`,
                      backgroundColor: result.riskScore > 80 ? '#ef4444' : result.riskScore > 40 ? '#f59e0b' : '#10b981'
                    }} 
                  />
                </div>
              </div>

              {/* Policy Category Radar / Breakdown */}
              <div className="category-scores-section">
                <h4>Category Risk Breakdown:</h4>
                <div className="category-grid">
                  {Object.entries(result.categories || {}).map(([cat, score]) => (
                    <div key={cat} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{cat.toUpperCase()}</span>
                        <span className="category-val">{score}%</span>
                      </div>
                      <div className="category-bar">
                        <div 
                          className="category-fill" 
                          style={{ 
                            width: `${score}%`,
                            backgroundColor: score > 70 ? '#ef4444' : score > 35 ? '#f59e0b' : '#3b82f6'
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clear Explanation Box */}
              <div className="explanation-box">
                <div className="explanation-title">
                  <Info size={18} className="icon-blue" />
                  <span>Rule Engine Explanation:</span>
                </div>
                <p>{result.explanation}</p>

                {result.flaggedSnippets && result.flaggedSnippets.length > 0 && (
                  <div className="flagged-snippets-list">
                    <span className="snippets-label">Flagged Signals / Triggered Keywords:</span>
                    <div className="chips-wrapper">
                      {result.flaggedSnippets.map((snippet, idx) => (
                        <span key={idx} className="snippet-chip">{snippet}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Text Snippet Highlighted Preview */}
              <div className="text-highlight-preview">
                <span className="preview-label">Content Highlight Trace:</span>
                <div className="highlighted-body">
                  {renderSnippetHighlighter(result.content, result.flaggedSnippets)}
                </div>
              </div>

              {/* Rule Chain Execution Trace */}
              <div className="rule-chain-section">
                <div className="rule-chain-header">
                  <Cpu size={18} />
                  <span>Automated Rule Execution Chain</span>
                  <span className="total-time"><Clock size={14} /> {result.totalDurationMs} ms total</span>
                </div>

                <div className="rule-steps-list">
                  {result.ruleChainLogs.map((log, index) => (
                    <div key={index} className="rule-step-card">
                      <div className="rule-step-num">{index + 1}</div>
                      <div className="rule-step-details">
                        <div className="rule-step-top">
                          <span className="rule-step-name">{log.ruleName}</span>
                          <span className={`rule-status-badge status-${log.status.toLowerCase()}`}>
                            {log.status}
                          </span>
                        </div>
                        <p className="rule-step-desc">{log.details}</p>
                        <span className="rule-step-time">{log.durationMs} ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Queue Dispatch Action */}
              <div className="dispatch-action-box">
                {result.overallStatus !== 'APPROVED' && (
                  <button 
                    className="btn btn-warning full-width"
                    onClick={handleSendToQueue}
                    disabled={addedToQueueMessage}
                  >
                    <ArrowRight size={18} />
                    <span>{addedToQueueMessage ? 'Item Sent to Human Review Queue!' : 'Push to Human Review Queue'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
