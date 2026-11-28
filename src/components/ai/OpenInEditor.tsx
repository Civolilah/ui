/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useSetAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useInvoiceEditorPaths } from '$app/common/hooks/useInvoiceEditor';
import { usePreventNavigation } from '$app/common/hooks/usePreventNavigation';
import { AiPlan } from '$app/common/interfaces/ai';
import { Invoice } from '$app/common/interfaces/invoice';
import { Button } from '$app/components/forms';
import { invoiceAtom } from '$app/pages/invoices/common/atoms';
import { useAiAssistant } from './common/hooks';

interface Props {
  plan: AiPlan;
  disabled: boolean;
}

export function OpenInEditor({ plan, disabled }: Props) {
  const [t] = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const setInvoice = useSetAtom(invoiceAtom);
  const invoicePaths = useInvoiceEditorPaths();
  const preventNavigation = usePreventNavigation();
  const { openInEditor } = useAiAssistant();

  if (
    plan.module !== 'invoice.create' ||
    location.pathname.startsWith(invoicePaths.create)
  ) {
    return null;
  }

  const open = () => {
    preventNavigation({
      fn: async () => {
        const draft = await openInEditor(plan);

        if (draft) {
          setInvoice(cloneDeep(draft) as Invoice);
          navigate(`${invoicePaths.create}?action=clone`);
        }
      },
    });
  };

  return (
    <Button
      type="minimal"
      behavior="button"
      onClick={open}
      disabled={disabled}
      disableWithoutIcon
    >
      {t('ai_open_in_editor')}
    </Button>
  );
}
