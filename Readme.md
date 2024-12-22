# LN-Test

A project for automated interaction with LinkedIn, including logging into the website and downloading the profile picture.

# Description

This project uses Puppeteer for browser automation and Winston for logging. The script performs the following tasks:

1. Logs into LinkedIn.
2. Bypasses reCAPTCHA (manual intervention required).
3. Navigates to the profile page.
4. Downloads the profile picture.

# Requirements

- Node.js (version 16 or higher recommended).
- Dependencies from package.json installed.

# Installation

1. Clone the repository.

2. Install dependencies:

   `npm install`

3. Rename the .env.example file to `.env`.

4. Fill in the variable values in the `.env file`.

5. To run the script, execute the command:
   `npm start`

# The script will perform the following steps:

- Open the browser and go to the LinkedIn login page.
- Enter the login and password from the .env file.
- Navigate to the profile page and download the image.
- Logs are recorded in the console and in the out.log file. Example log:

# Libraries Used

- Puppeteer — a tool for controlling the browser through the DevTools Protocol.
- dotenv — loads environment variables from the .env file.
- axios — an HTTP client for Node.js.
- winston — a logging library.

# Notes

# Bypassing reCAPTCHA requires manual intervention. The script waits 60 seconds for the CAPTCHA to be solved.

Methods for bypassing reCAPTCHA:

1.  Login to Google account
    Logging into a Google account can reduce the likelihood of encountering reCAPTCHA, as Google trusts logged-in users. When logging in to Google, ensure the credentials are correct, and use the same browser session for actions that might trigger reCAPTCHA.

2.  Using CAPTCHA-solving services
    Various services offer CAPTCHA solving via an API. The most popular ones are 2Captcha and Anti-Captcha. These services work as follows: you send a request with CAPTCHA details (e.g., site key and URL), the service solves the CAPTCHA, and returns the result.

3.  Using anti-detect browsers
    Anti-detect browsers, like Multilogin, help conceal the fact of automation. They do this by spoofing various browser parameters, such as user-agent, language settings, and other parameters that might indicate automation.

4.  Using proxy servers
    Using proxy servers allows you to change your IP address, which also helps reduce the likelihood of being blocked and encountering reCAPTCHA. Proxies can be both free and paid. Paid proxies are often more reliable and offer additional features, such as IP rotation.

# Author

Valeriia Muntian, https://www.linkedin.com/in/valeriia-muntyan/
