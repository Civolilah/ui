/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtomValue } from 'jotai';
import colors from '$app/common/constants/colors';
import { draftOrCommittedReactSettingsAtom } from './useReactSettings';

const accentColorAtom = atom(
  (get) => get(draftOrCommittedReactSettingsAtom).accent_color
);

export function useAccentColor() {
  return useAtomValue(accentColorAtom) || colors.accent;
}
