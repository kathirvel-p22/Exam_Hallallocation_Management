// LinkCortexa AI - Backend Server
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'LinkCortexa AI Server Running' });
});

// URL Scanner API (Simulated AI Analysis)
app.post('/api/scan-url', (req, res) => {
  const { url } = req.body;
  
  // Simulated AI analysis
  const phishingKeywords = ['secure', 'login', 'verify', 'update', 'banking', 'paypal', 'amazon', 'netflix'];
  const malwareDomains = ['.tk', '.ml', '.ga', '.cf', '.gq'];
  const suspiciousPatterns = ['free', 'win', 'prize', 'offer', 'discount', 'crypto'];
  
  let score = 0;
  let type = 'safe';
  let reasons = [];
  
  const lower = url.toLowerCase();
  
  // Check domain extension
  malwareDomains.forEach(ext => {
    if (lower.includes(ext)) { score += 35; reasons.push('Suspicious TLD detected'); }
  });
  
  // Check phishing keywords
  let kwCount = 0;
  phishingKeywords.forEach(kw => {
    if (lower.includes(kw)) { kwCount++; score += 15; }
  });
  if (kwCount > 1) reasons.push('Multiple phishing keywords');
  
  // Check URL length
  if (url.length > 60) { score += 10; reasons.push('Abnormal URL length'); }
  
  // Check hyphens
  const hyphens = (url.match(/-/g) || []).length;
  if (hyphens > 3) { score += 15; reasons.push('Excessive hyphens in domain'); }
  
  // Check suspicious patterns
  suspiciousPatterns.forEach(p => {
    if (lower.includes(p)) score += 8;
  });
  
  // IP in URL
  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) { score += 40; reasons.push('IP address used instead of domain'); }
  
  // Known safe patterns
  if (lower.includes('github.com') || lower.includes('google.com') || lower.includes('microsoft.com')) {
    score = 2; type = 'safe'; reasons = ['Verified legitimate domain'];
  } else if (score >= 70) {
    type = 'phishing';
    if (lower.includes('.tk') || lower.includes('.ml')) type = 'malware';
  } else if (score >= 40) {
    type = 'suspicious';
  } else if (score >= 20) {
    type = 'suspicious';
  } else {
    type = 'safe';
  }
  
  score = Math.min(score, 99);
  
  res.json({
    url,
    type,
    score,
    reasons,
    timestamp: new Date().toISOString()
  });
});

// Get threats (Simulated database)
app.get('/api/threats', (req, res) => {
  const threats = [
    { url: 'paypal-secure-login.xyz', country: 'Russia', type: 'phishing', score: 92, date: '2026-03-15' },
    { url: 'crypto-airdrop-claim.tk', country: 'China', type: 'malware', score: 88, date: '2026-03-15' },
    { url: 'amazon-verify-account.ml', country: 'Brazil', type: 'phishing', score: 85, date: '2026-03-15' },
    { url: 'netflix-billing-update.xyz', country: 'Russia', type: 'phishing', score: 81, date: '2026-03-15' },
    { url: 'btc-wallet-restore.info', country: 'Nigeria', type: 'malware', score: 79, date: '2026-03-15' },
    { url: 'suspicious-redirect.net', country: 'India', type: 'suspicious', score: 62, date: '2026-03-15' },
    { url: 'secure-bankofamerica.cc', country: 'USA', type: 'phishing', score: 76, date: '2026-03-15' },
    { url: 'microsoft-support-help.co', country: 'China', type: 'phishing', score: 89, date: '2026-03-15' },
    { url: 'github.com', country: 'USA', type: 'safe', score: 2, date: '2026-03-15' },
    { url: 'free-gift-claim.ga', country: 'Nigeria', type: 'suspicious', score: 68, date: '2026-03-15' },
  ];
  res.json(threats);
});

// Get analytics data
app.get('/api/analytics', (req, res) => {
  res.json({
    totalScans: 847,
    threatsToday: 19,
    threatsThisWeek: 156,
    blockchainLogs: 50,
    avgRiskScore: 52,
    phishing: 16,
    malware: 10,
    suspicious: 14,
    safe: 10,
    accuracyRate: 98.2,
    falsePositiveRate: 1.2,
    avgResponseTime: 0.8,
    topCountries: [
      { name: 'Russia', count: 42, flag: '🇷🇺' },
      { name: 'China', count: 38, flag: '🇨🇳' },
      { name: 'USA', count: 28, flag: '🇺🇸' },
      { name: 'India', count: 21, flag: '🇮🇳' },
      { name: 'Brazil', count: 18, flag: '🇧🇷' }
    ]
  });
});

// Intelligence campaigns endpoint
app.get('/api/intelligence/campaigns', (req, res) => {
  res.json([
    {
      id: 1,
      name: 'Operation Phantom Bank',
      type: 'phishing',
      origin: 'Russia',
      activeSince: '2026-03-01',
      domainsDetected: 23,
      description: 'Coordinated phishing campaign targeting banking customers across 12 countries. Uses cloned PayPal and Bank of America login pages hosted on .xyz domains.',
      riskLevel: 'high',
      status: 'active'
    },
    {
      id: 2,
      name: 'CryptoStealer-X',
      type: 'malware',
      origin: 'China',
      activeSince: '2026-02-14',
      domainsDetected: 47,
      description: 'Malware distribution campaign via fake cryptocurrency airdrop websites. Downloads credential-stealing trojans disguised as wallet software.',
      riskLevel: 'critical',
      status: 'active'
    },
    {
      id: 3,
      name: 'TechSupport Scam Wave',
      type: 'suspicious',
      origin: 'India',
      activeSince: '2026-03-08',
      domainsDetected: 15,
      description: 'Fake Microsoft technical support websites deployed to harvest remote access. Uses social engineering with urgent security alert popups.',
      riskLevel: 'medium',
      status: 'monitoring'
    }
  ]);
});

// User profile endpoint
app.get('/api/profile', (req, res) => {
  res.json({
    name: 'Kathirvel P',
    role: 'Senior Security Analyst',
    location: 'Chennai, India',
    joinDate: '2024-03-15',
    stats: {
      threatsDetected: 847,
      accuracyRate: 98.2,
      globalRank: 12
    },
    settings: {
      twoFactorAuth: true,
      realTimeAlerts: true,
      emailReports: false,
      apiAccess: true
    },
    recentActivity: [
      {
        type: 'detection',
        title: 'High-Risk Phishing Detected',
        description: 'Identified paypal-secure-login.xyz with 92% risk score',
        timestamp: '2 hours ago',
        severity: 'high'
      },
      {
        type: 'block',
        title: 'Malware Domain Blocked',
        description: 'Prevented access to crypto-airdrop-claim.tk',
        timestamp: '4 hours ago',
        severity: 'critical'
      },
      {
        type: 'blockchain',
        title: 'Blockchain Log Verified',
        description: 'Transaction #1847392 confirmed on Ethereum',
        timestamp: '6 hours ago',
        severity: 'info'
      }
    ]
  });
});

// Blockchain logging (Simulated)
app.post('/api/blockchain-log', (req, res) => {
  const { url, type, hash } = req.body;
  const txId = '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4);
  const block = '#' + (1847392 + Math.floor(Math.random() * 100));
  
  res.json({
    block,
    txId,
    hash: hash || 'sha256:' + Math.random().toString(64).substr(0, 64),
    url,
    type,
    timestamp: new Date().toISOString(),
    verified: true
  });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🔒 LinkCortexa AI - Cyber Threat Intelligence Platform   ║
║                                                              ║
║   Server running at: http://localhost:${PORT}               ║
║                                                              ║
║   Available endpoints:                                      ║
║   • GET  /api/health      - Server health check            ║
║   • POST /api/scan-url    - AI URL Scanner                 ║
║   • GET  /api/threats     - Threat database               ║
║   • GET  /api/analytics   - Analytics data                ║
║   • POST /api/blockchain-log - Blockchain logging         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
