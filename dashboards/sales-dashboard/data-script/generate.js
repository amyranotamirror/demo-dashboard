#!/usr/bin/env node
// Sales Dashboard — Seed Data Generator (v2 — scaled)
// Run: node generate.js
// Outputs: one CSV per table in ../data/, plus postgres.sql
//
// Story baked in:
//   - Enterprise SSO via SAML is the #1 deal blocker (shows in Market Signals)
//   - Excel export is the most-requested feature (18 raw inputs)
//   - Metabase is the most-mentioned competitor
//   - Column masking recently shipped → follow-up needed (Promise Tracker)
//   - Pipeline bottleneck at "validating" stage
//   - 4–5 at-risk customers with no contact in 90+ days
//   - Sarah Chen (AE) departed at ~month 60 (5 years in) → visible win rate dip
//   - Jordan Lee (AE) biased toward ghost/lost — 26% win rate, 21% ghost rate
//   - Deals in last 2 quarters: win rate declining from 38% to 34%
//   - 3 customer accounts going dark (no calls >60 days) with renewal ≤30 days
//   - Early version (v2.0) customers have 3x churn rate of v4.0 customers
//   - Satisfaction scores declining from 4.2 to 3.8 over last 6 months
//   - 100 themes, 500 use cases, 1000 features, 4000 improvements
//   - ~520 companies, ~1800 deals, ~10 calls per won customer

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────

const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const daysAgo = (n) => addDays(new Date(), -n);
const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);
const fmtTs = (d) => new Date(d).toISOString().replace('T', ' ').slice(0, 19);

// ─── RANDOM HELPERS ───────────────────────────────────────────────────────────

const uuid = () => crypto.randomUUID();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;
const wpick = (arr, weights) => {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) { r -= weights[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
};

const toCSV = (rows) => {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return (s.includes(',') || s.includes('"') || s.includes('\n'))
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map(r => headers.map(h => esc(r[h])).join(','))].join('\n');
};

// ─── PRODUCT TAXONOMY (MASSIVE — 100 themes, 500 use cases, 1000 features, 4000 improvements) ───

// 20 domain areas
const domainAreas = [
  'Data Modeling', 'Visualization', 'Charts', 'Security', 'Collaboration',
  'Performance', 'Integrations', 'Admin', 'AI/ML', 'Embedding',
  'Export/Delivery', 'Mobile', 'Alerting', 'Scheduling', 'Git/Version Control',
  'Developer Experience', 'Data Quality', 'Semantic Layer', 'Self-Service', 'Multi-tenancy',
];

// 5 sub-themes per domain
const subThemeTemplates = [
  'Core', 'Advanced', 'Enterprise', 'User Experience', 'Automation',
];

const themes = [];
domainAreas.forEach(domain => {
  subThemeTemplates.forEach(sub => {
    themes.push({
      id: uuid(),
      name: `${domain} — ${sub}`,
      description: `${sub} capabilities for ${domain.toLowerCase()}`,
    });
  });
});

// Key theme lookups for named items
const findTheme = (partial) => themes.find(t => t.name.includes(partial));

// Generate 500 use cases (~5 per theme)
const useCaseNameParts = [
  'manage', 'configure', 'automate', 'monitor', 'analyze',
  'optimize', 'customize', 'share', 'export', 'schedule',
  'validate', 'transform', 'filter', 'aggregate', 'secure',
];
const useCaseObjectParts = [
  'dashboards', 'reports', 'data sources', 'queries', 'metrics',
  'permissions', 'workflows', 'alerts', 'pipelines', 'schemas',
  'users', 'teams', 'roles', 'connections', 'templates',
];

const useCases = [];
themes.forEach((theme, ti) => {
  const ucCount = 5;
  for (let i = 0; i < ucCount; i++) {
    const verb = useCaseNameParts[(ti * 5 + i) % useCaseNameParts.length];
    const obj = useCaseObjectParts[(ti * 5 + i + 3) % useCaseObjectParts.length];
    useCases.push({
      id: uuid(),
      theme_id: theme.id,
      name: `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${obj} (${theme.name.split(' — ')[0]})`,
      description: `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${obj} in the context of ${theme.name.toLowerCase()}`,
    });
  }
});

// Key use case lookups
const ucByName = (partial) => useCases.find(u => u.name.toLowerCase().includes(partial.toLowerCase()));
// Ensure we have named use cases for the key story items — find or assign them
const ucSSO = useCases.find(u => u.name.includes('Security')) || useCases[0];
const ucColAccess = useCases.find(u => u.name.includes('Security') && u !== ucSSO) || useCases[1];
const ucRLS = useCases.find(u => u.name.includes('secure') || u.name.includes('Secure')) || useCases[2];
const ucEmbed = useCases.find(u => u.name.includes('Embedding')) || useCases[3];
const ucExport = useCases.find(u => u.name.includes('Export')) || useCases[4];
const ucCollab = useCases.find(u => u.name.includes('Collaboration')) || useCases[5];
const ucPerf = useCases.find(u => u.name.includes('Performance')) || useCases[6];
const ucInteg = useCases.find(u => u.name.includes('Integrations')) || useCases[7];
const ucAdmin = useCases.find(u => u.name.includes('Admin')) || useCases[8];
const ucGit = useCases.find(u => u.name.includes('Git')) || useCases[9];

// Generate 1000 features (~2 per use case)
const featureStatuses = ['shipped', 'in_development', 'planned', 'deprecated'];
const featureStatusWeights = [50, 20, 25, 5];

const features = [];

// Named key features first (preserved from original)
const keyFeatures = [
  { use_case_id: ucCollab.id,    name: 'Public dashboard links',     description: 'Share a read-only dashboard with anyone via a link',              status: 'shipped',        shipped_at: fmtDate(daysAgo(210)) },
  { use_case_id: ucCollab.id,    name: 'Password-protected embeds',  description: 'Require a password to view an embedded dashboard',                status: 'shipped',        shipped_at: fmtDate(daysAgo(107)) },
  { use_case_id: ucCollab.id,    name: 'White-label embedding',      description: 'Remove Holistics branding from embedded dashboards',              status: 'planned',        shipped_at: null },
  { use_case_id: ucCollab.id,    name: 'Shared folders',             description: 'Organize dashboards into team-accessible folders',                status: 'shipped',        shipped_at: fmtDate(daysAgo(330)) },
  { use_case_id: ucCollab.id,    name: 'Dashboard templates',        description: 'Pre-built starter templates for common analytics',                status: 'in_development', shipped_at: null },
  { use_case_id: ucColAccess.id, name: 'Column masking',             description: 'Hide raw PII columns from analyst-level users',                   status: 'shipped',        shipped_at: fmtDate(daysAgo(36)) },
  { use_case_id: ucColAccess.id, name: 'Column-level permissions',   description: 'Grant individual-level access to specific columns',               status: 'planned',        shipped_at: null },
  { use_case_id: ucRLS.id,       name: 'Dynamic row-level security', description: 'Filter rows based on user identity at query time',                status: 'shipped',        shipped_at: fmtDate(daysAgo(213)) },
  { use_case_id: ucRLS.id,       name: 'User attribute filters',     description: 'Parameterize RLS rules using user profile attributes',            status: 'shipped',        shipped_at: fmtDate(daysAgo(156)) },
  { use_case_id: ucPerf.id,      name: 'Smart query caching',        description: 'Cache query results and invalidate on data refresh',              status: 'shipped',        shipped_at: fmtDate(daysAgo(295)) },
  { use_case_id: ucPerf.id,      name: 'Pre-built aggregates',       description: 'Pre-compute complex aggregates at pipeline run time',             status: 'in_development', shipped_at: null },
  { use_case_id: ucInteg.id,     name: 'BigQuery connector',         description: 'Native connection to Google BigQuery',                            status: 'shipped',        shipped_at: fmtDate(daysAgo(430)) },
  { use_case_id: ucInteg.id,     name: 'Snowflake connector',        description: 'Native connection to Snowflake',                                  status: 'shipped',        shipped_at: fmtDate(daysAgo(430)) },
  { use_case_id: ucInteg.id,     name: 'Redshift connector',         description: 'Native connection to Amazon Redshift',                            status: 'shipped',        shipped_at: fmtDate(daysAgo(370)) },
  { use_case_id: ucEmbed.id,     name: 'Embedding SDK',              description: 'Embed Holistics dashboards in external products',                 status: 'shipped',        shipped_at: fmtDate(daysAgo(248)) },
  { use_case_id: ucEmbed.id,     name: 'REST API',                   description: 'Programmatic access to reports and data',                         status: 'planned',        shipped_at: null },
  { use_case_id: ucAdmin.id,     name: 'SAML 2.0 integration',       description: 'Enterprise SSO via SAML for IT-gated accounts',                   status: 'in_development', shipped_at: null },
  { use_case_id: ucAdmin.id,     name: 'User activity log',          description: 'Audit trail of user actions for compliance',                      status: 'shipped',        shipped_at: fmtDate(daysAgo(186)) },
];

keyFeatures.forEach(f => {
  features.push({ id: uuid(), ...f });
});

// Generate remaining features to reach 1000
const featureVerbParts = ['Advanced', 'Smart', 'Bulk', 'Custom', 'Auto', 'Enhanced', 'Inline', 'Live', 'Cached', 'Async'];
const featureNounParts = ['editor', 'viewer', 'builder', 'picker', 'navigator', 'wizard', 'renderer', 'connector', 'validator', 'parser'];

let featureIdx = 0;
while (features.length < 1000) {
  const uc = useCases[featureIdx % useCases.length];
  const status = wpick(featureStatuses, featureStatusWeights);
  const shippedAt = status === 'shipped' ? fmtDate(daysAgo(randInt(30, 2000))) : (status === 'deprecated' ? fmtDate(daysAgo(randInt(100, 1500))) : null);
  const verb = featureVerbParts[featureIdx % featureVerbParts.length];
  const noun = featureNounParts[Math.floor(featureIdx / featureVerbParts.length) % featureNounParts.length];
  const domain = uc.name.split('(')[1]?.replace(')', '') || 'general';
  features.push({
    id: uuid(),
    use_case_id: uc.id,
    name: `${verb} ${noun} for ${domain} #${featureIdx}`,
    description: `${verb} ${noun} capability in ${domain}`,
    status,
    shipped_at: shippedAt,
  });
  featureIdx++;
}

// Feature ID lookup
const fid = (name) => features.find(f => f.name === name)?.id || features[0].id;

// Generate 4000 improvements
const improvements = [];

// Key story improvements first (preserved from original)
const keyImprovements = [
  { feature_id: fid('SAML 2.0 integration'),      title: 'Enterprise SSO via SAML for IT-gated accounts',              description: 'Enterprise customers require SAML SSO as a hard IT requirement before they can approve Holistics. Blocking 4 active deals.',    status: 'planned',   is_blocking: true,  priority: 'critical', raw_input_count: 14, created_at: fmtTs(daysAgo(217)), updated_at: fmtTs(daysAgo(66))  },
  { feature_id: fid('Column masking'),             title: 'Mask PII columns by role (email, phone, national ID)',       description: 'Customers handling regulated data need to hide raw PII from analysts. Column masking shipped — follow up with accounts.',          status: 'shipped',   is_blocking: false, priority: 'high',     raw_input_count: 9,  created_at: fmtTs(daysAgo(173)), updated_at: fmtTs(daysAgo(36))  },
  { feature_id: fid('Embedding SDK'),              title: 'Embed dashboards without requiring a Holistics login',       description: 'SaaS customers want to embed dashboards in their own products without end-users needing a Holistics account.',                     status: 'planned',   is_blocking: true,  priority: 'high',     raw_input_count: 8,  created_at: fmtTs(daysAgo(187)), updated_at: fmtTs(daysAgo(53))  },
  { feature_id: fid('Dynamic row-level security'), title: 'Multi-tenant RLS — each client sees only their own data',    description: 'SaaS companies need per-tenant row filtering in embedded analytics. Shipped — follow up with pre-sale contacts.',                  status: 'shipped',   is_blocking: false, priority: 'high',     raw_input_count: 11, created_at: fmtTs(daysAgo(309)), updated_at: fmtTs(daysAgo(156)) },
  { feature_id: fid('Column-level permissions'),   title: 'User-level column grants, independent of role',             description: 'Grant a specific individual access to a sensitive column without promoting their entire role.',                                   status: 'planned',   is_blocking: false, priority: 'medium',   raw_input_count: 5,  created_at: fmtTs(daysAgo(157)), updated_at: fmtTs(daysAgo(66))  },
  { feature_id: fid('REST API'),                   title: 'Trigger cache refresh via API after pipeline runs',         description: 'Data teams want to invalidate the cache via API after dbt or Airflow pipelines complete.',                                       status: 'open',      is_blocking: false, priority: 'medium',   raw_input_count: 7,  created_at: fmtTs(daysAgo(97)),  updated_at: fmtTs(daysAgo(97))  },
  { feature_id: fid('White-label embedding'),      title: 'Remove Holistics branding from embedded dashboards',        description: 'Customers embedding dashboards in their own products need logos and domain hidden for brand consistency.',                          status: 'open',      is_blocking: true,  priority: 'high',     raw_input_count: 6,  created_at: fmtTs(daysAgo(143)), updated_at: fmtTs(daysAgo(143)) },
  { feature_id: fid('Dashboard templates'),        title: 'Pre-built starter templates for SaaS and fintech',          description: 'New customers struggle to build their first dashboard from scratch. Curated templates shorten time-to-value.',                   status: 'planned',   is_blocking: false, priority: 'medium',   raw_input_count: 8,  created_at: fmtTs(daysAgo(173)), updated_at: fmtTs(daysAgo(66))  },
  { feature_id: null,                              title: 'Excel / CSV export from any report or table',               description: 'The single most common ask from finance and ops teams. One-click export to Excel or CSV. Currently requires an API workaround.', status: 'open',      is_blocking: true,  priority: 'critical', raw_input_count: 18, created_at: fmtTs(daysAgo(247)), updated_at: fmtTs(daysAgo(53))  },
  { feature_id: null,                              title: 'Scheduled email delivery for individual reports',           description: 'Schedule a single report as a PDF or CSV on a daily/weekly cadence — not just full dashboard snapshots.',                        status: 'open',      is_blocking: false, priority: 'medium',   raw_input_count: 9,  created_at: fmtTs(daysAgo(203)), updated_at: fmtTs(daysAgo(66))  },
  { feature_id: fid('Pre-built aggregates'),       title: 'Pre-aggregate multi-join P&L reports for finance teams',    description: 'Finance P&L dashboards with 5+ joined tables time out at scale. Pre-aggregation makes them usable for month-end reporting.',        status: 'planned',   is_blocking: true,  priority: 'high',     raw_input_count: 6,  created_at: fmtTs(daysAgo(157)), updated_at: fmtTs(daysAgo(83))  },
  { feature_id: null,                              title: 'Git sync support for GitLab repositories',                  description: 'Several customers use GitLab, not GitHub. Current git sync only works with GitHub.',                                              status: 'deferred',  is_blocking: false, priority: 'low',      raw_input_count: 4,  created_at: fmtTs(daysAgo(277)), updated_at: fmtTs(daysAgo(187)) },
];

keyImprovements.forEach(imp => {
  improvements.push({ id: uuid(), ...imp });
});

// Generate remaining improvements to reach 4000 (~4 per feature)
const impStatuses = ['open', 'planned', 'shipped', 'workaround', 'deferred', 'wont_do'];
const impStatusWeights = [30, 25, 20, 10, 10, 5];
const impPriorities = ['critical', 'high', 'medium', 'low'];
const impPriorityWeights = [10, 25, 40, 25];
const impTitleVerbs = ['Support', 'Add', 'Improve', 'Fix', 'Enable', 'Enhance', 'Optimize', 'Rework', 'Migrate', 'Extend'];
const impTitleObjects = ['workflow', 'configuration', 'rendering', 'validation', 'caching', 'permissions', 'export', 'filtering', 'scheduling', 'notifications'];

let impIdx = 0;
while (improvements.length < 4000) {
  const feat = features[impIdx % features.length];
  const status = wpick(impStatuses, impStatusWeights);
  const priority = wpick(impPriorities, impPriorityWeights);
  const isBlocking = Math.random() < 0.15;
  const verb = impTitleVerbs[impIdx % impTitleVerbs.length];
  const obj = impTitleObjects[Math.floor(impIdx / impTitleVerbs.length) % impTitleObjects.length];
  improvements.push({
    id: uuid(),
    feature_id: feat.id,
    title: `${verb} ${obj} for ${feat.name.substring(0, 40)} #${impIdx}`,
    description: `${verb} ${obj} in the context of ${feat.name}`,
    status,
    is_blocking: isBlocking,
    priority,
    raw_input_count: randInt(0, 12),
    created_at: fmtTs(daysAgo(randInt(30, 2500))),
    updated_at: fmtTs(daysAgo(randInt(1, 200))),
  });
  impIdx++;
}

// ─── COMPANIES ────────────────────────────────────────────────────────────────

const HOLISTICS_ID = uuid();

const competitorDefs = [
  { name: 'Metabase',         website: 'metabase.com' },
  { name: 'Looker',           website: 'looker.com' },
  { name: 'Tableau',          website: 'tableau.com' },
  { name: 'Power BI',         website: 'powerbi.microsoft.com' },
  { name: 'Sigma',            website: 'sigmacomputing.com' },
  { name: 'Redash',           website: 'redash.io' },
  { name: 'Apache Superset',  website: 'superset.apache.org' },
  { name: 'Mode',             website: 'mode.com' },
  { name: 'Domo',             website: 'domo.com' },
  { name: 'ThoughtSpot',      website: 'thoughtspot.com' },
  { name: 'Qlik',             website: 'qlik.com' },
  { name: 'MicroStrategy',    website: 'microstrategy.com' },
  { name: 'Sisense',          website: 'sisense.com' },
  { name: 'Grafana',          website: 'grafana.com' },
  { name: 'Retool',           website: 'retool.com' },
  { name: 'Observable',       website: 'observablehq.com' },
  { name: 'Hex',              website: 'hex.tech' },
  { name: 'Lightdash',        website: 'lightdash.com' },
  { name: 'GoodData',         website: 'gooddata.com' },
  { name: 'Omni',             website: 'omni.co' },
].map(c => ({ id: uuid(), ...c }));

const compById = {};
competitorDefs.forEach(c => { compById[c.name] = c.id; });
const COMPETITOR_PICK_LIST = [
  'Metabase','Tableau','Power BI','Looker','Sigma','Redash','Apache Superset','Qlik','Sisense',
  'Mode','Domo','ThoughtSpot','MicroStrategy','Grafana','Retool','Observable','Hex','Lightdash','GoodData','Omni',
];
const COMPETITOR_WEIGHTS = [25, 18, 15, 12, 8, 5, 5, 4, 3, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
const pickCompetitor = () => compById[wpick(COMPETITOR_PICK_LIST, COMPETITOR_WEIGHTS)];

// Real named companies from spec
const realNamedDefs = [
  { name: 'Grab',                  website: 'grab.com',               industry: 'Super App',      country: 'Singapore',    type: 'customer',  employee_count: 8000  },
  { name: 'Gojek',                 website: 'gojek.com',              industry: 'Super App',      country: 'Indonesia',    type: 'customer',  employee_count: 6000  },
  { name: 'Shopee',                website: 'shopee.com',             industry: 'E-commerce',     country: 'Singapore',    type: 'customer',  employee_count: 15000 },
  { name: 'Tokopedia',             website: 'tokopedia.com',          industry: 'E-commerce',     country: 'Indonesia',    type: 'customer',  employee_count: 5000  },
  { name: 'Traveloka',             website: 'traveloka.com',          industry: 'Travel',         country: 'Indonesia',    type: 'customer',  employee_count: 3000  },
  { name: 'Carousell',             website: 'carousell.com',          industry: 'Marketplace',    country: 'Singapore',    type: 'customer',  employee_count: 700   },
  { name: 'Ninja Van',             website: 'ninjavan.com',           industry: 'Logistics',      country: 'Singapore',    type: 'customer',  employee_count: 4000  },
  { name: 'Xendit',                website: 'xendit.co',              industry: 'Fintech',        country: 'Indonesia',    type: 'customer',  employee_count: 900   },
  { name: 'StashAway',             website: 'stashaway.com',          industry: 'Fintech',        country: 'Singapore',    type: 'customer',  employee_count: 200   },
  { name: 'PropertyGuru',          website: 'propertyguru.com.sg',    industry: 'Real Estate',    country: 'Singapore',    type: 'customer',  employee_count: 1200  },
  { name: 'Mekari',                website: 'mekari.com',             industry: 'SaaS',           country: 'Indonesia',    type: 'customer',  employee_count: 1500  },
  { name: 'ShopBack',              website: 'shopback.com',           industry: 'E-commerce',     country: 'Singapore',    type: 'customer',  employee_count: 600   },
  { name: 'Kredivo',               website: 'kredivo.com',            industry: 'Fintech',        country: 'Indonesia',    type: 'customer',  employee_count: 400   },
  { name: 'VNG Corporation',       website: 'vng.com.vn',             industry: 'Technology',     country: 'Vietnam',      type: 'customer',  employee_count: 4500  },
  { name: 'Bukalapak',             website: 'bukalapak.com',          industry: 'E-commerce',     country: 'Indonesia',    type: 'customer',  employee_count: 3000  },
  { name: 'Pomelo Fashion',        website: 'pomelofashion.com',      industry: 'Retail',         country: 'Thailand',     type: 'customer',  employee_count: 300   },
  { name: '2C2P',                  website: '2c2p.com',               industry: 'Fintech',        country: 'Singapore',    type: 'customer',  employee_count: 250   },
  { name: 'Carsome',               website: 'carsome.com',            industry: 'Automotive',     country: 'Malaysia',     type: 'customer',  employee_count: 1000  },
  { name: 'Funding Societies',     website: 'fundingsocieties.com',   industry: 'Fintech',        country: 'Singapore',    type: 'customer',  employee_count: 350   },
  { name: 'Anchanto',              website: 'anchanto.com',           industry: 'SaaS',           country: 'Singapore',    type: 'customer',  employee_count: 150   },
  { name: 'SIRCLO',                website: 'sirclo.com',             industry: 'E-commerce SaaS',country: 'Indonesia',    type: 'customer',  employee_count: 400   },
  { name: 'Coda Payments',         website: 'codapayments.com',       industry: 'Fintech',        country: 'Singapore',    type: 'customer',  employee_count: 300   },
  { name: 'iPrice Group',          website: 'iprice.asia',            industry: 'E-commerce',     country: 'Malaysia',     type: 'customer',  employee_count: 200   },
  { name: 'Akulaku',               website: 'akulaku.com',            industry: 'Fintech',        country: 'Indonesia',    type: 'customer',  employee_count: 2000  },
  { name: 'Omise',                 website: 'omise.co',               industry: 'Fintech',        country: 'Thailand',     type: 'customer',  employee_count: 250   },
  { name: 'Doctor Anywhere',       website: 'doctoranywhere.com',     industry: 'Healthcare',     country: 'Singapore',    type: 'prospect',  employee_count: 400   },
  { name: 'Advance Intelligence',  website: 'advance.ai',             industry: 'AI / Fintech',   country: 'Singapore',    type: 'prospect',  employee_count: 600   },
  { name: 'Kumu',                  website: 'kumu.ph',                industry: 'Media',          country: 'Philippines',  type: 'prospect',  employee_count: 100   },
  { name: 'GoTo Financial',        website: 'gotofinancial.com',      industry: 'Fintech',        country: 'Indonesia',    type: 'prospect',  employee_count: 1200  },
  { name: 'Lazada',                website: 'lazada.com',             industry: 'E-commerce',     country: 'Singapore',    type: 'prospect',  employee_count: 8000  },
];

// Existing generated companies (kept from v1)
const existingGeneratedDefs = [
  { name: 'TechFlow Singapore',      website: 'techflowsg.com',       industry: 'SaaS',          country: 'Singapore',    employee_count: 150  },
  { name: 'DataMint Vietnam',        website: 'datamintvn.com',       industry: 'Fintech',       country: 'Vietnam',      employee_count: 80   },
  { name: 'CartMax Indonesia',       website: 'cartmaxid.com',        industry: 'E-commerce',    country: 'Indonesia',    employee_count: 500  },
  { name: 'FinEdge Malaysia',        website: 'finedgemy.com',        industry: 'Fintech',       country: 'Malaysia',     employee_count: 200  },
  { name: 'LogiTrack Thailand',      website: 'logitrackth.com',      industry: 'Logistics',     country: 'Thailand',     employee_count: 350  },
  { name: 'MediCore Philippines',    website: 'medicorekph.com',      industry: 'Healthcare',    country: 'Philippines',  employee_count: 600  },
  { name: 'EduSpark Australia',      website: 'edusparkau.com',       industry: 'Education',     country: 'Australia',    employee_count: 120  },
  { name: 'RetailOne Japan',         website: 'retailonejp.com',      industry: 'Retail',        country: 'Japan',        employee_count: 800  },
  { name: 'CloudByte India',         website: 'cloudbytein.com',      industry: 'SaaS',          country: 'India',        employee_count: 250  },
  { name: 'SupplyLink Germany',      website: 'supplylinkde.com',     industry: 'Manufacturing', country: 'Germany',      employee_count: 450  },
  { name: 'PulseMedia UK',           website: 'pulsemediauk.com',     industry: 'Media',         country: 'UK',           employee_count: 180  },
  { name: 'StackHive USA',           website: 'stackhiveus.com',      industry: 'SaaS',          country: 'USA',          employee_count: 90   },
  { name: 'NovaCare Canada',         website: 'novacareca.com',       industry: 'Healthcare',    country: 'Canada',       employee_count: 300  },
  { name: 'UrbanProp Singapore',     website: 'urbanpropsg.com',      industry: 'Real Estate',   country: 'Singapore',    employee_count: 100  },
  { name: 'ShipFast Vietnam',        website: 'shipfastvn.com',       industry: 'Logistics',     country: 'Vietnam',      employee_count: 220  },
  { name: 'Paydeck Indonesia',       website: 'paydeckid.com',        industry: 'Fintech',       country: 'Indonesia',    employee_count: 130  },
  { name: 'GreenBuild Australia',    website: 'greenbuildau.com',     industry: 'Manufacturing', country: 'Australia',    employee_count: 280  },
  { name: 'TalentOS Malaysia',       website: 'talentosmy.com',       industry: 'SaaS',          country: 'Malaysia',     employee_count: 70   },
  { name: 'QuickCart Thailand',      website: 'quickcartth.com',      industry: 'E-commerce',    country: 'Thailand',     employee_count: 400  },
  { name: 'BrightLearn Philippines', website: 'brightlearnph.com',    industry: 'Education',     country: 'Philippines',  employee_count: 90   },
  { name: 'AutoFlow Germany',        website: 'autoflowde.com',       industry: 'Manufacturing', country: 'Germany',      employee_count: 700  },
  { name: 'Nexara India',            website: 'nexaraindia.com',      industry: 'SaaS',          country: 'India',        employee_count: 160  },
  { name: 'HealthBridge USA',        website: 'healthbridgeus.com',   industry: 'Healthcare',    country: 'USA',          employee_count: 500  },
  { name: 'MerchHub UK',             website: 'merchhubuk.com',       industry: 'Retail',        country: 'UK',           employee_count: 350  },
  { name: 'CoreBank Canada',         website: 'corebankca.com',       industry: 'Fintech',       country: 'Canada',       employee_count: 1200 },
  { name: 'PropTree Japan',          website: 'proptreejp.com',       industry: 'Real Estate',   country: 'Japan',        employee_count: 140  },
  { name: 'SkyFreight Singapore',    website: 'skyfreightsg.com',     industry: 'Logistics',     country: 'Singapore',    employee_count: 200  },
  { name: 'DataRoot Vietnam',        website: 'dataroovn.com',        industry: 'SaaS',          country: 'Vietnam',      employee_count: 50   },
  { name: 'FlowRetail Indonesia',    website: 'flowretailid.com',     industry: 'Retail',        country: 'Indonesia',    employee_count: 600  },
  { name: 'BankCraft Germany',       website: 'bankcraft.de',         industry: 'Fintech',       country: 'Germany',      employee_count: 900  },
  { name: 'ClimaTech Australia',     website: 'climatechau.com',      industry: 'SaaS',          country: 'Australia',    employee_count: 85   },
  { name: 'MediaVault France',       website: 'mediavaultfr.com',     industry: 'Media',         country: 'France',       employee_count: 230  },
  { name: 'InfraBuild India',        website: 'infrabuildindia.com',  industry: 'Manufacturing', country: 'India',        employee_count: 1500 },
  { name: 'ShopWave Thailand',       website: 'shopwaveth.com',       industry: 'E-commerce',    country: 'Thailand',     employee_count: 280  },
  { name: 'PharmaLab Switzerland',   website: 'pharmalabch.com',      industry: 'Healthcare',    country: 'Switzerland',  employee_count: 400  },
  { name: 'CodeCraft USA',           website: 'codecraftus.com',      industry: 'SaaS',          country: 'USA',          employee_count: 45   },
  { name: 'PayRoute Singapore',      website: 'payroutesg.com',       industry: 'Fintech',       country: 'Singapore',    employee_count: 190  },
  { name: 'FreshGrocer Malaysia',    website: 'freshgrocermy.com',    industry: 'Retail',        country: 'Malaysia',     employee_count: 750  },
  { name: 'EnergyLink Philippines',  website: 'energylinkph.com',     industry: 'Manufacturing', country: 'Philippines',  employee_count: 550  },
  { name: 'Branchify Vietnam',       website: 'branchifyvn.com',      industry: 'SaaS',          country: 'Vietnam',      employee_count: 35   },
  { name: 'TruckPath Indonesia',     website: 'truckpathid.com',      industry: 'Logistics',     country: 'Indonesia',    employee_count: 320  },
  { name: 'DentaCare India',         website: 'dentacareindia.com',   industry: 'Healthcare',    country: 'India',        employee_count: 180  },
  { name: 'TalentBridge Canada',     website: 'talentbridgeca.com',   industry: 'SaaS',          country: 'Canada',       employee_count: 110  },
  { name: 'SparkAnalytics Singapore',website: 'sparkanalyticssg.com', industry: 'SaaS',          country: 'Singapore',    employee_count: 65   },
  { name: 'NexLogic Thailand',       website: 'nexlogicth.com',       industry: 'Logistics',     country: 'Thailand',     employee_count: 270  },
  { name: 'FinPulse Korea',          website: 'finpulsekr.com',       industry: 'Fintech',       country: 'South Korea',  employee_count: 320  },
  { name: 'CloudMesh Singapore',     website: 'cloudmeshsg.com',      industry: 'SaaS',          country: 'Singapore',    employee_count: 120  },
  { name: 'RetailSense Indonesia',   website: 'retailsenseid.com',    industry: 'Retail',        country: 'Indonesia',    employee_count: 450  },
  { name: 'ByteForce India',         website: 'byteforceindia.com',   industry: 'SaaS',          country: 'India',        employee_count: 200  },
  { name: 'MedTech Vietnam',         website: 'medtechvn.com',        industry: 'Healthcare',    country: 'Vietnam',      employee_count: 150  },
  { name: 'AgriData Australia',      website: 'agridataau.com',       industry: 'Agriculture',   country: 'Australia',    employee_count: 80   },
  { name: 'ClearPay Philippines',    website: 'clearpayphi.com',      industry: 'Fintech',       country: 'Philippines',  employee_count: 300  },
  { name: 'WareLink Malaysia',       website: 'warelinkmy.com',       industry: 'Logistics',     country: 'Malaysia',     employee_count: 500  },
  { name: 'TaskFlow Singapore',      website: 'taskflowsg.com',       industry: 'SaaS',          country: 'Singapore',    employee_count: 90   },
  { name: 'Buildify Japan',          website: 'buildifyjp.com',       industry: 'Manufacturing', country: 'Japan',        employee_count: 600  },
  { name: 'HealthNode Thailand',     website: 'healthnodeth.com',     industry: 'Healthcare',    country: 'Thailand',     employee_count: 220  },
  { name: 'DataHarbor UK',           website: 'dataharboruk.com',     industry: 'SaaS',          country: 'UK',           employee_count: 130  },
  { name: 'PriceEngine Vietnam',     website: 'priceenginevn.com',    industry: 'E-commerce',    country: 'Vietnam',      employee_count: 180  },
  { name: 'TechGrove Indonesia',     website: 'techgroveid.com',      industry: 'SaaS',          country: 'Indonesia',    employee_count: 75   },
  { name: 'MicroSend Germany',       website: 'microsendde.com',      industry: 'Fintech',       country: 'Germany',      employee_count: 400  },
  { name: 'OmniCare Singapore',      website: 'omnicaresg.com',       industry: 'Healthcare',    country: 'Singapore',    employee_count: 350  },
  { name: 'LogiSense Philippines',   website: 'logisenseph.com',      industry: 'Logistics',     country: 'Philippines',  employee_count: 280  },
  { name: 'SwiftStack India',        website: 'swiftstackindia.com',  industry: 'SaaS',          country: 'India',        employee_count: 170  },
  { name: 'FundLink Malaysia',       website: 'fundlinkmy.com',       industry: 'Fintech',       country: 'Malaysia',     employee_count: 90   },
  { name: 'CityRetail Thailand',     website: 'cityretailth.com',     industry: 'Retail',        country: 'Thailand',     employee_count: 420  },
  { name: 'QuotaSync USA',           website: 'quotasyncus.com',      industry: 'SaaS',          country: 'USA',          employee_count: 55   },
  { name: 'FieldOps Australia',      website: 'fieldopsau.com',       industry: 'SaaS',          country: 'Australia',    employee_count: 95   },
  { name: 'DataLayer Japan',         website: 'datalayerjp.com',      industry: 'SaaS',          country: 'Japan',        employee_count: 110  },
  { name: 'GreenRoute Vietnam',      website: 'greenroutevn.com',     industry: 'Logistics',     country: 'Vietnam',      employee_count: 260  },
  { name: 'PayNow Indonesia',        website: 'paynowid.com',         industry: 'Fintech',       country: 'Indonesia',    employee_count: 150  },
  { name: 'BiometrX Singapore',      website: 'biometrxsg.com',       industry: 'Healthcare',    country: 'Singapore',    employee_count: 480  },
  { name: 'MerchTrack UK',           website: 'merchtrakuk.com',      industry: 'Retail',        country: 'UK',           employee_count: 310  },
  { name: 'HorizonAI Canada',        website: 'horizonaica.com',      industry: 'SaaS',          country: 'Canada',       employee_count: 200  },
  { name: 'InsightHub Germany',      website: 'insighthubde.com',     industry: 'SaaS',          country: 'Germany',      employee_count: 140  },
  { name: 'CloudRoute India',        website: 'cloudrouteindia.com',  industry: 'Logistics',     country: 'India',        employee_count: 700  },
  { name: 'Paylater Thailand',       website: 'paylaterth.com',       industry: 'Fintech',       country: 'Thailand',     employee_count: 195  },
  { name: 'BrandCore Philippines',   website: 'brandcoreph.com',      industry: 'Retail',        country: 'Philippines',  employee_count: 380  },
  { name: 'AnalyticLeaf Singapore',  website: 'analyticleafsg.com',   industry: 'SaaS',          country: 'Singapore',    employee_count: 45   },
  { name: 'AutoMile Malaysia',       website: 'automilemy.com',       industry: 'Automotive',    country: 'Malaysia',     employee_count: 520  },
  { name: 'FastPharma Switzerland',  website: 'fastpharmach.com',     industry: 'Healthcare',    country: 'Switzerland',  employee_count: 340  },
  { name: 'NowShip Singapore',       website: 'nowshipsg.com',        industry: 'Logistics',     country: 'Singapore',    employee_count: 260  },
  { name: 'DataGems Indonesia',      website: 'datagemsid.com',       industry: 'SaaS',          country: 'Indonesia',    employee_count: 60   },
  { name: 'WealthTrack Vietnam',     website: 'wealthtrackvn.com',    industry: 'Fintech',       country: 'Vietnam',      employee_count: 130  },
  { name: 'TechSeed Japan',          website: 'techseedjp.com',       industry: 'SaaS',          country: 'Japan',        employee_count: 80   },
  { name: 'FleetPro Australia',      website: 'fleetproau.com',       industry: 'Logistics',     country: 'Australia',    employee_count: 410  },
  { name: 'MediSafe Malaysia',       website: 'medisafemy.com',       industry: 'Healthcare',    country: 'Malaysia',     employee_count: 290  },
  { name: 'ShopSense Korea',         website: 'shopensekr.com',       industry: 'E-commerce',    country: 'South Korea',  employee_count: 550  },
  { name: 'PlanBase India',          website: 'planbaseindia.com',    industry: 'SaaS',          country: 'India',        employee_count: 100  },
  { name: 'EcoManufact Germany',     website: 'ecomanufactde.com',    industry: 'Manufacturing', country: 'Germany',      employee_count: 800  },
  { name: 'FastFunnel USA',          website: 'fastfunnelus.com',     industry: 'SaaS',          country: 'USA',          employee_count: 35   },
  { name: 'MigraLogic Philippines',  website: 'migralogicph.com',     industry: 'Logistics',     country: 'Philippines',  employee_count: 320  },
  { name: 'UrbanPay Indonesia',      website: 'urbanpayid.com',       industry: 'Fintech',       country: 'Indonesia',    employee_count: 220  },
  { name: 'ViewPoint Singapore',     website: 'viewpointsg.com',      industry: 'SaaS',          country: 'Singapore',    employee_count: 70   },
  { name: 'MapPath Vietnam',         website: 'mappathvn.com',        industry: 'Logistics',     country: 'Vietnam',      employee_count: 180  },
  { name: 'FormLab Australia',       website: 'formlabau.com',        industry: 'SaaS',          country: 'Australia',    employee_count: 55   },
  { name: 'FreightLine Thailand',    website: 'freightlineth.com',    industry: 'Logistics',     country: 'Thailand',     employee_count: 470  },
  { name: 'PivotStack UK',           website: 'pivotstackuk.com',     industry: 'SaaS',          country: 'UK',           employee_count: 88   },
  { name: 'MegaMart India',          website: 'megamartindia.com',    industry: 'Retail',        country: 'India',        employee_count: 1800 },
  { name: 'BioCore Canada',          website: 'biocoreca.com',        industry: 'Healthcare',    country: 'Canada',       employee_count: 430  },
  { name: 'SnapLoan Malaysia',       website: 'snaploanmy.com',       industry: 'Fintech',       country: 'Malaysia',     employee_count: 160  },
  { name: 'ClearPath Japan',         website: 'clearpathpj.com',      industry: 'Logistics',     country: 'Japan',        employee_count: 380  },
  { name: 'SalesMesh Singapore',     website: 'salesmeshsg.com',      industry: 'SaaS',          country: 'Singapore',    employee_count: 48   },
  { name: 'TradeNest Indonesia',     website: 'tradanestid.com',      industry: 'E-commerce',    country: 'Indonesia',    employee_count: 650  },
  { name: 'HiveData Vietnam',        website: 'hivedatavn.com',       industry: 'SaaS',          country: 'Vietnam',      employee_count: 42   },
  { name: 'ValueEdge Korea',         website: 'valueedgekr.com',      industry: 'SaaS',          country: 'South Korea',  employee_count: 230  },
  { name: 'SmartDock Germany',       website: 'smartdockde.com',      industry: 'Manufacturing', country: 'Germany',      employee_count: 560  },
  { name: 'PulseCheck Australia',    website: 'pulsecheckau.com',     industry: 'Healthcare',    country: 'Australia',    employee_count: 195  },
  { name: 'ClearVision Philippines', website: 'clearvisionph.com',    industry: 'SaaS',          country: 'Philippines',  employee_count: 75   },
  { name: 'MicroPay Thailand',       website: 'micropayth.com',       industry: 'Fintech',       country: 'Thailand',     employee_count: 140  },
  { name: 'HarborSafe Singapore',    website: 'harborsafesg.com',     industry: 'Logistics',     country: 'Singapore',    employee_count: 300  },
  { name: 'GrowthLab India',         website: 'growthlabindia.com',   industry: 'SaaS',          country: 'India',        employee_count: 65   },
  { name: 'DataBridge Malaysia',     website: 'databridgemy.com',     industry: 'SaaS',          country: 'Malaysia',     employee_count: 90   },
  { name: 'BuildFast Vietnam',       website: 'buildfastvn.com',      industry: 'Manufacturing', country: 'Vietnam',      employee_count: 820  },
  { name: 'RouteSync Indonesia',     website: 'routesyncid.com',      industry: 'Logistics',     country: 'Indonesia',    employee_count: 420  },
  { name: 'ChainBank Germany',       website: 'chainbankde.com',      industry: 'Fintech',       country: 'Germany',      employee_count: 670  },
  { name: 'NetCure Australia',       website: 'netcureau.com',        industry: 'Healthcare',    country: 'Australia',    employee_count: 145  },
  { name: 'PixelStack USA',          website: 'pixelstackus.com',     industry: 'SaaS',          country: 'USA',          employee_count: 50   },
  { name: 'EduLink Philippines',     website: 'edulinkph.com',        industry: 'Education',     country: 'Philippines',  employee_count: 200  },
  { name: 'ByteStream Singapore',    website: 'bytestreamsg.com',     industry: 'SaaS',          country: 'Singapore',    employee_count: 55   },
  { name: 'TrackMed Thailand',       website: 'trackmedth.com',       industry: 'Healthcare',    country: 'Thailand',     employee_count: 310  },
  { name: 'SkyStore Japan',          website: 'skystorejp.com',       industry: 'E-commerce',    country: 'Japan',        employee_count: 920  },
  { name: 'BlueShift India',         website: 'blueshiftindia.com',   industry: 'SaaS',          country: 'India',        employee_count: 130  },
  { name: 'WorkFront Canada',        website: 'workfrontca.com',      industry: 'SaaS',          country: 'Canada',       employee_count: 175  },
  { name: 'OmniPay Malaysia',        website: 'omnipaymy.com',        industry: 'Fintech',       country: 'Malaysia',     employee_count: 240  },
  { name: 'Traxify Vietnam',         website: 'traxifyvn.com',        industry: 'Logistics',     country: 'Vietnam',      employee_count: 190  },
  { name: 'OptiMart Indonesia',      website: 'optimartid.com',       industry: 'Retail',        country: 'Indonesia',    employee_count: 730  },
  { name: 'HealthSync Korea',        website: 'healthsynckr.com',     industry: 'Healthcare',    country: 'South Korea',  employee_count: 280  },
  { name: 'SwiftBuild Germany',      website: 'swiftbuildde.com',     industry: 'Manufacturing', country: 'Germany',      employee_count: 1100 },
  { name: 'IncuLearn Australia',     website: 'incularnau.com',       industry: 'Education',     country: 'Australia',    employee_count: 100  },
  { name: 'CartSense Philippines',   website: 'cartsenseph.com',      industry: 'E-commerce',    country: 'Philippines',  employee_count: 380  },
  { name: 'CreditFlow Singapore',    website: 'creditflowsg.com',     industry: 'Fintech',       country: 'Singapore',    employee_count: 210  },
  { name: 'GridTech Vietnam',        website: 'gridtechvn.com',       industry: 'Manufacturing', country: 'Vietnam',      employee_count: 640  },
  { name: 'NovaDash India',          website: 'novadashindia.com',    industry: 'SaaS',          country: 'India',        employee_count: 78   },
  { name: 'FastLearn UK',            website: 'fastlearnuk.com',      industry: 'Education',     country: 'UK',           employee_count: 160  },
  { name: 'MileStone Thailand',      website: 'milestoneth.com',      industry: 'Logistics',     country: 'Thailand',     employee_count: 540  },
  { name: 'ClosedLoop Malaysia',     website: 'closedloopmy.com',     industry: 'SaaS',          country: 'Malaysia',     employee_count: 85   },
  { name: 'CartWave Indonesia',      website: 'cartwaveid.com',       industry: 'E-commerce',    country: 'Indonesia',    employee_count: 820  },
  { name: 'PureCloud Japan',         website: 'purecloudjp.com',      industry: 'SaaS',          country: 'Japan',        employee_count: 155  },
  { name: 'AssuredPay Germany',      website: 'assuredpayde.com',     industry: 'Fintech',       country: 'Germany',      employee_count: 480  },
  { name: 'NanoHealth Philippines',  website: 'nanohealthph.com',     industry: 'Healthcare',    country: 'Philippines',  employee_count: 210  },
  { name: 'Sentry Logistics Korea',  website: 'sentrylgkr.com',       industry: 'Logistics',     country: 'South Korea',  employee_count: 740  },
  { name: 'EduBase Singapore',       website: 'edubasesg.com',        industry: 'Education',     country: 'Singapore',    employee_count: 130  },
  { name: 'MediStream Vietnam',      website: 'medistreamvn.com',     industry: 'Healthcare',    country: 'Vietnam',      employee_count: 175  },
  { name: 'TrueRetail Malaysia',     website: 'trueretailmy.com',     industry: 'Retail',        country: 'Malaysia',     employee_count: 870  },
  { name: 'SalesFuel India',         website: 'salesfuelindia.com',   industry: 'SaaS',          country: 'India',        employee_count: 92   },
  { name: 'SkyPay Australia',        website: 'skypayau.com',         industry: 'Fintech',       country: 'Australia',    employee_count: 165  },
  { name: 'CoreMark USA',            website: 'coremarkus.com',       industry: 'SaaS',          country: 'USA',          employee_count: 60   },
  { name: 'TrueFreight Indonesia',   website: 'truefreightid.com',    industry: 'Logistics',     country: 'Indonesia',    employee_count: 490  },
  { name: 'ClearMed Thailand',       website: 'clearmedth.com',       industry: 'Healthcare',    country: 'Thailand',     employee_count: 230  },
  { name: 'FlowMetrics Singapore',   website: 'flowmetricssg.com',    industry: 'SaaS',          country: 'Singapore',    employee_count: 43   },
  { name: 'PrimeStack Vietnam',      website: 'primestackvn.com',     industry: 'SaaS',          country: 'Vietnam',      employee_count: 58   },
  { name: 'GigPay Philippines',      website: 'gigpayph.com',         industry: 'Fintech',       country: 'Philippines',  employee_count: 190  },
  { name: 'BuySmart Korea',          website: 'buysmatkr.com',        industry: 'E-commerce',    country: 'South Korea',  employee_count: 640  },
  { name: 'EasyDeploy Germany',      website: 'easydeployde.com',     industry: 'SaaS',          country: 'Germany',      employee_count: 115  },
  { name: 'VitalCare Canada',        website: 'vitalcareca.com',      industry: 'Healthcare',    country: 'Canada',       employee_count: 360  },
  { name: 'MultiRetail Japan',       website: 'multiretailjp.com',    industry: 'Retail',        country: 'Japan',        employee_count: 1100 },
  { name: 'CostPilot India',         website: 'costpilotindia.com',   industry: 'Fintech',       country: 'India',        employee_count: 110  },
  { name: 'ScaleBase Australia',     website: 'scalebaseau.com',      industry: 'SaaS',          country: 'Australia',    employee_count: 72   },
  { name: 'SyncLogic Malaysia',      website: 'synclogicmy.com',      industry: 'Logistics',     country: 'Malaysia',     employee_count: 400  },
  { name: 'PulseCore Indonesia',     website: 'pulsecoreid.com',      industry: 'SaaS',          country: 'Indonesia',    employee_count: 67   },
  { name: 'FlexPay Thailand',        website: 'flexpayth.com',        industry: 'Fintech',       country: 'Thailand',     employee_count: 175  },
  { name: 'DataMesh UK',             website: 'datameshuk.com',       industry: 'SaaS',          country: 'UK',           employee_count: 100  },
  { name: 'TechVault Singapore',     website: 'techvaultsg.com',      industry: 'SaaS',          country: 'Singapore',    employee_count: 82   },
  { name: 'OptiHealth Vietnam',      website: 'optihealthvn.com',     industry: 'Healthcare',    country: 'Vietnam',      employee_count: 205  },
  { name: 'EcoFreight Germany',      website: 'ecofreightde.com',     industry: 'Logistics',     country: 'Germany',      employee_count: 620  },
  { name: 'MarketPulse Philippines', website: 'marketpulseph.com',    industry: 'SaaS',          country: 'Philippines',  employee_count: 53   },
  { name: 'TrueStack India',         website: 'truestackindia.com',   industry: 'SaaS',          country: 'India',        employee_count: 88   },
  { name: 'BuyNow Malaysia',         website: 'buynowmy.com',         industry: 'E-commerce',    country: 'Malaysia',     employee_count: 700  },
  { name: 'SafeTrack Korea',         website: 'safetrackkr.com',      industry: 'Logistics',     country: 'South Korea',  employee_count: 510  },
  { name: 'DataFront Japan',         website: 'datafrontjp.com',      industry: 'SaaS',          country: 'Japan',        employee_count: 95   },
  { name: 'NextPay Indonesia',       website: 'nextpayid.com',        industry: 'Fintech',       country: 'Indonesia',    employee_count: 310  },
  { name: 'GrowthSeed Australia',    website: 'growthseedau.com',     industry: 'SaaS',          country: 'Australia',    employee_count: 48   },
  { name: 'PharmaCore Canada',       website: 'pharmacoreca.com',     industry: 'Healthcare',    country: 'Canada',       employee_count: 510  },
  { name: 'OptiFreight Thailand',    website: 'optifreightth.com',    industry: 'Logistics',     country: 'Thailand',     employee_count: 380  },
  { name: 'FinView Singapore',       website: 'finviewsg.com',        industry: 'Fintech',       country: 'Singapore',    employee_count: 145  },
  { name: 'TrueEdge Vietnam',        website: 'trueedgevn.com',       industry: 'SaaS',          country: 'Vietnam',      employee_count: 37   },
  { name: 'MegaShift Germany',       website: 'megashiftde.com',      industry: 'Manufacturing', country: 'Germany',      employee_count: 1400 },
  { name: 'ClearRetail Philippines', website: 'clearretailph.com',    industry: 'Retail',        country: 'Philippines',  employee_count: 600  },
  { name: 'PeakLogic India',         website: 'peaklogicindia.com',   industry: 'Logistics',     country: 'India',        employee_count: 850  },
  { name: 'DataForge Malaysia',      website: 'dataforgemy.com',      industry: 'SaaS',          country: 'Malaysia',     employee_count: 62   },
  { name: 'BluePath Korea',          website: 'bluepathkr.com',       industry: 'Logistics',     country: 'South Korea',  employee_count: 460  },
  { name: 'SwiftHealth Australia',   website: 'swifthealthau.com',    industry: 'Healthcare',    country: 'Australia',    employee_count: 270  },
  { name: 'CodeTree Japan',          website: 'codetreejp.com',       industry: 'SaaS',          country: 'Japan',        employee_count: 73   },
  { name: 'RapidPay Indonesia',      website: 'rapidpayid.com',       industry: 'Fintech',       country: 'Indonesia',    employee_count: 280  },
  { name: 'EduPilot Thailand',       website: 'edupilotth.com',       industry: 'Education',     country: 'Thailand',     employee_count: 115  },
  { name: 'InsightCore Singapore',   website: 'insightcoresg.com',    industry: 'SaaS',          country: 'Singapore',    employee_count: 57   },
  { name: 'TechReach Vietnam',       website: 'techreachvn.com',      industry: 'SaaS',          country: 'Vietnam',      employee_count: 80   },
  { name: 'PrimePay Germany',        website: 'primepayde.com',       industry: 'Fintech',       country: 'Germany',      employee_count: 330  },
  { name: 'ClearTech Philippines',   website: 'cleartechph.com',      industry: 'SaaS',          country: 'Philippines',  employee_count: 68   },
  { name: 'DataPilot India',         website: 'datapilotindia.com',   industry: 'SaaS',          country: 'India',        employee_count: 105  },
  { name: 'MileFreight Malaysia',    website: 'milefreightmy.com',    industry: 'Logistics',     country: 'Malaysia',     employee_count: 490  },
  { name: 'SwiftLearn Korea',        website: 'swiftlearnkr.com',     industry: 'Education',     country: 'South Korea',  employee_count: 185  },
  { name: 'BrightPath Japan',        website: 'brightpathjp.com',     industry: 'SaaS',          country: 'Japan',        employee_count: 62   },
  { name: 'TechField Indonesia',     website: 'techfieldid.com',      industry: 'SaaS',          country: 'Indonesia',    employee_count: 94   },
  { name: 'ClearPath Australia',     website: 'clearpathau.com',      industry: 'Logistics',     country: 'Australia',    employee_count: 430  },
  { name: 'SafeBank Thailand',       website: 'safebankth.com',       industry: 'Fintech',       country: 'Thailand',     employee_count: 260  },
  { name: 'MetricBlast UK',          website: 'metricblastuk.com',    industry: 'SaaS',          country: 'UK',           employee_count: 47   },
];

// NEW ~270 generated companies to reach ~500 total prospect/customer
const newGenPrefixes = [
  'Apex','Bolt','Crest','Delta','Echo','Flux','Grid','Halo','Ion','Jade',
  'Kite','Lume','Mint','Nova','Opal','Peak','Quil','Rift','Sage','Tide',
  'Volt','Wave','Xeno','Yara','Zeta','Aura','Blox','Core','Dash','Edge',
];
const newGenSuffixes = [
  'Tech','Labs','AI','Data','Cloud','Pay','Med','Ops','Hub','Link',
  'Flow','Net','Sys','Pro','Dev','Fin','Ship','Mart','Care','Edu',
  'Build','Track','Stack','View','Path','Sync','Base','Pulse','Core','Ware',
];
const newGenIndustries = ['SaaS','Fintech','E-commerce','Healthcare','Logistics','Manufacturing','Retail','Education'];
const newGenIndustryWeights = [25, 20, 15, 10, 10, 8, 7, 5];

// Country distribution: SEA 60%, APAC 15%, Europe 15%, Americas 10%
const seaCountries = ['Singapore','Indonesia','Vietnam','Thailand','Malaysia','Philippines'];
const apacCountries = ['India','Japan','South Korea','Australia'];
const euroCountries = ['Germany','UK','France','Switzerland','Netherlands'];
const amCountries = ['USA','Canada','Brazil'];
const pickCountry = () => {
  const region = wpick(['sea','apac','euro','am'], [60, 15, 15, 10]);
  if (region === 'sea') return pick(seaCountries);
  if (region === 'apac') return pick(apacCountries);
  if (region === 'euro') return pick(euroCountries);
  return pick(amCountries);
};

const newGeneratedDefs = [];
const usedNames = new Set(existingGeneratedDefs.map(d => d.name));
for (let i = 0; i < 270; i++) {
  let name;
  do {
    name = `${pick(newGenPrefixes)}${pick(newGenSuffixes)} ${pickCountry().split(' ')[0]}`;
  } while (usedNames.has(name));
  usedNames.add(name);
  const country = pickCountry();
  const industry = wpick(newGenIndustries, newGenIndustryWeights);
  const slug = name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  newGeneratedDefs.push({
    name,
    website: `${slug}.com`,
    industry,
    country,
    employee_count: randInt(30, 2000),
  });
}

const allGeneratedDefs = [...existingGeneratedDefs, ...newGeneratedDefs];
const generatedProspects = allGeneratedDefs.map(p => ({
  ...p,
  id: uuid(),
  type: 'prospect',
  logo_url: `https://logo.clearbit.com/${p.website}`,
}));

// Assign created_at spanning 8 years
const baseCreatedAt = (dBack) => fmtTs(daysAgo(dBack));

const realNamedCompanies = realNamedDefs.map(c => ({
  id: uuid(),
  name: c.name,
  type: c.type,
  industry: c.industry,
  country: c.country,
  employee_count: c.employee_count,
  website: c.website,
  logo_url: `https://logo.clearbit.com/${c.website}`,
  created_at: baseCreatedAt(randInt(900, 2920)),
}));

const generatedProspectCompanies = generatedProspects.map(p => ({
  ...p,
  created_at: baseCreatedAt(randInt(200, 2200)),
}));

const companies = [
  { id: HOLISTICS_ID, name: 'Holistics', type: 'internal', industry: 'SaaS', country: 'Singapore', employee_count: 80, website: 'holistics.io', logo_url: 'https://logo.clearbit.com/holistics.io', created_at: fmtTs(daysAgo(2920)) },
  ...competitorDefs.map(c => ({
    id: c.id, name: c.name, type: 'competitor', industry: 'SaaS', country: 'USA', employee_count: randInt(100, 3000),
    website: c.website, logo_url: `https://logo.clearbit.com/${c.website}`, created_at: fmtTs(daysAgo(2920)),
  })),
  ...realNamedCompanies,
  ...generatedProspectCompanies,
];

const prospectCustomerCompanies = companies.filter(c => c.type === 'prospect' || c.type === 'customer');

// ─── PERSONS — INTERNAL TEAM ──────────────────────────────────────────────────
// Sarah Chen departs at ~month 60 (5 years in, ~1095 days ago). Model turnover.
// Jordan Lee added — biased toward ghost/lost deals.

const SARAH_LEFT_AT = daysAgo(1095); // ~5 years into 8-year span

const internalTeam = [
  // AEs
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Sarah Chen',         email: 'sarah.chen@holistics.io',         role: 'ae',           created_at: fmtTs(daysAgo(2800)), left_at: fmtTs(SARAH_LEFT_AT) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Mike Torres',        email: 'mike.torres@holistics.io',        role: 'ae',           created_at: fmtTs(daysAgo(2800)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Priya Patel',        email: 'priya.patel@holistics.io',        role: 'ae',           created_at: fmtTs(daysAgo(2000)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'James Wilson',       email: 'james.wilson@holistics.io',       role: 'ae',           created_at: fmtTs(daysAgo(800)),  left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Rachel Lee',         email: 'rachel.lee@holistics.io',         role: 'ae',           created_at: fmtTs(addDays(SARAH_LEFT_AT, 18)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Jordan Lee',         email: 'jordan.lee@holistics.io',         role: 'ae',           created_at: fmtTs(daysAgo(600)),  left_at: null },
  // CS reps
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Alex Kim',           email: 'alex.kim@holistics.io',           role: 'cs_rep',       created_at: fmtTs(daysAgo(2800)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Lisa Nguyen',        email: 'lisa.nguyen@holistics.io',        role: 'cs_rep',       created_at: fmtTs(daysAgo(1600)), left_at: null },
  // Manager & BizOps
  { id: uuid(), company_id: HOLISTICS_ID, name: 'David Park',         email: 'david.park@holistics.io',         role: 'manager',      created_at: fmtTs(daysAgo(2920)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Emma Rodriguez',     email: 'emma.rodriguez@holistics.io',     role: 'bizops',       created_at: fmtTs(daysAgo(2920)), left_at: null },
  // Product Managers (10, with turnover)
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Nina Kaur',          email: 'nina.kaur@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(2800)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Tom Zhang',          email: 'tom.zhang@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(2800)), left_at: fmtTs(daysAgo(1800)) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Ana Reyes',          email: 'ana.reyes@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(1740)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Ben Malik',          email: 'ben.malik@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(2400)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Chloe Tan',          email: 'chloe.tan@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(2200)), left_at: fmtTs(daysAgo(1000)) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Omar Farouk',        email: 'omar.farouk@holistics.io',        role: 'product',      created_at: fmtTs(daysAgo(940)),  left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Saya Inoue',         email: 'saya.inoue@holistics.io',         role: 'product',      created_at: fmtTs(daysAgo(2100)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Ivan Petrov',        email: 'ivan.petrov@holistics.io',        role: 'product',      created_at: fmtTs(daysAgo(1500)), left_at: fmtTs(daysAgo(400)) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Mei Lin',            email: 'mei.lin@holistics.io',            role: 'product',      created_at: fmtTs(daysAgo(340)),  left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Carlos Vega',        email: 'carlos.vega@holistics.io',        role: 'product',      created_at: fmtTs(daysAgo(1200)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Aisha Bello',        email: 'aisha.bello@holistics.io',        role: 'product',      created_at: fmtTs(daysAgo(700)),  left_at: null },
  // Data Analysts
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Wei Tan',            email: 'wei.tan@holistics.io',            role: 'data_analyst', created_at: fmtTs(daysAgo(2600)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Sophie Muller',      email: 'sophie.muller@holistics.io',      role: 'data_analyst', created_at: fmtTs(daysAgo(2600)), left_at: fmtTs(daysAgo(1400)) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Jake Osei',          email: 'jake.osei@holistics.io',          role: 'data_analyst', created_at: fmtTs(daysAgo(1340)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Priscilla Santos',   email: 'priscilla.santos@holistics.io',   role: 'data_analyst', created_at: fmtTs(daysAgo(1800)), left_at: null },
  // CEO & CTO
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Marcus Heng',        email: 'marcus.heng@holistics.io',        role: 'ceo',          created_at: fmtTs(daysAgo(2920)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Liang Wei',          email: 'liang.wei@holistics.io',          role: 'cto',          created_at: fmtTs(daysAgo(2920)), left_at: null },
];

const JORDAN_LEE = internalTeam.find(p => p.name === 'Jordan Lee');
const activeAEs    = internalTeam.filter(p => p.role === 'ae'           && !p.left_at);
const allAEs       = internalTeam.filter(p => p.role === 'ae');
const allCSReps    = internalTeam.filter(p => p.role === 'cs_rep'       && !p.left_at);
const allPMs       = internalTeam.filter(p => p.role === 'product'      && !p.left_at);
const allDAs       = internalTeam.filter(p => p.role === 'data_analyst' && !p.left_at);
const CEO          = internalTeam.find(p => p.role === 'ceo');
const CTO          = internalTeam.find(p => p.role === 'cto');

const pickAEForDate = (date) => {
  const active = allAEs.filter(ae => {
    const joined = new Date(ae.created_at) <= date;
    const notLeft = !ae.left_at || new Date(ae.left_at) > date;
    return joined && notLeft;
  });
  return active.length ? pick(active) : pick(activeAEs);
};

// ─── EXTERNAL CONTACTS ────────────────────────────────────────────────────────

const firstNames = ['Wei','Ananya','Carlos','Sophie','Amir','Yuki','Fatima','Liam','Minh','Priya','Marco','Soo-jin','Tariq','Elena','Raj','Mei','Omar','Clara','Hiroshi','Nia','Arjun','Diana','Felix','Gina','Hassan','Iris','Jack','Kira','Leon','Maya','Nour','Pita','Quinn','Rosa','Sam','Tina','Uma','Victor','Wendy','Xian'];
const lastNames  = ['Tan','Lim','Wang','Singh','Smith','Patel','Kim','Nguyen','Cruz','Hassan','Meyer','Park','Ali','Johansson','Okafor','Yamamoto','Reyes','Fernandez','Osei','Bui','Chan','Das','Evans','Garcia','Hoang','Ito','Jensen','Kapoor','Lin','Morales','Nakamura','Oh','Perez','Rao','Suresh','Torres','Umar','Vo','Wu','Xu'];

const persons = [...internalTeam];
const contactsByCompany = {};

prospectCustomerCompanies.forEach(co => {
  const count = randInt(2, 4);
  const contacts = [];
  for (let i = 0; i < count; i++) {
    const leftAt = Math.random() < 0.05 ? fmtTs(addDays(new Date(co.created_at), randInt(200, 1800))) : null;
    const p = {
      id: uuid(),
      company_id: co.id,
      name: `${pick(firstNames)} ${pick(lastNames)}`,
      email: `contact${randInt(10, 99)}@${co.website}`,
      role: wpick(['champion','decision_maker','evaluator','end_user'], [30, 25, 25, 20]),
      created_at: co.created_at,
      left_at: leftAt,
    };
    persons.push(p);
    contacts.push(p);
  }
  contactsByCompany[co.id] = contacts;
});

// ─── DEALS ────────────────────────────────────────────────────────────────────

const DEAL_STAGES = ['qualifying','validating','progressing','focus','negotiating'];
const dealValues  = [500, 1200, 2400, 4800, 9600, 18000, 36000, 60000];
const dealValueWeights = [8, 14, 20, 26, 16, 9, 5, 2];
const lostReasons = ['missing_feature','competitor_win','pricing','no_budget','ghosted','not_a_fit'];
const lostWeights = [35, 25, 20, 10, 7, 3];

// Win reasons for won deals
const winReasons = ['product_fit','relationship','pricing_advantage','competitive_gap','speed_to_value','other'];
const winReasonWeights = [44, 24, 17, 10, 3, 2];

// Sub-status for in_progress deals
const subStatuses = ['promising','focus','at_risk','highlight'];
const subStatusWeights = [35, 30, 20, 15];

// Key learning templates
const wonKeyLearnings = [
  'Strong product fit, fast legal','Referral accelerated cycle','Technical eval clinched it',
  'Champion drove internal buy-in','Self-serve trial converted smoothly','POC exceeded expectations',
  'Competitive bake-off win on flexibility','Data team loved the modeling layer',
  'Quick time-to-value sealed it','Executive sponsor pushed deal through',
  'Integration story resonated','Semantic layer was differentiator',
  'White-glove onboarding helped','Partner referral, smooth process',
];
const lostFeatureLearnings = [
  'SSO was hard blocker','No RLS support at the time','Missing Excel export killed it',
  'Needed column-level permissions','Embedding limitations','No GitLab sync',
  'Pre-aggregation needed for scale','Missing audit log requirements',
  'API coverage insufficient','Mobile support not there yet',
];
const lostCompetitorLearnings = [
  'Price perception vs Metabase','Looker ecosystem lock-in','Tableau brand trust',
  'Power BI bundled with M365','Sigma spreadsheet UX won','ThoughtSpot search UX',
  'Incumbent vendor discount','Competitor had deeper integrations',
];
const lostGhostLearnings = [
  'Too many days between touches','Champion left mid-evaluation','Budget frozen mid-quarter',
  'Internal re-org killed momentum','Timing mismatch, revisit later','Lost to inaction',
  'Prospect went silent after demo','Key stakeholder unavailable',
];
const wonFollowUps = [
  'Onboarding kickoff next week','Schedule QBR in 90 days','Connect with CS for rollout',
  'Expand to second team in Q2','Upsell conversation in 6 months','Training session scheduled',
  'Integration support needed','Dashboard migration assistance',
];
const lostFollowUps = [
  'Re-engage when SSO ships','Nurture - check in 90d','Add to feature-ship notification list',
  'Revisit next fiscal year','Keep warm, budget may reopen','Monitor competitor churn signals',
  'Re-engage after re-org settles','Wait for champion replacement',
];

const deals = [];
const dealStageHistory = [];
const subscriptions = [];

const stageDur = {
  qualifying:   [3,  14],
  validating:   [7,  28],
  progressing:  [5,  21],
  focus:        [5,  18],
  negotiating:  [3,  14],
};

const buildStageHistory = (dealId, createdAt, closedAt, status, currentStage) => {
  const history = [];
  let stagesPath;
  if (status === 'won') {
    const endIdx = randInt(2, 4);
    stagesPath = DEAL_STAGES.slice(0, endIdx + 1);
  } else if (status === 'lost' || status === 'churned') {
    const dropIdx = randInt(0, 3);
    stagesPath = DEAL_STAGES.slice(0, dropIdx + 1);
  } else {
    const idx = DEAL_STAGES.indexOf(currentStage);
    stagesPath = DEAL_STAGES.slice(0, Math.max(idx + 1, 1));
  }
  let cur = new Date(createdAt);
  stagesPath.forEach((stage, i) => {
    const isLast = i === stagesPath.length - 1;
    const entered = new Date(cur);
    let exited = null;
    if (!isLast) {
      cur = addDays(cur, randInt(...stageDur[stage]));
      exited = new Date(cur);
    } else if (closedAt && (status === 'won' || status === 'lost' || status === 'churned')) {
      exited = new Date(closedAt);
    }
    history.push({
      id: uuid(), deal_id: dealId, stage,
      entered_at: fmtTs(entered),
      exited_at:  exited ? fmtTs(exited) : null,
    });
  });
  return history;
};

const companyWonDeals = {};
const wonDealMap = {};

const companyPool = [...prospectCustomerCompanies];
let cIdx = 0;
const nextCo = () => companyPool[cIdx++ % companyPool.length];

const cohortDate = (minDays, maxDays) => daysAgo(randInt(minDays, maxDays));

// Helper to generate key_learning and follow_up_action for a deal
const genKeyLearning = (status, lostReason) => {
  if (status === 'won') return pick(wonKeyLearnings);
  if (status === 'lost' || status === 'churned') {
    if (lostReason === 'missing_feature') return pick(lostFeatureLearnings);
    if (lostReason === 'competitor_win') return pick(lostCompetitorLearnings);
    if (lostReason === 'ghosted') return pick(lostGhostLearnings);
    return pick([...lostFeatureLearnings, ...lostGhostLearnings]);
  }
  return null;
};
const genFollowUp = (status) => {
  if (status === 'won') return pick(wonFollowUps);
  if (status === 'lost' || status === 'churned') return pick(lostFollowUps);
  return null;
};

// Distribution matching spec (~1800 deals)
const distConfig = [
  { deal_type: 'new',       status: 'won',         count: 300 },
  { deal_type: 'new',       status: 'lost',        count: 350 },
  { deal_type: 'new',       status: 'ghost',       count: 60  },
  { deal_type: 'new',       status: 'in_progress', count: 40  },
  { deal_type: 'renewal',   status: 'won',         count: 280 },
  { deal_type: 'renewal',   status: 'lost',        count: 50  },
  { deal_type: 'renewal',   status: 'churned',     count: 100 },
  { deal_type: 'renewal',   status: 'in_progress', count: 50  },
  { deal_type: 'upgrade',   status: 'won',         count: 120 },
  { deal_type: 'upgrade',   status: 'lost',        count: 30  },
  { deal_type: 'upgrade',   status: 'in_progress', count: 20  },
  { deal_type: 'downgrade', status: 'won',         count: 60  },
  { deal_type: 'downgrade', status: 'lost',        count: 10  },
  { deal_type: 'downgrade', status: 'in_progress', count: 10  },
];

// Jordan Lee deal counter for bias tracking
let jordanTotalDeals = 0;
let jordanWonDeals = 0;
let jordanGhostDeals = 0;

// Track deals in last 2 quarters for win rate story
const Q1_START = daysAgo(180); // ~6 months ago
const Q2_START = daysAgo(90);  // ~3 months ago

// First pass: new deals
for (const dist of distConfig) {
  if (dist.deal_type !== 'new') continue;
  for (let i = 0; i < dist.count; i++) {
    const co = nextCo();
    const dealId = uuid();
    let createdAt, closedAt = null, stage = null, lostReason = null, followUpAt = null;

    if (dist.status === 'won') {
      // Spread across 8-year cohorts
      const cohortBucket = i % 10;
      const ranges = [
        [2700,2920],[2400,2700],[2100,2400],[1800,2100],[1460,1800],
        [1080,1460],[540,1080],[180,540],[60,180],[7,60],
      ];
      const [minD, maxD] = ranges[cohortBucket];
      createdAt = cohortDate(minD, maxD);
      closedAt  = addDays(createdAt, randInt(21, 90));
      if (!companyWonDeals[co.id]) companyWonDeals[co.id] = [];
    } else if (dist.status === 'lost') {
      const cohortBucket = i % 8;
      const ranges = [
        [2400,2920],[2100,2400],[1800,2100],[1460,1800],
        [1080,1460],[540,1080],[180,540],[30,180],
      ];
      const [minD, maxD] = ranges[cohortBucket];
      createdAt = cohortDate(minD, maxD);
      closedAt  = addDays(createdAt, randInt(15, 75));
      lostReason = wpick(lostReasons, lostWeights);
    } else if (dist.status === 'ghost') {
      createdAt = cohortDate(50, 300);
      stage = pick(['qualifying','validating']);
      if (Math.random() < 0.30) followUpAt = fmtDate(addDays(createdAt, randInt(60, 180)));
    } else {
      // in_progress
      createdAt = cohortDate(7, 120);
      stage = wpick(DEAL_STAGES, [20, 30, 25, 15, 10]);
      if (Math.random() < 0.10) followUpAt = fmtDate(addDays(new Date(), randInt(14, 90)));
    }

    // Determine AE — bias Jordan Lee toward ghost/lost
    let ae;
    if (dist.status === 'ghost' && Math.random() < 0.35) {
      ae = JORDAN_LEE;
    } else if (dist.status === 'lost' && Math.random() < 0.20) {
      ae = JORDAN_LEE;
    } else {
      ae = pickAEForDate(createdAt);
    }

    // Track Jordan stats
    if (ae.name === 'Jordan Lee') {
      jordanTotalDeals++;
      if (dist.status === 'won') jordanWonDeals++;
      if (dist.status === 'ghost') jordanGhostDeals++;
    }

    const dealValue = wpick(dealValues, dealValueWeights);

    // Win rate decline in last 2 quarters — shift some recent won to lost
    let effectiveStatus = dist.status;
    if (dist.status === 'won' && createdAt > Q2_START && Math.random() < 0.10) {
      effectiveStatus = 'lost';
      lostReason = wpick(lostReasons, lostWeights);
      closedAt = addDays(createdAt, randInt(15, 75));
    }

    const deal = {
      id: dealId,
      company_id: co.id,
      owner_id: ae.id,
      deal_type: 'new',
      status: effectiveStatus,
      stage: stage || (effectiveStatus === 'won' ? 'negotiating' : effectiveStatus === 'lost' || effectiveStatus === 'churned' ? null : stage),
      deal_value_usd: dealValue,
      lost_reason: lostReason || null,
      previous_deal_id: null,
      sub_status: effectiveStatus === 'in_progress' ? wpick(subStatuses, subStatusWeights) : null,
      win_reason: effectiveStatus === 'won' ? wpick(winReasons, winReasonWeights) : null,
      key_learning: (effectiveStatus === 'won' || effectiveStatus === 'lost') ? genKeyLearning(effectiveStatus, lostReason) : null,
      follow_up_action: (effectiveStatus === 'won' || effectiveStatus === 'lost') ? genFollowUp(effectiveStatus) : null,
      created_at: fmtTs(createdAt),
      closed_at: closedAt ? fmtTs(closedAt) : null,
      follow_up_at: followUpAt,
    };
    deals.push(deal);
    dealStageHistory.push(...buildStageHistory(dealId, createdAt, closedAt, effectiveStatus, stage));

    if (effectiveStatus === 'won') {
      if (!companyWonDeals[co.id]) companyWonDeals[co.id] = [];
      companyWonDeals[co.id].push({ dealId, companyId: co.id, closedAt, dealValue, ae });
      wonDealMap[dealId] = deal;
      const co2 = companies.find(c => c.id === co.id);
      if (co2) co2.type = 'customer';
    }
  }
}

const companiesWithWonDeals = Object.keys(companyWonDeals).filter(id => companyWonDeals[id].length > 0);

const pickWonDeal = () => {
  if (!companiesWithWonDeals.length) return null;
  const coId = pick(companiesWithWonDeals);
  return pick(companyWonDeals[coId]);
};

// Second pass: upgrade, downgrade, renewal deals
for (const dist of distConfig) {
  if (dist.deal_type === 'new') continue;
  for (let i = 0; i < dist.count; i++) {
    const prior = pickWonDeal();
    if (!prior) continue;

    const dealId = uuid();
    const ae = pickAEForDate(new Date(prior.closedAt));

    let createdAt, closedAt = null, stage = null, lostReason = null, followUpAt = null;
    let dealValue = wpick(dealValues, dealValueWeights);

    if (dist.deal_type === 'upgrade') {
      const higherVals = dealValues.filter(v => v > (prior.dealValue || 2400));
      dealValue = higherVals.length ? pick(higherVals) : dealValues[dealValues.length - 1];
    } else if (dist.deal_type === 'downgrade') {
      const lowerVals = dealValues.filter(v => v < (prior.dealValue || 9600));
      dealValue = lowerVals.length ? pick(lowerVals) : dealValues[0];
    }

    if (dist.status === 'won') {
      createdAt = addDays(new Date(prior.closedAt), randInt(30, 700));
      closedAt  = addDays(createdAt, randInt(14, 60));
    } else if (dist.status === 'lost' || dist.status === 'churned') {
      createdAt = addDays(new Date(prior.closedAt), randInt(180, 800));
      closedAt  = addDays(createdAt, randInt(14, 60));
      if (dist.status === 'lost') lostReason = wpick(lostReasons, lostWeights);
    } else {
      if (dist.deal_type === 'renewal') {
        createdAt = cohortDate(60, 5);
      } else {
        createdAt = cohortDate(90, 7);
      }
      stage = wpick(DEAL_STAGES, [15, 25, 30, 20, 10]);
      if (Math.random() < 0.10) followUpAt = fmtDate(addDays(new Date(), randInt(14, 90)));
    }

    const deal = {
      id: dealId,
      company_id: prior.companyId,
      owner_id: ae.id,
      deal_type: dist.deal_type,
      status: dist.status,
      stage: stage || null,
      deal_value_usd: dealValue,
      lost_reason: lostReason || null,
      previous_deal_id: prior.dealId,
      sub_status: dist.status === 'in_progress' ? wpick(subStatuses, subStatusWeights) : null,
      win_reason: dist.status === 'won' ? wpick(winReasons, winReasonWeights) : null,
      key_learning: (dist.status === 'won' || dist.status === 'lost' || dist.status === 'churned') ? genKeyLearning(dist.status, lostReason) : null,
      follow_up_action: (dist.status === 'won' || dist.status === 'lost' || dist.status === 'churned') ? genFollowUp(dist.status) : null,
      created_at: fmtTs(createdAt),
      closed_at: closedAt ? fmtTs(closedAt) : null,
      follow_up_at: followUpAt,
    };
    deals.push(deal);
    dealStageHistory.push(...buildStageHistory(dealId, createdAt, closedAt, dist.status, stage));

    if (dist.status === 'won') {
      companyWonDeals[prior.companyId].push({ dealId, companyId: prior.companyId, closedAt, dealValue, ae });
      wonDealMap[dealId] = deal;
    }
  }
}

// Ghost-then-return pattern (~20 explicit deals)
const ghostReturnDeals = deals.filter(d => d.status === 'ghost').slice(0, 20);
ghostReturnDeals.forEach(ghostDeal => {
  const followDate = ghostDeal.follow_up_at
    ? new Date(ghostDeal.follow_up_at)
    : addDays(new Date(ghostDeal.created_at), randInt(45, 120));
  if (followDate < new Date()) {
    const returnDealId = uuid();
    const reactivatedAt = followDate;
    const outcome = Math.random() < 0.4 ? 'won' : Math.random() < 0.5 ? 'lost' : 'ghost';
    const closedAt2 = outcome !== 'ghost' ? addDays(reactivatedAt, randInt(14, 60)) : null;
    const ae = pickAEForDate(reactivatedAt);
    const lr = outcome === 'lost' ? wpick(lostReasons, lostWeights) : null;

    deals.push({
      id: returnDealId,
      company_id: ghostDeal.company_id,
      owner_id: ae.id,
      deal_type: 'new',
      status: outcome,
      stage: outcome === 'ghost' ? 'qualifying' : null,
      deal_value_usd: ghostDeal.deal_value_usd,
      lost_reason: lr,
      previous_deal_id: ghostDeal.id,
      sub_status: null,
      win_reason: outcome === 'won' ? wpick(winReasons, winReasonWeights) : null,
      key_learning: outcome !== 'ghost' ? genKeyLearning(outcome, lr) : null,
      follow_up_action: outcome !== 'ghost' ? genFollowUp(outcome) : null,
      created_at: fmtTs(reactivatedAt),
      closed_at: closedAt2 ? fmtTs(closedAt2) : null,
      follow_up_at: null,
    });
    dealStageHistory.push(...buildStageHistory(returnDealId, reactivatedAt, closedAt2, outcome, 'qualifying'));

    if (outcome === 'won') {
      if (!companyWonDeals[ghostDeal.company_id]) companyWonDeals[ghostDeal.company_id] = [];
      companyWonDeals[ghostDeal.company_id].push({ dealId: returnDealId, companyId: ghostDeal.company_id, closedAt: closedAt2, dealValue: ghostDeal.deal_value_usd, ae });
      wonDealMap[returnDealId] = deals[deals.length - 1];
      const co = companies.find(c => c.id === ghostDeal.company_id);
      if (co) co.type = 'customer';
    }
  }
});

// ─── SUBSCRIPTIONS (with product_version) ─────────────────────────────────────

const planOptions = [
  { plan_name: 'Starter',    billing_cycle: 'monthly', mrr_usd: 99,   term_months: 6  },
  { plan_name: 'Starter',    billing_cycle: 'monthly', mrr_usd: 99,   term_months: 12 },
  { plan_name: 'Starter',    billing_cycle: 'annual',  mrr_usd: 79,   term_months: 12 },
  { plan_name: 'Growth',     billing_cycle: 'monthly', mrr_usd: 299,  term_months: 6  },
  { plan_name: 'Growth',     billing_cycle: 'monthly', mrr_usd: 299,  term_months: 12 },
  { plan_name: 'Growth',     billing_cycle: 'annual',  mrr_usd: 239,  term_months: 12 },
  { plan_name: 'Growth',     billing_cycle: 'annual',  mrr_usd: 239,  term_months: 24 },
  { plan_name: 'Business',   billing_cycle: 'monthly', mrr_usd: 799,  term_months: 12 },
  { plan_name: 'Business',   billing_cycle: 'annual',  mrr_usd: 639,  term_months: 12 },
  { plan_name: 'Business',   billing_cycle: 'annual',  mrr_usd: 639,  term_months: 24 },
  { plan_name: 'Enterprise', billing_cycle: 'monthly', mrr_usd: 1999, term_months: 12 },
  { plan_name: 'Enterprise', billing_cycle: 'annual',  mrr_usd: 1599, term_months: 12 },
  { plan_name: 'Enterprise', billing_cycle: 'annual',  mrr_usd: 1599, term_months: 24 },
];
const planWeights = [10, 8, 7, 10, 12, 10, 5, 12, 10, 8, 4, 2, 2];
const churnReasons = ['voluntary_feature_gap','voluntary_pricing','voluntary_competitor','voluntary_no_usage','involuntary_payment','unknown'];
const churnWeights = [30, 20, 25, 15, 5, 5];

// Version assignment based on started_at date
const assignVersion = (startedAt, isRenewal, priorVersion) => {
  // Renewals keep their version
  if (isRenewal && priorVersion) return priorVersion;

  const now = new Date();
  const start = new Date(startedAt);
  const daysFromNow = Math.round((now - start) / (1000 * 60 * 60 * 24));

  // 8-6 years ago (2920-2190 days): v2.0 only
  if (daysFromNow >= 2190) return '2.0';
  // 6-5 years ago (2190-1825 days): 30% v2.0, 70% v2.5
  if (daysFromNow >= 1825) return wpick(['2.0','2.5'], [30, 70]);
  // 5-4 years ago (1825-1460 days): 40% v2.5, 60% v2.7
  if (daysFromNow >= 1460) return wpick(['2.5','2.7'], [40, 60]);
  // 4-3 years ago (1460-1095 days): 30% v2.7, 70% v3.0
  if (daysFromNow >= 1095) return wpick(['2.7','3.0'], [30, 70]);
  // 3-1.5 years ago (1095-548 days): 100% v3.0
  if (daysFromNow >= 548) return '3.0';
  // 1.5-0 years ago (548-0 days): 30% v3.0, 70% v4.0
  return wpick(['3.0','4.0'], [30, 70]);
};

// Track company versions for renewal chaining
const companyVersions = {};

// Create subscriptions for all won deals
// First, sort won deals by closed_at to chain versions properly
const wonDealIds = Object.keys(wonDealMap);
wonDealIds.sort((a, b) => new Date(wonDealMap[a].closed_at) - new Date(wonDealMap[b].closed_at));

wonDealIds.forEach(dealId => {
  const deal = wonDealMap[dealId];
  const plan = wpick(planOptions, planWeights);
  const startedAt = addDays(new Date(deal.closed_at), 1);

  // Determine if renewal — check if this deal has a previous_deal_id
  const isRenewal = deal.deal_type === 'renewal' || deal.deal_type === 'upgrade' || deal.deal_type === 'downgrade';
  const priorVersion = companyVersions[deal.company_id] || null;
  const version = assignVersion(startedAt, isRenewal, priorVersion);
  companyVersions[deal.company_id] = version;

  const hasChurnedRenewal = deals.some(d => d.previous_deal_id === dealId && d.status === 'churned');
  let endedAt = null;
  let churnReason = null;

  if (hasChurnedRenewal) {
    endedAt = addDays(startedAt, plan.term_months * 30);
    churnReason = wpick(churnReasons, churnWeights);
    // v2.0 customers have 3x churn rate — bias
    if (version === '2.0' && Math.random() < 0.30) {
      churnReason = wpick(churnReasons, churnWeights);
    }
  } else {
    const termEnd = addDays(startedAt, plan.term_months * 30);
    if (termEnd < new Date()) {
      const hasRenewal = deals.some(d => d.previous_deal_id === dealId && (d.deal_type === 'renewal' || d.deal_type === 'upgrade'));
      if (!hasRenewal) {
        endedAt = termEnd;
        churnReason = 'unknown';
        // v2.0 customers churn 3x more
        if (version !== '2.0' && Math.random() < 0.60) {
          endedAt = null;
          churnReason = null;
        }
      }
    }
  }

  subscriptions.push({
    id: uuid(),
    company_id: deal.company_id,
    deal_id: dealId,
    plan_name: plan.plan_name,
    mrr_usd: plan.mrr_usd,
    billing_cycle: plan.billing_cycle,
    term_months: plan.term_months,
    started_at: fmtDate(startedAt),
    ended_at: endedAt ? fmtDate(endedAt) : null,
    churn_reason: churnReason || null,
    product_version: version,
  });
});

// ─── CALLS + ATTENDEES + RAW INPUTS ───────────────────────────────────────────

const calls = [];
const callAttendees = [];
const rawInputs = [];

const preSaleCallTypes   = ['discovery','demo','evaluation','negotiation'];
const postSaleCallTypes  = ['onboarding','check_in','renewal'];

// AI summary templates
const aiSummaryTemplates = [
  'Discussed product roadmap and upcoming features. Customer expressed interest in advanced analytics.',
  'Reviewed pricing tiers and contract terms. Decision expected within 2 weeks.',
  'Technical deep-dive on data modeling capabilities. Engineering team impressed.',
  'Onboarding progress review. 3 dashboards live, 2 more in development.',
  'Quarterly business review. Usage up 40% QoQ. Expansion opportunity identified.',
  'Feature request discussion: need better export options and scheduling.',
  'Security and compliance review. SOC2 and GDPR requirements discussed.',
  'Integration planning session. BigQuery and dbt workflow mapping.',
  'Performance optimization discussion. Query caching recommendations provided.',
  'Renewal negotiation. Multi-year discount proposed. Awaiting budget approval.',
  'Champion check-in. Internal adoption growing. Training session requested.',
  'Competitive evaluation update. Comparing with Looker on embedded analytics.',
  'Data quality concerns raised. Validation rules and monitoring discussed.',
  'Mobile access requirements gathering. Field team needs dashboard access.',
  'Escalation call. Dashboard performance issues in production. Fix committed.',
];

const prepNotesTemplates = [
  'Review latest product updates for demo. Check competitor positioning.',
  'Prepare ROI analysis based on their data volume. Bring case studies.',
  'Follow up on security questionnaire. Have SOC2 report ready.',
  'Check renewal terms and usage metrics. Prepare expansion proposal.',
  'Review open support tickets before call. Bring resolution updates.',
  'Prepare technical architecture diagram for integration discussion.',
  'Gather testimonials from similar industry customers.',
  'Review their current dashboard usage analytics.',
  'Prepare pricing comparison vs their current tool.',
  'Check feature request status for items they raised last call.',
];

// Input types per phase
const preSaleInputTypes  = ['feature_request','deal_breaker','excitement','feedback','ui_ux','performance','permission','onboarding_issue','testimonial','irrelevant','how_to'];
const preSaleInputWeights = [25, 10, 10, 10, 10, 8, 8, 5, 5, 5, 4];
const postSaleInputTypes  = ['how_to','bug','feature_request','feedback','ui_ux','performance','excitement','testimonial','permission','irrelevant'];
const postSaleInputWeights = [22, 18, 15, 12, 10, 8, 5, 5, 3, 2];

const inputStatuses = ['new','valid','need_inputs','solved','informed','has_workaround','not_relevant','duplicated'];
const inputStatusWeights = [20, 30, 10, 15, 10, 5, 5, 5];
const inputSources = ['call','ticket','email','slack','community','other'];
const inputSourceWeights = [50, 20, 10, 10, 7, 3];

const impIds = improvements.map(i => i.id);

const addCall = (companyId, dealId, callDate, phase, callType, hostId, extContacts, opts = {}) => {
  const callId = uuid();
  calls.push({
    id: callId, company_id: companyId, deal_id: dealId || null,
    call_date: fmtDate(callDate), duration_min: pick([30, 45, 60, 90]),
    phase, type: callType, notes: null,
    scheduled_at: opts.scheduled_at || null,
    prep_notes: opts.prep_notes || null,
    ai_summary: opts.ai_summary || (Math.random() < 0.4 ? pick(aiSummaryTemplates) : null),
  });
  callAttendees.push({ call_id: callId, person_id: hostId, role: 'host' });

  const internalExtra = [];
  if (callType === 'discovery' && Math.random() < 0.4) internalExtra.push(pick([...allPMs, ...allDAs]));
  if (callType === 'demo'      && Math.random() < 0.3) internalExtra.push(pick(allPMs));
  if (callType === 'evaluation') {
    if (Math.random() < 0.4) internalExtra.push(CTO);
    else if (Math.random() < 0.3) internalExtra.push(pick(allDAs));
  }
  if (callType === 'negotiation') {
    const deal = deals.find(d => d.id === dealId);
    if (deal && deal.deal_value_usd >= 18000 && Math.random() < 0.6) internalExtra.push(CEO);
  }
  if (callType === 'onboarding' && Math.random() < 0.35) internalExtra.push(pick(allDAs));

  internalExtra.forEach(p => {
    if (p) callAttendees.push({ call_id: callId, person_id: p.id, role: 'attendee' });
  });

  const extCount = Math.min(randInt(1, 3), extContacts.length);
  extContacts.slice(0, extCount).forEach(ec => {
    callAttendees.push({ call_id: callId, person_id: ec.id, role: 'attendee' });
  });

  return callId;
};

const addRawInput = (callId, companyId, inputType, callDate, isPostSale) => {
  const isCompetitor = !isPostSale && Math.random() < 0.20;
  rawInputs.push({
    id: uuid(),
    company_id: companyId,
    call_id: callId,
    improvement_id: (inputType === 'feature_request' || inputType === 'deal_breaker') ? pick(impIds) : null,
    competitor_id: isCompetitor ? pickCompetitor() : null,
    input_type: inputType,
    source: wpick(inputSources, inputSourceWeights),
    direction: isPostSale ? (Math.random() < 0.5 ? 'inbound' : 'outbound') : 'outbound',
    is_blocking: inputType === 'deal_breaker' ? true : (Math.random() < 0.15),
    priority: isPostSale ? wpick(['low','medium','high','critical'], [35, 40, 20, 5]) : null,
    status: wpick(inputStatuses, inputStatusWeights),
    description: null,
    resolved_at: null,
    created_at: fmtTs(callDate),
  });
};

// Pre-sale calls — structured by deal outcome
// Won deals: 10 calls (discovery, demo, evaluation, negotiation, onboarding, 5x check-in)
// Lost deals: 3-4 calls
// Ghost deals: 1-2 calls
// In-progress: 2-3 calls

const wonCallSequence = ['discovery','demo','evaluation','negotiation','onboarding','check_in','check_in','check_in','check_in','check_in'];
const lostCallSequence = ['discovery','demo','evaluation'];
const ghostCallSequence = ['discovery','demo'];

deals.forEach(deal => {
  const ae = persons.find(p => p.id === deal.owner_id);
  if (!ae) return;
  const contacts = contactsByCompany[deal.company_id] || [];
  let callDate = addDays(new Date(deal.created_at), randInt(1, 5));

  if (deal.status === 'won') {
    // 10 calls in sequence
    for (let i = 0; i < wonCallSequence.length; i++) {
      if (callDate > new Date()) break;
      const callType = wonCallSequence[i];
      const phase = i < 4 ? 'pre_sale' : 'post_sale';
      const hostId = i < 4 ? ae.id : pick(allCSReps).id;
      const callId = addCall(deal.company_id, i < 4 ? deal.id : null, callDate, phase, callType, hostId, contacts, {
        ai_summary: Math.random() < 0.5 ? pick(aiSummaryTemplates) : null,
      });
      const numInputs = callType === 'discovery' ? randInt(20, 40)
        : callType === 'evaluation' ? randInt(5, 15)
        : callType === 'demo' ? randInt(3, 8)
        : callType === 'check_in' ? randInt(1, 3)
        : randInt(1, 3);
      for (let k = 0; k < numInputs; k++) {
        const types = i < 4 ? preSaleInputTypes : postSaleInputTypes;
        const weights = i < 4 ? preSaleInputWeights : postSaleInputWeights;
        addRawInput(callId, deal.company_id, wpick(types, weights), callDate, i >= 4);
      }
      callDate = addDays(callDate, randInt(5, 25));
    }
  } else if (deal.status === 'lost') {
    const numCalls = randInt(3, 4);
    for (let i = 0; i < numCalls; i++) {
      if (callDate > new Date()) break;
      if (deal.closed_at && callDate > new Date(deal.closed_at)) break;
      const callType = lostCallSequence[i] || 'evaluation';
      const callId = addCall(deal.company_id, deal.id, callDate, 'pre_sale', callType, ae.id, contacts);
      const numInputs = callType === 'discovery' ? randInt(20, 40) : callType === 'demo' ? randInt(3, 8) : randInt(5, 15);
      for (let k = 0; k < numInputs; k++) {
        addRawInput(callId, deal.company_id, wpick(preSaleInputTypes, preSaleInputWeights), callDate, false);
      }
      callDate = addDays(callDate, randInt(5, 18));
    }
  } else if (deal.status === 'ghost') {
    const numCalls = randInt(1, 2);
    for (let i = 0; i < numCalls; i++) {
      if (callDate > new Date()) break;
      const callType = ghostCallSequence[i] || 'discovery';
      const callId = addCall(deal.company_id, deal.id, callDate, 'pre_sale', callType, ae.id, contacts);
      const numInputs = randInt(2, 6);
      for (let k = 0; k < numInputs; k++) {
        addRawInput(callId, deal.company_id, wpick(preSaleInputTypes, preSaleInputWeights), callDate, false);
      }
      callDate = addDays(callDate, randInt(5, 18));
    }
  } else if (deal.status === 'in_progress') {
    const numCalls = randInt(2, 3);
    for (let i = 0; i < numCalls; i++) {
      if (callDate > new Date()) break;
      const callType = ['discovery','demo','evaluation'][i] || 'discovery';
      const callId = addCall(deal.company_id, deal.id, callDate, 'pre_sale', callType, ae.id, contacts);
      const numInputs = callType === 'discovery' ? randInt(20, 40) : randInt(3, 8);
      for (let k = 0; k < numInputs; k++) {
        addRawInput(callId, deal.company_id, wpick(preSaleInputTypes, preSaleInputWeights), callDate, false);
      }
      callDate = addDays(callDate, randInt(5, 18));
    }
  }
});

// 3 customers going dark — no calls >60 days, renewal ≤30 days
const activeRenewalDeals = deals.filter(d => d.deal_type === 'renewal' && d.status === 'in_progress');
const goingDarkDeals = activeRenewalDeals.slice(0, 3);
// Ensure their last call is >60 days ago (by not adding recent calls — already handled by above logic)

// ~20 future scheduled calls (next 14 days) with prep_notes
for (let i = 0; i < 20; i++) {
  const co = pick(prospectCustomerCompanies);
  const contacts = contactsByCompany[co.id] || [];
  const scheduledDate = addDays(new Date(), randInt(1, 14));
  const ae = pick(activeAEs);
  addCall(co.id, null, scheduledDate, 'pre_sale', pick(['discovery','demo','check_in']), ae.id, contacts, {
    scheduled_at: fmtTs(scheduledDate),
    prep_notes: pick(prepNotesTemplates),
    ai_summary: null,
  });
}

// ─── SATISFACTION SCORES ──────────────────────────────────────────────────────

const satisfactionScores = [];

// For each active subscription, generate ~1 score per month
subscriptions.forEach(sub => {
  const startDate = new Date(sub.started_at);
  const endDate = sub.ended_at ? new Date(sub.ended_at) : new Date();
  let curMonth = new Date(startDate);
  curMonth.setDate(15); // mid-month

  // Company base score variance
  const companyVariance = randFloat(-0.3, 0.3);

  while (curMonth <= endDate) {
    // Overall trend: declining from 4.2 to 3.8 over last 6 months
    const daysFromNow = Math.round((new Date() - curMonth) / (1000 * 60 * 60 * 24));
    let baseScore;
    if (daysFromNow <= 180) {
      // Linear decline from 4.2 to 3.8 over 180 days
      baseScore = 3.8 + (daysFromNow / 180) * 0.4;
    } else {
      baseScore = 4.2;
    }

    const score = Math.min(5.0, Math.max(1.0, baseScore + companyVariance + randFloat(-0.3, 0.3)));

    satisfactionScores.push({
      id: uuid(),
      company_id: sub.company_id,
      score: Math.round(score * 10) / 10,
      recorded_at: fmtDate(curMonth),
    });

    curMonth = new Date(curMonth);
    curMonth.setMonth(curMonth.getMonth() + 1);
  }
});

// ─── WRITE CSV FILES ──────────────────────────────────────────────────────────

const outDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tables = {
  companies,
  persons,
  calls,
  call_attendees: callAttendees,
  raw_inputs: rawInputs,
  deals,
  deal_stage_history: dealStageHistory,
  subscriptions,
  themes,
  use_cases: useCases,
  features,
  improvements,
  satisfaction_scores: satisfactionScores,
};

let total = 0;
for (const [name, rows] of Object.entries(tables)) {
  fs.writeFileSync(path.join(outDir, `${name}.csv`), toCSV(rows), 'utf8');
  console.log(`  ${name}.csv — ${rows.length} rows`);
  total += rows.length;
}
console.log(`\n  Total: ${total} rows across ${Object.keys(tables).length} tables`);

// ─── WRITE POSTGRES SQL ───────────────────────────────────────────────────────

const DDL = `
-- ============================================================
-- Sales Dashboard — PostgreSQL Schema + Seed Data (v2 scaled)
-- ============================================================

DROP TABLE IF EXISTS satisfaction_scores   CASCADE;
DROP TABLE IF EXISTS deal_stage_history    CASCADE;
DROP TABLE IF EXISTS call_attendees        CASCADE;
DROP TABLE IF EXISTS raw_inputs            CASCADE;
DROP TABLE IF EXISTS subscriptions         CASCADE;
DROP TABLE IF EXISTS calls                 CASCADE;
DROP TABLE IF EXISTS deals                 CASCADE;
DROP TABLE IF EXISTS improvements          CASCADE;
DROP TABLE IF EXISTS features              CASCADE;
DROP TABLE IF EXISTS use_cases             CASCADE;
DROP TABLE IF EXISTS themes                CASCADE;
DROP TABLE IF EXISTS persons               CASCADE;
DROP TABLE IF EXISTS companies             CASCADE;

CREATE TABLE companies (
  id             VARCHAR(36)  PRIMARY KEY,
  name           VARCHAR(255) NOT NULL,
  type           VARCHAR(50)  NOT NULL,
  industry       VARCHAR(100),
  country        VARCHAR(100),
  employee_count INTEGER,
  website        VARCHAR(255),
  logo_url       VARCHAR(500),
  created_at     TIMESTAMP    NOT NULL
);

CREATE TABLE persons (
  id         VARCHAR(36)  PRIMARY KEY,
  company_id VARCHAR(36)  NOT NULL,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255),
  role       VARCHAR(50)  NOT NULL,
  created_at TIMESTAMP    NOT NULL,
  left_at    TIMESTAMP
);

CREATE TABLE themes (
  id          VARCHAR(36)  PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE use_cases (
  id          VARCHAR(36)  PRIMARY KEY,
  theme_id    VARCHAR(36)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT
);

CREATE TABLE features (
  id          VARCHAR(36)  PRIMARY KEY,
  use_case_id VARCHAR(36)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  status      VARCHAR(50)  NOT NULL,
  shipped_at  DATE
);

CREATE TABLE improvements (
  id              VARCHAR(36)  PRIMARY KEY,
  feature_id      VARCHAR(36),
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  status          VARCHAR(50)  NOT NULL,
  is_blocking     BOOLEAN      NOT NULL DEFAULT false,
  priority        VARCHAR(50),
  raw_input_count INTEGER,
  created_at      TIMESTAMP    NOT NULL,
  updated_at      TIMESTAMP    NOT NULL
);

CREATE TABLE deals (
  id               VARCHAR(36) PRIMARY KEY,
  company_id       VARCHAR(36) NOT NULL,
  owner_id         VARCHAR(36) NOT NULL,
  deal_type        VARCHAR(50) NOT NULL,
  status           VARCHAR(50) NOT NULL,
  stage            VARCHAR(50),
  deal_value_usd   INTEGER,
  lost_reason      VARCHAR(50),
  previous_deal_id VARCHAR(36),
  sub_status       VARCHAR(50),
  win_reason       VARCHAR(50),
  key_learning     TEXT,
  follow_up_action TEXT,
  created_at       TIMESTAMP   NOT NULL,
  closed_at        TIMESTAMP,
  follow_up_at     DATE
);

CREATE TABLE deal_stage_history (
  id         VARCHAR(36) PRIMARY KEY,
  deal_id    VARCHAR(36) NOT NULL,
  stage      VARCHAR(50) NOT NULL,
  entered_at TIMESTAMP   NOT NULL,
  exited_at  TIMESTAMP
);

CREATE TABLE calls (
  id           VARCHAR(36) PRIMARY KEY,
  company_id   VARCHAR(36) NOT NULL,
  deal_id      VARCHAR(36),
  call_date    DATE        NOT NULL,
  duration_min INTEGER,
  phase        VARCHAR(50) NOT NULL,
  type         VARCHAR(50) NOT NULL,
  notes        TEXT,
  scheduled_at TIMESTAMP,
  prep_notes   TEXT,
  ai_summary   TEXT
);

CREATE TABLE call_attendees (
  call_id   VARCHAR(36) NOT NULL,
  person_id VARCHAR(36) NOT NULL,
  role      VARCHAR(50) NOT NULL,
  PRIMARY KEY (call_id, person_id)
);

CREATE TABLE raw_inputs (
  id             VARCHAR(36) PRIMARY KEY,
  company_id     VARCHAR(36) NOT NULL,
  call_id        VARCHAR(36),
  improvement_id VARCHAR(36),
  competitor_id  VARCHAR(36),
  input_type     VARCHAR(50) NOT NULL,
  source         VARCHAR(50) NOT NULL,
  direction      VARCHAR(50) NOT NULL,
  is_blocking    BOOLEAN     NOT NULL DEFAULT false,
  priority       VARCHAR(50),
  status         VARCHAR(50),
  description    TEXT,
  resolved_at    TIMESTAMP,
  created_at     TIMESTAMP   NOT NULL
);

CREATE TABLE subscriptions (
  id              VARCHAR(36)  PRIMARY KEY,
  company_id      VARCHAR(36)  NOT NULL,
  deal_id         VARCHAR(36)  NOT NULL,
  plan_name       VARCHAR(100) NOT NULL,
  mrr_usd         INTEGER      NOT NULL,
  billing_cycle   VARCHAR(50)  NOT NULL,
  term_months     INTEGER      NOT NULL,
  started_at      DATE         NOT NULL,
  ended_at        DATE,
  churn_reason    VARCHAR(50),
  product_version VARCHAR(10)
);

CREATE TABLE satisfaction_scores (
  id          VARCHAR(36)   PRIMARY KEY,
  company_id  VARCHAR(36)   NOT NULL,
  score       DECIMAL(2,1)  NOT NULL,
  recorded_at DATE          NOT NULL
);
`;

const sqlVal = (v) => {
  if (v === null || v === undefined || v === '') return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(v);
  if (v === 'true') return 'TRUE';
  if (v === 'false') return 'FALSE';
  return `'${String(v).replace(/'/g, "''")}'`;
};

const toInserts = (tableName, rows, batchSize = 100) => {
  if (!rows.length) return '';
  const colKeys = Object.keys(rows[0]);
  const cols = colKeys.join(', ');
  const chunks = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const vals = batch.map(r => `(${colKeys.map(k => sqlVal(r[k])).join(', ')})`).join(',\n  ');
    chunks.push(`INSERT INTO ${tableName} (${cols})\nVALUES\n  ${vals};`);
  }
  return chunks.join('\n\n');
};

const insertOrder = [
  ['companies',            companies],
  ['persons',              persons],
  ['themes',               themes],
  ['use_cases',            useCases],
  ['features',             features],
  ['improvements',         improvements],
  ['deals',                deals],
  ['deal_stage_history',   dealStageHistory],
  ['calls',                calls],
  ['call_attendees',       callAttendees],
  ['raw_inputs',           rawInputs],
  ['subscriptions',        subscriptions],
  ['satisfaction_scores',  satisfactionScores],
];

const sqlParts = [DDL];
for (const [name, rows] of insertOrder) {
  sqlParts.push(`\n-- ${name} (${rows.length} rows)\n${toInserts(name, rows)}`);
}

const sqlPath = path.join(__dirname, 'postgres.sql');
fs.writeFileSync(sqlPath, sqlParts.join('\n'), 'utf8');
const sqlKb = Math.round(fs.statSync(sqlPath).size / 1024);
console.log(`  postgres.sql — ${sqlKb} KB`);
console.log('  Done. CSVs written to ../data/');
