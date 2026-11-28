/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { describe, expect, it } from 'vitest';
import { usage } from '$app/server/ai/llm';
import { extractValues, selectModule } from '$app/server/ai/understand';

export interface EvalCase {
  text: string;
  module: string | null;
  values?: Record<string, unknown>;
  skipOnMock?: boolean;
}

const isEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return typeof value === 'object' && Object.values(value).every(isEmpty);
};

const mismatches = (
  expected: unknown,
  actual: unknown,
  path: string
): string[] => {
  if (expected === null) {
    return isEmpty(actual)
      ? []
      : [`${path}: expected nothing, got ${JSON.stringify(actual)}`];
  }

  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length
      ? expected.flatMap((item, index) =>
          mismatches(item, actual[index], `${path}[${index}]`)
        )
      : [
          `${path}: expected ${expected.length} items, got ${JSON.stringify(actual)}`,
        ];
  }

  if (typeof expected === 'object') {
    return Object.entries(expected as Record<string, unknown>).flatMap(
      ([key, value]) =>
        mismatches(
          value,
          (actual as Record<string, unknown> | null)?.[key],
          path ? `${path}.${key}` : key
        )
    );
  }

  if (typeof expected === 'string') {
    return String(actual ?? '')
      .toLowerCase()
      .includes(expected.toLowerCase())
      ? []
      : [`${path}: expected "${expected}", got ${JSON.stringify(actual)}`];
  }

  return actual === expected
    ? []
    : [`${path}: expected ${expected}, got ${JSON.stringify(actual)}`];
};

export const evaluate = async (cases: EvalCase[]) => {
  const { provider, model } = await usage();

  describe(`${provider} ${model}`, () => {
    for (const { text, module, values, skipOnMock } of cases) {
      it.skipIf(skipOnMock && provider === 'mock')(text, async () => {
        const before = (await usage()).runs.length;
        const selected = await selectModule({ message: text, history: [] });

        expect(selected?.module.key ?? null).toBe(module);

        if (selected && values) {
          const extracted = await extractValues(selected.module, {
            message: text,
            history: [],
          });

          expect(mismatches(values, extracted, '')).toEqual([]);
        }

        const { runs } = await usage();

        expect(
          runs.slice(before).filter((run) => run.provider !== provider)
        ).toEqual([]);
      });
    }
  });
};
