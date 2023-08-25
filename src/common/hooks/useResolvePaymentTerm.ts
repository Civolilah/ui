/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PaymentTerm } from '../interfaces/payment-term';
import { usePaymentTermsQuery } from '../queries/payment-terms';

export const useResolvePaymentTerm = () => {
  const { data: paymentTerms } = usePaymentTermsQuery({});

  return (numDays: number) =>
    paymentTerms?.data.data.find(
      (paymentTerm: PaymentTerm) => paymentTerm.num_days === numDays
    );
};