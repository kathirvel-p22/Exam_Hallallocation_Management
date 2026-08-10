const APP_URL = "https://ais-dev-dmxgdt4e5a4ikjxziw3tp7-580156754524.asia-southeast1.run.app";

// Track tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    console.log("URL updated:", changeInfo.url);
    analyzeUrl(changeInfo.url);
  }
});

// Track new tab creations
chrome.tabs.onCreated.addListener((tab) => {
  if (tab.url) {
    console.log("New tab created:", tab.url);
    analyzeUrl(tab.url);
  }
});

// Track when a tab becomes active
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      console.log("Tab activated:", tab.url);
      analyzeUrl(tab.url);
    }
  });
});

// Analyze all open tabs on startup or installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url) {
        console.log("Analyzing existing tab:", tab.url);
        analyzeUrl(tab.url);
      }
    });
  });
});

async function analyzeUrl(url) {
  // Validate URL and skip internal chrome pages or malformed URLs
  if (!url || typeof url !== 'string') return;
  if (url.startsWith("chrome://") || url.startsWith("chrome-extension://") || url.startsWith("about:")) return;

  try {
    const response = await fetch(`${APP_URL}/api/analyze/url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, source: "extension" })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.analysis && data.analysis.riskScore > 70) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "⚠️ Threat Detected!",
        message: `LinkCortexa AI blocked a high-risk URL: ${url}`
      });
    }
  } catch (e) {
    console.error("Extension Analysis Failure:", e.message);
    // Optional: Log failure to a local storage for debugging
    chrome.storage.local.set({ lastError: { url, error: e.message, timestamp: Date.now() } });
  }
}
