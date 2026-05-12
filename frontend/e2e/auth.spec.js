import { expect, test } from './fixtures.js'

test.describe('auth flow', () => {
  test('rejects invalid credentials with a visible error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Username').fill('nobody-here')
    await page.getByLabel('Password').fill('definitely-wrong')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toContainText(/Invalid username or password/i)
    await expect(page).toHaveURL(/\/login$/)
  })

  test('redirects unauthenticated user from /library to /login', async ({ page }) => {
    await page.goto('/library')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('signs in and reaches the home hub', async ({ page, account }) => {
    await page.goto('/login')
    await page.getByLabel('Username').fill(account.username)
    await page.getByLabel('Password').fill(account.password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/main$/)
    await expect(page.getByRole('heading', { name: /Your worlds/ })).toBeVisible()
  })

  test('sign out returns to /login and protects /main again', async ({ page, account }) => {
    await page.goto('/login')
    await page.getByLabel('Username').fill(account.username)
    await page.getByLabel('Password').fill(account.password)
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page).toHaveURL(/\/main$/)

    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page).toHaveURL(/\/login$/)

    await page.goto('/main')
    await expect(page).toHaveURL(/\/login$/)
  })
})
