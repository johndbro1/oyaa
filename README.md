# Retirement Planning Is Insufficient

The various systems that try to help you figure out how much you can spend in a given year for retirement are ok.

But they are missing something important: You don't know how long you're going to live.

There are tables that can estimate your mortality, but a) those are wholesale, and you are a specific person, with a family
history, and lifestyle choices; and b) it's difficult to know what the future might bring in terms of longevity

The idea here is that you'll enter all the information for yourself and your spouse, and the system will run a bunch of monte carlo
simulations of  your remaining life. The two main input variables will be a) market performance; b) you (and optionally your spouses') age at death; And the main "output" variable will be various flat-rate spending targets for you, and how successfully your plan survives those spending targets.

So we simulate out your entire life, thousands of times. And we simulate market performance, thousands of times.  And we also simulate various spending levels on your part, thousands of times.  And we can determine for any given spending level, how often you run out of money.

What this will give you is a range of spending options, and the success rate of each.  For example, you might have a 0% chance of running out of money if you spend $5000/month.  You might have a 1% chance of running out of money if you spend $7500/month.  You might have a 10% chance if you spend $10,000/month, and perhaps a 90% chance of failure if you spend $30,000/month .  

The point is, you'll get a snapshot of:  given everything we know about you, about your portfolio, and estimates about market performance, you can see the consequences of spending <X> this year.   So you can make an informed choice about how much you can spend this year.  And then next year, you come back, fill in the information again, and run this again, and you'll get a new set of predictions and you can make a new informed choice about the future.  And then the year after that, etc, etc.

Of course, you could literally run this every month if you wanted, so you could make even more fine-grained choices about your spending.

## Getting started

We'll need to know the following:
* Your age and gender
* Your life expectancy (using LivingTo100.com) [and your spouse's]
* Your retirement portfolio
  * The stock vs bond ratio
* Social Security
  * The age you plan to take SS and how much it will pay
  * The age your spouse plans to take SS and how much it will pay
* Any annuities
  * when they start and end
  * whether they are inflation adjusted
  * if they end on death, do they end when one person dies, or both
* Any fixed estate you wish to leave for your heirs
  * Whether or not that estate is inflation adjusted
* If you expect to reduce your spending gradually as you age (0.25%, 0.5%, 1%, 2%, etc)
* Any specific expenses (gift for a grandchild's education, a car, etc) and the year that these will happen

## Outputs

A breakdown of a variety of monthly spending targets, and how like your portfolio is to last until you (and your spouse) pass on, if your monthly spending remained fixed at that level for the rest of your life.


## The Benefit

Let's say you want to be 100% certain that you'll meet your goals (which I don't recommend). You can discover what monthly spending target gets you to 100%.  Assuming you spend that much, and no more, you can feel supremely confident that your spending will be covered throughout your lifetime.

But let's say you're willing to only be 99% certain.  You'll have a higher spending target.  And at 90% and 80%, even higher.

"But an 80% target means there's a 1 in 5 chance I run out of money" . Yes and No. The expectation is that you revisit this calculator every month or every year.  So as your portfolio changes (and perhaps your life changes along with it) you'll get up-to-date results.  

One benefit of this is, let's say there's a downturn next month. You might start freaking out about your spending.  So you can 
fire up this calculator, and it can tell you what the new spending predictions are, based on your new portfolio amounts and all
the other factors.  My guess is that it will not go down nearly as far as you think it will, which will help with anxiety, and
yet it will also give you actionable things to do (in terms of adjusting your expectations about the next month or whatever).

The second benefit is the upside benefit. If you are like me, and constantly fail to meet your spending targets, this will be a way to help you get over that anxiety, to perhaps allow you to feel better about spending more.


## Implementation


Javascript.  No external dependencies at all.  It's just logic that can run in your browser.

I have data for historical inflation and S&P 500 performance. 

how we calculate longevity will be configurable, but the starting point will be: whatever age was provided by LivingTo100.com, 
and then two standard deviations out from that, each one representing 12.5 years.  I know this can be high, but I think that's 
smart given the ongoing advancements in longevity.

normally, you'd use monte carlo to simulate every year until you and your spouse passed on, and then assess whether there
was money left.  And you'd do that some significant number of times, typically 100 to 1000.

What I'm thinking is to also select "death ages" for the two people from the normal distrubtion around their pre-calculated
longevity. And run the Monte Carlo simulation using those two ages.

This dilutes the quality of the monte carlo to have these additional variables, so we'll have to up the number of runs of
the simulation


The most important part will be to figure out what the spending target should be, given all the other factors.

My thought is to let the user specify an initial target spend. perform N monte carlo simulation runs at each $500 increment (with ages chosen from the normal distribution), until we descend below some sort of 
minimal probability of success (we'll start with 50%) across the average of the N runs

The user can choose what N should be - 100, 1000 or 10,000 or even higher. We're using their CPU, after all.

   
## Data

I've created various json files.

historical_inflation.json contains inflation results for many years.

sp_500.json contains the performance of the S&P 500 for 20 years
small_cap.json contains the performance of small cap stocks for 20 years
80_bonds_20_sp.json contains the performance of an 80% aggregate bond and 20% s&p 500 portfolio over 20 years
80_bonds_10_sp_10_intl.json contains the performance of a 80% bonds, 10% s&p 500 and 10% international stock fund over 20 years
 60_bonds_20_sp_20_intl.json contains a 60% bond, 20% s&p, 20% international
40_bonds_30_sp_30_intl.json contains a 40% bond, 30% s&p, 30% international
25_sp_25_intl_25_mid_25_small.json contains 25% s&p, 25% international, 25% mid cap, 25% small cap
20_bonds_20_sp_20_intl_20_mid_20_small.json contains 20% each of bonds, S&P, International, mid cap and small cap



## User Experience

The user is presented with a page that lets them fill out all of the following:

1. Age and Sex, of both user and (optionally) spouse
2. expected life expectancy of both user and spouse
3. age at which each person will receive some sort of formal retirement benefit (such as Social Security), and how much the monthly payout will be
4. the overall valuation of the retirement portfolios, and which of the above asset mixes it most closely resembles
5. a list of any anticipated windfalls and when they are expected to arrive
6. a list of any anticipated pensions and/or annuities, when they are expected to arrive, when they are expected to end, and whether they are inflation adjusted (end point can be: 1. a specific year, 2. at the death of a spouse, 3. at the death of both spouses
7. a list of any anticipated expenses and when (like large vacations or large purchases or donations)
8. a target estate to leave when both spouses pass on (and is it inflation adjusted)


 




## To Update Data

run this script to rebuild the 'all in one' application:

`python3 generate_data_js.py` 


