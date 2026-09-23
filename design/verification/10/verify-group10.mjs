import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("design/verification/10");
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
      deviceScaleFactor: 2,
      mobile: width < 768,
    });
    await sleep(300);
  }

  async function captureScreenshot(filepath, full = false) {
    const data = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: full,
    });
    fs.writeFileSync(filepath, Buffer.from(data.data, "base64"));
    console.log(`Saved screenshot: ${filepath}`);
  }

  // 1. Navigate and ensure sign-in
  await navigate("http://localhost:3000/exercises");
  const currentUrl = await evaluate(`window.location.href`);
  if (currentUrl.includes("/login")) {
    console.log("Signing in as qa@fitx.local...");
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
        const btn = document.querySelector("button[type=submit]");
        if (emailInput && passInput && btn) {
          setReactVal(emailInput, "qa@fitx.local");
          setReactVal(passInput, "QaTest#1234");
          btn.click();
        }
      })()
    `);
    await sleep(2500);
    await navigate("http://localhost:3000/exercises");
  }

  // -------------------------------------------------------------
  // TEST /exercises
  // -------------------------------------------------------------
  console.log("=== Testing /exercises ===");
  const exTitle = await evaluate(`document.title`);
  const exHeading = await evaluate(`document.querySelector('h1')?.innerText`);
  console.log(`Exercises: Title="${exTitle}", Heading="${exHeading}"`);

  await setViewport(1280, 800);

  // Test muscle filter
  console.log("Testing muscle filter chip...");
  await evaluate(`
    (function() {
      const chestChip = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Chest');
      if (chestChip) chestChip.click();
    })()
  `);
  await sleep(500);

  // Reset to All
  await evaluate(`
    (function() {
      const allChip = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'All');
      if (allChip) allChip.click();
    })()
  `);
  await sleep(400);

  // Capture /exercises across viewports in Dark & Light
  const viewports = [
    { name: "360", w: 360, h: 800 },
    { name: "768", w: 768, h: 1024 },
    { name: "1280", w: 1280, h: 800 },
    { name: "1600", w: 1600, h: 900 },
  ];

  console.log("Capturing /exercises Dark Theme...");
  await evaluate(`document.documentElement.setAttribute('data-theme', 'dark'); document.cookie = 'theme=dark; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `exercises-${vp.name}-dark.png`));
  }
  await setViewport(1280, 800);
  await captureScreenshot(path.join(OUT_DIR, `exercises-1280-full-dark.png`), true);

  console.log("Capturing /exercises Light Theme...");
  await evaluate(`document.documentElement.setAttribute('data-theme', 'light'); document.cookie = 'theme=light; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `exercises-${vp.name}-light.png`));
  }
  await setViewport(1280, 800);
  await captureScreenshot(path.join(OUT_DIR, `exercises-1280-full-light.png`), true);

  // -------------------------------------------------------------
  // TEST /profile
  // -------------------------------------------------------------
  console.log("=== Testing /profile ===");
  await navigate("http://localhost:3000/profile");
  await setViewport(1280, 800);

  const profTitle = await evaluate(`document.title`);
  const profHeading = await evaluate(`document.querySelector('h1')?.innerText`);
  console.log(`Profile: Title="${profTitle}", Heading="${profHeading}"`);

  // Test Profile details save
  console.log("Testing profile form save...");
  await evaluate(`
    (function() {
      function setReactVal(el, val) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      // Height is first number input
      if (inputs[0]) setReactVal(inputs[0], "182");
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save changes'));
      if (saveBtn) saveBtn.click();
    })()
  `);
  await sleep(1500);

  // Test Body-weight add entry
  console.log("Testing body-weight add entry...");
  await evaluate(`
    (function() {
      function setReactVal(el, val) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const bwInput = document.querySelector('input[placeholder="74.5"]');
      if (bwInput) setReactVal(bwInput, "75.0");
      const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Add entry'));
      if (addBtn) addBtn.click();
    })()
  `);
  await sleep(1500);

  // Capture /profile across viewports in Dark & Light
  console.log("Capturing /profile Dark Theme...");
  await evaluate(`document.documentElement.setAttribute('data-theme', 'dark'); document.cookie = 'theme=dark; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `profile-${vp.name}-dark.png`));
  }
  await setViewport(1280, 800);
  await captureScreenshot(path.join(OUT_DIR, `profile-1280-full-dark.png`), true);

  console.log("Capturing /profile Light Theme...");
  await evaluate(`document.documentElement.setAttribute('data-theme', 'light'); document.cookie = 'theme=light; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `profile-${vp.name}-light.png`));
  }
  await setViewport(1280, 800);
  await captureScreenshot(path.join(OUT_DIR, `profile-1280-full-light.png`), true);

  // Test Settings tab
  console.log("Testing Settings tab & theme toggle...");
  await evaluate(`
    (function() {
      const settingsBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Settings');
      if (settingsBtn) settingsBtn.click();
    })()
  `);
  await sleep(500);
  await captureScreenshot(path.join(OUT_DIR, "profile-settings-tab.png"));

  // -------------------------------------------------------------
  // Capture Prototypes
  // -------------------------------------------------------------
  try {
    const protoRes = await fetch("http://localhost:5173/#/exercises");
    if (protoRes.ok) {
      console.log("Capturing prototype screenshots on 5173...");
      await navigate("http://localhost:5173/#/exercises");
      await setViewport(1280, 800);
      await captureScreenshot(path.join(OUT_DIR, "prototype-exercises-1280.png"));

      await navigate("http://localhost:5173/#/profile");
      await setViewport(1280, 800);
      await captureScreenshot(path.join(OUT_DIR, "prototype-profile-1280.png"));
    }
  } catch {
    console.log("Prototype on 5173 not reachable, skipping prototype screenshots.");
  }

  await cdp.close();
  console.log("Group 10 verification finished successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
