import { moderateWithGemini } from './geminiService';

/**
 * Runs content through the automated Multi-Rule Moderation Pipeline Chain.
 * 
 * Pipeline Chain Steps:
 *  Step 1: Fast Regex & Keyword Matching
 *  Step 2: Heuristic & Toxicity Signal Scoring
 *  Step 3: AI Contextual Engine (Gemini API or Local AI)
 * 
 * @param {Object} postData { text, imageUrl, user }
 * @param {Object} rulesConfig Active rules configuration
 * @param {string} apiKey User provided Gemini API Key (optional)
 * @returns {Promise<Object>} Full evaluation breakdown with step logs
 */
export async function runModerationPipeline({ text = '', imageUrl = '', user = 'anonymous' }, rulesConfig = {}, apiKey = '') {
  const startTime = performance.now();
  const ruleLogs = [];
  let currentRiskScore = 0;
  let flaggedSnippets = [];
  let isFastBlocked = false;

  // --- STEP 1: FAST REGEX & KEYWORD ENGINE ---
  const step1Start = performance.now();
  const lowerText = text.toLowerCase();

  // Banned crypto wallets / phishing URLs / Hard slurs
  const regexPatterns = [
    { name: 'Phishing Telegram / Crypto Wallet', regex: /(t\.me\/|1A1zP1eP5QG|btc|0x[a-fA-F0-9]{40})/gi, risk: 45 },
    { name: 'Suspicious Short Links', regex: /(bit\.ly\/|tinyurl\.com\/|t\.co\/)/gi, risk: 35 },
    { name: 'Financial Scam Triggers', regex: /(guaranteed 500%|send 0\.1 btc|free money now|100% free money)/gi, risk: 50 },
    { name: 'Severe Harassment Threats', regex: /(track down your address|ruin your career|go delete your account|post all your private info)/gi, risk: 55 },
    { name: 'Medical Disinformation', regex: /(boiling salt water|cures all viral|big pharma is lying)/gi, risk: 45 }
  ];

  let step1Hits = [];
  if (rulesConfig.regexFilterEnabled !== false) {
    regexPatterns.forEach(pattern => {
      const matches = text.match(pattern.regex);
      if (matches) {
        step1Hits.push(`${pattern.name} (${matches.length} hit)`);
        currentRiskScore += pattern.risk;
        matches.forEach(m => {
          if (!flaggedSnippets.includes(m)) flaggedSnippets.push(m);
        });
      }
    });

    // Check custom banned keywords
    if (rulesConfig.customKeywords && Array.isArray(rulesConfig.customKeywords)) {
      rulesConfig.customKeywords.forEach(keyword => {
        if (lowerText.includes(keyword.toLowerCase())) {
          step1Hits.push(`Custom Banned Keyword: "${keyword}"`);
          currentRiskScore += 30;
          if (!flaggedSnippets.includes(keyword)) flaggedSnippets.push(keyword);
        }
      });
    }
  }

  const step1Duration = (performance.now() - step1Start).toFixed(1);
  ruleLogs.push({
    ruleId: 'RULE-1-REGEX',
    ruleName: 'Regex & Banned Term Filter',
    durationMs: step1Duration,
    status: step1Hits.length > 0 ? 'FLAGGED' : 'PASSED',
    details: step1Hits.length > 0 
      ? `Triggered ${step1Hits.length} filters: ${step1Hits.slice(0, 2).join(', ')}`
      : 'No banned patterns or blacklisted terms found.'
  });

  // Check if fast block threshold hit (e.g., severe malicious bot)
  if (currentRiskScore >= 95) {
    isFastBlocked = true;
  }

  // --- STEP 2: HEURISTIC & SIGNAL ANALYZER ---
  const step2Start = performance.now();
  let step2Signals = [];

  // Caps Ratio
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  const totalLetters = (text.match(/[a-zA-Z]/g) || []).length;
  const capsRatio = totalLetters > 0 ? capsCount / totalLetters : 0;

  if (capsRatio > (rulesConfig.capsRatioThreshold || 0.70) && totalLetters > 12) {
    step2Signals.push(`Excessive ALL CAPS ratio (${(capsRatio * 100).toFixed(0)}%)`);
    currentRiskScore += 25;
  }

  // Link Density
  const words = text.trim().split(/\s+/);
  const links = text.match(/https?:\/\/[^\s]+/g) || [];
  const linkDensity = words.length > 0 ? links.length / words.length : 0;

  if (linkDensity > (rulesConfig.linkDensityThreshold || 0.40)) {
    step2Signals.push(`High link density (${(linkDensity * 100).toFixed(0)}% links)`);
    currentRiskScore += 30;
  }

  // Repeated Exclamations / Symbols
  if (/(!|\?|\$){3,}/.test(text)) {
    step2Signals.push('Repeated special characters (!!! / $$$)');
    currentRiskScore += 10;
  }

  const step2Duration = (performance.now() - step2Start).toFixed(1);
  ruleLogs.push({
    ruleId: 'RULE-2-HEURISTICS',
    ruleName: 'Heuristic & Toxicity Signal Engine',
    durationMs: step2Duration,
    status: step2Signals.length > 0 ? 'FLAGGED' : 'PASSED',
    details: step2Signals.length > 0
      ? `Detected heuristic signals: ${step2Signals.join(' | ')}`
      : `Clean heuristic scores (Caps: ${(capsRatio * 100).toFixed(0)}%, Link ratio: ${(linkDensity * 100).toFixed(0)}%).`
  });

  // --- STEP 3: AI CONTEXTUAL ENGINE (GEMINI API OR INTEL SIMULATOR) ---
  const step3Start = performance.now();
  const aiResponse = await moderateWithGemini({
    text,
    imageUrl,
    apiKey,
    rulesConfig
  });

  const aiData = aiResponse.data;
  const step3Duration = (performance.now() - step3Start).toFixed(1);

  ruleLogs.push({
    ruleId: 'RULE-3-AI-GEMINI',
    ruleName: `AI Moderation Engine (${aiResponse.source})`,
    durationMs: step3Duration,
    status: aiData.overallStatus,
    details: `Classification: ${aiData.primaryCategory} (Risk Score: ${aiData.riskScore}%). ${aiData.explanation}`
  });

  // Combine Final Decision
  const finalRiskScore = Math.min(100, Math.max(aiData.riskScore, currentRiskScore));
  const autoBlockLimit = rulesConfig.autoBlockScoreThreshold || 85;
  const reviewQueueLimit = rulesConfig.reviewQueueScoreThreshold || 45;

  let overallStatus = 'APPROVED';
  let actionTaken = 'PUBLISHED';

  if (finalRiskScore >= autoBlockLimit || isFastBlocked) {
    overallStatus = 'AUTO_REJECTED';
    actionTaken = 'BLOCKED';
  } else if (finalRiskScore >= reviewQueueLimit) {
    overallStatus = 'FLAGGED';
    actionTaken = 'SENT_TO_REVIEW_QUEUE';
  }

  const totalDurationMs = (performance.now() - startTime).toFixed(1);

  // Combine unique snippets
  const allSnippets = Array.from(new Set([...flaggedSnippets, ...(aiData.flaggedSnippets || [])]));

  return {
    id: `mod-${Date.now()}`,
    user,
    content: text,
    imageUrl,
    createdAt: new Date().toISOString(),
    overallStatus,
    actionTaken,
    riskScore: finalRiskScore,
    primaryCategory: aiData.primaryCategory || 'Clean Content',
    categories: aiData.categories || { spam: 5, harassment: 5, misleading: 5, nsfw: 0 },
    explanation: aiData.explanation || 'No severe safety violations detected.',
    flaggedSnippets: allSnippets,
    ruleChainLogs: ruleLogs,
    totalDurationMs,
    aiSource: aiResponse.source,
    humanStatus: overallStatus === 'FLAGGED' ? 'PENDING_REVIEW' : (overallStatus === 'AUTO_REJECTED' ? 'REJECTED' : 'APPROVED'),
    moderatorNotes: ''
  };
}
