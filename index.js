const puppeteer = require("puppeteer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("./utils/logger");
const bypassRecaptcha = require("./utils/bypassRecaptcha");

dotenv.config();

logger.info("Script started");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(60000); // Increase timeout
  page.setDefaultTimeout(60000);

  logger.info("Browser launched.");

  try {
    logger.info("Navigating to LinkedIn login page...");
    await page.goto("https://www.linkedin.com/login", {
      waitUntil: "networkidle2", // добавить комент что это такое
    });
    logger.info("Successfully navigated to LinkedIn login page.");

    // Enter login and password
    await page.waitForSelector("#username", { timeout: 60000 });
    await page.type("#username", process.env.LINKEDIN_EMAIL);
    await page.type("#password", process.env.LINKEDIN_PASSWORD);
    await page.click('button[type="submit"]');

    logger.info("Logging in...");

    // Explicitly wait for a redirect or navigation
    await page.waitForNavigation({ waitUntil: "domcontentloaded" });

    // Check for reCAPTCHA
    const recaptchaFrame = await page.$('iframe[src*="recaptcha"]');
    if (recaptchaFrame) {
      logger.warn("reCAPTCHA detected. Attempting to bypass...");
      await bypassRecaptcha(page);
      logger.info("Bypassed reCAPTCHA.");
    }

    // Go to profile page
    const profileURL = "https://www.linkedin.com/in/zori-toy-b69106343/"; // Замените на нужный URL
    logger.info(`Navigating to profile page: ${profileURL}`);
    await page.goto(profileURL, { waitUntil: "domcontentloaded" });

    // Additional logging of current URL
    const profilePageUrl = await page.url();
    logger.info(`Current URL after navigation to profile: ${profilePageUrl}`);
    if (profilePageUrl !== profileURL) {
      throw new Error("Failed to navigate to the profile page.");
    }

    logger.info("Successfully navigated to profile page.");

    // Wait for profile image element to load
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const profileImageSelector = "img.profile-photo-edit__preview";
    await page.waitForSelector(profileImageSelector, { timeout: 60000 });
    logger.info("Profile image element found.");

    // Extract profile image URL
    const profileImageUrl = await page.evaluate((selector) => {
      const imageElement = document.querySelector(selector);
      if (imageElement && imageElement.src) {
        return imageElement.src;
      }
      return null;
    }, profileImageSelector);

    if (profileImageUrl) {
      logger.info(`Profile image URL extracted: ${profileImageUrl}`);

      try {
        const imageBuffer = await axios.get(profileImageUrl, {
          responseType: "arraybuffer", // добавить комент что это такое
        });
        const imagePath = path.join(__dirname, "profile_image.jpg"); // Замените на нужное расположение в энв перемен
        fs.writeFileSync(imagePath, imageBuffer.data);
        logger.info(`Profile image saved to ${imagePath}`);
      } catch (downloadError) {
        logger.error(
          `Error downloading the profile image: ${downloadError.message}`
        );
      }
    } else {
      logger.error("Profile image not found on the page.");
    }
  } catch (error) {
    logger.error(`Error occurred: ${error.message}`);
  } finally {
    await browser.close();
    logger.info("Browser closed.");
  }
})();
