import React from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Inbox, 
  MessageSquareDiff, 
  Sliders, 
  BarChart3, 
  Cpu, 
  Key, 
  CheckCircle2,
  Globe,
  FileText,
  Scale
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab, apiKey, onOpenApiKeyModal, pendingQueueCount }) {
  const navItems = [
    { id: 'autogluon', label: 'AutoGluon ML Model', icon: Cpu, highlight: true },
    { id: 'live-tester', label: 'Multi-Chain Pipeline', icon: Sparkles },
    { id: 'review-queue', label: 'Review Queue', icon: Inbox, badge: pendingQueueCount },
    { id: 'appeals-center', label: 'Appeals Center', icon: MessageSquareDiff },
    { id: 'rules-manager', label: 'Rules & Policies', icon: Sliders },
    { id: 'analytics', label: 'Trends & Analytics', icon: BarChart3 },
    { id: 'domain-settings', label: 'Domain Settings', icon: Globe },
    { id: 'privacy', label: 'Privacy Policy', icon: FileText },
    { id: 'terms', label: 'Terms & Conditions', icon: Scale }
  ];

  return (
    <header className="site-header">
      <div className="header-top">
        <div className="brand-container">
          <div className="brand-logo-glow">
            <ShieldAlert className="brand-icon" size={28} />
          </div>
          <div>
            <h1 className="brand-title">AegisGuard <span className="version-badge">v2.4 Enterprise</span></h1>
            <p className="brand-subtitle">Automated Multi-Class & Multi-Label Moderation System</p>
          </div>
        </div>

        <div className="header-actions">
          <button 
            className={`api-key-pill ${apiKey ? 'active' : ''}`}
            onClick={onOpenApiKeyModal}
            title="Configure Gemini API Key"
          >
            <Key size={16} />
            <span>
              {apiKey 
                ? (import.meta.env.VITE_GEMINI_API_KEY ? 'Gemini API (.env Connected)' : 'Gemini API Connected') 
                : 'Using Local AI Simulator'}
            </span>
            {apiKey && <CheckCircle2 size={14} className="check-icon" />}
          </button>
        </div>
      </div>

      <nav className="header-nav">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''} ${item.highlight ? 'highlight-btn' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}

