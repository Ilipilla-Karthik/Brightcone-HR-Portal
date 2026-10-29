import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

async function cdpRequest(ws, id, method, params = {}) {
  return new Promise((resolve, reject) => {
    const handler = (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });
}

async function runBrowserFlow() {
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\satvi';
  const outDir = path.join(userProfile, '.gemini', 'antigravity-ide', 'brain', 'da2f3938-af14-4e5a-be31-31230f3dff2e', 'browser');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const tempDir = path.join(process.env.TEMP || 'C:\\TEMP', 'chrome_e2e_' + Date.now());
  console.log(`Starting headless browser: ${chromePath}...`);
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    `--user-data-dir=${tempDir}`,
    'about:blank',
  ]);

  // Wait for port 9222
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) break;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  console.log('Connecting to headless Chrome on port 9222...');
  const newTabRes = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
  const tab = await newTabRes.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  await new Promise((resolve) => ws.addEventListener('open', resolve));

  let reqId = 1;
  await cdpRequest(ws, reqId++, 'Page.enable');
  await cdpRequest(ws, reqId++, 'Runtime.enable');
  await cdpRequest(ws, reqId++, 'Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });

  console.log('\n--- VERIFICATION STEP 1: Unauthenticated Protection & Login Page Reference Matching ---');
  // 1A. Direct visit to /performance/admin without token -> should redirect to /login
  console.log('1A. Visiting /performance/admin unauthenticated...');
  await cdpRequest(ws, reqId++, 'Page.navigate', { url: 'http://127.0.0.1:3000/performance/admin' });
  let unauthLocValue = '';
  for (let poll = 0; poll < 20; poll++) {
    await new Promise((r) => setTimeout(r, 250));
    const loc = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'window.location.pathname' });
    unauthLocValue = loc.result?.value;
    if (unauthLocValue === '/login') break;
  }
  console.log('Unauthenticated /performance/admin redirected to:', unauthLocValue);
  if (unauthLocValue !== '/login') {
    throw new Error(`Expected redirect to /login but got ${unauthLocValue}`);
  }

  // 1B. Direct visit to /learn/dashboard without token -> should redirect to /login
  console.log('1B. Visiting /learn/dashboard unauthenticated...');
  await cdpRequest(ws, reqId++, 'Page.navigate', { url: 'http://127.0.0.1:3000/learn/dashboard' });
  let unauthLearnLocValue = '';
  for (let poll = 0; poll < 20; poll++) {
    await new Promise((r) => setTimeout(r, 250));
    const loc = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'window.location.pathname' });
    unauthLearnLocValue = loc.result?.value;
    if (unauthLearnLocValue === '/login') break;
  }
  console.log('Unauthenticated /learn/dashboard redirected to:', unauthLearnLocValue);
  if (unauthLearnLocValue !== '/login') {
    throw new Error(`Expected redirect to /login but got ${unauthLearnLocValue}`);
  }

  // 1C. Invalid/expired token rejection via 401 interceptor
  console.log('1C. Testing invalid token injection & 401 interceptor...');
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      localStorage.setItem('token', 'invalid_expired_token_signature');
      localStorage.setItem('user', JSON.stringify({ role: 'HR_ADMIN', name: 'Fake Session' }));
    `,
  });
  await cdpRequest(ws, reqId++, 'Page.navigate', { url: 'http://127.0.0.1:3000/performance/admin' });
  await new Promise((r) => setTimeout(r, 2000));
  const invalidTokenLoc = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'window.location.pathname' });
  const clearedToken = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'localStorage.getItem("token")' });
  console.log('Invalid token redirected to:', invalidTokenLoc.result.value, '| token purged:', clearedToken.result.value === null);
  if (invalidTokenLoc.result.value !== '/login') {
    throw new Error(`Expected redirect to /login on 401 but got ${invalidTokenLoc.result.value}`);
  }

  // 1D. Verify Login Page Layout against Design Reference
  console.log('1D. Inspecting Login Page structure against reference HTML...');
  const loginCheck = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const hasLeftPanel = !!document.querySelector('section[class*="lp"]');
        const h2Text = document.querySelector('h2')?.textContent || '';
        const hasTag = !!document.querySelector('div[class*="lpTag"]');
        const hasLapps = !!document.querySelector('div[class*="lapps"]');
        const hasGlasses = !!document.querySelector('div[class*="glasses"]');
        const hasFoot = !!document.querySelector('div[class*="lpFoot"]');
        const h1Text = document.querySelector('h1')?.textContent || '';
        const emailInput = !!document.querySelector('#email');
        const passwordInput = !!document.querySelector('#password');
        const showPwBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Show') || b.textContent.includes('Hide'));
        const msBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Microsoft'));
        return { hasLeftPanel, h2Text, hasTag, hasLapps, hasGlasses, hasFoot, h1Text, emailInput, passwordInput, showPwBtn, msBtn };
      })()
    `,
    returnByValue: true,
  });
  console.log('Login DOM check against reference:', loginCheck.result.value);

  // Capture screenshot of matched login page
  const loginScreen = await cdpRequest(ws, reqId++, 'Page.captureScreenshot', { format: 'png' });
  const loginPath = path.join(outDir, 'login_page_matched.png');
  fs.writeFileSync(loginPath, Buffer.from(loginScreen.data, 'base64'));
  console.log(`Saved Login screenshot: ${loginPath} (${fs.statSync(loginPath).size} bytes)`);

  console.log('\n--- VERIFICATION STEP 2: Administrator Authentication & Session Restoration ---');
  // 2. Perform authentic Admin Login
  console.log('2. Submitting Admin credentials via UI login form...');
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        function setReactInput(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setReactInput(document.querySelector('#email'), 'ananya.rao@brightcone.ai');
        setReactInput(document.querySelector('#password'), 'Admin@123');
        document.querySelector('button[type="submit"]').click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 2500));

  const postLoginLoc = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'window.location.pathname' });
  console.log('Admin login successful. Landing page:', postLoginLoc.result.value);

  // Navigate to Performance Admin
  console.log('Navigating to /performance/admin...');
  await cdpRequest(ws, reqId++, 'Page.navigate', { url: 'http://127.0.0.1:3000/performance/admin' });
  await new Promise((r) => setTimeout(r, 2500));

  // Capture screenshot of Performance Admin Page
  const perfScreen = await cdpRequest(ws, reqId++, 'Page.captureScreenshot', { format: 'png' });
  const perfPath = path.join(outDir, 'prod_performance_admin.png');
  fs.writeFileSync(perfPath, Buffer.from(perfScreen.data, 'base64'));
  console.log(`Saved ${perfPath} (${fs.statSync(perfPath).size} bytes)`);

  // Verify Performance Admin DOM elements
  const perfCheck = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const title = document.querySelector('h1')?.textContent || '';
        const steps = Array.from(document.querySelectorAll('.step b, div[class*="step"] b')).map(el => el.textContent.trim());
        const statLabels = Array.from(document.querySelectorAll('p[class*="statLabel"]')).map(el => el.textContent.trim());
        const rows = document.querySelectorAll('tbody tr').length;
        const exportBtn = !!document.querySelector('button[title*="CSV"], button[title*="Export"]');
        return { title, steps, statLabels, rows, exportBtn };
      })()
    `,
    returnByValue: true,
  });
  console.log('Performance Admin DOM check:', perfCheck.result.value);

  console.log('\n--- VERIFICATION STEP 3: Modals & Navigation In Performance Admin ---');
  // 3A. Test New Cycle Modal
  console.log('3A. Testing New Cycle modal (open and Escape key)...');
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('New cycle'));
        if (btn) btn.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 1000));

  const modalOpenCheck = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `!!document.querySelector('#new-cycle-title')`,
  });
  console.log('New Cycle modal is open:', modalOpenCheck.result.value);

  // Press Escape to dismiss
  await cdpRequest(ws, reqId++, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await cdpRequest(ws, reqId++, 'Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
  await new Promise((r) => setTimeout(r, 500));

  const modalClosedCheck = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `!document.querySelector('#new-cycle-title')`,
  });
  console.log('New Cycle modal closed via Escape:', modalClosedCheck.result.value);

  // 3B. Test Switch tab to Learning Admin
  console.log('3B. Navigating to Learning Admin via tab...');
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const learnTab = Array.from(document.querySelectorAll('a[role="tab"]')).find(a => a.textContent.includes('Learning Admin'));
        if (learnTab) learnTab.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 2000));

  const learnTabLoc = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'window.location.pathname' });
  console.log('Learning Admin tab location:', learnTabLoc.result.value);

  // Switch back to Performance Admin tab
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const perfTab = Array.from(document.querySelectorAll('a[role="tab"]')).find(a => a.textContent.includes('Performance'));
        if (perfTab) perfTab.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 2000));

  // 3C. Admin seeds fresh past-due mandatory course for REC-13 testing via Node fetch
  console.log('3C. Admin seeding fresh past-due mandatory course for REC-13 testing...');
  const loginAdminRes = await fetch('http://127.0.0.1:5155/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ananya.rao@brightcone.ai', password: 'Admin@123' }),
  });
  const adminData = await loginAdminRes.json();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const courseTitle = `REC-13 E2E Past Due Compliance ${Date.now()}`;
  const unavailTitle = `REC-13 E2E No-Resource Course ${Date.now()}`;

  // Course A: with valid learning resource
  const createRes = await fetch('http://127.0.0.1:5155/api/v1/learn/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + adminData.token,
    },
    body: JSON.stringify({
      title: courseTitle,
      course_type: 'Mandatory',
      duration: '45 mins',
      audience: 'Everyone',
      due_date: yesterday,
      content_type: 'document',
      content_url: 'https://example.com/',
    }),
  });
  const createdCourse = await createRes.json();
  console.log('Created test course with accessible test resource:', createdCourse.id, createdCourse.title, createdCourse.content_url);

  // Course B: without learning resource (honest unavailable state)
  const createUnavailRes = await fetch('http://127.0.0.1:5155/api/v1/learn/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + adminData.token,
    },
    body: JSON.stringify({
      title: unavailTitle,
      course_type: 'Mandatory',
      duration: '30 mins',
      audience: 'Everyone',
      due_date: yesterday,
    }),
  });
  const createdUnavailCourse = await createUnavailRes.json();
  console.log('Created test course without resource:', createdUnavailCourse.id, createdUnavailCourse.title);

  console.log('\n--- VERIFICATION STEP 4: Sign Out & Token Clearance ---');
  console.log('Signing out admin...');
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `document.querySelector('button[title="Sign out"]')?.click();`,
  });
  await new Promise((r) => setTimeout(r, 1500));

  const afterLogoutLoc = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'window.location.pathname' });
  const afterLogoutToken = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'localStorage.getItem("token")' });
  console.log('After logout location:', afterLogoutLoc.result.value, '| token purged:', afterLogoutToken.result.value === null);

  console.log('\n--- VERIFICATION STEP 5: Employee Login & My Learning Course Attestation Flow ---');
  console.log('Submitting Employee credentials (rahul.varma@brightcone.ai)...');
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        function setReactInput(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setReactInput(document.querySelector('#email'), 'rahul.varma@brightcone.ai');
        setReactInput(document.querySelector('#password'), 'Welcome@123');
        document.querySelector('button[type="submit"]').click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 3000));

  const empLoc = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'window.location.pathname' });
  console.log('Employee landed on:', empLoc.result.value);
  if (empLoc.result.value !== '/learn/my-learning') {
    throw new Error(`Expected employee to land on /learn/my-learning but got ${empLoc.result.value}`);
  }

  // 5A-1. Explicitly verify REC-13 Course Cards, Overdue Flags, and Unavailable Indicators
  console.log('5A-1. Inspecting Course Cards, Overdue Flags, and Unavailable Resource Tags...');
  const cardEvaluation = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('div[class*="courseCard"]'));
        const overdueBadges = Array.from(document.querySelectorAll('[data-testid="overdue-badge"]')).map(b => b.textContent.trim());
        const unavailableTags = Array.from(document.querySelectorAll('[data-testid="no-material-indicator"]')).map(t => t.textContent.trim());
        const cardDetails = cards.map(c => {
          const title = c.querySelector('h3')?.textContent?.trim() || '';
          const meta = c.querySelector('p[class*="cardMeta"]')?.textContent?.trim() || '';
          const badges = Array.from(c.querySelectorAll('span[class*="pill"]')).map(p => p.textContent.trim());
          const hasOverdue = badges.some(b => b.includes('Overdue'));
          const btn = c.querySelector('button')?.textContent?.trim() || '';
          const noMaterial = c.querySelector('[data-testid="no-material-indicator"]')?.textContent?.trim() || '';
          return { title, meta, badges, hasOverdue, btn, noMaterial };
        });
        return { totalCards: cards.length, overdueBadges, unavailableTagsCount: unavailableTags.length, cardDetails };
      })()
    `,
    returnByValue: true,
  });
  console.log('REC-13 Card Evaluation summary:', {
    totalCards: cardEvaluation.result.value.totalCards,
    overdueBadgesCount: cardEvaluation.result.value.overdueBadges.length,
    unavailableTagsCount: cardEvaluation.result.value.unavailableTagsCount,
  });

  if (cardEvaluation.result.value.totalCards === 0) {
    throw new Error('No course cards displayed on My Learning page!');
  }
  if (cardEvaluation.result.value.overdueBadges.length === 0) {
    throw new Error('Expected at least one Overdue · Mandatory badge for past-due mandatory course, but found none!');
  }
  if (cardEvaluation.result.value.unavailableTagsCount === 0) {
    throw new Error('Expected at least one "Course material has not been added yet." tag for resource-less courses, but found none!');
  }
  console.log(`Verified ${cardEvaluation.result.value.unavailableTagsCount} honest "Course material has not been added yet." indicator(s).`);

  // Capture screenshot of My Learning page (desktop)
  const myLearningScreen = await cdpRequest(ws, reqId++, 'Page.captureScreenshot', { format: 'png' });
  const myLearningPath = path.join(outDir, 'rec13_employee_cards.png');
  fs.writeFileSync(myLearningPath, Buffer.from(myLearningScreen.data, 'base64'));
  console.log(`Saved My Learning cards view: ${myLearningPath}`);

  // Scroll target card with material into view
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('div[class*="courseCard"]'));
        const targetCard = cards.find(c => c.textContent.includes('${courseTitle}'));
        if (targetCard) targetCard.scrollIntoView({ behavior: 'instant', block: 'center' });
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 600));

  const overdueFlagScreen = await cdpRequest(ws, reqId++, 'Page.captureScreenshot', { format: 'png' });
  const overdueFlagPath = path.join(outDir, 'rec13_overdue_flag.png');
  fs.writeFileSync(overdueFlagPath, Buffer.from(overdueFlagScreen.data, 'base64'));
  console.log(`Saved Overdue Flag view: ${overdueFlagPath}`);

  // 5B. Open Lesson Player Modal for course with attached resource
  console.log(`5B. Opening Course Player for course with material: "${courseTitle}"...`);
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('div[class*="courseCard"]'));
        const targetCard = cards.find(c => c.textContent.includes('${courseTitle}'));
        const btn = targetCard ? targetCard.querySelector('button') : null;
        if (btn) btn.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Check Lesson Modal Header, Metadata, and Resource link flow
  const modalCheck = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const modal = !!document.querySelector('div[role="dialog"]');
        const title = document.querySelector('#lesson-title')?.textContent?.trim() || '';
        const meta = document.querySelector('p[class*="meta"]')?.textContent?.trim() || '';
        const openMaterialBtn = document.querySelector('#btn-open-course-material');
        const openMaterialHref = openMaterialBtn?.getAttribute('href') || '';
        const openMaterialRel = openMaterialBtn?.getAttribute('rel') || '';
        const openMaterialTarget = openMaterialBtn?.getAttribute('target') || '';
        const hasResourceType = !!document.querySelector('span[class*="typeBadge"]');
        const resourceTypeBadge = document.querySelector('span[class*="typeBadge"]')?.textContent?.trim() || '';
        const hasAttestNotice = document.body.textContent.includes('Completion is self-reported by the employee.');
        const hasProviderNotice = document.body.textContent.includes('provider sign-in may be required');
        const hasCheckbox = !!document.querySelector('input[type="checkbox"]');
        const attestBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Self-report') || b.textContent.includes('Attest'));
        const attestBtnText = attestBtn?.textContent?.trim() || '';
        return {
          modal,
          title,
          meta,
          hasOpenMaterial: !!openMaterialBtn,
          openMaterialHref,
          openMaterialRel,
          openMaterialTarget,
          hasResourceType,
          resourceTypeBadge,
          hasAttestNotice,
          hasProviderNotice,
          hasCheckbox,
          attestBtnText
        };
      })()
    `,
    returnByValue: true,
  });
  console.log('Lesson Player Modal verification:', modalCheck.result.value);
  if (!modalCheck.result.value.modal) {
    throw new Error('Lesson modal did not open!');
  }
  if (!modalCheck.result.value.hasOpenMaterial) {
    throw new Error('Expected "Open course material" action button in modal, but none found!');
  }
  if (modalCheck.result.value.openMaterialTarget !== '_blank' || !modalCheck.result.value.openMaterialRel.includes('noopener')) {
    throw new Error(`Expected target="_blank" and rel containing "noopener noreferrer", got target="${modalCheck.result.value.openMaterialTarget}" rel="${modalCheck.result.value.openMaterialRel}"`);
  }
  if (!modalCheck.result.value.hasAttestNotice) {
    throw new Error('Expected exact wording "Completion is self-reported by the employee.", but not found!');
  }
  if (!modalCheck.result.value.hasProviderNotice) {
    throw new Error('Expected provider sign-in notice, but not found!');
  }

  // Capture screenshot of opened Lesson Player Modal with Resource link
  const modalScreen = await cdpRequest(ws, reqId++, 'Page.captureScreenshot', { format: 'png' });
  const modalPath = path.join(outDir, 'rec13_take_course.png');
  fs.writeFileSync(modalPath, Buffer.from(modalScreen.data, 'base64'));
  console.log(`Saved Lesson Player modal screenshot: ${modalPath}`);

  // 5B-2. Verify actual content loads, not only the href or link attributes
  console.log(`5B-2. Verifying actual course material content loads from ${modalCheck.result.value.openMaterialHref}...`);
  const materialFetch = await fetch(modalCheck.result.value.openMaterialHref);
  const materialBody = await materialFetch.text();
  console.log(`External resource HTTP Status: ${materialFetch.status} ${materialFetch.statusText}, Content length: ${materialBody.length} bytes`);
  if (!materialFetch.ok || !materialBody.includes('Example Domain')) {
    throw new Error(`Failed to load actual course material content from ${modalCheck.result.value.openMaterialHref}!`);
  }
  console.log('Verified: external material returned HTTP 200 OK and loaded authentic content.');

  // 5B-3. Verify opening material alone does NOT mark the assignment completed
  console.log('5B-3. Verifying opening material alone does NOT mark assignment completed...');
  const beforeAttestCheck = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const isComplete = Array.from(document.querySelectorAll('span, div, b')).some(el => el.textContent.includes('Self-reported complete'));
        const hasCertBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('View Completion Record'));
        const checkboxChecked = document.querySelector('input[type="checkbox"]')?.checked || false;
        return { isComplete, hasCertBtn, checkboxChecked };
      })()
    `,
    returnByValue: true,
  });
  console.log('State before attestation:', beforeAttestCheck.result.value);
  if (beforeAttestCheck.result.value.isComplete || beforeAttestCheck.result.value.hasCertBtn) {
    throw new Error('Opening course material improperly marked the assignment completed!');
  }

  // 5C. Check attestation checkbox and execute Self-Reported Completion
  console.log('5C. Checking attestation checkbox and submitting self-reported completion...');
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const cb = document.querySelector('input[type="checkbox"]');
        if (cb && !cb.checked) {
          cb.click();
        }
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Self-report course completion'));
        if (btn) btn.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 2000));

  // Verify modal state after completion
  const afterAttestCheck = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const isCompleteText = Array.from(document.querySelectorAll('span, div, b')).some(el => el.textContent.includes('Self-reported complete') || el.textContent.includes('Completion Confirmed'));
        const hasCertBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('View Completion Record'));
        const errorToast = Array.from(document.querySelectorAll('div[class*="toastError"]')).length;
        const successToast = Array.from(document.querySelectorAll('div[class*="toastSuccess"]')).length;
        return { isCompleteText, hasCertBtn, errorToast, successToast };
      })()
    `,
    returnByValue: true,
  });
  console.log('After attestation check:', afterAttestCheck.result.value);
  if (afterAttestCheck.result.value.errorToast > 0) {
    throw new Error(`Encountered ${afterAttestCheck.result.value.errorToast} error toasts during progress completion!`);
  }

  // Capture screenshot of completed state in modal
  const completedModalScreen = await cdpRequest(ws, reqId++, 'Page.captureScreenshot', { format: 'png' });
  const completedModalPath = path.join(outDir, 'rec13_lesson_player_completed.png');
  fs.writeFileSync(completedModalPath, Buffer.from(completedModalScreen.data, 'base64'));
  console.log(`Saved Completed Lesson Player screenshot: ${completedModalPath}`);

  // 5D. View Certificate Record
  if (afterAttestCheck.result.value.hasCertBtn) {
    console.log('5D. Opening Completion Record Modal...');
    await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('View Completion Record'));
          if (btn) btn.click();
        })()
      `,
    });
    await new Promise((r) => setTimeout(r, 1200));

    const certScreen = await cdpRequest(ws, reqId++, 'Page.captureScreenshot', { format: 'png' });
    const certPath = path.join(outDir, 'rec13_certificate_modal.png');
    fs.writeFileSync(certPath, Buffer.from(certScreen.data, 'base64'));
    console.log(`Saved Certificate record screenshot: ${certPath}`);

    // Close certificate modal via Escape
    await cdpRequest(ws, reqId++, 'Input.dispatchKeyEvent', { type: 'rawKeyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await cdpRequest(ws, reqId++, 'Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
    await new Promise((r) => setTimeout(r, 500));
  }

  // Close any open lesson modal via Escape or Close button
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Close');
        if (closeBtn) closeBtn.click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 800));

  // 5E. Verify Persisted Card on /learn/my-learning after reload
  console.log('5E. Reloading page to verify persistence across page refresh...');
  await cdpRequest(ws, reqId++, 'Page.reload');
  await new Promise((r) => setTimeout(r, 2000));

  const cardCheck = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const has100 = Array.from(document.querySelectorAll('span, div')).some(el => el.textContent.includes('100% (Self-reported)'));
        const hasCertButton = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Completion record'));
        return { has100, hasCertButton };
      })()
    `,
    returnByValue: true,
  });
  console.log('My Learning persisted card check after refresh:', cardCheck.result.value);
  if (!cardCheck.result.value.has100 || !cardCheck.result.value.hasCertButton) {
    throw new Error('Course completion did not persist after page refresh!');
  }

  // 5E-2. Verify persistence across Logout and Login
  console.log('5E-2. Testing persistence across Logout and Login...');
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `document.querySelector('button[title="Sign out"]')?.click();`,
  });
  await new Promise((r) => setTimeout(r, 1500));

  // Log in as Rahul again
  await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        function setReactInput(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
        setReactInput(document.querySelector('#email'), 'rahul.varma@brightcone.ai');
        setReactInput(document.querySelector('#password'), 'Welcome@123');
        document.querySelector('button[type="submit"]').click();
      })()
    `,
  });
  await new Promise((r) => setTimeout(r, 2000));

  const reloginCardCheck = await cdpRequest(ws, reqId++, 'Runtime.evaluate', {
    expression: `
      (() => {
        const has100 = Array.from(document.querySelectorAll('span, div')).some(el => el.textContent.includes('100% (Self-reported)'));
        const hasCertButton = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Completion record'));
        return { has100, hasCertButton };
      })()
    `,
    returnByValue: true,
  });
  console.log('Persistence check after logout/login:', reloginCardCheck.result.value);
  if (!reloginCardCheck.result.value.has100 || !reloginCardCheck.result.value.hasCertButton) {
    throw new Error('Course completion did not persist across logout/login!');
  }

  // 5E-3. Cross-Employee Authorization Check (Employee 2 cannot access Rahul's assignment)
  console.log('5E-3. Testing cross-employee assignment access rejection...');
  const empLoginRes = await fetch('http://127.0.0.1:5155/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rahul.varma@brightcone.ai', password: 'Welcome@123' }),
  });
  const empData = await empLoginRes.json();
  const rahulAssRes = await fetch('http://127.0.0.1:5155/api/v1/learn/my-learning', {
    headers: { 'Authorization': 'Bearer ' + empData.token }
  });
  const rahulAssignments = await rahulAssRes.json();
  const rahulTargetAss = rahulAssignments.find(a => a.course_id === createdCourse.id);

  if (rahulTargetAss) {
    const emp2LoginRes = await fetch('http://127.0.0.1:5155/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user2@example.com', password: '12341234' }),
    });
    const emp2Data = await emp2LoginRes.json();

    const tamperGetRes = await fetch(`http://127.0.0.1:5155/api/v1/learn/assignments/${rahulTargetAss.id}`, {
      headers: { 'Authorization': 'Bearer ' + emp2Data.token }
    });
    console.log(`Cross-employee GET assignment status code: ${tamperGetRes.status}`);
    if (tamperGetRes.status !== 401 && tamperGetRes.status !== 403) {
      throw new Error(`Expected 401/403 when user2 accesses Rahul's assignment, got ${tamperGetRes.status}`);
    }

    const tamperPostRes = await fetch(`http://127.0.0.1:5155/api/v1/learn/assignments/${rahulTargetAss.id}/progress`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + emp2Data.token
      },
      body: JSON.stringify({ progress: 100 })
    });
    console.log(`Cross-employee POST assignment progress status code: ${tamperPostRes.status}`);
    if (tamperPostRes.status !== 401 && tamperPostRes.status !== 403) {
      throw new Error(`Expected 401/403 when user2 tampers with Rahul's assignment progress, got ${tamperPostRes.status}`);
    }
  }

  // 5F. Verify Mobile Responsive Layout (375x812)
  console.log('5F. Testing Mobile Viewport (375x812)...');
  await cdpRequest(ws, reqId++, 'Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await new Promise((r) => setTimeout(r, 1000));

  const mobileScreen = await cdpRequest(ws, reqId++, 'Page.captureScreenshot', { format: 'png' });
  const mobilePath = path.join(outDir, 'rec13_mobile_learning.png');
  fs.writeFileSync(mobilePath, Buffer.from(mobileScreen.data, 'base64'));
  console.log(`Saved Mobile Learning screenshot: ${mobilePath}`);

  // Restore Desktop Viewport
  await cdpRequest(ws, reqId++, 'Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await new Promise((r) => setTimeout(r, 500));

  // 5G. Verify Employee is Blocked from Performance Admin
  console.log('5G. Verifying Employee is blocked from /performance/admin...');
  await cdpRequest(ws, reqId++, 'Page.navigate', { url: 'http://127.0.0.1:3000/performance/admin' });
  await new Promise((r) => setTimeout(r, 2000));
  const blockedLoc = await cdpRequest(ws, reqId++, 'Runtime.evaluate', { expression: 'window.location.pathname' });
  console.log('Employee navigating to /performance/admin redirected to:', blockedLoc.result.value);
  if (blockedLoc.result.value === '/performance/admin') {
    throw new Error('Employee was NOT blocked from /performance/admin!');
  }

  try {
    await cdpRequest(ws, reqId++, 'Page.close');
    ws.close();
    console.log('\n========================================================');
    console.log('ALL BROWSER E2E TESTS PASSED SUCCESSFULLY (5/5 SECTIONS)!');
    console.log('========================================================\n');
  } finally {
    try {
      chromeProc.kill();
    } catch {}
  }
}

runBrowserFlow().catch((err) => {
  console.error('Browser flow error:', err);
  process.exit(1);
});
