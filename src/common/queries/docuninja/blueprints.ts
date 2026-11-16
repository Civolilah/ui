/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';
import { invalidationQueryAtom } from '$app/common/atoms/data-table';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { Params } from '../common/params.interface';

export function useBlueprintsQuery(params: Params) {
  return useQuery({
    queryKey: ['/api/blueprints', params],

    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint(
          '/api/blueprints?per_page=:per_page&page=:page&filter=:filter&status=:status',
          {
            per_page: params.perPage ?? '100',
            page: params.currentPage ?? '1',
            status: params.status?.join(',') ?? 'active',
            filter: params.filter ?? '',
          }
        ),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ),

    staleTime: Infinity,
    enabled: true,
  });
}

interface BlueprintParams {
  id: string | undefined;
}

export function useBlueprintQuery(params: BlueprintParams) {
  return useQuery({
    queryKey: ['/api/blueprints', params],

    queryFn: () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/blueprints/:id', {
          id: params.id,
        }),
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              'X-DOCU-NINJA-TOKEN'
            )}`,
          },
        }
      ),

    staleTime: Infinity,
    enabled: Boolean(params.id),
  });
}

export function useBulk() {
  const queryClient = useQueryClient();
  const invalidateQueryValue = useAtomValue(invalidationQueryAtom);

  return async (ids: string[], action: 'archive' | 'restore' | 'delete') => {
    toast.processing();

    return request(
      'POST',
      docuNinjaEndpoint('/api/blueprints/bulk'),
      {
        action,
        ids,
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    ).then(() => {
      const message = `${action}d_template`;

      toast.success(message);

      invalidateQueryValue &&
        queryClient.invalidateQueries({
          queryKey: [invalidateQueryValue],
        });

      $refetch(['blueprints']);
    });
  };
}
