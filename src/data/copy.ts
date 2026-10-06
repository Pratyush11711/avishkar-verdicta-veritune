/**
 * All page copy, verbatim from the design brief (section C).
 *
 * Conventions
 *  - `{{phrase}}` inside a heading renders as the Instrument Serif italic accent. One per heading at most.
 *  - A `Rich` value is a list of segments. Plain strings render as is; a `Flagged` segment is text
 *    the brief marks [in brackets] as needing sign-off. It renders inside <Flag>.
 */

import type { IconKey, OrbKey } from './media';

export interface Flagged {
  text: string;
  needsReview: true;
  note: string;
}

export type Segment = string | Flagged;
export type Rich = Segment[];

const flag = (text: string, note: string): Flagged => ({ text, needsReview: true, note });

export const isFlagged = (s: Segment): s is Flagged => typeof s !== 'string';

// Open item: "Confirm all eight listed languages".
const languages = flag(
  'English, Spanish, French, German, Portuguese, Arabic, Mandarin and Japanese',
  'Open item: confirm all eight listed languages.',
);

export const nav = {
  links: [
    { label: 'Verdicta', href: '#verdicta' },
    { label: 'Veritune', href: '#veritune' },
    { label: 'How the pilot works', href: '#pilot' },
    { label: 'FAQ', href: '#faq' },
  ],
  button: 'Start a free pilot',
};

export const hero = {
  eyebrow: 'Contact centre intelligence by Avishkar AI',
  headline: 'Quality and customer signal from {{every call}} your agents take',
  subhead:
    'Verdicta scores agent performance against your own QA framework. Veritune reads customer sentiment, competitor mentions and churn risk. Together they cover your full call volume, in English and the other languages your customers speak.',
  primary: 'Start a free pilot on your calls',
  secondary: 'See how the pilot works',
  underButtons: 'Send us a batch of recordings and get a scored report back. No integration needed to start.',
  // Headlines to A/B test. Do not render.
  // 'Your QA team reviews a sample. Verdicta reviews every call.'
  // 'Find the agents who need coaching and the customers about to leave'
  // 'Full-volume call QA and churn signals for enterprise contact centres'
};

export type PillTone = 'pass' | 'flag' | 'fatal';

export interface HeroCard {
  orb: OrbKey;
  product: 'Verdicta' | 'Veritune';
  data: string;
  pill: PillTone;
  /** Shown on tablet and mobile, where only two cards fit. */
  compact: boolean;
}

/** Illustrative only: a parameter name and a flag, never a result claim. */
export const heroCards: HeroCard[] = [
  { orb: 'aqua', product: 'Verdicta', data: 'CALL 00142 · REQUIRED DISCLOSURE', pill: 'fatal', compact: false },
  { orb: 'sky', product: 'Veritune', data: 'CALL 00287 · TONE SHIFT', pill: 'flag', compact: false },
  { orb: 'mint', product: 'Verdicta', data: 'CALL 00142 · SCRIPT ADHERENCE', pill: 'pass', compact: true },
  { orb: 'apricot', product: 'Veritune', data: 'CALL 00287 · COMPETITOR MENTION', pill: 'flag', compact: true },
];

export const pillLabels: Record<PillTone, string> = { pass: 'Pass', flag: 'Flag', fatal: 'Fatal' };

export const problem = {
  heading: 'Your QA team hears a {{small fraction}} of your calls',
  body: [
    'Most contact centres manually review 1 to 5 percent of their calls. Coaching plans, compliance reports and retention decisions all rest on that sample.',
    'The costly problems sit in the rest. An agent skips a required disclosure on every third call. A long-time customer mentions a competitor twice, gets no answer to their complaint, and hangs up. Nobody hears either call until the damage shows up in an audit or a cancellation.',
  ],
  transition: 'Verdicta and Veritune listen to all of it.',
};

export interface ProductCopy {
  key: 'verdicta' | 'veritune';
  label: string;
  heading: string;
  body: string;
  features: string[];
}

export const verdicta: ProductCopy = {
  key: 'verdicta',
  label: 'Verdicta, agent quality at full volume',
  heading: 'Score every call against the QA standard {{you already use}}',
  body: 'Verdicta applies your scorecard to each recorded call and tells you where agents follow the process and where they drift. Your QA analysts stop sampling and start coaching.',
  features: [
    '20+ parameters and sub-parameters per call, configured to match your existing QA form',
    'Fatal and non-fatal scoring, with weightage you set',
    'Checks script adherence, dead air, hold, escalation, call handling, resolution and summarisation',
    'Threshold rules that score automatically, such as dead air over 5 seconds or hold over 60 seconds',
    'CRM tagging check that confirms agents updated the record after the call',
    'AI call summaries with final disposition and action items',
    'Heat maps that show which parameters fail most, filtered by agent, team, call or campaign',
    'Full call metadata and in-app recording playback',
  ],
};

export const veritune: ProductCopy = {
  key: 'veritune',
  label: 'Veritune, customer signal and churn risk',
  heading: 'Know which customers are leaving {{before they cancel}}',
  body: 'Veritune listens to the customer side of the conversation. It tracks how their tone changes, which competitors they bring up, and how likely they are to churn, then recommends what your team should do next.',
  features: [
    'Tone and emotion scoring across the call, including frustration, satisfaction and the moments a call escalates',
    'Competitor mention detection that records which competitor came up, in what context and how often',
    'Churn risk score with a confidence level',
    'Recommended next actions for each at-risk customer',
    'Sentiment timeline overlaid on the call recording',
    'Critical and non-critical flags with weightage you control, so a competitor mention can outrank mild frustration',
    'Dashboards for churn-risk buckets, campaigns and team views',
  ],
};

export const suite = {
  line: 'Verdicta tells you how your agents performed. Veritune tells you how your customers reacted. Use one or both on the same calls and the same dashboard.',
};

export const multilingual = {
  heading: 'QA that works in the languages your customers speak',
  body: [
    'Global contact centres rarely run in one language. Offshore teams, regional support desks and multilingual customer bases all produce calls that English-only QA tools score badly or skip. Verdicta and Veritune analyse calls in ',
    languages,
    '. ',
    flag(
      'Scoring, summaries and sentiment come back in English, so one QA team can review every region on the same dashboard.',
      'Brief: "Confirm: scoring, summaries and sentiment come back in English".',
    ),
  ] satisfies Rich,
  /** Optional line. Set to null to remove it from the page. */
  optionalLine: [
    flag(
      'Calls that switch languages mid-conversation are analysed as they happen, without splitting or manual tagging.',
      'Brief: "Keep only if confirmed". Delete by setting optionalLine to null.',
    ),
  ] as Rich | null,
  points: [
    ['One scorecard applied across every language you operate in'],
    [
      flag(
        'Summaries and action items in English for central QA and leadership',
        'Brief: "[Confirm]". Depends on whether output comes back in English.',
      ),
    ],
    ['Compare agent quality and customer sentiment across regions side by side'],
  ] satisfies Rich[],
};

export interface Stat {
  value: string;
  /** Count-up target and the text around it. Final rendered text is always `value`. */
  count: { to: number; suffix: string };
  label: string;
}

export const numbers = {
  heading: 'Running in production at enterprise scale',
  stats: [
    {
      value: '99%+',
      count: { to: 99, suffix: '%+' },
      label: 'of recorded calls analysed, compared with the 1 to 5% a manual QA team samples',
    },
    {
      value: '1 million',
      count: { to: 1, suffix: ' million' },
      // Brief reads "1 million minutes call minutes analysed to date"; repeated word removed.
      label: 'call minutes analysed to date',
    },
    {
      value: '80%',
      count: { to: 80, suffix: '%' },
      label: 'reduction in QA review time at a live deployment',
    },
    {
      value: '5+',
      count: { to: 5, suffix: '+' },
      label: 'enterprise contact centres in production',
    },
  ] satisfies Stat[],
  credibility:
    'Built by Avishkar AI, the applied AI team behind systems running across 30,000 ATMs and 68,000 telecom towers. On the ATM network, our AI agents cut mean time to repair from 90 minutes to 45.',
};

export interface Card {
  icon: IconKey;
  title: string;
  body: Rich;
}

export const pilot = {
  heading: 'See the results on {{your own calls}} before you commit',
  steps: [
    {
      icon: 'recordings',
      title: 'Share a batch of recordings.',
      body: ['Upload the files directly or send a CSV of recording links. Nothing to integrate.'],
    },
    {
      icon: 'scorecard',
      title: 'Set your scorecard.',
      body: ['We configure Verdicta against your current QA form and agree which customer signals Veritune should flag.'],
    },
    {
      icon: 'report',
      title: 'Get your report.',
      body: ['Every call in the batch comes back scored and summarised, with sentiment, competitor mentions and churn flags.'],
    },
    {
      icon: 'review',
      title: 'Review it with us.',
      body: ['We walk your QA and CX leads through the findings and what a full rollout would look like.'],
    },
  ] satisfies Card[],
  note: [
    'Pilot turnaround is ',
    flag('[X business days]', 'Open item: pilot turnaround time. Placeholder rendered as written so it cannot ship unnoticed.'),
    ' from receiving recordings. ',
    flag('Your data is used only for your pilot.', 'Open item: confirm pilot data policy.'),
  ] satisfies Rich,
  button: 'Start your free pilot',
};

export const enterprise = {
  heading: 'Deploys where your security team needs it',
  body: 'Call recordings carry customer data, so you decide where Verdicta and Veritune run and who sees what.',
  cards: [
    { icon: 'deployment', title: 'Deployment', body: ['Our cloud, your private cloud, or on-premises inside your environment'] },
    { icon: 'security', title: 'Security', body: ['Avishkar AI is ISO 27001 certified'] },
    {
      icon: 'integrations',
      title: 'Integrations',
      body: ['Connect through our API, or start with recording upload and CSV'],
    },
    { icon: 'access', title: 'Access control', body: ['Separate logins for superadmins, admins, QA analysts and agents'] },
    { icon: 'whiteLabel', title: 'White-label ready', body: ['Run the interface under your own brand for clients or business units'] },
    {
      icon: 'dashboards',
      title: 'Configurable dashboards',
      body: ['Calls processed, SIP IDs, buckets, campaigns, agents and teams'],
    },
  ] satisfies Card[],
  logoGroups: [
    {
      label: 'Telephony',
      note: 'Open item: confirm which telephony integrations exist today and remove the rest.',
      items: [
        { name: 'Genesys Cloud', src: '/logos/genesys.svg' },
        { name: 'NICE CXone', src: '/logos/nice.svg' },
        { name: 'Five9', src: '/logos/five9.svg' },
        { name: 'Amazon Connect', src: '/logos/amazon-wordmark.svg' },
        { name: 'Twilio', src: '/logos/twilio-wordmark.svg' },
        { name: 'Avaya', src: '/logos/avaya.svg' },
      ],
    },
    {
      label: 'CRM',
      note: 'Open item: confirm which CRM integrations exist today and remove the rest.',
      items: [
        { name: 'Salesforce', src: '/logos/salesforce-wordmark.svg', label: 'Salesforce' },
        { name: 'Microsoft Dynamics 365', src: '/logos/dynamics365.svg', label: 'Dynamics 365' },
        { name: 'HubSpot', src: '/logos/hubspot-wordmark.svg' },
        { name: 'Zendesk', src: '/logos/zendesk-wordmark.svg' },
        { name: 'ServiceNow', src: '/logos/servicenow.svg' },
      ],
    },
  ],
};

export const audience = {
  heading: 'Built for contact centres where {{every call counts}}',
  body: 'Verdicta and Veritune fit operations handling 300,000 or more call minutes a month, where manual QA cannot keep up.',
  cards: [
    {
      icon: 'healthcare',
      title: 'Healthcare',
      body: ['Healthcare patient access and member services teams that need consistent scripts and clear records'],
    },
    { icon: 'bpo', title: 'BPO', body: ['BPOs and outsourced CX providers reporting quality to their own clients'] },
    {
      icon: 'telecom',
      title: 'Telecom',
      body: ['Subscription and telecom businesses where churn is the number leadership watches'],
    },
    {
      icon: 'finance',
      title: 'Finance',
      body: ['Financial services support and collections teams with strict script requirements'],
    },
  ] satisfies Card[],
};

export interface FaqItem {
  q: string;
  a: Rich;
}

export const faq = {
  // The brief gives no FAQ heading; the nav label is reused.
  heading: 'FAQ',
  items: [
    {
      q: 'Do we need to integrate anything before the pilot?',
      a: ['No. Upload recordings or send a CSV of recording links. Integration with your telephony and CRM comes later, if you roll out.'],
    },
    {
      q: 'Can we use our existing QA scorecard?',
      a: ["Yes. Verdicta's parameters, sub-parameters and weightage are configured to match the form your QA team already uses."],
    },
    {
      q: 'Where does our call data live?',
      a: ['You choose: our cloud, your private cloud, or on-premises. Avishkar AI is ISO 27001 certified.'],
    },
    {
      q: 'Which languages do you support?',
      a: [languages, '. Every language is scored on the same scorecard.'],
    },
    {
      q: 'Do we need both products?',
      a: [
        'No. Verdicta and Veritune work alone or together. Start with the one tied to your most pressing metric, whether that is agent quality or customer retention.',
      ],
    },
    {
      q: 'Does this replace our QA team?',
      a: [
        'It changes their work. Instead of listening to a small sample, analysts review flagged calls and spend their time coaching agents.',
      ],
    },
    {
      q: 'How is pricing structured?',
      a: [
        flag(
          'Pricing depends on monthly call volume and deployment type. We quote after the pilot, based on what you saw in it.',
          'Open item: confirm pricing model. Brief gives this as an example answer.',
        ),
      ],
    },
  ] satisfies FaqItem[],
};

export const finalCta = {
  heading: 'Find out what your sample is {{missing}}',
  body: 'Send us a batch of recorded calls. We will score every one, flag the customers at risk, and show you what your current QA process did not catch.',
  primary: 'Start a free pilot',
  secondary: 'Talk to our team',
};

export const footer = {
  line: 'Verdicta and Veritune are products of Avishkar AI. Applied AI engineering for operations that cannot afford downtime.',
  badge: 'ISO 27001',
};

export const seo = {
  title: 'Verdicta and Veritune: AI call QA and churn signals',
  description:
    'Score every contact centre call against your QA scorecard and catch churn risk early. Multilingual, on-prem ready. Start a free pilot.',
};
