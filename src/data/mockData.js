// Pre-populated initial mock data for Content Moderation System

export const PRESET_TEST_CASES = [
  {
    id: 'test-1',
    title: 'Financial Crypto Spam',
    type: 'spam',
    user: 'crypto_god_99',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    text: 'GUARANTEED 500% RETURNS IN 24 HOURS!! Send 0.1 BTC to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa and get 1 BTC back instantly! Join Telegram t.me/fast_crypto_rich NOW! DO NOT MISS THIS FREE MONEY!',
    imageUrl: '',
    expectedCategory: 'Spam / Scam',
    expectedScore: 96
  },
  {
    id: 'test-2',
    title: 'Severe Toxic Harassment',
    type: 'harassment',
    user: 'angry_troll_404',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    text: 'You are completely incompetent and worthless! Everyone here hates you. Go delete your account or we will track down your address and make your life a nightmare, you pathetic loser.',
    imageUrl: '',
    expectedCategory: 'Harassment / Cyberbullying',
    expectedScore: 92
  },
  {
    id: 'test-3',
    title: 'Misleading Health Advice',
    type: 'misleading',
    user: 'miracle_health_guru',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    text: 'DOCTORS ARE HIDING THIS! Drinking boiling salt water with lemon cures all viral infections within 30 minutes! Throw away your prescription pills today, Big Pharma is lying to you!',
    imageUrl: '',
    expectedCategory: 'Misleading / Health Disinformation',
    expectedScore: 88
  },
  {
    id: 'test-4',
    title: 'Clean Product Review',
    type: 'clean',
    user: 'tech_reviewer_alex',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    text: 'Just received the new wireless noise-canceling headphones! The battery life is impressive around 30 hours, soundstage is crisp, though the touch controls take a bit to get used to. 4.5/5 stars.',
    imageUrl: '',
    expectedCategory: 'Clean Content',
    expectedScore: 4
  },
  {
    id: 'test-5',
    title: 'Misleading Clickbait with Image',
    type: 'multimodal',
    user: 'breaking_daily_news',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    text: 'SHOCKING BREAKING NEWS: Scientific discovery proves aliens landed in Central Park last night! Leaked photo from government insider confirms craft touchdown!',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    expectedCategory: 'Misleading Clickbait',
    expectedScore: 84
  }
];

export const INITIAL_QUEUE = [
  {
    id: 'queue-101',
    user: 'bot_spammer_77',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    createdAt: '2026-10-04T14:20:00Z',
    content: 'BUY CHEAP WATCHES NOW! 90% DISCOUNT! CLICK HERE http://bit.ly/cheap-rolex-fake-sale AND USE PROMO CODE SPAM90!',
    type: 'text',
    imageUrl: '',
    overallStatus: 'FLAGGED',
    riskScore: 94,
    primaryCategory: 'Spam / Promotional',
    categories: { spam: 94, harassment: 5, misleading: 40, nsfw: 0 },
    explanation: 'Contains suspicious shortened tracking link (bit.ly), ALL CAPS discount promo text, and repeated promotional spam patterns.',
    flaggedSnippets: ['BUY CHEAP WATCHES NOW', 'bit.ly/cheap-rolex-fake-sale', '90% DISCOUNT'],
    ruleChainLogs: [
      { step: 'Regex & Keyword Engine', status: 'FLAGGED', detail: 'Triggered Banned Link Regex & Caps Ratio (85%)' },
      { step: 'Heuristic Toxicity Scoring', status: 'FLAGGED', detail: 'Spam ratio score calculated at 0.94' },
      { step: 'AI Contextual Moderation', status: 'FLAGGED', detail: 'High confidence commercial spam phishing classification' }
    ],
    humanStatus: 'PENDING_REVIEW', // PENDING_REVIEW | APPROVED | REJECTED | ESCALATED
    moderatorNotes: ''
  },
  {
    id: 'queue-102',
    user: 'shadow_user_x',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
    createdAt: '2026-10-04T14:45:00Z',
    content: 'If I catch you posting in this subreddit again, I will personally post all your private information and ruin your career. Watch your back.',
    type: 'text',
    imageUrl: '',
    overallStatus: 'FLAGGED',
    riskScore: 91,
    primaryCategory: 'Harassment / Threats',
    categories: { spam: 10, harassment: 91, misleading: 15, nsfw: 0 },
    explanation: 'Direct personal threat containing dox warning language ("post your private information", "ruin your career", "watch your back").',
    flaggedSnippets: ['post all your private information', 'ruin your career', 'Watch your back'],
    ruleChainLogs: [
      { step: 'Regex & Keyword Engine', status: 'PASSED', detail: 'No direct slur found, flag deferred to sentiment analyzer' },
      { step: 'Heuristic Toxicity Scoring', status: 'FLAGGED', detail: 'High threat intent density detected (0.88)' },
      { step: 'AI Contextual Moderation', status: 'FLAGGED', detail: 'Direct harassment and doxxing threat confirmed' }
    ],
    humanStatus: 'PENDING_REVIEW',
    moderatorNotes: ''
  },
  {
    id: 'queue-103',
    user: 'crypto_trader_bob',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    createdAt: '2026-10-04T15:10:00Z',
    content: 'Check out my GitHub repository for open-source AI content moderation tooling! It supports fast keyword filtering and local embedding vectors.',
    type: 'text',
    imageUrl: '',
    overallStatus: 'FLAGGED',
    riskScore: 52,
    primaryCategory: 'Spam / Link Verification',
    categories: { spam: 52, harassment: 2, misleading: 10, nsfw: 0 },
    explanation: 'Flagged for self-promotion link review due to new user account policy threshold (>50% risk score trigger).',
    flaggedSnippets: ['GitHub repository'],
    ruleChainLogs: [
      { step: 'Regex & Keyword Engine', status: 'PASSED', detail: 'No malformed links' },
      { step: 'Heuristic Toxicity Scoring', status: 'PASSED', detail: 'Normal text structure' },
      { step: 'AI Contextual Moderation', status: 'FLAGGED', detail: 'Borderline self-promotional content flagged for manual verification' }
    ],
    humanStatus: 'PENDING_REVIEW',
    moderatorNotes: ''
  }
];

export const INITIAL_APPEALS = [
  {
    id: 'appeal-201',
    postId: 'post-881',
    user: 'sarcastic_gamer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    originalContent: 'I swear I will kill you in CS:GO if you don\'t drop me an AWP next round haha!',
    flagReason: 'Harassment / Violent Language',
    flagDate: '2026-10-04T11:00:00Z',
    appealReason: 'This was obvious video game gaming banter regarding Counter-Strike (CS:GO). I was talking about in-game mechanics with my teammate, not real life violence!',
    status: 'UNDER_REVIEW', // UNDER_REVIEW | APPROVED_OVERTURNED | REJECTED_UPHELD
    moderatorDecisionReason: ''
  }
];

export const DEFAULT_RULES_CONFIG = {
  regexFilterEnabled: true,
  capsRatioThreshold: 0.70,
  linkDensityThreshold: 0.40,
  autoBlockScoreThreshold: 85,
  reviewQueueScoreThreshold: 45,
  customKeywords: [
    '500% return',
    'free btc',
    'telegram t.me',
    'boiling salt water cure',
    'dox your address',
    'ruin your career',
    '100% free money',
    'whatsapp crypto'
  ],
  weights: {
    spam: 1.0,
    harassment: 1.2,
    misleading: 0.9,
    nsfw: 1.1
  }
};

export const INITIAL_ANALYTICS = {
  totalScanned: 14820,
  totalFlagged: 1240,
  autoBlocked: 780,
  humanReviewed: 460,
  appealsSubmitted: 85,
  appealsOverturned: 28,
  avgResponseMs: 142,
  categoryBreakdown: [
    { category: 'Spam & Scams', count: 580, percent: 46.8, color: '#f59e0b' },
    { category: 'Harassment & Hate', count: 340, percent: 27.4, color: '#ef4444' },
    { category: 'Misleading Info', count: 210, percent: 16.9, color: '#3b82f6' },
    { category: 'NSFW / Explicit', count: 110, percent: 8.9, color: '#ec4899' }
  ],
  dailyTrend: [
    { date: 'Sep 28', scanned: 1800, flagged: 140, blocked: 90 },
    { date: 'Sep 29', scanned: 2100, flagged: 175, blocked: 110 },
    { date: 'Sep 30', scanned: 1950, flagged: 160, blocked: 98 },
    { date: 'Oct 01', scanned: 2400, flagged: 210, blocked: 135 },
    { date: 'Oct 02', scanned: 2200, flagged: 185, blocked: 115 },
    { date: 'Oct 03', scanned: 2150, flagged: 170, blocked: 105 },
    { date: 'Oct 04', scanned: 2220, flagged: 200, blocked: 127 }
  ]
};
