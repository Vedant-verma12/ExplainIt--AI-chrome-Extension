const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const PROMPTS = {
  summary: 'Provide a concise summary of the following webpage content in 3-4 paragraphs:',
  explain: 'Explain the following webpage content in detail, breaking down complex concepts:',
  simple: 'Explain the following webpage content in simple terms that anyone can understand (like ELI5):',
  key: 'Extract the key points from the following webpage content as a bulleted list:'
};

document.addEventListener('DOMContentLoaded', async () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsView = document.getElementById('settingsView');
  const mainView = document.getElementById('mainView');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const resultArea = document.getElementById('resultArea');
  const customQuestion = document.getElementById('customQuestion');
  const askBtn = document.getElementById('askBtn');

  // Load API key
  const { apiKey } = await chrome.storage.local.get('apiKey');
  if (apiKey) apiKeyInput.value = apiKey;

  // If no API key, show settings
  if (!apiKey) {
    settingsView.classList.remove('hidden');
    mainView.classList.add('hidden');
  }

  // Toggle Settings
  settingsBtn.addEventListener('click', () => {
    settingsView.classList.toggle('hidden');
    mainView.classList.toggle('hidden');
  });

  // Save Settings
  saveSettingsBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) return;
    await chrome.storage.local.set({ apiKey: key });
    settingsView.classList.add('hidden');
    mainView.classList.remove('hidden');
  });

  // Action buttons
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      handleRequest(PROMPTS[mode]);
    });
  });

  // Ask custom question
  askBtn.addEventListener('click', () => {
    const q = customQuestion.value.trim();
    if (q) handleRequest(`Based on the webpage content, answer this question: ${q}`);
  });

  customQuestion.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askBtn.click();
  });

  async function handleRequest(prompt) {
    const { apiKey } = await chrome.storage.local.get('apiKey');
    if (!apiKey) {
      showError('Please set your Gemini API key in settings.');
      return;
    }

    showLoading();

    try {
      // Get page content
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const [{ result: pageContent }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractContent
      });

      if (!pageContent) {
        showError('Could not extract content from this page.');
        return;
      }

      // Truncate if too long (Gemini has limits)
      const truncated = pageContent.slice(0, 30000);
      const fullPrompt = `${prompt}\n\nWebpage Title: ${tab.title}\nURL: ${tab.url}\n\nContent:\n${truncated}`;

      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: fullPrompt }]
          }]
        })
      });

      const data = await response.json();

      if (data.error) {
        showError(data.error.message || 'API Error');
        return;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        showResult(text);
      } else {
        showError('No response from AI.');
      }
    } catch (err) {
      showError(err.message);
    }
  }

  function showLoading() {
    resultArea.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <div class="loading-text">Analyzing page with AI...</div>
      </div>
    `;
  }

  function showResult(text) {
    const formatted = formatMarkdown(text);
    resultArea.innerHTML = `<div class="result-content">${formatted}</div>`;
  }

  function showError(msg) {
    resultArea.innerHTML = `<div class="error">⚠️ ${msg}</div>`;
  }

  function formatMarkdown(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^\* (.+)$/gm, '<li>$1</li>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/m, '<p>$1</p>');
  }
});

// Function injected into the page
function extractContent() {
  // Remove scripts, styles, navs
  const clone = document.body.cloneNode(true);
  clone.querySelectorAll('script, style, nav, footer, aside, iframe').forEach(el => el.remove());
  return clone.innerText.replace(/\s+/g, ' ').trim();
}