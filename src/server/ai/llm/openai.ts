/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { LlmError, MAX_OUTPUT_TOKENS, post, Provider } from './provider';

export const openai = (model: string): Provider => {
  return {
    name: 'openai',
    model,
    generate: async ({ name, instructions, prompt, schema }) => {
      const response = await post(
        'https://api.openai.com/v1/chat/completions',
        { Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` },
        {
          model,
          messages: [
            { role: 'system', content: instructions },
            { role: 'user', content: prompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: { name, schema, strict: true },
          },
          max_completion_tokens: MAX_OUTPUT_TOKENS,
          reasoning_effort: 'none',
        }
      );

      const [choice] = response.choices;

      if (!choice.message.content || choice.finish_reason !== 'stop') {
        throw new LlmError(0, choice.message.refusal ?? choice.finish_reason);
      }

      return {
        data: JSON.parse(choice.message.content),
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
      };
    },
  };
};
