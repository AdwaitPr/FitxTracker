import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("design/verification/8");
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
    await sleep(1500);
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

  async function captureScreenshot(filepath) {
    const data = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    fs.writeFileSync(filepath, Buffer.from(data.data, "base64"));
    console.log(`Saved screenshot: ${filepath}`);
  }

  // 1. Navigate and ensure sign-in
  await navigate("http://localhost:3000/recovery");
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
    await sleep(2000);
    await navigate("http://localhost:3000/recovery");
  }

  const pageTitle = await evaluate(`document.title`);
  const pageHeading = await evaluate(`document.querySelector('h1')?.innerText`);
  console.log(`Page: Title="${pageTitle}", Heading="${pageHeading}"`);

  // 2. Test Popover trigger
  console.log("Testing Popover ('How this is calculated')...");
  await setViewport(1280, 800);
  await evaluate(`
    (function() {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('How this is calculated'));
      if (btn) btn.click();
    })()
  `);
  await sleep(400);
  await captureScreenshot(path.join(OUT_DIR, "recovery-popover-open.png"));

  // Close Popover
  await evaluate(`
    (function() {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('How this is calculated'));
      if (btn) btn.click();
    })()
  `);
  await sleep(300);

  // 3. Test Form Interaction & Live Gauge Update
  console.log("Testing form interaction & live score update...");
  const initialScore = await evaluate(`document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')`);
  console.log(`Initial Gauge Score: ${initialScore}`);

  await evaluate(`
    (function() {
      // Click 'Excellent' sleep quality
      const excellentBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Excellent');
      if (excellentBtn) excellentBtn.click();

      // Click gut status 'Good'
      const goodGut = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Good');
      if (goodGut) goodGut.click();

      // Stress radio dot 2 (Stress 2 out of 10)
      const stressDot = document.querySelector('button[aria-label="Stress 2 out of 10"]');
      if (stressDot) stressDot.click();

      // Notes
      const notesArea = document.querySelector('textarea');
      if (notesArea) {
        notesArea.value = 'Feeling energized after solid 8 hours sleep.';
        notesArea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })()
  `);
  await sleep(400);

  const updatedScore = await evaluate(`document.querySelector('[role="progressbar"]')?.getAttribute('aria-valuenow')`);
  const bandTagText = await evaluate(`document.querySelector('main span[class*="rounded-tag"]')?.innerText`);
  console.log(`Updated Gauge Score: ${updatedScore}, Tag: ${bandTagText}`);

  // 4. Submit form
  console.log("Submitting recovery log...");
  await evaluate(`
    (function() {
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("Save today's log"));
      if (saveBtn) saveBtn.click();
    })()
  `);
  await sleep(1500);

  const toastMessage = await evaluate(`document.querySelector('[role="status"]')?.innerText || document.querySelector('.bg-ink')?.innerText`);
  console.log(`Toast Output: ${toastMessage}`);

  // 5. Capture across 4 viewports in Light and Dark themes
  const viewports = [
    { name: "360", w: 360, h: 800 },
    { name: "768", w: 768, h: 1024 },
    { name: "1280", w: 1280, h: 800 },
    { name: "1600", w: 1600, h: 900 },
  ];

  console.log("Capturing Dark Theme screenshots...");
  await evaluate(`document.documentElement.setAttribute('data-theme', 'dark'); document.cookie = 'theme=dark; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `recovery-${vp.name}-dark.png`));
  }

  console.log("Capturing Light Theme screenshots...");
  await evaluate(`document.documentElement.setAttribute('data-theme', 'light'); document.cookie = 'theme=light; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `recovery-${vp.name}-light.png`));
  }

  // 6. Capture prototype page if running
  try {
    const protoRes = await fetch("http://localhost:5173/#/recovery");
    if (protoRes.ok) {
      console.log("Capturing prototype screenshot on 5173...");
      await navigate("http://localhost:5173/#/recovery");
      await setViewport(1280, 800);
      await captureScreenshot(path.join(OUT_DIR, "prototype-recovery-1280.png"));
    }
  } catch {
    console.log("Prototype on 5173 not reachable, skipping prototype screenshot.");
  }

  await cdp.close();
  console.log("Verification finished successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
