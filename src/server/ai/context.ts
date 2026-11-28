/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Statics } from '$app/common/interfaces/statics';
import { store } from '$app/common/stores/store';

dayjs.extend(utc);
dayjs.extend(timezone);

let cachedStatics: Promise<Statics> | undefined;

export const company = () => {
  const { api, currentIndex } = store.getState().companyUsers;

  return api[currentIndex].company;
};

export const statics = () => {
  cachedStatics ??= request('GET', endpoint('/api/v1/statics'))
    .then((response) => response.data)
    .catch((error) => {
      cachedStatics = undefined;

      throw error;
    });

  return cachedStatics;
};

export const today = async () => {
  const { timezones } = await statics();

  const timeZone = timezones.find(
    (zone) => zone.id === company().settings.timezone_id
  )?.name;

  return dayjs().tz(timeZone).format('YYYY-MM-DD');
};
