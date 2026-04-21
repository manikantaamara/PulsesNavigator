/* ====================================================
   PULSE NAVIGATOR — lang.js
   Telugu / English Language System
   ==================================================== */

window.currentLang = localStorage.getItem('pnLang') || 'en';

const translations = {
  en: {
    title: 'Pulse Navigator',
    logoSub: 'Andhra Pradesh Agricultural Intelligence',
    navHome: '🏠 Home', navMap: '🗺️ Map', navPrices: '📈 Prices',
    navMarket: '🛒 Market', navSell: '🌿 Sell',
    enterAsFarmer: 'Enter as Farmer',
    fiPhonePlaceholder: 'Your phone number',
    heroBadge: '🌱 Real-Time Agricultural Intelligence Platform',
    heroTitle1: 'Discover Pulses Across',
    heroTitle2: 'Andhra Pradesh',
    heroDesc: 'Mandal-level crop mapping · AI price prediction · Direct farmer-to-buyer connect',
    searchLabel: 'Choose a Pulse to Explore on the Map',
    selectPulse: '— Select a Pulse —',
    btnSearch: 'Explore →',
    statMandalsLabel: 'Mandals', statDistrictsLabel: 'Districts',
    statCropsLabel: 'Pulse Crops', statAI: '🤖 AI Price Forecast',
    mapTitle: '🗺️ Mandal-Level Crop Map',
    mapDesc: 'All 679 mandals plotted with real coordinates. Click any marker for full details.',
    mapShowingLabel: 'Showing:', mapAllCrops: 'All Crops',
    btnShowAll: '↺ Show All',
    panelPlaceholderTitle: 'Pulse Details',
    panelPlaceholderDesc: 'Select a pulse and click any district or mandal marker on the map to see details here.',
    panelCrop: '🌾 Crop', panelSoil: '🌱 Soil', panelLatLng: '🌐 Lat/Lng',
    panelRabi: '☀️ Rabi', panelKharif: '🌧️ Kharif', panelZaid: '💧 Zaid',
    panelAndhraPradesh: 'Andhra Pradesh', clickZoomIn: 'Click to zoom in',
    priceTitle: '📈 Price Intelligence',
    priceDesc: 'Historical averages + AI linear regression forecast per district',
    districtLabel: 'District', pulseLabel: 'Pulse',
    selectDistrict: '— Select District —', selectPulseFilter: '— Select Pulse —',
    apiResponse: '{ } API Response',
    aiPredictedLabel: 'AI Predicted Price for 2026',
    aiPredictedNote: 'Linear Regression · trained on 2021–2025 historical data',
    lowestPriceLabel: '💰 Lowest Price Available In:',
    districtComparison: '📊 District-Wise Comparison',
    districtCol: 'District', statusCol: 'Status',
    badgeLow: 'Lowest', badgeHigh: 'Highest',
    aiCardLabel: '🤖 AI Predicted', rupeePerKg: '₹ per kg',
    marketTitle: '🛒 Farmer Marketplace',
    marketDesc: 'Browse available pulse stocks. Connect directly with farmers.',
    allPulses: 'All Pulses', allDistricts: 'All Districts',
    listings: 'listings', listing: 'listing',
    noListings: 'No listings. Be the first!',
    qtyTotal: 'Total', qtySold: 'Sold', qtyRemaining: 'Remaining',
    btnSellQty: '⚖️ Sell Qty', btnMarkSold: '✓ Mark Sold',
    btnConfirm: 'Confirm', btnCallFarmer: '📞 Call Farmer', soldBadge: 'Sold',
    sellTitle: '🌿 List Your Crop',
    sellDesc: 'Farmers: post your available pulse stock and connect with buyers',
    farmerNameLabel: '👨‍🌾 Farmer Name', phoneLabel: '📱 Phone',
    cropLabel: '🌾 Crop', qtyLabel: '⚖️ Quantity (kg)',
    priceLabel: '💰 Price (₹/kg)', districtLabelForm: '🏘️ District',
    mandalLabel: '📍 Mandal', noteLabel: '📝 Note (optional)',
    farmerNamePlaceholder: 'Your full name', phonePlaceholder: '10-digit number',
    qtyPlaceholder: 'e.g. 500', pricePlaceholder: 'e.g. 95',
    notePlaceholder: 'Quality, grade, availability…',
    btnPost: '📢 Post My Listing',
    selectPulseOption: '— Select Pulse —',
    selectDistrictOption: '— Select District —',
    selectMandalOption: '— Select Mandal —',
    footerMain: '🌾 Pulse Navigator — Andhra Pradesh Agricultural Intelligence Platform',
    footerSub: 'All data sourced from official agricultural records. Prices are annual averages.',
    chartHistLabel: 'Historical Price (₹/kg)',
    chartPredTooltip: '🤖 Predicted', chartHistTooltip: '📊 Historical',
    noMandals: '⚠️ No mandals found for',
    invalidPhone: '⚠️ Enter a valid 10-digit phone number',
    loggedIn: '✅ Logged in as',
    listingPosted: 'Listing posted successfully!',
    markedSold: '✅ Listing marked as fully sold',
    invalidQty: '⚠️ Enter a valid quantity',
    exceedQty: '⚠️ Cannot exceed remaining',
    phoneMismatch: 'Phone must match your identity: ',
    selectDistPulse: 'Select a district and pulse above to view pricing.',
    noDataFor: 'No price data for', inLabel: 'in',
    unitDistricts: 'districts', unitMandals: 'mandals', unitMandal: 'mandal',
    growing: 'growing', mandalsIn: 'mandals in',
  },
  te: {
    title: 'పల్స్ నావిగేటర్',
    logoSub: 'ఆంధ్రప్రదేశ్ వ్యవసాయ సమాచారం',
    navHome: '🏠 హోమ్', navMap: '🗺️ మ్యాప్', navPrices: '📈 ధరలు',
    navMarket: '🛒 మార్కెట్', navSell: '🌿 అమ్మకం',
    enterAsFarmer: 'రైతుగా ప్రవేశించండి',
    fiPhonePlaceholder: 'మీ ఫోన్ నంబర్',
    heroBadge: '🌱 రియల్-టైమ్ వ్యవసాయ సమాచార వేదిక',
    heroTitle1: 'పప్పులను కనుగొనండి',
    heroTitle2: 'ఆంధ్రప్రదేశ్‌లో',
    heroDesc: 'మండల స్థాయి పంట మ్యాపింగ్ · AI ధర అంచనా · రైతు-కొనుగోలుదారు నేరు అనుసంధానం',
    searchLabel: 'మ్యాప్‌లో అన్వేషించడానికి పప్పు ఎంచుకోండి',
    selectPulse: '— పప్పు ఎంచుకోండి —',
    btnSearch: 'అన్వేషించు →',
    statMandalsLabel: 'మండలాలు', statDistrictsLabel: 'జిల్లాలు',
    statCropsLabel: 'పప్పు పంటలు', statAI: '🤖 AI ధర అంచనా',
    mapTitle: '🗺️ మండల స్థాయి పంట మ్యాప్',
    mapDesc: 'అన్ని 679 మండలాలు నిజమైన కోఆర్డినేట్లతో గుర్తించబడ్డాయి. వివరాల కోసం మార్కర్ పై నొక్కండి.',
    mapShowingLabel: 'చూపుతున్నది:', mapAllCrops: 'అన్ని పంటలు',
    btnShowAll: '↺ అన్నీ చూపు',
    panelPlaceholderTitle: 'పప్పు వివరాలు',
    panelPlaceholderDesc: 'ఒక పప్పు ఎంచుకుని మ్యాప్‌లో ఏదైనా జిల్లా లేదా మండల మార్కర్ పై నొక్కండి.',
    panelCrop: '🌾 పంట', panelSoil: '🌱 నేల', panelLatLng: '🌐 అక్షాంశం/రేఖాంశం',
    panelRabi: '☀️ రబీ', panelKharif: '🌧️ ఖరీఫ్', panelZaid: '💧 జాయిద్',
    panelAndhraPradesh: 'ఆంధ్రప్రదేశ్', clickZoomIn: 'జూమ్ చేయడానికి నొక్కండి',
    priceTitle: '📈 ధర సమాచారం',
    priceDesc: 'చారిత్రక సగటులు + AI లీనియర్ రిగ్రెషన్ జిల్లా వారీగా అంచనా',
    districtLabel: 'జిల్లా', pulseLabel: 'పప్పు',
    selectDistrict: '— జిల్లా ఎంచుకోండి —', selectPulseFilter: '— పప్పు ఎంచుకోండి —',
    apiResponse: '{ } API స్పందన',
    aiPredictedLabel: '2026 కోసం AI అంచనా ధర',
    aiPredictedNote: 'లీనియర్ రిగ్రెషన్ · 2021–2025 చారిత్రక డేటాపై శిక్షణ పొందింది',
    lowestPriceLabel: '💰 అతి తక్కువ ధర ఇక్కడ:',
    districtComparison: '📊 జిల్లా వారీగా పోలిక',
    districtCol: 'జిల్లా', statusCol: 'స్థితి',
    badgeLow: 'అతి తక్కువ', badgeHigh: 'అతి ఎక్కువ',
    aiCardLabel: '🤖 AI అంచనా', rupeePerKg: '₹ కిలోకి',
    marketTitle: '🛒 రైతు మార్కెట్‌ప్లేస్',
    marketDesc: 'అందుబాటులో ఉన్న పప్పు నిల్వలు చూడండి. రైతులతో నేరుగా సంప్రదించండి.',
    allPulses: 'అన్ని పప్పులు', allDistricts: 'అన్ని జిల్లాలు',
    listings: 'జాబితాలు', listing: 'జాబితా',
    noListings: 'జాబితాలు లేవు. మొదటివారు అవ్వండి!',
    qtyTotal: 'మొత్తం', qtySold: 'అమ్మికయింది', qtyRemaining: 'మిగిలింది',
    btnSellQty: '⚖️ పరిమాణం అమ్మండి', btnMarkSold: '✓ అమ్మికయినట్లు గుర్తించు',
    btnConfirm: 'నిర్ధారించు', btnCallFarmer: '📞 రైతుకు కాల్ చేయండి',
    soldBadge: 'అమ్మికయింది',
    sellTitle: '🌿 మీ పంటను జాబితాలో చేర్చండి',
    sellDesc: 'రైతులు: మీ పప్పు నిల్వను పోస్ట్ చేసి కొనుగోలుదారులతో అనుసంధానించండి',
    farmerNameLabel: '👨‍🌾 రైతు పేరు', phoneLabel: '📱 ఫోన్',
    cropLabel: '🌾 పంట', qtyLabel: '⚖️ పరిమాణం (కిలో)',
    priceLabel: '💰 ధర (₹/కిలో)', districtLabelForm: '🏘️ జిల్లా',
    mandalLabel: '📍 మండలం', noteLabel: '📝 గమనిక (ఐచ్ఛికం)',
    farmerNamePlaceholder: 'మీ పూర్తి పేరు', phonePlaceholder: '10 అంకెల నంబర్',
    qtyPlaceholder: 'ఉదా. 500', pricePlaceholder: 'ఉదా. 95',
    notePlaceholder: 'నాణ్యత, గ్రేడ్, లభ్యత…',
    btnPost: '📢 నా జాబితాను పోస్ట్ చేయండి',
    selectPulseOption: '— పప్పు ఎంచుకోండి —',
    selectDistrictOption: '— జిల్లా ఎంచుకోండి —',
    selectMandalOption: '— మండలం ఎంచుకోండి —',
    footerMain: '🌾 పల్స్ నావిగేటర్ — ఆంధ్రప్రదేశ్ వ్యవసాయ సమాచార వేదిక',
    footerSub: 'అన్ని డేటా అధికారిక వ్యవసాయ రికార్డుల నుండి సేకరించబడింది. ధరలు వార్షిక సగటులు.',
    chartHistLabel: 'చారిత్రక ధర (₹/కిలో)',
    chartPredTooltip: '🤖 అంచనా', chartHistTooltip: '📊 చారిత్రక',
    noMandals: '⚠️ ఈ పంటకు మండలాలు దొరకలేదు:',
    invalidPhone: '⚠️ సరైన 10 అంకెల ఫోన్ నంబర్ నమోదు చేయండి',
    loggedIn: '✅ ప్రవేశించారు:',
    listingPosted: 'జాబితా విజయవంతంగా పోస్ట్ చేయబడింది!',
    markedSold: '✅ జాబితా పూర్తిగా అమ్మికయినట్లు గుర్తించబడింది',
    invalidQty: '⚠️ సరైన పరిమాణం నమోదు చేయండి',
    exceedQty: '⚠️ మిగిలిన పరిమాణాన్ని మించకూడదు',
    phoneMismatch: 'ఫోన్ మీ గుర్తింపుతో సరిపోలాలి: ',
    selectDistPulse: 'ధర చూడటానికి పైన జిల్లా మరియు పప్పు ఎంచుకోండి.',
    noDataFor: 'ధర డేటా అందుబాటులో లేదు', inLabel: 'లో',
    unitDistricts: 'జిల్లాలు', unitMandals: 'మండలాలు', unitMandal: 'మండలం',
    growing: 'పండిస్తున్న', mandalsIn: 'మండలాలు',
  },
};

const cropMap = {
  'Toor Dal':      'తూర్ పప్పు',
  'Moong Dal':     'పెసర పప్పు',
  'Chana Dal':     'సెనగ పప్పు',
  'Urad Dal':      'మినప పప్పు',
  'Masoor Dal':    'మసూర్ పప్పు',
  'Rajma':         'రాజ్మా',
  'Lobia':         'లోబియా',
  'Horse Gram':    'ఉలవలు',
  'Field Pea':     'బటానీలు',
  'Moth Bean':     'మోత్ బీన్',
  'Dolichos Bean': 'బొబ్బర్లు',
  'Flat Bean':     'చిక్కుడు కాయ',
  'Chickpea':      'సెనగలు',
  'Black Gram':    'మినుములు',
  'Pigeon Pea':    'కందిపప్పు',
};

/** Translate a crop name; falls back to English if no mapping */
function translateCrop(name) {
  if (!name) return name;
  if (window.currentLang === 'te' && cropMap[name]) return cropMap[name];
  return name;
}

/** Get a translation string; falls back to English, then the key itself */
function t(key) {
  const lang = window.currentLang || 'en';
  const byLang = translations[lang];
  if (byLang && byLang[key] !== undefined) return byLang[key];
  return (translations.en[key] !== undefined) ? translations.en[key] : key;
}

/** Apply all [data-i18n] attribute translations */
function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (el.tagName === 'INPUT' && el.getAttribute('type') !== 'submit') {
      el.placeholder = val;
    } else {
      el.textContent = val;
    }
  });
  // Hero title spans (have child elements so can't use textContent on parent)
  const ht1 = document.getElementById('heroTitleText');
  if (ht1) ht1.textContent = t('heroTitle1');
  const ht2 = document.getElementById('heroTitleGrad');
  if (ht2) ht2.textContent = t('heroTitle2');
}

/** Update crop dropdowns with translated names */
function updateCropDropdowns() {
  ['cropSelect','priceCrop','mktCrop','fCrop'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const cur = sel.value;
    Array.from(sel.options).forEach(opt => {
      if (!opt.value) {
        // placeholder — use appropriate key per dropdown
        if (id === 'mktCrop') opt.textContent = t('allPulses');
        else if (id === 'priceCrop') opt.textContent = t('selectPulseFilter');
        else opt.textContent = t('selectPulse');
        return;
      }
      const emoji = (typeof PULSE_EMOJI !== 'undefined' && PULSE_EMOJI[opt.value]) || '🌾';
      opt.textContent = emoji + ' ' + translateCrop(opt.value);
    });
    sel.value = cur;
  });
}

/** Update select placeholder options that aren't crop dropdowns */
function updateSelectPlaceholders() {
  const map = {
    priceDistrict: 'selectDistrict',
    mktDist:       'allDistricts',
    fDistrict:     'selectDistrictOption',
    fMandal:       'selectMandalOption',
    fCrop:         'selectPulseOption',
    cropSelect:    'selectPulse',
  };
  Object.entries(map).forEach(([id, key]) => {
    const sel = document.getElementById(id);
    if (sel && sel.options[0] && !sel.options[0].value) {
      sel.options[0].textContent = t(key);
    }
  });
  const mktAll = document.getElementById('mktDist');
  if (mktAll && mktAll.options[0] && !mktAll.options[0].value)
    mktAll.options[0].textContent = t('allDistricts');
}

/** Rebuild legend with translated crop names */
function updateLegend() {
  if (typeof buildLegend === 'function') buildLegend();
}

/** Re-apply AI prediction banner labels */
function updatePredBanner() {
  const lbl = document.querySelector('.pred-label');
  if (lbl) lbl.textContent = t('aiPredictedLabel');
  const note = document.querySelector('.pred-note');
  if (note) note.textContent = t('aiPredictedNote');
}

/** Update map filter badge after language change */
function updateMapBadge() {
  const badge = document.getElementById('mapFilterBadge');
  if (!badge) return;
  if (!window.activePulse) badge.textContent = t('mapAllCrops');
  else badge.textContent = translateCrop(window.activePulse);
}

/** Master language setter */
function setLanguage(lang) {
  window.currentLang = lang;
  localStorage.setItem('pnLang', lang);

  applyTranslations();
  updateCropDropdowns();
  updateSelectPlaceholders();
  updateMapBadge();
  updateLegend();
  updatePredBanner();

  // Re-render dynamic sections
  if (typeof renderMarket === 'function') renderMarket();
  const d = document.getElementById('priceDistrict');
  const p = document.getElementById('priceCrop');
  if (d && p && d.value && p.value && typeof renderPriceSection === 'function') {
    renderPriceSection();
  }

  if (typeof showToast === 'function')
    showToast(lang === 'te' ? '✅ తెలుగు ఎంచుకోబడింది' : '✅ English selected');
}

// Apply saved language on load
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('pnLang') || 'en';
  const sel = document.getElementById('langSelect');
  if (sel) sel.value = saved;
  if (saved !== 'en') setLanguage(saved);
});
