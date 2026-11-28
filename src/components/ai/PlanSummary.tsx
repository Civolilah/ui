/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Alert } from '$app/components/Alert';
import { Button } from '$app/components/forms';
import { AiPlanEntry, useAiAssistant } from './common/hooks';
import { FieldInput } from './FieldInput';
import { OpenInEditor } from './OpenInEditor';
import { PlanOutcome } from './PlanOutcome';

interface Props {
  plan: AiPlanEntry;
  isActive: boolean;
}

export function PlanSummary({ plan, isActive }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { edit, confirm, cancel, isBusy } = useAiAssistant();

  const isEditable = isActive && plan.editable;

  return (
    <div
      className="rounded-md border text-sm"
      style={{ borderColor: colors.$24 }}
    >
      <div
        className="border-b px-4 py-3 font-medium"
        style={{ borderColor: colors.$24 }}
      >
        {plan.summary.title}
      </div>

      <div className="space-y-2 px-4 py-3">
        {plan.summary.fields.map((field) => (
          <div key={field.key} className="grid grid-cols-5 items-center gap-2">
            <span className="col-span-2" style={{ color: colors.$22 }}>
              {field.label}
            </span>

            <div className="col-span-3">
              {isEditable && field.input ? (
                <FieldInput
                  input={field.input}
                  value={field.value}
                  options={field.options}
                  disabled={isBusy}
                  onChange={(value) => edit(plan, field.key, value)}
                />
              ) : (
                field.text
              )}
            </div>
          </div>
        ))}
      </div>

      {plan.summary.items?.map((item, index) => (
        <div
          key={index}
          className="flex items-center justify-between space-x-4 border-t px-4 py-2"
          style={{ borderColor: colors.$24 }}
        >
          <div>
            <div>{item.label}</div>
            <div className="text-xs" style={{ color: colors.$22 }}>
              {item.detail}
            </div>
          </div>

          <span>{item.value}</span>
        </div>
      ))}

      {plan.warnings.map((warning) => (
        <div key={warning} className="px-4 pb-3">
          <Alert type="warning" disableClosing>
            {warning}
          </Alert>
        </div>
      ))}

      <PlanOutcome plan={plan} />

      {isEditable && (
        <div
          className="flex justify-end space-x-2 border-t px-4 py-3"
          style={{ borderColor: colors.$24 }}
        >
          <OpenInEditor plan={plan} disabled={isBusy} />

          <Button
            type="secondary"
            behavior="button"
            onClick={() => cancel(plan)}
            disabled={isBusy}
            disableWithoutIcon
          >
            {t('cancel')}
          </Button>

          <Button
            behavior="button"
            onClick={() => confirm(plan)}
            disabled={isBusy}
          >
            {t('confirm')}
          </Button>
        </div>
      )}
    </div>
  );
}
