/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { freePlan } from '$app/common/guards/guards/free-plan';
import { isHosted } from '$app/common/helpers';
import { useAdmin } from './permissions/useHasPermission';
import { useCurrentAccount } from './useCurrentAccount';

export function useUnlockButtonForHosted() {
  const account = useCurrentAccount();
  const { isAdmin, isOwner } = useAdmin();

  const isPlanExpired = new Date(account?.plan_expires) < new Date();

  return (
    isHosted() &&
    (freePlan() || (account?.plan && isPlanExpired)) &&
    (isAdmin || isOwner)
  );
}
