/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import paymentType from '$app/common/constants/payment-type';
import { usePaymentTypeLabel } from './usePaymentTypeLabel';

export function usePaymentTypes() {
  const paymentTypeLabel = usePaymentTypeLabel();

  let translatedPaymentTypeList: Record<string, string> = {};

  translatedPaymentTypeList = Object.keys(paymentType).reduce<
    Record<string, string>
  >((translatedTypes, key) => {
    translatedTypes[key] = paymentTypeLabel(key);
    return translatedTypes;
  }, {});

  const paymentTypeKeyValueArray = Object.entries(translatedPaymentTypeList);

  return paymentTypeKeyValueArray.sort((a, b) => a[1].localeCompare(b[1]));
}
