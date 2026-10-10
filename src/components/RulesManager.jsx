import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Check, 
  AlertCircle, 
  Settings, 
  Filter,
  ShieldCheck,
  Save,
  Sparkles,
  Server,
  Globe
} from 'lucide-react';
import { suggestPolicyRulesWithGemini } from '../services/geminiService';

export default function RulesManager({ rulesConfig, onUpdateRules, isServerSynced, apiKey }) {
  const [config, setConfig] = useState({ ...rulesConfig });
  const [newKeyword, setNewKeyword] = useState('');
  const [saveMessage, setSaveMessage] = useState(false);
  
  // Sync state if rulesConfig changes from parent/server
  useEffect(() => {
    setConfig({ ...rulesConfig });
  }, [rulesConfig]);

  // AI policy generator state
  const [platformType, setPlatformType] = useState('Crypto & Fintech Community');
  const [strictnessLevel, setStrictnessLevel] = useState('BALANCED');
  const [isGeneratingPolicy, setIsGeneratingPolicy] = useState(false);
  const [aiPolicyResult, setAiPolicyResult] = useState(null);

  const handleToggleRegex = () => {
    const updated = { ...config, regexFilterEnabled: !config.regexFilterEnabled };
    setConfig(updated);
    onUpdateRules(updated);
  };

  const handleAddKeyword = (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    if (config.customKeywords.includes(newKeyword.trim())) return;

    const updated = {
      ...config,
      customKeywords: [...config.customKeywords, newKeyword.trim()]
    };
    setConfig(updated);
    onUpdateRules(updated);
    setNewKeyword('');
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2500);
  };

  const handleRemoveKeyword = (kwToRemove) => {
    const updated = {
      ...config,
      customKeywords: config.customKeywords.filter(k => k !== kwToRemove)
    };
    setConfig(updated);
    onUpdateRules(updated);
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 2500);
  };

  const handleGenerateAiPolicy = async () => {
    setIsGeneratingPolicy(true);
    try {
      const res = await suggestPolicyRulesWithGemini({
        platformType,
        strictnessLevel,
        apiKey
      });
      setAiPolicyResult(res);

      if (res.data) {
        const newKws = res.data.recommendedKeywords || [];
        const mergedKws = Array.from(new Set([...config.customKeywords, ...newKws]));
        const updated = {
          ...config,
          autoBlockScoreThreshold: res.data.autoBlockThreshold || config.autoBlockScoreThreshold,
          reviewQueueScoreThreshold: res.data.reviewQueueThreshold || config.reviewQueueScoreThreshold,
          customKeywords: mergedKws
        };
        setConfig(updated);
        onUpdateRules(updated);
      }
    } catch (err) {
      console.error('AI Policy generation error:', err);
    } finally {
      setIsGeneratingPolicy(false);
    }
  };

  const handleSave = () => {
    onUpdateRules(config);
    setSaveMessage(true);
    setTimeout(() => setSaveMessage(false), 3000);
  };

  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h2>Moderation Rules & Policy Manager</h2>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              background: isServerSynced ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isServerSynced ? '#10b981' : '#f59e0b',
              border: `1px solid ${isServerSynced ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              <Globe size={12} />
              {isServerSynced ? 'Central Server Sync Active (All Devices Shared)' : 'Local Storage Cache Mode'}
            </span>
          </div>
          <p>Configure automated rule triggers, adjust sensitivity score thresholds, and manage custom blacklisted phrase filters synced centrally.</p>
        </div>

        <button className="btn btn-primary" onClick={handleSave}>
          <Save size={18} />
          <span>{saveMessage ? 'Synced to Server Database!' : 'Save & Sync Rules'}</span>
        </button>
      </div>

      {/* AI Policy Generator Assistant Banner */}
      <div className="card ai-policy-banner mb-4">
        <div className="card-title">
          <Sparkles size={20} className="icon-purple" />
          <span>Gemini AI Policy & Threshold Generator</span>
        </div>
        <p className="card-desc">Auto-configure threshold limits and industry-tailored keywords using Google AI Studio Gemini model.</p>
        
        <div className="ai-policy-controls">
          <div className="form-group inline-group">
            <label>Platform Niche:</label>
            <select 
              className="select-input" 
              value={platformType} 
              onChange={(e) => setPlatformType(e.target.value)}
            >
              <option value="Crypto & Fintech Community">Crypto & Fintech Community</option>
              <option value="Gaming & Esports Community">Gaming & Esports Community</option>
              <option value="Healthcare & Wellness Forum">Healthcare & Wellness Forum</option>
              <option value="General Social Media Platform">General Social Media Platform</option>
            </select>
          </div>

          <div className="form-group inline-group">
            <label>Strictness Mode:</label>
            <select 
              className="select-input" 
              value={strictnessLevel} 
              onChange={(e) => setStrictnessLevel(e.target.value)}
            >
              <option value="BALANCED">Balanced Protection</option>
              <option value="STRICT">Strict / Zero Tolerance</option>
              <option value="PERMISSIVE">Permissive / Free Discussion</option>
            </select>
          </div>

          <button 
            className="btn btn-secondary"
            onClick={handleGenerateAiPolicy}
            disabled={isGeneratingPolicy}
          >
            <Sparkles size={16} />
            <span>{isGeneratingPolicy ? 'Generating Policy with Gemini...' : (apiKey ? 'Generate & Apply Gemini Policy' : 'Generate Policy (AI Simulator)')}</span>
          </button>
        </div>

        {aiPolicyResult && (
          <div className="ai-audit-box mt-3">
            <div className="ai-audit-header">
              <Check size={16} className="icon-green" />
              <strong>AI Policy Applied ({aiPolicyResult.source}):</strong>
            </div>
            <p>{aiPolicyResult.data?.policySummary}</p>
            {aiPolicyResult.data?.keyDirectives && (
              <ul className="directives-list">
                {aiPolicyResult.data.keyDirectives.map((dir, i) => (
                  <li key={i}>{dir}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="rules-config-grid">
        {/* Pipeline Controls & Thresholds Card */}
        <div className="card form-card">
          <div className="card-title">
            <Sliders size={20} className="icon-blue" />
            <span>Automated Pipeline Controls</span>
          </div>

          <div className="setting-toggle-item">
            <div>
              <h4>Step 1: Fast Regex & Keyword Matching</h4>
              <p>Immediately scans posts against hard-banned patterns & custom terms.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={config.regexFilterEnabled !== false}
                onChange={handleToggleRegex}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <hr className="divider" />

          <div className="setting-slider-group">
            <div className="slider-header">
              <label>Auto-Block Risk Score Threshold: <strong>{config.autoBlockScoreThreshold}%</strong></label>
              <span className="info-badge">Scores above this are auto-rejected</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="95" 
              className="range-input"
              value={config.autoBlockScoreThreshold}
              onChange={(e) => setConfig({ ...config, autoBlockScoreThreshold: parseInt(e.target.value) })}
            />
          </div>

          <div className="setting-slider-group">
            <div className="slider-header">
              <label>Review Queue Score Threshold: <strong>{config.reviewQueueScoreThreshold}%</strong></label>
              <span className="info-badge">Scores above this go to Human Review</span>
            </div>
            <input 
              type="range" 
              min="20" 
              max="70" 
              className="range-input"
              value={config.reviewQueueScoreThreshold}
              onChange={(e) => setConfig({ ...config, reviewQueueScoreThreshold: parseInt(e.target.value) })}
            />
          </div>

          <div className="setting-slider-group">
            <div className="slider-header">
              <label>ALL CAPS Shouting Threshold: <strong>{(config.capsRatioThreshold * 100).toFixed(0)}%</strong></label>
            </div>
            <input 
              type="range" 
              min="0.4" 
              max="0.9" 
              step="0.05"
              className="range-input"
              value={config.capsRatioThreshold}
              onChange={(e) => setConfig({ ...config, capsRatioThreshold: parseFloat(e.target.value) })}
            />
          </div>
        </div>

        {/* Custom Blacklist Keywords Card */}
        <div className="card form-card">
          <div className="card-title">
            <Filter size={20} className="icon-orange" />
            <span>Custom Blacklisted Keywords & Phrases ({config.customKeywords.length})</span>
          </div>

          <form onSubmit={handleAddKeyword} className="add-keyword-row">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Add new spam/harassment keyword..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary">
              <Plus size={18} />
              <span>Add Keyword</span>
            </button>
          </form>

          <div className="keywords-grid">
            {config.customKeywords.map((kw, i) => (
              <div key={i} className="keyword-chip-item">
                <span>{kw}</span>
                <button className="remove-kw-btn" onClick={() => handleRemoveKeyword(kw)}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
