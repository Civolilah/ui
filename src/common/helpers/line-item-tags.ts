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
  Tag,
  TAG_ENTITY_TYPES,
  TagOption,
} from '$app/common/interfaces/tag';

export const normalizeLineItemTagName = (name: string) => {
  return name.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
};

export const lineItemTagNames = (names: string[]) => {
  const uniqueNames: string[] = [];

  names.forEach((name) => {
    const normalizedName = normalizeLineItemTagName(name);

    if (normalizedName && !uniqueNames.includes(normalizedName)) {
      uniqueNames.push(normalizedName);
    }
  });

  return uniqueNames;
};

export const parseLineItemTags = (tags: string | undefined | null) => {
  if (typeof tags !== 'string') {
    return [];
  }

  return lineItemTagNames(tags.split(','));
};

export const serializeLineItemTags = (names: string[]) => {
  return lineItemTagNames(names).join(',');
};

export const productLineItemTags = (product: Product) => {
  return serializeLineItemTags((product.tags ?? []).map((tag) => tag.name));
};

export const dedupeLineItemTagOptions = (tags: Tag[]) => {
  const options = new Map<
    string,
    { option: TagOption; isProductTag: boolean }
  >();

  tags.forEach((tag) => {
    const name = normalizeLineItemTagName(tag.name);

    if (!name) {
      return;
    }

    const isProductTag =
      resolveTagEntityType(tag.entity_type) === TAG_ENTITY_TYPES.product;

    const existing = options.get(name);

    if (!existing || (!existing.isProductTag && isProductTag)) {
      options.set(name, {
        option: { id: tag.id, name, color: tag.color },
        isProductTag,
      });
    }
  });

  return [...options.values()].map(({ option }) => option);
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
