import React, { useState } from 'react';
import { 
  Inbox, 
  Check, 
  X, 
  AlertTriangle, 
  Filter, 
  User, 
  Clock, 
  ShieldCheck, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  Send
} from 'lucide-react';
import { analyzeReviewQueueItemWithGemini } from '../services/geminiService';

export default function ReviewQueue({ queueItems, onUpdateQueueItem, apiKey }) {
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('PENDING_REVIEW');
  const [selectedItemId, setSelectedItemId] = useState(queueItems[0]?.id || null);
  const [moderatorNote, setModeratorNote] = useState('');
  const [aiAuditResult, setAiAuditResult] = useState(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const filteredItems = queueItems.filter(item => {
    const matchesCat = filterCategory === 'ALL' || item.primaryCategory?.toLowerCase().includes(filterCategory.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || item.humanStatus === filterStatus;
    return matchesCat && matchesStatus;
  });

  const selectedItem = queueItems.find(i => i.id === selectedItemId) || filteredItems[0] || null;

  const handleAction = (status) => {
    if (!selectedItem) return;
    onUpdateQueueItem(selectedItem.id, {
      humanStatus: status,
      moderatorNotes: moderatorNote.trim() || selectedItem.moderatorNotes || 'Processed by human moderator.'
    });
    setModeratorNote('');
    setAiAuditResult(null);
  };

  const handleRunAiAudit = async () => {
    if (!selectedItem) return;
    setIsAuditing(true);
    try {
      const res = await analyzeReviewQueueItemWithGemini({
        content: selectedItem.content,
        primaryCategory: selectedItem.primaryCategory,
        explanation: selectedItem.explanation,
        apiKey
      });
      setAiAuditResult(res);
      if (res.data?.auditNote) {
        setModeratorNote(res.data.auditNote);
      }
    } catch (err) {
      console.error('AI audit error:', err);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="tab-container">
      <div className="section-header">
        <div>
          <h2>Human Moderation Review Queue</h2>
          <p>Review content flagged by automated rules, verify clear explanations, and confirm, override, or escalate decisions.</p>
        </div>

        {/* Filters */}
        <div className="filter-bar">
          <div className="filter-group">
            <Filter size={16} />
            <select className="select-input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="Spam">Spam & Scams</option>
              <option value="Harassment">Harassment</option>
              <option value="Misleading">Misleading</option>
              <option value="NSFW">NSFW / Explicit</option>
            </select>
          </div>

          <div className="filter-group">
            <select className="select-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="APPROVED">Approved (Overridden)</option>
              <option value="REJECTED">Rejected (Confirmed Block)</option>
              <option value="ESCALATED">Escalated</option>
              <option value="ALL">All Statuses</option>
            </select>
          </div>
        </div>
      </div>

      <div className="queue-layout">
        {/* Queue Items List Column */}
        <div className="card queue-list-card">
          <div className="card-title">
            <Inbox size={20} className="icon-orange" />
            <span>Flagged Items ({filteredItems.length})</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <ShieldCheck size={40} className="empty-icon" />
              <h4>Queue is Empty</h4>
              <p>No flagged posts match your current filter settings.</p>
            </div>
          ) : (
            <div className="queue-items-scroll">
              {filteredItems.map(item => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <div 
                    key={item.id}
                    className={`queue-item-card ${isSelected ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setModeratorNote(item.moderatorNotes || '');
                      setAiAuditResult(null);
                    }}
                  >
                    <div className="queue-item-top">
                      <div className="user-pill">
                        <img src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} alt="" className="user-avatar" />
                        <span className="user-name">@{item.user}</span>
                      </div>
                      <span className={`risk-badge risk-${item.riskScore > 80 ? 'high' : 'medium'}`}>
                        {item.riskScore}% Risk
                      </span>
                    </div>

                    <p className="queue-item-snippet">{item.content}</p>

                    <div className="queue-item-footer">
                      <span className="category-pill">{item.primaryCategory}</span>
                      <span className={`status-pill status-${item.humanStatus?.toLowerCase()}`}>
                        {item.humanStatus?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Item Moderation Workspace */}
        <div className="card queue-workspace-card">
          {!selectedItem ? (
            <div className="empty-state">
              <MessageSquare size={48} className="empty-icon" />
              <h3>Select a Flagged Item</h3>
              <p>Choose an item from the queue list on the left to inspect detailed AI reasoning and take action.</p>
            </div>
          ) : (
            <div className="workspace-content">
              {/* Header Details */}
              <div className="workspace-header">
                <div className="user-profile">
                  <img src={selectedItem.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'} alt="" className="profile-avatar" />
                  <div>
                    <h3>@{selectedItem.user}</h3>
                    <span className="post-date"><Clock size={12} /> {new Date(selectedItem.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="decision-pills">
                  <span className={`risk-badge risk-${selectedItem.riskScore > 80 ? 'high' : 'medium'}`}>
                    Risk Score: {selectedItem.riskScore}%
                  </span>
                  <span className={`status-pill status-${selectedItem.humanStatus?.toLowerCase()}`}>
                    {selectedItem.humanStatus?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Original Content Box */}
              <div className="original-content-box">
                <span className="content-box-label">Original User Post:</span>
                <p className="post-text-full">{selectedItem.content}</p>
                {selectedItem.imageUrl && (
                  <div className="post-image-box">
                    <img src={selectedItem.imageUrl} alt="Attached content" />
                  </div>
                )}
              </div>

              {/* Automated AI Reasoning Panel */}
              <div className="ai-reasoning-panel">
                <div className="flex-between">
                  <h4>Automated Rule Flag Reasoning:</h4>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={handleRunAiAudit}
                    disabled={isAuditing}
                  >
                    <Sparkles size={14} />
                    <span>{isAuditing ? 'Auditing with Gemini...' : (apiKey ? 'Run Gemini AI Audit' : 'Run AI Audit (Simulator)')}</span>
                  </button>
                </div>
                <div className="reasoning-meta">
                  <span className="meta-item">Category: <strong>{selectedItem.primaryCategory}</strong></span>
                  <span className="meta-item">Status: <strong>{selectedItem.overallStatus}</strong></span>
                </div>
                <p className="reasoning-text">{selectedItem.explanation}</p>

                {selectedItem.flaggedSnippets && selectedItem.flaggedSnippets.length > 0 && (
                  <div className="snippets-box">
                    <span>Flagged Trigger Words:</span>
                    <div className="chips-wrapper">
                      {selectedItem.flaggedSnippets.map((snip, i) => (
                        <span key={i} className="snippet-chip red-chip">{snip}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Audit Second Opinion Result */}
                {aiAuditResult && (
                  <div className="ai-audit-box">
                    <div className="ai-audit-header">
                      <Sparkles size={16} className="icon-purple" />
                      <strong>Second-Opinion Audit ({aiAuditResult.source}):</strong>
                    </div>
                    <p><strong>Suggested Action:</strong> {aiAuditResult.data?.suggestedAction} (Risk Level: {aiAuditResult.data?.riskAssessment})</p>
                    <p className="ai-audit-opinion">{aiAuditResult.data?.aiOpinion}</p>
                  </div>
                )}
              </div>

              {/* Moderator Actions Form */}
              <div className="moderator-actions-area">
                <label className="input-label">Moderator Notes & Audit Reason:</label>
                <textarea 
                  className="textarea-field"
                  rows={2}
                  placeholder="Enter justification for overriding or confirming decision..."
                  value={moderatorNote}
                  onChange={(e) => setModeratorNote(e.target.value)}
                />

                <div className="action-buttons-row">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleAction('APPROVED')}
                  >
                    <Check size={18} />
                    <span>Approve (Override AI)</span>
                  </button>

                  <button 
                    className="btn btn-danger"
                    onClick={() => handleAction('REJECTED')}
                  >
                    <X size={18} />
                    <span>Confirm Block / Remove</span>
                  </button>

                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleAction('ESCALATED')}
                  >
                    <AlertTriangle size={18} />
                    <span>Escalate to Admin</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
