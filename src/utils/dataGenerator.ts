import { randomUUID } from 'crypto';

export const DataGen = {
  email: () => `user_${Date.now()}_${Math.floor(Math.random() * 1000)}@test.com`,
  uuid: () => randomUUID(),
  randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
};