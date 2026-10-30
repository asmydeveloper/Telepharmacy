const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }), headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/?splash=0', '/console', '/design-system', '/screens']) {
    const response = await page.goto('http://127.0.0.1:3000' + route);
    await page.waitForTimeout(route === '/screens' ? 3000 : 1000);
    if (response.status() !== 200) throw new Error(`${route}: HTTP ${response.status()}`);
    const result = await page.evaluate(() => ({
      title: document.title,
      customerScreens: window.TP ? Object.keys(window.TP.SCREENS).length : null,
      consoleScreens: window.SC ? Object.keys(window.SC.SCREENS).length : null,
      text: document.body.innerText.length,
      frames: document.querySelectorAll('iframe').length,
    }));
    console.log(route, result);
    if (result.text < 20) throw new Error(`${route}: empty page`);
    if (route === '/?splash=0' && !result.customerScreens) throw new Error('Customer engine failed');
    if (route === '/console' && !result.consoleScreens) throw new Error('Console engine failed');
    if (route === '/screens') {
      if (!result.frames) throw new Error('Screen board failed');
      await page.locator('[data-app="con"]').click();
      await page.waitForTimeout(1000);
      if (!(await page.locator('#lanes iframe').count())) throw new Error('Console board failed');
    }
  }
  await browser.close();
  if (errors.length) throw new Error(errors.join('\n'));
})().catch(error => { console.error(error); process.exit(1); });
