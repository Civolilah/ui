/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { blankInvitation } from '$app/common/constants/blank-invitation';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { Spinner } from '$app/components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useSearchParams } from 'react-router-dom';
import { invoiceSumAtom, quoteAtom } from '../common/atoms';
import { useCreate, useQuoteUtilities } from '../common/hooks';
import { useBlankQuoteQuery } from '../common/queries';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Settings as CompanySettings } from '$app/common/interfaces/company.interface';
import { Quote } from '$app/common/interfaces/quote';
import { InvoiceSum } from '$app/common/helpers/invoices/invoice-sum';
import { InvoiceSumInclusive } from '$app/common/helpers/invoices/invoice-sum-inclusive';
import { Tab, Tabs } from '$app/components/Tabs';

export interface QuoteContext {
  quote: Quote | undefined;
  setQuote: Dispatch<SetStateAction<Quote | undefined>>;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  client: Client | undefined;
  invoiceSum: InvoiceSum | InvoiceSumInclusive | undefined;
}

export default function Create() {
  const { documentTitle } = useTitle('new_quote');
  const [t] = useTranslation();

  const pages: Page[] = [
    { name: t('quotes'), href: '/quotes' },
    {
      name: t('new_quote'),
      href: '/quotes/create',
    },
  ];

  const tabs: Tab[] = [
    {
      name: t('create'),
      href: '/quotes/create',
    },
    {
      name: t('documents'),
      href: '/quotes/create/documents',
    },
    {
      name: t('settings'),
      href: '/quotes/create/settings',
    },
  ];

  const company = useCurrentCompany();

  const [searchParams] = useSearchParams();

  const [quote, setQuote] = useAtom(quoteAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const clientResolver = useClientResolver();

  const { data, isLoading } = useBlankQuoteQuery({
    enabled: typeof quote === 'undefined',
  });

  const save = useCreate({ setErrors, isDefaultFooter, isDefaultTerms });
  const { handleChange, calculateInvoiceSum } = useQuoteUtilities({ client });

  const settingResolver = (client: Client, prop: string) => {
    if (client?.settings && client?.settings[prop]) {
      return client.settings[prop];
    }

    if (client?.group_settings && client?.group_settings?.settings[prop]) {
      return client?.group_settings?.settings[prop];
    }

    return company?.settings[prop as keyof CompanySettings];
  };

  useEffect(() => {
    setQuote((current) => {
      let value = current;

      if (searchParams.get('action') !== 'clone') {
        value = undefined;
      }

      if (
        typeof data !== 'undefined' &&
        typeof value === 'undefined' &&
        searchParams.get('action') !== 'clone'
      ) {
        const _quote = cloneDeep(data);

        if (typeof _quote.line_items === 'string') {
          _quote.line_items = [];
        }

        if (searchParams.get('client')) {
          _quote.client_id = searchParams.get('client')!;
        }

        _quote.uses_inclusive_taxes =
          company?.settings?.inclusive_taxes ?? false;

        return (value = _quote);
      }

      return value;
    });

    return () => {
      setQuote(undefined);
    };
  }, [data]);

  useEffect(() => {
    quote &&
      quote.client_id.length > 1 &&
      clientResolver.find(quote.client_id).then((client) => {
        setClient(client);

        const invitations: Record<string, unknown>[] = [];

        client.contacts.map((contact) => {
          if (contact.send_email) {
            const invitation = cloneDeep(blankInvitation);

            invitation.client_contact_id = contact.id;
            invitations.push(invitation);
          }
        });

        handleChange('invitations', invitations);

        if (company && company.enabled_tax_rates > 0) {
          handleChange('tax_name1', settingResolver(client, 'tax_name1'));
          handleChange('tax_rate1', settingResolver(client, 'tax_rate1'));
        }

        if (company && company.enabled_tax_rates > 1) {
          handleChange('tax_name2', settingResolver(client, 'tax_name2'));
          handleChange('tax_rate2', settingResolver(client, 'tax_rate2'));
        }

        if (company && company.enabled_tax_rates > 2) {
          handleChange('tax_name3', settingResolver(client, 'tax_name3'));
          handleChange('tax_rate3', settingResolver(client, 'tax_rate3'));
        }
      });
  }, [quote?.client_id]);

  useEffect(() => {
    quote && calculateInvoiceSum(quote);
  }, [quote]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      onSaveClick={() => save(quote!)}
      disableSaveButton={quote?.client_id.length === 0}
    >
      {!isLoading ? (
        <div className="space-y-4">
          <Tabs tabs={tabs} />

          <Outlet
            context={{
              quote,
              setQuote,
              errors,
              isDefaultTerms,
              setIsDefaultTerms,
              isDefaultFooter,
              setIsDefaultFooter,
              client,
              invoiceSum,
            }}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}
    </Default>
  );
}
