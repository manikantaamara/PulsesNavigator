/* ====================================================
   PULSE NAVIGATOR  ·  app.js
   TWO-LEVEL MAP: District → Mandal drill-down
   ==================================================== */

// ── 15 PULSE NAMES ───────────────────────────────────
const PULSE_LIST = [
  'Masoor Dal','Toor Dal','Moong Dal','Chana Dal','Urad Dal',
  'Rajma','Lobia','Horse Gram','Field Pea','Moth Bean',
  'Dolichos Bean','Flat Bean','Chickpea','Black Gram','Pigeon Pea',
];

// ── ALIAS MAP: dropdown → dataset crop names ─────────
const PULSE_ALIASES = {
  'Masoor Dal':    ['masoor dal'],
  'Toor Dal':      ['toor dal'],
  'Moong Dal':     ['moong dal'],
  'Chana Dal':     ['chana dal'],
  'Urad Dal':      ['urad dal'],
  'Rajma':         ['rajma'],
  'Lobia':         ['lobia'],
  'Horse Gram':    ['horse gram'],
  'Field Pea':     ['field pea'],
  'Moth Bean':     ['moth bean'],
  'Dolichos Bean': ['hyacinth bean','dolichos bean'],
  'Flat Bean':     ['cluster bean','flat bean'],
  'Chickpea':      ['chana dal','chickpea'],
  'Black Gram':    ['urad dal','black gram'],
  'Pigeon Pea':    ['toor dal','pigeon pea'],
};

// ── COLOURS ──────────────────────────────────────────
const COLORS = {
  'Masoor Dal':'#e07b54','Toor Dal':'#f5c842','Moong Dal':'#4caf50',
  'Chana Dal':'#f9a825','Urad Dal':'#b0bec5','Rajma':'#e53935',
  'Lobia':'#8d6e63','Horse Gram':'#795548','Field Pea':'#66bb6a',
  'Moth Bean':'#ffd54f','Dolichos Bean':'#ab47bc','Flat Bean':'#26a69a',
  'Chickpea':'#ff7043','Black Gram':'#546e7a','Pigeon Pea':'#ff8f00',
  '_default':'#90caf9',
};
const PULSE_EMOJI = {
  'Masoor Dal':'🟤','Toor Dal':'🟡','Moong Dal':'🟢','Chana Dal':'🟡',
  'Urad Dal':'⚪','Rajma':'🔴','Lobia':'🟤','Horse Gram':'🟤',
  'Field Pea':'🟢','Moth Bean':'🟡','Dolichos Bean':'🟣',
  'Flat Bean':'🟢','Chickpea':'🟡','Black Gram':'⚫','Pigeon Pea':'🟠',
};

function cropColor(name) { return COLORS[name] || COLORS['_default']; }

// ── STATE ─────────────────────────────────────────────
let map, markerLayer;
let farmerListings = [];

// Map state machine
let mapMode      = 'all';   // 'all' | 'district' | 'mandal'
let activeRows   = [];       // currently filtered rows
let activePulse  = '';       // current selected pulse
let activeDistrict = '';     // district drill-down

// ── HELPERS ──────────────────────────────────────────
function parseCrops(str) {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean);
}
function allCropsOfRow(row) {
  return [...new Set([...parseCrops(row.r),...parseCrops(row.k),...parseCrops(row.z)])];
}
function primaryCrop(row) {
  return parseCrops(row.r)[0]||parseCrops(row.k)[0]||parseCrops(row.z)[0]||'Other';
}
function rowMatchesPulse(row, pulseLabel) {
  const targets = PULSE_ALIASES[pulseLabel] || [pulseLabel.toLowerCase()];
  return allCropsOfRow(row).map(c=>c.toLowerCase()).some(c=>targets.includes(c));
}

// ── MAP INIT ─────────────────────────────────────────
function initMap() {
  map = L.map('map', {
    center:[15.9129,79.74], zoom:7, minZoom:6, maxZoom:13,
    maxBounds:[[12.0,76.5],[20.5,85.5]], maxBoundsViscosity:1.0,
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19,
  }).addTo(map);
  markerLayer = L.layerGroup().addTo(map);
  // Force correct size after render
  setTimeout(() => map.invalidateSize(), 300);
  window.addEventListener('resize', () => map.invalidateSize());
}

// ══════════════════════════════════════════════════════
//  LEVEL 1 — DISTRICT MARKERS (clustered, big, blue)
// ══════════════════════════════════════════════════════
function buildDistrictGroups(rows) {
  const groups = {};
  rows.forEach(row => {
    if (!groups[row.d]) groups[row.d] = { name:row.d, rows:[], latSum:0, lngSum:0 };
    groups[row.d].rows.push(row);
    groups[row.d].latSum += row.la;
    groups[row.d].lngSum += row.lo;
  });
  return Object.values(groups).map(g => ({
    name:   g.name,
    rows:   g.rows,
    lat:    g.latSum / g.rows.length,
    lng:    g.lngSum / g.rows.length,
    count:  g.rows.length,
  }));
}

function plotDistrictView(rows, pulseLabel) {
  markerLayer.clearLayers();
  mapMode = 'district';
  activeRows = rows;
  activePulse = pulseLabel;
  setBackButton(false);

  const groups = buildDistrictGroups(rows);
  const pulseColor = pulseLabel ? cropColor(pulseLabel) : '#1565C0';

  document.getElementById('markerCount').textContent =
    `${groups.length} ${t('unitDistricts')} · ${rows.length} ${t('unitMandals')}`;

  groups.forEach(g => {
    // Outer ring (shadow)
    const ring = L.circleMarker([g.lat, g.lng], {
      radius: 22, fillColor: pulseColor, color: '#fff',
      weight: 3, opacity: 0.55, fillOpacity: 0.18,
    }).addTo(markerLayer);

    // Main district blob
    const marker = L.circleMarker([g.lat, g.lng], {
      radius: 16, fillColor: pulseColor, color: '#fff',
      weight: 2.5, fillOpacity: 0.87,
    });

    // Count label inside marker
    const label = L.marker([g.lat, g.lng], {
      icon: L.divIcon({
        html: `<div class="dist-count">${g.count}</div>`,
        iconSize: [36, 36], iconAnchor: [18, 18], className: '',
      }),
      interactive: false,
    });

    marker.bindTooltip(
      `<strong>${g.name}</strong><br>` +
      `${g.count} ${g.count!==1?t('unitMandals'):t('unitMandal')} ${t('growing')} ${translateCrop(pulseLabel)||t('unitMandals')}<br>` +
      `<span style="color:rgba(255,255,255,.55);font-size:.72rem">${t('clickZoomIn')}</span>`,
      { direction:'top', offset:[0,-10], className:'pn-tooltip' }
    );

    marker.on('click', () => drillDown(g));

    markerLayer.addLayer(marker);
    markerLayer.addLayer(label);
  });

  // Fit AP bounds
  if (rows.length > 0) {
    const b = L.latLngBounds(rows.map(r=>[r.la,r.lo]));
    map.fitBounds(b.pad(0.05), { maxZoom:9 });
  }
  setTimeout(() => map.invalidateSize(), 300);
}

// ══════════════════════════════════════════════════════
//  LEVEL 2 — MANDAL MARKERS (small, pulse-coloured)
// ══════════════════════════════════════════════════════
function drillDown(group) {
  markerLayer.clearLayers();
  mapMode = 'mandal';
  activeDistrict = group.name;
  setBackButton(true, group);

  const color = activePulse ? cropColor(activePulse) : cropColor(primaryCrop(group.rows[0]));

  document.getElementById('markerCount').textContent =
    `${group.rows.length} ${t('mandalsIn')} ${group.name}`;
  document.getElementById('mapFilterBadge').textContent =
    `${group.name} — ${activePulse ? translateCrop(activePulse) : t('mapAllCrops')}`;

  group.rows.forEach(row => {
    const crops = allCropsOfRow(row);
    const marker = L.circleMarker([row.la, row.lo], {
      radius: 9, fillColor: color, color: '#fff', weight: 1.8, fillOpacity: 0.9,
    });

    marker.bindTooltip(
      `<strong>${row.m}</strong><br>${row.d} · ${row.s||''}`,
      { direction:'top', offset:[0,-6], className:'pn-tooltip' }
    );
    marker.on('click', () => showInfoPanel(row, crops, color, activePulse));
    markerLayer.addLayer(marker);
  });

  // Animate zoom into district
  const b = L.latLngBounds(group.rows.map(r=>[r.la,r.lo]));
  map.fitBounds(b.pad(0.15), { maxZoom:11, animate:true, duration:0.6 });
  setTimeout(() => map.invalidateSize(), 400);
}

// ══════════════════════════════════════════════════════
//  BACK BUTTON HELPERS
// ══════════════════════════════════════════════════════
function setBackButton(visible, group) {
  const btn = document.getElementById('backDistrictBtn');
  if (!visible) {
    btn.style.display = 'none';
    return;
  }
  btn.style.display = 'flex';
  btn.innerHTML = `← Back (${group.name})`;
}

function backToDistrictView() {
  plotDistrictView(activeRows, activePulse);
  document.getElementById('mapFilterBadge').textContent = activePulse ? translateCrop(activePulse) : t('mapAllCrops');
  closePanel();
}

// ── Show all 679 raw mandal markers (no selection) ───
function plotAllRaw() {
  markerLayer.clearLayers();
  mapMode = 'all';
  setBackButton(false);
  document.getElementById('markerCount').textContent = `${MANDAL_DATA.length} markers`;
  MANDAL_DATA.forEach(row => {
    const pc = primaryCrop(row);
    const marker = L.circleMarker([row.la, row.lo], {
      radius:7, fillColor:cropColor(pc), color:'rgba(255,255,255,.65)',
      weight:1.5, fillOpacity:0.85,
    });
    marker.bindTooltip(`<strong>${row.m}</strong><br>${row.d}`,
      { direction:'top', offset:[0,-6], className:'pn-tooltip' });
    marker.on('click', () => showInfoPanel(row, allCropsOfRow(row), cropColor(pc), ''));
    markerLayer.addLayer(marker);
  });
}

// ── INFO PANEL ───────────────────────────────────────
function showInfoPanel(row, crops, color, pulseLabel) {
  const panel = document.getElementById('infoPanel');
  const placeholder = document.getElementById('panelPlaceholder');
  document.getElementById('infoPanelContent').innerHTML = `
    <div class="panel-header" style="border-left:4px solid ${color}">
      <div class="panel-mandal">📍 ${row.m}</div>
      <div class="panel-district">${row.d} · ${t('panelAndhraPradesh')}</div>
    </div>
    <div class="panel-body">
      ${pulseLabel?`<div class="panel-row"><span class="pk">${t('panelCrop')}</span><span class="pv" style="color:${color};font-weight:700">${translateCrop(pulseLabel)}</span></div>`:''}
      <div class="panel-row"><span class="pk">${t('panelSoil')}</span><span class="pv">${row.s||'N/A'}</span></div>
      <div class="panel-row"><span class="pk">${t('panelLatLng')}</span><span class="pv">${row.la}, ${row.lo}</span></div>
      ${parseCrops(row.r).length?`<div class="panel-row"><span class="pk">${t('panelRabi')}</span><span class="pv">${parseCrops(row.r).map(c=>translateCrop(c)).join(', ')}</span></div>`:''}
      ${parseCrops(row.k).length?`<div class="panel-row"><span class="pk">${t('panelKharif')}</span><span class="pv">${parseCrops(row.k).map(c=>translateCrop(c)).join(', ')}</span></div>`:''}
      ${parseCrops(row.z).length?`<div class="panel-row"><span class="pk">${t('panelZaid')}</span><span class="pv">${parseCrops(row.z).map(c=>translateCrop(c)).join(', ')}</span></div>`:''}
      <div class="panel-crops">
        ${crops.map(c=>`<span class="crop-chip" style="background:${cropColor(c)}22;border:1px solid ${cropColor(c)}66;color:${cropColor(c)}">${translateCrop(c)}</span>`).join('')}
      </div>
    </div>`;
  panel.classList.remove('hidden');
  if (placeholder) placeholder.style.display = 'none';
}
function closePanel() {
  document.getElementById('infoPanel').classList.add('hidden');
  const placeholder = document.getElementById('panelPlaceholder');
  if (placeholder) placeholder.style.display = 'flex';
}

// ── LEGEND ───────────────────────────────────────────
function buildLegend() {
  const shown = ['Masoor Dal','Toor Dal','Moong Dal','Chana Dal','Urad Dal',
                 'Rajma','Lobia','Horse Gram','Field Pea','Moth Bean'];
  document.getElementById('legendBar').innerHTML = shown.map(c=>`
    <span class="leg-item">
      <span class="leg-dot" style="background:${cropColor(c)}"></span>${translateCrop(c)}
    </span>`).join('');
}

// ── POPULATE DROPDOWNS ────────────────────────────────
function populateDropdowns() {
  const districts = [...new Set(MANDAL_DATA.map(r=>r.d))].sort();
  ['priceDistrict','fDistrict','mktDist'].forEach(id => {
    const sel = document.getElementById(id);
    districts.forEach(d => {
      const o = document.createElement('option');
      o.value = d; o.textContent = d; sel.appendChild(o);
    });
  });
  ['cropSelect','priceCrop','mktCrop','fCrop'].forEach(id => {
    const sel = document.getElementById(id);
    while (sel.options.length > 1) sel.remove(1);
    PULSE_LIST.forEach(p => {
      const o = document.createElement('option');
      o.value = p; o.textContent = (PULSE_EMOJI[p]||'🌾')+' '+translateCrop(p); sel.appendChild(o);
    });
  });
  document.getElementById('statMandals').textContent  = MANDAL_DATA.length;
  document.getElementById('statDistricts').textContent = districts.length;
  console.log(`[Pulse Navigator] ${MANDAL_DATA.length} mandals · ${districts.length} districts`);
}

// ── SEARCH / FILTER ───────────────────────────────────
function onCropSearch() {
  const sel = document.getElementById('cropSelect').value;
  activePulse = sel;
  document.getElementById('mapFilterBadge').textContent = sel ? translateCrop(sel) : t('mapAllCrops');

  if (!sel) {
    plotDistrictView(MANDAL_DATA, '');
    map.setView([15.9129,79.74], 7);
    return;
  }

  const filtered = MANDAL_DATA.filter(row => rowMatchesPulse(row, sel));
  console.log(`[Pulse Navigator] "${sel}" → ${filtered.length} mandals`);

  if (filtered.length === 0) {
    document.getElementById('markerCount').textContent = '0 markers';
    markerLayer.clearLayers();
    showToast(`${t('noMandals')} ${translateCrop(sel)}`);
    return;
  }

  plotDistrictView(filtered, sel);

  const pc = document.getElementById('priceCrop');
  if ([...pc.options].some(o=>o.value===sel)) pc.value = sel;

  document.getElementById('map-section').scrollIntoView({ behavior:'smooth' });
}

function resetMap() {
  activePulse = '';
  activeDistrict = '';
  document.getElementById('cropSelect').value = '';
  document.getElementById('mapFilterBadge').textContent = t('mapAllCrops');
  setBackButton(false);
  closePanel();
  plotDistrictView(MANDAL_DATA, '');
  map.setView([15.9129,79.74], 7);
}

// ══════════════════════════════════════════════════════
//  ML ENGINE  —  Linear Regression: 2021–2025 → 2026
// ══════════════════════════════════════════════════════

const HIST_YEARS = [2021, 2022, 2023, 2024, 2025];
const PRED_YEAR  = 2026;

// ── DISTRICT NAME MAP: mandal data → price data keys ────────
const DISTRICT_ALIAS = {
  'Anantapuram':                          'Anantapur',
  'Dr. B.R. Ambedkar Konaseema district': 'Konaseema',
  'Sri Potti Sri Ramulu Nellore':         'SPSR Nellore',
  'Markapuram':                           'Prakasam',
  'Polavaram':                            'Eluru',
};
function normDistrict(d) { return DISTRICT_ALIAS[d] || d; }

/** Look up district|pulse|year average from embedded PRICE_DATA */
function getAvg(district, pulse, year) {
  const d = normDistrict(district);
  const targets = PULSE_ALIASES[pulse] || [pulse.toLowerCase()];
  for (const t of targets) {
    const canon = t.replace(/\b\w/g, c => c.toUpperCase());
    const v = PRICE_DATA[`${d}|${canon}|${year}`];
    if (v !== undefined) return v;
  }
  return PRICE_DATA[`${d}|${pulse}|${year}`] !== undefined
    ? PRICE_DATA[`${d}|${pulse}|${year}`] : null;
}

/**
 * Ordinary Least Squares Linear Regression
 * Fits price = slope * year + intercept on the supplied (xs, ys) pairs.
 */
function linearRegression(xs, ys) {
  const n  = xs.length;
  const xM = xs.reduce((a, b) => a + b, 0) / n;
  const yM = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  xs.forEach((x, i) => { num += (x - xM) * (ys[i] - yM); den += (x - xM) ** 2; });
  const slope     = den ? num / den : 0;
  const intercept = yM - slope * xM;
  return {
    slope, intercept,
    predict: x => Math.max(0, +(slope * x + intercept).toFixed(2)),
    r2: (() => {
      const ssTot = ys.reduce((s, y) => s + (y - yM) ** 2, 0);
      const ssRes = xs.reduce((s, x, i) => s + (ys[i] - (slope * x + intercept)) ** 2, 0);
      return ssTot ? +(1 - ssRes / ssTot).toFixed(4) : 1;
    })(),
  };
}

/**
 * Build the full "API" payload for one district + pulse.
 * Uses every year in HIST_YEARS that has real data as training.
 */
function buildPriceAPI(district, pulse) {
  const d = normDistrict(district);
  const prices = {};
  const xs = [], ys = [];
  HIST_YEARS.forEach(y => {
    const v = getAvg(d, pulse, y);
    if (v !== null) { prices[y] = v; xs.push(y); ys.push(v); }
  });
  if (xs.length < 2) return null;
  const model = linearRegression(xs, ys);
  return {
    crop: pulse, district: d,
    prices,
    model_years:      xs,
    slope:            +model.slope.toFixed(4),
    intercept:        +model.intercept.toFixed(4),
    r_squared:        model.r2,
    predicted_price:  model.predict(PRED_YEAR),
  };
}

// Chart.js instance (destroy before re-drawing)
let priceChartInstance = null;

// ── PRICE SECTION ENTRY POINT ─────────────────────────
function renderPriceSection() {
  const district  = document.getElementById('priceDistrict').value;
  const pulse     = document.getElementById('priceCrop').value;
  const out       = document.getElementById('priceOutput');
  const chartCard = document.getElementById('chartCard');
  const predBanner= document.getElementById('predBanner');

  [chartCard, predBanner].forEach(el => el.style.display = 'none');

  if (!district || !pulse) {
    out.innerHTML = `<p class="empty-msg">${t('selectDistPulse')}</p>`;
    return;
  }

  const api = buildPriceAPI(district, pulse);
  if (!api) {
    out.innerHTML = `<p class="empty-msg">${t('noDataFor')} <strong>${translateCrop(pulse)}</strong> ${t('inLabel')} <strong>${district}</strong>.</p>`;
    return;
  }

  // 1 ── Chart
  renderPriceChart(api, pulse);
  document.getElementById('chartTitle').textContent =
    `📈 ${translateCrop(pulse)} — ${district}`;
  document.getElementById('chartSub').textContent =
    `Linear regression on ${api.model_years.length} years ` +
    `(${api.model_years[0]}–${api.model_years.at(-1)}) · R² = ${api.r_squared}`;
  chartCard.style.display = 'block';

  // 2 ── Prediction banner
  const lastYear  = api.model_years.at(-1);
  const lastPrice = api.prices[lastYear];
  const predicted = api.predicted_price;
  const delta     = predicted - lastPrice;
  const pct       = lastPrice ? ((delta / lastPrice) * 100).toFixed(1) : 0;
  const arrow     = delta >= 0 ? '▲' : '▼';
  const tClr      = delta >= 0 ? '#4caf50' : '#f44336';
  document.getElementById('predValue').textContent = `₹${predicted.toFixed(2)} / kg`;
  document.getElementById('predTrend').innerHTML =
    `<span style="color:${tClr};font-size:1.4rem">${arrow}</span>` +
    `<span style="color:${tClr};font-weight:700">${delta >= 0 ? '+' : ''}${pct}%</span>` +
    `<span style="opacity:.5;font-size:.72rem">vs ${lastYear}</span>`;
  predBanner.style.display = 'flex';

  // 3 ── Cards + table
  renderPriceSummary(district, pulse, api);
}

/** Draw / redraw Chart.js line chart */
function renderPriceChart(api, pulse) {
  const ctx = document.getElementById('priceChart').getContext('2d');
  if (priceChartInstance) { priceChartInstance.destroy(); priceChartInstance = null; }

  const hYears  = api.model_years;
  const hPrices = hYears.map(y => api.prices[y]);
  const color   = cropColor(pulse);

  // Labels: historical years + prediction year
  const allLabels = [...hYears.map(String), String(PRED_YEAR)];

  // Historical data series (null for prediction year)
  const histData = [...hPrices, null];

  // Dashed prediction series: null until last real point, then predicted
  const predData = hYears.map((_, i) => i === hYears.length - 1 ? hPrices.at(-1) : null);
  predData.push(api.predicted_price);

  // Point radii: only show dot at prediction endpoint
  const predRadii = hYears.map(() => 0);
  predRadii.push(10);

  priceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: allLabels,
      datasets: [
        {
          label: t('chartHistLabel'),
          data: histData,
          borderColor: color,
          backgroundColor: color + '28',
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 9,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointBorderWidth: 2.5,
          fill: true,
          tension: 0.35,
          spanGaps: false,
        },
        {
          label: `${t('aiCardLabel')} ${PRED_YEAR} (₹/kg)`,
          data: predData,
          borderColor: '#ffd54f',
          borderWidth: 3,
          borderDash: [8, 5],
          pointRadius: predRadii,
          pointHoverRadius: 12,
          pointBackgroundColor: '#ffd54f',
          pointBorderColor: '#fff',
          pointBorderWidth: 2.5,
          fill: false,
          tension: 0.2,
          spanGaps: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            color: 'rgba(255,255,255,.75)',
            font: { size: 12, family: "'Inter', sans-serif" },
            padding: 20,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: 'rgba(5,15,9,.97)',
          borderColor: 'rgba(76,175,121,.4)',
          borderWidth: 1,
          titleColor: '#7de0a8',
          bodyColor: 'rgba(255,255,255,.8)',
          padding: 13,
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y;
              if (v === null) return null;
              const isAI = ctx.datasetIndex === 1;
              return ` ${isAI ? t('chartPredTooltip') : t('chartHistTooltip')}: ₹${v.toFixed(2)}/kg`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,.07)' },
          ticks: { color: 'rgba(255,255,255,.55)', font: { size: 12 } },
        },
        y: {
          grid: { color: 'rgba(255,255,255,.07)' },
          ticks: {
            color: 'rgba(255,255,255,.55)',
            font: { size: 12 },
            callback: v => '₹' + v.toFixed(0),
          },
          title: {
            display: true,
            text: 'Price (₹/kg)',
            color: 'rgba(255,255,255,.4)',
            font: { size: 11 },
          },
        },
      },
    },
  });
}

/** Year cards + lowest banner + district comparison table */
function renderPriceSummary(district, pulse, api) {
  const out      = document.getElementById('priceOutput');
  const lastYear = api.model_years.at(-1);

  // ─ Summary cards (one per year + AI)
  const cardHtml = `
    <div class="price-cards">
      ${api.model_years.map(y => priceCard(String(y), api.prices[y])).join('')}
      ${priceCard(`${t('aiCardLabel')} (${PRED_YEAR})`, api.predicted_price, true)}
    </div>`;

  // ─ All districts for this pulse
  const allDistricts = [...new Set(
    Object.keys(PRICE_DATA)
      .filter(k => {
        const targets = PULSE_ALIASES[pulse] || [pulse.toLowerCase()];
        return targets.some(t => {
          const c = t.replace(/\b\w/g, x => x.toUpperCase());
          return k.includes(`|${c}|${lastYear}`) || k.includes(`|${pulse}|${lastYear}`);
        });
      })
      .map(k => k.split('|')[0])
  )].sort();

  const tableRows = allDistricts.map(d => {
    const dApi = buildPriceAPI(d, pulse);
    return {
      d,
      prices: dApi ? dApi.prices : {},
      pAI:    dApi ? dApi.predicted_price : null,
    };
  }).filter(r => r.prices[lastYear]);

  const vals = tableRows.map(r => r.prices[lastYear]).filter(Boolean);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const lowest = tableRows.find(r => r.prices[lastYear] === minV);

  const bannerHtml = lowest ? `
    <div class="lowest-banner">
      ${t('lowestPriceLabel')} <span class="lowest-val">${lowest.d} — ₹${lowest.prices[lastYear].toFixed(2)}/kg</span>
      <span class="lowest-note">(${lastYear} avg)</span>
    </div>` : '';

  const tableHtml = `
    <h3 class="sub-heading">${t('districtComparison')} — ${translateCrop(pulse)}</h3>
    <div class="table-scroll">
      <table class="price-table">
        <thead>
          <tr>
            <th>${t('districtCol')}</th>
            ${api.model_years.map(y => `<th>${y} (₹)</th>`).join('')}
            <th>${t('aiCardLabel')} ${PRED_YEAR} (₹)</th>
            <th>${t('statusCol')}</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows.map(r => {
            const isLow = r.prices[lastYear] === minV;
            const isHigh = r.prices[lastYear] === maxV;
            const isSel  = r.d === district;
            return `<tr class="${isLow ? 'row-lowest' : ''} ${isSel ? 'row-selected' : ''}">
              <td>${r.d}${isSel ? ' <span class="sel-tag">◀</span>' : ''}</td>
              ${api.model_years.map(y => `<td>${r.prices[y] != null ? '₹' + r.prices[y].toFixed(2) : '—'}</td>`).join('')}
              <td class="ai-cell">${r.pAI != null ? '₹' + r.pAI.toFixed(2) : '—'}</td>
              <td>${isLow ? `<span class="badge-low">${t('badgeLow')}</span>` : isHigh ? `<span class="badge-high">${t('badgeHigh')}</span>` : ''}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;

  out.innerHTML = cardHtml + bannerHtml + tableHtml;
}

function priceCard(label, value, isAI = false) {
  return `<div class="price-card ${isAI ? 'price-card-ai' : ''}">
    <div class="pc-label">${label}</div>
    <div class="pc-value">${value != null ? (typeof value === 'number' ? value.toFixed(1) : value) : '—'}</div>
    <div class="pc-unit">${t('rupeePerKg')}</div>
    ${isAI ? `<span class="ai-badge">${t('aiCardLabel')}</span>` : ''}
  </div>`;
}

// ── API MODAL ─────────────────────────────────────────
function showAPIModal() {
  const district = document.getElementById('priceDistrict').value;
  const pulse    = document.getElementById('priceCrop').value;
  if (!district || !pulse) return;
  const api = buildPriceAPI(district, pulse);
  if (!api) return;
  const output = {
    crop:            pulse,
    district:        district,
    prices:          api.prices,
    model: {
      algorithm:       'Linear Regression (OLS)',
      training_years:  api.model_years,
      slope:           api.slope,
      intercept:       api.intercept,
      r_squared:       api.r_squared,
    },
    predicted_price: api.predicted_price,
    predicted_year:  PRED_YEAR,
  };
  document.getElementById('apiJson').textContent = JSON.stringify(output, null, 2);
  document.getElementById('apiModal').style.display = 'flex';
}
function closeAPIModal() {
  document.getElementById('apiModal').style.display = 'none';
}

// ── FARMER IDENTITY (phone stored in localStorage) ────────
let currentPhone = localStorage.getItem('farmerPhone') || '';

function farmerLogin() {
  const val = document.getElementById('fiPhone').value.trim();
  if (!/^[0-9]{10}$/.test(val)) { showToast(t('invalidPhone')); return; }
  currentPhone = val;
  localStorage.setItem('farmerPhone', val);
  updateIdentityUI();
  renderMarket();
  showToast(t('loggedIn') + ' ' + val);
}

function farmerLogout() {
  currentPhone = '';
  localStorage.removeItem('farmerPhone');
  document.getElementById('fiPhone').value = '';
  updateIdentityUI();
  renderMarket();
}

function updateIdentityUI() {
  const guest  = document.getElementById('fiGuest');
  const active = document.getElementById('fiActive');
  const num    = document.getElementById('fiNum');
  if (currentPhone) {
    guest.classList.add('hidden');
    active.classList.remove('hidden');
    num.textContent = currentPhone;
  } else {
    guest.classList.remove('hidden');
    active.classList.add('hidden');
  }
}

function markSold(idx) {
  farmerListings[idx].soldQty = farmerListings[idx].totalQty;
  farmerListings[idx].sold = true;
  renderMarket();
  showToast(t('markedSold'));
}

function sellPartial(idx) {
  const inpId = 'partialInp_' + idx;
  const box   = document.getElementById('partialBox_' + idx);
  if (!box) return;
  box.style.display = box.style.display === 'none' ? 'flex' : 'none';
}

function confirmPartialSell(idx) {
  const inp = document.getElementById('partialInp_' + idx);
  const val = parseInt(inp.value, 10);
  const l   = farmerListings[idx];
  const remaining = l.totalQty - l.soldQty;
  if (!val || val <= 0) { showToast(t('invalidQty')); return; }
  if (val > remaining)  { showToast(t('exceedQty') + ' ' + remaining + ' kg'); return; }
  l.soldQty += val;
  if (l.soldQty >= l.totalQty) { l.soldQty = l.totalQty; l.sold = true; }
  inp.value = '';
  renderMarket();
  showToast('✅ Sold ' + val + ' kg · Remaining: ' + (l.totalQty - l.soldQty) + ' kg');
}

// ── MARKETPLACE ───────────────────────────────────────
function renderMarket() {
  const crop = document.getElementById('mktCrop').value;
  const dist = document.getElementById('mktDist').value;
  const filtered = farmerListings
    .map((l, i) => ({ ...l, _idx: i }))
    .filter(l => (!crop || l.crop === crop) && (!dist || l.district === dist));
  document.getElementById('listCount').textContent =
    filtered.length + ' ' + (filtered.length !== 1 ? t('listings') : t('listing'));
  const grid = document.getElementById('listingsGrid');
  if (!filtered.length) { grid.innerHTML = `<p class="empty-msg">${t('noListings')}</p>`; return; }
  grid.innerHTML = filtered.map(function(l, i) {
    const isOwner   = currentPhone && l.phone === currentPhone;
    const remaining = l.totalQty - l.soldQty;
    const isSold    = l.sold || remaining <= 0;
    const soldBadge = isSold ? `<span class="sold-badge">${t('soldBadge')}</span>` : '';
    const pct       = Math.round((l.soldQty / l.totalQty) * 100);

    const qtyBlock = '<div class="qty-track">'
      + '<div class="qty-bar"><div class="qty-bar-fill" style="width:' + pct + '%"></div></div>'
      + '<div class="qty-row"><span class="qty-label">' + t('qtyTotal') + '</span><span class="qty-val">' + Number(l.totalQty).toLocaleString('en-IN') + ' kg</span></div>'
      + '<div class="qty-row"><span class="qty-label">' + t('qtySold') + '</span><span class="qty-val qty-sold">' + Number(l.soldQty).toLocaleString('en-IN') + ' kg</span></div>'
      + '<div class="qty-row"><span class="qty-label">' + t('qtyRemaining') + '</span><span class="qty-val qty-rem' + (isSold ? ' qty-zero' : '') + '">' + Number(remaining).toLocaleString('en-IN') + ' kg</span></div>'
      + '</div>';

    let actionBtn = '';
    if (!isSold && isOwner) {
      actionBtn = '<div class="partial-wrap">'
        + '<button class="btn-partial" onclick="sellPartial(' + l._idx + ')">' + t('btnSellQty') + '</button>'
        + '<button class="btn-sold" onclick="markSold(' + l._idx + ')">' + t('btnMarkSold') + '</button>'
        + '<div class="partial-box" id="partialBox_' + l._idx + '" style="display:none">'
        + '<input id="partialInp_' + l._idx + '" type="number" class="partial-inp" placeholder="kg to sell" min="1" max="' + remaining + '"/>'
        + '<button class="btn-confirm" onclick="confirmPartialSell(' + l._idx + ')">' + t('btnConfirm') + '</button>'
        + '</div>'
        + '</div>';
    } else if (!isSold) {
      actionBtn = '<a href="tel:' + l.phone + '" class="btn-call">' + t('btnCallFarmer') + '</a>';
    }

    return '<div class="listing-card' + (isSold ? ' is-sold' : '') + '" style="animation-delay:' + (i * 0.04) + 's">'
      + '<div class="lc-top"><div class="lc-crop">' + translateCrop(l.crop) + soldBadge + '</div>'
      + '<div class="lc-price">₹' + l.price.toFixed(2) + '/kg</div></div>'
      + qtyBlock
      + '<div class="lc-row"><strong>' + l.mandal + ', ' + l.district + '</strong></div>'
      + (l.note ? '<div class="lc-row">' + l.note + '</div>' : '')
      + '<div class="lc-row" style="font-size:.72rem;opacity:.4">Posted ' + l.date + '</div>'
      + '<div class="lc-footer"><span class="lc-farmer">' + l.name + '</span><span class="lc-phone">📱 ' + l.phone + '</span>' + actionBtn + '</div>'
      + '</div>';
  }).join('');
}


function submitListing(e) {
  e.preventDefault();
  const phone = document.getElementById('fPhone').value.trim();
  if (currentPhone && phone !== currentPhone) {
    showToast(t('phoneMismatch') + currentPhone);
    return;
  }
  const totalQty = parseInt(document.getElementById('fQty').value, 10);
  farmerListings.unshift({
    name:     document.getElementById('fName').value.trim(),
    phone:    phone,
    crop:     document.getElementById('fCrop').value,
    qty:      totalQty,
    totalQty: totalQty,
    soldQty:  0,
    price:    parseFloat(document.getElementById('fPrice').value),
    district: document.getElementById('fDistrict').value,
    mandal:   document.getElementById('fMandal').value,
    note:     document.getElementById('fNote').value.trim(),
    date:     new Date().toLocaleDateString('en-IN'),
    sold:     false,
  });
  document.getElementById('sellForm').reset();
  document.getElementById('fMandal').innerHTML = `<option value="">${t('selectMandalOption')}</option>`;
  if (currentPhone) document.getElementById('fPhone').value = currentPhone;
  renderMarket();
  showToast(t('listingPosted'));
  document.getElementById('market-section').scrollIntoView({ behavior: 'smooth' });
}


document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('fDistrict').addEventListener('change',function(){
    const dist=this.value,sel=document.getElementById('fMandal');
    sel.innerHTML=`<option value="">${t('selectMandalOption')}</option>`;
    if(!dist)return;
    [...new Set(MANDAL_DATA.filter(r=>r.d===dist).map(r=>r.m))].sort().forEach(m=>{
      const o=document.createElement('option');o.value=m;o.textContent=m;sel.appendChild(o);
    });
  });
});

function showToast(msg){
  const t=document.getElementById('toast');t.textContent=msg;
  t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);
}

function seedDemos(){
  function mk(name,phone,crop,qty,soldQty,price,district,mandal,note,date){
    return {name,phone,crop,qty,totalQty:qty,soldQty,price,district,mandal,note,date,sold:soldQty>=qty};
  }
  farmerListings=[
    mk('Ramu Reddy','9876543210','Toor Dal',800,200,112.50,'Guntur','Tenali','Grade A · freshly harvested','29/3/2026'),
    mk('Lakshmi Devi','9123456780','Chana Dal',500,0,89.00,'Kurnool','Nandyal Urban','Organic','29/3/2026'),
    mk('Suresh Babu','9988776655','Moong Dal',1200,400,105.00,'East Godavari','Rajahmundry Urban','','28/3/2026'),
    mk('Venkat Rao','9000000001','Urad Dal',400,400,98.75,'Visakhapatnam','Gajuwaka','Bulk discount','28/3/2026'),
    mk('Padma Kumari','9111222333','Horse Gram',300,0,62.00,'Anantapuram','Tadipatri','Traditional variety','27/3/2026'),
    mk('Govind Naidu','9444555666','Rajma',250,100,128.00,'Srikakulam','Tekkali','Export quality','27/3/2026'),
    mk('Sita Raman','9222111000','Masoor Dal',600,0,78.50,'Nandyal','Allagadda','','26/3/2026'),
    mk('Krishnaiah','9333444555','Field Pea',350,0,66.00,'Tirupati','Srikalahasti','Certified seeds','26/3/2026'),
    mk('Anand Varma','9555666777','Dolichos Bean',180,60,88.00,'Anakapalli','Narsipatnam','Hyacinth variety','25/3/2026'),
    mk('Meera Bai','9777888999','Pigeon Pea',900,0,110.00,'Guntur','Medikonduru','A+ quality','25/3/2026'),
    mk('Ravi Kumar','9888000111','Black Gram',450,0,97.00,'Kurnool','Yemmiganur','','24/3/2026'),
    mk('Savitri Devi','9222333444','Chickpea',700,0,91.00,'Nandyal','Banaganapalle','Large grain','24/3/2026'),
  ];
  renderMarket();
}

function logValidation(){
  console.group('[Pulse Navigator] Validation');
  console.log(`Total mandals: ${MANDAL_DATA.length}`);
  PULSE_LIST.forEach(p=>{
    const n=MANDAL_DATA.filter(r=>rowMatchesPulse(r,p)).length;
    console.log(`${n>0?'✅':'⚠️'} ${p.padEnd(16)} → ${n}`);
  });
  console.groupEnd();
}

// ── BOOT ─────────────────────────────────────────────
(function boot(){
  initMap();
  populateDropdowns();
  buildLegend();
  // Start in district view with all mandals
  plotDistrictView(MANDAL_DATA, '');
  seedDemos();
  logValidation();
  updateIdentityUI();
  if (currentPhone) document.getElementById('fPhone').value = currentPhone;
  document.getElementById('fiPhone').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') farmerLogin();
  });

  document.getElementById('cropSelect').addEventListener('change',function(){
    const pc=document.getElementById('priceCrop');
    if([...pc.options].some(o=>o.value===this.value)) pc.value=this.value;
  });

  // Final invalidateSize after everything has rendered
  setTimeout(() => map.invalidateSize(), 600);
})();
