import { APIRequestContext, APIResponse } from '@playwright/test';

export class ApiClient {
  constructor(
    private request: APIRequestContext,
    private baseURL: string
  ) {}

  private url(path: string): string {
    return `${this.baseURL}${path.startsWith('/') ? path : '/' + path}`;
  }

  async get<T>(path: string, params?: Record<string, string>): Promise<APIResponse> {
    return this.request.get(this.url(path), { params });
  }

  async post<T>(path: string, data: unknown): Promise<APIResponse> {
    return this.request.post(this.url(path), { data });
  }

  async put(path: string, data: unknown): Promise<APIResponse> {
    return this.request.put(this.url(path), { data });
  }

  async delete(path: string): Promise<APIResponse> {
    return this.request.delete(this.url(path));
  }
}