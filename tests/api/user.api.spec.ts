import { test, expect } from '@playwright/test';

test.describe('用户 API', () => {
  test('GET /users 返回列表', async ({ request }) => {
    const res = await request.get(`${process.env.API_URL}/users`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});