import { test as base, expect } from '@playwright/test'

const BACKEND = 'http://127.0.0.1:8000'

function uniqueUsername(prefix = 'e2e') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`
}

export const test = base.extend({
  account: async ({ request }, use) => {
    const username = uniqueUsername()
    const password = 'secret123'
    const reg = await request.post(`${BACKEND}/auth/register`, {
      data: { username, password },
    })
    expect(reg.ok()).toBeTruthy()
    await use({ username, password })
  },
})

export { expect }

export async function login(page, username, password) {
  await page.goto('/login')
  await page.getByLabel('Username').fill(username)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.waitForURL('**/library')
}
