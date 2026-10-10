import React, { useState } from 'react';
import { 
  MessageSquareDiff, 
  Send, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Clock, 
  RotateCcw,
  UserCheck,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { evaluateAppealWithGemini } from '../services/geminiService';

export default function AppealsCenter({ appeals, onCreateAppeal, onResolveAppeal, apiKey }) {
  const [activeSubTab, setActiveSubTab] = useState('user-submit'); // 'user-submit' | 'mod-review'
  
  // User submission form state
  const [userName, setUserName] = useState('sarcastic_gamer');
  const [postContent, setPostContent] = useState('I swear I will kill you in CS:GO if you don\'t drop me an AWP next round haha!');
  const [flagReason, setFlagReason] = useState('Harassment / Violent Language');
  const [appealJustification, setAppealJustification] = useState('This was gaming banter regarding Counter-Strike (CS:GO). I was talking about in-game mechanics with my teammate, not real life violence!');

  const [selectedAppealId, setSelectedAppealId] = useState(appeals[0]?.id || null);
  const [modReason, setModReason] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const selectedAppeal = appeals.find(a => a.id === selectedAppealId) || appeals[0] || null;

  const handleRunAiEvaluation = async () => {
    if (!selectedAppeal) return;
    setIsEvaluating(true);
    try {
      const res = await evaluateAppealWithGemini({
        originalContent: selectedAppeal.originalContent,
        flagReason: selectedAppeal.flagReason,
        appealReason: selectedAppeal.appealReason,
        apiKey
      });
      setAiAnalysisResult(res);
      if (res.data?.suggestedModeratorNote) {
        setModReason(res.data.suggestedModeratorNote);
      }
    } catch (err) {
      console.error('AI Appeal Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSubmitUserAppeal = (e) => {
    e.preventDefault();
    if (!appealJustification.trim()) return;

    const newAppeal = {
      id: `appeal-${Date.now()}`,
      postId: `post-${Math.floor(Math.random() * 9000 + 1000)}`,
      user: userName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      originalContent: postContent,
      flagReason: flagReason,
      flagDate: new Date().toISOString(),
      appealReason: appealJustification,
      status: 'UNDER_REVIEW',
      moderatorDecisionReason: ''
    };

    onCreateAppeal(newAppeal);
    setSelectedAppealId(newAppeal.id);
    setActiveSubTab('mod-review');
    setAiAnalysisResult(null);
  };

  const handleResolve = (newStatus) => {
    if (!selectedAppeal) return;
    onResolveAppeal(selectedAppeal.id, {
      status: newStatus,
      moderatorDecisionReason: modReason.trim() || (newStatus === 'APPROVED_OVERTURNED' ? 'Appeal granted: Context verified.' : 'Appeal rejected: Policy upheld.')
    });
    setModReason('');
    setAiAnalysisResult(null);
  };

  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <h2>User Appeals & Disputes Center</h2>
          <p>Users can dispute automated moderation decisions. Moderators review context and restore posts or uphold decisions.</p>
        </div>

        <div className="subtab-toggle">
          <button 
            className={`subtab-btn ${activeSubTab === 'user-submit' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('user-submit')}
          >
            Submit New Appeal (User Portal)
          </button>
          <button 
            className={`subtab-btn ${activeSubTab === 'mod-review' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('mod-review')}
          >
            Moderator Appeal Queue ({appeals.filter(a => a.status === 'UNDER_REVIEW').length})
          </button>
        </div>
      </div>

      {activeSubTab === 'user-submit' ? (
        <div className="appeals-form-grid">
          <div className="card form-card">
            <div className="card-title">
              <MessageSquareDiff size={20} className="icon-blue" />
              <span>Submit a Moderation Decision Appeal</span>
            </div>

            <form onSubmit={handleSubmitUserAppeal}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Flagged Post Content</label>
                <textarea 
                  className="textarea-field"
                  rows={3}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Original Flag Category</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Your Appeal Explanation / Context</label>
                <textarea 
                  className="textarea-field"
                  rows={4}
                  placeholder="Explain why your post was wrongfully flagged (e.g. context, sarcasm, false positive)..."
                  value={appealJustification}
                  onChange={(e) => setAppealJustification(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary full-width">
                <Send size={18} />
                <span>Submit Appeal to Moderator Queue</span>
              </button>
            </form>
          </div>

          <div className="card info-card">
            <div className="card-title">
              <AlertCircle size={20} className="icon-orange" />
              <span>How Appeals Work</span>
            </div>
            <div className="info-steps">
              <div className="info-step">
                <span className="step-num">1</span>
                <div>
                  <h4>Automated Flag Review</h4>
                  <p>When content is flagged by AI or rules, users receive an explicit explanation of the violated policy.</p>
                </div>
              </div>

              <div className="info-step">
                <span className="step-num">2</span>
                <div>
                  <h4>Contextual Submission</h4>
                  <p>Users provide contextual clarification (e.g., gaming jargon, quotes, satirical intent).</p>
                </div>
              </div>

              <div className="info-step">
                <span className="step-num">3</span>
                <div>
                  <h4>Human Moderator Overturn</h4>
                  <p>A human moderator reviews the appeal. If approved, the post is unblocked immediately and AI model training data is logged.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="queue-layout">
          {/* Appeals List */}
          <div className="card queue-list-card">
            <div className="card-title">
              <MessageSquareDiff size={20} className="icon-blue" />
              <span>Appeals List ({appeals.length})</span>
            </div>

            <div className="queue-items-scroll">
              {appeals.map(appeal => (
                <div 
                  key={appeal.id}
                  className={`queue-item-card ${selectedAppeal?.id === appeal.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedAppealId(appeal.id);
                    setAiAnalysisResult(null);
                  }}
                >
                  <div className="queue-item-top">
                    <span className="user-name">@{appeal.user}</span>
                    <span className={`status-pill status-${appeal.status.toLowerCase()}`}>
                      {appeal.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="queue-item-snippet">Post: "{appeal.originalContent}"</p>
                  <span className="category-pill">{appeal.flagReason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Appeal Inspection */}
          <div className="card queue-workspace-card">
            {!selectedAppeal ? (
              <div className="empty-state">
                <ShieldAlert size={48} className="empty-icon" />
                <h3>Select an Appeal</h3>
              </div>
            ) : (
              <div className="workspace-content">
                <div className="workspace-header">
                  <div className="user-profile">
                    <img src={selectedAppeal.avatar} alt="" className="profile-avatar" />
                    <div>
                      <h3>Appeal from @{selectedAppeal.user}</h3>
                      <span className="post-date"><Clock size={12} /> {new Date(selectedAppeal.flagDate).toLocaleString()}</span>
                    </div>
                  </div>

                  <span className={`status-pill status-${selectedAppeal.status.toLowerCase()}`}>
                    {selectedAppeal.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="appeal-comparison-grid">
                  <div className="comparison-box flag-side">
                    <h4>Original Flagged Content & Reason</h4>
                    <p className="box-text">"{selectedAppeal.originalContent}"</p>
                    <span className="flag-tag">Flagged for: {selectedAppeal.flagReason}</span>
                  </div>

                  <div className="comparison-box appeal-side">
                    <h4>User's Appeal Justification</h4>
                    <p className="box-text">"{selectedAppeal.appealReason}"</p>
                  </div>
                </div>

                {/* AI Appeal Assistant Button & Analysis Box */}
                <div className="ai-appeal-eval-section">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={handleRunAiEvaluation}
                    disabled={isEvaluating}
                  >
                    <Sparkles size={14} />
                    <span>{isEvaluating ? 'Evaluating with Gemini...' : (apiKey ? 'Evaluate Appeal with Gemini AI' : 'Evaluate Appeal (AI Simulator)')}</span>
                  </button>

                  {aiAnalysisResult && (
                    <div className="ai-audit-box mt-3">
                      <div className="ai-audit-header">
                        <Sparkles size={16} className="icon-purple" />
                        <strong>AI Appeal Assessment ({aiAnalysisResult.source}):</strong>
                      </div>
                      <p>
                        <strong>Recommendation:</strong>{' '}
                        <span className={`risk-badge ${aiAnalysisResult.data?.recommendation === 'OVERTURN' ? 'risk-low' : 'risk-high'}`}>
                          {aiAnalysisResult.data?.recommendation}
                        </span>{' '}
                        (Confidence: {aiAnalysisResult.data?.confidenceScore}%)
                      </p>
                      <p className="ai-audit-opinion">{aiAnalysisResult.data?.contextAnalysis}</p>
                    </div>
                  )}
                </div>

                {selectedAppeal.moderatorDecisionReason && (
                  <div className="decision-reason-box">
                    <span>Moderator Decision Log:</span>
                    <p>{selectedAppeal.moderatorDecisionReason}</p>
                  </div>
                )}

                {selectedAppeal.status === 'UNDER_REVIEW' && (
                  <div className="moderator-actions-area">
                    <label className="input-label">Moderator Resolution Statement:</label>
                    <textarea 
                      className="textarea-field"
                      rows={2}
                      placeholder="Reason for overturning flag or upholding decision..."
                      value={modReason}
                      onChange={(e) => setModReason(e.target.value)}
                    />

                    <div className="action-buttons-row">
                      <button 
                        className="btn btn-success"
                        onClick={() => handleResolve('APPROVED_OVERTURNED')}
                      >
                        <CheckCircle2 size={18} />
                        <span>Overturn Decision (Restore Post)</span>
                      </button>

                      <button 
                        className="btn btn-danger"
                        onClick={() => handleResolve('REJECTED_UPHELD')}
                      >
                        <XCircle size={18} />
                        <span>Uphold Block (Reject Appeal)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
