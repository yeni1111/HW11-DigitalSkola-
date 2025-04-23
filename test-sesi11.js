import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import itempage from '../pages/item_page.js';
import page_login from '../../pages/page_login.js';

describe('Google Search Test', function () {
    let driver;

    afterEach(async function () {
        if (driver) {
            await driver.quit();
        }
    });

    it('Visit SauceDemo dan cek page title', async function () {
        driver = await new Builder().forBrowser('chrome').build();

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();
        assert.strictEqual(title, 'Swag Labs');

        let inputUsername = await driver.findElement(page_login.inputUsername);
        let inputPassword = await driver.findElement(page_login.inputPassword);
        let buttonLogin = await driver.findElement(page_login.buttonLogin);        

        await inputUsername.sendKeys('standard_user');
        await inputPassword.sendKeys('secret_sauce');
        await buttonLogin.click();

        let buttonCart = await driver.wait(
            until.elementLocated(By.xpath('//*[@data-test="shopping-cart-link"]')),
            10000
        );
        await driver.wait(until.elementIsVisible(buttonCart), 5000);

        assert.ok(await buttonCart.isDisplayed());

        let textAppLogo = await driver.findElement(By.className('app_logo'));
        let logoText = await textAppLogo.getText();
        assert.strictEqual(logoText, 'Swag Labs');

        await driver.sleep(1700);
    });

    it('Visit SauceDemo dan ambil screenshot', async function () {
        let options = new chrome.Options();
        options.addArguments("--headless");
        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

        await driver.get('https://www.saucedemo.com');
        const title = await driver.getTitle();
        assert.strictEqual(title, 'Swag Labs');

        let ss_full = await driver.takeScreenshot();
        fs.writeFileSync("full_screenshot.png", Buffer.from(ss_full, "base64"));

        let inputUsername = await driver.findElement(page_login.InputUsername);
        let ss_input = await inputUsername.takeScreenshot();
        fs.writeFileSync("inputusername.png", Buffer.from(ss_input, "base64"));
    });

    it.only('Cek Visual halaman login', async function () {
        driver = await new Builder().forBrowser('chrome').build();
        await driver.get('https://www.saucedemo.com');

        const title = await driver.getTitle();
        assert.strictEqual(title, 'Swag Labs');

        let screenshot = await driver.takeScreenshot();
        fs.writeFileSync("current.png", Buffer.from(screenshot, "base64"));

        if (!fs.existsSync("baseline.png")) {
            fs.copyFileSync("current.png", "baseline.png");
            console.log("Baseline image saved.");
        }

        let img1 = PNG.sync.read(fs.readFileSync("baseline.png"));
        let img2 = PNG.sync.read(fs.readFileSync("current.png"));
        let { width, height } = img1;
        let diff = new PNG({ width, height });

        let numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
        fs.writeFileSync("diff.png", PNG.sync.write(diff));

        if (numDiffPixels > 0) {
            console.log(`Visual differences found! Pixels different: ${numDiffPixels}`);
        } else {
            console.log("No visual differences found.");
        }

        await driver.sleep(3000);
    });
});