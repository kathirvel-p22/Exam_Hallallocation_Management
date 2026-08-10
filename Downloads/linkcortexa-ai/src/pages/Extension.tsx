import React, { useState } from 'react';
import { Shield, Download, Globe, Settings, CheckCircle, AlertTriangle, Terminal, Copy, ExternalLink, Zap, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Extension() {
  const [copied, setCopied] = useState<string | null>(null);

  const manifestCode = `{
  "manifest_version": 3,
  "name": "LinkCortexa AI Protection",
  "version": "1.0.0",
  "description": "Real-time browser protection and threat analysis powered by LinkCortexa AI.",
  "permissions": ["tabs", "storage", "notifications", "activeTab"],
  "host_permissions": ["*://*/*"],
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "background.js"
  }
}`;

  const backgroundCode = `const APP_URL = "${window.location.origin}";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    analyzeUrl(changeInfo.url);
  }
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    analyzeUrl(tab.url);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url) analyzeUrl(tab.url);
    });
  });
});

async function analyzeUrl(url) {
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://")) return;

  try {
    const response = await fetch(\`\${APP_URL}/api/analyze/url\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, source: "extension" })
    });
    const data = await response.json();
    
    if (data.analysis && data.analysis.riskScore > 70) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "⚠️ Threat Detected!",
        message: \`LinkCortexa AI blocked a high-risk URL: \${url}\`
      });
    }
  } catch (e) {
    console.error("Extension Analysis Error:", e);
  }
}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-brand-surface border border-brand-border p-10 lg:p-16">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-blue/10 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-[10px] font-black uppercase tracking-widest mb-6"
          >
            <Globe className="w-3 h-3" />
            Browser Integration
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-[0.9] mb-6"
          >
            LINKCORTEXA <span className="text-brand-blue">SENTINEL</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-400 leading-relaxed"
          >
            Extend the power of LinkCortexa AI to your entire browsing experience. 
            The Sentinel extension tracks all open tabs in real-time, analyzing URLs 
            against our neural threat database.
          </motion.p>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-8">
            <h2 className="text-2xl font-black text-white tracking-tight mb-8 flex items-center gap-3">
              <Terminal className="w-6 h-6 text-brand-blue" />
              MANUAL INSTALLATION
            </h2>

            <div className="space-y-10">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-black text-sm">1</div>
                  <h3 className="text-lg font-bold text-white">Create Extension Folder</h3>
                </div>
                <p className="text-slate-400 text-sm pl-12">
                  Create a new folder on your computer named <code className="text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">linkcortexa-extension</code>.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-black text-sm">2</div>
                  <h3 className="text-lg font-bold text-white">Create manifest.json</h3>
                </div>
                <div className="pl-12 space-y-4">
                  <p className="text-slate-400 text-sm">Create a file named <code className="text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">manifest.json</code> inside the folder and paste the following:</p>
                  <div className="relative group">
                    <pre className="bg-brand-dark border border-brand-border rounded-2xl p-6 text-xs font-mono text-slate-300 overflow-x-auto max-h-60">
                      {manifestCode}
                    </pre>
                    <button 
                      onClick={() => copyToClipboard(manifestCode, 'manifest')}
                      className="absolute top-4 right-4 p-2 bg-brand-surface border border-brand-border rounded-lg text-slate-400 hover:text-white transition-all"
                    >
                      {copied === 'manifest' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-black text-sm">3</div>
                  <h3 className="text-lg font-bold text-white">Create background.js</h3>
                </div>
                <div className="pl-12 space-y-4">
                  <p className="text-slate-400 text-sm">Create a file named <code className="text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded">background.js</code> and paste the following:</p>
                  <div className="relative group">
                    <pre className="bg-brand-dark border border-brand-border rounded-2xl p-6 text-xs font-mono text-slate-300 overflow-x-auto max-h-60">
                      {backgroundCode}
                    </pre>
                    <button 
                      onClick={() => copyToClipboard(backgroundCode, 'background')}
                      className="absolute top-4 right-4 p-2 bg-brand-surface border border-brand-border rounded-lg text-slate-400 hover:text-white transition-all"
                    >
                      {copied === 'background' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center font-black text-sm">4</div>
                  <h3 className="text-lg font-bold text-white">Load in Chrome</h3>
                </div>
                <div className="pl-12 space-y-4">
                  <ul className="list-disc list-inside text-slate-400 text-sm space-y-2">
                    <li>Open Chrome and navigate to <code className="text-brand-blue">chrome://extensions</code></li>
                    <li>Enable <span className="text-white font-bold">Developer mode</span> (top right toggle)</li>
                    <li>Click <span className="text-white font-bold">Load unpacked</span></li>
                    <li>Select your <code className="text-brand-blue">linkcortexa-extension</code> folder</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Features Card */}
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-8">
            <h3 className="text-xl font-black text-white tracking-tight mb-6 uppercase">SENTINEL FEATURES</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="p-2 bg-brand-blue/10 rounded-lg shrink-0">
                  <Globe className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Multi-Tab Tracking</p>
                  <p className="text-xs text-slate-500 mt-1">Automatically monitors all open tabs and new navigation events.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-2 bg-brand-blue/10 rounded-lg shrink-0">
                  <Zap className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Neural Analysis</p>
                  <p className="text-xs text-slate-500 mt-1">Real-time risk scoring using LinkCortexa's AI threat detection.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="p-2 bg-brand-blue/10 rounded-lg shrink-0">
                  <Lock className="w-5 h-5 text-brand-blue" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Instant Blocking</p>
                  <p className="text-xs text-slate-500 mt-1">Immediate desktop notifications when high-risk URLs are detected.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-black text-yellow-500 uppercase">SECURITY NOTE</h3>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              LinkCortexa Sentinel requires <span className="text-white font-bold">tabs</span> permission to monitor your browsing. 
              Data is only sent to your private LinkCortexa instance for analysis. We never store your browsing history permanently.
            </p>
          </div>

          {/* Quick Link */}
          <a 
            href="https://developer.chrome.com/docs/extensions/mv3/getstarted/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-6 bg-brand-dark border border-brand-border rounded-2xl hover:border-brand-blue/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-slate-500 group-hover:text-brand-blue" />
              <span className="text-sm font-bold text-slate-400 group-hover:text-white">Extension Docs</span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
