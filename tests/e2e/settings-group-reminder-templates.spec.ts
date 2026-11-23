import type { Locator, Page, Response } from '@playwright/test';
import {
  resetUserReactSettings,
  updateUserReactSettings,
} from '$tests/e2e/api-helpers';
import {
  type ApiFixture,
  expect,
  resetAccountBeforeAll,
  test,
  uniqueName,
} from '$tests/e2e/fixtures';
import { login } from '$tests/e2e/helpers';

resetAccountBeforeAll();

type Reminder = 1 | 2;
type Settings = Record<string, unknown>;

const languages = [
  {
    name: 'English',
    id: '1',
    subject: 'Payment reminder',
    body: 'Please arrange payment for your invoice.',
  },
  {
    name: 'French',
    id: '4',
    subject: 'Rappel de paiement',
    body: 'Merci de régler votre facture.',
  },
];

function reminderButton(page: Page, reminder: Reminder) {
  return page.getByRole('button', {
    name: reminder === 1 ? 'First Reminder' : 'Second Reminder',
    exact: true,
  });
}

function overrideCheckbox(page: Page) {
  return page
    .locator('div.flex.items-center.space-x-2')
    .filter({
      has: page.getByText('Enabled', { exact: true }),
    })
    .getByRole('checkbox');
}

function bodyEditor(page: Page, legacy: boolean): Locator {
  return legacy
    ? page.frameLocator('iframe.tox-edit-area__iframe').locator('body')
    : page.locator('.ProseMirror[contenteditable="true"]');
}

function assertTemplate(
  settings: Settings,
  reminder: Reminder,
  subject: string,
  body: string
) {
  expect(settings[`email_subject_reminder${reminder}`]).toBe(subject);
  expect(settings[`email_template_reminder${reminder}`]).toContain(body);
  expect(settings[`schedule_reminder${reminder}`]).toBe('disabled');
  expect(settings[`enable_reminder${reminder}`]).toBe(false);
}

async function getGroup(page: Page, api: ApiFixture, id: string) {
  const response = await page.request.get(
    `${api.context.baseUrl}/api/v1/group_settings/${id}`,
    {
      headers: api.context.headers,
    }
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()).data;
}

async function configureReminders(page: Page, id: string) {
  await page.goto(`/settings/group_settings/${id}/edit`);
  await page
    .getByRole('button', { name: 'Configure Settings', exact: true })
    .click();
  await page.waitForURL('**/settings/company_details');
  await page
    .getByRole('link', { name: 'Templates & Reminders', exact: true })
    .first()
    .click();
  await page.waitForURL('**/settings/templates_and_reminders');
  await page.getByRole('button', { name: 'Reminders', exact: true }).click();
}

async function assertEditor(
  page: Page,
  legacy: boolean,
  subject: string,
  body: string
) {
  await expect(overrideCheckbox(page)).toBeChecked();
  await expect(page.locator('#subject')).toHaveValue(subject);
  await expect(bodyEditor(page, legacy)).toContainText(body);
  await expect(page.getByRole('switch')).toHaveAttribute(
    'aria-checked',
    'false'
  );
  const schedule = page
    .locator('div')
    .filter({ has: page.locator('dt').filter({ hasText: /^Schedule$/ }) })
    .filter({ has: page.getByRole('combobox') })
    .last();
  await expect(schedule.getByText('Disabled', { exact: true })).toBeVisible();
}

async function saveTemplate(
  page: Page,
  id: string,
  reminder: Reminder,
  subject: string,
  body: string
) {
  const saved = page.waitForResponse(
    (response) =>
      response.url().split('?')[0].endsWith(`/api/v1/group_settings/${id}`) &&
      response.request().method() === 'PUT'
  );
  await page.getByRole('button', { name: 'Save', exact: true }).first().click();
  const response = await saved;
  expect(response.ok()).toBeTruthy();
  await expect(
    page.getByText('Successfully updated group', { exact: true })
  ).toBeVisible();
  const submitted = response.request().postDataJSON().settings;
  const returned = (await response.json()).data.settings;
  await test.info().attach(`reminder-${reminder}-save`, {
    body: JSON.stringify({ submitted, returned }, null, 2),
    contentType: 'application/json',
  });
  assertTemplate(submitted, reminder, subject, body);
  assertTemplate(returned, reminder, subject, body);
}

function isTemplatePreview(
  response: Response,
  reminder: Reminder,
  subject: string,
  body: string
) {
  if (
    !response.url().split('?')[0].endsWith('/api/v1/templates') ||
    response.request().method() !== 'POST'
  )
    return false;
  const payload = response.request().postDataJSON();
  return (
    payload.template === `email_template_reminder${reminder}` &&
    payload.subject === subject &&
    payload.body?.includes(body)
  );
}

for (const legacy of [false, true]) {
  for (const language of languages) {
    for (const reminder of [1, 2] as const) {
      test(`${language.name}: reminder ${reminder} survives save, reload and selection (${legacy ? 'TinyMCE' : 'TipTap'})`, async ({
        page,
        api,
      }) => {
        test.setTimeout(90000);
        await updateUserReactSettings(
          api.context,
          { preferences: { use_legacy_editor: legacy } },
          { quiet: true }
        );
        try {
          const group = await api.createEntity('group_settings', {
            name: uniqueName(`reminder-${language.name}-${reminder}`),
            settings: { language_id: language.id },
          });
          const id = group.id as string;
          expect(id).toBeTruthy();
          const subject = `${language.subject} ${reminder}`;
          const body = `${language.body} (${reminder})`;
          await login(page);
          await configureReminders(page, id);
          await reminderButton(page, reminder).click();
          await overrideCheckbox(page).check();
          await expect(page.getByRole('switch')).toHaveAttribute(
            'aria-checked',
            'false'
          );
          await expect(page.locator('#subject')).toBeEnabled();
          await page.locator('#subject').fill(subject);
          const preview = page.waitForResponse((response) =>
            isTemplatePreview(response, reminder, subject, body)
          );
          await bodyEditor(page, legacy).fill(body);
          expect((await preview).ok()).toBeTruthy();
          await expect(
            page
              .locator('iframe[srcdoc]:not(.tox-edit-area__iframe)')
              .contentFrame()
              .locator('body')
          ).toContainText(body);
          await saveTemplate(page, id, reminder, subject, body);
          assertTemplate(
            (await getGroup(page, api, id)).settings,
            reminder,
            subject,
            body
          );

          await test.step('full reload and reopen the group', async () => {
            await page.reload();
            await configureReminders(page, id);
            // The Reminders category selects First Reminder automatically.
            // Check it before the additional First Reminder click from the reported workflow.
            if (reminder === 1) await assertEditor(page, legacy, subject, body);
          });
          await test.step(`select ${reminder === 1 ? 'First' : 'Second'} Reminder`, async () => {
            await reminderButton(page, reminder).click();
            const persisted = (await getGroup(page, api, id)).settings;
            assertTemplate(persisted, reminder, subject, body);
            await test.info().attach('reopened-template', {
              body: JSON.stringify(
                {
                  persisted,
                  displayedSubject: await page.locator('#subject').inputValue(),
                  displayedBody: await bodyEditor(page, legacy).innerText(),
                  overrideChecked: await overrideCheckbox(page).isChecked(),
                },
                null,
                2
              ),
              contentType: 'application/json',
            });
            await assertEditor(page, legacy, subject, body);
          });
        } finally {
          await resetUserReactSettings(api.context, { quiet: true });
        }
      });
    }
  }
}

test('switching away and back restores First Reminder; reselecting it keeps its text', async ({
  page,
  api,
}) => {
  test.setTimeout(90000);
  const subject = 'Saved first reminder';
  const body = 'Saved group-specific reminder body';
  const group = await api.createEntity('group_settings', {
    name: uniqueName('reminder-reselection'),
    settings: {
      email_subject_reminder1: subject,
      email_template_reminder1: `<p>${body}</p>`,
      schedule_reminder1: 'disabled',
      enable_reminder1: false,
    },
  });
  await login(page);
  await configureReminders(page, group.id as string);
  await assertEditor(page, false, subject, body);
  await reminderButton(page, 2).click();
  await reminderButton(page, 1).click();
  await assertEditor(page, false, subject, body);
  // Selecting an already active subtab must preserve its editor state.
  await reminderButton(page, 1).click();
  assertTemplate(
    (await getGroup(page, api, group.id as string)).settings,
    1,
    subject,
    body
  );
  await assertEditor(page, false, subject, body);
});

test('reselecting Second Reminder preserves unsaved text and its preview', async ({
  page,
  api,
}) => {
  test.setTimeout(90000);
  const savedSubject = 'Saved second reminder';
  const savedBody = 'Saved second reminder body';
  const editedSubject = 'Edited second reminder';
  const editedBody = 'Edited group-specific second reminder body';
  const group = await api.createEntity('group_settings', {
    name: uniqueName('second-reminder-reselection'),
    settings: {
      email_subject_reminder2: savedSubject,
      email_template_reminder2: `<p>${savedBody}</p>`,
      schedule_reminder2: 'disabled',
      enable_reminder2: false,
    },
  });
  await login(page);
  await configureReminders(page, group.id as string);
  await reminderButton(page, 2).click();
  await assertEditor(page, false, savedSubject, savedBody);
  await page.locator('#subject').fill(editedSubject);
  const preview = page.waitForResponse((response) =>
    isTemplatePreview(response, 2, editedSubject, editedBody)
  );
  await bodyEditor(page, false).fill(editedBody);
  expect((await preview).ok()).toBeTruthy();
  const previewBody = page
    .locator('iframe[srcdoc]:not(.tox-edit-area__iframe)')
    .contentFrame()
    .locator('body');
  await expect(previewBody).toContainText(editedBody);
  await page
    .getByRole('heading', { name: editedSubject, exact: true })
    .waitFor();

  await reminderButton(page, 2).click();

  await assertEditor(page, false, editedSubject, editedBody);
  await expect(
    page.getByRole('heading', { name: editedSubject, exact: true })
  ).toBeVisible();
  await expect(previewBody).toContainText(editedBody);
  assertTemplate(
    (await getGroup(page, api, group.id as string)).settings,
    2,
    savedSubject,
    savedBody
  );
});
