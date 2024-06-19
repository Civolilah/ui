/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField, InputLabel, Link } from '$app/components/forms';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Task } from '$app/common/interfaces/task';
import { TaskStatus } from '$app/common/interfaces/task-status';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ClientSelector } from '$app/components/clients/ClientSelector';
import { CustomField } from '$app/components/CustomField';
import { ProjectSelector } from '$app/components/projects/ProjectSelector';
import { TabGroup } from '$app/components/TabGroup';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { UserSelector } from '$app/components/users/UserSelector';
import { TaskStatusSelector } from '$app/components/task-statuses/TaskStatusSelector';
import { TaskStatus as TaskStatusBadge } from './TaskStatus';
import { PauseCircle, PlayCircle } from 'react-feather';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { useStart } from '../hooks/useStart';
import { useStop } from '../hooks/useStop';
import { isTaskRunning } from '../helpers/calculate-entity-state';
import { TaskClock } from '../../kanban/components/TaskClock';
import { calculateTime } from '../helpers/calculate-time';
import {
  useAdmin,
  useHasPermission,
} from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { route } from '$app/common/helpers/route';
import { Icon } from '$app/components/icons/Icon';
import { MdLaunch } from 'react-icons/md';
import { useColorScheme } from '$app/common/colors';
import { ClientActionButtons } from '$app/pages/invoices/common/components/ClientActionButtons';

interface Props {
  task: Task;
  handleChange: (property: keyof Task, value: unknown) => unknown;
  errors: ValidationBag | undefined;
  taskModal?: boolean;
  page?: 'create' | 'edit';
}

export function TaskDetails(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const { isAdmin, isOwner } = useAdmin();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { task, handleChange, errors, page } = props;

  const company = useCurrentCompany();
  const location = useLocation();
  const accent = useAccentColor();
  const start = useStart();
  const stop = useStop();

  const calculation = calculateTime(task.time_log, {
    inSeconds: true,
    calculateLastTimeLog: false,
  });

  return (
    <div className="grid grid-cols-12 gap-4">
      <Card className="col-span-12 xl:col-span-4 h-max">
        <div className="flex flex-col space-y-4 pt-3">
          {task && page === 'edit' && (
            <Element leftSide={t('status')} noVerticalPadding>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center">
                  <TaskStatusBadge entity={task} />
                </div>
                {isTaskRunning(task) && (
                  <div className="flex items-center">
                    <TaskClock task={task} />
                  </div>
                )}

                {!isTaskRunning(task) && (
                  <div className="flex items-center">
                    {!isTaskRunning(task) && calculation && (
                      <p>
                        {new Date(Number(calculation) * 1000)
                          .toISOString()
                          .slice(11, 19)}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  {!isTaskRunning(task) && !task.invoice_id && (
                    <PlayCircle
                      className="mr-0 ml-auto"
                      color="#808080"
                      size={60}
                      stroke={accent}
                      strokeWidth="1"
                      onClick={() =>
                        (hasPermission('edit_task') || entityAssigned(task)) &&
                        start(task)
                      }
                      cursor={
                        hasPermission('edit_task') || entityAssigned(task)
                          ? 'pointer'
                          : 'not-allowed'
                      }
                    />
                  )}

                  {isTaskRunning(task) && !task.invoice_id && (
                    <PauseCircle
                      className="mr-0 ml-auto cursor-pointer"
                      color="#808080"
                      size={60}
                      stroke={accent}
                      strokeWidth="1"
                      onClick={() =>
                        (hasPermission('edit_task') || entityAssigned(task)) &&
                        stop(task)
                      }
                      cursor={
                        hasPermission('edit_task') || entityAssigned(task)
                          ? 'pointer'
                          : 'not-allowed'
                      }
                    />
                  )}
                </div>
              </div>
            </Element>
          )}

          {!task.project_id && (
            <div className="flex flex-col space-y-2 px-6">
              <ClientSelector
                inputLabel={t('client')}
                onChange={(client) => {
                  handleChange('client_id', client.id);

                  if (!task.id) {
                    handleChange(
                      'rate',
                      client?.settings?.default_task_rate ?? 0
                    );
                  }
                }}
                value={task.client_id}
                clearButton={Boolean(task.client_id)}
                onClearButtonClick={() => handleChange('client_id', '')}
                errorMessage={errors?.errors.client_id}
              />

              {task.client_id && (
                <ClientActionButtons clientId={task.client_id} />
              )}
            </div>
          )}

          <div className="flex items-center justify-center px-6">
            <span
              className="flex flex-1 item-center gap-2"
              style={{ color: colors.$3, colorScheme: colors.$0 }}
            >
              <ProjectSelector
                inputLabel={t('project')}
                onChange={(project) => {
                  handleChange('project_id', project.id);
                  handleChange('client_id', '');
                  handleChange('rate', project.task_rate);
                }}
                value={task.project_id}
                clearButton={Boolean(task.project_id)}
                onClearButtonClick={() => handleChange('project_id', '')}
                errorMessage={errors?.errors.project_id}
              />
            </span>

            {task?.project_id && (
              <span
                className="flex item-center gap-2 pl-2"
                style={{ color: colors.$3, colorScheme: colors.$0 }}
              >
                <Link
                  to={route('/projects/:id', {
                    id: task.project_id,
                  })}
                >
                  <Icon element={MdLaunch} size={18} />
                </Link>
              </span>
            )}
          </div>

          <div className="px-6">
            <UserSelector
              inputLabel={t('user')}
              value={task?.assigned_user_id}
              onChange={(user) => handleChange('assigned_user_id', user.id)}
              onClearButtonClick={() => handleChange('assigned_user_id', '')}
              errorMessage={errors?.errors.assigned_user_id}
              readonly={!hasPermission('edit_task')}
            />
          </div>

          {task && company?.custom_fields?.task1 && (
            <div className="flex flex-col space-y-1 px-6">
              <InputLabel>
                {company.custom_fields.task1.split('|')[0]}
              </InputLabel>

              <CustomField
                field="task1"
                defaultValue={task.custom_value1 || ''}
                value={company.custom_fields.task1}
                onValueChange={(value) => handleChange('custom_value1', value)}
                fieldOnly
              />
            </div>
          )}

          {task && company?.custom_fields?.task2 && (
            <div className="flex flex-col space-y-1 px-6">
              <InputLabel>
                {company.custom_fields.task2.split('|')[0]}
              </InputLabel>

              <CustomField
                field="task2"
                defaultValue={task.custom_value2 || ''}
                value={company.custom_fields.task2}
                onValueChange={(value) => handleChange('custom_value2', value)}
                fieldOnly
              />
            </div>
          )}
        </div>
      </Card>

      <Card className="col-span-12 xl:col-span-4 h-max">
        <div className="flex flex-col space-y-4 px-6 pt-3">
          <InputField
            label={t('task_number')}
            value={task.number}
            onValueChange={(value) => handleChange('number', value)}
            errorMessage={errors?.errors.number}
          />

          <InputField
            label={t('rate')}
            type="number"
            value={task.rate}
            onValueChange={(value) => handleChange('rate', parseFloat(value))}
            errorMessage={errors?.errors.rate}
          />

          <TaskStatusSelector
            inputLabel={t('status')}
            value={task.status_id}
            onChange={(taskStatus: TaskStatus) =>
              taskStatus && handleChange('status_id', taskStatus.id)
            }
            onClearButtonClick={() => handleChange('status_id', '')}
            readonly={props.taskModal}
            errorMessage={errors?.errors.status_id}
          />

          {task && company?.custom_fields?.task3 && (
            <div className="flex flex-col space-y-1">
              <InputLabel>
                {company.custom_fields.task3.split('|')[0]}
              </InputLabel>

              <CustomField
                field="task3"
                defaultValue={task.custom_value3 || ''}
                value={company.custom_fields.task3}
                onValueChange={(value) => handleChange('custom_value3', value)}
                fieldOnly
              />
            </div>
          )}

          {task && company?.custom_fields?.task4 && (
            <div className="flex flex-col space-y-1">
              <InputLabel>
                {company.custom_fields.task4.split('|')[0]}
              </InputLabel>

              <CustomField
                field="task4"
                defaultValue={task.custom_value4 || ''}
                value={company.custom_fields.task4}
                onValueChange={(value) => handleChange('custom_value4', value)}
                fieldOnly
              />
            </div>
          )}
        </div>
      </Card>

      {location.pathname.endsWith('/edit') && (
        <Card className="col-span-12 xl:col-span-4 h-max px-6">
          <TabGroup
            tabs={[
              t('description'),
              ...(isAdmin || isOwner ? [t('custom_fields')] : []),
            ]}
          >
            <div>
              <InputField
                element="textarea"
                value={task.description}
                onValueChange={(value) => handleChange('description', value)}
                errorMessage={errors?.errors.description}
              />
            </div>

            <div>
              <span className="text-sm">{t('custom_fields')} &nbsp;</span>
              <Link to="/settings/custom_fields/tasks" className="capitalize">
                {t('click_here')}
              </Link>
            </div>
          </TabGroup>
        </Card>
      )}

      {!location.pathname.endsWith('/edit') && (
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          <InputField
            label={t('description')}
            element="textarea"
            value={task.description}
            onValueChange={(value) => handleChange('description', value)}
            errorMessage={errors?.errors.description}
          />
        </Card>
      )}
    </div>
  );
}
