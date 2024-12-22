const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
const logger = require("./utils/logger");
const { loginToLinkedIn, fetchProfileImage } = require("./services/linkedin");

dotenv.config();

(async () => {
  logger.info("Script started");

  const browser = await puppeteer.launch({
    headless: false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    page.setDefaultTimeout(60000);

    logger.info("Browser launched.");

    await loginToLinkedIn(page);

    const profileURL = process.env.LINKEDIN_PROFILE_URL;
    await fetchProfileImage(page, profileURL);
  } catch (error) {
    logger.error(`Error occurred: ${error.message}`);
  } finally {
    await browser.close();
    logger.info("Browser closed.");
  }
})();
