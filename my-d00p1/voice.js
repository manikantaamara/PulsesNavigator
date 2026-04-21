/* ====================================================
   PULSE NAVIGATOR — voice.js  v2
   Smart Voice Assistant (English + Telugu)
   Floating FAB edition — improved accuracy
   ==================================================== */

(function () {
  'use strict';

  /* ── Platform check ─────────────────────────────── */
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('[Voice] SpeechRecognition not supported in this browser.');
  }

  /* ════════════════════════════════════════════════════
     TELUGU KEYWORD MAP
     Key = partial syllable or phrase the STT engine says
     Val = English crop name
  ════════════════════════════════════════════════════ */
  const TELUGU_CROP_KEYWORDS = {
    // Toor Dal / Pigeon Pea
    'తూర్ పప్పు':    'Toor Dal',
    'తూర్ పప':       'Toor Dal',
    'తూర్':          'Toor Dal',
    'తూర':           'Toor Dal',
    'కందిపప్పు':     'Pigeon Pea',
    'కంది పప్పు':    'Pigeon Pea',
    'కంది':           'Pigeon Pea',
    'కందులు':        'Pigeon Pea',
    // Moong Dal
    'పెసర పప్పు':    'Moong Dal',
    'పెసర':           'Moong Dal',
    'పెసలు':          'Moong Dal',
    'పెసరపప్పు':     'Moong Dal',
    // Chana Dal / Chickpea
    'సెనగ పప్పు':    'Chana Dal',
    'సెనగ':           'Chana Dal',
    'సెనగలు':         'Chickpea',
    'సెనగపప్పు':     'Chana Dal',
    'శనగలు':          'Chickpea',
    'శనగ పప్పు':    'Chana Dal',
    // Urad Dal / Black Gram
    'మినప పప్పు':    'Urad Dal',
    'మినప':           'Urad Dal',
    'మినుములు':       'Black Gram',
    'మినుము':         'Black Gram',
    'మినపప్పు':      'Urad Dal',
    'మినుము పప్పు':  'Urad Dal',
    // Masoor Dal
    'మసూర్ పప్పు':   'Masoor Dal',
    'మసూర్':          'Masoor Dal',
    'మసూర':           'Masoor Dal',
    'మసూర్ పప':     'Masoor Dal',
    // Rajma
    'రాజ్మా':         'Rajma',
    'రాజ్మ':          'Rajma',
    'చిక్కుడు గింజలు':'Rajma',
    // Lobia
    'లోబియా':         'Lobia',
    'లోబియ':          'Lobia',
    'అలసందలు':        'Lobia',
    'అలసంద':          'Lobia',
    // Horse Gram
    'ఉలవలు':          'Horse Gram',
    'ఉలవ':            'Horse Gram',
    // Field Pea
    'బటానీలు':        'Field Pea',
    'బటానీ':          'Field Pea',
    'పచ్చి బఠాణీ':   'Field Pea',
    // Moth Bean
    'మోత్ బీన్':     'Moth Bean',
    'మోత్ బీన':      'Moth Bean',
    'మోత్':           'Moth Bean',
    // Dolichos Bean
    'బొబ్బర్లు':      'Dolichos Bean',
    'బొబ్బర్':        'Dolichos Bean',
    'బొబ్బరలు':       'Dolichos Bean',
    // Flat Bean
    'చిక్కుడు కాయ':  'Flat Bean',
    'చిక్కుడు':       'Flat Bean',
    'చిక్కుడు కాయలు':'Flat Bean',
    'గోరు చిక్కుడు': 'Flat Bean',
  };

  /* ════════════════════════════════════════════════════
     ENGLISH KEYWORD MAP — lowercase keys
     Ordered from most-specific to least-specific
  ════════════════════════════════════════════════════ */
  const ENGLISH_CROP_KEYWORDS = {
    // 2-word phrases first (more specific)
    'toor dal':       'Toor Dal',
    'moong dal':      'Moong Dal',
    'chana dal':      'Chana Dal',
    'urad dal':       'Urad Dal',
    'masoor dal':     'Masoor Dal',
    'kidney bean':    'Rajma',
    'horse gram':     'Horse Gram',
    'field pea':      'Field Pea',
    'moth bean':      'Moth Bean',
    'dolichos bean':  'Dolichos Bean',
    'hyacinth bean':  'Dolichos Bean',
    'flat bean':      'Flat Bean',
    'cluster bean':   'Flat Bean',
    'chick pea':      'Chickpea',
    'pigeon pea':     'Pigeon Pea',
    'black gram':     'Black Gram',
    'green gram':     'Moong Dal',
    'kabuli chana':   'Chickpea',
    'red lentil':     'Masoor Dal',
    'pigeon':         'Pigeon Pea',
    // single-word (less specific — checked after phrases)
    'toor':           'Toor Dal',
    'tur':            'Toor Dal',
    'arhar':          'Pigeon Pea',
    'moong':          'Moong Dal',
    'mung':           'Moong Dal',
    'chana':          'Chana Dal',
    'gram':           'Chana Dal',
    'urad':           'Urad Dal',
    'masoor':         'Masoor Dal',
    'lentil':         'Masoor Dal',
    'rajma':          'Rajma',
    'lobia':          'Lobia',
    'cowpea':         'Lobia',
    'chickpea':       'Chickpea',
    'pea':            'Field Pea',
  };

  /* ── Intent patterns ─────────────────────────────── */
  const INTENT_LOWEST  = /cheapest|lowest|minimum|minimum price|least|where.*cheap|cheap.*where|తక్కువ|అతి తక్కువ|తక్కువ ధర|ఎక్కడ తక్కువ|తక్కువ రేటు/i;
  const INTENT_PRICE   = /price|rate|cost|how much|what.*price|రేటు|ధర|ఎంత|ధర ఎంత/i;

  /* ── State ───────────────────────────────────────── */
  let recognition   = null;
  let isListening   = false;
  let panelOpen     = false;

  /* ── DOM refs ─────────────────────────────────────── */
  let micFab, floatPanel, voiceTranscript, voiceStatus, voiceResult;

  /* ════════════════════════════════════════════════════
     CROP MATCHING — improved accuracy
     Strategy:
       1. Normalise: lowercase + trim
       2. Telugu first (longer phrases first)
       3. English (longer phrases first)
       4. Fuzzy: check each transcript alternative
  ════════════════════════════════════════════════════ */
  function detectCrop(text) {
    const lower = text.toLowerCase().trim();

    // Telugu: exact substring match (long → short)
    const teKeys = Object.keys(TELUGU_CROP_KEYWORDS)
      .sort((a, b) => b.length - a.length);
    for (const kw of teKeys) {
      if (text.includes(kw)) return TELUGU_CROP_KEYWORDS[kw];
    }

    // English: exact substring match (long → short)
    const enKeys = Object.keys(ENGLISH_CROP_KEYWORDS)
      .sort((a, b) => b.length - a.length);
    for (const kw of enKeys) {
      if (lower.includes(kw)) return ENGLISH_CROP_KEYWORDS[kw];
    }

    return null;
  }

  /** Check multiple recognition alternatives for a crop match */
  function detectCropFromResults(results) {
    for (let i = 0; i < results.length; i++) {
      // Try each alternative transcript
      for (let j = 0; j < results[i].length; j++) {
        const alt = results[i][j].transcript;
        const found = detectCrop(alt);
        if (found) return { crop: found, text: alt };
      }
    }
    return null;
  }

  /* ── Intent detection ─────────────────────────────── */
  function detectIntent(text) {
    if (INTENT_LOWEST.test(text)) return 'cheapest';
    if (INTENT_PRICE.test(text))  return 'price';
    return 'search';
  }

  /* ════════════════════════════════════════════════════
     ACTIONS
  ════════════════════════════════════════════════════ */
  function selectCropAndSearch(cropName) {
    const sel = document.getElementById('cropSelect');
    if (!sel) return false;
    const opt = [...sel.options].find(o => o.value === cropName);
    if (!opt) return false;
    sel.value = cropName;
    const pc = document.getElementById('priceCrop');
    if (pc && [...pc.options].some(o => o.value === cropName)) pc.value = cropName;
    if (typeof onCropSearch === 'function') onCropSearch();
    return true;
  }

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  function findCheapestDistrict(cropName) {
    if (typeof PRICE_DATA === 'undefined' || typeof buildPriceAPI !== 'function') return null;
    const lastYear = 2025;
    const PULSE_ALIASES_LOCAL = window.PULSE_ALIASES || {};
    const targets = PULSE_ALIASES_LOCAL[cropName] || [cropName.toLowerCase()];
    const districtSet = new Set();

    Object.keys(PRICE_DATA).forEach(k => {
      const parts = k.split('|');
      if (parts.length === 3 && parseInt(parts[2]) === lastYear) {
        const keyPulse = parts[1].toLowerCase();
        if (targets.some(t => keyPulse === t || keyPulse.includes(t))) {
          districtSet.add(parts[0]);
        }
      }
    });

    let minPrice = Infinity, cheapestAPI = null;
    districtSet.forEach(d => {
      const api = buildPriceAPI(d, cropName);
      if (api && api.prices[lastYear] != null && api.prices[lastYear] < minPrice) {
        minPrice = api.prices[lastYear];
        cheapestAPI = api;
      }
    });

    return cheapestAPI;
  }

  /* ════════════════════════════════════════════════════
     TTS OUTPUT
  ════════════════════════════════════════════════════ */
  function speak(text, lang) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang  = lang === 'te' ? 'te-IN' : 'en-IN';
    utt.rate  = 0.9;
    utt.pitch = 1;
    window.speechSynthesis.speak(utt);
  }

  /* ════════════════════════════════════════════════════
     UI HELPERS
  ════════════════════════════════════════════════════ */
  function setStatus(msg, type = 'info') {
    if (!voiceStatus) return;
    voiceStatus.textContent = msg;
    voiceStatus.className = 'va-status va-status--' + type;
  }

  function setResult(html) {
    if (!voiceResult) return;
    voiceResult.innerHTML = html;
    voiceResult.style.display = html ? 'block' : 'none';
  }

  function setTranscript(text) {
    if (!voiceTranscript) return;
    voiceTranscript.textContent = text ? `"${text}"` : '';
    voiceTranscript.style.display = text ? 'block' : 'none';
  }

  function updateFabIcon() {
    if (!micFab) return;
    if (isListening) {
      micFab.innerHTML = '⏹️';
      micFab.classList.add('listening');
    } else {
      micFab.innerHTML = '🎤';
      micFab.classList.remove('listening');
    }
  }

  /* ════════════════════════════════════════════════════
     PROCESS TRANSCRIPT
  ════════════════════════════════════════════════════ */
  function processTranscript(text, allResults) {
    const lang    = window.currentLang || 'en';
    setTranscript(text);

    // Try primary text first, then all alternatives
    let cropName = detectCrop(text);
    let matchedText = text;

    if (!cropName && allResults) {
      const multi = detectCropFromResults(allResults);
      if (multi) { cropName = multi.crop; matchedText = multi.text; setTranscript(matchedText); }
    }

    const intent = detectIntent(text);

    if (!cropName) {
      const tryAgain = lang === 'te'
        ? '⚠️ క్షమించండి, నాకు అర్థం కాలేదు. మళ్ళీ ప్రయత్నించండి.'
        : '⚠️ Sorry, I didn\'t understand. Please try again.';
      setStatus(tryAgain, 'warn');
      setResult('');
      speak(lang === 'te' ? 'క్షమించండి, నాకు అర్థం కాలేదు.' : 'Sorry, I didn\'t understand.', lang);
      return;
    }

    const displayCrop = (typeof translateCrop === 'function') ? translateCrop(cropName) : cropName;
    const emoji       = (typeof PULSE_EMOJI !== 'undefined' && PULSE_EMOJI[cropName]) || '🌾';

    /* ── Price query ───────────────────────────────── */
    if (intent === 'price' || intent === 'cheapest') {
      const isPriceOnly = (intent === 'price');
      setStatus(lang === 'te'
        ? `🔍 ${displayCrop} ధర వివరాలు వెతుకుతున్నాం...`
        : `🔍 Finding price details for ${displayCrop}...`, 'info');
      
      selectCropAndSearch(cropName);
      const api = findCheapestDistrict(cropName);

      if (api) {
        const lastYear = Object.keys(api.prices).sort().pop();
        const price    = api.prices[lastYear];

        // Update dropdowns if elements exist
        const pd = document.getElementById('priceDistrict');
        if (pd) pd.value = api.district;
        const pc = document.getElementById('priceCrop');
        if (pc) pc.value = cropName;
        if (typeof renderPriceSection === 'function') renderPriceSection();

        setStatus(lang === 'te'
          ? `✅ ధర వివరాలు సిద్ధంగా ఉన్నాయి`
          : `✅ Price details are ready`, 'success');

        const label = isPriceOnly 
          ? (lang === 'te' ? 'ధర మరియు అంచనా' : 'Price & Prediction')
          : (lang === 'te' ? 'అతి తక్కువ ధర' : 'Lowest Price');

        setResult(`
          <div class="va-result-card">
            <div class="va-result-crop">${emoji} ${displayCrop}</div>
            <div class="va-result-label">${label}</div>
            <div class="va-result-district">📍 ${api.district}</div>
            <div class="va-result-price">₹${price.toFixed(2)}<span>/kg</span></div>
            <div class="va-result-year">🤖 AI 2026: ₹${api.predicted_price.toFixed(1)}</div>
          </div>`);

        speak(lang === 'te'
          ? `${displayCrop} ధర ${api.district}లో ₹${Math.round(price)} ఉంది. 2026 అంచనా ₹${Math.round(api.predicted_price)}.`
          : `Price for ${cropName} in ${api.district} is ₹${Math.round(price)}. AI predicts ₹${Math.round(api.predicted_price)} for next year.`,
          lang);
        
        scrollToSection('price-section');
      } else {
        const noData = lang === 'te'
          ? `${displayCrop} కోసం ధర డేటా లేదు.`
          : `No price data found for ${cropName}.`;
        setStatus('⚠️ ' + noData, 'warn');
        speak(noData, lang);
      }
      return;
    }

    /* ── Default: map search ───────────────────────── */
    setStatus(lang === 'te'
      ? `🗺️ ${displayCrop} మ్యాప్‌లో చూపిస్తున్నాం...`
      : `🗺️ Showing ${displayCrop} on the map...`, 'info');
    const found = selectCropAndSearch(cropName);
    if (found) {
      setResult(`
        <div class="va-result-card">
          <div class="va-result-crop">${emoji} ${displayCrop}</div>
          <div class="va-result-label">${lang === 'te' ? 'మ్యాప్‌లో చూపించబడింది' : 'Shown on map'}</div>
        </div>`);
      speak(lang === 'te'
        ? `${displayCrop} మ్యాప్‌లో చూపించబడింది`
        : `Showing ${cropName} on the map`, lang);
      scrollToSection('map-section');
    } else {
      setStatus(lang === 'te'
        ? '⚠️ కనుగొనబడలేదు — మళ్ళీ ప్రయత్నించండి.'
        : '⚠️ Could not find that crop. Try again.', 'warn');
      setResult('');
      speak(lang === 'te' ? 'మళ్ళీ ప్రయత్నించండి.' : 'Please try again.', lang);
    }
  }

  /* ════════════════════════════════════════════════════
     RECOGNITION ENGINE
  ════════════════════════════════════════════════════ */
  function buildRecognition() {
    if (!SpeechRecognition) return null;
    const r       = new SpeechRecognition();
    const lang    = window.currentLang || 'en';
    r.lang        = lang === 'te' ? 'te-IN' : 'en-IN';
    r.interimResults  = true;
    r.maxAlternatives = 5;   // get more alternatives for better matching
    r.continuous      = false;
    return r;
  }

  function startListening() {
    if (!SpeechRecognition) {
      alert('Please use Google Chrome for voice input.');
      return;
    }
    if (isListening) { stopListening(); return; }

    // Open panel if closed
    openPanel();

    recognition  = buildRecognition();
    isListening  = true;
    updateFabIcon();
    setStatus(window.currentLang === 'te' ? '🎤 వింటున్నాం...' : '🎤 Listening...', 'listening');
    setTranscript('');
    setResult('');

    let finalTranscript = '';
    let lastResults     = null;

    recognition.onresult = (e) => {
      finalTranscript = '';
      let interim     = '';
      lastResults     = e.results;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += t;
        else interim += t;
      }
      if (voiceTranscript) {
        voiceTranscript.textContent = `"${finalTranscript || interim}"`;
        voiceTranscript.style.display = 'block';
      }
    };

    recognition.onerror = (e) => {
      isListening = false;
      updateFabIcon();
      const lang = window.currentLang || 'en';
      const msgs = {
        'no-speech':    lang === 'te' ? '⚠️ మాట వినలేదు — మళ్ళీ నొక్కండి.' : '⚠️ No speech detected — tap again.',
        'not-allowed':  lang === 'te' ? '⚠️ మైక్ అనుమతి లేదు.' : '⚠️ Microphone permission denied.',
        'network':      lang === 'te' ? '⚠️ నెట్‌వర్క్ లోపం.' : '⚠️ Network error, check connection.',
      };
      setStatus(msgs[e.error] || (lang === 'te' ? '⚠️ మైక్ లోపం.' : '⚠️ Mic error. Try again.'), 'warn');
    };

    recognition.onend = () => {
      isListening = false;
      updateFabIcon();
      if (finalTranscript.trim()) {
        processTranscript(finalTranscript.trim(), lastResults);
      } else {
        const lang = window.currentLang || 'en';
        setStatus(lang === 'te' ? '⚠️ మాట వినలేదు — తిరిగి నొక్కండి.' : '⚠️ No speech. Tap 🎤 to try again.', 'warn');
      }
    };

    recognition.start();
  }

  function stopListening() {
    if (recognition) { recognition.abort(); recognition = null; }
    isListening = false;
    updateFabIcon();
  }

  /* ════════════════════════════════════════════════════
     PANEL TOGGLE (floating widget)
  ════════════════════════════════════════════════════ */
  function openPanel() {
    floatPanel = floatPanel || document.getElementById('voiceFloatPanel');
    if (!floatPanel) return;
    floatPanel.style.display = 'flex';
    panelOpen = true;
  }

  function closePanel() {
    floatPanel = floatPanel || document.getElementById('voiceFloatPanel');
    if (floatPanel) floatPanel.style.display = 'none';
    panelOpen = false;
    stopListening();
  }

  function toggleVoicePanel() {
    if (!panelOpen) {
      openPanel();
      startListening();
    } else if (isListening) {
      stopListening();
    } else {
      // panel open, not listening → restart
      startListening();
    }
  }

  /* ════════════════════════════════════════════════════
     VOICE HELP MODAL
  ════════════════════════════════════════════════════ */
  function showVoiceHelp() {
    const lang  = window.currentLang || 'en';
    const modal = document.getElementById('voiceHelpModal');
    if (!modal) return;
    const body  = document.getElementById('voiceHelpBody');
    body.innerHTML = lang === 'te' ? `
      <div class="vh-section"><div class="vh-head">🌾 పంట వెతకడం</div>
        <div class="vh-eg">అనండి: <span>"తూర్ పప్పు"</span></div>
        <div class="vh-eg">అనండి: <span>"కందిపప్పు మ్యాప్"</span></div>
      </div>
      <div class="vh-section"><div class="vh-head">📈 ధర అడగడం</div>
        <div class="vh-eg">అనండి: <span>"పెసర పప్పు ధర"</span></div>
        <div class="vh-eg">అనండి: <span>"సెనగ పప్పు రేటు"</span></div>
      </div>
      <div class="vh-section"><div class="vh-head">💰 తక్కువ ధర వెతకడం</div>
        <div class="vh-eg">అనండి: <span>"తూర్ పప్పు తక్కువ ధర"</span></div>
        <div class="vh-eg">అనండి: <span>"మినప పప్పు అతి తక్కువ"</span></div>
      </div>` : `
      <div class="vh-section"><div class="vh-head">🌾 Search a Crop</div>
        <div class="vh-eg">Say: <span>"Toor Dal"</span></div>
        <div class="vh-eg">Say: <span>"Show Moong Dal on map"</span></div>
      </div>
      <div class="vh-section"><div class="vh-head">📈 Ask for Price</div>
        <div class="vh-eg">Say: <span>"What is price of Chana Dal"</span></div>
        <div class="vh-eg">Say: <span>"Urad Dal rate"</span></div>
      </div>
      <div class="vh-section"><div class="vh-head">💰 Cheapest Location</div>
        <div class="vh-eg">Say: <span>"Where is Toor Dal cheapest"</span></div>
        <div class="vh-eg">Say: <span>"Lowest price for Black Gram"</span></div>
      </div>`;
    modal.style.display = 'flex';
  }

  function closeVoiceHelp() {
    const modal = document.getElementById('voiceHelpModal');
    if (modal) modal.style.display = 'none';
  }

  /* ════════════════════════════════════════════════════
     EXPORTS & INIT
  ════════════════════════════════════════════════════ */
  window.startVoiceListening = startListening;
  window.toggleVoicePanel    = toggleVoicePanel;
  window.closeVoicePanel     = closePanel;
  window.showVoiceHelp       = showVoiceHelp;
  window.closeVoiceHelp      = closeVoiceHelp;

  document.addEventListener('DOMContentLoaded', () => {
    micFab         = document.getElementById('micFab');
    floatPanel     = document.getElementById('voiceFloatPanel');
    voiceTranscript= document.getElementById('voiceTranscript');
    voiceStatus    = document.getElementById('voiceStatus');
    voiceResult    = document.getElementById('voiceResult');

    if (!SpeechRecognition && micFab) {
      micFab.title   = 'Voice not supported — use Chrome';
      micFab.style.opacity = '0.5';
    }

    // Close help modal on overlay click
    const hm = document.getElementById('voiceHelpModal');
    if (hm) hm.addEventListener('click', e => { if (e.target === hm) closeVoiceHelp(); });
  });

})();
