import { expect, login, test } from './fixtures.js'

test.describe('worlds and characters', () => {
  test('creates a world, then a character inside it', async ({ page, account }) => {
    await login(page, account.username, account.password)

    const worldName = `World-${Date.now()}`
    await page.getByRole('button', { name: 'New world' }).click()
    await page.getByLabel('Name').fill(worldName)
    await page.getByLabel('Description').fill('A magical realm')
    await page.getByRole('button', { name: 'Create world' }).click()

    const worldCard = page.getByRole('heading', { name: worldName })
    await expect(worldCard).toBeVisible()

    await worldCard.click()
    await expect(page).toHaveURL(/\/world\/\d+/)
    await expect(page.getByText('No characters yet in this world.')).toBeVisible()

    await page.getByRole('link', { name: 'New character' }).click()
    const characterName = `Aria-${Date.now()}`
    await page.getByLabel('Name').fill(characterName)
    await page.getByLabel('Bio').fill('A brave knight')
    await page.getByLabel('Traits').fill('loyal, strong')
    await page.getByRole('button', { name: 'Create character' }).click()

    await expect(page.getByRole('heading', { name: characterName })).toBeVisible()
    await expect(page.getByText('loyal, strong')).toBeVisible()
  })

  test('worlds are isolated per user', async ({ page, request }) => {
    const alice = {
      username: `alice-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      password: 'secret123',
    }
    const bob = {
      username: `bob-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      password: 'secret123',
    }
    await request.post('http://127.0.0.1:8000/auth/register', { data: alice })
    await request.post('http://127.0.0.1:8000/auth/register', { data: bob })

    await login(page, alice.username, alice.password)
    const aliceWorld = `Alice-${Date.now()}`
    await page.getByRole('button', { name: 'New world' }).click()
    await page.getByLabel('Name').fill(aliceWorld)
    await page.getByRole('button', { name: 'Create world' }).click()
    await expect(page.getByRole('heading', { name: aliceWorld })).toBeVisible()

    await page.getByRole('button', { name: 'Sign out' }).click()
    await login(page, bob.username, bob.password)
    await expect(page.getByText('No worlds yet. Create your first one.')).toBeVisible()
    await expect(page.getByRole('heading', { name: aliceWorld })).toHaveCount(0)
  })
})
