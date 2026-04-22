// simulation.js — pure Monte Carlo engine, no DOM access

function normalRandom(mean, stdDev) {
  let u, v;
  do { u = Math.random(); } while (u === 0);
  do { v = Math.random(); } while (v === 0);
  return mean + stdDev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sampleDeathAge(currentAge, lifeExpectancy) {
  if (currentAge == null || lifeExpectancy == null) return null;
  const raw = Math.round(normalRandom(lifeExpectancy, 12.5));
  return Math.max(currentAge + 1, raw);
}

// Returns true if portfolio survives, false if ruin
function simulateOnce(input, monthlySpend, deathAge1, deathAge2) {
  const annualSpend = monthlySpend * 12;
  const hasSpouse = deathAge2 !== null;
  const lastYear = hasSpouse ? Math.max(deathAge1, deathAge2) : deathAge1;
  const yearsToRun = lastYear - input.age;

  // Survivor benefit from each person, computed once per simulation run.
  // If the deceased reached their SS start age: full benefit.
  // If they died before it: reduced by 8% per year early (floored at 0).
  function calcSurvivorBenefit(ssMonthly, ssAge, deathAge) {
    if (!ssMonthly || !ssAge) return 0;
    if (deathAge >= ssAge) return ssMonthly;
    const yearsEarly = ssAge - deathAge;
    return Math.max(0, ssMonthly * (1 - 0.08 * yearsEarly));
  }

  const p1SurvivorBenefit = calcSurvivorBenefit(input.ssMonthly, input.ssAge, deathAge1);
  const p2SurvivorBenefit = hasSpouse
    ? calcSurvivorBenefit(input.spouseSsMonthly, input.spouseSsAge, deathAge2)
    : 0;

  let portfolio = input.portfolioValue;
  let cumulativeInflation = 1.0;

  for (let year = 0; year < yearsToRun; year++) {
    const age1 = input.age + year;
    const age2 = hasSpouse ? input.spouseAge + year : null;
    const simYear = year; // years from now

    const p1Alive = age1 < deathAge1;
    const p2Alive = hasSpouse && age2 < deathAge2;
    const anyoneAlive = p1Alive || p2Alive;

    if (!anyoneAlive) break;

    // Market return and inflation
    const ret = pickRandom(input.assetMixReturns);
    const inf = pickRandom(input.inflationData);
    cumulativeInflation *= (1 + inf);
    portfolio *= (1 + ret);

    // Social Security — COLA-adjusted (tracks inflation each year)
    // Both alive: each collects their own benefit if past their start age
    // One dead: survivor collects the higher of their own benefit or the deceased's benefit
    //           (only if the deceased was eligible at time of death)
    if (p1Alive && p2Alive) {
      if (input.ssMonthly    && age1 >= input.ssAge)        portfolio += input.ssMonthly * 12 * cumulativeInflation;
      if (input.spouseSsMonthly && age2 >= input.spouseSsAge) portfolio += input.spouseSsMonthly * 12 * cumulativeInflation;
    } else if (p1Alive) {
      // p2 is dead — p1 gets the higher of their own benefit or p2's survivor benefit
      const ownBenefit = (input.ssMonthly && age1 >= input.ssAge) ? input.ssMonthly : 0;
      portfolio += Math.max(ownBenefit, p2SurvivorBenefit) * 12 * cumulativeInflation;
    } else if (p2Alive) {
      // p1 is dead — p2 gets the higher of their own benefit or p1's survivor benefit
      const ownBenefit = (input.spouseSsMonthly && age2 >= input.spouseSsAge) ? input.spouseSsMonthly : 0;
      portfolio += Math.max(ownBenefit, p1SurvivorBenefit) * 12 * cumulativeInflation;
    }

    // Annuities
    for (const ann of (input.annuities || [])) {
      if (age1 < ann.startAge) continue;

      let active = true;
      if (ann.endCondition === 'specificYear' && simYear >= ann.endSimYear) active = false;
      if (ann.endCondition === 'userDeath'   && !p1Alive) active = false;
      if (ann.endCondition === 'spouseDeath' && !p2Alive) active = false;
      // 'bothDeath' — loop already stops when no one is alive

      if (active) {
        const amount = ann.inflationAdjusted
          ? ann.monthlyAmount * 12 * cumulativeInflation
          : ann.monthlyAmount * 12;
        portfolio += amount;
      }
    }

    // Windfalls
    for (const w of (input.windfalls || [])) {
      if (w.simYear === simYear) portfolio += w.amount;
    }

    // Spending — inflation-adjusted to maintain real purchasing power,
    // then reduced each year as people age.
    const spendReduction = Math.pow(1 - (input.annualSpendReductionRate || 0), year);
    portfolio -= annualSpend * cumulativeInflation * spendReduction;

    // One-time expenses
    for (const e of (input.expenses || [])) {
      if (e.simYear === simYear) portfolio -= e.amount;
    }

    if (portfolio <= 0) return false;
  }

  // Estate check
  const estateTarget = input.estateInflationAdjusted
    ? input.targetEstate * cumulativeInflation
    : (input.targetEstate || 0);

  return portfolio >= estateTarget;
}

// Main entry point — returns array of { monthlySpend, successRate }
// onProgress(monthlySpend, runsComplete, totalRuns) called after each chunk
// onDone(results) called when complete
function runMonteCarloSimulation(input, onProgress, onDone) {
  const CHUNK_SIZE = 50; // runs per chunk — keeps UI responsive
  const results = [];
  let monthlySpend = input.startingMonthlySpend || 1000;
  const stopRate = input.stopSuccessRate ?? 0.10;
  const numRuns = input.numRuns || 1000;

  let successes = 0;
  let runsComplete = 0;

  function runChunk() {
    const end = Math.min(runsComplete + CHUNK_SIZE, numRuns);
    while (runsComplete < end) {
      const d1 = sampleDeathAge(input.age, input.lifeExpectancy);
      const d2 = input.spouseAge != null
        ? sampleDeathAge(input.spouseAge, input.spouseLifeExpectancy)
        : null;
      if (simulateOnce(input, monthlySpend, d1, d2)) successes++;
      runsComplete++;
    }

    if (onProgress) onProgress(monthlySpend, runsComplete, numRuns);

    if (runsComplete < numRuns) {
      setTimeout(runChunk, 0); // more chunks for this spend level
      return;
    }

    // This spend level is done
    const successRate = successes / numRuns;
    results.push({ monthlySpend, successRate, numRuns });

    if (successRate > stopRate && monthlySpend < 200000) {
      monthlySpend += 500;
      successes = 0;
      runsComplete = 0;
      setTimeout(runChunk, 0);
    } else {
      if (onDone) onDone(results);
    }
  }

  setTimeout(runChunk, 0);
}
