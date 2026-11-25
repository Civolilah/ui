/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Plus } from '$app/components/icons/Plus';

interface Props {
  id: string;
  tagName: string;
  isActive: boolean;
  onMouseMove: (event: MouseEvent<HTMLDivElement>) => void;
  onClick: () => void;
}

export function LineItemCreateTagOption(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { id, tagName, isActive, onMouseMove, onClick } = props;

  return (
    <div
      id={id}
      role="option"
      aria-selected={false}
      data-cy="lineItemCreateTagOption"
      className="flex cursor-pointer items-center gap-2 rounded-[0.1875rem] px-3 py-2 text-sm font-medium"
      style={{
        color: colors.$3,
        backgroundColor: isActive ? colors.$20 : 'transparent',
      }}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      <Plus size="0.85rem" color={colors.$16} />

      <span className="truncate">
        {t('create')} <q>{tagName}</q>
      </span>
    </div>
  );
}
