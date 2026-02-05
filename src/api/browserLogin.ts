import { chromium, Cookie } from "playwright";
import { jar } from "./client";
import dayjs from "dayjs";

/**
 * Opens a browser window and lets the user manually log in to TIS.
 * After successful login, extracts cookies and adds them to the axios cookie jar.
 * @param headed - Whether to run the browser in headed mode
 * @returns Array of Playwright cookies for use in browser context
 */
export default async function browserLogin(headed: boolean = true): Promise<Cookie[]> {
  console.log("Opening browser for interactive login...");
  console.log("Please log in to TIS in the browser window that opens.");
  console.log("Once you're logged in and see the TIS homepage, this script will continue automatically.\n");

  const browser = await chromium.launch({
    headless: false, // Always show the browser for login
  });

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36",
  });

  const page = await context.newPage();

  // Navigate to the TIS login page
  await page.goto("https://techinfo.toyota.com/t3Portal/", {
    waitUntil: "domcontentloaded",
  });

  console.log("Waiting for you to complete login (including 2FA if required)...");

  // Wait for successful login by checking if we're on the main TIS portal
  // The login redirects to various authentication pages, but eventually lands back on t3Portal
  await page.waitForFunction(
    () => {
      // Check if we're on the main portal page (not a login/auth page)
      const url = window.location.href;
      return url.includes("techinfo.toyota.com/t3Portal/") &&
             !url.includes("/authenticate") &&
             !url.includes("/login") &&
             !url.includes("idm.toyota.com");
    },
    { timeout: 300000 } // 5 minute timeout for login
  );

  console.log("Login successful! Extracting cookies...");

  // Get all cookies from the browser context
  const browserCookies = await context.cookies();

  // Transform cookies for Playwright use
  const transformedCookies: Cookie[] = browserCookies
    .filter(c => c.domain.includes("toyota.com"))
    .map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain.startsWith(".") ? c.domain : `.${c.domain}`,
      path: c.path,
      expires: c.expires && c.expires > 0 ? c.expires : dayjs().add(1, "day").unix(),
      httpOnly: c.httpOnly,
      secure: c.secure,
      sameSite: c.sameSite === "Strict" ? "Strict" : c.sameSite === "Lax" ? "Lax" : "None",
    }));

  // Add cookies to axios jar for use with the API client
  browserCookies
    .filter(c => c.domain.includes("toyota.com"))
    .forEach((c) => {
      const cookieString = `${c.name}=${c.value}; Domain=${c.domain}; Path=${c.path}; ${
        c.expires && c.expires > 0 ? `Expires=${new Date(c.expires * 1000).toUTCString()}; ` : ""
      }${c.secure ? "Secure; " : ""}${c.sameSite ? `SameSite=${c.sameSite}` : ""}`;

      jar.setCookieSync(
        cookieString,
        "https://techinfo.toyota.com/t3Portal/"
      );
    });

  console.log(`Extracted ${transformedCookies.length} cookies from browser session.`);

  await browser.close();

  return transformedCookies;
}
