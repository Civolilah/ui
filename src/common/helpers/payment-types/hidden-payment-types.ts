/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

const compareIds = (first: string, second: string) => {
  const difference = Number(first) - Number(second);

  if (Number.isNaN(difference)) {
    return first.localeCompare(second);
  }

  return difference;
};

export const parseHiddenPaymentTypes = (
  value: string | null | undefined
): string[] => {
  if (value === null || value === undefined) {
    return [];
  }

  const ids = String(value)
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id !== '');

  return [...new Set(ids)];
};

export const serializeHiddenPaymentTypes = (ids: string[]) => {
  const uniqueIds = new Set(
    ids.map((id) => id.trim()).filter((id) => id !== '')
  );

  return [...uniqueIds].sort(compareIds).join(',');
};
