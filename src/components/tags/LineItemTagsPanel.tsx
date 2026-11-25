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
  useEffect,
  useId,
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
  serializeLineItemTags,
  uniqueLineItemTagNames,
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
import { TAG_ENTITY_TYPES, Tag, TagOption } from '$app/common/interfaces/tag';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTagsQuery } from '$app/common/queries/tags';
import { Alert } from '$app/components/Alert';
import { Spinner } from '$app/components/Spinner';
import { LineItemCreateTagOption } from './LineItemCreateTagOption';
import { LineItemTagOption } from './LineItemTagOption';
import { isActiveTag } from './TagPills';
import { useLineItemTagsPlacement } from './useLineItemTagsPlacement';

interface Props {
  isOpen: boolean;
  anchorRef: RefObject<HTMLDivElement>;
  triggerRef: RefObject<HTMLButtonElement>;
  value?: string;
  onChange: (value: string) => void;
  onClose: (restoreFocus: boolean) => void;
}

export function LineItemTagsPanel(props: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const listId = useId();

  const queryClient = useQueryClient();
  const reactSettings = useReactSettings();

  const { isAdmin } = useAdmin();
  const validateTagName = useValidateTagName();

  const { isOpen, anchorRef, triggerRef, value, onChange, onClose } = props;

  const [query, setQuery] = useState<string>('');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [errors, setErrors] = useState<ValidationBag>();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [initialNames] = useState<string[]>(() => parseLineItemTags(value));

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const valueRef = useRef<string | undefined>(value);
  const onChangeRef = useRef<(value: string) => void>(onChange);
  const isOpenRef = useRef<boolean>(isOpen);
  const isMountedRef = useRef<boolean>(false);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const placement = useLineItemTagsPlacement({ anchorRef, isOpen, value });

  const { data, isLoading, isError, refetch } = useTagsQuery({
    entityType: TAG_ENTITY_TYPES.product,
    enabled: isOpen,
  });

  const selectedNames = parseLineItemTags(value);
  const hasTags = selectedNames.length > 0;
  const canRemoveLastTag = hasTags && !query;

  const options = dedupeLineItemTagOptions(
    (data?.data ?? []).filter(isActiveTag)
  );

  const optionNames = options.map((option) => option.name);

  const legacyOptions = uniqueLineItemTagNames([
    ...initialNames,
    ...selectedNames,
  ])
    .filter((name) => !optionNames.includes(name))
    .map((name): TagOption => ({ name, color: null, isLegacy: true }));

  const searchTerm = normalizeLineItemTagName(query).toLowerCase();
  const tagName = query.trim();

  const orderedOptions = [
    ...legacyOptions,
    ...options.filter((option) => initialNames.includes(option.name)),
    ...options.filter((option) => !initialNames.includes(option.name)),
  ];

  const matchingOptions = orderedOptions.filter((option) =>
    option.name.toLowerCase().includes(searchTerm)
  );

  const visibleOptions = data ? matchingOptions : [];

  const hasExactMatch = [
    ...optionNames,
    ...initialNames,
    ...selectedNames,
  ].some((name) => name.toLowerCase() === searchTerm);

  const isNewTagName = Boolean(tagName) && !hasExactMatch;
  const isTagListReady = !isLoading && !isError;
  const canCreate = isAdmin && isNewTagName && isTagListReady && !isCreating;

  const rowsCount = canCreate
    ? visibleOptions.length + 1
    : visibleOptions.length;

  const hasRows = rowsCount > 0;
  const currentIndex = Math.min(activeIndex, rowsCount - 1);
  const isCreateRowActive = canCreate && currentIndex === visibleOptions.length;

  const isBusy = isLoading || isCreating;
  const showLoadError = isError && !isLoading;
  const showEmpty = !hasRows && !isBusy && !isError;

  const errorMessage = errors?.errors?.name ?? errors?.message;
  const isPlaced = Boolean(placement);

  const optionId = (index: number) => {
    return `${listId}-${index}`;
  };

  const activeOptionId = hasRows ? optionId(currentIndex) : undefined;

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
    isOpenRef.current = isOpen;
  }, [value, onChange, isOpen]);

  useEffect(() => {
    if (isOpen && isPlaced) {
      inputRef.current?.focus();
    }
  }, [isOpen, isPlaced]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const isInsidePanelOrTrigger = (event: Event) => {
      const target = event.target as Node;

      return (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      );
    };

    const handleDocumentMouseDown = (event: MouseEvent) => {
      if (isInsidePanelOrTrigger(event)) {
        return;
      }

      onClose(false);
    };

    const handleDocumentFocusIn = (event: FocusEvent) => {
      if (isInsidePanelOrTrigger(event)) {
        return;
      }

      inputRef.current?.focus();
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('focusin', handleDocumentFocusIn);

    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      document.removeEventListener('focusin', handleDocumentFocusIn);
    };
  }, [isOpen, onClose, triggerRef]);

  const toggleTag = (option: TagOption) => {
    const isSelected = selectedNames.includes(option.name);

    const nextNames = isSelected
      ? selectedNames.filter((name) => name !== option.name)
      : [...selectedNames, option.name];

    const orderedNames = uniqueLineItemTagNames([
      ...initialNames,
      ...nextNames,
    ]).filter((name) => nextNames.includes(name));

    onChange(serializeLineItemTags(orderedNames));

    setErrors(undefined);
    inputRef.current?.select();
  };

  const removeLastTag = () => {
    onChange(serializeLineItemTags(selectedNames.slice(0, -1)));
  };

  const clearTags = () => {
    onChange('');

    setErrors(undefined);
    inputRef.current?.focus();
  };

  const createTag = () => {
    if (!canCreate) {
      return;
    }

    const validationErrors = validateTagName(tagName);

    if (validationErrors) {
      setErrors(validationErrors);

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
          (current) => {
            if (!current) {
              return current;
            }

            return { ...current, data: [...current.data, createdTag] };
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

    const activeOption = visibleOptions[currentIndex];

    if (activeOption) {
      toggleTag(activeOption);
    }
  };

  const moveActiveRow = (index: number) => {
    setActiveIndex(index);

    document
      .getElementById(optionId(index))
      ?.scrollIntoView({ block: 'nearest' });
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setErrors(undefined);
    setQuery(event.target.value);
    setActiveIndex(0);
  };

  const handleRowMouseMove = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
    const hasPointerMoved =
      event.clientX !== pointerRef.current.x ||
      event.clientY !== pointerRef.current.y;

    if (!hasPointerMoved) {
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

      if (hasRows) {
        moveActiveRow((currentIndex + 1) % rowsCount);
      }

      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (hasRows) {
        moveActiveRow((currentIndex - 1 + rowsCount) % rowsCount);
      }

      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();

      selectActiveRow();

      return;
    }

    if (event.key === 'Backspace') {
      if (!event.repeat && canRemoveLastTag) {
        removeLastTag();
      }

      return;
    }

    if (event.key === 'Tab') {
      if (event.shiftKey) {
        event.preventDefault();

        onClose(true);

        return;
      }

      if (hasTags) {
        event.preventDefault();

        clearButtonRef.current?.focus();

        return;
      }

      onClose(true);
    }
  };

  const handleClearKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Tab') {
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();

      inputRef.current?.focus();

      return;
    }

    onClose(true);
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();

      onClose(true);
    }
  };

  const handlePanelMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === inputRef.current) {
      return;
    }

    event.preventDefault();
  };

  if (!isOpen || !placement) {
    return null;
  }

  return createPortal(
    <div
      ref={panelRef}
      data-cy="lineItemTagsPanel"
      role="dialog"
      aria-label={String(t('tags'))}
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
      onMouseDown={handlePanelMouseDown}
    >
      <div className="shrink-0 p-2">
        <input
          ref={inputRef}
          data-cy="lineItemTagsSearch"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
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

        {errorMessage && (
          <Alert className="mt-2" type="danger">
            {errorMessage}
          </Alert>
        )}
      </div>

      <div
        className="flex shrink-0 items-center justify-between px-3 pb-2 text-xs"
        style={{ color: colors.$22 }}
      >
        <span>{trans('count_selected', { count: selectedNames.length })}</span>

        <button
          ref={clearButtonRef}
          type="button"
          data-cy="lineItemTagsClear"
          className={classNames('font-medium hover:underline', {
            invisible: !hasTags,
          })}
          style={{ color: colors.$3 }}
          tabIndex={hasTags ? 0 : -1}
          onClick={clearTags}
          onKeyDown={handleClearKeyDown}
        >
          {t('clear_all')}
        </button>
      </div>

      <div
        id={listId}
        role="listbox"
        aria-label={String(t('tags'))}
        aria-multiselectable="true"
        className="min-h-0 flex-1 overflow-y-auto border-t px-1 py-1"
        style={{ borderColor: colors.$24 }}
      >
        {visibleOptions.map((option, index) => (
          <LineItemTagOption
            key={option.name}
            id={optionId(index)}
            option={option}
            isSelected={selectedNames.includes(option.name)}
            isActive={index === currentIndex}
            onMouseMove={(event) => handleRowMouseMove(event, index)}
            onClick={() => toggleTag(option)}
          />
        ))}

        {canCreate && (
          <LineItemCreateTagOption
            id={optionId(visibleOptions.length)}
            tagName={tagName}
            isActive={isCreateRowActive}
            onMouseMove={(event) =>
              handleRowMouseMove(event, visibleOptions.length)
            }
            onClick={createTag}
          />
        )}

        {isBusy && (
          <div className="flex items-center justify-center px-3 py-2">
            <Spinner />
          </div>
        )}

        {showLoadError && (
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

        {showEmpty && (
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
