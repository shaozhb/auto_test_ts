import { Page,Locator, Response,expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '@utils/logger';

export class HomePage extends BasePage {
    readonly h1Title: Locator;
    readonly picCat: Locator;

    constructor(page: Page) {
         super(page, '/');

        this.h1Title=this.locator('h1')
        this.picCat = this.locator('#tomcat-logo');
    }

    async open():Promise<void>{
        await this.goto();
    }

  /** 断言页面标题包含指定 Tomcat 版本 */
  async assertTomcatVersion(version = 'Apache Tomcat/11.0.25'): Promise<void> {
    await expect(this.h1Title).toContainText(version);
  }

  /** 断言 Tomcat Logo 可见 */
  async assertTomcatLogoVisible(): Promise<void> {
    await expect(this.picCat).toBeVisible();
  }

  /** 一次断言页面基本元素全部就绪（常用组合） */
  async assertPageLoaded(version = 'Apache Tomcat/11.0.25'): Promise<void> {
    await this.assertTomcatVersion(version);
    await this.assertTomcatLogoVisible();
  }


}