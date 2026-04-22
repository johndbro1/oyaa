# Phase 1 - Asset Allocation & Simulation Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the retirement simulator to use a dynamic, 97-year asset-weighted model with refined annual logic.

**Architecture:** 
- Centralize 97 years of historical market data in `js/data.js`.
- Update the UI to allow custom percentage allocations across four asset classes.
- Refactor the simulation engine to apply cash flows (spend/income) before market performance, using independent sampling for market and inflation data.

**Tech Stack:** Vanilla JavaScript (ES6), HTML5, CSS3.

---

### Task 1: Data Consolidation and Normalization

**Files:**
- Modify: `js/data.js`
- Delete: `js/all_market_data.js` (after extraction)
- Modify: `index.html` (remove script tag)

- [ ] **Step 1: Extract and Normalize Market Data**
Read `js/all_market_data.js` and convert the percentage values to decimals (e.g., `43.81` becomes `0.4381`).

- [ ] **Step 2: Update `js/data.js`**
Add the `all_market_data` array to the `DATA` object.

```javascript
const DATA = {
  all_market_data: [
    {"year":1928,"sp500":0.4381,"tbond":0.0084,"small_cap":0.6215,"tbill":0.0308},
    // ... all 97 years
  ],
  historical_inflation: [ ... ],
  // ... other existing data
};
```

- [ ] **Step 3: Remove redundant files and script tags**
Delete `js/all_market_data.js` and remove `<script src="js/all_market_data.js"></script>` from `index.html`.

- [ ] **Step 4: Commit**
```bash
git add js/data.js index.html
git rm js/all_market_data.js
git commit -m "data: consolidate and normalize 97-year market data"
```

---

### Task 2: Update Asset Allocation UI

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Replace Asset Mix Select**
Replace the `<select id="asset-mix">` with four number inputs and a validation display.

```html
<!-- Inside the Portfolio card -->
<div class="field-row" style="flex-direction: column; align-items: flex-start; gap: 10px;">
  <div style="display: flex; flex-wrap: wrap; gap: 12px;">
    <label>S&P 500 % <input type="number" id="alloc-sp500" value="60" min="0" max="100" step="5" style="width:60px"></label>
    <label>Small Cap % <input type="number" id="alloc-smallcap" value="0" min="0" max="100" step="5" style="width:60px"></label>
    <label>Total Bond % <input type="number" id="alloc-bond" value="40" min="0" max="100" step="5" style="width:60px"></label>
    <label>T-Bill (Cash) % <input type="number" id="alloc-cash" value="0" min="0" max="100" step="5" style="width:60px"></label>
  </div>
  <div id="allocation-status" style="font-weight: bold; font-size: 0.9rem;">
    Total Allocation: <span id="total-pct">100</span>% 
    <span id="allocation-msg" style="color: green; margin-left: 10px;">✓ Ready</span>
  </div>
</div>
```

- [ ] **Step 2: Commit**
```bash
git add index.html
git commit -m "ui: replace asset mix dropdown with custom allocation inputs"
```

---

### Task 3: Update Windfall and Expense UI

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Update `addWindfallRow` template**
Include the "Inflation Adjusted" checkbox.

```javascript
function addWindfallRow() {
  const currentYear = new Date().getFullYear();
  addRow('windfalls-list', `
    <label>Amount $<input type="text" inputmode="numeric" class="wf-amount" name="windfall-amount" value="0"></label>
    <label>Year <input type="number" class="wf-year" name="windfall-year" min="${currentYear}" max="2150" value="${currentYear + 5}"></label>
    <label style="flex-direction:row; gap:8px; align-items:center;"><input type="checkbox" class="wf-inflation" checked> Inflation Adjusted</label>
  `);
  applyDollarSanitizers(document.getElementById('windfalls-list'));
}
```

- [ ] **Step 2: Update `addExpenseRow` template**
Include the "Inflation Adjusted" checkbox.

```javascript
function addExpenseRow() {
  const currentYear = new Date().getFullYear();
  addRow('expenses-list', `
    <label>Amount $<input type="text" inputmode="numeric" class="exp-amount" name="expense-amount" value="0"></label>
    <label>Year <input type="number" class="exp-year" name="expense-year" min="${currentYear}" max="2150" value="${currentYear + 1}"></label>
    <label style="flex-direction:row; gap:8px; align-items:center;"><input type="checkbox" class="exp-inflation" checked> Inflation Adjusted</label>
  `);
  applyDollarSanitizers(document.getElementById('expenses-list'));
}
```

- [ ] **Step 3: Commit**
```bash
git add js/app.js
git commit -m "ui: add inflation adjustment checkboxes to windfalls and expenses"
```

---

### Task 4: UI Logic and Input Processing

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Implement Allocation Validation**
Add a function to calculate total allocation and gate the "Run" button.

```javascript
function validateAllocation() {
  const sp500 = parseInt(document.getElementById('alloc-sp500').value) || 0;
  const smallcap = parseInt(document.getElementById('alloc-smallcap').value) || 0;
  const bond = parseInt(document.getElementById('alloc-bond').value) || 0;
  const cash = parseInt(document.getElementById('alloc-cash').value) || 0;
  
  const total = sp500 + smallcap + bond + cash;
  document.getElementById('total-pct').textContent = total;
  
  const msg = document.getElementById('allocation-msg');
  const btn = document.getElementById('run-btn');
  
  if (total === 100) {
    msg.textContent = '✓ Ready';
    msg.style.color = 'green';
    btn.disabled = false;
  } else {
    msg.textContent = '⚠ Total must be 100%';
    msg.style.color = 'red';
    btn.disabled = true;
  }
}
```

- [ ] **Step 2: Wire up listeners**
In the `DOMContentLoaded` listener, attach `validateAllocation` to the new inputs.

```javascript
['alloc-sp500', 'alloc-smallcap', 'alloc-bond', 'alloc-cash'].forEach(id => {
  document.getElementById(id).addEventListener('input', validateAllocation);
});
validateAllocation(); // initial check
```

- [ ] **Step 3: Update `buildInput()`**
Collect the new allocation percentages and the inflation adjustment flags.

```javascript
function buildInput() {
  // ... existing logic ...
  const windfalls = getRows('windfalls-list').map(row => ({
    amount:  parseFloat(row.querySelector('.wf-amount').value) || 0,
    simYear: (parseInt(row.querySelector('.wf-year').value) || currentYear) - currentYear,
    inflationAdjusted: row.querySelector('.wf-inflation').checked
  }));

  const expenses = getRows('expenses-list').map(row => ({
    amount:  parseFloat(row.querySelector('.exp-amount').value) || 0,
    simYear: (parseInt(row.querySelector('.exp-year').value) || currentYear) - currentYear,
    inflationAdjusted: row.querySelector('.exp-inflation').checked
  }));

  return {
    // ... existing ...
    allocations: {
      sp500: (parseInt(document.getElementById('alloc-sp500').value) || 0) / 100,
      smallcap: (parseInt(document.getElementById('alloc-smallcap').value) || 0) / 100,
      bond: (parseInt(document.getElementById('alloc-bond').value) || 0) / 100,
      cash: (parseInt(document.getElementById('alloc-cash').value) || 0) / 100
    },
    // ...
  };
}
```

- [ ] **Step 4: Commit**
```bash
git add js/app.js
git commit -m "feat: implement allocation validation and input collection"
```

---

### Task 5: Refactor Simulation Engine

**Files:**
- Modify: `js/simulation.js`

- [ ] **Step 1: Implement the New Annual Loop**
Replace the logic inside the `for` loop of `simulateOnce`.

```javascript
  let portfolio = input.portfolioValue;
  let cumulativeInflation = 1.0;

  for (let year = 0; year < yearsToRun; year++) {
    const age1 = input.age + year;
    const age2 = hasSpouse ? input.spouseAge + year : null;
    const simYear = year;

    const p1Alive = age1 < deathAge1;
    const p2Alive = hasSpouse && age2 < deathAge2;
    if (!p1Alive && !p2Alive) break;

    // 1. Pre-calculation (spending reduction applies to the base target)
    const reductionFactor = Math.pow(1 - (input.annualSpendReductionRate || 0), year);
    const baseAnnualSpend = annualSpend * reductionFactor;
    
    // 2. Cash Flow Update (Spending/Income/Windfalls/Expenses)
    let netCashFlow = 0;
    
    // Spending (always inflation adjusted)
    netCashFlow -= baseAnnualSpend * cumulativeInflation;
    
    // Social Security (assumed inflation adjusted)
    if (p1Alive && p2Alive) {
      if (input.ssMonthly && age1 >= input.ssAge) netCashFlow += input.ssMonthly * 12 * cumulativeInflation;
      if (input.spouseSsMonthly && age2 >= input.spouseSsAge) netCashFlow += input.spouseSsMonthly * 12 * cumulativeInflation;
    } else if (p1Alive) {
      netCashFlow += Math.max((age1 >= input.ssAge ? input.ssMonthly : 0), p2SurvivorBenefit) * 12 * cumulativeInflation;
    } else if (p2Alive) {
      netCashFlow += Math.max((age2 >= input.spouseSsAge ? input.spouseSsMonthly : 0), p1SurvivorBenefit) * 12 * cumulativeInflation;
    }

    // Annuities
    for (const ann of (input.annuities || [])) {
      if (age1 < ann.startAge) continue;
      let active = true;
      if (ann.endCondition === 'specificYear' && simYear >= ann.endSimYear) active = false;
      if (ann.endCondition === 'userDeath' && !p1Alive) active = false;
      if (ann.endCondition === 'spouseDeath' && !p2Alive) active = false;
      
      if (active) {
        netCashFlow += ann.inflationAdjusted
          ? ann.monthlyAmount * 12 * cumulativeInflation
          : ann.monthlyAmount * 12;
      }
    }

    // Windfalls
    for (const w of (input.windfalls || [])) {
      if (w.simYear === simYear) {
        netCashFlow += w.inflationAdjusted ? w.amount * cumulativeInflation : w.amount;
      }
    }

    // Expenses
    for (const e of (input.expenses || [])) {
      if (e.simYear === simYear) {
        netCashFlow -= e.inflationAdjusted ? e.amount * cumulativeInflation : e.amount;
      }
    }

    portfolio += netCashFlow;

    if (portfolio <= 0) return false;

    // 3. Market Step (Apply returns to the remaining balance)
    const marketRow = pickRandom(input.marketData);
    const yearReturn = (marketRow.sp500 * input.allocations.sp500) +
                       (marketRow.small_cap * input.allocations.smallcap) +
                       (marketRow.tbond * input.allocations.bond) +
                       (marketRow.tbill * input.allocations.cash);
    
    portfolio *= (1 + yearReturn);

    // 4. Inflation Update (Pick independent target)
    const infTarget = pickRandom(input.inflationData);
    cumulativeInflation *= (1 + infTarget);
  }
```

- [ ] **Step 2: Commit**
```bash
git add js/simulation.js
git commit -m "feat: refactor simulation loop with cash-flow-first logic and custom allocations"
```

---

### Task 6: Final Verification

- [ ] **Step 1: Verify Allocation Validation**
Open `index.html`. Change allocations to sum to 95%. Verify "Run Simulation" is disabled. Change to 100%. Verify it is enabled.

- [ ] **Step 2: Verify Results**
Run a 1000-run simulation with 100% S&P 500 vs 100% Cash. Verify the S&P 500 run shows much higher variance in success rates at different spend levels.

- [ ] **Step 3: Verify Year 1 Current Dollars**
Set a high spending target that exactly matches Year 1 assets + income. Verify it doesn't fail immediately (since inflation only kicks in for Year 2).

- [ ] **Step 4: Commit Documentation**
```bash
git add docs/superpowers/plans/2026-04-22-phase-1-implementation.md
git commit -m "docs: add implementation plan for Phase 1"
```
