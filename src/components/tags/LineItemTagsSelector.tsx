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
import { KeyboardEvent, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  dedupeLineItemTagOptions,
  parseLineItemTags,
  resolveLineItemTagOptions,
  serializeLineItemTags,
} from '$app/common/helpers/line-item-tags';
import { TAG_ENTITY_TYPES, TagOption } from '$app/common/interfaces/tag';
import { useTagsQuery } from '$app/common/queries/tags';
import { ChevronDown } from '$app/components/icons/ChevronDown';
import { isActiveTag } from '$app/components/tags/TagPills';
import { LineItemTagChip } from './LineItemTagChip';
import { LineItemTagsPanel } from './LineItemTagsPanel';

interface Props {
  value?: string;
  onChange: (value: string) => void;
  withSelectedTags?: boolean;
  className?: string;
}

interface SelectedTagsProps {
  value?: string;
  onChange: (value: string) => void;
  onRemoved: () => void;
}

function SelectedLineItemTags(props: SelectedTagsProps) {
  const names = parseLineItemTags(props.value);

  const { data } = useTagsQuery({
    entityType: TAG_ENTITY_TYPES.product,
    enabled: names.length > 0,
  });

  if (!names.length) {
    return null;
  }

  const options = data
    ? resolveLineItemTagOptions(
        names,
        dedupeLineItemTagOptions(data.data.filter(isActiveTag))
      )
    : names.map((name): TagOption => ({ name, color: null }));

  return (
    <div className="flex min-w-0 max-w-full flex-wrap items-center gap-1">
      {options.map((option) => (
        <LineItemTagChip
          key={option.name}
          option={option}
          onRemove={() => {
            props.onChange(
              serializeLineItemTags(
                names.filter((name) => name !== option.name)
              )
            );

            props.onRemoved();
          }}
        />
      ))}
    </div>
  );
}

export function LineItemTagsSelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [isOpen, setIsOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const tagsCount = parseLineItemTags(props.value).length;

  const handleOpen = () => {
    setOpenCount((current) => current + 1);
    setIsOpen(true);
  };

  const handleClose = useCallback((restoreFocus: boolean) => {
    setIsOpen(false);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  const handleTriggerClick = () => {
    if (isOpen) {
      handleClose(false);

      return;
    }

    handleOpen();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();

      handleOpen();
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        data-cy="lineItemTagsTrigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={
          tagsCount ? `${t('tags')} (${tagsCount})` : String(t('tags'))
        }
        className={classNames(
          'inline-flex h-8 shrink-0 items-center gap-1 rounded-md px-1.5 text-xs font-medium',
          { 'min-w-[2.75rem] justify-end': !props.withSelectedTags },
          props.className
        )}
        style={{ color: colors.$22 }}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        {props.withSelectedTags && (
          <span className="text-sm" style={{ color: colors.$3 }}>
            {t('tags')}
          </span>
        )}

        {!props.withSelectedTags && tagsCount > 0 && <span>{tagsCount}</span>}

        <ChevronDown size="1rem" color={colors.$3} />
      </button>

      {props.withSelectedTags && (
        <SelectedLineItemTags
          value={props.value}
          onChange={props.onChange}
          onRemoved={() => triggerRef.current?.focus()}
        />
      )}

      <LineItemTagsPanel
        key={openCount}
        isOpen={isOpen}
        anchorRef={triggerRef}
        value={props.value}
        onChange={props.onChange}
        onClose={handleClose}
      />
    </>
  );
}
