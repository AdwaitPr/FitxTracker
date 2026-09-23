import fs from "fs";
import path from "path";

const OUT_DIR = path.resolve("design/verification/7");
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
    throw new Error("No page target found");
  }

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();
  console.log("Connected to CDP on target:", pageTarget.id);

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Network.enable");

  const consoleLogs = [];
  cdp.on("Runtime.consoleAPICalled", (params) => {
    const text = params.args.map((a) => a.value || a.description || "").join(" ");
    consoleLogs.push({ type: params.type, text });
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
    await sleep(1500);
  }

  async function setViewport(width, height) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 768,
    });
    await sleep(250);
  }

  async function captureScreenshot(filepath) {
    const data = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    fs.writeFileSync(filepath, Buffer.from(data.data, "base64"));
    console.log(`Saved screenshot: ${filepath}`);
  }

  // Check login state and sign in if needed
  await navigate("http://localhost:3000/dashboard");
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
  }

  // 1. History Route
  console.log("1. Navigating to /workouts/history...");
  await navigate("http://localhost:3000/workouts/history");

  const historyTitle = await evaluate(`document.title`);
  const historyHeading = await evaluate(`document.querySelector('h1')?.innerText`);
  const historyWorkoutsCount = await evaluate(`document.querySelectorAll('main a[href^="/workouts/"]').length`);
  console.log(`History: Title="${historyTitle}", Heading="${historyHeading}", WorkoutsCount=${historyWorkoutsCount}`);

  // Test filter interaction
  console.log("2. Testing search filter...");
  await evaluate(`
    (function() {
      const searchInput = document.querySelector('input[placeholder*="Search workouts"]');
      if (searchInput) {
        searchInput.value = 'Chest';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })();
  `);
  await sleep(400);
  const filteredCount = await evaluate(`document.querySelectorAll('main a[href^="/workouts/"]').length`);
  console.log(`Filtered for 'Chest': ${filteredCount}`);

  // Clear search filter
  await evaluate(`
    (function() {
      const searchInput = document.querySelector('input[placeholder*="Search workouts"]');
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    })();
  `);
  await sleep(400);

  const viewports = [
    { name: "360", w: 360, h: 800 },
    { name: "768", w: 768, h: 1024 },
    { name: "1280", w: 1280, h: 800 },
    { name: "1600", w: 1600, h: 900 },
  ];

  console.log("3. Capturing History screenshots...");
  // Dark mode
  await evaluate(`document.documentElement.setAttribute('data-theme', 'dark'); document.cookie = 'theme=dark; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `history-${vp.name}-dark.png`));
  }

  // Light mode
  await evaluate(`document.documentElement.setAttribute('data-theme', 'light'); document.cookie = 'theme=light; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `history-${vp.name}-light.png`));
  }

  // 4. Workout Detail Route
  const detailUrl = "http://localhost:3000/workouts/cmuaqi7lt0001uda77nk7il4o";
  console.log(`4. Navigating to detail page: ${detailUrl}...`);
  await navigate(detailUrl);

  const detailTitle = await evaluate(`document.title`);
  const detailWorkoutName = await evaluate(`document.querySelector('h1')?.innerText`);
  const exerciseCount = await evaluate(`document.querySelectorAll('section[aria-labelledby="ex-title"] button').length`);
  const sessionFacts = await evaluate(`
    Array.from(document.querySelectorAll('dl div')).map(el => el.innerText.replace(/\\n/g, ' : '))
  `);
  console.log(`Detail: Title="${detailTitle}", Name="${detailWorkoutName}", Exercises=${exerciseCount}`);
  console.log(`Session Facts:`, sessionFacts);

  console.log("5. Capturing Detail screenshots...");
  // Dark mode
  await evaluate(`document.documentElement.setAttribute('data-theme', 'dark'); document.cookie = 'theme=dark; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `workout-detail-${vp.name}-dark.png`));
  }

  // Light mode
  await evaluate(`document.documentElement.setAttribute('data-theme', 'light'); document.cookie = 'theme=light; path=/';`);
  for (const vp of viewports) {
    await setViewport(vp.w, vp.h);
    await captureScreenshot(path.join(OUT_DIR, `workout-detail-${vp.name}-light.png`));
  }

  // 6. Test Delete Modal
  console.log("6. Testing Delete modal interaction...");
  await setViewport(1280, 800);
  await evaluate(`document.documentElement.setAttribute('data-theme', 'dark');`);
  await evaluate(`
    (function() {
      const dangerBtns = Array.from(document.querySelectorAll('button'));
      const delBtn = dangerBtns.find(b => b.innerText.includes('Delete workout'));
      if (delBtn) delBtn.click();
    })();
  `);
  await sleep(400);

  const modalOpen = await evaluate(`!!document.querySelector('[data-modal-portal="true"]')`);
  console.log(`Delete modal open: ${modalOpen}`);
  await captureScreenshot(path.join(OUT_DIR, `workout-detail-delete-modal.png`));

  // Type DELETE into confirm input
  await evaluate(`
    (function() {
      const modal = document.querySelector('[data-modal-portal="true"]');
      if (modal) {
        const input = modal.querySelector('input');
        if (input) {
          input.value = 'DELETE';
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    })();
  `);
  await sleep(300);

  const deleteBtnDisabled = await evaluate(`
    (function() {
      const modal = document.querySelector('[data-modal-portal="true"]');
      if (!modal) return true;
      const btn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Delete permanently'));
      return btn ? btn.disabled : true;
    })();
  `);
  console.log(`'Delete permanently' button enabled after typing DELETE: ${!deleteBtnDisabled}`);

  // Dismiss modal via "Keep it"
  await evaluate(`
    (function() {
      const modal = document.querySelector('[data-modal-portal="true"]');
      if (modal) {
        const keepBtn = Array.from(modal.querySelectorAll('button')).find(b => b.innerText.includes('Keep it'));
        if (keepBtn) keepBtn.click();
      }
    })();
  `);
  await sleep(300);

  // 7. Capture Prototype Reference pages for comparison
  console.log("7. Capturing prototype reference pages...");
  await navigate("http://localhost:5173/#/workouts/history");
  await setViewport(1280, 800);
  await captureScreenshot(path.join(OUT_DIR, `prototype-history-1280.png`));

  await navigate("http://localhost:5173/#/workouts/h1");
  await setViewport(1280, 800);
  await captureScreenshot(path.join(OUT_DIR, `prototype-detail-1280.png`));

  const verificationData = {
    date: new Date().toISOString(),
    viewportsTested: ["360x800", "768x1024", "1280x800", "1600x900"],
    themesTested: ["dark", "light"],
    history: {
      title: historyTitle,
      heading: historyHeading,
      workoutsCount: historyWorkoutsCount,
      filteredCount,
    },
    detail: {
      title: detailTitle,
      name: detailWorkoutName,
      exercisesCount: exerciseCount,
      sessionFacts,
      modalTested: modalOpen,
      deleteBtnEnabledOnConfirm: !deleteBtnDisabled,
    },
    consoleLogsCount: consoleLogs.length,
    consoleErrors: consoleLogs.filter((l) => l.type === "error"),
  };

  fs.writeFileSync(
    path.join(OUT_DIR, "verification-data.json"),
    JSON.stringify(verificationData, null, 2)
  );

  console.log("Verification run complete!");
  await cdp.close();
}

run().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
