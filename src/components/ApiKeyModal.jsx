import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveApiKey(keyInput.trim());
    onClose();
  };

  const handleTestKey = async () => {
    if (!keyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter a Gemini API Key to test.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Fast fetch test to Gemini API
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${keyInput.trim()}`);
      if (res.ok) {
        setTestResult({ success: true, message: 'Gemini API Key validated successfully!' });
      } else {
        const errJson = await res.json();
        setTestResult({ success: false, message: errJson.error?.message || 'Invalid API Key' });
      }
    } catch (err) {
      setTestResult({ success: false, message: 'Network error validating API Key' });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title">
            <Key className="icon-blue" size={22} />
            <h3>Configure Gemini API Key</h3>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            You can configure your Google Gemini API Key by adding <code>VITE_GEMINI_API_KEY=your_key</code> in your project's <code>.env</code> file, or enter your key directly below:
          </p>

          <div className="form-group">
            <label>Google Gemini API Key</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => {
                setKeyInput(e.target.value);
                setTestResult(null);
              }}
            />
          </div>

          {testResult && (
            <div className={`alert-box alert-${testResult.success ? 'success' : 'error'}`}>
              {testResult.success ? <Check size={16} /> : <ShieldAlert size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="modal-links">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noreferrer"
              className="external-link"
            >
              <ExternalLink size={14} /> Get a free Gemini API Key from Google AI Studio
            </a>
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleTestKey}
            disabled={isTesting}
          >
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSave}
          >
            <Sparkles size={16} /> Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
