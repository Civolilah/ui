/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  PermissionResource,
  useHasPermission,
} from './permissions/useHasPermission';

export type Entity =
  | 'client'
  | 'recurring_invoice'
  | 'payment'
  | 'invoice'
  | 'quote'
  | 'product'
  | 'credit'
  | 'project'
  | 'task'
  | 'expense'
  | 'vendor'
  | 'recurring_expense'
  | 'bank_transaction'
  | 'purchase_order';

export function useDisableNavigation() {
  const hasPermission = useHasPermission();

  return (entity: Entity, resource: PermissionResource | undefined | null) => {
    return (
      !hasPermission(`view_${entity}`, resource) &&
      !hasPermission(`edit_${entity}`, resource)
    );
  };
}
