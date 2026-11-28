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
import { MdCheckCircle, MdError } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import { useInvoiceEditorPaths } from '$app/common/hooks/useInvoiceEditor';
import { RefetchKey } from '$app/common/hooks/useRefetch';
import { AiCreated } from '$app/common/interfaces/ai';
import { Link } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { Spinner } from '$app/components/Spinner';
import { AiPlanEntry, useAiAssistant } from './common/hooks';

interface Props {
  plan: AiPlanEntry;
}

export function PlanOutcome({ plan }: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const invoicePaths = useInvoiceEditorPaths();
  const { setIsOpen } = useAiAssistant();

  const paths: Partial<Record<RefetchKey, string>> = {
    invoices: invoicePaths.edit,
  };

  const pathOf = ({ entity, id }: AiCreated) => {
    return route(paths[entity] ?? `/${entity}/:id/edit`, { id });
  };

  if (!plan.progress) {
    return null;
  }

  return (
    <div
      className="space-y-2 border-t px-4 py-3"
      style={{ borderColor: colors.$24 }}
    >
      {!plan.result && (
        <div className="flex items-center space-x-2">
          <Spinner />
          <span>
            {t('processing')} {plan.progress.done}/{plan.progress.total}
          </span>
        </div>
      )}

      {plan.result?.created.map((created) => (
        <div key={created.id} className="flex items-center space-x-2">
          <Icon element={MdCheckCircle} size={18} color="#22c55e" />

          <div onClick={() => setIsOpen(false)}>
            <Link to={pathOf(created)}>{created.label}</Link>
          </div>
        </div>
      ))}

      {plan.result?.failed.map((failure, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Icon element={MdError} size={18} color="#ef4444" />

          <span>
            {failure.label}: {failure.message}
          </span>
        </div>
      ))}
    </div>
  );
}
