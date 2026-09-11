import { test as base, expect, APIRequestContext } from '@playwright/test';
import { LoginPage } from '@pages/LoginPage';
import { ApiClient } from '@api/ApiClient';

type Fixtures = {
  loginPage: LoginPage;
  apiClient: ApiClient;
  testUser: { username: string; password: string };
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await use(loginPage);
  },

  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request, process.env.API_URL!);
    await use(client);
  },

  testUser: async ({}, use) => {
    await use({
      username: process.env.TEST_USER!,
      password: process.env.TEST_PASSWORD!,
    });
  },
});

export { expect };