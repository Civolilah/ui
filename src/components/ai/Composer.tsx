/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { atom, useAtom } from 'jotai';
import { FormEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdAutoAwesome, MdOpenInFull, MdSend } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { eventMatchesBinding } from '$app/common/helpers/keyboard-shortcuts';
import { getHeldKeys } from '$app/common/hooks/useHeldKeys';
import { isShortcutRecordingActive } from '$app/common/hooks/useShortcutRecorder';
import { Icon } from '$app/components/icons/Icon';
import { useAiAssistant } from './common/hooks';

interface Props {
  autoFocus?: boolean;
}

const draftAtom = atom('');

export function Composer({ autoFocus }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { send, isBusy, isOpen, entries, setIsOpen } = useAiAssistant();

  const [text, setText] = useAtom(draftAtom);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focus = (event: KeyboardEvent) => {
      if (
        !event.defaultPrevented &&
        !isShortcutRecordingActive() &&
        eventMatchesBinding(event, 'mod+k', getHeldKeys())
      ) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', focus);

    return () => window.removeEventListener('keydown', focus);
  }, []);

  const submit = (event: FormEvent) => {
    event.preventDefault();

    if (text.trim() && !isBusy) {
      send(text.trim());
      setText('');
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center space-x-2 rounded-lg border px-3 py-2 shadow-lg"
      style={{ backgroundColor: colors.$1, borderColor: colors.$24 }}
    >
      <Icon element={MdAutoAwesome} size={18} />

      <input
        ref={inputRef}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t('ai_placeholder') ?? ''}
        className="flex-1 border-0 bg-transparent p-0 text-sm focus:ring-0"
        style={{ color: colors.$3 }}
        autoFocus={autoFocus}
      />

      <button type="submit" disabled={isBusy || !text.trim()}>
        <Icon element={MdSend} size={18} />
      </button>

      {!isOpen && entries.length > 0 && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          title={t('ai_assistant') ?? ''}
        >
          <Icon element={MdOpenInFull} size={18} />
        </button>
      )}
    </form>
  );
}
