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
import {
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { MdOutlineLocalOffer } from 'react-icons/md';
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
import { Icon } from '$app/components/icons/Icon';
import { isActiveTag } from '$app/components/tags/TagPills';
import { LineItemTagChip } from './LineItemTagChip';
import { LineItemTagsPanel } from './LineItemTagsPanel';

const CELL_VISIBLE_TAGS = 1;

interface Props {
  layout: 'cell' | 'row';
  value?: string;
  onChange: (value: string) => void;
  children?: ReactNode;
}

interface ChipsProps {
  value?: string;
  onChange: (value: string) => void;
  onEmptied: () => void;
  onShowAll: () => void;
  limit?: number;
  reserveSpace?: boolean;
  className?: string;
}

function LineItemTagChips(props: ChipsProps) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const containerRef = useRef<HTMLDivElement>(null);
  const focusIndexRef = useRef<number | null>(null);

  const names = parseLineItemTags(props.value);

  const { data } = useTagsQuery({
    entityType: TAG_ENTITY_TYPES.product,
    enabled: names.length > 0,
  });

  const removeButtons = () => {
    return [
      ...(containerRef.current?.querySelectorAll<HTMLButtonElement>(
        ':scope > span button'
      ) ?? []),
    ];
  };

  useEffect(() => {
    const index = focusIndexRef.current;

    if (index === null) {
      return;
    }

    focusIndexRef.current = null;

    const buttons = removeButtons();

    if (buttons.length) {
      buttons[Math.min(index, buttons.length - 1)].focus();
    }
  }, [props.value]);

  if (!names.length) {
    if (props.reserveSpace) {
      return (
        <div
          aria-hidden="true"
          className={classNames('h-6', props.className)}
        />
      );
    }

    return null;
  }

  const options = data
    ? resolveLineItemTagOptions(
        names,
        dedupeLineItemTagOptions(data.data.filter(isActiveTag))
      )
    : names.map((name): TagOption => ({ name, color: null }));

  const visibleOptions = props.limit ? options.slice(0, props.limit) : options;
  const hiddenCount = options.length - visibleOptions.length;

  const handleRemove = (name: string, index: number) => {
    const isKeyboardRemoval = removeButtons()[index] === document.activeElement;

    props.onChange(
      serializeLineItemTags(names.filter((current) => current !== name))
    );

    if (!isKeyboardRemoval) {
      return;
    }

    if (names.length === 1) {
      props.onEmptied();

      return;
    }

    focusIndexRef.current = index;
  };

  return (
    <div
      ref={containerRef}
      data-cy="lineItemTagChips"
      className={classNames('flex items-center gap-1', props.className)}
    >
      {visibleOptions.map((option, index) => (
        <LineItemTagChip
          key={option.name}
          option={option}
          onRemove={() => handleRemove(option.name, index)}
        />
      ))}

      {hiddenCount > 0 && (
        <button
          type="button"
          data-cy="lineItemTagsMore"
          aria-label={`${t('tags')} (${options.length})`}
          className="inline-flex h-6 shrink-0 items-center rounded-full border px-2 text-xs font-medium"
          style={{ borderColor: colors.$24, color: colors.$3 }}
          onClick={props.onShowAll}
        >
          +{hiddenCount}
        </button>
      )}
    </div>
  );
}

export function LineItemTagsSelector(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const [isOpen, setIsOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);

  const triggerRef = useRef<HTMLButtonElement>(null);

  const isCell = props.layout === 'cell';
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
    <div
      className={classNames('flex min-w-0', {
        'w-full flex-col': isCell,
        'flex-wrap items-center gap-2': !isCell,
      })}
    >
      <div className={classNames('flex', { 'mb-1.5 justify-end': isCell })}>
        <button
          ref={triggerRef}
          type="button"
          data-cy="lineItemTagsTrigger"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={
            tagsCount ? `${t('tags')} (${tagsCount})` : String(t('tags'))
          }
          className={classNames(
            'inline-flex shrink-0 items-center gap-1 rounded-md border font-medium',
            {
              'h-6 px-1.5 text-xs': isCell,
              'h-8 px-2.5 text-sm': !isCell,
            }
          )}
          style={{
            color: colors.$3,
            borderColor: colors.$24,
            backgroundColor: colors.$1,
          }}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
        >
          <Icon
            element={MdOutlineLocalOffer}
            size={isCell ? 13 : 16}
            color={colors.$3}
          />

          <span>{t('tags')}</span>

          <ChevronDown
            size={isCell ? '0.75rem' : '0.875rem'}
            color={colors.$3}
          />
        </button>
      </div>

      {props.children}

      <LineItemTagChips
        value={props.value}
        onChange={props.onChange}
        onEmptied={() => triggerRef.current?.focus()}
        onShowAll={handleOpen}
        limit={isCell ? CELL_VISIBLE_TAGS : undefined}
        reserveSpace={isCell}
        className={classNames({
          'mt-1.5 h-6 w-0 min-w-full flex-nowrap overflow-hidden': isCell,
          'min-w-0 flex-1 flex-wrap': !isCell,
        })}
      />

      <LineItemTagsPanel
        key={openCount}
        isOpen={isOpen}
        anchorRef={triggerRef}
        value={props.value}
        onChange={props.onChange}
        onClose={handleClose}
      />
    </div>
  );
}
