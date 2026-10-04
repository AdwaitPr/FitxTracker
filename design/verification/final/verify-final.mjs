import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("design/verification/final");
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

  const consoleErrors = [];
  cdp.on("Runtime.consoleAPICalled", (params) => {
    if (params.type === "error") {
      consoleErrors.push(params.args.map((a) => a.value || a.description).join(" "));
    }
  });

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
    await sleep(2200);
  }

  async function setViewport(width, height) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768,
    });
    await sleep(250);
  }

  async function setTheme(theme) {
    await evaluate(`
      document.documentElement.setAttribute('data-theme', '${theme}');
      document.cookie = 'theme=${theme}; path=/; max-age=31536000';
    `);
    await sleep(200);
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

  const standardViewports = [
    { name: "360", width: 360, height: 800 },
    { name: "768", width: 768, height: 1024 },
    { name: "1280", width: 1280, height: 800 },
    { name: "1600", width: 1600, height: 900 },
  ];

  // ==========================================
  // PHASE A: AUTHENTICATED ROUTES
  // ==========================================
  console.log("\n==========================================");
  console.log("PHASE A: AUTHENTICATED ROUTES PASS");
  console.log("==========================================");

  await setViewport(1280, 800);
  await navigate("http://localhost:3000/login");

  console.log("Ensuring authentication as qa@fitx.local...");
  await evaluate(`
    (function() {
      function setReactVal(el, val) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const emailInput = document.querySelector("#email");
      const passInput = document.querySelector("#password");
      if (emailInput && passInput) {
        setReactVal(emailInput, "qa@fitx.local");
        setReactVal(passInput, "QaTest#1234");
      }
      const btn = document.querySelector('button[type="submit"]');
      if (btn) btn.click();
    })()
  `);
  await sleep(3500);

  const authRoutes = [
    { path: "/dashboard", prefix: "dashboard" },
    { path: "/workouts/new", prefix: "workout-logger" },
    { path: "/workouts/history", prefix: "workout-history" },
    { path: "/recovery", prefix: "recovery" },
    { path: "/progress", prefix: "progress" },
    { path: "/exercises", prefix: "exercises" },
    { path: "/profile", prefix: "profile" },
    { path: "/cognitype", prefix: "cognitype-setup" },
    { path: "/cognitype/sessions", prefix: "cognitype-sessions" },
    { path: "/cognitype/analytics", prefix: "cognitype-analytics" },
  ];

  for (const route of authRoutes) {
    console.log(`\nVerifying route: ${route.path}...`);
    await navigate(`http://localhost:3000${route.path}`);

    // Verify viewports & themes
    for (const vp of standardViewports) {
      await setViewport(vp.width, vp.height);
      for (const theme of ["dark", "light"]) {
        await setTheme(theme);
        await screenshot(`${route.prefix}-${vp.name}-${theme}.png`);
        if (vp.name === "1280") {
          await screenshot(`${route.prefix}-1280-full-${theme}.png`, true);
        }
      }
    }
  }

  // ==========================================
  // PHASE B: KEYBOARD ACCESSIBILITY PASS
  // ==========================================
  console.log("\n==========================================");
  console.log("PHASE B: KEYBOARD ACCESSIBILITY PASS");
  console.log("==========================================");

  await setViewport(1280, 800);
  await setTheme("dark");
  await navigate("http://localhost:3000/dashboard");

  // Tab through elements and check focus outline
  console.log("Tabbing through navigation elements on /dashboard...");
  for (let i = 0; i < 6; i++) {
    await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Tab", code: "Tab" });
    await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Tab", code: "Tab" });
    await sleep(150);
  }
  await screenshot("keyboard-nav-focus-dark.png");

  // Test modal Esc key dismissal on /workouts/new
  console.log("Testing library modal open and Esc key dismissal on /workouts/new...");
  await navigate("http://localhost:3000/workouts/new");
  await sleep(1000);
  // Click add movement button
  await evaluate(`
    const addBtn = document.querySelector('button[aria-label="Add exercise"], button:has(svg.lucide-plus)');
    if (addBtn) addBtn.click();
  `);
  await sleep(500);
  await screenshot("keyboard-modal-open-dark.png");

  // Press Escape
  await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape" });
  await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape" });
  await sleep(400);
  await screenshot("keyboard-modal-closed-dark.png");

  // ==========================================
  // PHASE C: PUBLIC & AUTH ROUTES
  // ==========================================
  console.log("\n==========================================");
  console.log("PHASE C: PUBLIC LANDING & AUTH PASS");
  console.log("==========================================");

  await cdp.send("Network.clearBrowserCookies");
  await sleep(500);

  const publicRoutes = [
    { path: "/", prefix: "final-landing" },
    { path: "/login", prefix: "final-login" },
    { path: "/register", prefix: "final-register" },
  ];

  for (const route of publicRoutes) {
    console.log(`\nVerifying public route: ${route.path}...`);
    await navigate(`http://localhost:3000${route.path}`);

    for (const vp of standardViewports) {
      await setViewport(vp.width, vp.height);
      for (const theme of ["dark", "light"]) {
        await setTheme(theme);
        await screenshot(`${route.prefix}-${vp.name}-${theme}.png`);
        if (vp.name === "1280") {
          await screenshot(`${route.prefix}-1280-full-${theme}.png`, true);
        }
      }
    }
  }

  console.log("\n==========================================");
  console.log("FINAL AUDIT RESULTS");
  console.log("==========================================");
  console.log(`Captured screenshots in: ${OUT_DIR}`);
  console.log(`Recorded console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.log("Errors logged:", consoleErrors);
  } else {
    console.log("✓ Zero console runtime errors across all tested pages!");
  }

  await cdp.close();
}

run().catch((err) => {
  console.error("Final verification failed:", err);
  process.exit(1);
});
