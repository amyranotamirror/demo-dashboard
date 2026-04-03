# Holistics Business Glossary

> Canonical business term definitions from the internal Holistics Business Glossary wiki. These definitions govern how entities, metrics, and concepts are named and interpreted across the dashboard. When the dashboard uses a term, it must align with these definitions.

## Lifecycle Entities

| Term | Type | Context | Definition | Aliases |
|---|---|---|---|---|
| **Visitor** | Entity | Lead | A person that browses Holistics marketing websites anonymously, and has not submitted any PII (like email) in the trial request form | Anonymous visitor |
| **Prospect/Lead** | Entity | Lead | A company that is in trial period, or currently in negotiation. At this stage, they have not had any `active` tenants with us | Lead |
| **Trial Submission** | Entity | Trial & Negotiation | The process where a prospect fills in their information (contact email, company info) into the trial request form. A contact can send multiple trial requests; a company can have multiple from different people | Trial, Trial request |
| **Trial Period** | Concept | Trial & Negotiation | The limited period when the customer initially has access to the Holistics platform. Tenant status: `trial.active` → `trial.expired`. Prospects can request extensions | — |
| **Deal** | Entity | Trial & Negotiation | An arrangement between the customer and Holistics, in terms of the payment amount, payment period, usage allowance | — |
| **Win** | Concept | Customer | The state where the customer and Holistics agreed upon a deal (new logo or upsell). A Won customer has at least 1 won deal | — |
| **Customer** | Entity | Customer | A company that has subscribed to a payment plan (paid or free/partnership). Should have at least one `active` tenant (active customers) or `cancelled` tenant (churned) | Organization, Company, Subscribed Customer |
| **Churn** | Concept | Customer | The process where a subscribed customer stops using Holistics | — |

## Deal Types

| Term | Type | Definition | Notes |
|---|---|---|---|
| **New Logo** | Concept | The first deal signifying the beginning of the customer–Holistics relationship | Customers who churned and return after 180 days (6 months) are reclassified as "new logo" |
| **Upsell** | Concept | A deal where the customer agrees to pay more to increase usage limits (more user seats, worker slots, objects allowance) | — |
| **Downgrade** | Concept | A deal where the customer pays less for lower usage limits (fewer seats, fewer objects) | — |

## Platform & Billing Entities

| Term | Type | Context | Definition | Notes |
|---|---|---|---|---|
| **Tenant** | Entity | Holistics Usage | A Holistics account on the platform. One customer may have multiple tenants | — |
| **Tenant Status** | Concept | Holistics Usage | The state of the customer's tenant: fully enabled (`active`), in trial mode (`trial.active`), or cancelled (`cancelled`). Different from Customer Status | — |
| **Customer Status** | Concept | Customer | Status of the relationship between the customer company and Holistics: **Active** (using product), **Churning** (will cancel next renewal), **Churned** (cancelled, no active account) | Different from Tenant Status |
| **User** | Entity | Holistics Usage | A user account within a Holistics tenant. Identified by email. One email can exist in multiple tenants. Roles: admin, analyst, user (externally called "Viewer"), public (system-generated for share/embed links) | — |
| **Object** | Entity | Holistics Usage | A "unit of currency" for counting platform usage. Different items cost different amounts (e.g., 1 chart = 4 objects, 1 shareable link = 5 objects) | — |
| **Plan** | Entity | Billing | A set of configurations dictating how the customer pays (amount, interval) and how usage is calculated (by objects, worker slots, or user seats). Split into Zoho plan (payment) and Holistics plan (usage restrictions) | — |
| **Subscription** | Entity | Billing | Links the customer with a payment plan. Tells the customer's current status. A customer may have multiple subscriptions if billing separately for child companies | — |
| **Payment Tier** | Concept | Customer | Whether the customer is paying or free: **Paid/Paying** (paying for Holistics) or **Free** (subscribed to `free` plan, limited usage) | — |

## Key Metric

| Term | Type | Context | Definition |
|---|---|---|---|
| **Monthly Recurring Revenue (MRR)** | Metric | Subscription | The amount of revenue expected every month |

## Glossary alignment notes

1. **Customer vs. Tenant vs. User**: These are three distinct levels. A Customer (company) has one or more Tenants (accounts), each containing one or more Users (people). The dashboard's `Company` entity maps to Customer. Customer Status and Tenant Status are deliberately separate — a customer can be "Active" while one of their tenants is "cancelled."

2. **Deal in the glossary vs. Deal in the dashboard**: The glossary defines Deal as a commercial arrangement (payment terms). The dashboard's Deal entity extends this to include lifecycle tracking (stages, calls, raw inputs, outcomes). Both definitions are compatible — the dashboard adds operational context on top of the glossary's commercial definition.

3. **New Logo re-classification rule**: Churned customers who return after 180 days are treated as New Logo deals. This affects win rate calculations — these should be counted as new business, not renewals, in the dashboard's deal type filter.

4. **Object-based usage model**: Holistics bills by "objects" (a unit of platform usage), not just seats. This is relevant for the Customers tab — upsell opportunities may be driven by object count growth, not just user seat growth. The at-risk model should consider object usage trends if that data becomes available.
