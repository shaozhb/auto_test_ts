// src/pages/BasePage.ts

/**
 * BasePage —— 所有页面对象的基类
 *
 * 设计目标：
 *  1. 【复用】把每个页面都会用到的通用操作（导航、等待、截图、断言）集中到这里
 *  2. 【解耦】子类只关心「本页有哪些元素」「本页能做什么动作」
 *  3. 【稳定】统一超时、统一等待策略，避免每个页面各写一套
 *  4. 【可观测】内置日志与截图，失败时便于排查
 *
 * 使用方式：
 *  - 所有具体页面类（如 LoginPage）都应 extends BasePage
 *  - 子类通过 this.page 访问底层 Page；通过 this.locator() 定位元素
 */

// 从 @playwright/test 引入类型与断言工具
//  - Page：Playwright 的页面对象，代表一个浏览器标签页
//  - Locator：元素定位器，支持自动等待、链式定位
//  - expect：Playwright 封装的断言库（带自动重试）
//  - Response：网络响应类型（用于 waitForResponse 的返回值）
import { Page, Locator, expect, Response } from '@playwright/test';

// 引入统一日志工具，便于在 CI 中按级别过滤
import { logger } from '@utils/logger';

/**
 * 页面基类（抽象类）
 * 声明为 abstract：不允许直接 new BasePage()，只能被继承
 */
export abstract class BasePage {
  /**
   * 【受保护】底层 Page 实例
   * - protected：子类可访问，外部不可直接访问（封装）
   * - readonly：页面对象创建后不再替换，避免误赋值
   */
  protected readonly page: Page;

  /**
   * 【私有】当前页面的路径
   * 用于 goto() 时拼接 baseURL，子类通过构造函数传入
   * 例如 '/login'、'/dashboard'
   */
  private readonly path: string;

  /**
   * 构造函数
   * @param page Playwright 的 Page 实例（由 fixture 注入）
   * @param path 当前页面的相对路径，默认 '/'
   */
  constructor(page: Page, path: string = '/') {
    this.page = page;
    this.path = path;
    logger.debug(`[BasePage] 初始化页面：${this.constructor.name}，路径：${path}`);
  }

  // ============================================================
  // 一、导航相关
  // ============================================================

  /**
   * 打开当前页面（相对路径会自动拼接 baseURL）
   * @param overridePath 可选：覆盖默认路径（用于同一页面不同子路由）
   * @param options goto 的额外选项，如 waitUntil、timeout
   */
  async goto(
    overridePath?: string,
    options?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit'; timeout?: number }
  ): Promise<void> {
    const target = overridePath ?? this.path;
    logger.info(`[${this.constructor.name}] 打开页面：${target}`);

    // 使用 waitUntil: 'domcontentloaded' 兼顾速度与稳定
    // 若页面依赖较多异步请求，可显式传 'networkidle'
    await this.page.goto(target, {
      waitUntil: options?.waitUntil ?? 'domcontentloaded',
      timeout: options?.timeout,
    });
  }

  /**
   * 重新加载当前页面
   */
  async reload(): Promise<void> {
    logger.debug(`[${this.constructor.name}] 重新加载页面`);
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  /**
   * 返回上一页
   */
  async goBack(): Promise<void> {
    logger.debug(`[${this.constructor.name}] 返回上一页`);
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
  }

  /**
   * 等待页面达到网络空闲状态
   * 场景：SPA 页面跳转后需要等接口全部返回
   * @param timeout 可选超时，默认沿用 config 里的 navigationTimeout
   */
  async waitForNetworkIdle(timeout?: number): Promise<void> {
    logger.debug(`[${this.constructor.name}] 等待网络空闲`);
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  // ============================================================
  // 二、元素定位
  // ============================================================

  /**
   * 通过 CSS/文本选择器获取 Locator
   * 子类可直接用 this.locator('...')，避免到处写 this.page.locator
   * @param selector 选择器字符串
   * @returns Locator 实例（惰性定位，调用时才真正查找）
   */
  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * 按角色定位（推荐，语义化、稳定）
   * 例如：this.getByRole('button', { name: '登录' })
   */
  protected getByRole(
    role: Parameters<Page['getByRole']>[0],
    options?: Parameters<Page['getByRole']>[1]
  ): Locator {
    return this.page.getByRole(role, options);
  }

  /**
   * 按可见文本定位
   */
  protected getByText(text: string | RegExp, exact = false): Locator {
    return this.page.getByText(text, { exact });
  }

  /**
   * 按 data-testid 定位（最推荐的做法，与样式/文案解耦）
   * 需在 playwright.config.ts 里配置 testIdAttribute（默认 data-testid）
   */
  protected getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  // ============================================================
  // 三、通用操作与等待
  // ============================================================

  /**
   * 等待元素可见
   * @param locator 目标元素
   * @param timeout 可选超时
   */
  async waitForVisible(locator: Locator, timeout = 5000): Promise<void> {
    logger.debug(`[${this.constructor.name}] 等待元素可见`);
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * 等待元素隐藏（常用于 loading 消失、弹窗关闭）
   */
  async waitForHidden(locator: Locator, timeout = 5000): Promise<void> {
    logger.debug(`[${this.constructor.name}] 等待元素隐藏`);
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * 等待元素从 DOM 中移除
   */
  async waitForDetached(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'detached', timeout });
  }

  /**
   * 安全点击：等待可见 + 滚动到视口 + 点击
   * 相比 locator.click()，额外加了滚动，避免元素在视口外点击失败
   */
  async click(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.scrollIntoViewIfNeeded();
    await locator.click();
  }

  /**
   * 安全输入：先清空再填充
   * 避免 fill 在已有内容时追加而非覆盖
   */
  async fill(locator: Locator, value: string, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
    await locator.fill('');      // 先清空
    await locator.fill(value);   // 再输入
  }

  /**
   * 获取元素文本（自动去除首尾空白）
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent())?.trim() ?? '';
  }

  /**
   * 获取元素属性值
   */
  async getAttribute(locator: Locator, name: string): Promise<string | null> {
    return locator.getAttribute(name);
  }

  /**
   * 判断元素是否可见（不抛异常，返回布尔值）
   * 适合用于「条件分支」而非断言
   */
  async isVisible(locator: Locator, timeout = 2000): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  // ============================================================
  // 四、通用断言
  // ============================================================

  /**
   * 断言元素可见（带自动重试，由 Playwright expect 提供）
   */
  async expectVisible(locator: Locator, timeout = 5000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * 断言元素包含指定文本
   */
  async expectText(locator: Locator, expected: string | RegExp, timeout = 5000): Promise<void> {
    await expect(locator).toHaveText(expected, { timeout });
  }

  /**
   * 断言当前 URL 匹配
   * @param pattern 字符串或正则
   */
  async expectUrl(pattern: string | RegExp, timeout = 5000): Promise<void> {
    await expect(this.page).toHaveURL(pattern, { timeout });
  }

  /**
   * 断言页面标题匹配
   */
  async expectTitle(pattern: string | RegExp, timeout = 5000): Promise<void> {
    await expect(this.page).toHaveTitle(pattern, { timeout });
  }

  // ============================================================
  // 五、网络与辅助
  // ============================================================

  /**
   * 等待某个接口响应返回
   * 场景：点击按钮后等后端接口，再断言 UI 变化
   * @param urlPattern URL 匹配（字符串或正则）
   * @param action 触发请求的动作（可选），在等待前执行
   */
  async waitForResponse(
    urlPattern: string | RegExp,
    action?: () => Promise<void>,
    timeout = 10000
  ): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      (resp) => (typeof urlPattern === 'string'
        ? resp.url().includes(urlPattern)
        : urlPattern.test(resp.url())),
      { timeout }
    );
    if (action) await action();
    return responsePromise;
  }

  /**
   * 截图并保存到 reports 目录（文件名带时间戳与页面名）
   * @param name 截图名称前缀
   */
  async screenshot(name: string): Promise<void> {
    const file = `reports/screenshots/${name}-${Date.now()}.png`;
    logger.info(`[${this.constructor.name}] 截图：${file}`);
    await this.page.screenshot({ path: file, fullPage: true });
  }

  /**
   * 获取页面标题
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * 获取当前 URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }
}