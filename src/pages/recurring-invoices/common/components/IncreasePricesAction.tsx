/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useBulkAction } from '../queries';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Modal } from '$app/components/Modal';
import { Button, InputField } from '$app/components/forms';
import { BiChevronUpSquare } from 'react-icons/bi';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

interface Props {
  recurringInvoices: RecurringInvoice[];
  onActionCall?: () => void;
}

export const IncreasePricesAction = (props: Props) => {
  const [t] = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [increasingPercent, setIncreasingPercent] = useState<number>(0);

  const [errors, setErrors] = useState<ValidationBag>();

  const handleOnUpdatedPrices = () => {
    setIsModalOpen(false);
    setIncreasingPercent(0);
  };

  const bulk = useBulkAction({ onSuccess: handleOnUpdatedPrices, setErrors });

  const { recurringInvoices, onActionCall } = props;

  const getRecurringInvoicesIds = () => {
    return recurringInvoices.map(({ id }) => id);
  };

  const handleSave = () => {
    bulk(
      getRecurringInvoicesIds(),
      'increase_prices',
      onActionCall,
      increasingPercent
    );
  };

  return (
    <>
      <DropdownElement
        onClick={() => setIsModalOpen(true)}
        icon={<Icon element={BiChevronUpSquare} />}
      >
        {t('increase_prices')}
      </DropdownElement>

      <Modal
        title={t('increase_prices')}
        visible={isModalOpen}
        onClose={handleOnUpdatedPrices}
        backgroundColor="white"
      >
        <InputField
          label={t('percent')}
          value={increasingPercent}
          onValueChange={(value) => {
            setIncreasingPercent(Number(value));
            errors && setErrors(undefined);
          }}
          errorMessage={errors?.errors.percentage_increase}
        />

        <Button className="self-end" onClick={handleSave}>
          {t('submit')}
        </Button>
      </Modal>
    </>
  );
};
