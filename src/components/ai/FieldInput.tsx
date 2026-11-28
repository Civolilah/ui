/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AiInput, AiOption } from '$app/common/interfaces/ai';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { InputField, SelectField } from '$app/components/forms';

interface Props {
  input: AiInput;
  value: string;
  options?: AiOption[];
  disabled?: boolean;
  onChange: (value: string, label: string) => unknown;
}

export function FieldInput({
  input,
  value,
  options,
  disabled,
  onChange,
}: Props) {
  const change = (next: string, label = next) => {
    if (next !== value) {
      onChange(next, label);
    }
  };

  if (input === 'client') {
    return (
      <ClientSelector
        value={value}
        readonly={disabled}
        onChange={(client) => change(client.id, client.display_name)}
      />
    );
  }

  if (input === 'select') {
    return (
      <SelectField
        value={value}
        disabled={disabled}
        onValueChange={(selected) =>
          change(
            selected,
            options?.find((option) => option.value === selected)?.label
          )
        }
        withBlank
      >
        {options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </SelectField>
    );
  }

  if (input === 'date') {
    return (
      <InputField
        type="date"
        value={value}
        disabled={disabled}
        onValueChange={change}
      />
    );
  }

  return (
    <InputField value={value} disabled={disabled} onValueChange={change} />
  );
}
