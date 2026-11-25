/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { MouseEvent, ReactNode, RefObject, useEffect, useRef } from 'react';
import {
  dedupeLineItemTagOptions,
  parseLineItemTags,
  resolveLineItemTagOptions,
  serializeLineItemTags,
} from '$app/common/helpers/line-item-tags';
import { TAG_ENTITY_TYPES, TagOption } from '$app/common/interfaces/tag';
import { useTagsQuery } from '$app/common/queries/tags';
import { LineItemTagChip } from './LineItemTagChip';
import { isActiveTag } from './TagPills';

interface Props {
  containerRef: RefObject<HTMLDivElement>;
  value?: string;
  onChange: (value: string) => void;
  onEmptied: () => void;
  limit: number;
  className?: string;
  children: ReactNode;
}

export function LineItemTagChips(props: Props) {
  const {
    containerRef,
    value,
    onChange,
    onEmptied,
    limit,
    className,
    children,
  } = props;

  const focusIndexRef = useRef<number | null>(null);

  const names = parseLineItemTags(value);

  const { data } = useTagsQuery({
    entityType: TAG_ENTITY_TYPES.product,
    enabled: names.length > 0,
  });

  useEffect(() => {
    const index = focusIndexRef.current;

    if (index === null) {
      return;
    }

    focusIndexRef.current = null;

    const removeButtons =
      containerRef.current?.querySelectorAll<HTMLButtonElement>(
        ':scope > div button'
      );

    if (removeButtons?.length) {
      removeButtons[Math.min(index, removeButtons.length - 1)].focus();
    }
  }, [value]);

  const availableOptions = dedupeLineItemTagOptions(
    (data?.data ?? []).filter(isActiveTag)
  );

  const options = data
    ? resolveLineItemTagOptions(names, availableOptions)
    : names.map((name): TagOption => ({ name, color: null }));

  const visibleOptions = options.slice(0, limit);

  const handleRemove = (
    event: MouseEvent<HTMLButtonElement>,
    name: string,
    index: number
  ) => {
    const isKeyboardRemoval = event.currentTarget === document.activeElement;
    const remainingNames = names.filter((current) => current !== name);

    onChange(serializeLineItemTags(remainingNames));

    if (!isKeyboardRemoval) {
      return;
    }

    if (!remainingNames.length) {
      onEmptied();

      return;
    }

    focusIndexRef.current = index;
  };

  return (
    <div
      ref={containerRef}
      data-cy="lineItemTagChips"
      className={classNames('flex items-center gap-1', className)}
    >
      {visibleOptions.map((option, index) => (
        <LineItemTagChip
          key={option.name}
          option={option}
          onRemove={(event) => handleRemove(event, option.name, index)}
        />
      ))}

      {children}
    </div>
  );
}
