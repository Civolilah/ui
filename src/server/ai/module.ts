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
import {
  AiCreated,
  AiOption,
  AiQuestion,
  AiSummary,
} from '$app/common/interfaces/ai';

export type Values = Record<string, unknown>;

export type Resolution =
  | { value: unknown }
  | { question: Omit<AiQuestion, 'type' | 'field'> };

export interface Field {
  key: string;
  type: 'text' | 'number' | 'date' | 'client' | 'list';
  description: string;
  required?: boolean;
  when?(values: Values): boolean;
  question?: string;
  options?: AiOption[];
  after?: string;
  fields?: Field[];
  resolve?(value: unknown, values: Values): Promise<Resolution | undefined>;
}

export interface Task {
  label: string;
  run: () => Promise<AiCreated>;
}

export interface Module<Input extends Values = Values, Data = unknown> {
  key: string;
  description: string;
  permission: Permissions;
  bitmask: ModuleBitmask;
  fields: Field[];
  prepare(values: Input): Promise<Data>;
  validate(data: Data): string[];
  summary(data: Data): AiSummary;
  tasks(data: Data): Task[];
  draft?(data: Data): object;
}
