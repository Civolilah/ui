/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import colors from '$app/common/constants/colors';
import {
  useDraftOrCommittedReactSettings,
  useUpdateDraftOrReactSettings,
} from '$app/common/hooks/useReactSettings';
import { ColorPicker } from '$app/components/forms/ColorPicker';
import { Element } from '../../../../components/cards';

export function AccentColor() {
  const [t] = useTranslation();

  const reactSettings = useDraftOrCommittedReactSettings();
  const updateSettings = useUpdateDraftOrReactSettings();

  return (
    <Element leftSide={t('accent_color')}>
      <ColorPicker
        value={reactSettings.accent_color || colors.primary}
        onValueChange={(color) => updateSettings('accent_color', color)}
      />
    </Element>
  );
}
