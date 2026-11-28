/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAutoAwesome, MdCloseFullscreen } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { Badge } from '$app/components/Badge';
import { Icon } from '$app/components/icons/Icon';
import { ChatEntry } from './ChatEntry';
import { AiEntry, useAiAssistant } from './common/hooks';
import { Composer } from './Composer';

export function ChatPanel() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { entries, isMock, setIsOpen } = useAiAssistant();

  const endRef = useRef<HTMLDivElement>(null);

  const pending = [...entries]
    .reverse()
    .find((entry) => entry.type === 'plan' || entry.type === 'question');

  const isVisible = (entry: AiEntry, index: number) => {
    return (
      entry.type !== 'status' ||
      entries.slice(index + 1).every((next) => next.type === 'status')
    );
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [entries]);

  return (
    <div
      className="fixed bottom-0 right-0 top-16 z-10 flex w-full flex-col border-l shadow-xl sm:w-96"
      style={{
        backgroundColor: colors.$1,
        borderColor: colors.$24,
        color: colors.$3,
      }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: colors.$24 }}
      >
        <div className="flex items-center space-x-2">
          <Icon element={MdAutoAwesome} size={18} />

          <span className="font-medium">{t('ai_assistant')}</span>

          {isMock && <Badge variant="yellow">{t('ai_mock_mode')}</Badge>}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          title={t('collapse') ?? ''}
        >
          <Icon element={MdCloseFullscreen} size={18} color={colors.$16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {entries.map(
          (entry, index) =>
            isVisible(entry, index) && (
              <ChatEntry
                key={entry.id}
                entry={entry}
                isActive={entry.id === pending?.id}
                isLast={index === entries.length - 1}
              />
            )
        )}

        <div ref={endRef} />
      </div>

      <div className="border-t p-3" style={{ borderColor: colors.$24 }}>
        <Composer autoFocus />
      </div>
    </div>
  );
}
