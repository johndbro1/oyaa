# OYAA (One Year After Another)

Howdy.  I created this monte-carlo retirement simulator, because all of the other ones out there made me more anxious than I 
was before I started using them.

Every other Monte-Carlo retirement calculator asks you to enter all of your information, and then enter how much you want to spend in retirement, and then it tells you whether that will work or not.  I found it annoying and tedious to try to experiment with different spending levels.  And often it was unclear how "safe" my choices were. 

So I created this to help fix that.

## How it Works

You enter your information (age, social security plans, assets (and how they're allocated), pensions, one-time expenses, windfalls, etc) and this system
will run a bunch of simulations at a variety of monthly spending levels.  

It will tell you how much you can spend, and how "dangerous" that spending level might be.  So you don't have to guess whether "X/month is moderately safe, very safe or barely safe".  It shows you a whole range of spending levels, and gives you a sense of the level of safety associated with each spending level.

## Other Benefits

After getting it to work, I was delighted that it would also let me do a couple of things.  

1. I could age myself 1 year, and pretend that it was a very bad year next year, and that my portfolio had shrunk by 30%.  And then run the simulations.  To my delight, while I did have a slightly more modest "safe" spending range, it wasn't *that* much more modest. It made me feel much less anxious about the future.
2. I could model things like "What if my wife makes me buy a vacation house. What does that do to our monthly spending".  And gave me some numbers that I could show her - "If we buy this lake house, we would have to spend $4,000/month less to be safe."  And on the other side: "This vacation is going to cost us twice as much as I expected.  What is that going to to do our retirement plan?" (Answer: no detectable difference)
3. I built it with the assumption that I would update my latest information and run it again at the beginning of each year (which is why it is called One Year After Another).  But you can also run it every month, and see what you could safely spend on a month-by-month basis.  So again, if the market tanks suddenly, and you're worried that your retirement is ruined, you can update the numbers and see for yourself.

## Longevity
Instead of just taking your life expectancy and ending it there, I simulate how you might pass on as many as 25 years before and 25 years after your official "life expectancy" (using a normal distribution).  This helps stress the simulation, both in terms of "what if I live a long time" but also "what if I die too young to get social security, will my partner be ok."  Things like that.  

## Security and Privacy

Everything that you see is running in your browser. There's no back-end server that's crunching your numbers. So there's no concerns about anyone stealing your information.  

## Data sources

I used Damodaran's NYU dataset for the annual performance for the S&P 500, Total Bond, Small Cap and T-Bills.  I used a different dataset for inflation. I don't remember where I got it, but it was some sort of official inflation record since 1970.

## Source Code

This is an open-source project. You can find the source code at:  https://github.com/johndbro1/oyaa




