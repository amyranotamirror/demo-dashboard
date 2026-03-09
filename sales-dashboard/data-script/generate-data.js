#!/usr/bin/env node
// Sales Dashboard — Seed Data Generator
// Run: node generate.js
// Outputs: one CSV per table in ../data/
//
// Story baked in:
//   - Enterprise SSO via SAML is the #1 deal blocker (shows in Market Signals)
//   - Excel export is the most-requested feature (18 raw inputs)
//   - Metabase is the most-mentioned competitor
//   - Column masking recently shipped → follow-up needed (Promise Tracker)
//   - Pipeline bottleneck at "validating" stage
//   - 4–5 at-risk customers with no contact in 90+ days
//   - Sarah Chen (AE) departed at month 30 → visible win rate dip

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
// All dates shift forward from DATE_GENERATED so the demo never looks stale.

const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const daysAgo = (n) => addDays(new Date(), -n);
const fmtDate = (d) => new Date(d).toISOString().slice(0, 10);
const fmtTs = (d) => new Date(d).toISOString().replace('T', ' ').slice(0, 19);

// ─── RANDOM HELPERS ───────────────────────────────────────────────────────────

const uuid = () => crypto.randomUUID();
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
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

// ─── PRODUCT TAXONOMY ─────────────────────────────────────────────────────────

const themes = [
  { id: uuid(), name: 'Collaboration',   description: 'Working together on data and dashboards' },
  { id: uuid(), name: 'Data Governance', description: 'Controlling who sees what data and when' },
  { id: uuid(), name: 'Reporting Speed', description: 'Making reports and dashboards load faster' },
  { id: uuid(), name: 'Integrations',    description: 'Connecting to warehouses, tools, and external APIs' },
  { id: uuid(), name: 'Administration',  description: 'User management, security, and compliance' },
];
const tid = (name) => themes.find(t => t.name === name).id;

const useCases = [
  { id: uuid(), theme_id: tid('Collaboration'),   name: 'External sharing',     description: 'Share dashboards outside the organization' },
  { id: uuid(), theme_id: tid('Collaboration'),   name: 'Team workspaces',      description: 'Organize content by team or project' },
  { id: uuid(), theme_id: tid('Data Governance'), name: 'Column-level access',  description: 'Restrict access to sensitive columns' },
  { id: uuid(), theme_id: tid('Data Governance'), name: 'Row-level security',   description: 'Restrict visible rows per user or role' },
  { id: uuid(), theme_id: tid('Reporting Speed'), name: 'Query caching',        description: 'Cache results to speed up repeated queries' },
  { id: uuid(), theme_id: tid('Reporting Speed'), name: 'Pre-aggregation',      description: 'Pre-compute heavy aggregates at refresh time' },
  { id: uuid(), theme_id: tid('Integrations'),    name: 'Warehouse connectors', description: 'Native connections to major data warehouses' },
  { id: uuid(), theme_id: tid('Integrations'),    name: 'API & embedding',      description: 'Embed dashboards and access data via API' },
  { id: uuid(), theme_id: tid('Administration'),  name: 'SSO & authentication', description: 'Single sign-on and enterprise authentication' },
  { id: uuid(), theme_id: tid('Administration'),  name: 'Audit & compliance',   description: 'Track user actions for security and compliance' },
];
const ucid = (name) => useCases.find(u => u.name === name).id;

const features = [
  { id: uuid(), use_case_id: ucid('External sharing'),     name: 'Public dashboard links',     description: 'Share a read-only dashboard with anyone via a link', status: 'shipped',        shipped_at: fmtDate(daysAgo(210)) },
  { id: uuid(), use_case_id: ucid('External sharing'),     name: 'Password-protected embeds',  description: 'Require a password to view an embedded dashboard',   status: 'shipped',        shipped_at: fmtDate(daysAgo(107)) },
  { id: uuid(), use_case_id: ucid('External sharing'),     name: 'White-label embedding',      description: 'Remove Holistics branding from embedded dashboards', status: 'planned',        shipped_at: null },
  { id: uuid(), use_case_id: ucid('Team workspaces'),      name: 'Shared folders',             description: 'Organize dashboards into team-accessible folders',   status: 'shipped',        shipped_at: fmtDate(daysAgo(330)) },
  { id: uuid(), use_case_id: ucid('Team workspaces'),      name: 'Dashboard templates',        description: 'Pre-built starter templates for common analytics',   status: 'in_development', shipped_at: null },
  { id: uuid(), use_case_id: ucid('Column-level access'),  name: 'Column masking',             description: 'Hide raw PII columns from analyst-level users',     status: 'shipped',        shipped_at: fmtDate(daysAgo(36)) },
  { id: uuid(), use_case_id: ucid('Column-level access'),  name: 'Column-level permissions',   description: 'Grant individual-level access to specific columns',  status: 'planned',        shipped_at: null },
  { id: uuid(), use_case_id: ucid('Row-level security'),   name: 'Dynamic row-level security', description: 'Filter rows based on user identity at query time',   status: 'shipped',        shipped_at: fmtDate(daysAgo(213)) },
  { id: uuid(), use_case_id: ucid('Row-level security'),   name: 'User attribute filters',     description: 'Parameterize RLS rules using user profile attributes',status: 'shipped',        shipped_at: fmtDate(daysAgo(156)) },
  { id: uuid(), use_case_id: ucid('Query caching'),        name: 'Smart query caching',        description: 'Cache query results and invalidate on data refresh',  status: 'shipped',        shipped_at: fmtDate(daysAgo(295)) },
  { id: uuid(), use_case_id: ucid('Pre-aggregation'),      name: 'Pre-built aggregates',       description: 'Pre-compute complex aggregates at pipeline run time', status: 'in_development', shipped_at: null },
  { id: uuid(), use_case_id: ucid('Warehouse connectors'), name: 'BigQuery connector',         description: 'Native connection to Google BigQuery',               status: 'shipped',        shipped_at: fmtDate(daysAgo(430)) },
  { id: uuid(), use_case_id: ucid('Warehouse connectors'), name: 'Snowflake connector',        description: 'Native connection to Snowflake',                     status: 'shipped',        shipped_at: fmtDate(daysAgo(430)) },
  { id: uuid(), use_case_id: ucid('Warehouse connectors'), name: 'Redshift connector',         description: 'Native connection to Amazon Redshift',               status: 'shipped',        shipped_at: fmtDate(daysAgo(370)) },
  { id: uuid(), use_case_id: ucid('API & embedding'),      name: 'Embedding SDK',              description: 'Embed Holistics dashboards in external products',    status: 'shipped',        shipped_at: fmtDate(daysAgo(248)) },
  { id: uuid(), use_case_id: ucid('API & embedding'),      name: 'REST API',                   description: 'Programmatic access to reports and data',            status: 'planned',        shipped_at: null },
  { id: uuid(), use_case_id: ucid('SSO & authentication'), name: 'SAML 2.0 integration',       description: 'Enterprise SSO via SAML for IT-gated accounts',     status: 'in_development', shipped_at: null },
  { id: uuid(), use_case_id: ucid('Audit & compliance'),   name: 'User activity log',          description: 'Audit trail of user actions for compliance',         status: 'shipped',        shipped_at: fmtDate(daysAgo(186)) },
];
const fid = (name) => features.find(f => f.name === name).id;

const improvements = [
  { id: uuid(), feature_id: fid('SAML 2.0 integration'),      title: 'Enterprise SSO via SAML for IT-gated accounts',              description: 'Enterprise customers require SAML SSO as a hard IT requirement before they can approve Holistics. Blocking 4 active deals.',    status: 'planned',   is_blocking: true,  raw_input_count: 14, created_at: fmtTs(daysAgo(217)), updated_at: fmtTs(daysAgo(66))  },
  { id: uuid(), feature_id: fid('Column masking'),             title: 'Mask PII columns by role (email, phone, national ID)',       description: 'Customers handling regulated data need to hide raw PII from analysts. Column masking shipped — follow up with accounts.',          status: 'shipped',   is_blocking: false, raw_input_count: 9,  created_at: fmtTs(daysAgo(173)), updated_at: fmtTs(daysAgo(36))  },
  { id: uuid(), feature_id: fid('Embedding SDK'),              title: 'Embed dashboards without requiring a Holistics login',       description: 'SaaS customers want to embed dashboards in their own products without end-users needing a Holistics account.',                     status: 'planned',   is_blocking: true,  raw_input_count: 8,  created_at: fmtTs(daysAgo(187)), updated_at: fmtTs(daysAgo(53))  },
  { id: uuid(), feature_id: fid('Dynamic row-level security'), title: 'Multi-tenant RLS — each client sees only their own data',    description: 'SaaS companies need per-tenant row filtering in embedded analytics. Shipped — follow up with pre-sale contacts.',                  status: 'shipped',   is_blocking: false, raw_input_count: 11, created_at: fmtTs(daysAgo(309)), updated_at: fmtTs(daysAgo(156)) },
  { id: uuid(), feature_id: fid('Column-level permissions'),   title: 'User-level column grants, independent of role',             description: 'Grant a specific individual access to a sensitive column without promoting their entire role.',                                   status: 'planned',   is_blocking: false, raw_input_count: 5,  created_at: fmtTs(daysAgo(157)), updated_at: fmtTs(daysAgo(66))  },
  { id: uuid(), feature_id: fid('REST API'),                   title: 'Trigger cache refresh via API after pipeline runs',         description: 'Data teams want to invalidate the cache via API after dbt or Airflow pipelines complete.',                                       status: 'open',      is_blocking: false, raw_input_count: 7,  created_at: fmtTs(daysAgo(97)),  updated_at: fmtTs(daysAgo(97))  },
  { id: uuid(), feature_id: fid('White-label embedding'),      title: 'Remove Holistics branding from embedded dashboards',        description: 'Customers embedding dashboards in their own products need logos and domain hidden for brand consistency.',                          status: 'open',      is_blocking: true,  raw_input_count: 6,  created_at: fmtTs(daysAgo(143)), updated_at: fmtTs(daysAgo(143)) },
  { id: uuid(), feature_id: fid('Dashboard templates'),        title: 'Pre-built starter templates for SaaS and fintech',          description: 'New customers struggle to build their first dashboard from scratch. Curated templates shorten time-to-value.',                   status: 'planned',   is_blocking: false, raw_input_count: 8,  created_at: fmtTs(daysAgo(173)), updated_at: fmtTs(daysAgo(66))  },
  { id: uuid(), feature_id: null,                              title: 'Excel / CSV export from any report or table',               description: 'The single most common ask from finance and ops teams. One-click export to Excel or CSV. Currently requires an API workaround.', status: 'open',      is_blocking: true,  raw_input_count: 18, created_at: fmtTs(daysAgo(247)), updated_at: fmtTs(daysAgo(53))  },
  { id: uuid(), feature_id: null,                              title: 'Scheduled email delivery for individual reports',           description: 'Schedule a single report as a PDF or CSV on a daily/weekly cadence — not just full dashboard snapshots.',                        status: 'open',      is_blocking: false, raw_input_count: 9,  created_at: fmtTs(daysAgo(203)), updated_at: fmtTs(daysAgo(66))  },
  { id: uuid(), feature_id: fid('Pre-built aggregates'),       title: 'Pre-aggregate multi-join P&L reports for finance teams',    description: 'Finance P&L dashboards with 5+ joined tables time out at scale. Pre-aggregation makes them usable for month-end reporting.',        status: 'planned',   is_blocking: true,  raw_input_count: 6,  created_at: fmtTs(daysAgo(157)), updated_at: fmtTs(daysAgo(83))  },
  { id: uuid(), feature_id: null,                              title: 'Git sync support for GitLab repositories',                  description: 'Several customers use GitLab, not GitHub. Current git sync only works with GitHub.',                                              status: 'deferred',  is_blocking: false, raw_input_count: 4,  created_at: fmtTs(daysAgo(277)), updated_at: fmtTs(daysAgo(187)) },
];

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

// Competitor ID lookup and weighted picks
const compById = {};
competitorDefs.forEach(c => { compById[c.name] = c.id; });
const COMPETITOR_PICK_LIST = [
  'Metabase','Tableau','Power BI','Looker','Sigma','Redash','Apache Superset','Qlik','Sisense',
  'Mode','Domo','ThoughtSpot','MicroStrategy','Grafana','Retool','Observable','Hex','Lightdash','GoodData','Omni',
];
const COMPETITOR_WEIGHTS = [25, 18, 15, 12, 8, 5, 5, 4, 3, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5];
const pickCompetitor = () => compById[wpick(COMPETITOR_PICK_LIST, COMPETITOR_WEIGHTS)];

// Real named companies from spec (seeded exactly)
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

// Generated prospect/customer companies to fill up to ~300
const generatedProspects = [
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
].map(p => ({ ...p, id: uuid(), type: 'prospect', logo_url: `https://logo.clearbit.com/${p.website}` }));

// Assign created_at for each named/generated company spanning 4 years
const baseCreatedAt = (minsBack) => fmtTs(daysAgo(minsBack));

const realNamedCompanies = realNamedDefs.map(c => ({
  id: uuid(),
  name: c.name,
  type: c.type,
  industry: c.industry,
  country: c.country,
  employee_count: c.employee_count,
  website: c.website,
  logo_url: `https://logo.clearbit.com/${c.website}`,
  created_at: baseCreatedAt(randInt(900, 1460)),
}));

const generatedProspectCompanies = generatedProspects.map(p => ({
  ...p,
  created_at: baseCreatedAt(randInt(200, 1100)),
}));

const companies = [
  { id: HOLISTICS_ID, name: 'Holistics', type: 'internal', industry: 'SaaS', country: 'Singapore', employee_count: 80, website: 'holistics.io', logo_url: 'https://logo.clearbit.com/holistics.io', created_at: fmtTs(daysAgo(1460)) },
  ...competitorDefs.map(c => ({
    id: c.id, name: c.name, type: 'competitor', industry: 'SaaS', country: 'USA', employee_count: randInt(100, 3000),
    website: c.website, logo_url: `https://logo.clearbit.com/${c.website}`, created_at: fmtTs(daysAgo(1460)),
  })),
  ...realNamedCompanies,
  ...generatedProspectCompanies,
];

const prospectCustomerCompanies = companies.filter(c => c.type === 'prospect' || c.type === 'customer');

// ─── PERSONS — INTERNAL TEAM ──────────────────────────────────────────────────
// Sarah Chen departs at month ~30 (≈900 days ago). Model turnover.

const SARAH_LEFT_AT = daysAgo(550); // month 30 from 4 years ago ≈ 18 months ago

const internalTeam = [
  // AEs
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Sarah Chen',         email: 'sarah.chen@holistics.io',         role: 'ae',           created_at: fmtTs(daysAgo(1400)), left_at: fmtTs(SARAH_LEFT_AT) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Mike Torres',        email: 'mike.torres@holistics.io',        role: 'ae',           created_at: fmtTs(daysAgo(1400)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Priya Patel',        email: 'priya.patel@holistics.io',        role: 'ae',           created_at: fmtTs(daysAgo(1000)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'James Wilson',       email: 'james.wilson@holistics.io',       role: 'ae',           created_at: fmtTs(daysAgo(420)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Rachel Lee',         email: 'rachel.lee@holistics.io',         role: 'ae',           created_at: fmtTs(addDays(SARAH_LEFT_AT, 18)), left_at: null }, // Sarah's replacement
  // CS reps
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Alex Kim',           email: 'alex.kim@holistics.io',           role: 'cs_rep',       created_at: fmtTs(daysAgo(1400)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Lisa Nguyen',        email: 'lisa.nguyen@holistics.io',        role: 'cs_rep',       created_at: fmtTs(daysAgo(800)),  left_at: null },
  // Manager & BizOps (stable)
  { id: uuid(), company_id: HOLISTICS_ID, name: 'David Park',         email: 'david.park@holistics.io',         role: 'manager',      created_at: fmtTs(daysAgo(1460)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Emma Rodriguez',     email: 'emma.rodriguez@holistics.io',     role: 'bizops',       created_at: fmtTs(daysAgo(1460)), left_at: null },
  // Product Managers (10, with turnover)
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Nina Kaur',          email: 'nina.kaur@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(1400)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Tom Zhang',          email: 'tom.zhang@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(1400)), left_at: fmtTs(daysAgo(900)) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Ana Reyes',          email: 'ana.reyes@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(870)),  left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Ben Malik',          email: 'ben.malik@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(1200)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Chloe Tan',          email: 'chloe.tan@holistics.io',          role: 'product',      created_at: fmtTs(daysAgo(1100)), left_at: fmtTs(daysAgo(500)) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Omar Farouk',        email: 'omar.farouk@holistics.io',        role: 'product',      created_at: fmtTs(daysAgo(470)),  left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Saya Inoue',         email: 'saya.inoue@holistics.io',         role: 'product',      created_at: fmtTs(daysAgo(1050)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Ivan Petrov',        email: 'ivan.petrov@holistics.io',        role: 'product',      created_at: fmtTs(daysAgo(750)),  left_at: fmtTs(daysAgo(200)) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Mei Lin',            email: 'mei.lin@holistics.io',            role: 'product',      created_at: fmtTs(daysAgo(170)),  left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Carlos Vega',        email: 'carlos.vega@holistics.io',        role: 'product',      created_at: fmtTs(daysAgo(600)),  left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Aisha Bello',        email: 'aisha.bello@holistics.io',        role: 'product',      created_at: fmtTs(daysAgo(350)),  left_at: null },
  // Data Analysts (4, with turnover)
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Wei Tan',            email: 'wei.tan@holistics.io',            role: 'data_analyst', created_at: fmtTs(daysAgo(1300)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Sophie Müller',      email: 'sophie.muller@holistics.io',      role: 'data_analyst', created_at: fmtTs(daysAgo(1300)), left_at: fmtTs(daysAgo(700)) },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Jake Osei',          email: 'jake.osei@holistics.io',          role: 'data_analyst', created_at: fmtTs(daysAgo(670)),  left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Priscilla Santos',   email: 'priscilla.santos@holistics.io',   role: 'data_analyst', created_at: fmtTs(daysAgo(900)),  left_at: null },
  // CEO & CTO (stable)
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Marcus Heng',        email: 'marcus.heng@holistics.io',        role: 'ceo',          created_at: fmtTs(daysAgo(1460)), left_at: null },
  { id: uuid(), company_id: HOLISTICS_ID, name: 'Liang Wei',          email: 'liang.wei@holistics.io',          role: 'cto',          created_at: fmtTs(daysAgo(1460)), left_at: null },
];

const activeAEs    = internalTeam.filter(p => p.role === 'ae'           && !p.left_at);
const allAEs       = internalTeam.filter(p => p.role === 'ae');
const allCSReps    = internalTeam.filter(p => p.role === 'cs_rep'       && !p.left_at);
const allPMs       = internalTeam.filter(p => p.role === 'product'      && !p.left_at);
const allDAs       = internalTeam.filter(p => p.role === 'data_analyst' && !p.left_at);
const CEO          = internalTeam.find(p => p.role === 'ceo');
const CTO          = internalTeam.find(p => p.role === 'cto');

// Helper: pick AE who was active at a given date
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
    const leftAt = Math.random() < 0.05 ? fmtTs(addDays(new Date(co.created_at), randInt(200, 900))) : null;
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

const deals = [];
const dealStageHistory = [];
const subscriptions = [];

// Stage duration ranges (days)
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
    // Full or partial funnel ending at negotiating
    const endIdx = randInt(2, 4); // up to negotiating
    stagesPath = DEAL_STAGES.slice(0, endIdx + 1);
  } else if (status === 'lost' || status === 'churned') {
    const dropIdx = randInt(0, 3);
    stagesPath = DEAL_STAGES.slice(0, dropIdx + 1);
  } else {
    // in_progress or ghost: path up to currentStage
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

// Track won deals per company for subscription/renewal chaining
const companyWonDeals = {}; // companyId → [{dealId, closedAt, dealValue}]
const wonDealMap = {};      // dealId → deal object

const companyPool = [...prospectCustomerCompanies];
let cIdx = 0;
const nextCo = () => companyPool[cIdx++ % companyPool.length];

// Cohort helper
const cohortDate = (minDays, maxDays) => daysAgo(randInt(minDays, maxDays));

// Distribution matching spec (~700 deals)
const distConfig = [
  { deal_type: 'new', status: 'won',         count: 130 },
  { deal_type: 'new', status: 'lost',        count: 160 },
  { deal_type: 'new', status: 'ghost',       count: 40  },
  { deal_type: 'new', status: 'in_progress', count: 25  },
  { deal_type: 'upgrade',  status: 'won',         count: 55  },
  { deal_type: 'upgrade',  status: 'lost',        count: 20  },
  { deal_type: 'upgrade',  status: 'in_progress', count: 10  },
  { deal_type: 'downgrade',status: 'won',         count: 30  },
  { deal_type: 'renewal',  status: 'won',         count: 130 },
  { deal_type: 'renewal',  status: 'churned',     count: 50  },
  { deal_type: 'renewal',  status: 'in_progress', count: 30  },
  { deal_type: 'renewal',  status: 'lost',        count: 20  },
];

// First pass: new deals (generates companies to link upgrades/renewals to)
for (const dist of distConfig) {
  if (dist.deal_type !== 'new') continue;
  for (let i = 0; i < dist.count; i++) {
    const co = nextCo();
    const dealId = uuid();
    let createdAt, closedAt = null, stage = null, lostReason = null, followUpAt = null;

    if (dist.status === 'won') {
      // Spread across 4-year cohorts
      const cohortBucket = i % 6;
      const [minD, maxD] = [[1380,1460],[1080,1380],[540,1080],[180,540],[60,180],[7,60]][cohortBucket];
      createdAt = cohortDate(minD, maxD);
      closedAt  = addDays(createdAt, randInt(21, 90));
      if (!companyWonDeals[co.id]) companyWonDeals[co.id] = [];
    } else if (dist.status === 'lost') {
      const cohortBucket = i % 4;
      const [minD, maxD] = [[1080,1460],[540,1080],[180,540],[30,180]][cohortBucket];
      createdAt = cohortDate(minD, maxD);
      closedAt  = addDays(createdAt, randInt(15, 75));
      lostReason = wpick(lostReasons, lostWeights);
    } else if (dist.status === 'ghost') {
      createdAt = cohortDate(50, 200);
      stage = pick(['qualifying','validating']);
      if (Math.random() < 0.30) followUpAt = fmtDate(addDays(createdAt, randInt(60, 180)));
    } else {
      // in_progress
      createdAt = cohortDate(7, 120);
      stage = wpick(DEAL_STAGES, [20, 30, 25, 15, 10]);
      if (Math.random() < 0.10) followUpAt = fmtDate(addDays(new Date(), randInt(14, 90)));
    }

    const ae = pickAEForDate(createdAt);
    const dealValue = wpick(dealValues, dealValueWeights);

    const deal = {
      id: dealId,
      company_id: co.id,
      owner_id: ae.id,
      deal_type: 'new',
      status: dist.status,
      stage: stage || (dist.status === 'won' ? 'negotiating' : dist.status === 'lost' || dist.status === 'churned' ? null : stage),
      deal_value_usd: dealValue,
      lost_reason: lostReason || null,
      previous_deal_id: null,
      created_at: fmtTs(createdAt),
      closed_at: closedAt ? fmtTs(closedAt) : null,
      follow_up_at: followUpAt,
    };
    deals.push(deal);
    dealStageHistory.push(...buildStageHistory(dealId, createdAt, closedAt, dist.status, stage));

    if (dist.status === 'won') {
      if (!companyWonDeals[co.id]) companyWonDeals[co.id] = [];
      companyWonDeals[co.id].push({ dealId, companyId: co.id, closedAt, dealValue, ae });
      wonDealMap[dealId] = deal;
      // Update company type
      const co2 = companies.find(c => c.id === co.id);
      if (co2) co2.type = 'customer';
    }
  }
}

// Get list of companies with won deals for linking
const companiesWithWonDeals = Object.keys(companyWonDeals).filter(id => companyWonDeals[id].length > 0);

// Helper: pick a random won deal entry
const pickWonDeal = () => {
  if (!companiesWithWonDeals.length) return null;
  const coId = pick(companiesWithWonDeals);
  return pick(companyWonDeals[coId]);
};

// Second pass: upgrade, downgrade, renewal deals (linked to prior won deals)
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
      // Must be > prior value
      const higherVals = dealValues.filter(v => v > (prior.dealValue || 2400));
      dealValue = higherVals.length ? pick(higherVals) : dealValues[dealValues.length - 1];
    } else if (dist.deal_type === 'downgrade') {
      const lowerVals = dealValues.filter(v => v < (prior.dealValue || 9600));
      dealValue = lowerVals.length ? pick(lowerVals) : dealValues[0];
    }

    if (dist.status === 'won') {
      createdAt = addDays(new Date(prior.closedAt), randInt(30, 400));
      closedAt  = addDays(createdAt, randInt(14, 60));
    } else if (dist.status === 'lost' || dist.status === 'churned') {
      createdAt = addDays(new Date(prior.closedAt), randInt(180, 500));
      closedAt  = addDays(createdAt, randInt(14, 60));
      if (dist.status === 'lost') lostReason = wpick(lostReasons, lostWeights);
    } else {
      // in_progress — upcoming renewals within 60 days for renewals
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

// Ghost-then-return pattern (~15 explicit deals)
const ghostReturnDeals = deals.filter(d => d.status === 'ghost').slice(0, 15);
ghostReturnDeals.forEach(ghostDeal => {
  const followDate = ghostDeal.follow_up_at
    ? new Date(ghostDeal.follow_up_at)
    : addDays(new Date(ghostDeal.created_at), randInt(45, 120));
  if (followDate < new Date()) {
    // Reactivated — create a continuation in_progress or closed deal
    const returnDealId = uuid();
    const reactivatedAt = followDate;
    const outcome = Math.random() < 0.4 ? 'won' : Math.random() < 0.5 ? 'lost' : 'ghost';
    const closedAt2 = outcome !== 'ghost' ? addDays(reactivatedAt, randInt(14, 60)) : null;
    const ae = pickAEForDate(reactivatedAt);

    deals.push({
      id: returnDealId,
      company_id: ghostDeal.company_id,
      owner_id: ae.id,
      deal_type: 'new',
      status: outcome,
      stage: outcome === 'ghost' ? 'qualifying' : null,
      deal_value_usd: ghostDeal.deal_value_usd,
      lost_reason: outcome === 'lost' ? wpick(lostReasons, lostWeights) : null,
      previous_deal_id: ghostDeal.id,
      created_at: fmtTs(reactivatedAt),
      closed_at: closedAt2 ? fmtTs(closedAt2) : null,
      follow_up_at: null,
    });
    dealStageHistory.push(...buildStageHistory(returnDealId, reactivatedAt, closedAt2, outcome, 'qualifying'));

    if (outcome === 'won') {
      if (!companyWonDeals[ghostDeal.company_id]) companyWonDeals[ghostDeal.company_id] = [];
      const wonEntry = { dealId: returnDealId, companyId: ghostDeal.company_id, closedAt: closedAt2, dealValue: ghostDeal.deal_value_usd, ae };
      companyWonDeals[ghostDeal.company_id].push(wonEntry);
      wonDealMap[returnDealId] = deals[deals.length - 1];
      const co = companies.find(c => c.id === ghostDeal.company_id);
      if (co) co.type = 'customer';
    }
  }
});

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

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

// Create subscriptions for all won deals
Object.values(wonDealMap).forEach(deal => {
  const plan = wpick(planOptions, planWeights);
  const startedAt = addDays(new Date(deal.closed_at), 1);
  // Determine if this subscription has ended (linked to churned renewal or ended term)
  const hasChurnedRenewal = deals.some(d => d.previous_deal_id === deal.id && d.status === 'churned');
  let endedAt = null;
  let churnReason = null;

  if (hasChurnedRenewal) {
    endedAt = addDays(startedAt, plan.term_months * 30);
    churnReason = wpick(churnReasons, churnWeights);
  } else {
    // Subscription active if term hasn't elapsed
    const termEnd = addDays(startedAt, plan.term_months * 30);
    if (termEnd < new Date()) {
      // term elapsed — subscription ended, renewal deal should exist
      const hasRenewal = deals.some(d => d.previous_deal_id === deal.id && (d.deal_type === 'renewal' || d.deal_type === 'upgrade'));
      if (!hasRenewal) {
        // No renewal — quietly ended
        endedAt = termEnd;
        churnReason = 'unknown';
      }
      // else: subscription implicitly renewed — keep ended_at null for simplicity
    }
  }

  subscriptions.push({
    id: uuid(),
    company_id: deal.company_id,
    deal_id: deal.id,
    plan_name: plan.plan_name,
    mrr_usd: plan.mrr_usd,
    billing_cycle: plan.billing_cycle,
    term_months: plan.term_months,
    started_at: fmtDate(startedAt),
    ended_at: endedAt ? fmtDate(endedAt) : null,
    churn_reason: churnReason || null,
  });
});

// ─── CALLS + ATTENDEES + RAW INPUTS ───────────────────────────────────────────

const calls = [];
const callAttendees = [];
const rawInputs = [];

const preSaleCallTypes   = ['discovery','demo','evaluation','negotiation'];
const preSaleCallWeights = [30, 30, 25, 15];
const postSaleCallTypes  = ['onboarding','check_in','renewal'];
const postSaleCallWeights = [15, 65, 20];

// Input types per phase (from spec)
const preSaleInputTypes  = ['feature_request','deal_breaker','excitement','feedback','ui_ux','performance','permission','onboarding_issue','testimonial','irrelevant','how_to'];
const preSaleInputWeights = [25, 10, 10, 10, 10, 8, 8, 5, 5, 5, 4];
const postSaleInputTypes  = ['how_to','bug','feature_request','feedback','ui_ux','performance','excitement','testimonial','permission','irrelevant'];
const postSaleInputWeights = [22, 18, 15, 12, 10, 8, 5, 5, 3, 2];

const inputStatuses = ['new','valid','need_inputs','solved','informed','has_workaround','not_relevant','duplicated'];
const inputStatusWeights = [20, 30, 10, 15, 10, 5, 5, 5];
const inputSources = ['call','ticket','email'];
const inputSourceWeights = [65, 25, 10];

const impIds = improvements.map(i => i.id);

const addCall = (companyId, dealId, callDate, phase, callType, hostId, extContacts) => {
  const callId = uuid();
  calls.push({
    id: callId, company_id: companyId, deal_id: dealId || null,
    call_date: fmtDate(callDate), duration_min: pick([30, 45, 60, 90]),
    phase, type: callType, notes: null,
  });
  callAttendees.push({ call_id: callId, person_id: hostId, role: 'host' });

  // Add internal attendees by call type
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

  // External attendees
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

// Pre-sale calls (won + lost + in_progress + ghost)
deals.filter(d => ['won','lost','in_progress','ghost'].includes(d.status)).forEach(deal => {
  const ae = persons.find(p => p.id === deal.owner_id);
  const contacts = contactsByCompany[deal.company_id] || [];
  const numCalls = deal.status === 'ghost' ? randInt(1, 2)
    : deal.status === 'in_progress' ? randInt(2, 4)
    : randInt(3, 5);
  let callDate = addDays(new Date(deal.created_at), randInt(1, 5));

  for (let i = 0; i < numCalls; i++) {
    if (callDate > new Date()) break;
    if (deal.closed_at && callDate > new Date(deal.closed_at)) break;
    const callType = wpick(preSaleCallTypes, preSaleCallWeights);
    const callId = addCall(deal.company_id, deal.id, callDate, 'pre_sale', callType, ae.id, contacts);
    // Input count varies by call type
    const numInputs = callType === 'discovery' ? randInt(20, 40)
      : callType === 'evaluation' ? randInt(5, 15)
      : callType === 'demo' ? randInt(3, 8)
      : randInt(1, 3); // negotiation
    for (let k = 0; k < numInputs; k++) {
      addRawInput(callId, deal.company_id, wpick(preSaleInputTypes, preSaleInputWeights), callDate, false);
    }
    callDate = addDays(callDate, randInt(5, 18));
  }
});

// Post-sale calls for active subscriptions
subscriptions.filter(s => !s.ended_at).forEach(sub => {
  const csRep = pick(allCSReps);
  const contacts = contactsByCompany[sub.company_id] || [];
  const numCalls = randInt(4, 8);
  let callDate = addDays(new Date(sub.started_at), randInt(1, 7));

  for (let i = 0; i < numCalls; i++) {
    if (callDate > new Date()) break;
    const callType = i === 0 ? 'onboarding' : wpick(postSaleCallTypes, postSaleCallWeights);
    const callId = addCall(sub.company_id, null, callDate, 'post_sale', callType, csRep.id, contacts);
    const numInputs = callType === 'check_in' ? randInt(1, 3) : randInt(2, 6);
    for (let k = 0; k < numInputs; k++) {
      addRawInput(callId, sub.company_id, wpick(postSaleInputTypes, postSaleInputWeights), callDate, true);
    }
    callDate = addDays(callDate, randInt(25, 55));
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
};

let total = 0;
for (const [name, rows] of Object.entries(tables)) {
  fs.writeFileSync(path.join(outDir, `${name}.csv`), toCSV(rows), 'utf8');
  console.log(`  ✓ ${name}.csv — ${rows.length} rows`);
  total += rows.length;
}
console.log(`\n  Total: ${total} rows across ${Object.keys(tables).length} tables`);

// ─── WRITE POSTGRES SQL ───────────────────────────────────────────────────────

const DDL = `
-- ============================================================
-- Sales Dashboard — PostgreSQL Schema + Seed Data
-- Paste into https://runsql.com (select PostgreSQL)
-- ============================================================

DROP TABLE IF EXISTS deal_stage_history CASCADE;
DROP TABLE IF EXISTS call_attendees      CASCADE;
DROP TABLE IF EXISTS raw_inputs          CASCADE;
DROP TABLE IF EXISTS subscriptions       CASCADE;
DROP TABLE IF EXISTS calls               CASCADE;
DROP TABLE IF EXISTS deals               CASCADE;
DROP TABLE IF EXISTS improvements        CASCADE;
DROP TABLE IF EXISTS features            CASCADE;
DROP TABLE IF EXISTS use_cases           CASCADE;
DROP TABLE IF EXISTS themes              CASCADE;
DROP TABLE IF EXISTS persons             CASCADE;
DROP TABLE IF EXISTS companies           CASCADE;

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
  notes        TEXT
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
  id            VARCHAR(36)  PRIMARY KEY,
  company_id    VARCHAR(36)  NOT NULL,
  deal_id       VARCHAR(36)  NOT NULL,
  plan_name     VARCHAR(100) NOT NULL,
  mrr_usd       INTEGER      NOT NULL,
  billing_cycle VARCHAR(50)  NOT NULL,
  term_months   INTEGER      NOT NULL,
  started_at    DATE         NOT NULL,
  ended_at      DATE,
  churn_reason  VARCHAR(50)
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
  ['companies',          companies],
  ['persons',            persons],
  ['themes',             themes],
  ['use_cases',          useCases],
  ['features',           features],
  ['improvements',       improvements],
  ['deals',              deals],
  ['deal_stage_history', dealStageHistory],
  ['calls',              calls],
  ['call_attendees',     callAttendees],
  ['raw_inputs',         rawInputs],
  ['subscriptions',      subscriptions],
];

const sqlParts = [DDL];
for (const [name, rows] of insertOrder) {
  sqlParts.push(`\n-- ${name} (${rows.length} rows)\n${toInserts(name, rows)}`);
}

const sqlPath = path.join(__dirname, 'postgres.sql');
fs.writeFileSync(sqlPath, sqlParts.join('\n'), 'utf8');
const sqlKb = Math.round(fs.statSync(sqlPath).size / 1024);
console.log(`  ✓ postgres.sql — ${sqlKb} KB (paste into RunSQL → PostgreSQL)`);
console.log('  Done. CSVs written to ../data/');
