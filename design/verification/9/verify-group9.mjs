import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("design/verification/9");
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
  await navigate("http://localhost:3000/progress");
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
    await navigate("http://localhost:3000/progress");
  }

  const pageTitle = await evaluate(`document.title`);
  const pageHeading = await evaluate(`document.querySelector('h1')?.innerText`);
  console.log(`Page: Title="${pageTitle}", Heading="${pageHeading}"`);

  // 2. Test Time-Range Selector Toggling
  console.log("Testing time-range selector toggling (4W, 6M, 1Y, 3M)...");
  await setViewport(1280, 800);
  await evaluate(`
    (function() {
      const btn4W = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '4W');
      if (btn4W) btn4W.click();
    })()
  `);
  await sleep(400);

  await evaluate(`
    (function() {
      const btn1Y = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '1Y');
      if (btn1Y) btn1Y.click();
    })()
  `);
  await sleep(400);

  await evaluate(`
    (function() {
      const btn3M = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === '3M');
      if (btn3M) btn3M.click();
    })()
  `);
  await sleep(400);

  // 3. Test Modal Open & Log Weight
  console.log("Testing Log Weight modal interaction...");
  await evaluate(`
    (function() {
      const logBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Log weight'));
      if (logBtn) logBtn.click();
    })()
  `);
  await sleep(500);
  await captureScreenshot(path.join(OUT_DIR, "progress-modal-open.png"));

  console.log("Submitting weight in modal...");
  await evaluate(`
    (function() {
      function setReactVal(el, val) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeSetter.call(el, val);
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      // Find the one inside the dialog / modal
      const input = inputs[inputs.length - 1];
      if (input) {
        setReactVal(input, "74.8");
      }
      const saveBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Save entry'));
      if (saveBtn) saveBtn.click();
    })()
  `);
  await sleep(1500);

  // 4. Capture across 4 viewports in Light and Dark themes
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
    await captureScreenshot(path.join(OUT_DIR, `progress-${vp.name}-dark.png`));
  }
  await setViewport(1280, 800);
  await captureScreenshot(path.join(OUT_DIR, `progress-1280-full-dark.png`), true);

  console.log("Capturing Light Theme screenshots...");
  await evaluate(`document.documentElement.setAttribute('data-theme', 'light'); document.cookie = 'theme=light; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `progress-${vp.name}-light.png`));
  }
  await setViewport(1280, 800);
  await captureScreenshot(path.join(OUT_DIR, `progress-1280-full-light.png`), true);

  // 5. Capture prototype page if running
  try {
    const protoRes = await fetch("http://localhost:5173/#/progress");
    if (protoRes.ok) {
      console.log("Capturing prototype screenshot on 5173...");
      await navigate("http://localhost:5173/#/progress");
      await setViewport(1280, 800);
      await captureScreenshot(path.join(OUT_DIR, "prototype-progress-1280.png"));
    }
  } catch {
    console.log("Prototype on 5173 not reachable, skipping prototype screenshot.");
  }

  await cdp.close();
  console.log("Progress verification finished successfully!");
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
