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
import { v4 } from 'uuid';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { $refetch } from '$app/common/hooks/useRefetch';
import {
  AiError,
  AiEvent,
  AiPlan,
  AiProgress,
  AiQuestion,
  AiResult,
  AiStatus,
} from '$app/common/interfaces/ai';
import {
  access,
  cancelPlan,
  confirmPlan,
  draftPlan,
  sendMessage,
  updatePlan,
  usage,
} from '$app/common/queries/ai';

export interface AiPlanEntry extends AiPlan {
  progress?: AiProgress;
  result?: AiResult;
}

export type AiEntry = (
  | { type: 'message'; text: string }
  | AiStatus
  | AiQuestion
  | AiPlanEntry
  | AiError
) & { id: string };

interface Assistant {
  conversationId: string;
  entries: AiEntry[];
  isOpen: boolean;
  isBusy: boolean;
  isMock: boolean;
}

const assistantAtom = atom<Assistant>({
  conversationId: v4(),
  entries: [],
  isOpen: false,
  isBusy: false,
  isMock: false,
});

const merge = (
  entries: AiEntry[],
  event: AiEvent | { type: 'message'; text: string }
): AiEntry[] => {
  if (event.type === 'progress' || event.type === 'result') {
    return entries.map((entry) => {
      if (entry.type !== 'plan' || entry.planId !== event.planId) {
        return entry;
      }

      return event.type === 'progress'
        ? { ...entry, progress: event }
        : { ...entry, result: event };
    });
  }

  return [
    ...entries.filter(
      (entry) =>
        event.type !== 'plan' ||
        entry.type !== 'plan' ||
        entry.planId !== event.planId
    ),
    { ...event, id: v4() },
  ];
};

export function useIsAiAvailable() {
  const hasPermission = useHasPermission();
  const enabled = useEnabled();

  return access().some(
    ({ permission, bitmask }) => hasPermission(permission) && enabled(bitmask)
  );
}

export function useAiAssistant() {
  const [assistant, setAssistant] = useAtom(assistantAtom);

  const append = (event: AiEvent | { type: 'message'; text: string }) => {
    setAssistant((current) => ({
      ...current,
      entries: merge(current.entries, event),
    }));
  };

  const run = async (events: AsyncIterable<AiEvent>) => {
    setAssistant((current) => ({ ...current, isBusy: true }));

    try {
      for await (const event of events) {
        append(event);

        if (event.type === 'result') {
          $refetch(event.created.map((created) => created.entity));
        }
      }
    } catch (error) {
      append({ type: 'error', message: (error as Error).message });
    }

    const { provider, runs } = await usage();

    setAssistant((current) => ({
      ...current,
      isBusy: false,
      isMock: (runs.at(-1)?.provider ?? provider) === 'mock',
    }));
  };

  return {
    ...assistant,
    setIsOpen: (isOpen: boolean) => {
      setAssistant((current) => ({ ...current, isOpen }));
    },
    send: (text: string, value?: string) => {
      setAssistant((current) => ({ ...current, isOpen: true }));
      append({ type: 'message', text });

      return run(sendMessage(assistant.conversationId, text, value));
    },
    edit: (plan: AiPlan, field: string, value: string) => {
      return run(updatePlan(plan.planId, field, value));
    },
    confirm: (plan: AiPlan) => {
      return run(confirmPlan(plan.planId, plan.version));
    },
    cancel: (plan: AiPlan) => {
      return run(cancelPlan(plan.planId));
    },
    openInEditor: async (plan: AiPlan) => {
      const draft = await draftPlan(plan.planId);

      if (draft) {
        setAssistant((current) => ({
          ...current,
          isOpen: false,
          entries: merge(current.entries, { ...plan, editable: false }),
        }));
      }

      return draft;
    },
  };
}
