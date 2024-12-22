const axios = require("axios");
const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const bypassRecaptcha = require("../utils/bypassRecaptcha");
const dotenv = require("dotenv");

dotenv.config();

// LinkedIn Login
async function loginToLinkedIn(page) {
  logger.info("Navigating to LinkedIn login page...");
  await page.goto(process.env.LINKEDIN_LOGIN_URL, {
    waitUntil: "networkidle2", // Wait until the network load is complete
  });

  await page.waitForSelector("#username", { timeout: 60000 });
  await page.type("#username", process.env.LINKEDIN_EMAIL);
  await page.type("#password", process.env.LINKEDIN_PASSWORD);
  await page.click('button[type="submit"]');

  logger.info("Logging in...");
  await page.waitForNavigation({ waitUntil: "domcontentloaded" });

  // reCAPTCHA check
  const recaptchaFrame = await page.$('iframe[src*="recaptcha"]');
  if (recaptchaFrame) {
    logger.warn("reCAPTCHA detected. Attempting to bypass...");
    await bypassRecaptcha(page);
    logger.info("Bypassed reCAPTCHA.");
  }
}

// Loading profile image
async function fetchProfileImage(page, profileURL) {
  logger.info(`Navigating to profile page: ${profileURL}`);
  await page.goto(profileURL, { waitUntil: "domcontentloaded" });

  const profileImageSelector = "img.profile-photo-edit__preview";

  await page.waitForSelector(profileImageSelector, { timeout: 60000 });
  logger.info("Profile image element found.");

  const profileImageUrl = await page.evaluate((selector) => {
    const imageElement = document.querySelector(selector);
    return imageElement ? imageElement.src : null;
  }, profileImageSelector);

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
    const imagePath = path.join(__dirname, "../profile_image.jpg");
    fs.writeFileSync(imagePath, response.data);
    logger.info(`Profile image saved to ${imagePath}`);
  } catch (error) {
    logger.error(`Error downloading the profile image: ${error.message}`);
  }
}

module.exports = { loginToLinkedIn, fetchProfileImage };
