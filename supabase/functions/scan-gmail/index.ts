import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface EmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      parts?: Array<{ mimeType: string; body?: { data?: string } }>;
    }>;
  };
}

const KNOWN_SERVICES: Record<string, { name: string; category: string; defaultAmount?: number; currency?: string }> = {
  'google.com': { name: 'Google', category: 'SaaS' },
  'google.com.au': { name: 'Google', category: 'SaaS' },
  'apple.com': { name: 'Apple', category: 'SaaS' },
  'xero.com': { name: 'Xero', category: 'SaaS' },
  'netflix.com': { name: 'Netflix', category: 'Streaming' },
  'spotify.com': { name: 'Spotify', category: 'Streaming' },
  'hulu.com': { name: 'Hulu', category: 'Streaming' },
  'disneyplus.com': { name: 'Disney+', category: 'Streaming' },
  'hbomax.com': { name: 'HBO Max', category: 'Streaming' },
  'max.com': { name: 'Max', category: 'Streaming' },
  'primevideo.com': { name: 'Amazon Prime Video', category: 'Streaming' },
  'amazon.com': { name: 'Amazon', category: 'Shopping' },
  'amazon.com.au': { name: 'Amazon', category: 'Shopping' },
  'youtube.com': { name: 'YouTube Premium', category: 'Streaming' },
  'github.com': { name: 'GitHub', category: 'SaaS' },
  'notion.so': { name: 'Notion', category: 'SaaS' },
  'notion.com': { name: 'Notion', category: 'SaaS' },
  'figma.com': { name: 'Figma', category: 'SaaS' },
  'adobe.com': { name: 'Adobe', category: 'SaaS' },
  'slack.com': { name: 'Slack', category: 'SaaS' },
  'dropbox.com': { name: 'Dropbox', category: 'SaaS' },
  'zoom.us': { name: 'Zoom', category: 'SaaS' },
  'microsoft.com': { name: 'Microsoft', category: 'SaaS' },
  'office.com': { name: 'Microsoft 365', category: 'SaaS' },
  'atlassian.com': { name: 'Atlassian', category: 'SaaS' },
  'trello.com': { name: 'Trello', category: 'SaaS' },
  'asana.com': { name: 'Asana', category: 'SaaS' },
  'monday.com': { name: 'Monday.com', category: 'SaaS' },
  'linear.app': { name: 'Linear', category: 'SaaS' },
  'vercel.com': { name: 'Vercel', category: 'Cloud' },
  'netlify.com': { name: 'Netlify', category: 'Cloud' },
  'heroku.com': { name: 'Heroku', category: 'Cloud' },
  'digitalocean.com': { name: 'DigitalOcean', category: 'Cloud' },
  'aws.amazon.com': { name: 'AWS', category: 'Cloud' },
  'azure.com': { name: 'Microsoft Azure', category: 'Cloud' },
  'cloudflare.com': { name: 'Cloudflare', category: 'Cloud' },
  'linode.com': { name: 'Linode', category: 'Cloud' },
  'render.com': { name: 'Render', category: 'Cloud' },
  'railway.app': { name: 'Railway', category: 'Cloud' },
  'supabase.com': { name: 'Supabase', category: 'Cloud' },
  'supabase.io': { name: 'Supabase', category: 'Cloud' },
  'intercom.com': { name: 'Intercom', category: 'SaaS' },
  'hubspot.com': { name: 'HubSpot', category: 'SaaS' },
  'mailchimp.com': { name: 'Mailchimp', category: 'SaaS' },
  'sendgrid.com': { name: 'SendGrid', category: 'SaaS' },
  'twilio.com': { name: 'Twilio', category: 'SaaS' },
  'stripe.com': { name: 'Stripe', category: 'Finance' },
  'paypal.com': { name: 'PayPal', category: 'Finance' },
  'medium.com': { name: 'Medium', category: 'News' },
  'substack.com': { name: 'Substack', category: 'News' },
  'udemy.com': { name: 'Udemy', category: 'Education' },
  'coursera.org': { name: 'Coursera', category: 'Education' },
  'skillshare.com': { name: 'Skillshare', category: 'Education' },
  'duolingo.com': { name: 'Duolingo', category: 'Education' },
  'headspace.com': { name: 'Headspace', category: 'Health' },
  'calm.com': { name: 'Calm', category: 'Health' },
  'peloton.com': { name: 'Peloton', category: 'Health' },
  'dashlane.com': { name: 'Dashlane', category: 'SaaS' },
  '1password.com': { name: '1Password', category: 'SaaS' },
  'lastpass.com': { name: 'LastPass', category: 'SaaS' },
  'nordvpn.com': { name: 'NordVPN', category: 'SaaS' },
  'expressvpn.com': { name: 'ExpressVPN', category: 'SaaS' },
  'canva.com': { name: 'Canva', category: 'SaaS' },
  'grammarly.com': { name: 'Grammarly', category: 'SaaS' },
  'loom.com': { name: 'Loom', category: 'SaaS' },
  'miro.com': { name: 'Miro', category: 'SaaS' },
  'airtable.com': { name: 'Airtable', category: 'SaaS' },
  'webflow.com': { name: 'Webflow', category: 'SaaS' },
  'squarespace.com': { name: 'Squarespace', category: 'SaaS' },
  'wix.com': { name: 'Wix', category: 'SaaS' },
  'shopify.com': { name: 'Shopify', category: 'SaaS' },
  'godaddy.com': { name: 'GoDaddy', category: 'Cloud' },
  'namecheap.com': { name: 'Namecheap', category: 'Cloud' },
  'fastmail.com': { name: 'Fastmail', category: 'SaaS' },
  'protonmail.com': { name: 'Proton Mail', category: 'SaaS' },
  'proton.me': { name: 'Proton', category: 'SaaS' },
  'icloud.com': { name: 'iCloud', category: 'Cloud' },
};

const SUBSCRIPTION_SUBJECT_PATTERNS = [
  /receipt/i,
  /invoice/i,
  /subscription/i,
  /billing/i,
  /payment\s+confirmation/i,
  /payment\s+received/i,
  /monthly\s+payment/i,
  /annual\s+payment/i,
  /yearly\s+payment/i,
  /your\s+plan/i,
  /renewal/i,
  /renewed/i,
  /auto-renew/i,
  /order\s+confirmation/i,
  /purchase\s+confirmation/i,
  /thank\s+you\s+for\s+(your\s+)?payment/i,
  /thank\s+you\s+for\s+subscribing/i,
  /welcome\s+to/i,
  /your\s+account/i,
  /charged/i,
  /payment\s+processed/i,
  /transaction/i,
];

const SUBSCRIPTION_FROM_PATTERNS = [
  /billing/i,
  /invoice/i,
  /receipts?/i,
  /subscriptions?/i,
  /payments?/i,
  /noreply/i,
  /no-reply/i,
  /notifications?/i,
  /accounts?/i,
  /hello/i,
  /info/i,
  /support/i,
  /team/i,
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header provided');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (!user) throw new Error(`User not authenticated: ${userError?.message || 'Unknown error'}`);

    const { access_token } = await req.json();
    if (!access_token) throw new Error('No access token provided');

    const searchQueries = [
      'subject:(receipt OR invoice OR billing)',
      'subject:(subscription OR renewal OR "monthly payment" OR "annual payment" OR "yearly payment")',
      'subject:("payment confirmation" OR "payment received" OR "payment processed" OR "order confirmation")',
      'subject:("thank you for your payment" OR "thank you for subscribing" OR charged)',
      'from:(billing OR invoice OR receipts OR subscriptions OR payments OR noreply OR no-reply)',
      'from:(google.com OR apple.com OR xero.com OR netflix.com OR spotify.com OR adobe.com)',
      'from:(microsoft.com OR github.com OR dropbox.com OR slack.com OR zoom.us OR notion.so)',
      'from:(atlassian.com OR canva.com OR figma.com OR grammarly.com OR webflow.com)',
      'from:(shopify.com OR squarespace.com OR wix.com OR hubspot.com OR intercom.com)',
      'from:(aws.amazon.com OR digitalocean.com OR vercel.com OR netlify.com OR cloudflare.com)',
    ];

    const seenIds = new Set<string>();
    const allMessages: EmailMessage[] = [];

    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=100`,
          { headers: { Authorization: `Bearer ${access_token}` } }
        );

        if (!response.ok) {
          if (response.status === 401) throw new Error('Gmail access token is invalid or expired. Please sign out and sign in again.');
          if (response.status === 403) throw new Error('Insufficient Gmail permissions. Please sign out and sign in again to grant access.');
          continue;
        }

        const data = await response.json();
        if (!data.messages) continue;

        for (const message of data.messages) {
          if (seenIds.has(message.id)) continue;
          seenIds.add(message.id);

          const msgResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
            { headers: { Authorization: `Bearer ${access_token}` } }
          );

          if (msgResponse.ok) {
            allMessages.push(await msgResponse.json());
          }
        }
      } catch (queryError) {
        if (queryError instanceof Error && (queryError.message.includes('expired') || queryError.message.includes('permissions'))) {
          throw queryError;
        }
        console.error('Query error:', queryError);
      }
    }

    console.log(`Fetched ${allMessages.length} unique messages`);

    const subscriptions = parseSubscriptions(allMessages, user.id);
    console.log(`Parsed ${subscriptions.length} subscriptions`);

    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        gmail_connected: true,
        last_scan_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (profileError) console.error('Error upserting profile:', profileError);

    if (subscriptions.length > 0) {
      const { error } = await supabaseClient
        .from('subscriptions')
        .upsert(subscriptions, { onConflict: 'user_id,name' });

      if (error) throw new Error(`Failed to save subscriptions: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, count: subscriptions.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Scan Gmail Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const statusCode = errorMessage.includes('not authenticated') || errorMessage.includes('No authorization') ? 401 : 400;

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getEmailBody(message: EmailMessage): string {
  const parts = message.payload.parts || [];

  const findText = (parts: EmailMessage['payload']['parts']): string => {
    if (!parts) return '';
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
      }
      if (part.parts) {
        const nested = findText(part.parts);
        if (nested) return nested;
      }
    }
    return '';
  };

  if (message.payload.body?.data) {
    return atob(message.payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
  }

  return findText(parts) || message.snippet || '';
}

function extractAmountFromText(text: string): { amount: number; currency: string } | null {
  const patterns = [
    { regex: /AU\$\s*(\d+(?:[.,]\d{1,2})?)/i, currency: 'AUD' },
    { regex: /A\$\s*(\d+(?:[.,]\d{1,2})?)/i, currency: 'AUD' },
    { regex: /\$\s*(\d+(?:[.,]\d{1,2})?)(?:\s*AUD)/i, currency: 'AUD' },
    { regex: /£\s*(\d+(?:[.,]\d{1,2})?)/i, currency: 'GBP' },
    { regex: /€\s*(\d+(?:[.,]\d{1,2})?)/i, currency: 'EUR' },
    { regex: /\$\s*(\d+(?:[.,]\d{1,2})?)/i, currency: 'USD' },
    { regex: /(\d+(?:[.,]\d{1,2})?)\s*USD/i, currency: 'USD' },
    { regex: /(\d+(?:[.,]\d{1,2})?)\s*AUD/i, currency: 'AUD' },
    { regex: /(?:total|amount|charged|billed|price|cost)[:\s]+(?:AU\$|A\$|\$|£|€)\s*(\d+(?:[.,]\d{1,2})?)/i, currency: 'USD' },
  ];

  for (const { regex, currency } of patterns) {
    const match = text.match(regex);
    if (match) {
      const amount = parseFloat(match[1].replace(',', '.'));
      if (amount > 0 && amount < 10000) {
        return { amount, currency };
      }
    }
  }
  return null;
}

function extractDomain(email: string): string | null {
  const match = email.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  if (!match) return null;

  let domain = match[1].toLowerCase();
  domain = domain.replace(/^(mail\.|email\.|noreply\.|billing\.|no-reply\.|em\.|sg\.|info\.|support\.|accounts?\.|notifications?\.)/, '');

  return domain;
}

function getKnownService(domain: string | null): { name: string; category: string } | null {
  if (!domain) return null;

  if (KNOWN_SERVICES[domain]) return KNOWN_SERVICES[domain];

  for (const [knownDomain, service] of Object.entries(KNOWN_SERVICES)) {
    if (domain.endsWith('.' + knownDomain) || domain === knownDomain) {
      return service;
    }
  }

  const parts = domain.split('.');
  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join('.');
    if (KNOWN_SERVICES[rootDomain]) return KNOWN_SERVICES[rootDomain];
  }

  return null;
}

function extractServiceName(from: string, domain: string | null): string {
  const displayNameMatch = from.match(/^"?([^"<@]+)"?\s*</);
  if (displayNameMatch) {
    let name = displayNameMatch[1].trim();
    name = name.replace(/^(noreply|no-reply|billing|email|info|team|hello|support|accounts?|notifications?|receipts?|invoice)$/i, '').trim();
    if (name.length > 1) return name;
  }

  if (domain) {
    const knownService = getKnownService(domain);
    if (knownService) return knownService.name;

    const parts = domain.split('.');
    const mainPart = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
    const cleaned = mainPart.replace(/-/g, ' ');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return 'Unknown Service';
}

function isSubscriptionEmail(from: string, subject: string): boolean {
  const subjectLower = subject.toLowerCase();
  const fromLower = from.toLowerCase();

  for (const pattern of SUBSCRIPTION_SUBJECT_PATTERNS) {
    if (pattern.test(subjectLower)) return true;
  }

  const domain = extractDomain(from);
  if (domain && getKnownService(domain)) return true;

  for (const pattern of SUBSCRIPTION_FROM_PATTERNS) {
    if (pattern.test(fromLower)) return true;
  }

  return false;
}

function detectBillingCycle(text: string): string {
  const combined = text.toLowerCase();
  if (/annual|yearly|per\s+year|\/year|12.month|once\s+a\s+year/i.test(combined)) return 'yearly';
  if (/quarterly|per\s+quarter|every\s+3\s+months/i.test(combined)) return 'quarterly';
  if (/weekly|per\s+week|\/week/i.test(combined)) return 'weekly';
  return 'monthly';
}

function categorizeService(name: string, domain: string | null): string {
  const combined = (name + ' ' + (domain || '')).toLowerCase();
  const knownService = getKnownService(domain);
  if (knownService) return knownService.category;

  if (/(netflix|hulu|disney|spotify|apple music|youtube|prime video|hbo|paramount|peacock|tidal|deezer)/i.test(combined)) return 'Streaming';
  if (/(github|adobe|notion|figma|slack|dropbox|zoom|microsoft|google workspace|atlassian|jira|confluence|trello|asana|monday|linear|canva|miro|airtable|webflow|intercom|hubspot)/i.test(combined)) return 'SaaS';
  if (/(headspace|calm|peloton|noom|fitbit|strava|myfitnesspal)/i.test(combined)) return 'Health';
  if (/(bank|card|paypal|stripe|venmo|wise|revolut)/i.test(combined)) return 'Finance';
  if (/(times|post|journal|news|medium|substack|economist|guardian|wsj)/i.test(combined)) return 'News';
  if (/(aws|azure|cloud|heroku|digitalocean|vercel|netlify|cloudflare|linode|render|railway)/i.test(combined)) return 'Cloud';
  if (/(duolingo|coursera|udemy|skillshare|masterclass|pluralsight|linkedin learning)/i.test(combined)) return 'Education';
  if (/(xero|quickbooks|freshbooks|sage|wave)/i.test(combined)) return 'Finance';
  if (/(shopify|squarespace|wix|wordpress|godaddy|namecheap)/i.test(combined)) return 'SaaS';

  return 'Other';
}

function parseSubscriptions(messages: EmailMessage[], userId: string) {
  const subscriptionsMap = new Map<string, {
    user_id: string;
    name: string;
    domain: string | null;
    category: string;
    amount: number;
    currency: string;
    billing_cycle: string;
    next_payment_date: string;
    status: string;
    email_address: string;
    is_demo: boolean;
  }>();

  for (const message of messages) {
    const headers = message.payload.headers;
    const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
    const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
    const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');

    if (!fromHeader || !subjectHeader) continue;

    const from = fromHeader.value;
    const subject = subjectHeader.value;

    if (!isSubscriptionEmail(from, subject)) continue;

    const domain = extractDomain(from);
    const name = extractServiceName(from, domain);

    if (name === 'Unknown Service' && !domain) continue;

    const mapKey = `${userId}-${name.toLowerCase()}`;
    const body = getEmailBody(message);
    const fullText = subject + ' ' + body + ' ' + message.snippet;

    const amountResult = extractAmountFromText(fullText);
    const billingCycle = detectBillingCycle(fullText);
    const category = categorizeService(name, domain);

    const nextPaymentDate = new Date();
    if (dateHeader) {
      try {
        const emailDate = new Date(dateHeader.value);
        if (!isNaN(emailDate.getTime())) {
          nextPaymentDate.setTime(emailDate.getTime());
        }
      } catch (e) { console.error('Date parse error:', e); }
    }
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + (billingCycle === 'yearly' ? 12 : billingCycle === 'quarterly' ? 3 : 1));

    if (!subscriptionsMap.has(mapKey)) {
      subscriptionsMap.set(mapKey, {
        user_id: userId,
        name,
        domain,
        category,
        amount: amountResult?.amount ?? 0,
        currency: amountResult?.currency ?? 'USD',
        billing_cycle: billingCycle,
        next_payment_date: nextPaymentDate.toISOString().split('T')[0],
        status: 'active',
        email_address: from,
        is_demo: false,
      });
    } else {
      const existing = subscriptionsMap.get(mapKey)!;
      if (amountResult && existing.amount === 0) {
        existing.amount = amountResult.amount;
        existing.currency = amountResult.currency;
      }
    }
  }

  return Array.from(subscriptionsMap.values());
}
