const dotenv = require("dotenv");
const logger = require("./utils/logger");
const initializeBrowser = require("./utils/browser");
const {
  loginToLinkedIn,
  fetchProfileImage,
  navigateToProfilePage,
} = require("./services/linkedin");

dotenv.config();

(async () => {
  logger.info("Script started");

  const { browser, page } = await initializeBrowser();

  try {
    logger.info("Browser launched.");

    await loginToLinkedIn(page);

    await navigateToProfilePage(page);
    await fetchProfileImage(page);
  } catch (error) {
    logger.error(`Error occurred: ${error.message}`);
  } finally {
    await browser.close();
    logger.info("Browser closed.");
  }
})();
