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
import { MdEdit } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { trans } from '$app/common/helpers';
import Toggle from '$app/components/forms/Toggle';
import { Icon } from '$app/components/icons/Icon';

interface Props {
  customName: string;
  stockName: string;
  isShown: boolean;
  isDefault: boolean;
  isRenamable: boolean;
  onToggle: (isShown: boolean) => void;
  onRename: () => void;
}

export function PaymentTypeRow(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const {
    customName,
    stockName,
    isShown,
    isDefault,
    isRenamable,
    onToggle,
    onRename,
  } = props;

  return (
    <div
      className="flex items-center gap-x-2 rounded-md border px-3 py-2"
      style={{ borderColor: colors.$24 }}
    >
      <div className="flex min-w-0 flex-1 flex-col [overflow-wrap:anywhere]">
        <div className="flex items-center gap-x-2">
          <Toggle
            label={customName || stockName}
            checked={isShown}
            onValueChange={onToggle}
          />

          {isDefault && (
            <span
              className="text-xs px-1.5 rounded border whitespace-nowrap"
              style={{ color: colors.$22, borderColor: colors.$24 }}
            >
              {t('default')}
            </span>
          )}
        </div>

        {Boolean(customName) && (
          <span className="pl-14 text-xs" style={{ color: colors.$22 }}>
            {trans('renamed_from', { name: stockName })}
          </span>
        )}
      </div>

      {isRenamable && (
        <button
          type="button"
          className="shrink-0"
          aria-label={String(t('rename_payment_type'))}
          onClick={onRename}
        >
          <Icon element={MdEdit} size={18} color={colors.$17} />
        </button>
      )}
    </div>
  );
}
