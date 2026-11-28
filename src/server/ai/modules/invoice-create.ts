/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import { t } from 'i18next';
import { cloneDeep } from 'lodash';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { ModuleBitmask } from '$app/common/enums/module-bitmask';
import { date, endpoint, trans } from '$app/common/helpers';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { Number as NumberHelper } from '$app/common/helpers/number';
import { request } from '$app/common/helpers/request';
import { Client } from '$app/common/interfaces/client';
import { Country } from '$app/common/interfaces/country';
import { Currency } from '$app/common/interfaces/currency';
import { Invoice } from '$app/common/interfaces/invoice';
import { company, statics, today } from '../context';
import { Module, Values } from '../module';

interface Item {
  description: string;
  cost: number;
  quantity: number | null;
}

interface InvoiceValues extends Values {
  client: string;
  items: Item[];
  period_start?: string;
  period_end?: string;
  currency?: string;
  date?: string;
  due_date?: string;
  po_number?: string;
  public_notes?: string;
}

interface InvoiceData {
  client: Client;
  currency?: Currency;
  country?: Country;
  dateFormat: string;
  requestedCurrency?: string;
  invoice: Invoice;
  tax: number;
  total: number;
}

const TAX_RATES = ['1', '2', '3'] as const;

const load = async <T>(url: string): Promise<T> => {
  const response = await request('GET', url, undefined, {
    skipIntercept: true,
  });

  return response.data.data;
};

const defaultTaxes = (client: Client) => {
  const { enabled_tax_rates, settings } = company();
  const levels = [client.settings, client.group_settings?.settings, settings];

  if (client.is_tax_exempt) {
    return {};
  }

  return Object.fromEntries(
    TAX_RATES.slice(0, enabled_tax_rates).flatMap((index) => {
      const level =
        levels.find((item) => item?.[`tax_name${index}`]) ?? settings;

      return [
        [`tax_name${index}`, level[`tax_name${index}`]],
        [`tax_rate${index}`, level[`tax_rate${index}`]],
      ];
    })
  );
};

const usesInclusiveTaxes = (client: Client) => {
  return (
    [
      client.settings.inclusive_taxes,
      client.group_settings?.settings.inclusive_taxes,
      company().settings.inclusive_taxes,
    ].find((value) => typeof value === 'boolean') ?? false
  );
};

const money = ({ currency, country }: InvoiceData, value: number) => {
  return currency && country
    ? NumberHelper.formatMoney(value, currency, country)
    : String(value);
};

export const createInvoice: Module<InvoiceValues, InvoiceData> = {
  key: 'invoice.create',
  description: 'Create a one-off invoice for a client',
  permission: 'create_invoice',
  bitmask: ModuleBitmask.Invoices,
  fields: [
    {
      key: 'client',
      type: 'client',
      required: true,
      question: 'ai_question_client',
      description: 'Name of the client to invoice',
    },
    {
      key: 'items',
      type: 'list',
      required: true,
      question: 'ai_question_items',
      description:
        'Line items. When the user adds or changes items, return the complete list including the known items.',
      fields: [
        {
          key: 'description',
          type: 'text',
          required: true,
          description: "What was sold or worked on, in the user's words",
        },
        {
          key: 'cost',
          type: 'number',
          required: true,
          description: 'Price of one unit, e.g. the hourly rate',
        },
        {
          key: 'quantity',
          type: 'number',
          description: 'Number of units, e.g. hours worked',
        },
      ],
    },
    {
      key: 'period_start',
      type: 'date',
      description: 'First day of the service period',
    },
    {
      key: 'period_end',
      type: 'date',
      after: 'period_start',
      description: 'Last day of the service period',
    },
    {
      key: 'currency',
      type: 'text',
      description: 'ISO code of the currency the user named, e.g. USD',
    },
    { key: 'date', type: 'date', description: 'Invoice date' },
    { key: 'due_date', type: 'date', after: 'date', description: 'Due date' },
    {
      key: 'po_number',
      type: 'text',
      description: 'Purchase order (PO) number',
    },
    {
      key: 'public_notes',
      type: 'text',
      description: 'Note to show on the invoice',
    },
  ],
  prepare: async (values) => {
    const [client, blank] = await Promise.all([
      load<Client>(
        endpoint('/api/v1/clients/:id?include=group_settings', {
          id: values.client,
        })
      ),
      load<Invoice>(endpoint('/api/v1/invoices/create')),
    ]);

    const { settings } = company();
    const { currencies, countries, date_formats } = await statics();

    const dateFormat =
      date_formats.find((format) => format.id === settings.date_format_id)
        ?.format_moment ?? 'YYYY-MM-DD';

    const invoiceDate = values.date || (await today());

    const terms =
      client.settings.payment_terms ||
      client.group_settings?.settings.payment_terms ||
      settings.payment_terms;

    const period = [values.period_start, values.period_end]
      .filter(Boolean)
      .map((value) => date(value as string, dateFormat))
      .join(' - ');

    const currency = currencies.find(
      ({ id }) => id === (client.settings.currency_id || settings.currency_id)
    );

    const invoice: Invoice = {
      ...blank,
      ...defaultTaxes(client),
      client_id: client.id,
      date: invoiceDate,
      due_date:
        values.due_date ??
        (terms
          ? dayjs(invoiceDate).add(Number(terms), 'day').format('YYYY-MM-DD')
          : ''),
      po_number: values.po_number ?? blank.po_number,
      public_notes: values.public_notes ?? blank.public_notes,
      uses_inclusive_taxes: usesInclusiveTaxes(client),
      line_items: values.items.map((item) => ({
        ...blankLineItem(),
        notes: period ? `${item.description} (${period})` : item.description,
        cost: item.cost,
        quantity: item.quantity ?? 1,
      })),
    };

    const sum =
      currency &&
      (invoice.uses_inclusive_taxes
        ? new InvoiceSumInclusive(
            cloneDeep(invoice),
            currency,
            settings.e_invoice_type
          ).build()
        : new InvoiceSum(
            cloneDeep(invoice),
            currency,
            settings.e_invoice_type
          ).build());

    return {
      client,
      currency,
      country: countries.find(
        ({ id }) => id === (client.country_id || settings.country_id)
      ),
      dateFormat,
      requestedCurrency: values.currency?.toUpperCase(),
      invoice,
      tax: sum ? sum.totalTaxes : 0,
      total: sum ? sum.total : 0,
    };
  },
  validate: ({ client, currency, requestedCurrency }) => {
    if (
      !currency ||
      !requestedCurrency ||
      requestedCurrency === currency.code
    ) {
      return [];
    }

    return [
      trans('ai_currency_mismatch', {
        requested: requestedCurrency,
        name: client.display_name,
        currency: currency.code,
      }),
    ];
  },
  summary: (data) => {
    const { client, invoice, currency, dateFormat, tax, total } = data;

    return {
      title: t('new_invoice'),
      fields: [
        {
          key: 'client',
          label: t('client'),
          value: client.id,
          text: client.display_name,
          input: 'client',
        },
        {
          key: 'date',
          label: t('invoice_date'),
          value: invoice.date,
          text: date(invoice.date, dateFormat),
          input: 'date',
        },
        {
          key: 'due_date',
          label: t('due_date'),
          value: invoice.due_date,
          text: date(invoice.due_date, dateFormat),
          input: 'date',
        },
        {
          key: 'po_number',
          label: t('po_number'),
          value: invoice.po_number,
          text: invoice.po_number,
          input: 'text',
        },
        {
          key: 'public_notes',
          label: t('public_notes'),
          value: invoice.public_notes,
          text: invoice.public_notes,
          input: 'text',
        },
        {
          key: 'currency',
          label: t('currency'),
          value: currency?.code ?? '',
          text: currency?.code ?? '',
        },
        ...(tax
          ? [
              {
                key: 'tax',
                label: t('tax'),
                value: String(tax),
                text: money(data, tax),
              },
            ]
          : []),
        {
          key: 'total',
          label: t('total'),
          value: String(total),
          text: money(data, total),
        },
      ],
      items: invoice.line_items.map((item) => ({
        label: item.notes,
        detail: `${item.quantity} × ${money(data, item.cost)}`,
        value: money(data, item.cost * item.quantity),
      })),
    };
  },
  tasks: ({ invoice }) => {
    return [
      {
        label: t('invoice'),
        run: async () => {
          const response = await request(
            'POST',
            endpoint('/api/v1/invoices'),
            invoice,
            { skipIntercept: true }
          );

          const created: Invoice = response.data.data;

          return {
            entity: 'invoices',
            id: created.id,
            label: `${t('invoice')} ${created.number}`,
          };
        },
      },
    ];
  },
  draft: ({ invoice }) => {
    return invoice;
  },
};
