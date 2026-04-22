
# PHASE 1 - Use 97 years of market data

I've found a dataset that includes data for the last 97 years. you can find it in all_market_data.js
  The way we handle the portfolio should be changed.

We need to let the user build their portfolio from the four sources:
* S&P 500
* Small Cap
* Total Bond
* T-Bill (Cash)

They need to choose how they allocate between these different categories, in, say 5% increments. The total needs to add up
to 100%

When the simulation runs, instead of picking from a particular portfolio, we'll pick a year, and then aggregate the results for
that year by multiplying the user's portfolio percentages by the returns for the different sources, and adding those up.

For example, if the returns for the S&P 500 in one year are 10% and the total bond market is 5%, and the user's portfolio is 70% 
stocks, 30% bonds, we would multiply 10% by 0.7 and 5% by 0.3 and get 8.5% as the correlated return 

We also need to adjust how the simulation runs are performed:

Year 1:  Inputs: current portfolio balance, the spending target, the various annuities and withdrawals for that year, and a cumulative_inflation factor, set to 1.0 to start

update the portfolio balance for the year:
```
spending_this_year := spending_target * cumulative_inflation

for each annuity:
  annuity_value := nominal_annuity_value / cumulative_inflation

for each withdrawal
  withdrawal_value := nominal_withdrawal_value * cumulative_inflation


updated_portfolio_balance := current_portfolio_balance - spending_this_year + sum(annuity_value) - sum(withdrawal_value)
```

pick a year randomly from the array for market performance, and pick an inflation_target from the inflation_targets array

calculate portfolio_performance as described above (the sum of the percentage of portfolio in each source * the performance of that source)

calculate the updated inflation:   cumulative_inflation_new = cumulative_inflation * (1 + inflation_target)

update the size of the portfolio by the return.

return the new portfolio balance and cumulative_inflation_new as inputs for the next year's calculation







# PHASE 2 - Medicare and Tax

11. in the results table, using today's IRS numbers, include the effective federal income tax rate assuming everything is taxable, the total annual tax expected, and the monthly equivalent (ie annual divided by 12)

12. pull tax calculations into a separate subsystem, so we can tinker with it separately from the main report

13. the tax calculations don't have to happen until the results are done, since they don't depend on random performance. 

14. create a new subsystem to calculate medicare fees based on current known rules and fee schedules. We'll use this as part of
the detailed final report.

15. Let the user specify the state, and include the state taxes they'll expect to pay based on monthly income as well.  So we'll need a subsystem to calculate state taxes as well.  Again, this will only need to happen at the very end, with the final results table.

16. don't forget that the calculations for taxes on social security are based on how much you earn, and (if I recall correctly) are maxed out at "85% of your social security income is taxable"




# PHASE 3 - Spending Closeup

17. if the user clicks on a particular result, we should provide the breakdown, year by year until both spouses reach final longevity. This would include:
  a. the various sources of income (SS, pension, retirement funds)
  b. the projected federal taxes
  c. the projected state taxes
  d. the projected medicare fees (once they hit 65)
  e. the net payment, after subtracting federal and state taxes, and medicare fees

In other words, a full summary of what everything looks like, year by year - all of the income, all of the mandated outflows.  This will allow me to validate your math, and also give the user some additional details about their overall financial picture.



# Phase 4 - Age Planning

18. once the user chooses a specific monthly spend scenario, we should allow them to focus in on it more closely, allowing them to change the max age of the spouses, and then re-running the 1000 simulations with those specific ages, and showing the total balance of their retirement account over time (based on the average of the monte carlo results) 

This detailed report should all be in "current dollars", so if a pension isn't inflation adjusted, it will go down by an average amount each year (the average of all of the historical inflation values)



