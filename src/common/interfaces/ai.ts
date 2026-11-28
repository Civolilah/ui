/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ModuleBitmask } from '$app/common/enums/module-bitmask';
import { Permissions } from '$app/common/hooks/permissions/useHasPermission';
import { RefetchKey } from '$app/common/hooks/useRefetch';

export interface AiAccess {
  permission: Permissions;
  bitmask: ModuleBitmask;
}

export type AiInput = 'text' | 'date' | 'select' | 'client';

export interface AiOption {
  value: string;
  label: string;
}

export interface AiSummaryField {
  key: string;
  label: string;
  value: string;
  text: string;
  input?: AiInput;
  options?: AiOption[];
}

export interface AiSummaryItem {
  label: string;
  detail: string;
  value: string;
}

export interface AiSummary {
  title: string;
  fields: AiSummaryField[];
  items?: AiSummaryItem[];
}

export interface AiCreated {
  entity: RefetchKey;
  id: string;
  label: string;
}

export interface AiFailure {
  label: string;
  message: string;
}

export interface AiStatus {
  type: 'status';
  label: string;
}

export interface AiQuestion {
  type: 'question';
  field: string;
  text: string;
  input: AiInput;
  options?: AiOption[];
}

export interface AiPlan {
  type: 'plan';
  planId: string;
  version: number;
  module: string;
  summary: AiSummary;
  warnings: string[];
  editable: boolean;
}

export interface AiProgress {
  type: 'progress';
  planId: string;
  done: number;
  total: number;
}

export interface AiResult {
  type: 'result';
  planId: string;
  created: AiCreated[];
  failed: AiFailure[];
}

export interface AiError {
  type: 'error';
  message: string;
}

export type AiEvent =
  | AiStatus
  | AiQuestion
  | AiPlan
  | AiProgress
  | AiResult
  | AiError;

export interface AiRun {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface AiUsage {
  provider: string;
  model: string;
  runs: AiRun[];
}
