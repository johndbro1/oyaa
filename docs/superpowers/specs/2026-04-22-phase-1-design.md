# Design: Phase 1 - Asset Allocation & Simulation Refactor

This phase transforms the simulator from a static "Asset Mix" selection to a dynamic, asset-weighted model using 97 years of historical data.

## 1. User Interface (Asset Allocation & Adjustments)
### A. Asset Allocation
The existing `Asset Mix` dropdown in the "Retirement Portfolio" card will be replaced with four specific asset category inputs.
*   **Asset Categories:** S&P 500, Small Cap, Total Bond, T-Bill (Cash).
*   **Input Type:** Numeric inputs (`type="number"`) with `step="5"`, `min="0"`, and `max="100"`.
*   **Validation:** Live "Total Allocation" readout; "Run Simulation" button disabled unless total is 100%.
*   **Defaults:** 60% S&P 500, 40% Total Bond.

### B. Windfalls & Expenses
The dynamic rows for "Expected Windfalls" and "One-Time Expenses" will be updated to include an "Inflation Adjusted" checkbox.
*   **Label:** "Inflation Adjusted"
*   **Behavior:** When checked, the amount is multiplied by `cumulative_inflation` in the year it occurs.

## 2. Data Strategy
*   **Data Consolidation:** The 97 years of market data from `js/all_market_data.js` will be manually normalized (percent to decimal) and incorporated directly into `js/data.js`. No additional script tags or Python generation will be used.
*   **Inflation Data:** Use the existing `historical_inflation` array in `js/data.js`.
*   **Sampling:** Each simulation year picks a random market year from the consolidated data and an independent inflation target.

## 3. Simulation Logic Refactor
The core loop in `js/simulation.js` (`simulateOnce`) will be updated to follow this sequence per year:

### A. Pre-calculation (Current Dollars)
*   **Year 1 Context:** Starts with `cumulative_inflation = 1.0`. Year 1 cash flows are in "current dollars".
*   Apply the `annualSpendReductionRate` to the base spend target for that year of retirement.
    *   `spending_target_this_year = startingMonthlySpend * 12 * ((1 - reductionRate) ^ year_index)`

### B. Portfolio Balance Update (Cash Flow)
*   Calculate inflation-adjusted spending: `spend = spending_target_this_year * cumulative_inflation`.
*   Calculate COLA-adjusted Social Security: `ss = nominal_ss * cumulative_inflation`.
*   Calculate Pensions, Windfalls, and Expenses:
    *   If inflation-adjusted: `amount = nominal_amount * cumulative_inflation`.
    *   If nominal: `amount = nominal_amount`.
*   **Updated Balance:** `portfolio = portfolio - spend + ss + annuities + windfalls - expenses`.

### C. Market Step
*   Pick a random year from the consolidated market data.
*   Calculate the **Correlated Return**:
    *   `year_return = (row.sp500 * (user_sp500_pct / 100)) + (row.small_cap * (user_small_cap_pct / 100)) + (row.tbond * (user_tbond_pct / 100)) + (row.tbill * (user_tbill_pct / 100))`
*   **Apply Growth:** `portfolio = portfolio * (1 + year_return)`.

### D. Inflation Update
*   Pick a random inflation target `inf` and update: `cumulative_inflation = cumulative_inflation * (1 + inf)`.

## 4. Technical Changes
*   **`js/data.js`:** Manually update to include the normalized 97-year market data.
*   **`index.html`:** Update the "Retirement Portfolio" card UI and dynamic row templates.
*   **`js/app.js`:** Update `buildInput()` and add real-time allocation validation.
*   **`js/simulation.js`:** Implement the refactored `simulateOnce` logic.

## 5. Ambiguity Resolutions
*   **Year 1 Dollars:** Confirmed to be "current dollars" (cumulative inflation = 1.0).
*   **Data Loading:** Consistently using `js/data.js` to avoid `fetch()` or extra script tags.
*   **Adjustment UI:** Added checkboxes to Windfalls and One-Time Expenses.
