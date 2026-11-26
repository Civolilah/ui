/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { usePaymentTypeLabel } from '$app/common/hooks/usePaymentTypeLabel';
import { PaymentType } from '$app/common/interfaces/statics';
import { useStaticsQuery } from '$app/common/queries/statics';
import { GenericSelectorProps } from '$app/components/CountrySelector';
import { SelectField } from '$app/components/forms';
import { usePaymentTypeSelectProps } from '$app/components/payment-types/usePaymentTypeSelectProps';

export function PaymentTypeSelector(props: GenericSelectorProps) {
  const statics = useStaticsQuery();

  const paymentTypeLabel = usePaymentTypeLabel();
  const paymentTypeSelectProps = usePaymentTypeSelectProps(props.value);

  const paymentTypes = [...(statics.data?.payment_types ?? [])].sort(
    (first: PaymentType, second: PaymentType) =>
      paymentTypeLabel(first.id).localeCompare(paymentTypeLabel(second.id))
  );

  return (
    <SelectField
      value={props.value}
      onValueChange={props.onChange}
      withBlank
      errorMessage={props.errorMessage}
      customSelector
      {...paymentTypeSelectProps}
    >
      {paymentTypes.map((type: PaymentType, index: number) => (
        <option key={index} value={type.id}>
          {paymentTypeLabel(type.id)}
        </option>
      ))}
    </SelectField>
  );
}
