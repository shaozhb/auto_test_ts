import { test, expect } from '@fixtures/base.fixture';

test.describe('登录功能', () => {
  test('正常登录成功', async ({ loginPage, testUser, page }) => {
    await loginPage.login(testUser.username, testUser.password);
    await expect(page).toHaveURL(/dashboard/);
  });

  test('错误密码提示错误', async ({ loginPage, testUser }) => {
    await loginPage.login(testUser.username, 'wrong-password');
    await expect(loginPage.errorMessage).toBeVisible();
  });
});