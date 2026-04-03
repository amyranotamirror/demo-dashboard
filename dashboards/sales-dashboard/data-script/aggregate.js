/**
 * aggregate.js — Extract key metrics from CSV data for dashboard prototype
 * Run: node aggregate.js
 * Output: metrics.json
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DATA_DIR = path.join(__dirname, '../data');

async function readCsv(filename) {
  const rows = [];
  const filePath = path.join(DATA_DIR, filename);
  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
  let headers = null;
  for await (const line of rl) {
    if (!headers) { headers = line.split(','); continue; }
    const vals = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => row[h] = vals[i] ?? null);
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { result.push(current); current = ''; continue; }
    current += ch;
  }
  result.push(current);
  return result;
}

function daysBetween(d1, d2) {
  return Math.round((new Date(d1) - new Date(d2)) / 86400000);
}

async function main() {
  console.log('Loading CSVs...');
  const [deals, companies, persons, calls, subscriptions, rawInputs, improvements, features] = await Promise.all([
    readCsv('deals.csv'),
    readCsv('companies.csv'),
    readCsv('subscriptions.csv'),  // note: companies.csv is index 1, subscriptions is index 2
    readCsv('calls.csv'),
    readCsv('subscriptions.csv'),
    readCsv('raw_inputs.csv'),
    readCsv('improvements.csv'),
    readCsv('features.csv'),
  ]);

  // Re-load correctly
  const dealsData = await readCsv('deals.csv');
  const companiesData = await readCsv('companies.csv');
  const personsData = await readCsv('persons.csv');
  const callsData = await readCsv('calls.csv');
  const subsData = await readCsv('subscriptions.csv');
  const rawInputsData = await readCsv('raw_inputs.csv');
  const improvementsData = await readCsv('improvements.csv');
  const featuresData = await readCsv('features.csv');
  const useCasesData = await readCsv('use_cases.csv');
  const satisfactionData = await readCsv('satisfaction_scores.csv');

  console.log(`Loaded: ${dealsData.length} deals, ${personsData.length} persons, ${callsData.length} calls, ${subsData.length} subs, ${rawInputsData.length} raw inputs`);

  // --- Person lookup ---
  const personById = {};
  personsData.forEach(p => personById[p.id] = p);

  // --- Company lookup ---
  const companyById = {};
  companiesData.forEach(c => companyById[c.id] = c);

  // --- Determine "today" from the data (max call_date — most recent activity) ---
  const allCallDates = callsData.map(c => c.call_date).filter(Boolean).sort();
  const today = new Date(allCallDates[allCallDates.length - 1]);
  const todayStr = today.toISOString().split('T')[0];
  console.log(`Inferred "today": ${todayStr}`);

  // --- Current quarter boundaries ---
  const qMonth = today.getMonth(); // 0-indexed
  const qStart = new Date(today.getFullYear(), Math.floor(qMonth / 3) * 3, 1);
  const qEnd = new Date(qStart.getFullYear(), qStart.getMonth() + 3, 0);

  // --- AEs only (role = 'ae') and currently active (no left_at) ---
  const aes = personsData.filter(p => p.role === 'ae' && !p.left_at);
  const aeIds = new Set(aes.map(p => p.id));

  // === PIPELINE ===
  const inProgress = dealsData.filter(d => d.status === 'in_progress');
  const pipelineValue = inProgress.reduce((s, d) => s + (parseInt(d.deal_value_usd) || 0), 0);
  const ghostDeals = dealsData.filter(d => d.status === 'ghost');
  const ghostRate = ghostDeals.length / (inProgress.length + ghostDeals.length);

  // Stage breakdown for funnel
  const stageCount = { qualifying: 0, validating: 0, progressing: 0, focus: 0 };
  inProgress.forEach(d => { if (stageCount[d.stage] !== undefined) stageCount[d.stage]++; });

  // === WIN / LOSS (all time + this quarter) ===
  const wonDeals = dealsData.filter(d => d.status === 'won');
  const lostDeals = dealsData.filter(d => d.status === 'lost');
  const winRate = wonDeals.length / (wonDeals.length + lostDeals.length);

  // This quarter won/lost
  const qWon = wonDeals.filter(d => { const dt = new Date(d.closed_at); return dt >= qStart && dt <= qEnd; });
  const qLost = lostDeals.filter(d => { const dt = new Date(d.closed_at); return dt >= qStart && dt <= qEnd; });
  const qWinRate = qWon.length / (qWon.length + qLost.length || 1);
  const qClosedRevenue = qWon.reduce((s, d) => s + (parseInt(d.deal_value_usd) || 0), 0);

  // Avg sales cycle
  const wonWithCycle = wonDeals.filter(d => d.closed_at && d.created_at);
  const avgCycleWon = wonWithCycle.reduce((s, d) => s + daysBetween(d.closed_at, d.created_at), 0) / (wonWithCycle.length || 1);
  const lostWithCycle = lostDeals.filter(d => d.closed_at && d.created_at);
  const avgCycleLost = lostWithCycle.reduce((s, d) => s + daysBetween(d.closed_at, d.created_at), 0) / (lostWithCycle.length || 1);

  // Lost reasons
  const lostReasons = {};
  lostDeals.forEach(d => {
    const r = d.lost_reason || 'unknown';
    lostReasons[r] = (lostReasons[r] || 0) + 1;
  });
  const lostReasonArr = Object.entries(lostReasons).sort((a, b) => b[1] - a[1]).map(([reason, count]) => ({
    reason,
    count,
    pct: Math.round(count / lostDeals.length * 100)
  }));

  // Win reasons
  const winReasons = {};
  wonDeals.forEach(d => {
    const r = d.win_reason || 'unknown';
    winReasons[r] = (winReasons[r] || 0) + 1;
  });

  // Monthly won/lost (last 6 months, up to today)
  const monthlyWonLost = {};
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  [...wonDeals, ...lostDeals].forEach(d => {
    if (!d.closed_at) return;
    const dt = new Date(d.closed_at);
    if (dt < sixMonthsAgo || dt > today) return;  // exclude future-dated renewals
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyWonLost[key]) monthlyWonLost[key] = { won: 0, lost: 0, wonVal: 0 };
    if (d.status === 'won') { monthlyWonLost[key].won++; monthlyWonLost[key].wonVal += parseInt(d.deal_value_usd) || 0; }
    if (d.status === 'lost') monthlyWonLost[key].lost++;
  });
  const monthlyArr = Object.entries(monthlyWonLost).sort((a, b) => a[0].localeCompare(b[0])).map(([month, v]) => ({ month, ...v }));

  // Win rate by month (last 6)
  const winRateByMonth = monthlyArr.map(m => ({
    month: m.month,
    winRate: Math.round(m.won / ((m.won + m.lost) || 1) * 100)
  }));

  // === FUNNEL STAGE CONVERSION ===
  // Need stage history - approximate from deals table
  // Count deals that ever reached each stage
  const stageOrder = ['qualifying', 'validating', 'progressing', 'focus', 'won'];
  const stageFunnel = { qualifying: 0, validating: 0, progressing: 0, focus: 0, won: wonDeals.length };

  // All deals that had a stage (in_progress, won, lost, ghost all came through stages)
  const allStagedDeals = dealsData.filter(d => d.stage || d.status === 'won' || d.status === 'lost');
  // Qualifying: all deals that entered pipeline
  stageFunnel.qualifying = dealsData.filter(d => ['in_progress', 'won', 'lost', 'ghost'].includes(d.status)).length;
  // Validating+: won or lost deals that weren't immediately lost at qualifying, plus in_progress beyond qualifying
  stageFunnel.validating = dealsData.filter(d =>
    d.status === 'won' ||
    (d.status === 'lost' && d.stage !== 'qualifying') ||
    (d.status === 'in_progress' && ['validating', 'progressing', 'focus', 'negotiating'].includes(d.stage))
  ).length;
  stageFunnel.progressing = dealsData.filter(d =>
    d.status === 'won' ||
    (d.status === 'lost' && ['progressing', 'focus', 'negotiating'].includes(d.stage)) ||
    (d.status === 'in_progress' && ['progressing', 'focus', 'negotiating'].includes(d.stage))
  ).length;
  stageFunnel.focus = dealsData.filter(d =>
    (d.status === 'won') ||
    (d.status === 'in_progress' && d.sub_status === 'focus')
  ).length;

  // === CUSTOMERS / SUBSCRIPTIONS ===
  const activeSubs = subsData.filter(s => !s.ended_at);
  const activeMrr = activeSubs.reduce((s, sub) => s + (parseInt(sub.mrr_usd) || 0), 0);
  const activeCustomerIds = new Set(activeSubs.map(s => s.company_id));
  const activeCustomerCount = activeCustomerIds.size;
  const avgMrrPerCustomer = Math.round(activeMrr / (activeCustomerCount || 1));

  // Plan distribution
  const planDist = {};
  activeSubs.forEach(s => { planDist[s.plan_name] = (planDist[s.plan_name] || 0) + 1; });

  // Version distribution
  const versionDist = {};
  activeSubs.forEach(s => { versionDist[s.product_version] = (versionDist[s.product_version] || 0) + 1; });

  // NRR (trailing 90 days)
  const nrrStart = new Date(today);
  nrrStart.setDate(nrrStart.getDate() - 90);
  const startMrr = subsData
    .filter(s => new Date(s.started_at) <= nrrStart && (!s.ended_at || new Date(s.ended_at) > nrrStart))
    .reduce((s, sub) => s + (parseInt(sub.mrr_usd) || 0), 0);
  const endMrr = subsData
    .filter(s => new Date(s.started_at) <= today && (!s.ended_at || new Date(s.ended_at) > today))
    .reduce((s, sub) => s + (parseInt(sub.mrr_usd) || 0), 0);
  const nrr = startMrr > 0 ? Math.round(endMrr / startMrr * 100) : 100;

  // MRR by month (last 6)
  const mrrByMonth = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const snap = new Date(d.getFullYear(), d.getMonth() + 1, 0); // end of month
    mrrByMonth[key] = subsData
      .filter(s => new Date(s.started_at) <= snap && (!s.ended_at || new Date(s.ended_at) > snap))
      .reduce((s, sub) => s + (parseInt(sub.mrr_usd) || 0), 0);
  }

  // Churn last 90 days
  const churnedRecent = subsData.filter(s => s.ended_at && new Date(s.ended_at) > nrrStart && new Date(s.ended_at) <= today);
  const mrrChurned = churnedRecent.reduce((s, sub) => s + (parseInt(sub.mrr_usd) || 0), 0);
  const mrrChurnRate = startMrr > 0 ? Math.round(mrrChurned / startMrr * 100) : 0;

  // === REP PERFORMANCE ===
  const repStats = {};
  aes.forEach(ae => {
    const aeDeals = dealsData.filter(d => d.owner_id === ae.id);
    const aeWon = aeDeals.filter(d => d.status === 'won');
    const aeLost = aeDeals.filter(d => d.status === 'lost');
    const aeOpen = aeDeals.filter(d => d.status === 'in_progress');
    const aeGhost = aeDeals.filter(d => d.status === 'ghost');
    const aeCompanyIds = new Set(aeDeals.map(d => d.company_id));
    const thirtyAgo = new Date(today);
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    const recentCalls = callsData.filter(c =>
      aeCompanyIds.has(c.company_id) && new Date(c.call_date) >= thirtyAgo
    );
    const callsPerWeek = Math.round(recentCalls.length / 4.3 * 10) / 10;

    repStats[ae.id] = {
      name: ae.name,
      totalDeals: aeDeals.length,
      wonDeals: aeWon.length,
      lostDeals: aeLost.length,
      openDeals: aeOpen.length,
      ghostDeals: aeGhost.length,
      pipelineValue: aeOpen.reduce((s, d) => s + (parseInt(d.deal_value_usd) || 0), 0),
      wonValue: aeWon.reduce((s, d) => s + (parseInt(d.deal_value_usd) || 0), 0),
      winRateCount: Math.round(aeWon.length / ((aeWon.length + aeLost.length) || 1) * 100),
      winRateValue: Math.round(aeWon.reduce((s,d)=>s+(parseInt(d.deal_value_usd)||0),0) / ((aeWon.reduce((s,d)=>s+(parseInt(d.deal_value_usd)||0),0) + aeLost.reduce((s,d)=>s+(parseInt(d.deal_value_usd)||0),0)) || 1) * 100),
      ghostRate: Math.round(aeGhost.length / ((aeOpen.length + aeGhost.length) || 1) * 100),
      callsPerWeek,
      topLostReason: Object.entries(aeLost.reduce((acc, d) => { acc[d.lost_reason||'unknown']=(acc[d.lost_reason||'unknown']||0)+1; return acc; }, {})).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'n/a'
    };
  });

  const repArr = Object.values(repStats).sort((a, b) => b.winRateCount - a.winRateCount);

  // === MARKET SIGNALS ===
  // Competitor mentions from raw_inputs (competitor_id is set)
  const competitorMentions = {};
  rawInputsData.filter(r => r.competitor_id).forEach(r => {
    const comp = companyById[r.competitor_id];
    if (!comp) return;
    if (!competitorMentions[comp.name]) competitorMentions[comp.name] = { count: 0, blockingCount: 0 };
    competitorMentions[comp.name].count++;
    if (r.is_blocking === 'true') competitorMentions[comp.name].blockingCount++;
  });

  // Top competitors with win rate impact
  const compMentionArr = Object.entries(competitorMentions)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([name, stats]) => {
      // Find deals mentioning this competitor
      const compId = companiesData.find(c => c.name === name)?.id;
      const dealsWithComp = [...new Set(rawInputsData.filter(r => r.competitor_id === compId).map(r => r.company_id))];
      const dealsWonWithComp = dealsWithComp.filter(cid => dealsData.some(d => d.company_id === cid && d.status === 'won')).length;
      const winRateWithComp = dealsWithComp.length > 0 ? Math.round(dealsWonWithComp / dealsWithComp.length * 100) : 0;
      return { name, mentions: stats.count, winRate: winRateWithComp, dealCount: dealsWithComp.length };
    });

  // Top feature requests (via improvements)
  const improvementDealCount = {};
  rawInputsData.filter(r => r.improvement_id).forEach(r => {
    if (!improvementDealCount[r.improvement_id]) improvementDealCount[r.improvement_id] = new Set();
    improvementDealCount[r.improvement_id].add(r.company_id);
  });

  const topImprovements = improvementsData
    .map(imp => {
      const feat = featuresData.find(f => f.id === imp.feature_id);
      return {
        title: imp.title,
        status: imp.status,
        isBlocking: imp.is_blocking === 'true',
        companyCount: improvementDealCount[imp.id]?.size || 0,
        rawInputCount: parseInt(imp.raw_input_count) || 0,
        featureStatus: feat?.status || null
      };
    })
    .filter(i => i.companyCount > 0)
    .sort((a, b) => b.companyCount - a.companyCount)
    .slice(0, 10);

  // Top blocking improvements
  const blockingImprovements = topImprovements.filter(i => i.isBlocking).slice(0, 6);

  // === ACCOUNT HEALTH ===
  // Days since last post-sale call per customer
  const lastCallByCompany = {};
  callsData.filter(c => c.phase === 'post_sale').forEach(c => {
    if (!lastCallByCompany[c.company_id] || c.call_date > lastCallByCompany[c.company_id]) {
      lastCallByCompany[c.company_id] = c.call_date;
    }
  });

  // Open raw inputs (tickets/concerns) per company
  const openIssuesByCompany = {};
  rawInputsData.filter(r => !r.resolved_at && ['concern', 'bug'].includes(r.input_type)).forEach(r => {
    openIssuesByCompany[r.company_id] = (openIssuesByCompany[r.company_id] || 0) + 1;
  });

  // Renewals (subs expiring in next 90 days)
  const renewalCutoff = new Date(today);
  renewalCutoff.setDate(renewalCutoff.getDate() + 90);
  const upcomingRenewals = activeSubs.filter(s => {
    if (!s.ended_at) return false;
    const end = new Date(s.ended_at);
    return end > today && end <= renewalCutoff;
  });

  // Deduplicate: one entry per company (pick the highest-MRR active sub)
  const activeSubByCompany = {};
  activeSubs.forEach(s => {
    const mrr = parseInt(s.mrr_usd) || 0;
    if (!activeSubByCompany[s.company_id] || mrr > (parseInt(activeSubByCompany[s.company_id].mrr_usd) || 0)) {
      activeSubByCompany[s.company_id] = s;
    }
  });

  const accountHealth = [];
  Object.entries(activeSubByCompany).forEach(([companyId, s]) => {
    const comp = companyById[companyId];
    if (!comp) return;
    const lastCall = lastCallByCompany[companyId];
    const daysDark = lastCall ? daysBetween(todayStr, lastCall) : 999;
    const openIssues = openIssuesByCompany[companyId] || 0;
    const renewalDate = s.ended_at;
    const daysToRenewal = renewalDate ? daysBetween(renewalDate, todayStr) : null;

    let health = 'healthy';
    if (daysToRenewal !== null && daysToRenewal <= 30 && (daysDark > 60 || openIssues >= 3)) health = 'critical';
    else if (daysDark > 60 || (daysToRenewal !== null && daysToRenewal <= 60) || openIssues >= 1) health = 'watch';

    accountHealth.push({
      company: comp.name,
      country: comp.country,
      mrr: parseInt(s.mrr_usd) || 0,
      plan: s.plan_name,
      daysDark,
      daysToRenewal,
      openIssues,
      health,
      version: s.product_version
    });
  });

  accountHealth.sort((a, b) => {
    const order = { critical: 0, watch: 1, healthy: 2 };
    return order[a.health] - order[b.health] || b.mrr - a.mrr;
  });

  const criticalCount = accountHealth.filter(a => a.health === 'critical').length;
  const watchCount = accountHealth.filter(a => a.health === 'watch').length;
  const atRiskMrr = accountHealth.filter(a => ['critical', 'watch'].includes(a.health))
    .reduce((s, a) => s + a.mrr, 0);

  // === CALLS METRICS ===
  const sevenAgo = new Date(today);
  sevenAgo.setDate(sevenAgo.getDate() - 7);
  const recentCallsCount = callsData.filter(c => new Date(c.call_date) >= sevenAgo).length;

  // Upcoming calls (next 14 days from today)
  const fourteenAhead = new Date(today);
  fourteenAhead.setDate(fourteenAhead.getDate() + 14);
  const upcomingCalls = callsData
    .filter(c => c.scheduled_at && new Date(c.scheduled_at) >= today && new Date(c.scheduled_at) <= fourteenAhead)
    .slice(0, 5)
    .map(c => {
      const comp = companyById[c.company_id];
      return { company: comp?.name || 'Unknown', type: c.type, date: c.scheduled_at?.split('T')[0] || '' };
    });

  // === PIPELINE SAMPLE ===
  const pipelineSample = inProgress
    .map(d => {
      const comp = companyById[d.company_id];
      const owner = personById[d.owner_id];
      const lastCall = callsData.filter(c => c.deal_id === d.id).sort((a, b) => b.call_date.localeCompare(a.call_date))[0];
      const daysInStage = d.created_at ? daysBetween(todayStr, d.created_at) : 0;
      return {
        company: comp?.name || 'Unknown',
        country: comp?.country || '',
        stage: d.stage || '',
        subStatus: d.sub_status || 'promising',
        value: parseInt(d.deal_value_usd) || 0,
        daysOpen: daysInStage,
        lastActivity: lastCall?.call_date?.split('T')[0] || d.created_at?.split('T')[0] || '',
        owner: owner?.name || '',
        lostReason: d.lost_reason || ''
      };
    })
    .sort((a, b) => {
      const order = { focus: 0, at_risk: 1, highlight: 2, promising: 3 };
      return (order[a.subStatus] ?? 3) - (order[b.subStatus] ?? 3) || b.value - a.value;
    })
    .slice(0, 10);

  // === RECENT RESULTS (only past closes, not future renewal dates) ===
  const recentResults = [...wonDeals, ...lostDeals]
    .filter(d => d.closed_at && new Date(d.closed_at) <= today)
    .sort((a, b) => b.closed_at.localeCompare(a.closed_at))
    .slice(0, 8)
    .map(d => {
      const comp = companyById[d.company_id];
      const owner = personById[d.owner_id];
      return {
        company: comp?.name || 'Unknown',
        outcome: d.status,
        value: parseInt(d.deal_value_usd) || 0,
        owner: owner?.name || '',
        daysToClose: d.closed_at && d.created_at ? daysBetween(d.closed_at, d.created_at) : null,
        lostReason: d.lost_reason || '',
        winReason: d.win_reason || '',
        keyLearning: d.key_learning || '',
        closedAt: d.closed_at?.split('T')[0] || ''
      };
    });

  // === AVG SATISFACTION ===
  const recentSatScores = satisfactionData
    .filter(s => new Date(s.recorded_at) >= nrrStart)
    .map(s => parseFloat(s.score) || 0);
  const avgSatisfaction = recentSatScores.length > 0
    ? Math.round(recentSatScores.reduce((a, b) => a + b, 0) / recentSatScores.length * 10) / 10
    : null;

  // === GEOGRAPHY ===
  const customersByCountry = {};
  activeSubs.forEach(s => {
    const comp = companyById[s.company_id];
    if (!comp) return;
    if (!customersByCountry[comp.country]) customersByCountry[comp.country] = { count: 0, mrr: 0 };
    customersByCountry[comp.country].count++;
    customersByCountry[comp.country].mrr += parseInt(s.mrr_usd) || 0;
  });
  const topCountries = Object.entries(customersByCountry)
    .sort((a, b) => b[1].mrr - a[1].mrr)
    .slice(0, 8)
    .map(([country, stats]) => ({ country, ...stats }));

  // === SUMMARY ===
  const metrics = {
    generatedAt: todayStr,
    inferredToday: todayStr,
    overview: {
      pipelineValue,
      pipelineCount: inProgress.length,
      pipelineCoverage: Math.round(pipelineValue / 520000 * 100), // assume $520K quarterly quota
      winRateCount: Math.round(winRate * 100),
      winRateValue: Math.round(wonDeals.reduce((s,d)=>s+(parseInt(d.deal_value_usd)||0),0) / ((wonDeals.reduce((s,d)=>s+(parseInt(d.deal_value_usd)||0),0) + lostDeals.reduce((s,d)=>s+(parseInt(d.deal_value_usd)||0),0)) || 1) * 100),
      qWinRate: Math.round(qWinRate * 100),
      qWon: qWon.length,
      qLost: qLost.length,
      qClosedRevenue,
      quota: 520000,
      quotaAttainment: Math.round(qClosedRevenue / 520000 * 100),
      avgCycleWon: Math.round(avgCycleWon),
      avgCycleLost: Math.round(avgCycleLost),
      ghostRate: Math.round(ghostRate * 100),
      ghostCount: ghostDeals.length,
      nrr,
      activeMrr,
      activeCustomerCount
    },
    funnel: {
      stages: stageCount,
      funnelCounts: stageFunnel,
    },
    wonLostMonthly: monthlyArr,
    winRateByMonth,
    lostReasons: lostReasonArr,
    winReasons: Object.entries(winReasons).sort((a,b)=>b[1]-a[1]).map(([r,c])=>({reason:r,count:c,pct:Math.round(c/wonDeals.length*100)})),
    pipeline: {
      sample: pipelineSample,
      stageCount,
      subStatusCount: inProgress.reduce((acc, d) => { acc[d.sub_status||'promising']=(acc[d.sub_status||'promising']||0)+1; return acc; }, {})
    },
    recentResults,
    repStats: repArr,
    customers: {
      activeCount: activeCustomerCount,
      activeMrr,
      avgMrrPerCustomer,
      nrr,
      mrrChurnRate,
      atRiskMrr,
      criticalCount,
      watchCount,
      planDist,
      versionDist,
      mrrByMonth,
      topCountries,
      accountHealth: accountHealth.slice(0, 15),
      upcomingRenewals: upcomingRenewals.length,
      avgSatisfaction
    },
    market: {
      topCompetitors: compMentionArr,
      topImprovements,
      blockingImprovements
    },
    calls: {
      recentWeekCount: recentCallsCount,
      upcoming: upcomingCalls
    }
  };

  fs.writeFileSync(path.join(__dirname, 'metrics.json'), JSON.stringify(metrics, null, 2));
  console.log('\n✅ metrics.json written');
  console.log('\n=== KEY NUMBERS ===');
  console.log(`Pipeline: $${(pipelineValue/1000).toFixed(0)}K across ${inProgress.length} deals`);
  console.log(`Win rate: ${Math.round(winRate*100)}% (count) | Q current: ${Math.round(qWinRate*100)}%`);
  console.log(`Ghost rate: ${Math.round(ghostRate*100)}%`);
  console.log(`Avg cycle won: ${Math.round(avgCycleWon)}d | lost: ${Math.round(avgCycleLost)}d`);
  console.log(`Active MRR: $${(activeMrr/1000).toFixed(1)}K | NRR: ${nrr}%`);
  console.log(`Customers: ${activeCustomerCount} | Critical: ${criticalCount} | Watch: ${watchCount}`);
  console.log(`\nTop lost reasons:`, lostReasonArr.slice(0,3).map(r=>`${r.reason} ${r.pct}%`).join(', '));
  console.log(`Top competitors:`, compMentionArr.slice(0,3).map(c=>`${c.name} (${c.mentions} mentions)`).join(', '));
  console.log(`\nRep summary:`);
  repArr.forEach(r => console.log(`  ${r.name}: WR ${r.winRateCount}% | ${r.openDeals} open deals | ghost ${r.ghostRate}% | ${r.callsPerWeek} calls/wk`));
}

main().catch(console.error);
