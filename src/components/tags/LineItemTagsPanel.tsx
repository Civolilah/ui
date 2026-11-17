/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import classNames from 'classnames';
import {
  ChangeEvent,
  KeyboardEvent,
  RefObject,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { endpoint, trans } from '$app/common/helpers';
import {
  dedupeLineItemTagOptions,
  normalizeLineItemTagName,
  parseLineItemTags,
  resolveLineItemTagOptions,
  serializeLineItemTags,
} from '$app/common/helpers/line-item-tags';
import { request } from '$app/common/helpers/request';
import { randomTagColor } from '$app/common/helpers/tags';
import { toast } from '$app/common/helpers/toast/toast';
import { useAdmin } from '$app/common/hooks/permissions/useHasPermission';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useValidateTagName } from '$app/common/hooks/useValidateTagName';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { Tag, TAG_ENTITY_TYPES, TagOption } from '$app/common/interfaces/tag';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTagsQuery } from '$app/common/queries/tags';
import { Alert } from '$app/components/Alert';
import { Plus } from '$app/components/icons/Plus';
import { Spinner } from '$app/components/Spinner';
import { isActiveTag, tagPillColor } from '$app/components/tags/TagPills';
import { LineItemTagChip } from './LineItemTagChip';

const PANEL_WIDTH = 320;
const PANEL_GAP = 6;
const VIEWPORT_MARGIN = 16;
const TAG_NAME_MAX_LENGTH = 191;

interface Placement {
  left: number;
  top?: number;
  bottom?: number;
  width: number;
  maxHeight: number;
}

interface Props {
  isOpen: boolean;
  anchorRef: RefObject<HTMLButtonElement>;
  value?: string;
  onChange: (value: string) => void;
  onClose: (restoreFocus: boolean) => void;
}

const isSamePlacement = (current: Placement | undefined, next: Placement) => {
  return (
    current?.left === next.left &&
    current?.top === next.top &&
    current?.bottom === next.bottom &&
    current?.width === next.width &&
    current?.maxHeight === next.maxHeight
  );
};

export function LineItemTagsPanel(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const listId = useId();

  const queryClient = useQueryClient();
  const reactSettings = useReactSettings();

  const { isAdmin } = useAdmin();
  const validateTagName = useValidateTagName();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [errors, setErrors] = useState<ValidationBag>();
  const [isCreating, setIsCreating] = useState(false);
  const [placement, setPlacement] = useState<Placement>();

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(props.value);
  const onChangeRef = useRef(props.onChange);
  const isOpenRef = useRef(props.isOpen);
  const isMountedRef = useRef(false);
  const pointerRef = useRef({ x: 0, y: 0 });

  const { data, isLoading, isError, refetch } = useTagsQuery({
    entityType: TAG_ENTITY_TYPES.product,
    enabled: props.isOpen,
  });

  const names = parseLineItemTags(props.value);

  const options = dedupeLineItemTagOptions(
    (data?.data ?? []).filter(isActiveTag)
  );

  const selectedOptions = data
    ? resolveLineItemTagOptions(names, options)
    : names.map((name): TagOption => ({ name, color: null }));

  const searchTerm = normalizeLineItemTagName(query).toLowerCase();
  const tagName = query.trim();

  const availableOptions = options.filter(
    (option) =>
      !names.includes(option.name) &&
      option.name.toLowerCase().includes(searchTerm)
  );

  const hasExactMatch =
    options.some((option) => option.name.toLowerCase() === searchTerm) ||
    names.some((name) => name.toLowerCase() === searchTerm);

  const canCreate =
    isAdmin &&
    Boolean(tagName) &&
    !hasExactMatch &&
    !isCreating &&
    !isLoading &&
    !isError;

  const rowsCount = availableOptions.length + (canCreate ? 1 : 0);
  const currentIndex = Math.min(activeIndex, rowsCount - 1);
  const isCreateRowActive =
    canCreate && currentIndex === availableOptions.length;

  const reposition = useCallback(() => {
    const anchor = props.anchorRef.current?.getBoundingClientRect();

    if (!anchor) {
      return;
    }

    const width = Math.min(
      PANEL_WIDTH,
      window.innerWidth - VIEWPORT_MARGIN * 2
    );

    const left = Math.min(
      Math.max(anchor.left, VIEWPORT_MARGIN),
      window.innerWidth - width - VIEWPORT_MARGIN
    );

    const spaceBelow =
      window.innerHeight - anchor.bottom - PANEL_GAP - VIEWPORT_MARGIN;
    const spaceAbove = anchor.top - PANEL_GAP - VIEWPORT_MARGIN;

    const next: Placement =
      spaceBelow >= spaceAbove
        ? {
            left,
            width,
            top: anchor.bottom + PANEL_GAP,
            maxHeight: spaceBelow,
          }
        : {
            left,
            width,
            bottom: window.innerHeight - anchor.top + PANEL_GAP,
            maxHeight: spaceAbove,
          };

    setPlacement((current) =>
      isSamePlacement(current, next) ? current : next
    );
  }, [props.anchorRef]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    valueRef.current = props.value;
    onChangeRef.current = props.onChange;
    isOpenRef.current = props.isOpen;
  }, [props.value, props.onChange, props.isOpen]);

  useLayoutEffect(() => {
    if (props.isOpen) {
      reposition();
    }
  }, [props.isOpen, props.value, reposition]);

  const isPlaced = Boolean(placement);

  useEffect(() => {
    if (props.isOpen && isPlaced) {
      inputRef.current?.focus();
    }
  }, [props.isOpen, isPlaced]);

  useEffect(() => {
    if (!props.isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        panelRef.current?.contains(target) ||
        props.anchorRef.current?.contains(target)
      ) {
        return;
      }

      props.onClose(false);
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as Node;

      if (
        panelRef.current?.contains(target) ||
        props.anchorRef.current?.contains(target)
      ) {
        return;
      }

      inputRef.current?.focus();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('focusin', handleFocusIn);
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [props.isOpen, props.onClose, props.anchorRef, reposition]);

  const addTag = (option: TagOption) => {
    props.onChange(serializeLineItemTags([...names, option.name]));

    setQuery('');
    setErrors(undefined);
  };

  const removeTag = (name: string) => {
    props.onChange(
      serializeLineItemTags(names.filter((current) => current !== name))
    );

    inputRef.current?.focus();
  };

  const createTag = () => {
    if (!canCreate) {
      return;
    }

    const commaErrors = validateTagName(tagName);

    if (commaErrors) {
      setErrors(commaErrors);

      return;
    }

    if ([...tagName].length > TAG_NAME_MAX_LENGTH) {
      const message = trans('maximum_length_is', {
        maxLength: TAG_NAME_MAX_LENGTH,
      });

      setErrors({ message, errors: { name: [message] } });

      return;
    }

    toast.processing();

    setErrors(undefined);
    setIsCreating(true);

    request('POST', endpoint('/api/v1/tags'), {
      entity_type: TAG_ENTITY_TYPES.product,
      name: tagName,
      color: randomTagColor(),
    })
      .then((response: GenericSingleResourceResponse<Tag>) => {
        toast.success('created_tag');

        const createdTag = response.data.data;

        queryClient.setQueryData<GenericManyResponse<Tag>>(
          ['/api/v1/tags', TAG_ENTITY_TYPES.product],
          (current) =>
            current && {
              ...current,
              data: [...current.data, createdTag],
            }
        );

        $refetch(['tags']);

        if (!isMountedRef.current) {
          return;
        }

        onChangeRef.current(
          serializeLineItemTags([
            ...parseLineItemTags(valueRef.current),
            createdTag.name,
          ])
        );

        setQuery('');

        refetch();
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422 && isOpenRef.current) {
          setErrors(error.response.data);
          toast.dismiss();
        }
      })
      .finally(() => setIsCreating(false));
  };

  const selectActiveRow = () => {
    if (isCreateRowActive) {
      createTag();

      return;
    }

    if (currentIndex >= 0 && currentIndex < availableOptions.length) {
      addTag(availableOptions[currentIndex]);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrors(undefined);
    setQuery(event.target.value);
    setActiveIndex(0);
  };

  const moveActiveRow = (index: number) => {
    setActiveIndex(index);

    document
      .getElementById(`${listId}-${index}`)
      ?.scrollIntoView({ block: 'nearest' });
  };

  const handleRowMouseMove = (
    event: { clientX: number; clientY: number },
    index: number
  ) => {
    if (
      event.clientX === pointerRef.current.x &&
      event.clientY === pointerRef.current.y
    ) {
      return;
    }

    pointerRef.current = { x: event.clientX, y: event.clientY };

    if (index !== currentIndex) {
      setActiveIndex(index);
    }
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing || event.keyCode === 229) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (rowsCount) {
        moveActiveRow((currentIndex + 1) % rowsCount);
      }

      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (rowsCount) {
        moveActiveRow(currentIndex <= 0 ? rowsCount - 1 : currentIndex - 1);
      }

      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      selectActiveRow();

      return;
    }

    if (event.key === 'Backspace' && !query && names.length) {
      removeTag(names[names.length - 1]);

      return;
    }

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        event.preventDefault();
      }

      props.onClose(true);
    }
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();

      props.onClose(true);
    }
  };

  if (!props.isOpen || !placement) {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      data-cy="lineItemTagsPanel"
      className="fixed z-50 flex flex-col overflow-hidden rounded-md border shadow-lg"
      style={{
        left: placement.left,
        top: placement.top,
        bottom: placement.bottom,
        width: placement.width,
        maxHeight: placement.maxHeight,
        backgroundColor: colors.$1,
        borderColor: colors.$24,
      }}
      onKeyDown={handlePanelKeyDown}
      onMouseDown={(event) =>
        event.target !== inputRef.current && event.preventDefault()
      }
    >
      {selectedOptions.length > 0 && (
        <div
          className="flex shrink-0 flex-wrap gap-1 border-b p-2"
          style={{ borderColor: colors.$24 }}
        >
          {selectedOptions.map((option) => (
            <LineItemTagChip
              key={option.name}
              option={option}
              onRemove={() => removeTag(option.name)}
            />
          ))}
        </div>
      )}

      <div className="shrink-0 p-2">
        <input
          ref={inputRef}
          data-cy="lineItemTagsSearch"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            rowsCount && currentIndex >= 0
              ? `${listId}-${currentIndex}`
              : undefined
          }
          aria-label={String(t('tags'))}
          className={classNames(
            'w-full rounded-md border px-2 py-1.5 text-sm focus:outline-none focus:ring-0',
            {
              'border-[#09090B26] focus:border-black': !reactSettings.dark_mode,
              'border-[#1f2e41] focus:border-white': reactSettings.dark_mode,
            }
          )}
          style={{
            backgroundColor: colors.$1,
            color: colors.$3,
          }}
          value={query}
          placeholder={String(t('search'))}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />

        {(errors?.errors?.name ?? errors?.message) && (
          <Alert className="mt-2" type="danger">
            {errors?.errors?.name ?? errors?.message}
          </Alert>
        )}
      </div>

      <div
        id={listId}
        role="listbox"
        aria-multiselectable="true"
        className="min-h-0 flex-1 overflow-y-auto px-1 pb-1"
      >
        {availableOptions.map((option, index) => (
          <div
            key={option.name}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={false}
            data-cy="lineItemTagOption"
            className="flex cursor-pointer items-center gap-2 rounded-[0.1875rem] px-3 py-2 text-sm"
            style={{
              color: colors.$3,
              backgroundColor:
                index === currentIndex ? colors.$20 : 'transparent',
            }}
            onMouseMove={(event) => handleRowMouseMove(event, index)}
            onClick={() => addTag(option)}
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: tagPillColor(option) }}
            />

            <span className="truncate">{option.name}</span>
          </div>
        ))}

        {canCreate && (
          <div
            id={`${listId}-${availableOptions.length}`}
            role="option"
            aria-selected={false}
            data-cy="lineItemCreateTagOption"
            className="flex cursor-pointer items-center gap-2 rounded-[0.1875rem] px-3 py-2 text-sm font-medium"
            style={{
              color: colors.$3,
              backgroundColor: isCreateRowActive ? colors.$20 : 'transparent',
            }}
            onMouseMove={(event) =>
              handleRowMouseMove(event, availableOptions.length)
            }
            onClick={createTag}
          >
            <Plus size="0.85rem" color={colors.$16} />

            <span className="truncate">
              {t('create')} <q>{tagName}</q>
            </span>
          </div>
        )}

        {(isLoading || isCreating) && (
          <div className="flex items-center justify-center gap-2 px-3 py-2">
            <Spinner />
          </div>
        )}

        {isError && !isLoading && (
          <div
            className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
            style={{ color: colors.$17 }}
          >
            <span>{t('something_went_wrong')}</span>

            <button
              type="button"
              className="font-medium underline"
              style={{ color: colors.$3 }}
              onClick={() => refetch()}
            >
              {t('try_again')}
            </button>
          </div>
        )}

        {!isLoading && !isError && !isCreating && !rowsCount && (
          <div
            className="px-3 py-2 text-sm font-medium"
            style={{ color: colors.$17 }}
          >
            {t('no_records_found')}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
