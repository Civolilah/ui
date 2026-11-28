/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { vi } from 'vitest';

const storage = () => {
  const items = new Map<string, string>();

  return {
    getItem: (key: string) => {
      return items.get(key) ?? null;
    },
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
    removeItem: (key: string) => {
      items.delete(key);
    },
    clear: () => {
      items.clear();
    },
  };
};

vi.stubGlobal('localStorage', storage());
vi.stubGlobal('sessionStorage', storage());
