import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("design/verification/12");
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 0;
    this.pending = new Map();
    this.eventListeners = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.id && this.pending.has(data.id)) {
          const { resolve, reject } = this.pending.get(data.id);
          this.pending.delete(data.id);
          if (data.error) reject(data.error);
          else resolve(data.result);
        } else if (data.method) {
          const cbs = this.eventListeners.get(data.method) || [];
          for (const cb of cbs) cb(data.params);
        }
      };
    });
  }

  on(event, cb) {
    const arr = this.eventListeners.get(event) || [];
    arr.push(cb);
    this.eventListeners.set(event, arr);
  }

  async send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log("Fetching CDP targets...");
  const res = await fetch("http://localhost:9222/json/list");
  const targets = await res.json();
  const pageTarget = targets.find((t) => t.type === "page");
  if (!pageTarget) {
    throw new Error("No page target found on localhost:9222");
  }

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  console.log("Connected to CDP target:", pageTarget.id);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");

  async function evaluate(expression) {
    const r = await cdp.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(r.exceptionDetails)}`);
    }
    return r.result?.value;
  }

  async function navigate(url) {
    await cdp.send("Page.navigate", { url });
    await sleep(2000);
  }

  async function setViewport(width, height) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await sleep(300);
  }

  async function setTheme(theme) {
    await evaluate(`
      document.documentElement.setAttribute('data-theme', '${theme}');
      document.cookie = 'theme=${theme}; path=/; max-age=31536000';
    `);
    await sleep(300);
  }

  async function screenshot(filename, fullPage = false) {
    let clip;
    if (fullPage) {
      const metrics = await cdp.send("Page.getLayoutMetrics");
      const width = Math.ceil(metrics.contentSize.width);
      const height = Math.ceil(metrics.contentSize.height);
      clip = { x: 0, y: 0, width, height, scale: 1 };
    }
    const r = await cdp.send("Page.captureScreenshot", {
      format: "png",
      ...(clip ? { clip, captureBeyondViewport: true } : {}),
    });
    const filePath = path.join(OUT_DIR, filename);
    fs.writeFileSync(filePath, Buffer.from(r.data, "base64"));
    console.log(`Saved screenshot: ${filename}`);
  }

  const viewports = [
    { name: "360", width: 360, height: 800 },
    { name: "768", width: 768, height: 1024 },
    { name: "1280", width: 1280, height: 800 },
    { name: "1600", width: 1600, height: 900 },
  ];

  console.log("\n--- CLEARING COOKIES FOR PUBLIC LANDING & AUTH TESTS ---");
  await cdp.send("Network.clearBrowserCookies");
  await sleep(500);

  // 1. LANDING PAGE (/)
  console.log("\n--- TESTING LANDING PAGE (/) ---");
  await navigate("http://localhost:3000/");

  for (const vp of viewports) {
    await setViewport(vp.width, vp.height);
    for (const theme of ["dark", "light"]) {
      await setTheme(theme);
      await screenshot(`landing-${vp.name}-${theme}.png`);
      if (vp.name === "1280") {
        await screenshot(`landing-1280-full-${theme}.png`, true);
      }
    }
  }

  // 2. LOGIN PAGE (/login)
  console.log("\n--- TESTING LOGIN PAGE (/login) ---");
  await navigate("http://localhost:3000/login");

  for (const vp of viewports) {
    await setViewport(vp.width, vp.height);
    for (const theme of ["dark", "light"]) {
      await setTheme(theme);
      await screenshot(`login-${vp.name}-${theme}.png`);
      if (vp.name === "1280") {
        await screenshot(`login-1280-full-${theme}.png`, true);
      }
    }
  }

  // Test password reveal on /login
  console.log("Testing password reveal button on /login...");
  await setViewport(1280, 800);
  await setTheme("dark");
  await evaluate(`
    const pwInput = document.getElementById('login-password');
    if (pwInput) {
      pwInput.value = 'SecretPassword123';
      pwInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  `);
  await sleep(300);
  // Click reveal button
  await evaluate(`
    const btn = document.querySelector('button[aria-label="Show password"]');
    if (btn) btn.click();
  `);
  await sleep(400);
  await screenshot(`login-password-revealed-dark.png`);

  // 3. REGISTER PAGE (/register)
  console.log("\n--- TESTING REGISTER PAGE (/register) ---");
  await navigate("http://localhost:3000/register");

  // Step 1 screenshots
  for (const vp of viewports) {
    await setViewport(vp.width, vp.height);
    for (const theme of ["dark", "light"]) {
      await setTheme(theme);
      await screenshot(`register-step1-${vp.name}-${theme}.png`);
      if (vp.name === "1280") {
        await screenshot(`register-step1-1280-full-${theme}.png`, true);
      }
    }
  }

  // Test typing credentials and password strength meter on Step 1
  console.log("Testing Step 1 input and password score meter...");
  await setViewport(1280, 800);
  await setTheme("dark");
  await evaluate(`
    const nameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('register-email');
    const pwInput = document.getElementById('register-password');
    if (nameInput) {
      nameInput.value = 'Demo Athlete';
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (emailInput) {
      emailInput.value = 'athlete@example.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (pwInput) {
      pwInput.value = 'StrongPass123!';
      pwInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  `);
  await sleep(400);
  await screenshot(`register-step1-filled-dark.png`);

  // Click continue to advance to Step 2
  console.log("Advancing to Step 2...");
  await evaluate(`
    const continueBtn = document.querySelector('button[type="submit"]');
    if (continueBtn) continueBtn.click();
  `);
  await sleep(500);

  // Step 2 screenshots
  for (const vp of viewports) {
    await setViewport(vp.width, vp.height);
    for (const theme of ["dark", "light"]) {
      await setTheme(theme);
      await screenshot(`register-step2-${vp.name}-${theme}.png`);
      if (vp.name === "1280") {
        await screenshot(`register-step2-1280-full-${theme}.png`, true);
      }
    }
  }

  // 4. FUNCTIONAL LOGIN FLOW TEST
  console.log("\n--- TESTING FUNCTIONAL LOGIN SUBMISSION ---");
  await navigate("http://localhost:3000/login");
  await setViewport(1280, 800);
  await setTheme("dark");

  await evaluate(`
    (function() {
      function setReactVal(el, val) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const emailInput = document.querySelector("#email");
      const pwInput = document.querySelector("#password");
      if (emailInput && pwInput) {
        setReactVal(emailInput, "qa@fitx.local");
        setReactVal(pwInput, "QaTest#1234");
      }
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    })()
  `);
  await sleep(3500);

  const currentUrl = await evaluate("window.location.href");
  console.log("URL after login submission:", currentUrl);
  if (currentUrl.includes("/dashboard")) {
    console.log("✓ Successfully authenticated and navigated to /dashboard!");
  } else {
    console.log("! Note: URL is", currentUrl);
  }

  // 5. PROTOTYPE REFERENCE SCREENSHOTS
  console.log("\n--- CAPTURING PROTOTYPE REFERENCE SCREENSHOTS ---");
  await setViewport(1280, 800);

  await navigate("http://localhost:5173/#/");
  await sleep(1500);
  await screenshot("prototype-landing-1280.png");

  await navigate("http://localhost:5173/#/login");
  await sleep(1500);
  await screenshot("prototype-login-1280.png");

  await navigate("http://localhost:5173/#/register");
  await sleep(1500);
  await screenshot("prototype-register-1280.png");

  console.log("\n✓ All Group 12 verification screenshots captured successfully!");
  await cdp.close();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
