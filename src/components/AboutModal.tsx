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
  Activity,
  CheckCircle,
  DownloadCloud,
  Facebook,
  GitHub,
  Slack,
  Twitter,
  Youtube,
} from 'react-feather';
import { Modal } from './Modal';
import { version } from '$app/common/helpers/version';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { Button } from './forms';
import { request } from '$app/common/helpers/request';
import { endpoint, isSelfHosted } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { Icon } from './icons/Icon';
import { MdInfo, MdWarning } from 'react-icons/md';
import styled from 'styled-components';
import { useColorScheme } from '$app/common/colors';
import { updateCompanyUsers } from '$app/common/stores/slices/company-users';
import { useDispatch } from 'react-redux';

interface SystemInfo {
  system_health: boolean;
  extensions: { [key: string]: string };
  php_version: {
    minimum_php_version: string;
    current_php_version: string;
    current_php_cli_version: string;
    is_okay: boolean;
    memory_limit: string;
  };
  env_writable: boolean;
  simple_db_check: boolean;
  cache_enabled: boolean;
  phantom_enabled: boolean;
  exec: boolean;
  open_basedir: boolean;
  mail_mailer: string;
  flutter_renderer: string;
  jobs_pending: number;
  pdf_engine: string;
  queue: string;
  trailing_slash: boolean;
  file_permissions: string;
  exchange_rate_api_not_configured: boolean;
}

interface Props {
  isAboutVisible: boolean;
  setIsAboutVisible: Dispatch<SetStateAction<boolean>>;
}

const Div = styled.div`
  background-color: ${(props) => props.theme.color};
  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;
export function AboutModal(props: Props) {
  const [t] = useTranslation();
  const user = useCurrentUser();
  const dispatch = useDispatch();

  const colors = useColorScheme();

  const { isAboutVisible, setIsAboutVisible } = props;

  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [isHealthCheckModalOpen, setIsHealthCheckModalOpen] =
    useState<boolean>(false);
  const [isForceUpdateModalOpen, setIsForceUpdateModalOpen] =
    useState<boolean>(false);

  const [systemInfo, setSystemInfo] = useState<SystemInfo>();

  const handleHealthCheck = (allowAction?: boolean) => {
    if (!isFormBusy || allowAction) {
      toast.processing();
      setIsFormBusy(true);

      request('GET', endpoint('/api/v1/health_check'))
        .then((response) => {
          setSystemInfo(response.data);
          setIsHealthCheckModalOpen(true);
          toast.dismiss();
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  const handleClearCache = () => {
    if (!isFormBusy) {
      toast.processing();
      setIsFormBusy(true);

      request('POST', endpoint('/api/v1/refresh?current_company=true'))
        .then((response) => {
          dispatch(updateCompanyUsers(response.data.data));
          toast.dismiss();
          handleHealthCheck(true);
        })
        .finally(() => setIsFormBusy(false));
    }
  };

  console.log(systemInfo);

  return (
    <>
      <Modal
        title={t('about')}
        visible={isAboutVisible}
        onClose={() => !isFormBusy && setIsAboutVisible(false)}
        disableClosing={isHealthCheckModalOpen || isForceUpdateModalOpen}
      >
        <div className="flex flex-col text-center">
          <div className="flex flex-col">
            <span className="text-gray-800">
              {user?.first_name} {user?.last_name}
            </span>
            <span>{user?.email}</span>
          </div>

          <span className="mt-4">{version}</span>
        </div>

        {isSelfHosted() && (
          <Button
            behavior="button"
            className="flex items-center"
            onClick={handleHealthCheck}
            disableWithoutIcon
            disabled={isFormBusy}
          >
            <Icon element={Activity} color="white" />
            <span>{t('health_check')}</span>
          </Button>
        )}

        {isSelfHosted() && (
          <Button
            behavior="button"
            className="flex items-center"
            onClick={() => setIsForceUpdateModalOpen(true)}
            disableWithoutIcon
            disabled={isFormBusy}
          >
            <Icon element={DownloadCloud} color="white" />
            <span>{t('force_update')}</span>
          </Button>
        )}

        <div className="flex flex-wrap justify-center items-center space-x-4 pt-6">
          <a
            href="https://twitter.com/invoiceninja"
            target="_blank"
            rel="noreferrer"
          >
            <Twitter />
          </a>

          <a
            href="https://www.facebook.com/invoiceninja"
            target="_blank"
            rel="noreferrer"
          >
            <Facebook />
          </a>

          <a
            href="https://github.com/invoiceninja"
            target="_blank"
            rel="noreferrer"
          >
            <GitHub />
          </a>

          <a
            href="https://www.youtube.com/channel/UCXAHcBvhW05PDtWYIq7WDFA/videos"
            target="_blank"
            rel="noreferrer"
          >
            <Youtube />
          </a>

          <a
            href="http://slack.invoiceninja.com/"
            target="_blank"
            rel="noreferrer"
          >
            <Slack />
          </a>
        </div>
      </Modal>

      <Modal
        title={t('health_check')}
        visible={isHealthCheckModalOpen}
        onClose={() => setIsHealthCheckModalOpen(false)}
      >
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center py-1 px-3">
            <div className="flex flex-col">
              <span className="font-medium text-base mb-1">
                {t('system_health')}
              </span>
              <span>
                {t('email')}: {systemInfo?.mail_mailer}
              </span>
              <span>
                {t('queue')}: {systemInfo?.queue}
              </span>
              <span>
                {t('pdf')}: {systemInfo?.pdf_engine}
              </span>
            </div>

            <div>
              <Icon
                element={systemInfo?.system_health ? CheckCircle : MdWarning}
                color={systemInfo?.system_health ? 'green' : 'red'}
                size={25}
              />
            </div>
          </div>

          <div className="flex justify-between items-center py-1 px-3">
            <div className="flex flex-col">
              <span className="font-medium text-base mb-1">
                {t('database_check')}
              </span>
              <span>
                {systemInfo?.simple_db_check ? t('passed') : t('failed')}
              </span>
            </div>

            <div>
              <Icon
                element={systemInfo?.system_health ? CheckCircle : MdWarning}
                color={systemInfo?.system_health ? 'green' : 'red'}
                size={25}
              />
            </div>
          </div>

          <div className="flex justify-between items-center py-1 px-3">
            <div className="flex flex-col">
              <span className="font-medium text-base mb-1">
                {t('php_info')}
              </span>
              <span>
                {t('web')}: {systemInfo?.php_version.current_php_version}
              </span>
              <span>
                {t('cli')}: {systemInfo?.php_version.current_php_cli_version}
              </span>
              <span>
                {t('memory_limit')}: {systemInfo?.php_version.memory_limit}
              </span>
            </div>

            <div>
              <Icon
                element={
                  systemInfo?.php_version.is_okay ? CheckCircle : MdWarning
                }
                color={systemInfo?.php_version.is_okay ? 'green' : 'red'}
                size={25}
              />
            </div>
          </div>

          <Div
            className="flex justify-between items-center cursor-pointer py-1 px-3"
            theme={{
              hoverColor: colors.$5,
            }}
            onClick={() =>
              window
                .open(
                  'https://invoiceninja.github.io/en/self-host-installation/#file-permissions',
                  '_blank'
                )
                ?.focus()
            }
          >
            <div className="flex flex-col">
              <span className="font-medium text-base mb-1">
                {systemInfo?.file_permissions === t('ok')
                  ? t('file_permissions')
                  : t('invalid_file_permissions')}
              </span>
              <span>
                {systemInfo?.file_permissions === t('ok')
                  ? t('ok')
                  : systemInfo?.file_permissions}
              </span>
            </div>

            <div>
              <Icon
                element={
                  systemInfo?.file_permissions === t('ok')
                    ? CheckCircle
                    : MdWarning
                }
                color={
                  systemInfo?.file_permissions === t('ok') ? 'green' : 'red'
                }
                size={25}
              />
            </div>
          </Div>

          <Div
            className="flex justify-between items-center cursor-pointer py-1 px-3"
            theme={{
              hoverColor: colors.$5,
            }}
            onClick={() =>
              window
                .open(
                  'https://invoiceninja.github.io/en/self-host-installation/#currency-conversion',
                  '_blank'
                )
                ?.focus()
            }
          >
            <div className="flex flex-col">
              <span className="font-medium text-base mb-1">
                {!systemInfo?.exchange_rate_api_not_configured
                  ? t('exchange_rate_enabled')
                  : t('exchange_rate_not_enabled')}
              </span>
              <span>
                {!systemInfo?.exchange_rate_api_not_configured
                  ? t('enabled')
                  : t('add_open_exchange')}
              </span>
            </div>

            <div>
              <Icon
                element={
                  !systemInfo?.exchange_rate_api_not_configured
                    ? CheckCircle
                    : MdInfo
                }
                color={
                  !systemInfo?.exchange_rate_api_not_configured ? 'green' : ''
                }
                size={25}
              />
            </div>
          </Div>
        </div>

        <div className="flex justify-between">
          <Button
            behavior="button"
            type="secondary"
            onClick={handleClearCache}
            disableWithoutIcon
            disabled={isFormBusy}
          >
            {t('clear_cache')}
          </Button>

          <Button
            behavior="button"
            onClick={handleHealthCheck}
            disableWithoutIcon
            disabled={isFormBusy}
          >
            {t('refresh')}
          </Button>
        </div>
      </Modal>

      <Modal
        title={t('update_available')}
        visible={isForceUpdateModalOpen}
        onClose={() => setIsForceUpdateModalOpen(false)}
      >
        <div className="flex flex-col space-y-5">
          <span className="font-medium text-base">
            {t('a_new_version_is_available')}
          </span>

          <div className="flex flex-col">
            <span>&middot; {t('installed_version')}: v5.8.23</span>
            <span>&middot; {t('latest_version')}: v5.8.24</span>
          </div>

          <div className="flex justify-between">
            <Button
              behavior="button"
              type="secondary"
              onClick={() =>
                window
                  .open(
                    'https://github.com/invoiceninja/invoiceninja/releases',
                    '_blank'
                  )
                  ?.focus()
              }
              disableWithoutIcon
              disabled={isFormBusy}
            >
              {t('release_notes')}
            </Button>

            <Button
              behavior="button"
              onClick={handleHealthCheck}
              disableWithoutIcon
              disabled={isFormBusy}
            >
              {t('update_now')}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
