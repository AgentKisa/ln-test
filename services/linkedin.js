const axios = require("axios");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const bypassRecaptcha = require("../utils/bypassRecaptcha");
const dotenv = require("dotenv");
const CONSTANTS = require("../utils/constants");

dotenv.config();

// LinkedIn Login
async function loginToLinkedIn(page) {
  logger.info("Navigating to LinkedIn login page...");
  await page.goto(process.env.LINKEDIN_LOGIN_URL, {
    waitUntil: "networkidle2", // Wait until the network load is complete
  });

  await page.waitForSelector(CONSTANTS.SELECTORS.USERNAME, { timeout: 60000 });
  await page.type(CONSTANTS.SELECTORS.USERNAME, process.env.LINKEDIN_EMAIL);
  await page.type(CONSTANTS.SELECTORS.PASSWORD, process.env.LINKEDIN_PASSWORD);
  await page.click('button[type="submit"]');

  logger.info("Logging in...");
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });

  // reCAPTCHA check
  const recaptchaFrame = await page.$(CONSTANTS.SELECTORS.RECAPTCHA_FRAME);
  if (recaptchaFrame) {
    logger.warn("reCAPTCHA detected. Attempting to bypass...");
    await bypassRecaptcha(page);
    logger.info("Bypassed reCAPTCHA.");
  }
}

// Navigate to Profile Page
async function navigateToProfilePage(page) {
  const profileURL = process.env.LINKEDIN_PROFILE_URL;
  logger.info(`Navigating to profile page: ${profileURL}`);
  await page.goto(profileURL, { waitUntil: "domcontentloaded" });

  await page.waitForSelector(CONSTANTS.SELECTORS.PROFILE_IMAGE, {
    timeout: 60000,
  });

  logger.info("Profile image element found.");
}

// Loading profile image
async function fetchProfileImage(page) {
  await navigateToProfilePage(page);

  const profileImageUrl = await page.evaluate((selector) => {
    const imageElement = document.querySelector(selector);
    return imageElement ? imageElement.src : null;
  }, CONSTANTS.SELECTORS.PROFILE_IMAGE);

  if (profileImageUrl) {
    logger.info(`Profile image URL extracted: ${profileImageUrl}`);
    await saveProfileImage(profileImageUrl);
  } else {
    logger.error("Profile image not found on the page.");
  }
}

// Save image to disk
async function saveProfileImage(imageUrl) {
  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imagePath = path.join(__dirname, process.env.PROFILE_IMAGE_PATH);
    fs.writeFileSync(imagePath, response.data);
    logger.info(`Profile image saved to ${imagePath}`);
  } catch (error) {
    logger.error(`Error downloading the profile image: ${error.message}`);
  }
}

module.exports = { loginToLinkedIn, fetchProfileImage };
