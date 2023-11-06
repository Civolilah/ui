/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from 'react-query';

export const keys = {
  invoices: {
    path: '/api/v1/invoices',
    dependencies: ['/api/v1/clients'],
  },
  designs: {
    path: '/api/v1/designs',
    dependencies: ['/api/v1/invoices', '/api/v1/quotes', '/api/v1/credits', '/api/v1/recurring_invoices', '/api/v1/purchase_orders'],
  },
  tokens: {
    path: '/api/v1/tokens',
    dependencies: [],
  },
  webhooks: {
    path: '/api/v1/webhooks',
    dependencies: [],
  },
  company_gateways: {
    path: '/api/v1/company_gateways',
    dependencies: [],
  },
  credits: {
    path: '/api/v1/credits',
    dependencies: ['/api/v1/clients'],
  },
  expense_categories: {
    path: '/api/v1/expense_categories',
    dependencies: ['/api/v1/expenses', '/api/v1/recurring_expenses','/api/v1/bank_transaction_rules','/api/v1/vendors','/api/v1/bank_transactions'],
  },
  expenses: {
    path: '/api/v1/expenses',
    dependencies: [],
  },
  group_settings: {
    path: '/api/v1/group_settings',
    dependencies: ['/api/v1/clients'],
  },
  payments: {
    path: '/api/v1/payments',
    dependencies: ['/api/v1/expenses', '/api/v1/invoices', '/api/v1/clients'],
  },
  purchase_orders: {
    path: '/api/v1/purchase_orders',
    dependencies: ['/api/v1/vendors'],
  },
  recurring_expenses: {
    path: '/api/v1/recurring_expenses',
    dependencies: ['/api/v1/vendors'],
  },
  task_statuses: {
    path: '/api/v1/task_statuses',
    dependencies: ['/api/v1/tasks'],
  },
  tasks: {
    path: '/api/v1/tasks',
    dependencies: ['/api/v1/projects'],
  },
  tax_rates: {
    path: '/api/v1/tax_rates',
    dependencies: ['/api/v1/invoices', '/api/v1/quotes', '/api/v1/credits', '/api/v1/recurring_invoices', '/api/v1/purchase_orders'],
  },
  bank_transactions: {
    path: '/api/v1/bank_transactions',
    dependencies: ['/api/v1/payments', '/api/v1/invoices', '/api/v1/vendors','/api/v1/expenses','/api/v1/expense_categories'],
  },
  bank_transaction_rules: {
    path: '/api/v1/bank_transaction_rules',
    dependencies: ['/api/v1/bank_transactions'],
  },
  vendors: {
    path: '/api/v1/vendors',
    dependencies: ['/api/v1/expenses', '/api/v1/recurring_expenses', '/api/v1/purchase_orders'],
  },
  users: {
    path: '/api/v1/users',
    dependencies: ['/api/v1/tasks', '/api/v1/invoices', '/api/v1/quotes', '/api/v1/credits', '/api/v1/recurring_invoices', '/api/v1/projects', '/api/v1/payments', '/api/v1/expenses', '/api/v1/tasks'],
  },
  company_users: {
    path: '/api/v1/company_users',
    dependencies: [],
  },
  clients: {
    path: '/api/v1/clients',
    dependencies: ['/api/v1/tasks', '/api/v1/invoices', '/api/v1/quotes', '/api/v1/credits', '/api/v1/recurring_invoices', '/api/v1/projects', '/api/v1/payments', '/api/v1/expenses', '/api/v1/tasks'],
  },
  products: {
    path: '/api/v1/products',
    dependencies: ['/api/v1/subscriptions','/api/v1/invoices'],
  },
  projects: {
    path: '/api/v1/projects',
    dependencies: ['/api/v1/tasks'],
  },
  quotes: {
    path: '/api/v1/quotes',
    dependencies: ['/api/v1/clients'],
  },
  recurring_invoices: {
    path: '/api/v1/recurring_invoices',
    dependencies: ['/api/v1/clients'],
  },
  bank_integrations: {
    path: '/api/v1/bank_integrations',
    dependencies: ['/api/v1/bank_transactions'],
  },
  documents: {
    path: '/api/v1/documents',
    dependencies: [],
  },
  payment_terms: {
    path: '/api/v1/payment_terms',
    dependencies: [],
  },
  statics: {
    path: '/api/v1/statics',
    dependencies: [],
  },
  task_schedulers: {
    path: '/api/v1/task_schedulers',
    dependencies: [],
  },
  subscriptions: {
    path: '/api/v1/subscriptions',
    dependencies: [],
  },
};

export function useRefetch() {
  const queryClient = useQueryClient();

  return (property: Array<keyof typeof keys>) => {
    property.map((key) => {
      queryClient.invalidateQueries(keys[key].path);

      keys[key].dependencies.map((dependency) => {
        queryClient.invalidateQueries(dependency);
      });
    });
  };
}

export function $refetch(property: Array<keyof typeof keys>) {
  window.dispatchEvent(
    new CustomEvent('refetch', {
      detail: {
        property,
      },
    })
  );
}
