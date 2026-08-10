// ── LINKCORTEXA AI – MAIN JS ──

// ── CLOCK ──
function updateClock() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  document.querySelectorAll('.header-time').forEach(el => el.textContent = time);
}
setInterval(updateClock, 1000);
updateClock();

// ── NAVIGATION ──
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const navEl = document.querySelector(`[data-page="${pageId}"]`);
  if (navEl) navEl.classList.add('active');

  // Update header title
  const titles = {
    dashboard: ['Security Overview', 'Real-Time Threat Intelligence Dashboard'],
    scanner: ['URL Scanner', 'AI-Powered Threat Detection'],
    threats: ['Threat Database', 'Global Threat Intelligence Records'],
    analytics: ['Analytics', 'Threat Intelligence Analytics'],
    blockchain: ['Blockchain Logs', 'Tamper-Proof Security Records'],
    intelligence: ['Threat Intelligence', 'Advanced Cyber Intelligence Engine'],
    profile: ['Profile', 'User Security Profile'],
  };
  const t = titles[pageId];
  if (t) {
    document.querySelector('.header-title h1').textContent = t[0];
    document.querySelector('.header-title p').textContent = t[1];
  }
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.page));
});

// ── HERO CANVAS (Animated Network Map) ──
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const nodes = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 1,
    color: Math.random() > 0.7 ? '#FF3A5C' : Math.random() > 0.5 ? '#00C8FF' : '#3B82F6'
  }));

  const packets = [];

  function spawnPacket() {
    const a = nodes[Math.floor(Math.random() * nodes.length)];
    const b = nodes[Math.floor(Math.random() * nodes.length)];
    if (a !== b) packets.push({ ax: a.x, ay: a.y, bx: b.x, by: b.y, t: 0, color: a.color });
  }

  setInterval(spawnPacket, 800);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    nodes.forEach((n, i) => {
      nodes.slice(i + 1).forEach(m => {
        const d = Math.hypot(n.x - m.x, n.y - m.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(0,200,255,${0.08 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.color;
      ctx.shadowColor = n.color;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
    });

    // Draw packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.t += 0.015;
      if (p.t > 1) { packets.splice(i, 1); continue; }
      const x = p.ax + (p.bx - p.ax) * p.t;
      const y = p.ay + (p.by - p.ay) * p.t;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    requestAnimationFrame(draw);
  }
  draw();
}

// ── WORLD MAP CANVAS ──
function initWorldMap() {
  const canvas = document.getElementById('worldMapCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();

  // Approximate country dots
  const W = canvas.width, H = canvas.height;
  const attackPoints = [
    { name: 'Russia', x: 0.62, y: 0.28, color: '#FF3A5C', count: 42 },
    { name: 'China', x: 0.76, y: 0.38, color: '#FF3A5C', count: 38 },
    { name: 'USA', x: 0.20, y: 0.38, color: '#00C8FF', count: 28 },
    { name: 'India', x: 0.70, y: 0.46, color: '#FF9500', count: 21 },
    { name: 'Brazil', x: 0.28, y: 0.62, color: '#FF3A5C', count: 18 },
    { name: 'Germany', x: 0.51, y: 0.28, color: '#00C8FF', count: 14 },
    { name: 'UK', x: 0.48, y: 0.26, color: '#00C8FF', count: 12 },
    { name: 'Japan', x: 0.82, y: 0.35, color: '#FF9500', count: 10 },
    { name: 'Nigeria', x: 0.50, y: 0.52, color: '#FF3A5C', count: 8 },
    { name: 'Australia', x: 0.82, y: 0.66, color: '#00C8FF', count: 6 },
  ];

  const arcs = [];

  function spawnArc() {
    const attackers = attackPoints.filter(p => p.color === '#FF3A5C');
    const targets = attackPoints.filter(p => p.color !== '#FF3A5C');
    const a = attackers[Math.floor(Math.random() * attackers.length)];
    const b = targets[Math.floor(Math.random() * targets.length)];
    arcs.push({ sx: a.x, sy: a.y, tx: b.x, ty: b.y, t: 0, color: a.color });
  }

  setInterval(spawnArc, 1200);

  function drawMapBg() {
    // Simple world map outline using bezier paths
    ctx.fillStyle = '#030F1F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(0,200,255,0.05)';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
  }

  const time = { v: 0 };

  function draw() {
    const W = canvas.width, H = canvas.height;
    drawMapBg();
    time.v += 0.02;

    // Draw arcs
    arcs.forEach((arc, i) => {
      arc.t = Math.min(arc.t + 0.008, 1);
      const sx = arc.sx * W, sy = arc.sy * H;
      const tx = arc.tx * W, ty = arc.ty * H;
      const mx = (sx + tx) / 2, my = (sy + ty) / 2 - 60;

      const progress = arc.t;
      const steps = Math.floor(progress * 50);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      for (let s = 0; s <= steps; s++) {
        const t = s / 50;
        const bx = (1-t)*(1-t)*sx + 2*(1-t)*t*mx + t*t*tx;
        const by = (1-t)*(1-t)*sy + 2*(1-t)*t*my + t*t*ty;
        ctx.lineTo(bx, by);
      }
      ctx.strokeStyle = arc.color + '88';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Packet head
      if (arc.t < 1) {
        const t2 = arc.t;
        const px = (1-t2)*(1-t2)*sx + 2*(1-t2)*t2*mx + t2*t2*tx;
        const py = (1-t2)*(1-t2)*sy + 2*(1-t2)*t2*my + t2*t2*ty;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = arc.color;
        ctx.shadowColor = arc.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (arc.t >= 1) arcs.splice(i, 1);
    });

    // Draw attack points
    attackPoints.forEach(p => {
      const x = p.x * W, y = p.y * H;
      const pulse = 0.5 + 0.5 * Math.sin(time.v + p.x * 10);

      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, 8 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = p.color + '44';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = 'rgba(224,240,255,0.8)';
      ctx.font = '9px "Exo 2", sans-serif';
      ctx.fillText(p.name, x + 8, y - 4);

      // Count
      ctx.fillStyle = p.color;
      ctx.font = 'bold 9px "Space Mono", monospace';
      ctx.fillText(p.count, x + 8, y + 8);
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ── CHARTS ──
function initCharts() {
  // Threat Activity Line Chart
  const lineCtx = document.getElementById('threatActivityChart');
  if (lineCtx) {
    new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Phishing',
            data: [3, 5, 4, 8, 6, 9, 12],
            borderColor: '#FF3A5C',
            backgroundColor: 'rgba(255,58,92,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FF3A5C',
            pointRadius: 4,
          },
          {
            label: 'Malware',
            data: [2, 3, 5, 4, 7, 6, 8],
            borderColor: '#FF9500',
            backgroundColor: 'rgba(255,149,0,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FF9500',
            pointRadius: 4,
          },
          {
            label: 'Suspicious',
            data: [4, 6, 3, 7, 5, 8, 6],
            borderColor: '#FFD60A',
            backgroundColor: 'rgba(255,214,10,0.05)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#FFD60A',
            pointRadius: 4,
          },
          {
            label: 'Safe',
            data: [10, 8, 12, 9, 11, 7, 9],
            borderColor: '#00FF88',
            backgroundColor: 'rgba(0,255,136,0.05)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00FF88',
            pointRadius: 4,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: '#6A9EC0', font: { size: 10 }, boxWidth: 12 } }
        },
        scales: {
          x: { grid: { color: 'rgba(0,200,255,0.05)' }, ticks: { color: '#3D5F7A' } },
          y: { grid: { color: 'rgba(0,200,255,0.05)' }, ticks: { color: '#3D5F7A' } }
        }
      }
    });
  }

  // Threat Breakdown Doughnut
  const donutCtx = document.getElementById('threatBreakdownChart');
  if (donutCtx) {
    new Chart(donutCtx, {
      type: 'doughnut',
      data: {
        labels: ['Safe', 'Suspicious', 'Phishing', 'Malware'],
        datasets: [{
          data: [10, 14, 16, 10],
          backgroundColor: ['#00FF88', '#FFD60A', '#FF3A5C', '#FF9500'],
          borderColor: '#0A1628',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#6A9EC0', font: { size: 10 }, boxWidth: 12, padding: 12 }
          }
        }
      }
    });
  }

  // Analytics - Weekly trend bar
  const barCtx = document.getElementById('weeklyTrendChart');
  if (barCtx) {
    new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
          { label: 'Phishing', data: [18, 24, 19, 32], backgroundColor: 'rgba(255,58,92,0.7)', borderRadius: 4 },
          { label: 'Malware', data: [12, 16, 14, 22], backgroundColor: 'rgba(255,149,0,0.7)', borderRadius: 4 },
          { label: 'Suspicious', data: [22, 18, 26, 20], backgroundColor: 'rgba(255,214,10,0.7)', borderRadius: 4 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#6A9EC0', font: { size: 10 }, boxWidth: 12 } } },
        scales: {
          x: { grid: { color: 'rgba(0,200,255,0.05)' }, ticks: { color: '#3D5F7A' }, stacked: false },
          y: { grid: { color: 'rgba(0,200,255,0.05)' }, ticks: { color: '#3D5F7A' } }
        }
      }
    });
  }

  // Risk Score Radar
  const radarCtx = document.getElementById('riskRadarChart');
  if (radarCtx) {
    new Chart(radarCtx, {
      type: 'radar',
      data: {
        labels: ['Phishing', 'Malware', 'Domain Risk', 'IP Rep.', 'SSL', 'Redirects'],
        datasets: [{
          label: 'Current Risk',
          data: [72, 58, 65, 44, 30, 55],
          borderColor: '#FF3A5C',
          backgroundColor: 'rgba(255,58,92,0.15)',
          pointBackgroundColor: '#FF3A5C',
          pointRadius: 4,
        }, {
          label: 'Safe Threshold',
          data: [20, 20, 20, 20, 20, 20],
          borderColor: 'rgba(0,255,136,0.5)',
          backgroundColor: 'rgba(0,255,136,0.05)',
          pointBackgroundColor: '#00FF88',
          pointRadius: 3,
          borderDash: [4, 4],
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#6A9EC0', font: { size: 10 }, boxWidth: 12 } } },
        scales: {
          r: {
            grid: { color: 'rgba(0,200,255,0.1)' },
            ticks: { color: '#3D5F7A', stepSize: 20, backdropColor: 'transparent' },
            pointLabels: { color: '#6A9EC0', font: { size: 10 } },
            suggestedMin: 0, suggestedMax: 100,
          }
        }
      }
    });
  }

  // Country threat horizontal bar
  const countryCtx = document.getElementById('countryThreatChart');
  if (countryCtx) {
    new Chart(countryCtx, {
      type: 'bar',
      data: {
        labels: ['Russia', 'China', 'USA', 'India', 'Brazil', 'Germany', 'Nigeria', 'Iran'],
        datasets: [{
          data: [42, 38, 28, 21, 18, 14, 8, 7],
          backgroundColor: ['#FF3A5C','#FF3A5C','#00C8FF','#FF9500','#FF3A5C','#00C8FF','#FF3A5C','#FF3A5C'],
          borderRadius: 4,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,200,255,0.05)' }, ticks: { color: '#3D5F7A' } },
          y: { grid: { display: false }, ticks: { color: '#6A9EC0', font: { size: 11 } } }
        }
      }
    });
  }
}

// ── LIVE THREAT FEED ──
const threats = [
  { url: 'paypal-secure-login.xyz', country: '🇷🇺 Russia', type: 'phishing', score: 92, ip: '185.220.101.42', date: '2026-04-07 14:22', blockchain: 'Logged' },
  { url: 'crypto-airdrop-claim.tk', country: '🇨🇳 China', type: 'malware', score: 88, ip: '194.165.16.48', date: '2026-04-07 14:18', blockchain: 'Logged' },
  { url: 'amazon-verify-account.ml', country: '🇧🇷 Brazil', type: 'phishing', score: 85, ip: '5.188.206.100', date: '2026-04-07 14:11', blockchain: 'Logged' },
  { url: 'netflix-billing-update.xyz', country: '🇷🇺 Russia', type: 'phishing', score: 81, ip: '45.142.212.90', date: '2026-04-07 13:55', blockchain: 'Logged' },
  { url: 'btc-wallet-restore.info', country: '🇳🇬 Nigeria', type: 'malware', score: 79, ip: '103.234.220.195', date: '2026-04-07 13:40', blockchain: 'Pending' },
  { url: 'secure-bankofamerica.cc', country: '🇺🇸 USA', type: 'phishing', score: 76, ip: '185.234.219.4', date: '2026-04-07 12:58', blockchain: 'Logged' },
  { url: 'suspicious-redirect.net', country: '🇮🇳 India', type: 'suspicious', score: 62, ip: '91.195.240.122', date: '2026-04-07 13:22', blockchain: 'Logged' },
  { url: 'microsoft-support-help.co', country: '🇨🇳 China', type: 'phishing', score: 89, ip: '77.83.247.112', date: '2026-04-07 12:33', blockchain: 'Logged' },
  { url: 'github.com', country: '🇺🇸 USA', type: 'safe', score: 2, ip: '140.82.114.4', date: '2026-04-07 12:10', blockchain: 'N/A' },
  { url: 'free-gift-claim.ga', country: '🇳🇬 Nigeria', type: 'suspicious', score: 68, ip: '196.203.35.77', date: '2026-04-07 11:44', blockchain: 'Logged' },
  { url: 'apple-id-verification.tk', country: '🇷🇺 Russia', type: 'phishing', score: 94, ip: '178.128.45.67', date: '2026-04-07 11:20', blockchain: 'Logged' },
  { url: 'win-iphone-now.ml', country: '🇨🇳 China', type: 'suspicious', score: 73, ip: '202.146.89.123', date: '2026-04-07 10:55', blockchain: 'Logged' },
  { url: 'google.com', country: '🇺🇸 USA', type: 'safe', score: 1, ip: '172.217.14.110', date: '2026-04-07 10:30', blockchain: 'N/A' },
  { url: 'facebook-security-alert.xyz', country: '🇧🇷 Brazil', type: 'phishing', score: 87, ip: '191.232.45.78', date: '2026-04-07 10:15', blockchain: 'Logged' },
  { url: 'download-malware.cf', country: '🇷🇺 Russia', type: 'malware', score: 96, ip: '185.159.157.45', date: '2026-04-07 09:45', blockchain: 'Logged' }
];

const typeColors = {
  phishing: '#FF3A5C',
  malware: '#FF9500',
  suspicious: '#FFD60A',
  safe: '#00FF88',
};

function renderThreatFeed() {
  const feed = document.getElementById('threatFeed');
  if (!feed) return;
  feed.innerHTML = '';
  threats.slice(0, 8).forEach(t => {
    const item = document.createElement('div');
    item.className = `threat-item ${t.type}`;
    item.innerHTML = `
      <div class="threat-dot" style="background:${typeColors[t.type]};box-shadow:0 0 6px ${typeColors[t.type]}"></div>
      <div class="threat-info">
        <div class="threat-url">${t.url}</div>
        <div class="threat-meta">
          <span>${t.country}</span>
          <span style="text-transform:uppercase;font-size:9px;color:${typeColors[t.type]}">${t.type}</span>
        </div>
      </div>
      <div class="threat-score" style="color:${typeColors[t.type]}">${t.score}</div>
    `;
    feed.appendChild(item);
  });
}

// Simulate live additions
setInterval(() => {
  const newThreats = [
    { url: 'fake-paypal-' + Math.random().toString(36).substr(2,4) + '.xyz', country: '🇷🇺 Russia', type: 'phishing', score: Math.floor(80 + Math.random() * 15) },
    { url: 'malware-download-' + Math.random().toString(36).substr(2,4) + '.tk', country: '🇨🇳 China', type: 'malware', score: Math.floor(70 + Math.random() * 20) },
    { url: 'legit-site-' + Math.random().toString(36).substr(2,4) + '.com', country: '🇺🇸 USA', type: 'safe', score: Math.floor(1 + Math.random() * 8) },
  ];
  threats.unshift(newThreats[Math.floor(Math.random() * newThreats.length)]);
  if (threats.length > 20) threats.pop();
  renderThreatFeed();
  // Update stats
  const todayEl = document.getElementById('statThreatsToday');
  if (todayEl) todayEl.textContent = parseInt(todayEl.textContent) + 1;
}, 5000);

// ── URL SCANNER ──
function scanURL() {
  const input = document.getElementById('scanInput');
  const url = input ? input.value.trim() : '';
  if (!url) { showScanError('Please enter a URL to scan.'); return; }

  const resultEl = document.getElementById('scanResult');
  const loadingEl = document.getElementById('scanLoading');

  if (resultEl) resultEl.classList.remove('visible');
  if (loadingEl) loadingEl.classList.add('active');

  setTimeout(() => {
    if (loadingEl) loadingEl.classList.remove('active');
    analyzURL(url);
  }, 2500);
}

function analyzURL(url) {
  // Heuristic analysis
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

  showScanResult(url, type, score, reasons);
}

function showScanResult(url, type, score, reasons) {
  const resultEl = document.getElementById('scanResult');
  if (!resultEl) return;

  const typeColors = {
    safe: '#00FF88',
    suspicious: '#FF9500',
    phishing: '#FF3A5C',
    malware: '#FF3A5C'
  };

  const color = typeColors[type];
  const circumference = 2 * Math.PI * 30;
  const dashoffset = circumference * (1 - score / 100);

  resultEl.innerHTML = `
    <div class="result-header">
      <div class="result-score-ring">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="6"/>
          <circle cx="40" cy="40" r="30" fill="none" stroke="${color}" stroke-width="6"
            stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"
            stroke-linecap="round"/>
        </svg>
        <div class="score-text">
          <span class="score-num" style="color:${color}">${score}</span>
          <span class="score-label">RISK</span>
        </div>
      </div>
      <div style="flex:1">
        <div class="result-verdict verdict-${type}">${type.toUpperCase()}</div>
        <div style="margin-top:10px;font-family:'Space Mono',monospace;font-size:11px;color:#6A9EC0;word-break:break-all">${url}</div>
      </div>
    </div>
    <div class="result-details">
      <div class="detail-item">
        <div class="detail-label">Threat Type</div>
        <div class="detail-value" style="color:${color}">${type.charAt(0).toUpperCase()+type.slice(1)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Risk Score</div>
        <div class="detail-value" style="color:${color}">${score}/100</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Domain Status</div>
        <div class="detail-value">${score > 50 ? '⚠ Suspicious' : '✓ Clean'}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">SSL Valid</div>
        <div class="detail-value">${score > 60 ? '✗ Invalid' : '✓ Valid'}</div>
      </div>
    </div>
    ${reasons.length ? `
    <div style="margin-top:14px;padding:12px;background:rgba(255,58,92,0.05);border:1px solid rgba(255,58,92,0.15);border-radius:8px">
      <div style="font-size:10px;font-weight:700;color:var(--text-dim);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">Detection Reasons</div>
      ${reasons.map(r => `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">• ${r}</div>`).join('')}
    </div>` : ''}
  `;

  resultEl.classList.add('visible');

  // Add to threat feed
  const domain = url.replace(/^https?:\/\//, '').split('/')[0];
  threats.unshift({ url: domain, country: '🔍 Scanned', type, score });
  renderThreatFeed();
}

function showScanError(msg) {
  const resultEl = document.getElementById('scanResult');
  if (!resultEl) return;
  resultEl.innerHTML = `<div style="color:var(--red);font-size:13px;padding:12px">${msg}</div>`;
  resultEl.classList.add('visible');
}

// ── POPULATE THREAT TABLE ──
function populateThreatTable() {
  const tbody = document.getElementById('threatTableBody');
  if (!tbody) return;

  // Enhanced threat data with more realistic information
  const enhancedThreats = threats.map(threat => ({
    ...threat,
    ip: threat.ip || generateRandomIP(),
    date: threat.date || new Date().toLocaleString(),
    blockchain: threat.blockchain || (Math.random() > 0.3 ? 'Logged' : 'Pending')
  }));

  tbody.innerHTML = enhancedThreats.slice(0, 15).map(row => {
    const scoreColor = row.score > 70 ? '#FF3A5C' : row.score > 40 ? '#FF9500' : '#00FF88';
    return `
      <tr>
        <td class="url-cell">${row.url}</td>
        <td><span style="font-family:'Space Mono',monospace;font-size:10px;color:#3D5F7A">${row.ip}</span></td>
        <td style="font-size:11px">${row.country}</td>
        <td><span class="type-badge type-${row.type}">${row.type}</span></td>
        <td><span style="font-family:'Orbitron',monospace;font-size:13px;font-weight:700;color:${scoreColor}">${row.score}</span></td>
        <td style="font-size:11px;color:#3D5F7A">${row.date}</td>
        <td><span style="font-size:10px;font-weight:600;color:${row.blockchain==='Logged'?'#7C3AED':row.blockchain==='Pending'?'#FF9500':'#3D5F7A'}">${row.blockchain}</span></td>
      </tr>
    `;
  }).join('');
}

// ── BLOCKCHAIN LOGS ──
function populateBlockchain() {
  const container = document.getElementById('blockchainLogs');
  if (!container) return;

  const logs = [
    { block: '#1847392', hash: 'a3f8c2d91b4e7f0a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6', url: 'paypal-secure-login.xyz', txid: '0x7f3e8a...d92c', time: '14:22:05', type: 'phishing' },
    { block: '#1847391', hash: 'b5e9d3c02f5a8b1c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7', url: 'crypto-airdrop-claim.tk', txid: '0x4a1f9b...e83d', time: '14:18:12', type: 'malware' },
    { block: '#1847390', hash: 'c7d1e4b13c6a9b2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', url: 'amazon-verify-account.ml', txid: '0x2d8e7c...f15a', time: '14:11:33', type: 'phishing' },
    { block: '#1847389', hash: 'd9f2b5c24e7b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6', url: 'netflix-billing-update.xyz', txid: '0x8b3d2a...c47e', time: '13:55:48', type: 'phishing' },
    { block: '#1847388', hash: 'e1a3c6d35f8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7', url: 'secure-bankofamerica.cc', txid: '0x5c9f4e...b28d', time: '12:58:21', type: 'phishing' },
    { block: '#1847387', hash: 'f2b4d7e46c9b0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6', url: 'microsoft-support-help.co', txid: '0x3e7a1d...f96b', time: '12:33:05', type: 'phishing' },
  ];

  container.innerHTML = logs.map(log => `
    <div class="block-item">
      <div class="block-num">${log.block}</div>
      <div style="flex:1;min-width:0">
        <div style="font-family:'Space Mono',monospace;font-size:9px;color:#3D5F7A;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${log.hash}
        </div>
        <div style="display:flex;gap:16px;align-items:center">
          <span style="font-size:11px;color:#6A9EC0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px">${log.url}</span>
          <span style="font-family:'Space Mono',monospace;font-size:10px;color:#7C3AED">${log.txid}</span>
          <span class="type-badge type-${log.type}" style="font-size:9px">${log.type}</span>
        </div>
      </div>
      <div class="block-time">${log.time}</div>
      <div class="block-verified">✓ VERIFIED</div>
    </div>
  `).join('');
}

// ── ADVANCED THREAT INTELLIGENCE ──
function initIntelligencePage() {
  // Simulate real-time threat campaign updates
  const campaigns = [
    { name: 'Operation Phantom Bank', type: 'phishing', origin: 'Russia', domains: 23, active: '2026-03-01' },
    { name: 'CryptoStealer-X', type: 'malware', origin: 'China', domains: 47, active: '2026-02-14' },
    { name: 'TechSupport Scam Wave', type: 'suspicious', origin: 'India', domains: 15, active: '2026-03-08' },
  ];

  setInterval(() => {
    campaigns.forEach(campaign => {
      campaign.domains += Math.floor(Math.random() * 3);
    });
    // Update UI if on intelligence page
    if (document.getElementById('page-intelligence').classList.contains('active')) {
      // Update campaign counters
    }
  }, 10000);
}

// ── PROFILE MANAGEMENT ──
function initProfilePage() {
  // Toggle settings
  document.querySelectorAll('.setting-toggle').forEach(toggle => {
    toggle.addEventListener('click', function() {
      this.classList.toggle('active');
      this.textContent = this.classList.contains('active') ? 'ON' : 'OFF';
    });
  });

  // Edit profile button
  document.querySelector('.btn-edit-profile')?.addEventListener('click', function() {
    alert('Profile editing functionality would open a modal here in a full implementation.');
  });
}

// ── ADVANCED ANALYTICS ──
function initAdvancedAnalytics() {
  // Real-time data updates for analytics
  const analyticsData = {
    phishing: 16,
    malware: 10,
    suspicious: 14,
    safe: 10
  };

  setInterval(() => {
    // Simulate new detections
    const types = ['phishing', 'malware', 'suspicious', 'safe'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    analyticsData[randomType]++;

    // Update analytics page if active
    if (document.getElementById('page-analytics').classList.contains('active')) {
      updateAnalyticsDisplay(analyticsData);
    }
  }, 8000);
}

function updateAnalyticsDisplay(data) {
  // Update stat cards
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  document.querySelectorAll('.stat-card .stat-value').forEach((el, i) => {
    const values = [data.phishing, data.malware, data.suspicious, data.safe];
    if (values[i] !== undefined) {
      el.textContent = values[i];
      const percentage = Math.round((values[i] / total) * 100);
      el.nextElementSibling.textContent = `${percentage}% of total`;
    }
  });
}

// ── ENHANCED URL SCANNER ──
function enhancedScanURL() {
  const input = document.getElementById('scanInput');
  const url = input ? input.value.trim() : '';
  if (!url) { 
    showScanError('Please enter a URL to scan.'); 
    return; 
  }

  // Validate URL format
  try {
    new URL(url.startsWith('http') ? url : 'https://' + url);
  } catch {
    showScanError('Please enter a valid URL format.');
    return;
  }

  const resultEl = document.getElementById('scanResult');
  const loadingEl = document.getElementById('scanLoading');

  if (resultEl) resultEl.classList.remove('visible');
  if (loadingEl) loadingEl.classList.add('active');

  // Simulate API calls to multiple threat intelligence sources
  setTimeout(() => {
    if (loadingEl) loadingEl.classList.remove('active');
    performAdvancedAnalysis(url);
  }, 3000);
}

function performAdvancedAnalysis(url) {
  // Enhanced analysis with multiple factors
  const analysis = {
    url: url,
    domain: url.replace(/^https?:\/\//, '').split('/')[0],
    timestamp: new Date().toISOString(),
    sources: {
      virusTotal: Math.random() > 0.8 ? 'flagged' : 'clean',
      phishTank: Math.random() > 0.9 ? 'flagged' : 'clean',
      abuseIPDB: Math.random() > 0.85 ? 'flagged' : 'clean',
      urlHaus: Math.random() > 0.95 ? 'flagged' : 'clean'
    }
  };

  // Calculate composite risk score
  let score = 0;
  let reasons = [];
  const lower = url.toLowerCase();

  // Source-based scoring
  Object.entries(analysis.sources).forEach(([source, status]) => {
    if (status === 'flagged') {
      score += 25;
      reasons.push(`Flagged by ${source}`);
    }
  });

  // Heuristic analysis (existing logic)
  const phishingKeywords = ['secure', 'login', 'verify', 'update', 'banking', 'paypal', 'amazon', 'netflix'];
  const malwareDomains = ['.tk', '.ml', '.ga', '.cf', '.gq'];
  
  malwareDomains.forEach(ext => {
    if (lower.includes(ext)) { score += 35; reasons.push('Suspicious TLD detected'); }
  });

  let kwCount = 0;
  phishingKeywords.forEach(kw => {
    if (lower.includes(kw)) { kwCount++; score += 15; }
  });
  if (kwCount > 1) reasons.push('Multiple phishing keywords');

  if (url.length > 60) { score += 10; reasons.push('Abnormal URL length'); }
  
  const hyphens = (url.match(/-/g) || []).length;
  if (hyphens > 3) { score += 15; reasons.push('Excessive hyphens in domain'); }

  if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url)) { 
    score += 40; 
    reasons.push('IP address used instead of domain'); 
  }

  // Determine threat type
  let type = 'safe';
  if (lower.includes('github.com') || lower.includes('google.com') || lower.includes('microsoft.com')) {
    score = 2; type = 'safe'; reasons = ['Verified legitimate domain'];
  } else if (score >= 70) {
    type = 'phishing';
    if (lower.includes('.tk') || lower.includes('.ml')) type = 'malware';
  } else if (score >= 40) {
    type = 'suspicious';
  } else if (score >= 20) {
    type = 'suspicious';
  }

  score = Math.min(score, 99);

  showAdvancedScanResult(url, type, score, reasons, analysis);
}

function showAdvancedScanResult(url, type, score, reasons, analysis) {
  const resultEl = document.getElementById('scanResult');
  if (!resultEl) return;

  const typeColors = {
    safe: '#00FF88',
    suspicious: '#FF9500',
    phishing: '#FF3A5C',
    malware: '#FF3A5C'
  };

  const color = typeColors[type];
  const circumference = 2 * Math.PI * 30;
  const dashoffset = circumference * (1 - score / 100);

  resultEl.innerHTML = `
    <div class="result-header">
      <div class="result-score-ring">
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="6"/>
          <circle cx="40" cy="40" r="30" fill="none" stroke="${color}" stroke-width="6"
            stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"
            stroke-linecap="round"/>
        </svg>
        <div class="score-text">
          <span class="score-num" style="color:${color}">${score}</span>
          <span class="score-label">RISK</span>
        </div>
      </div>
      <div style="flex:1">
        <div class="result-verdict verdict-${type}">${type.toUpperCase()}</div>
        <div style="margin-top:10px;font-family:'Space Mono',monospace;font-size:11px;color:#6A9EC0;word-break:break-all">${url}</div>
      </div>
    </div>
    
    <div class="result-sources">
      <div class="source-title">Threat Intelligence Sources</div>
      <div class="source-grid">
        ${Object.entries(analysis.sources).map(([source, status]) => `
          <div class="source-item ${status}">
            <div class="source-name">${source}</div>
            <div class="source-status">${status === 'flagged' ? '⚠ FLAGGED' : '✓ CLEAN'}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="result-details">
      <div class="detail-item">
        <div class="detail-label">Threat Type</div>
        <div class="detail-value" style="color:${color}">${type.charAt(0).toUpperCase()+type.slice(1)}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Risk Score</div>
        <div class="detail-value" style="color:${color}">${score}/100</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Domain Status</div>
        <div class="detail-value">${score > 50 ? '⚠ Suspicious' : '✓ Clean'}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">SSL Valid</div>
        <div class="detail-value">${score > 60 ? '✗ Invalid' : '✓ Valid'}</div>
      </div>
    </div>
    
    ${reasons.length ? `
    <div style="margin-top:14px;padding:12px;background:rgba(255,58,92,0.05);border:1px solid rgba(255,58,92,0.15);border-radius:8px">
      <div style="font-size:10px;font-weight:700;color:var(--text-dim);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">Detection Reasons</div>
      ${reasons.map(r => `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:4px">• ${r}</div>`).join('')}
    </div>` : ''}
    
    <div class="blockchain-log-btn" onclick="logToBlockchain('${url}', '${type}', ${score})">
      🔗 Log to Blockchain
    </div>
  `;

  resultEl.classList.add('visible');

  // Add to threat feed and database
  const domain = url.replace(/^https?:\/\//, '').split('/')[0];
  threats.unshift({ 
    url: domain, 
    country: '🔍 Scanned', 
    type, 
    score,
    ip: generateRandomIP(),
    date: new Date().toLocaleString(),
    blockchain: 'Pending'
  });
  renderThreatFeed();
  populateThreatTable();
}

function generateRandomIP() {
  return Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
}

function logToBlockchain(url, type, score) {
  // Simulate blockchain logging
  const txId = '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4);
  const block = '#' + (1847392 + Math.floor(Math.random() * 100));
  
  alert(`Logging to blockchain...\nBlock: ${block}\nTransaction: ${txId}\nURL: ${url}\nType: ${type}\nScore: ${score}`);
  
  // Update the threat in the database
  const threat = threats.find(t => t.url === url.replace(/^https?:\/\//, '').split('/')[0]);
  if (threat) {
    threat.blockchain = 'Logged';
    populateThreatTable();
  }
}

// ── NOTIFICATIONS ──
document.getElementById('notifBtn')?.addEventListener('click', (e) => {
  e.stopPropagation();
  document.getElementById('notifDropdown')?.classList.toggle('open');
});

document.addEventListener('click', () => {
  document.getElementById('notifDropdown')?.classList.remove('open');
});

// ── SCROLL TO TOP ──
window.addEventListener('scroll', () => {
  const scrollBtn = document.querySelector('.scroll-top');
  if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 300);
});

document.querySelector('.scroll-top')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Check if user is logged in
if (!localStorage.getItem('loggedIn')) {
  window.location.href = 'login.html';
}

// Logout function
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'login.html';
}

// Logout on user card click
document.querySelector('.user-card')?.addEventListener('click', logout);

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initHeroCanvas();
  initWorldMap();
  initCharts();
  renderThreatFeed();
  populateThreatTable();
  populateBlockchain();
  initIntelligencePage();
  initProfilePage();
  initAdvancedAnalytics();
  navigate('dashboard');
});

// ── SCAN INPUT ENTER ──
document.getElementById('scanInput')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') enhancedScanURL();
});

// Enhanced scan button
document.getElementById('scanBtn')?.addEventListener('click', enhancedScanURL);

// ── FILTER TABLE ──
document.getElementById('tableSearch')?.addEventListener('input', function() {
  const val = this.value.toLowerCase();
  document.querySelectorAll('#threatTableBody tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(val) ? '' : 'none';
  });
});

// ── EXPORT CSV ──
function exportCSV() {
  const rows = [['URL','IP','Country','Type','Risk Score','Date','Blockchain']];
  document.querySelectorAll('#threatTableBody tr').forEach(row => {
    const cells = [...row.querySelectorAll('td')].map(td => td.textContent.trim());
    rows.push(cells);
  });
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'linkcortexa-threats.csv';
  a.click();
}
