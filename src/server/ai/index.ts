/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosError } from 'axios';
import { t } from 'i18next';
import { v4 } from 'uuid';
import {
  AiAccess,
  AiCreated,
  AiEvent,
  AiFailure,
  AiPlan,
  AiQuestion,
} from '$app/common/interfaces/ai';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { inputOf, isMissing, resolve } from './fields';
import { isConfigured } from './llm';
import { Module, Values } from './module';
import { modules } from './modules';
import { extractValues, selectModule } from './understand';

export { usage } from './llm';

interface Conversation {
  messages: string[];
  plan?: Plan;
}

interface Plan {
  id: string;
  conversation: Conversation;
  module: Module;
  status:
    | 'collecting'
    | 'ready'
    | 'confirmed'
    | 'executing'
    | 'done'
    | 'failed'
    | 'cancelled';
  version: number;
  values: Values;
  question?: AiQuestion;
  data?: unknown;
}

const HISTORY = 6;

const conversations = new Map<string, Conversation>();
const plans = new Map<string, Plan>();

const conversationOf = (id: string) => {
  const conversation = conversations.get(id) ?? { messages: [] };

  conversations.set(id, conversation);

  return conversation;
};

const activePlan = ({ plan }: Conversation) => {
  return plan?.status === 'collecting' || plan?.status === 'ready'
    ? plan
    : undefined;
};

const createPlan = (conversation: Conversation, module: Module): Plan => {
  return {
    id: v4(),
    conversation,
    module,
    status: 'collecting',
    version: 0,
    values: {},
  };
};

const activate = (plan: Plan) => {
  const active = activePlan(plan.conversation);

  if (active && active !== plan) {
    active.status = 'cancelled';
  }

  plans.set(plan.id, plan);
  plan.conversation.plan = plan;
};

const planEvent = (plan: Plan): AiPlan => {
  return {
    type: 'plan',
    planId: plan.id,
    version: plan.version,
    module: plan.module.key,
    summary: plan.module.summary(plan.data),
    warnings: plan.module.validate(plan.data),
    editable: plan.status === 'ready',
  };
};

const ask = (plan: Plan, question: AiQuestion) => {
  plan.status = 'collecting';
  plan.question = question;
  plan.conversation.messages.push(`Assistant: ${question.text}`);

  return question;
};

const apply = async (plan: Plan, extracted: Values) => {
  const questions: AiQuestion[] = [];

  for (const field of plan.module.fields) {
    const resolution = await resolve(field, extracted[field.key], plan.values);

    if (resolution && 'question' in resolution) {
      delete plan.values[field.key];
      questions.push({
        type: 'question',
        field: field.key,
        ...resolution.question,
      });
    } else if (resolution) {
      plan.values[field.key] = resolution.value;
    }
  }

  return questions;
};

const messageOf = (error: unknown) => {
  const bag = (error as AxiosError<ValidationBag>).response?.data;

  return (
    Object.values(bag?.errors ?? {}).flat()[0] ??
    bag?.message ??
    (error as Error).message
  );
};

const review = async (
  plan: Plan,
  questions: AiQuestion[] = []
): Promise<AiEvent> => {
  const field = plan.module.fields.find((item) => isMissing(item, plan.values));

  if (field) {
    return ask(
      plan,
      questions.find((question) => question.field === field.key) ?? {
        type: 'question',
        field: field.key,
        text: t(field.question ?? field.key),
        input: inputOf(field),
        options: field.options,
      }
    );
  }

  plan.data = await plan.module.prepare(plan.values);
  plan.status = 'ready';
  plan.version += 1;
  plan.question = undefined;

  return planEvent(plan);
};

export async function* sendMessage(
  conversationId: string,
  text: string,
  value?: string
): AsyncGenerator<AiEvent> {
  const conversation = conversationOf(conversationId);
  const history = conversation.messages.slice(-HISTORY);
  const active = activePlan(conversation);

  conversation.messages.push(`User: ${text}`);

  if (active?.question && value !== undefined) {
    active.values[active.question.field] = value;

    yield await review(active);

    return;
  }

  yield { type: 'status', label: t('ai_reading_request') };

  const selected = await selectModule({
    message: text,
    history,
    active: active?.module,
  });

  if (!selected) {
    yield { type: 'error', message: t('ai_unsupported_request') };

    return;
  }

  const plan =
    selected.isNew || !active
      ? createPlan(conversation, selected.module)
      : active;

  const values = await extractValues(plan.module, {
    message: text,
    history,
    values: plan.values,
    question: plan.question,
  });

  yield { type: 'status', label: t('ai_checking_details') };

  const event = await review(plan, await apply(plan, values));

  activate(plan);

  yield event;
}

export async function* updatePlan(
  planId: string,
  field: string,
  value: unknown
): AsyncGenerator<AiEvent> {
  const plan = plans.get(planId);

  const isEditable =
    plan?.status === 'ready' &&
    plan.module
      .summary(plan.data)
      .fields.some((item) => item.key === field && item.input);

  if (!plan || !isEditable) {
    yield { type: 'error', message: t('ai_plan_unavailable') };

    return;
  }

  plan.values[field] = value;

  yield await review(plan);
}

export async function* confirmPlan(
  planId: string,
  version: number
): AsyncGenerator<AiEvent> {
  const plan = plans.get(planId);

  if (plan?.status !== 'ready') {
    return;
  }

  if (plan.version !== version) {
    yield { type: 'error', message: t('ai_plan_changed') };

    return;
  }

  plan.status = 'confirmed';

  yield planEvent(plan);

  const tasks = plan.module.tasks(plan.data);
  const created: AiCreated[] = [];
  const failed: AiFailure[] = [];

  plan.status = 'executing';

  yield { type: 'progress', planId, done: 0, total: tasks.length };

  for (const task of tasks) {
    try {
      created.push(await task.run());
    } catch (error) {
      failed.push({ label: task.label, message: messageOf(error) });
    }

    yield {
      type: 'progress',
      planId,
      done: created.length + failed.length,
      total: tasks.length,
    };
  }

  plan.status = created.length ? 'done' : 'failed';

  yield { type: 'result', planId, created, failed };
}

export async function* cancelPlan(planId: string): AsyncGenerator<AiEvent> {
  const plan = plans.get(planId);

  if (plan?.status !== 'ready') {
    return;
  }

  plan.status = 'cancelled';

  yield planEvent(plan);
  yield { type: 'status', label: t('cancelled') };
}

export const draftPlan = async (planId: string) => {
  const plan = plans.get(planId);

  if (plan?.status !== 'ready' || !plan.module.draft) {
    return undefined;
  }

  plan.status = 'cancelled';

  return plan.module.draft(plan.data);
};

export const access = (): AiAccess[] => {
  return isConfigured()
    ? modules.map(({ permission, bitmask }) => ({ permission, bitmask }))
    : [];
};
