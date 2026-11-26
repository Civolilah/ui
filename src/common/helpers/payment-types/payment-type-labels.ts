/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { PaymentType } from '$app/common/interfaces/statics';

export const PAYMENT_TYPE_LABEL_KEYS: Record<string, string> = {
  '1': 'payment_type_Bank Transfer',
  '2': 'payment_type_Cash',
  '3': 'payment_type_Debit',
  '4': 'payment_type_ACH',
  '5': 'payment_type_Visa Card',
  '6': 'payment_type_MasterCard',
  '7': 'payment_type_American Express',
  '8': 'payment_type_Discover Card',
  '9': 'payment_type_Diners Card',
  '10': 'payment_type_EuroCard',
  '11': 'payment_type_Nova',
  '12': 'payment_type_Credit Card Other',
  '13': 'payment_type_PayPal',
  '14': 'payment_type_Google Wallet',
  '15': 'payment_type_Check',
  '16': 'payment_type_Carte Blanche',
  '17': 'payment_type_UnionPay',
  '18': 'payment_type_JCB',
  '19': 'payment_type_Laser',
  '20': 'payment_type_Maestro',
  '21': 'payment_type_Solo',
  '22': 'payment_type_Switch',
  '23': 'payment_type_iZettle',
  '24': 'payment_type_Swish',
  '25': 'payment_type_Venmo',
  '26': 'payment_type_Money Order',
  '27': 'payment_type_Alipay',
  '28': 'payment_type_Sofort',
  '29': 'payment_type_SEPA',
  '30': 'payment_type_GoCardless',
  '31': 'payment_type_Crypto',
  '32': 'payment_type_Credit',
  '33': 'payment_type_Zelle',
  '34': 'payment_type_Mollie Bank Transfer',
  '35': 'payment_type_KBC/CBC',
  '36': 'payment_type_Bancontact',
  '37': 'payment_type_iDEAL',
  '38': 'payment_type_Hosted Page',
  '39': 'payment_type_GiroPay',
  '40': 'payment_type_Przelewy24',
  '41': 'payment_type_EPS',
  '42': 'payment_type_Direct Debit',
  '43': 'payment_type_BECS',
  '44': 'payment_type_ACSS',
  '45': 'payment_type_Instant Bank Pay',
  '47': 'payment_type_Klarna',
  '48': 'payment_type_Interac E Transfer',
  '49': 'payment_type_BACS',
  '51': 'payment_type_Cash App',
  '52': 'payment_type_Pay Later',
  '53': 'payment_type_Mobile Payment',
  '54': 'payment_type_PromptPay',
};

const parseTranslations = (translations: unknown): Record<string, unknown> => {
  if (!translations || typeof translations !== 'object') {
    return {};
  }

  if (Array.isArray(translations)) {
    return {};
  }

  return translations as Record<string, unknown>;
};

export const isRenamablePaymentType = (id: string) => {
  return Boolean(PAYMENT_TYPE_LABEL_KEYS[id]);
};

export const customPaymentTypeLabel = (translations: unknown, id: string) => {
  const key = PAYMENT_TYPE_LABEL_KEYS[id];

  if (!key) {
    return '';
  }

  const label = parseTranslations(translations)[key];

  if (typeof label !== 'string') {
    return '';
  }

  return label.trim();
};

export const renamePaymentType = (
  translations: unknown,
  paymentType: PaymentType,
  name: string
) => {
  const key = PAYMENT_TYPE_LABEL_KEYS[paymentType.id];
  const updatedTranslations = { ...parseTranslations(translations) };
  const trimmedName = name.trim();

  if (!key) {
    return updatedTranslations;
  }

  if (!trimmedName || trimmedName === paymentType.name) {
    delete updatedTranslations[key];

    return updatedTranslations;
  }

  updatedTranslations[key] = trimmedName;

  return updatedTranslations;
};
