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

export const gemini = (model: string): Provider => {
  return {
    name: 'gemini',
    model,
    generate: async ({ instructions, prompt, schema }) => {
      const response = await post(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        { 'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY },
        {
          systemInstruction: { parts: [{ text: instructions }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: schema,
            maxOutputTokens: MAX_OUTPUT_TOKENS,
          },
        }
      );

      const [candidate] = response.candidates ?? [];
      const text = candidate?.content?.parts?.[0]?.text;

      if (!text || candidate.finishReason !== 'STOP') {
        throw new LlmError(
          0,
          response.promptFeedback?.blockReason ?? candidate?.finishReason ?? ''
        );
      }

      const {
        promptTokenCount = 0,
        candidatesTokenCount = 0,
        thoughtsTokenCount = 0,
      } = response.usageMetadata;

      return {
        data: JSON.parse(text),
        inputTokens: promptTokenCount,
        outputTokens: candidatesTokenCount + thoughtsTokenCount,
      };
    },
  };
};
