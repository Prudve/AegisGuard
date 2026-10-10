import React, { useState } from 'react';
import Header from './components/Header';
import AutoGluonModerator from './components/AutoGluonModerator';
import LiveModerator from './components/LiveModerator';
import ReviewQueue from './components/ReviewQueue';
import AppealsCenter from './components/AppealsCenter';
import RulesManager from './components/RulesManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MLTrainingGuide from './components/MLTrainingGuide';
import DomainSettings from './components/DomainSettings';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import ApiKeyModal from './components/ApiKeyModal';

import { 
  INITIAL_QUEUE, 
  INITIAL_APPEALS, 
  DEFAULT_RULES_CONFIG, 
  INITIAL_ANALYTICS 
} from './data/mockData';

import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('autogluon');
  const [apiKey, setApiKey] = useState(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey && envKey.trim()) return envKey.trim();
    return localStorage.getItem('aegis_gemini_api_key') || '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const handleSaveApiKey = (newKey) => {
    setApiKey(newKey);
    if (newKey) {
      localStorage.setItem('aegis_gemini_api_key', newKey);
    } else {
      localStorage.removeItem('aegis_gemini_api_key');
    }
  };

  // Application state
  const [queueItems, setQueueItems] = useState(INITIAL_QUEUE);
  const [appeals, setAppeals] = useState(INITIAL_APPEALS);
  const [rulesConfig, setRulesConfig] = useState(DEFAULT_RULES_CONFIG);
  const [analytics, setAnalytics] = useState(INITIAL_ANALYTICS);

  // Add newly flagged item to queue
  const handleAddToQueue = (newItem) => {
    setQueueItems(prev => [newItem, ...prev]);
    // Increment analytics
    setAnalytics(prev => ({
      ...prev,
      totalScanned: prev.totalScanned + 1,
      totalFlagged: prev.totalFlagged + 1,
      humanReviewed: prev.humanReviewed + 1
    }));
  };

  // Update item in human queue
  const handleUpdateQueueItem = (id, updates) => {
    setQueueItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  // Create user appeal
  const handleCreateAppeal = (newAppeal) => {
    setAppeals(prev => [newAppeal, ...prev]);
    setAnalytics(prev => ({ ...prev, appealsSubmitted: prev.appealsSubmitted + 1 }));
  };

  // Resolve user appeal
  const handleResolveAppeal = (appealId, updates) => {
    setAppeals(prev => prev.map(a => a.id === appealId ? { ...a, ...updates } : a));
    if (updates.status === 'APPROVED_OVERTURNED') {
      setAnalytics(prev => ({ ...prev, appealsOverturned: prev.appealsOverturned + 1 }));
    }
  };

  const pendingQueueCount = queueItems.filter(i => i.humanStatus === 'PENDING_REVIEW').length;

  return (
    <div className="app-layout">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        apiKey={apiKey}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        pendingQueueCount={pendingQueueCount}
      />

      <main className="main-content">
        {activeTab === 'autogluon' && (
          <AutoGluonModerator 
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'live-tester' && (
          <LiveModerator 
            rulesConfig={rulesConfig}
            apiKey={apiKey}
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'review-queue' && (
          <ReviewQueue 
            queueItems={queueItems}
            onUpdateQueueItem={handleUpdateQueueItem}
            apiKey={apiKey}
          />
        )}

        {activeTab === 'appeals-center' && (
          <AppealsCenter 
            appeals={appeals}
            onCreateAppeal={handleCreateAppeal}
            onResolveAppeal={handleResolveAppeal}
            apiKey={apiKey}
          />
        )}

        {activeTab === 'rules-manager' && (
          <RulesManager 
            rulesConfig={rulesConfig}
            onUpdateRules={setRulesConfig}
            apiKey={apiKey}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            analytics={analytics}
          />
        )}

        {activeTab === 'domain-settings' && (
          <DomainSettings />
        )}

        {activeTab === 'privacy' && (
          <PrivacyPolicy />
        )}

        {activeTab === 'terms' && (
          <TermsConditions />
        )}
      </main>

      <ApiKeyModal 
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
