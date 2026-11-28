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
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { ChatPanel } from './ChatPanel';
import { useAiAssistant, useIsAiAvailable } from './common/hooks';
import { Composer } from './Composer';

export function AiAssistant() {
  const { isOpen } = useAiAssistant();
  const isAvailable = useIsAiAvailable();
  const reactSettings = useReactSettings();

  if (!isAvailable) {
    return null;
  }

  if (isOpen) {
    return <ChatPanel />;
  }

  return (
    <div
      className={classNames(
        'pointer-events-none fixed inset-x-0 bottom-4 z-10 flex justify-center px-4',
        reactSettings.show_mini_sidebar ? 'md:left-16' : 'md:left-64'
      )}
    >
      <div className="pointer-events-auto w-full max-w-xl">
        <Composer />
      </div>
    </div>
  );
}
