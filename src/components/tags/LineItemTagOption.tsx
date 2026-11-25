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
import { MdCheck } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { TagOption } from '$app/common/interfaces/tag';
import { Icon } from '$app/components/icons/Icon';
import { tagPillColor } from './TagPills';

interface Props {
  id: string;
  option: TagOption;
  isSelected: boolean;
  isActive: boolean;
  onMouseMove: (event: MouseEvent<HTMLDivElement>) => void;
  onClick: () => void;
}

export function LineItemTagOption(props: Props) {
  const colors = useColorScheme();

  const { id, option, isSelected, isActive, onMouseMove, onClick } = props;

  return (
    <div
      id={id}
      role="option"
      aria-selected={isSelected}
      data-cy="lineItemTagOption"
      className="flex cursor-pointer items-center gap-2 rounded-[0.1875rem] px-3 py-2 text-sm"
      style={{
        color: colors.$3,
        backgroundColor: isActive ? colors.$20 : 'transparent',
      }}
      onMouseMove={onMouseMove}
      onClick={onClick}
    >
      <div
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded border"
        style={{
          borderColor: isSelected ? colors.$3 : colors.$24,
          backgroundColor: isSelected ? colors.$3 : 'transparent',
        }}
      >
        {isSelected && <Icon element={MdCheck} size={12} color={colors.$1} />}
      </div>

      <div
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={
          option.isLegacy
            ? { border: `1px dashed ${colors.$17}` }
            : { backgroundColor: tagPillColor(option) }
        }
      />

      <span
        className="truncate"
        title={option.name}
        style={{ color: option.isLegacy ? colors.$22 : colors.$3 }}
      >
        {option.name}
      </span>
    </div>
  );
}
