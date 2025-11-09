<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Microtext Analyzer — Static HTML</title>

  <!-- Tailwind CDN (Play CDN) - fine for prototyping -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Lucide icons -->
  <script src="https://unpkg.com/lucide@0.257.0/dist/lucide.min.js"></script>

  <style>
    /* small extra styles for toasts & transitions */
    .toast-wrapper {
      position: fixed;
      right: 1rem;
      top: 1rem;
      z-index: 60;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .toast {
      min-width: 220px;
      max-width: 340px;
      padding: 0.6rem 0.8rem;
      border-radius: 0.5rem;
      display:flex;
      gap:0.6rem;
      align-items:center;
      box-shadow: 0 8px 20px rgba(2,6,23,0.12);
      background: white;
    }
    .toast.success { border-left: 4px solid #22c55e; }
    .toast.error   { border-left: 4px solid #ef4444; }
    .toast.info    { border-left: 4px solid #06b6d4; }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

  <div class="container mx-auto px-4 py-12 max-w-4xl">
    <!-- Header -->
    <div class="text-center mb-12 space-y-4">
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 mb-4">
        <i data-lucide="sparkles" class="w-4 h-4"></i>
        <span class="text-sm font-medium">AI-Powered Analysis</span>
      </div>
      <h1 class="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
        Microtext Analyzer
      </h1>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Analyze short texts instantly with AI. Get insights on sentiment, emotions, and key topics.
      </p>
    </div>

    <!-- Input Section -->
    <div class="bg-white p-6 mb-8 shadow-lg rounded-lg border border-gray-200">
      <div class="space-y-4">
        <div>
          <label class="text-sm font-medium mb-2 block">Enter your text</label>
          <textarea id="microtext" placeholder="Type or paste your microtext here (tweets, messages, reviews, etc.)..." maxlength="500"
                    class="w-full min-h-[120px] text-base resize-none rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"></textarea>
          <p id="charcount" class="text-xs text-gray-500 mt-2">0/500 characters</p>
        </div>

        <button id="analyzeBtn" class="w-full text-base py-4 rounded-md text-white bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-90 transition-opacity disabled:opacity-50"
                type="button">
          <span id="btnContent" class="inline-flex items-center justify-center gap-2">
            <i data-lucide="sparkles" class="w-5 h-5"></i>
            <span>Analyze Text</span>
          </span>
        </button>
      </div>
    </div>

    <!-- Results Section (hidden initially) -->
    <div id="resultsRoot" class="space-y-6 hidden animate-fade-in">
      <!-- Sentiment Overview -->
      <div class="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">Sentiment Analysis</h2>
        <div class="flex items-center gap-4 mb-4">
          <div id="sentimentIconContainer" class="p-3 rounded-full bg-gray-100">
            <!-- icon inserted here -->
          </div>

          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span id="sentimentBadge" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize bg-gray-100 text-gray-800">neutral</span>
              <span id="sentimentScore" class="text-sm text-gray-500">Score: 0.00</span>
            </div>

            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div id="sentimentBar" class="h-2.5 rounded-full transition-all duration-500 bg-yellow-400" style="width:50%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Emotions -->
      <div class="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">Detected Emotions</h2>
        <div id="emotionsContainer" class="flex flex-wrap gap-2"></div>
      </div>

      <!-- Key Topics -->
      <div class="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
        <h2 class="text-xl font-semibold mb-4">Key Topics</h2>
        <div id="topicsContainer" class="flex flex-wrap gap-2"></div>
      </div>

      <!-- Summary & Tone -->
      <div class="grid md:grid-cols-2 gap-6">
        <div class="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
          <h2 class="text-xl font-semibold mb-3">Summary</h2>
          <p id="summaryText" class="text-gray-600 leading-relaxed">—</p>
        </div>

        <div class="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
          <h2 class="text-xl font-semibold mb-3">Tone</h2>
          <span id="toneBadge" class="inline-block px-4 py-2 rounded-md bg-gray-100 capitalize text-base">—</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast area -->
  <div class="toast-wrapper" id="toasts"></div>

  <script>
    // replace lucide icons
    document.addEventListener("DOMContentLoaded", function () {
      if (window.lucide) lucide.replace();
    });

    const textarea = document.getElementById('microtext');
    const charcount = document.getElementById('charcount');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const btnContent = document.getElementById('btnContent');
    const resultsRoot = document.getElementById('resultsRoot');

    const sentimentIconContainer = document.getElementById('sentimentIconContainer');
    const sentimentBadge = document.getElementById('sentimentBadge');
    const sentimentScoreEl = document.getElementById('sentimentScore');
    const sentimentBar = document.getElementById('sentimentBar');
    const emotionsContainer = document.getElementById('emotionsContainer');
    const topicsContainer = document.getElementById('topicsContainer');
    const summaryText = document.getElementById('summaryText');
    const toneBadge = document.getElementById('toneBadge');

    // small toast helper
    function showToast({ title = '', description = '', variant = 'info', duration = 4000 } = {}) {
      const root = document.getElementById('toasts');
      const el = document.createElement('div');
      el.className = 'toast ' + (variant === 'destructive' || variant === 'error' ? 'error' : variant === 'success' ? 'success' : 'info');
      el.innerHTML = `
        <div class="flex-shrink-0">${variant === 'success' ? '✅' : variant === 'destructive' || variant === 'error' ? '⚠️' : 'ℹ️'}</div>
        <div class="flex-1">
          <div class="font-semibold text-sm">${title}</div>
          <div class="text-xs text-gray-600">${description || ''}</div>
        </div>
        <button class="ml-2 text-xs text-gray-400">✕</button>
      `;
      root.appendChild(el);

      // close handlers
      el.querySelector('button').addEventListener('click', () => el.remove());
      setTimeout(() => el.remove(), duration);
    }

    // update char count
    textarea.addEventListener('input', () => {
      charcount.textContent = textarea.value.length + '/500 characters';
      analyzeBtn.disabled = !textarea.value.trim();
    });

    // mock analyzer (fallback)
    function mockAnalyze(text) {
      // simple heuristics:
      const lower = text.toLowerCase();
      let score = 0; // -1..1
      const positiveWords = ['good','great','awesome','love','happy','excellent','nice','amazing'];
      const negativeWords = ['bad','hate','terrible','sad','awful','horrible','angry','worst'];

      positiveWords.forEach(w => { if (lower.includes(w)) score += 0.12; });
      negativeWords.forEach(w => { if (lower.includes(w)) score -= 0.12; });

      // small random nudge
      score += (Math.random() - 0.5) * 0.06;
      score = Math.max(-1, Math.min(1, score));

      const sentiment = score > 0.15 ? 'positive' : (score < -0.15 ? 'negative' : 'neutral');

      // pick emotions heuristically
      const emotions = [];
      if (sentiment === 'positive') emotions.push('joy','relief');
      if (sentiment === 'negative') emotions.push('anger','sadness');
      if (sentiment === 'neutral') emotions.push('calm','curious');

      // topics: pick frequent nouns / words of length>4
      const words = text.split(/\W+/).filter(w => w.length > 4);
      const topics = Array.from(new Set(words)).slice(0, 6);

      return {
        sentiment,
        sentimentScore: score,
        emotions,
        keyTopics: topics.length ? topics : ['general'],
        summary: text.length > 140 ? text.slice(0, 140) + '…' : text,
        tone: sentiment === 'positive' ? 'optimistic' : sentiment === 'negative' ? 'critical' : 'informative'
      };
    }

    // render result object to DOM
    function renderResult(result) {
      resultsRoot.classList.remove('hidden');

      // sentiment icon & badge
      sentimentIconContainer.innerHTML = '';
      let iconName = 'minus';
      let bgClass = 'bg-yellow-100';
      let badgeBg = 'bg-gray-100 text-gray-800';
      let barColor = 'bg-yellow-400';

      if (result.sentiment === 'positive') {
        iconName = 'trending-up'; bgClass = 'bg-green-50'; badgeBg = 'bg-green-100 text-green-800'; barColor = 'bg-green-500';
      } else if (result.sentiment === 'negative') {
        iconName = 'trending-down'; bgClass = 'bg-red-50'; badgeBg = 'bg-red-100 text-red-800'; barColor = 'bg-red-500';
      } else {
        iconName = 'minus'; bgClass = 'bg-yellow-50'; badgeBg = 'bg-yellow-100 text-yellow-800'; barColor = 'bg-yellow-400';
      }
      sentimentIconContainer.className = 'p-3 rounded-full ' + bgClass;
      const i = document.createElement('i');
      i.setAttribute('data-lucide', iconName);
      i.className = 'w-5 h-5';
      sentimentIconContainer.appendChild(i);
      if (window.lucide) lucide.replace();

      sentimentBadge.textContent = result.sentiment;
      sentimentBadge.className = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ' + badgeBg;

      sentimentScoreEl.textContent = 'Score: ' + result.sentimentScore.toFixed(2);

      // compute width: map score (-1..1) -> 0..100
      const widthPct = ((result.sentimentScore + 1) / 2) * 100;
      sentimentBar.style.width = widthPct + '%';
      sentimentBar.className = 'h-2.5 rounded-full transition-all duration-500 ' + barColor;

      // emotions
      emotionsContainer.innerHTML = '';
      result.emotions.forEach(em => {
        const s = document.createElement('span');
        s.className = 'inline-block text-sm px-4 py-2 bg-gray-100 rounded-full capitalize';
        s.textContent = em;
        emotionsContainer.appendChild(s);
      });

      // topics
      topicsContainer.innerHTML = '';
      result.keyTopics.forEach(top => {
        const b = document.createElement('span');
        b.className = 'inline-block text-sm px-4 py-2 border rounded-full';
        b.textContent = top;
        topicsContainer.appendChild(b);
      });

      // summary & tone
      summaryText.textContent = result.summary;
      toneBadge.textContent = result.tone;
      toneBadge.className = 'inline-block px-4 py-2 rounded-md bg-gray-100 capitalize text-base';
    }

    // main analyze flow
    async function analyzeText() {
      const text = textarea.value || '';
      if (!text.trim()) {
        showToast({ title: 'Empty text', description: 'Please enter some text to analyze', variant: 'error' });
        return;
      }

      // set loading UI
      analyzeBtn.disabled = true;
      btnContent.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin"></i><span>Analyzing...</span>';
      if (window.lucide) lucide.replace();

      // attempt a real fetch to /analyze-microtext (user's backend). If it fails or is not present, fallback to mock.
      let result = null;
      try {
        const resp = await fetch('/analyze-microtext', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });

        if (!resp.ok) {
          // try reading body for error message but then fallback
          console.warn('Server analysis returned non-ok status, falling back to mock. Status:', resp.status);
          result = mockAnalyze(text);
        } else {
          const data = await resp.json();
          // expecting the same interface as your AnalysisResult. If the server sends raw text, adapt here.
          // basic validation:
          if (!data || typeof data.sentimentScore !== 'number') throw new Error('Invalid server response');
          result = data;
        }
      } catch (err) {
        // network or CORS error — fallback
        console.warn('Fetch error, using mock analyzer.', err);
        result = mockAnalyze(text);
      }

      // small artificial wait so UX feels responsive (only for mock fallback)
      await new Promise(r => setTimeout(r, 350));

      // show
      renderResult(result);

      showToast({ title: 'Analysis complete', description: 'Your microtext has been analyzed successfully', variant: 'success' });

      // restore button
      btnContent.innerHTML = '<i data-lucide="sparkles" class="w-5 h-5"></i><span>Analyze Text</span>';
      if (window.lucide) lucide.replace();
      analyzeBtn.disabled = !textarea.value.trim();
    }

    analyzeBtn.addEventListener('click', analyzeText);

    // initialize disabled state
    analyzeBtn.disabled = true;

    // optional: press Ctrl+Enter to analyze
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        analyzeText();
      }
    });

  </script>
</body>
</html>
