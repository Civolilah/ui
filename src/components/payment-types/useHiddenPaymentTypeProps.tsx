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
import {
  createFilter,
  FilterOptionOption,
  FormatOptionLabelMeta,
} from 'react-select';
import { useColorScheme } from '$app/common/colors';
import { parseHiddenPaymentTypes } from '$app/common/helpers/payment-types/hidden-payment-types';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useStaticsQuery } from '$app/common/queries/statics';
import { SelectOption } from '$app/components/datatables/Actions';
import { SelectProps } from '$app/components/forms';

const defaultFilterOption = createFilter<SelectOption>();

interface HiddenPaymentTypeLabelProps {
  label: string;
}

function HiddenPaymentTypeLabel({ label }: HiddenPaymentTypeLabelProps) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  return (
    <div className="flex items-center gap-x-2">
      <span>{label}</span>

      <span
        className="text-xs px-1.5 rounded border whitespace-nowrap"
        style={{ color: colors.$22, borderColor: colors.$24 }}
      >
        {t('hidden')}
      </span>
    </div>
  );
}

export function useHiddenPaymentTypeProps(
  value?: string,
  hiddenPaymentTypes?: string
): Pick<SelectProps, 'filterOption' | 'formatOptionLabel'> {
  const company = useCurrentCompany();

  const { data: statics } = useStaticsQuery();

  const hiddenIds = parseHiddenPaymentTypes(
    hiddenPaymentTypes ?? company?.settings?.hidden_payment_types
  );

  if (!hiddenIds.length) {
    return {};
  }

  const paymentTypes = statics?.payment_types ?? [];

  const isEverythingHidden =
    paymentTypes.length > 0 &&
    paymentTypes.every((paymentType) => hiddenIds.includes(paymentType.id));

  const isHiddenOption = (optionValue: string) => {
    return hiddenIds.includes(optionValue) && optionValue !== value;
  };

  return {
    filterOption: (
      option: FilterOptionOption<SelectOption>,
      inputValue: string
    ) => {
      if (inputValue) {
        return defaultFilterOption(option, inputValue);
      }

      return isEverythingHidden || !isHiddenOption(option.value);
    },
    formatOptionLabel: (
      option: SelectOption,
      meta: FormatOptionLabelMeta<SelectOption>
    ) => {
      if (meta.context === 'menu' && isHiddenOption(option.value)) {
        return <HiddenPaymentTypeLabel label={option.label} />;
      }

      return option.label;
    },
  };
}
