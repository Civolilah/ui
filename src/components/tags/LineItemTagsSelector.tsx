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
import { KeyboardEvent, ReactNode, useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { parseLineItemTags } from '$app/common/helpers/line-item-tags';
import { LineItemTagChips } from './LineItemTagChips';
import { LineItemTagsPanel } from './LineItemTagsPanel';

const CELL_VISIBLE_TAGS = 1;

interface Props {
  layout: 'cell' | 'row';
  value?: string;
  onChange: (value: string) => void;
  children?: ReactNode;
}

export function LineItemTagsSelector(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { layout, value, onChange, children } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [openCount, setOpenCount] = useState<number>(0);

  const chipsRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const isCell = layout === 'cell';
  const tagsCount = parseLineItemTags(value).length;
  const visibleCount = isCell ? CELL_VISIBLE_TAGS : tagsCount;
  const hiddenCount = Math.max(tagsCount - visibleCount, 0);

  const triggerLabel =
    tagsCount > 0 ? `${t('tags')} (${tagsCount})` : String(t('tags'));

  const triggerText = hiddenCount > 0 ? `+${hiddenCount}` : '+';

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
    <div className={classNames('flex min-w-0', { 'w-full flex-col': isCell })}>
      {isCell && <div aria-hidden="true" className="mb-1.5 h-6" />}

      {children}

      <LineItemTagChips
        containerRef={chipsRef}
        value={value}
        onChange={onChange}
        onEmptied={() => triggerRef.current?.focus()}
        limit={visibleCount}
        className={classNames({
          'mt-1.5 h-6 w-0 min-w-full flex-nowrap': isCell,
          'min-w-0 flex-1 flex-wrap': !isCell,
        })}
      >
        <button
          ref={triggerRef}
          type="button"
          data-cy="lineItemTagsTrigger"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-label={triggerLabel}
          className="inline-flex h-6 shrink-0 items-center rounded-full border px-2 text-xs font-medium"
          style={{ borderColor: colors.$24, color: colors.$3 }}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
        >
          {triggerText}
        </button>
      </LineItemTagChips>

      <LineItemTagsPanel
        key={openCount}
        isOpen={isOpen}
        anchorRef={chipsRef}
        triggerRef={triggerRef}
        value={value}
        onChange={onChange}
        onClose={handleClose}
      />
    </div>
  );
}
