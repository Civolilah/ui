/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export const MAX_OUTPUT_TOKENS = 800;

export interface JsonSchema {
  type: string | string[];
  description?: string;
  enum?: (string | null)[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  additionalProperties?: boolean;
}

export interface LlmRequest {
  name: string;
  instructions: string;
  prompt: string;
  schema: JsonSchema;
  message: string;
  question?: string;
}

export interface LlmReply {
  data: Record<string, unknown>;
  inputTokens: number;
  outputTokens: number;
}

export interface Provider {
  name: string;
  model: string;
  generate: (request: LlmRequest) => Promise<LlmReply>;
}

export class LlmError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const post = async (
  url: string,
  headers: Record<string, string>,
  body: unknown
) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new LlmError(
      response.status,
      json.error?.message ?? response.statusText
    );
  }

  return json;
};
