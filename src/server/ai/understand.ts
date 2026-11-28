/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AiQuestion } from '$app/common/interfaces/ai';
import { knownValues, schemaOf } from './fields';
import { generate } from './llm';
import { Module, Values } from './module';
import { modules } from './modules';

const INSTRUCTIONS = [
  'You are the assistant inside Invoice Ninja, an invoicing app.',
  'Fill in the JSON schema from the user message.',
  'Only fill in what the user actually said, use null for everything else and never invent values.',
  'Write any text in the language of the user.',
].join(' ');

interface Input {
  message: string;
  history: string[];
}

const lines = (parts: (string | false | undefined)[]) => {
  return parts.filter(Boolean).join('\n');
};

export const selectModule = async ({
  message,
  history,
  active,
}: Input & { active?: Module }) => {
  const choices = [
    ...(active ? ['continue'] : []),
    ...modules.map((module) => module.key),
    'none',
  ];

  const data = await generate({
    name: 'module',
    instructions: INSTRUCTIONS,
    prompt: lines([
      'Which task is the message about?',
      active &&
        `- continue: the message answers the last question or changes a detail of the unfinished ${active.key}`,
      ...modules.map((module) => `- ${module.key}: ${module.description}`),
      '- none: something else',
      active &&
        'A request to create something starts a new task, even when it is the same kind as the unfinished one.',
      ...history,
      `Message: ${message}`,
    ]),
    schema: {
      type: 'object',
      properties: { module: { type: 'string', enum: choices } },
      required: ['module'],
      additionalProperties: false,
    },
    message,
  });

  if (active && data.module === 'continue') {
    return { module: active, isNew: false };
  }

  const module = modules.find((item) => item.key === data.module);

  return module ? { module, isNew: true } : undefined;
};

export const extractValues = async (
  module: Module,
  {
    message,
    history,
    values = {},
    question,
  }: Input & { values?: Values; question?: AiQuestion }
) => {
  return generate({
    name: 'values',
    instructions: INSTRUCTIONS,
    prompt: lines([
      `Task: ${module.description}`,
      `Known values: ${JSON.stringify(knownValues(module.fields, values))}`,
      question && `Question: ${question.text}`,
      ...history,
      `Message: ${message}`,
    ]),
    schema: schemaOf(module.fields),
    message,
    question: question?.field,
  });
};
