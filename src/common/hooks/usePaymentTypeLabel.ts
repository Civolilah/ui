/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import paymentType from '$app/common/constants/payment-type';
import { customPaymentTypeLabel } from '$app/common/helpers/payment-types/payment-type-labels';
import { useStaticsQuery } from '$app/common/queries/statics';
import { useCurrentCompany } from './useCurrentCompany';

export function usePaymentTypeLabel(translations?: unknown) {
  const [t] = useTranslation();

  const company = useCurrentCompany();
  const { data: statics } = useStaticsQuery();

  const labelTranslations = translations ?? company?.settings?.translations;

  return (id: string): string => {
    const customLabel = customPaymentTypeLabel(labelTranslations, id);

    if (customLabel) {
      return customLabel;
    }

    const staticsPaymentType = statics?.payment_types.find(
      (type) => type.id === id
    );

    if (staticsPaymentType) {
      return staticsPaymentType.name;
    }

    const translationKey = paymentType[id as keyof typeof paymentType];

    return translationKey ? String(t(translationKey)) : '';
  };
}
