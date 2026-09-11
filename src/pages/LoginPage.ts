// src/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    // 关键：把 '/login' 传给 BasePage，goto() 时会自动拼 baseURL
    super(page, '/login');

    this.usernameInput = this.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByLabel('Password');
    this.loginButton  = this.getByRole('button', { name: 'Sign in' });
    this.errorMessage = this.getByTestId('error');
  }

  /** 打开登录页：直接复用 BasePage.goto 的默认 path */
  async open(): Promise<void> {
    await this.goto();               // 等价于 page.goto('/login')
  }

  /** 业务动作：登录 */
  async login(username: string, password: string): Promise<void> {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  /** 业务断言：错误提示可见 */
  async expectErrorVisible(): Promise<void> {
    await this.expectVisible(this.errorMessage);
  }
}