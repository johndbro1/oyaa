# Design: Phase 2 - Medicare and Tax Subsystem

This phase adds financial realism by calculating the "Net Income" after Federal Taxes, State Taxes, and Medicare premiums. These calculations are performed post-simulation to ensure accuracy without impacting performance.

## 1. Architecture: The Post-Simulation Tax Engine
Taxes and fees are calculated on the "spending target" levels displayed in the final results table. 
*   **Trigger:** The logic runs inside `renderResults` after the Monte Carlo simulation finishes.
*   **Input:** Monthly Gross Spend, Monthly Social Security, Filing Status (Single/Joint).
*   **Output:** Monthly Federal Tax, Monthly State Tax, Monthly Medicare Premiums, Effective Tax Rate.

## 2. Tax & Fee Logic (`js/tax-subsystem.js`)
A standalone library will encapsulate all financial rules using 2024 data.

### A. Federal Income Tax
*   **Filing Status:** `has-spouse` checked = Married Filing Jointly; unchecked = Single.
*   **Standard Deduction (2024):** 
    *   Single: $14,600 (+ $1,950 if age 65+)
    *   Joint: $29,200 (+ $1,550 per person age 65+)
*   **Taxable Income:** Total income (Gross Spend + Social Security + Pensions) is treated as ordinary income for simplicity.
*   **Brackets:** Graduated from 10% to 37% based on 2024 IRS tables.

### B. Medicare Premiums (Task 14)
*   **Eligibility:** Part B and D premiums are only calculated for individuals who are 65 or older.
*   **Conditional Logic:** 
    *   If both user and spouse are under 65, Medicare premiums are $0.
    *   If one is 65+ and the other is under, only one set of premiums is calculated.
    *   If both are 65+, two sets of premiums are calculated.
*   **Base Premium:** $174.70/month (Part B) + $0 (Part D base).
*   **IRMAA Surcharges:** Applied if MAGI exceeds specific thresholds ($103k Single / $206k Joint).

### C. State Income Tax (Task 15)
*   User selects a "State Tax Bucket" from the UI:
    *   None: 0%
    *   Low: 3%
    *   Medium: 6%
    *   High: 9%
*   Calculation: Flat percentage applied to total taxable income.

## 3. UI Changes
### A. Spending Settings Card
Add a new dropdown for State Tax:
```html
<label>State Tax Environment
  <select id="state-tax-bucket">
    <option value="0">None (0%)</option>
    <option value="0.03">Low (3%)</option>
    <option value="0.06">Medium (6%)</option>
    <option value="0.09">High (9%)</option>
  </select>
</label>
```

### B. Results Table
Expand the table columns:
1.  **Gross Spend** (e.g., $8,000/mo)
2.  **Annual Gross**
3.  **Est. Monthly Taxes/Fees** (Fed + State + Medicare)
4.  **Net Monthly Spending** (What you actually get to use)
5.  **Eff. Tax Rate**
6.  **Success Rate**

## 4. Implementation Details
*   `js/tax-subsystem.js`: Pure functions for tax/medicare math. These functions will accept the current ages of the user and spouse to determine Medicare eligibility and standard deduction amounts.
*   `js/app.js`: Update `renderResults` to pass ages to the tax subsystem.

## 5. Ambiguity Resolutions
*   **Tax Base Simplicity:** For simplicity, we will start with the assumption that all income (Social Security, Pensions, and Portfolio Withdrawals) is treated as ordinary income.
*   **Filing Status:** Determined by the "Include spouse" checkbox.
*   **Age:** Tax/Medicare logic uses the *initial* ages provided by the user to calculate the values for the summary table.
