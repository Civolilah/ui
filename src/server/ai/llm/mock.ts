/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { LlmRequest, Provider } from './provider';

const CURRENCY =
  /\b(USD|EUR|GBP|CHF|CAD|AUD|JPY|SEK|NOK|DKK|PLN|CZK|HUF|INR|ZAR|NZD)\b/i;
const SYMBOLS: Record<string, string> = { $: 'USD', '€': 'EUR', '£': 'GBP' };
const MONTHS: Record<string, number> = { last: -1, this: 0, next: 1 };
const CLIENT =
  /\b(?:[Ff]or|[Tt]o|[Cc]lient|[Ii]nvoice|[Bb]ill)\s+(\p{Lu}[\p{L}\d&'.-]*(?:\s+\p{Lu}[\p{L}\d&'.-]*)*)/u;
const ITEM =
  /(\d+(?:[.,]\d+)*)\s*(hours?|hrs?|days?|units?|pieces?)\s+([^,]*?)\s*(?:at|@)\s*[$€£]?\s*(\d+(?:[.,]\d+)*)/gi;
const FLAT =
  /[$€£]?\s*(\d+(?:[.,]\d+)*)\s*(?:[A-Z]{3}\s+)?for\s+(?:the\s+)?([^,.]+)/i;
const PERIOD =
  /(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|-|until|till|through)\s*(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:\s+of)?\s+(last|this|next)\s+month/i;
const REQUEST = /^\s*(?:please\s+)?(?:create|make|new|invoice|bill)\b/i;
const SYNONYMS: Record<string, string[]> = { invoice: ['invoice', 'bill'] };

const amount = (value: string) => {
  const cents = value.match(/[.,](\d{1,2})$/);
  const whole = cents ? value.slice(0, cents.index) : value;

  return Number(`${whole.replace(/[.,]/g, '')}.${cents?.[1] ?? 0}`);
};

const capitalize = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const items = (message: string) => {
  const quantified = [...message.matchAll(ITEM)].map((match) => ({
    description: capitalize(`${match[2]} ${match[3]}`.trim()),
    cost: amount(match[4]),
    quantity: amount(match[1]),
  }));

  const flat = message.match(FLAT);

  if (quantified.length || !flat) {
    return quantified;
  }

  return [
    {
      description: capitalize(flat[2].trim()),
      cost: amount(flat[1]),
      quantity: null,
    },
  ];
};

const period = (message: string, group: number) => {
  const match = message.match(PERIOD);

  return match
    ? {
        day: Number(match[group]),
        months_from_today: MONTHS[match[3].toLowerCase()],
      }
    : null;
};

const dueDate = (message: string) => {
  const days = message.match(/\bdue\s+in\s+(\d+)\s+days?/i);
  const day = message.match(
    /\bdue\s+(?:on\s+)?(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)/i
  );

  if (days) {
    return { days_from_today: Number(days[1]) };
  }

  return day ? { day: Number(day[1]) } : null;
};

const date = (message: string) => {
  const match = message.match(
    /\bdated\s+(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)?(?:\s+of\s+(last|this|next)\s+month)?/i
  );

  return match
    ? {
        day: Number(match[1]),
        months_from_today: MONTHS[match[2]?.toLowerCase()] ?? null,
      }
    : null;
};

const currency = (message: string) => {
  const code = message.match(CURRENCY)?.[1];
  const symbol = message.match(/[$€£]/)?.[0];

  return code?.toUpperCase() ?? (symbol ? SYMBOLS[symbol] : null);
};

const rules: Record<string, (message: string) => unknown> = {
  client: (message) => {
    return message.match(CLIENT)?.[1].replace(/\.$/, '') ?? null;
  },
  items,
  currency,
  date,
  due_date: dueDate,
  period_start: (message) => {
    return period(message, 1);
  },
  period_end: (message) => {
    return period(message, 2);
  },
  po_number: (message) => {
    return (
      message.match(
        /\bPO\b(?:\s+number|\s+no\.?|\s*#)?\s*:?\s*([A-Z0-9][\w-]*)/i
      )?.[1] ?? null
    );
  },
  public_notes: (message) => {
    return message.match(/\bnotes?:\s*(.+)$/i)?.[1].trim() ?? null;
  },
};

const mentions = (key: string, text: string) => {
  return key
    .split(/[._]/)
    .filter((word) => word !== 'create')
    .every((word) => {
      return (SYNONYMS[word] ?? [word]).some((synonym) => {
        return text.includes(synonym);
      });
    });
};

const selectModule = ({ schema, message }: LlmRequest) => {
  const choices = schema.properties?.module.enum ?? [];
  const text = message.toLowerCase();

  const module = choices.find((choice) => {
    return choice?.includes('.') && mentions(choice, text);
  });

  if (choices.includes('continue') && !(module && REQUEST.test(message))) {
    return { module: 'continue' };
  }

  return { module: module ?? 'none' };
};

const extractValues = ({ schema, message, question }: LlmRequest) => {
  return Object.fromEntries(
    Object.entries(schema.properties ?? {}).map(([key, property]) => {
      const value = rules[key]?.(message) ?? null;
      const answer =
        key === question && property.type.includes('string')
          ? message.trim()
          : null;

      return [key, value ?? answer];
    })
  );
};

export const mock: Provider = {
  name: 'mock',
  model: 'rules',
  generate: async (request) => {
    return {
      data:
        request.name === 'module'
          ? selectModule(request)
          : extractValues(request),
      inputTokens: 0,
      outputTokens: 0,
    };
  },
};
