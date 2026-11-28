/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { MdCheck } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { Icon } from '$app/components/icons/Icon';
import { Spinner } from '$app/components/Spinner';
import { AiEntry, useAiAssistant } from './common/hooks';
import { FieldInput } from './FieldInput';
import { PlanSummary } from './PlanSummary';

interface Props {
  entry: AiEntry;
  isActive: boolean;
  isLast: boolean;
}

export function ChatEntry({ entry, isActive, isLast }: Props) {
  const colors = useColorScheme();
  const { send, isBusy } = useAiAssistant();

  if (entry.type === 'message') {
    return (
      <div
        className="ml-auto w-fit max-w-[85%] rounded-lg px-3 py-2 text-sm"
        style={{ backgroundColor: colors.$15 }}
      >
        {entry.text}
      </div>
    );
  }

  if (entry.type === 'status') {
    return (
      <div
        className="flex items-center space-x-2 text-xs"
        style={{ color: colors.$22 }}
      >
        {isBusy && isLast ? (
          <Spinner />
        ) : (
          <Icon element={MdCheck} size={16} color={colors.$22} />
        )}

        <span>{entry.label}</span>
      </div>
    );
  }

  if (entry.type === 'question') {
    return (
      <div className="space-y-2 text-sm">
        <p>{entry.text}</p>

        {isActive && entry.input !== 'text' && (
          <FieldInput
            input={entry.input}
            value=""
            options={entry.options}
            disabled={isBusy}
            onChange={(value, label) => send(label, value)}
          />
        )}
      </div>
    );
  }

  if (entry.type === 'plan') {
    return <PlanSummary plan={entry} isActive={isActive} />;
  }

  return <p className="text-sm text-red-500">{entry.message}</p>;
}
