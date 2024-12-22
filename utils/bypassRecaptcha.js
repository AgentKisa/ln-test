module.exports = async function bypassRecaptcha(page) {
  logger.info("Recaptcha detected. Manual bypass initiated.");
  // prompt the user to manually pass the captcha.
  await page.waitForTimeout(60000); // Wait 60 seconds for manual bypass.
};
