# Phase 2 - Medicare and Tax Subsystem Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a post-simulation tax and Medicare calculation layer to show "Net Spending" in the results table.

**Architecture:** 
- Standalone `js/tax-subsystem.js` containing pure math functions for 2024 tax brackets and Medicare premiums.
- Logic is triggered once at the end of the simulation during result rendering.
- All income (withdrawals, SS, pensions) is treated as ordinary income for simplicity.

**Tech Stack:** Vanilla JavaScript (ES6).

---

### Task 1: Create the Tax Subsystem

**Files:**
- Create: `js/tax-subsystem.js`
- Modify: `index.html` (add script tag)

- [ ] **Step 1: Implement Federal Tax Brackets**
Create a function that applies the 2024 graduated brackets (10%, 12%, 22%, 24%, 32%, 35%, 37%).

- [ ] **Step 2: Implement Medicare Logic**
Calculate Part B premiums ($174.70/mo) and IRMAA surcharges based on taxable income. Apply only for individuals age 65+.

- [ ] **Step 3: Export the Interface**
Expose a single `calculateNetIncome(grossMonthly, ssMonthly, pensionMonthly, filingStatus, userAge, spouseAge, stateTaxRate)` function.

- [ ] **Step 4: Commit**
```bash
git add js/tax-subsystem.js index.html
git commit -m "feat: add standalone tax and medicare subsystem"
```

---

### Task 2: Update UI for Tax Settings

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add State Tax Dropdown**
Insert the "State Tax Environment" dropdown into the "Spending Settings" card.

- [ ] **Step 2: Commit**
```bash
git add index.html
git commit -m "ui: add state tax environment selector"
```

---

### Task 3: Integrate with Results Table

**Files:**
- Modify: `js/app.js`

- [ ] **Step 1: Update `renderResults`**
Map each simulation result through the `TaxSubsystem` to calculate net monthly values.

- [ ] **Step 2: Update Table Header and Row Template**
Expand the table to include Gross, Taxes/Fees, Net, and Effective Rate columns.

- [ ] **Step 3: Commit**
```bash
git add js/app.js
git commit -m "feat: integrate tax subsystem into results rendering"
```
