/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AiAccess, AiEvent, AiUsage } from '$app/common/interfaces/ai';
import * as server from '$app/server/ai';

export const sendMessage = (
  conversationId: string,
  text: string,
  value?: string
): AsyncIterable<AiEvent> => {
  return server.sendMessage(conversationId, text, value);
};

export const updatePlan = (
  planId: string,
  field: string,
  value: string
): AsyncIterable<AiEvent> => {
  return server.updatePlan(planId, field, value);
};

export const confirmPlan = (
  planId: string,
  version: number
): AsyncIterable<AiEvent> => {
  return server.confirmPlan(planId, version);
};

export const cancelPlan = (planId: string): AsyncIterable<AiEvent> => {
  return server.cancelPlan(planId);
};

export const draftPlan = (planId: string): Promise<object | undefined> => {
  return server.draftPlan(planId);
};

export const usage = (): Promise<AiUsage> => {
  return server.usage();
};

export const access = (): AiAccess[] => {
  return server.access();
};
