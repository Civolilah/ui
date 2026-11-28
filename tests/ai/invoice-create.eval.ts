/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { evaluate } from './evaluate';

await evaluate([
  {
    text: 'Create an invoice for the 25th to the 26th of this month, 6 hours worked at 25 USD per hour',
    module: 'invoice.create',
    values: {
      client: null,
      currency: 'USD',
      items: [{ cost: 25, quantity: 6 }],
      period_start: { day: 25 },
      period_end: { day: 26 },
    },
  },
  {
    text: 'Invoice Acme Corp for 10 hours of web development at 80 EUR per hour',
    module: 'invoice.create',
    values: {
      client: 'Acme Corp',
      currency: 'EUR',
      items: [{ description: 'web development', cost: 80, quantity: 10 }],
    },
  },
  {
    text: 'Bill Globex 1500 for the website redesign, PO number 4471',
    module: 'invoice.create',
    values: {
      client: 'Globex',
      items: [{ description: 'website redesign', cost: 1500 }],
      po_number: '4471',
    },
  },
  {
    text: 'Create an invoice for Initech: 3 days of consulting at 600 per day, due in 14 days',
    module: 'invoice.create',
    values: {
      client: 'Initech',
      items: [{ description: 'consulting', cost: 600, quantity: 3 }],
      due_date: { days_from_today: 14 },
    },
  },
  {
    text: 'New invoice for Wayne Enterprises, 2 hours of design at 50 and 4 hours of development at 75',
    module: 'invoice.create',
    values: {
      client: 'Wayne Enterprises',
      items: [
        { description: 'design', cost: 50, quantity: 2 },
        { description: 'development', cost: 75, quantity: 4 },
      ],
    },
  },
  {
    text: 'Create an invoice for Stark Industries for 12 hours at 45 GBP, note: Thank you for your business',
    module: 'invoice.create',
    values: {
      client: 'Stark Industries',
      currency: 'GBP',
      items: [{ cost: 45, quantity: 12 }],
      public_notes: 'Thank you for your business',
    },
  },
  {
    text: 'Make an invoice for Umbrella Corp dated the 1st of next month, 8 hours of support at 30 per hour',
    module: 'invoice.create',
    values: {
      client: 'Umbrella Corp',
      date: { day: 1, months_from_today: 1 },
      items: [{ description: 'support', cost: 30, quantity: 8 }],
    },
  },
  {
    text: 'Erstelle eine Rechnung für Müller GmbH: 5 Stunden Beratung zu je 90 EUR',
    module: 'invoice.create',
    skipOnMock: true,
    values: {
      client: 'Müller GmbH',
      currency: 'EUR',
      items: [{ description: 'Beratung', cost: 90, quantity: 5 }],
    },
  },
  {
    text: 'I need an invoice: 4 units of hosting at 19.99 EUR',
    module: 'invoice.create',
    values: {
      client: null,
      currency: 'EUR',
      items: [{ description: 'hosting', cost: 19.99, quantity: 4 }],
    },
  },
  {
    text: "What's the weather like tomorrow?",
    module: null,
  },
]);
