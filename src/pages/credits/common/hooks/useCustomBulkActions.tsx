/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Credit } from '$app/common/interfaces/credit';
import { CustomBulkAction } from '$app/components/DataTable';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { useDownloadPdfs } from '$app/pages/invoices/common/hooks/useDownloadPdfs';
import { usePrintPdf } from '$app/pages/invoices/common/hooks/usePrintPdf';
import { useTranslation } from 'react-i18next';
import {
  MdCreditCard,
  MdDownload,
  MdMarkEmailRead,
  MdPrint,
} from 'react-icons/md';
import { SendEmailBulkAction } from '../components/SendEmailBulkAction';
import { CreditStatus } from '$app/common/enums/credit-status';
import { useBulk } from '$app/common/queries/credits';
import { toast } from '$app/common/helpers/toast/toast';
import { Dispatch, SetStateAction } from 'react';
import { useDocumentsBulk } from '$app/common/queries/documents';
import collect from 'collect.js';
import { useApplyCredits } from './useApplyCredits';

export const useCustomBulkActions = () => {
  const [t] = useTranslation();

  const bulk = useBulk();

  const documentsBulk = useDocumentsBulk();

  const applyCredits = useApplyCredits();

  const printPdf = usePrintPdf({ entity: 'credit' });
  const downloadPdfs = useDownloadPdfs({ entity: 'credit' });

  const showMarkSendOption = (credits: Credit[]) => {
    return !credits.some(
      ({ status_id, is_deleted }) =>
        status_id !== CreditStatus.Draft || is_deleted
    );
  };

  const shouldDownloadDocuments = (credits: Credit[]) => {
    return credits.some(({ documents }) => documents.length);
  };

  const getDocumentsIds = (credits: Credit[]) => {
    return credits.flatMap(({ documents }) => documents.map(({ id }) => id));
  };

  const handleDownloadDocuments = (
    selectedCredits: Credit[],
    setSelected?: Dispatch<SetStateAction<string[]>>
  ) => {
    const creditIds = getDocumentsIds(selectedCredits);

    documentsBulk(creditIds, 'download');
    setSelected?.([]);
  };

  const handleApplyCredits = (credits: Credit[]) => {
    if (credits.length) {
      const clientIds = collect(credits).pluck('client_id').unique().toArray();

      if (clientIds.length > 1) {
        return toast.error('multiple_client_error');
      }

      applyCredits(credits);
    }
  };

  const showApplyCreditsAction = (credits: Credit[]) => {
    return credits.every(
      ({ client_id, amount, status_id }) =>
        client_id && amount > 0 && status_id !== CreditStatus.Applied
    );
  };

  const customBulkActions: CustomBulkAction<Credit>[] = [
    (selectedIds, _, setSelected) => (
      <SendEmailBulkAction
        selectedIds={selectedIds}
        setSelected={setSelected}
      />
    ),
    (selectedIds, _, setSelected) => (
      <DropdownElement
        onClick={() => {
          printPdf(selectedIds);

          setSelected?.([]);
        }}
        icon={<Icon element={MdPrint} />}
      >
        {t('print_pdf')}
      </DropdownElement>
    ),
    (selectedIds, _, setSelected) => (
      <DropdownElement
        onClick={() => {
          downloadPdfs(selectedIds);

          setSelected?.([]);
        }}
        icon={<Icon element={MdDownload} />}
      >
        {t('download_pdf')}
      </DropdownElement>
    ),
    (selectedIds, selectedCredits, setSelected) =>
      selectedCredits &&
      showMarkSendOption(selectedCredits) && (
        <DropdownElement
          onClick={() => {
            bulk(selectedIds, 'mark_sent');

            setSelected?.([]);
          }}
          icon={<Icon element={MdMarkEmailRead} />}
        >
          {t('mark_sent')}
        </DropdownElement>
      ),
    (_, selectedCredits) =>
      selectedCredits &&
      showApplyCreditsAction(selectedCredits) && (
        <DropdownElement
          onClick={() => handleApplyCredits(selectedCredits)}
          icon={<Icon element={MdCreditCard} />}
        >
          {t('apply_credit')}
        </DropdownElement>
      ),
    (_, selectedCredits, setSelected) => (
      <DropdownElement
        onClick={() =>
          selectedCredits && shouldDownloadDocuments(selectedCredits)
            ? handleDownloadDocuments(selectedCredits, setSelected)
            : toast.error('no_documents_to_download')
        }
        icon={<Icon element={MdDownload} />}
      >
        {t('documents')}
      </DropdownElement>
    ),
  ];

  return customBulkActions;
};
