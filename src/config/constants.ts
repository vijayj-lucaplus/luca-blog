import type { CategoryInfo, CategorySlug, TargetProduct } from '@/types/blog';

/** Static brand/site data. No env access here so it is safe everywhere. */

export const SITE = {
  name: 'LucaPlus Blog',
  tagline: 'Events, Resources, Articles',
  description:
    'Practical guides on e-invoicing, B2B credit, cashflow, accounting and small-business fintech — from the team behind LucaPlus and LucaPay.',
  social: {
    facebook: 'https://www.facebook.com/lucaplus',
    twitter: 'https://twitter.com/lucaplus',
    instagram: 'https://www.instagram.com/lucaplus',
    youtube: 'https://www.youtube.com/@lucaplus',
    linkedin: 'https://www.linkedin.com/company/lucaplus',
  },
  author: 'LucaPlus Editorial Team',
} as const;

export const NAV_LINKS = [
  { label: 'Event Calendar', href: '/blog' },
  { label: 'Resources', href: '/blog' },
  { label: 'Blog', href: '/blog' },
] as const;

/**
 * Product destinations for internal CTAs. These are the ONLY external product
 * URLs the generator is allowed to link to.
 * TODO: confirm the live LucaPay product URL and update LUCAPAY below.
 */
export const PRODUCTS = {
  lucaplus: {
    name: 'LucaPlus',
    url: 'https://www.lucaplus.com',
    blurb:
      'Send compliant e-invoices and get paid faster with LucaPlus e-invoicing.',
  },
  lucapay: {
    name: 'LucaPay',
    url: 'https://www.lucaplus.com',
    blurb:
      'Pay suppliers now and free up cashflow with flexible LucaPay business credit.',
  },
} as const;

/** Hostnames the generated content is permitted to link to (own properties). */
export const ALLOWED_LINK_HOSTS = [
  'lucaplus.com',
  'www.lucaplus.com',
  'blog.lucaplus.com',
  'lucapay.com',
  'www.lucapay.com',
];

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: 'invoicing-e-invoicing',
    name: 'Invoicing & e-invoicing',
    description:
      'E-invoicing, getting paid faster, payment terms and invoice fraud prevention.',
    targetProduct: 'lucaplus',
    tagVariant: 'teal',
  },
  {
    slug: 'b2b-credit-cashflow',
    name: 'B2B Credit & Cashflow',
    description:
      'Trade credit, supplier payments, working capital and cashflow forecasting.',
    targetProduct: 'lucapay',
    tagVariant: 'navy',
  },
  {
    slug: 'accounting-bookkeeping',
    name: 'Accounting & Bookkeeping',
    description:
      'Accounts payable and receivable, reconciliation, GST/VAT and software workflows.',
    targetProduct: 'both',
    tagVariant: 'gold',
  },
  {
    slug: 'small-business-fintech',
    name: 'Small Business & Fintech',
    description:
      'Running a small business, payments technology, automation and compliance explainers.',
    targetProduct: 'both',
    tagVariant: 'brand',
  },
];

export const CATEGORY_BY_SLUG: Record<CategorySlug, CategoryInfo> = CATEGORIES.reduce(
  (acc, category) => {
    acc[category.slug] = category;
    return acc;
  },
  {} as Record<CategorySlug, CategoryInfo>,
);

export interface TopicSeed {
  title: string;
  focusKeyword: string;
  angle: string;
}

/**
 * Curated topic backlog. The scheduler walks this list (skipping topics whose
 * focus keyword already has a published post) so generation stays on-strategy
 * and avoids duplicate articles.
 */
export const TOPIC_BACKLOG: Record<CategorySlug, TopicSeed[]> = {
  'invoicing-e-invoicing': [
    {
      title: 'What Is E-Invoicing and Why It Matters for Your Business',
      focusKeyword: 'e-invoicing',
      angle: 'Plain-English explainer of e-invoicing, benefits and how to start.',
    },
    {
      title: 'How to Get Invoices Paid Faster Without Chasing Clients',
      focusKeyword: 'get invoices paid faster',
      angle: 'Practical tactics to shorten payment cycles.',
    },
    {
      title: 'Spotting and Stopping Invoice Fraud and Email Scams',
      focusKeyword: 'invoice fraud',
      angle: 'How invoice/BEC fraud works and concrete prevention steps.',
    },
    {
      title: 'Setting Payment Terms That Protect Your Cashflow',
      focusKeyword: 'invoice payment terms',
      angle: 'Choosing and communicating payment terms.',
    },
    {
      title: 'A Simple Guide to Invoice Reconciliation',
      focusKeyword: 'invoice reconciliation',
      angle: 'Step-by-step reconciliation for small finance teams.',
    },
    {
      title: 'Late-Payment Reminders: Templates and Timing',
      focusKeyword: 'late payment reminder',
      angle: 'When and how to follow up professionally.',
    },
  ],
  'b2b-credit-cashflow': [
    {
      title: 'A Beginner’s Guide to B2B Trade Credit',
      focusKeyword: 'b2b trade credit',
      angle: 'What trade credit is and when it helps.',
    },
    {
      title: 'How to Improve Cashflow When Customers Pay Late',
      focusKeyword: 'improve business cashflow',
      angle: 'Levers to smooth cashflow gaps.',
    },
    {
      title: 'Paying Suppliers Early vs On Time: What’s Smarter?',
      focusKeyword: 'paying suppliers early',
      angle: 'Trade-offs of early-payment discounts and timing.',
    },
    {
      title: 'Cashflow Forecasting Basics for Small Businesses',
      focusKeyword: 'cashflow forecasting',
      angle: 'A simple forecasting method anyone can run.',
    },
    {
      title: 'Understanding Working Capital and Why It Matters',
      focusKeyword: 'working capital',
      angle: 'Defining and managing working capital.',
    },
    {
      title: 'How Business Buy-Now-Pay-Later Works',
      focusKeyword: 'business bnpl',
      angle: 'When BNPL for business makes sense.',
    },
  ],
  'accounting-bookkeeping': [
    {
      title: 'Accounts Payable vs Accounts Receivable Explained',
      focusKeyword: 'accounts payable vs receivable',
      angle: 'Clear comparison with examples.',
    },
    {
      title: 'A Month-End Close Checklist for Small Teams',
      focusKeyword: 'month-end close checklist',
      angle: 'Repeatable close process.',
    },
    {
      title: 'Bank Reconciliation: A Practical Walkthrough',
      focusKeyword: 'bank reconciliation',
      angle: 'How to reconcile accurately and often.',
    },
    {
      title: 'Setting Up a Clean Chart of Accounts',
      focusKeyword: 'chart of accounts',
      angle: 'Structuring a chart of accounts that scales.',
    },
    {
      title: 'GST/VAT Basics Every Small Business Should Know',
      focusKeyword: 'gst vat basics',
      angle: 'General overview of sales-tax fundamentals.',
    },
    {
      title: 'Getting Audit-Ready Throughout the Year',
      focusKeyword: 'audit readiness',
      angle: 'Habits that keep books audit-ready.',
    },
  ],
  'small-business-fintech': [
    {
      title: 'How Automation Is Changing Finance Teams',
      focusKeyword: 'finance automation',
      angle: 'Where automation helps small finance teams.',
    },
    {
      title: 'Payments Technology Trends Small Businesses Should Watch',
      focusKeyword: 'payments technology trends',
      angle: 'Accessible overview of payment tech shifts.',
    },
    {
      title: 'Choosing Accounting Software That Grows With You',
      focusKeyword: 'accounting software',
      angle: 'How to evaluate accounting tools.',
    },
    {
      title: 'A Small Business Guide to Financial Security',
      focusKeyword: 'small business financial security',
      angle: 'Practical security and fraud-prevention basics.',
    },
    {
      title: 'Five Fintech Terms Every Owner Should Understand',
      focusKeyword: 'fintech terms explained',
      angle: 'Glossary-style explainer.',
    },
    {
      title: 'How to Reduce Manual Data Entry in Your Finances',
      focusKeyword: 'reduce manual data entry',
      angle: 'Ways to cut repetitive finance admin.',
    },
  ],
};

/** Cover-image palettes (brand-derived) used by the SVG cover generator. */
export const COVER_PALETTES: Record<CategorySlug, { from: string; to: string; accent: string }> = {
  'invoicing-e-invoicing': { from: '#1cbd99', to: '#159b7d', accent: '#5fd3b8' },
  'b2b-credit-cashflow': { from: '#203060', to: '#2c407e', accent: '#5fd3b8' },
  'accounting-bookkeeping': { from: '#f3b03a', to: '#fec257', accent: '#203060' },
  'small-business-fintech': { from: '#159b7d', to: '#203060', accent: '#fec257' },
};

export const POSTS_PER_PAGE = 9;

export const productFor = (product: TargetProduct) =>
  product === 'lucapay' ? PRODUCTS.lucapay : PRODUCTS.lucaplus;
