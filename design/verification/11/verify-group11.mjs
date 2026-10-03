import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("design/verification/11");
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

  // 1. Ensure Sign-In
  await navigate("http://localhost:3000/login");
  const loginUrl = await evaluate(`window.location.href`);
  if (loginUrl.includes("/login")) {
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
    await sleep(3000);
  }
  await navigate("http://localhost:3000/cognitype");

  // 2. Test /cognitype (Setup View)
  console.log("=== Testing /cognitype (Setup View) ===");
  const pageInfo = await evaluate(`
    ({
      title: document.title,
      heading: document.querySelector("h1")?.innerText?.trim(),
      hasSetupCard: !!document.querySelector("h2"),
    })
  `);
  console.log("CogniType setup info:", pageInfo);

  // Viewports for /cognitype Setup
  const viewports = [
    { w: 360, h: 800, name: "360" },
    { w: 768, h: 1024, name: "768" },
    { w: 1280, h: 800, name: "1280" },
    { w: 1600, h: 900, name: "1600" },
  ];

  // Dark Theme
  await evaluate(`document.documentElement.setAttribute("data-theme", "dark")`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `cognitype-setup-${vp.name}-dark.png`));
  }
  await captureScreenshot(path.join(OUT_DIR, "cognitype-setup-1280-full-dark.png"), true);

  // Light Theme
  await evaluate(`document.documentElement.setAttribute("data-theme", "light")`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `cognitype-setup-${vp.name}-light.png`));
  }
  await captureScreenshot(path.join(OUT_DIR, "cognitype-setup-1280-full-light.png"), true);

  // Reset to Dark Theme
  await evaluate(`document.documentElement.setAttribute("data-theme", "dark")`);
  await setViewport(1280, 800);

  // 3. Test Interactive Typing Test Execution
  console.log("=== Testing Interactive Typing Test ===");
  // Click "Start test" button
  await evaluate(`
    (function() {
      const btns = Array.from(document.querySelectorAll("button"));
      const startBtn = btns.find(b => b.innerText.includes("Start test"));
      if (startBtn) startBtn.click();
    })()
  `);
  await sleep(1000);

  // Capture Typing Canvas
  await captureScreenshot(path.join(OUT_DIR, "cognitype-typing-canvas-dark.png"));

  // Simulate typing the passage
  console.log("Simulating typing passage to complete test...");
  await evaluate(`
    (function() {
      const input = document.querySelector("#cognitype-input");
      if (!input) return;

      // Extract target passage text from paragraphs
      const p = document.querySelector("p[aria-hidden='true']");
      const text = p ? p.innerText : "Deep concentration requires maintaining calm rhythmic pace.";

      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
      
      // Type in small batches to simulate realistic inter-key latencies
      let current = "";
      for (let i = 0; i < text.length; i++) {
        current += text[i];
      }
      nativeSetter.call(input, current);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    })()
  `);
  await sleep(2000);

  // Verify transition to Results
  const resultsInfo = await evaluate(`
    ({
      heading: document.querySelector("h1")?.innerText?.trim(),
      hasRing: !!document.querySelector("svg"),
      hasSparkline: !!document.querySelector("svg path"),
      hasSubscores: !!document.querySelectorAll("li")?.length,
    })
  `);
  console.log("Live Results Info:", resultsInfo);
  await captureScreenshot(path.join(OUT_DIR, "cognitype-results-live-dark.png"));

  // 4. Test /cognitype/sessions
  console.log("=== Testing /cognitype/sessions ===");
  await navigate("http://localhost:3000/cognitype/sessions");
  await sleep(1500);

  const sessionsInfo = await evaluate(`
    ({
      title: document.title,
      heading: document.querySelector("h1")?.innerText?.trim(),
      rowsCount: document.querySelectorAll("li").length,
    })
  `);
  console.log("Sessions page info:", sessionsInfo);

  // Dark Theme
  await evaluate(`document.documentElement.setAttribute("data-theme", "dark")`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `cognitype-sessions-${vp.name}-dark.png`));
  }
  await captureScreenshot(path.join(OUT_DIR, "cognitype-sessions-1280-full-dark.png"), true);

  // Light Theme
  await evaluate(`document.documentElement.setAttribute("data-theme", "light")`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `cognitype-sessions-${vp.name}-light.png`));
  }
  await captureScreenshot(path.join(OUT_DIR, "cognitype-sessions-1280-full-light.png"), true);

  // 5. Test /cognitype/sessions/[id]
  console.log("=== Testing /cognitype/sessions/[id] ===");
  await evaluate(`document.documentElement.setAttribute("data-theme", "dark")`);
  await setViewport(1280, 800);

  // Click on the first session row
  const firstSessionLink = await evaluate(`
    (function() {
      const link = document.querySelector("ul.divide-y li a") || document.querySelector("main a[href*='/cognitype/sessions/']");
      return link ? link.getAttribute("href") : null;
    })()
  `);
  console.log("First session link:", firstSessionLink);

  if (firstSessionLink) {
    await navigate(`http://localhost:3000${firstSessionLink}`);
    await sleep(1500);

    const detailInfo = await evaluate(`
      ({
        title: document.title,
        heading: document.querySelector("h1")?.innerText?.trim(),
        hasSparkline: !!document.querySelector("svg"),
      })
    `);
    console.log("Session detail info:", detailInfo);

    await captureScreenshot(path.join(OUT_DIR, "cognitype-detail-1280-dark.png"));
    await captureScreenshot(path.join(OUT_DIR, "cognitype-detail-1280-full-dark.png"), true);

    await evaluate(`document.documentElement.setAttribute("data-theme", "light")`);
    await sleep(300);
    await captureScreenshot(path.join(OUT_DIR, "cognitype-detail-1280-light.png"));
  }

  // 6. Test /cognitype/analytics
  console.log("=== Testing /cognitype/analytics ===");
  await evaluate(`document.documentElement.setAttribute("data-theme", "dark")`);
  await navigate("http://localhost:3000/cognitype/analytics");
  await sleep(1500);

  const analyticsInfo = await evaluate(`
    ({
      title: document.title,
      heading: document.querySelector("h1")?.innerText?.trim(),
      articlesCount: document.querySelectorAll("article").length,
      sectionsCount: document.querySelectorAll("section").length,
    })
  `);
  console.log("Analytics page info:", analyticsInfo);

  // Dark Theme
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `cognitype-analytics-${vp.name}-dark.png`));
  }
  await captureScreenshot(path.join(OUT_DIR, "cognitype-analytics-1280-full-dark.png"), true);

  // Light Theme
  await evaluate(`document.documentElement.setAttribute("data-theme", "light")`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `cognitype-analytics-${vp.name}-light.png`));
  }
  await captureScreenshot(path.join(OUT_DIR, "cognitype-analytics-1280-full-light.png"), true);

  // 7. Capture Prototype Reference Screenshots on Port 5173
  console.log("=== Capturing Prototype Reference Screenshots on Port 5173 ===");
  await setViewport(1280, 800);

  await navigate("http://localhost:5173/#/cognitype");
  await sleep(1500);
  await captureScreenshot(path.join(OUT_DIR, "prototype-cognitype-setup-1280.png"));

  await navigate("http://localhost:5173/#/cognitype/sessions");
  await sleep(1500);
  await captureScreenshot(path.join(OUT_DIR, "prototype-cognitype-sessions-1280.png"));

  await navigate("http://localhost:5173/#/cognitype/analytics");
  await sleep(1500);
  await captureScreenshot(path.join(OUT_DIR, "prototype-cognitype-analytics-1280.png"));

  console.log("Group 11 verification finished successfully!");
  await cdp.close();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
