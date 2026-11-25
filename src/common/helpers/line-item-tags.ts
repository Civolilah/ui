/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Product } from '$app/common/interfaces/product';
import {
  resolveTagEntityType,
  TAG_ENTITY_TYPES,
  Tag,
  TagOption,
} from '$app/common/interfaces/tag';

interface TagOptionEntry {
  option: TagOption;
  isProductTag: boolean;
}

export const normalizeLineItemTagName = (name: string) => {
  return name.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
};

export const uniqueLineItemTagNames = (names: string[]) => {
  const normalizedNames = names
    .map((name) => normalizeLineItemTagName(name))
    .filter(Boolean);

  return Array.from(new Set(normalizedNames));
};

export const parseLineItemTags = (tags: string | undefined | null) => {
  if (typeof tags !== 'string') {
    return [];
  }

  return uniqueLineItemTagNames(tags.split(','));
};

export const serializeLineItemTags = (names: string[]) => {
  return uniqueLineItemTagNames(names).join(',');
};

export const productLineItemTags = (product: Product) => {
  return serializeLineItemTags((product.tags ?? []).map((tag) => tag.name));
};

export const dedupeLineItemTagOptions = (tags: Tag[]) => {
  const options = new Map<string, TagOptionEntry>();

  tags.forEach((tag) => {
    const name = normalizeLineItemTagName(tag.name);

    if (!name) {
      return;
    }

    const isProductTag =
      resolveTagEntityType(tag.entity_type) === TAG_ENTITY_TYPES.product;

    const existing = options.get(name);

    if (existing?.isProductTag) {
      return;
    }

    if (existing && !isProductTag) {
      return;
    }

    options.set(name, { option: { name, color: tag.color }, isProductTag });
  });

  return Array.from(options.values()).map(({ option }) => option);
};

export const resolveLineItemTagOptions = (
  names: string[],
  options: TagOption[]
) => {
  return names.map((name): TagOption => {
    const option = options.find((current) => current.name === name);

    if (option) {
      return option;
    }

    return { name, color: null, isLegacy: true };
  });
};
