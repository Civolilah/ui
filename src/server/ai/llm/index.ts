/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AiRun, AiUsage } from '$app/common/interfaces/ai';
import { gemini } from './gemini';
import { mock } from './mock';
import { openai } from './openai';
import { LlmError, LlmReply, LlmRequest, Provider } from './provider';

const PRICES: Record<string, [number, number]> = {
  'gpt-6-luna': [0.1, 0.5],
  'gpt-5.6-luna': [0.2, 1.2],
  'gemini-3.1-flash-lite': [0.25, 1.5],
  'gemini-3.5-flash-lite': [0.3, 2.5],
};

const configured = (): Provider => {
  const model = import.meta.env.VITE_AI_MODEL;

  switch (import.meta.env.VITE_AI_PROVIDER || 'openai') {
    case 'openai':
      return import.meta.env.VITE_OPENAI_API_KEY
        ? openai(model || 'gpt-6-luna')
        : mock;
    case 'gemini':
      return import.meta.env.VITE_GEMINI_API_KEY
        ? gemini(model || 'gemini-3.1-flash-lite')
        : mock;
    default:
      return mock;
  }
};

const provider = configured();

const runs: AiRun[] = [];

const isAccessError = (error: unknown) => {
  return (
    error instanceof LlmError &&
    ([401, 402, 403, 429].includes(error.status) ||
      /api key/i.test(error.message))
  );
};

const reply = async (request: LlmRequest): Promise<[Provider, LlmReply]> => {
  try {
    return [provider, await provider.generate(request)];
  } catch (error) {
    if (!isAccessError(error)) {
      throw error;
    }

    return [mock, await mock.generate(request)];
  }
};

export const isConfigured = () => {
  return Boolean(
    import.meta.env.VITE_AI_PROVIDER ||
      import.meta.env.VITE_OPENAI_API_KEY ||
      import.meta.env.VITE_GEMINI_API_KEY
  );
};

export const generate = async (request: LlmRequest) => {
  const [served, { data, inputTokens, outputTokens }] = await reply(request);
  const [input, output] = PRICES[served.model] ?? [0, 0];

  runs.push({
    provider: served.name,
    model: served.model,
    inputTokens,
    outputTokens,
    cost: (inputTokens * input + outputTokens * output) / 1000000,
  });

  return data;
};

export const usage = async (): Promise<AiUsage> => {
  return { provider: provider.name, model: provider.model, runs: [...runs] };
};
