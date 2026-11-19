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
import { useColorScheme } from '$app/common/colors';
import { TagOption } from '$app/common/interfaces/tag';
import { XMark } from '$app/components/icons/XMark';
import {
  tagPillBackgroundColor,
  tagPillColor,
} from '$app/components/tags/TagPills';

interface Props {
  option: TagOption;
  onRemove?: () => void;
}

export function LineItemTagChip(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { option } = props;

  return (
    <span
      data-cy="lineItemTagChip"
      className="inline-flex h-6 min-w-0 max-w-full items-center gap-1 rounded-full border px-2 text-xs font-medium"
      style={{
        backgroundColor: option.isLegacy
          ? 'transparent'
          : tagPillBackgroundColor(option),
        borderColor: option.isLegacy ? colors.$17 : tagPillColor(option),
        borderStyle: option.isLegacy ? 'dashed' : 'solid',
        color: option.isLegacy ? colors.$22 : colors.$3,
      }}
    >
      {!option.isLegacy && (
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: tagPillColor(option) }}
        />
      )}

      <span className="min-w-0 truncate" title={option.name}>
        {option.name}
      </span>

      {props.onRemove && (
        <button
          type="button"
          data-cy="lineItemTagChipRemove"
          className="ml-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
          onMouseDown={(event) => event.preventDefault()}
          onClick={props.onRemove}
          aria-label={`${t('remove')} ${option.name}`}
        >
          <XMark size="0.55rem" color={colors.$3} />
        </button>
      )}
    </span>
  );
}
