/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  parseHiddenPaymentTypes,
  serializeHiddenPaymentTypes,
} from '$app/common/helpers/payment-types/hidden-payment-types';
import {
  customPaymentTypeLabel,
  isRenamablePaymentType,
  renamePaymentType,
} from '$app/common/helpers/payment-types/payment-type-labels';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { PaymentType } from '$app/common/interfaces/statics';
import { useStaticsQuery } from '$app/common/queries/statics';
import { Card } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { PaymentTypeRow } from './PaymentTypeRow';
import { RenamePaymentTypeModal } from './RenamePaymentTypeModal';

export function PaymentTypes() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const companyChanges = useCompanyChanges();
  const { data: statics } = useStaticsQuery();

  const handleChange = useHandleCurrentCompanyChangeProperty();

  const [search, setSearch] = useState<string>('');
  const [paymentTypeToRename, setPaymentTypeToRename] = useState<PaymentType>();
  const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
  const [renameCount, setRenameCount] = useState<number>(0);

  const translations = companyChanges?.settings?.translations;

  const hiddenIds = parseHiddenPaymentTypes(
    companyChanges?.settings?.hidden_payment_types
  );

  const shownName = (paymentType: PaymentType) => {
    return (
      customPaymentTypeLabel(translations, paymentType.id) || paymentType.name
    );
  };

  const paymentTypes = [...(statics?.payment_types ?? [])].sort(
    (first, second) => shownName(first).localeCompare(shownName(second))
  );

  const query = search.trim().toLowerCase();

  const filteredPaymentTypes = paymentTypes.filter((paymentType) =>
    `${shownName(paymentType)} ${paymentType.name}`
      .toLowerCase()
      .includes(query)
  );

  const takenNames = paymentTypes
    .filter((paymentType) => paymentType.id !== paymentTypeToRename?.id)
    .map((paymentType) => shownName(paymentType).toLowerCase());

  const isEveryTypeShown = !paymentTypes.some((paymentType) =>
    hiddenIds.includes(paymentType.id)
  );

  const updateHiddenIds = (ids: string[]) => {
    handleChange(
      'settings.hidden_payment_types',
      serializeHiddenPaymentTypes(ids)
    );
  };

  const handleToggleAll = (isShown: boolean) => {
    updateHiddenIds(
      isShown ? [] : paymentTypes.map((paymentType) => paymentType.id)
    );
  };

  const handleToggle = (id: string, isShown: boolean) => {
    updateHiddenIds(
      isShown
        ? hiddenIds.filter((hiddenId) => hiddenId !== id)
        : [...hiddenIds, id]
    );
  };

  const handleOpenRename = (paymentType: PaymentType) => {
    setPaymentTypeToRename(paymentType);
    setRenameCount((current) => current + 1);
    setIsRenameModalOpen(true);
  };

  const handleRename = (name: string) => {
    setIsRenameModalOpen(false);

    if (!paymentTypeToRename) {
      return;
    }

    handleChange(
      'settings.translations',
      renamePaymentType(translations, paymentTypeToRename, name)
    );
  };

  return (
    <Card
      title={t('payment_types')}
      description={t('payment_types_help')}
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div className="flex flex-col gap-4 px-5 sm:px-6 py-4 sm:py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <InputField
            value={search}
            onValueChange={(value) => setSearch(value)}
            placeholder={t('search')}
            changeOverride
          />
        </div>

        <Toggle
          label={t('show_hide_all')}
          checked={isEveryTypeShown}
          onValueChange={handleToggleAll}
        />
      </div>

      {filteredPaymentTypes.length > 0 && (
        <div className="grid grid-cols-1 gap-2 px-5 sm:px-6 py-4 sm:py-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredPaymentTypes.map((paymentType) => (
            <PaymentTypeRow
              key={paymentType.id}
              customName={customPaymentTypeLabel(translations, paymentType.id)}
              stockName={paymentType.name}
              isShown={!hiddenIds.includes(paymentType.id)}
              isDefault={
                paymentType.id === companyChanges?.settings?.payment_type_id
              }
              isRenamable={isRenamablePaymentType(paymentType.id)}
              onToggle={(isShown) => handleToggle(paymentType.id, isShown)}
              onRename={() => handleOpenRename(paymentType)}
            />
          ))}
        </div>
      )}

      {filteredPaymentTypes.length === 0 && (
        <div
          className="px-5 sm:px-6 py-4 sm:py-3 text-sm"
          style={{ color: colors.$22 }}
        >
          {t('no_records_found')}
        </div>
      )}

      <RenamePaymentTypeModal
        key={renameCount}
        visible={isRenameModalOpen}
        paymentType={paymentTypeToRename}
        currentName={customPaymentTypeLabel(
          translations,
          paymentTypeToRename?.id ?? ''
        )}
        takenNames={takenNames}
        onClose={() => setIsRenameModalOpen(false)}
        onSave={handleRename}
      />
    </Card>
  );
}
