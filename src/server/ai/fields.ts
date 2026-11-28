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
import { endpoint, trans } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { AiInput } from '$app/common/interfaces/ai';
import { Client } from '$app/common/interfaces/client';
import { today } from './context';
import { JsonSchema } from './llm/provider';
import { Field, Resolution, Values } from './module';

interface DateParts {
  year?: number | null;
  month?: number | null;
  day?: number | null;
  months_from_today?: number | null;
  days_from_today?: number | null;
}

const DATE_PARTS = [
  'year',
  'month',
  'day',
  'months_from_today',
  'days_from_today',
];

const OPTIONS = 5;

const isEmpty = (value: unknown) => {
  return value === null || value === undefined || value === '';
};

const propertyOf = (field: Field): JsonSchema => {
  if (field.options) {
    return {
      type: ['string', 'null'],
      description: field.description,
      enum: [...field.options.map((option) => option.value), null],
    };
  }

  switch (field.type) {
    case 'number':
      return { type: ['number', 'null'], description: field.description };
    case 'date':
      return {
        type: 'object',
        description: `${field.description}. Fill in only the parts the user said: "the 25th" is day 25, "next month" is months_from_today 1, "in 2 weeks" is days_from_today 14.`,
        properties: Object.fromEntries(
          DATE_PARTS.map((part) => [part, { type: ['integer', 'null'] }])
        ),
        required: DATE_PARTS,
        additionalProperties: false,
      };
    case 'list':
      return {
        type: 'array',
        description: field.description,
        items: schemaOf(field.fields ?? []),
      };
    default:
      return { type: ['string', 'null'], description: field.description };
  }
};

export const schemaOf = (fields: Field[]): JsonSchema => {
  return {
    type: 'object',
    properties: Object.fromEntries(
      fields.map((field) => [field.key, propertyOf(field)])
    ),
    required: fields.map((field) => field.key),
    additionalProperties: false,
  };
};

const resolveDate = async (parts: DateParts, field: Field, values: Values) => {
  if (Object.values(parts).every(isEmpty)) {
    return undefined;
  }

  const now = dayjs(await today());
  const after = field.after ? values[field.after] : undefined;
  const base = typeof after === 'string' && after ? dayjs(after) : now;

  let date = isEmpty(parts.months_from_today)
    ? base
    : now.add(parts.months_from_today ?? 0, 'month');

  if (parts.year) {
    date = date.year(parts.year);
  }

  if (parts.month) {
    date = date.month(parts.month - 1);
  }

  if (parts.day) {
    date = date.date(Math.min(parts.day, date.daysInMonth()));
  }

  date = date.add(parts.days_from_today ?? 0, 'day');

  const isPartial = [
    parts.year,
    parts.months_from_today,
    parts.days_from_today,
  ].every(isEmpty);

  if (field.after && isPartial && date.isBefore(base)) {
    date = date.add(1, parts.month ? 'year' : 'month');
  }

  return { value: date.format('YYYY-MM-DD') };
};

const resolveClient = async (
  name: string,
  current: unknown
): Promise<Resolution> => {
  const response = await request(
    'GET',
    endpoint('/api/v1/clients?status=active&per_page=50&filter=:name', {
      name: encodeURIComponent(name),
    }),
    undefined,
    { skipIntercept: true }
  );

  const clients: Client[] = response.data.data;

  const exact = clients.filter(
    (client) => client.display_name.toLowerCase() === name.toLowerCase()
  );

  const matches = exact.length ? exact : clients;

  if (matches.some((client) => client.id === current)) {
    return { value: current };
  }

  if (matches.length === 1) {
    return { value: matches[0].id };
  }

  if (!matches.length) {
    return {
      question: {
        text: trans('ai_client_not_found', { name }),
        input: 'client',
      },
    };
  }

  if (matches.length > OPTIONS) {
    return { question: { text: t('ai_which_client'), input: 'client' } };
  }

  return {
    question: {
      text: t('ai_which_client'),
      input: 'select',
      options: matches.map((client) => ({
        value: client.id,
        label: `${client.display_name} (${client.number})`,
      })),
    },
  };
};

export const resolve = async (
  field: Field,
  value: unknown,
  values: Values
): Promise<Resolution | undefined> => {
  if (isEmpty(value)) {
    return undefined;
  }

  if (field.resolve) {
    return field.resolve(value, values);
  }

  switch (field.type) {
    case 'client':
      return resolveClient(String(value), values[field.key]);
    case 'date':
      return resolveDate(value as DateParts, field, values);
    case 'list':
      return (value as Values[]).length ? { value } : undefined;
    default:
      return { value };
  }
};

export const isMissing = (field: Field, values: Values): boolean => {
  const value = values[field.key];

  if (!field.required || !(field.when?.(values) ?? true)) {
    return false;
  }

  if (field.type === 'list') {
    return (
      !Array.isArray(value) ||
      !value.length ||
      value.some((item: Values) =>
        (field.fields ?? []).some((child) => isMissing(child, item))
      )
    );
  }

  return isEmpty(value);
};

export const inputOf = (field: Field): AiInput => {
  if (field.options) {
    return 'select';
  }

  if (field.type === 'client' || field.type === 'date') {
    return field.type;
  }

  return 'text';
};

export const knownValues = (fields: Field[], values: Values) => {
  return Object.fromEntries(
    fields
      .filter((field) => field.type !== 'client' && field.key in values)
      .map((field) => [field.key, values[field.key]])
  );
};
