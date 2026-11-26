/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { FormEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { trans } from '$app/common/helpers';
import { PaymentType } from '$app/common/interfaces/statics';
import { Button, InputField } from '$app/components/forms';
import { Modal } from '$app/components/Modal';

interface Props {
  visible: boolean;
  paymentType?: PaymentType;
  currentName: string;
  takenNames: string[];
  onClose: () => void;
  onSave: (name: string) => void;
}

export function RenamePaymentTypeModal(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { visible, paymentType, currentName, takenNames, onClose, onSave } =
    props;

  const inputRef = useRef<HTMLInputElement>(null);

  const [initialName] = useState<string>(currentName);
  const [name, setName] = useState<string>(currentName);

  const trimmedName = name.trim();
  const isNameInUse = takenNames.includes(trimmedName.toLowerCase());

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSave(trimmedName);
  };

  return (
    <Modal
      title={t('rename_payment_type')}
      text={t('payment_type_rename_help')}
      visible={visible}
      onClose={onClose}
      initialFocusRef={inputRef}
    >
      <form className="flex flex-col gap-y-1" onSubmit={handleSubmit}>
        <InputField
          id="payment_type_name"
          innerRef={inputRef}
          label={t('name')}
          placeholder={paymentType?.name}
          value={name}
          onValueChange={setName}
          changeOverride
        />

        <span
          role="status"
          aria-live="polite"
          className="text-xs"
          style={{ color: colors.$22 }}
        >
          {isNameInUse && t('payment_type_name_in_use')}
        </span>
      </form>

      <div className="flex justify-end space-x-2">
        {Boolean(initialName) && (
          <Button behavior="button" type="secondary" onClick={() => onSave('')}>
            {trans('reset_to_name', { name: paymentType?.name })}
          </Button>
        )}

        <Button behavior="button" onClick={() => onSave(trimmedName)}>
          {t('save')}
        </Button>
      </div>
    </Modal>
  );
}
