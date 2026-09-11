// src/tests/home.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';

test.describe('首页 (HomePage) 功能测试', () => {
  test('页面加载成功，显示正确的 Tomcat 版本和 Logo', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.assertPageLoaded(); // 组合断言：版本 + Logo
  });

  test('验证 Tomcat 版本号包含指定文本', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.assertTomcatVersion('Apache Tomcat/11.0.25');
  });

  test('验证 Tomcat Logo 图片可见', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.assertTomcatLogoVisible();
  });

  test('自定义版本号断言（可根据环境调整）', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    // 如果实际环境版本不同，修改此处版本号
    await homePage.assertTomcatVersion('Apache Tomcat/11.0.25');
  });
});