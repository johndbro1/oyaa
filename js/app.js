// app.js — UI wiring, data loading, result rendering
// Data is pre-loaded from js/data.js (no fetch needed, works with file://)

const ASSET_MIXES = [
  { label: '80% Bonds / 10% S&P / 10% International',           key: 'bonds_80_sp_10_intl_10' },
  { label: '80% Bonds / 20% S&P 500',                           key: 'bonds_80_sp_20' },
  { label: '60% Bonds / 20% S&P / 20% International',           key: 'bonds_60_sp_20_intl_20' },
  { label: '40% Bonds / 30% S&P / 30% International',           key: 'bonds_40_sp_30_intl_30' },
  { label: '20% each: Bonds / S&P / Intl / Mid / Small Cap',    key: 'equal_5way' },
  { label: '25% each: S&P / Intl / Mid Cap / Small Cap',        key: 'equal_4way' },
  { label: 'S&P 500 Only',                                       key: 'sp_500' },
  { label: 'Small Cap Only',                                     key: 'small_cap' },
];

// --- Dynamic list helpers ---

function addRow(containerId, template) {
  const container = document.getElementById(containerId);
  const div = document.createElement('div');
  div.className = 'list-row';
  div.innerHTML = template + ' <button type="button" onclick="this.parentElement.remove()">Remove</button>';
  container.appendChild(div);
}

function getRows(containerId) {
  return Array.from(document.getElementById(containerId).querySelectorAll('.list-row'));
}

function addAnnuityRow() {
  addRow('annuities-list', `
    <label>Monthly $<input type="text" inputmode="numeric" class="ann-amount" name="pension-monthly" value="0"></label>
    <label>Start Age <input type="number" class="ann-start" name="pension-start-age" min="0" max="120" value="65"></label>
    <label>End:
      <select class="ann-end-cond" name="pension-end-condition" onchange="toggleEndYear(this)">
        <option value="bothDeath">Death of both</option>
        <option value="userDeath">Death of user</option>
        <option value="spouseDeath">Death of spouse</option>
        <option value="specificYear">Specific year</option>
      </select>
    </label>
    <span class="end-year-wrap" style="display:none">
      <label>End Year <input type="number" class="ann-end-year" name="pension-end-year" min="2024" max="2150" value="2040"></label>
    </span>
    <label style="flex-direction:row; gap:8px; align-items:center;"><input type="checkbox" class="ann-inflation" name="pension-inflation-adjusted"> Inflation Adjusted</label>
  `);
  applyDollarSanitizers(document.getElementById('annuities-list'));
}

function toggleEndYear(sel) {
  const wrap = sel.closest('.list-row').querySelector('.end-year-wrap');
  wrap.style.display = sel.value === 'specificYear' ? '' : 'none';
}

function addWindfallRow() {
  const currentYear = new Date().getFullYear();
  addRow('windfalls-list', `
    <label>Amount $<input type="text" inputmode="numeric" class="wf-amount" name="windfall-amount" value="0"></label>
    <label>Year <input type="number" class="wf-year" name="windfall-year" min="${currentYear}" max="2150" value="${currentYear + 5}"></label>
  `);
  applyDollarSanitizers(document.getElementById('windfalls-list'));
}

function addExpenseRow() {
  const currentYear = new Date().getFullYear();
  addRow('expenses-list', `
    <label>Amount $<input type="text" inputmode="numeric" class="exp-amount" name="expense-amount" value="0"></label>
    <label>Year <input type="number" class="exp-year" name="expense-year" min="${currentYear}" max="2150" value="${currentYear + 1}"></label>
  `);
  applyDollarSanitizers(document.getElementById('expenses-list'));
}

// --- Form reading ---

function val(id) {
  const el = document.getElementById(id);
  if (el) return el.value;
  // fall back to radio group
  const radio = document.querySelector(`input[name="${id}"]:checked`);
  return radio ? radio.value : '';
}
function numVal(id) { return parseFloat((val(id) || '').replace(/[$,\s]/g, '')) || 0; }
function checked(id) { return document.getElementById(id).checked; }

function buildInput() {
  const currentYear = new Date().getFullYear();
  const assetKey = val('asset-mix');

  const annuities = getRows('annuities-list').map(row => ({
    monthlyAmount:     parseFloat(row.querySelector('.ann-amount').value) || 0,
    startAge:          parseInt(row.querySelector('.ann-start').value) || 65,
    endCondition:      row.querySelector('.ann-end-cond').value,
    endSimYear:        row.querySelector('.ann-end-year')
                         ? (parseInt(row.querySelector('.ann-end-year').value) || currentYear) - currentYear
                         : null,
    inflationAdjusted: row.querySelector('.ann-inflation').checked,
  }));

  const windfalls = getRows('windfalls-list').map(row => ({
    amount:  parseFloat(row.querySelector('.wf-amount').value) || 0,
    simYear: (parseInt(row.querySelector('.wf-year').value) || currentYear) - currentYear,
  }));

  const expenses = getRows('expenses-list').map(row => ({
    amount:  parseFloat(row.querySelector('.exp-amount').value) || 0,
    simYear: (parseInt(row.querySelector('.exp-year').value) || currentYear) - currentYear,
  }));

  const hasSpouse = checked('has-spouse');

  return {
    age:            numVal('age'),
    lifeExpectancy: numVal('le'),

    spouseAge:            hasSpouse ? numVal('spouse-age') : null,
    spouseLifeExpectancy: hasSpouse ? numVal('spouse-le') : null,

    portfolioValue:  numVal('portfolio-value'),
    assetMixReturns: DATA[assetKey] || [],
    inflationData:   DATA.historical_inflation,

    ssAge:           numVal('ss-age') || null,
    ssMonthly:       numVal('ss-monthly') || null,
    spouseSsAge:     hasSpouse ? (numVal('spouse-ss-age') || null) : null,
    spouseSsMonthly: hasSpouse ? (numVal('spouse-ss-monthly') || null) : null,

    annuities,
    windfalls,
    expenses,

    targetEstate:            numVal('estate'),
    estateInflationAdjusted: checked('estate-inflation'),

    annualSpendReductionRate: parseFloat(val('spend-reduction')) || 0,
    startingMonthlySpend:     numVal('starting-spend'),
    stopSuccessRate:          parseFloat(val('stop-rate')) || 0.10,
    numRuns:                  parseInt(val('num-runs')) || 1000,
  };
}

// --- Results rendering ---

function ageRangeStr(currentAge, le) {
  const lo = Math.max(currentAge + 1, Math.round(le - 25));
  const hi = Math.round(le + 25);
  return `${lo}–${hi}`;
}

function renderResults(results, input) {
  const section = document.getElementById('results-section');
  const tbody = document.querySelector('#results-table tbody');
  const summary = document.getElementById('results-summary');
  const numRuns = input.numRuns;

  tbody.innerHTML = '';

  for (const { monthlySpend, successRate, numRuns: rowRuns } of results) {
    const pct = (successRate * 100).toFixed(1);
    const annual = monthlySpend * 12;
    const tr = document.createElement('tr');
    tr.className = successRate >= 0.90 ? ''
                 : successRate >= 0.80 ? 'tier-green'
                 : successRate >= 0.65 ? 'tier-orange'
                 : 'tier-red';
    tr.innerHTML = `<td>$${monthlySpend.toLocaleString()}/mo</td><td>$${annual.toLocaleString()}/yr</td><td>${pct}%</td><td>${(rowRuns || numRuns).toLocaleString()}</td>`;
    tbody.appendChild(tr);
  }

  const totalSims = (results.length * numRuns).toLocaleString();
  const levels = results.length;
  summary.textContent = `Simulation complete — ${levels} spend level${levels !== 1 ? 's' : ''} tested, ${totalSims} total simulations run.`;

  // Age range note (#3)
  let rangeNote = `Simulated age range — you: ${ageRangeStr(input.age, input.lifeExpectancy)}`;
  if (input.spouseAge != null) {
    rangeNote += ` &nbsp;|&nbsp; partner: ${ageRangeStr(input.spouseAge, input.spouseLifeExpectancy)}`;
  }
  document.getElementById('age-range-note').innerHTML = rangeNote;

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// --- Run ---

function runSimulation() {
  let input;
  try {
    input = buildInput();
  } catch (e) {
    alert('Error reading inputs: ' + e.message);
    return;
  }

  if (!input.assetMixReturns.length) {
    alert('Could not load portfolio data. Please refresh the page.');
    return;
  }

  const btn = document.getElementById('run-btn');
  const progress = document.getElementById('progress');
  const progressText = document.getElementById('progress-text');
  btn.disabled = true;
  progress.style.display = 'block';
  document.getElementById('results-section').style.display = 'none';

  const barFill = document.getElementById('progress-bar-fill');
  barFill.classList.add('running');

  let lastSpend = null;
  runMonteCarloSimulation(input,
    (monthlySpend, runsComplete, totalRuns) => {
      if (monthlySpend !== lastSpend) {
        lastSpend = monthlySpend;
        progressText.textContent = `Testing $${monthlySpend.toLocaleString()}/mo…`;
      }
    },
    (results) => {
      barFill.classList.remove('running');
      renderResults(results, input);
      btn.disabled = false;
      progress.style.display = 'none';
      progressText.textContent = '';
    }
  );
}

// --- Dollar input sanitization ---

function applyDollarSanitizer(el) {
  function clean(raw) {
    const stripped = raw.replace(/[$,\s]/g, '');
    if (stripped === '' || stripped === '-') return;
    const num = Math.floor(parseFloat(stripped) || 0);
    if (el.value !== String(num)) el.value = num;
  }
  el.addEventListener('paste', (e) => {
    e.preventDefault();
    clean((e.clipboardData || window.clipboardData).getData('text'));
  });
  el.addEventListener('input', () => clean(el.value));
  el.addEventListener('blur',  () => clean(el.value));
}

function applyDollarSanitizers(container) {
  container.querySelectorAll('.ann-amount, .wf-amount, .exp-amount').forEach(applyDollarSanitizer);
}

// --- Spouse toggle ---

function toggleSpouse() {
  const show = checked('has-spouse') ? '' : 'none';
  document.getElementById('spouse-age-section').style.display = show;
  document.getElementById('spouse-ss-section').style.display = show;
}

// --- Init ---

window.addEventListener('DOMContentLoaded', () => {
  // Populate asset mix dropdown from ASSET_MIXES
  const sel = document.getElementById('asset-mix');
  for (const mix of ASSET_MIXES) {
    const opt = document.createElement('option');
    opt.value = mix.key;
    opt.textContent = mix.label;
    sel.appendChild(opt);
  }

  // Apply dollar sanitizers to all static dollar fields
  ['ss-monthly', 'spouse-ss-monthly', 'portfolio-value', 'estate', 'starting-spend']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) applyDollarSanitizer(el);
    });
});
