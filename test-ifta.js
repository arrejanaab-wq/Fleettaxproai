import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  await page.goto('http://localhost:3000');
  
  // Wait for login to be bypassed or login
  await page.waitForSelector('#nav-link-ifta', { timeout: 5000 }).catch(e => console.log('Timeout waiting for nav-link-ifta'));
  
  console.log('Clicking IFTA tab...');
  await page.click('#nav-link-ifta');
  
  // Wait a bit to catch any render errors
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();