/*
Simple single-page app that watches a textarea for pasted content,
extracts the first JSON object it finds, parses it, and populates fields.
Also manages top buttons and popups.
*/

const input = document.getElementById('input');
const rawEl = document.getElementById('raw');
const clearBtn = document.getElementById('clear');
const showRawBtn = document.getElementById('showRaw');

const el = id => document.getElementById(id);
const scoreEl = el('score');
const summaryEl = el('summary');
const aboutEl = el('about');
const authorEl = el('author');
const companyEl = el('company');
const valuesEl = el('values');
const newsEl = el('news');
const requirementsEl = el('requirements');
const skillsEl = el('skills');
const missingSkillsEl = el('missingSkills');
const toolsEl = el('tools');
const missingToolsEl = el('missingTools');
const argumentsEl = el('arguments');
const forcesEl = el('forces');
const faiblesseEl = el('faiblesse');
const cvEls = [
  el('cv1'),el('cv2'),el('cv3'),el('cv4'),
  el('cv5'),el('cv6'),el('cv7'),el('cv8'),
  el('cv9'),el('cv10'),el('cv11'),el('cv12'),
  el('cv13'),el('cv14'),el('cv15'),el('cv16'),
];
const expEls = [
  el('exp1'), el('exp2'), el('exp3'), el('exp4')
];
const objetEl = el('objet');
const bodyEl = el('body');
const formule1El = el('formule1');
const formule2El = el('formule2');
const signatureEl = el('signature');
const atsEl = el('ats');

// popup buttons
const btnData = document.getElementById('btnData');
const btnStart = document.getElementById('btnStart');

const popupData = document.getElementById('popupData');
const popupProfile = document.getElementById('popupProfile');
const popupStart = document.getElementById('popupStart');
const popupCloseButtons = document.querySelectorAll('.popup-close');

// main page start button container (will be hidden when Start popup is open)
const centerStartEl = document.querySelector('.center-start');

function setEmpty() {
  const all = [
    scoreEl, summaryEl, aboutEl, authorEl, companyEl, valuesEl, newsEl,
    requirementsEl, skillsEl, missingSkillsEl, toolsEl, missingToolsEl,
    argumentsEl, forcesEl, faiblesseEl, objetEl, bodyEl, formule1El,
    formule2El, signatureEl, atsEl, ...cvEls
  ];
  all.forEach(n => {
    if (!n) return;
    n.textContent = '—';
    n.classList.add('empty');
  });
  rawEl.textContent = '';
  rawEl.classList.add('hidden');
}
setEmpty();

function tryExtractJson(text) {
  const firstBrace = text.indexOf('{');
  if (firstBrace === -1) return null;
  let i = firstBrace;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"' ) { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') {
      depth--;
      if (depth === 0) {
        const candidate = text.slice(firstBrace, i + 1);
        try {
          const parsed = JSON.parse(candidate);
          return parsed;
        } catch (e) {
          const nextOpen = text.indexOf('{', firstBrace + 1);
          if (nextOpen === -1) return null;
          return tryExtractJson(text.slice(nextOpen));
        }
      }
    }
  }
  return null;
}

function normalizeScore(v) {
  if (typeof v === 'number') {
    const n = Math.round(v);
    if (n < 0) return 0;
    if (n > 100) return 100;
    return n;
  }
  if (typeof v === 'string') {
    const m = v.match(/\d+/);
    if (m) return normalizeScore(Number(m[0]));
  }
  return null;
}

function populate(parsed) {
  if (!parsed || typeof parsed !== 'object') return;

  const get = (...keys) => {
    for (const k of keys) {
      if (k in parsed) return parsed[k];
      const up = k.charAt(0).toUpperCase() + k.slice(1);
      if (up in parsed) return parsed[up];
    }
    return null;
  };

  const setText = (el, val) => {
    if (!el) return;
    if (val === null || val === undefined || (typeof val === 'string' && !val.trim())) return;
    if (Array.isArray(val)) el.textContent = val.join('; ');
    else el.textContent = String(val).trim();
    el.classList.remove('empty');
  };

  const scoreVal = normalizeScore(get('score','sc'));
  if (scoreVal !== null) {
    scoreEl.textContent = String(scoreVal).padStart(2,'0');
    scoreEl.classList.remove('empty');

    // rotate arrow according to score: 0 -> 0deg, 50 -> 90deg, 100 -> 180deg
    try {
      const arrow = document.querySelector('.score-top-arrow');
      if (arrow) {
        // ensure rotation pivots around the image's blue-dot (≈9% from right, 50% height)
        arrow.style.transformOrigin = '91% 50%';
        const deg = (Number(scoreVal) / 100) * 180;
        // keep the existing translate that positions the arrow, and append rotation
        arrow.style.transform = `translate(0%,-10%) rotate(${deg}deg)`;
      }
    } catch (e) {
      // fail silently if DOM not yet available
    }
  } else {
    // if no score, ensure arrow resets to default position
    try {
      const arrow = document.querySelector('.score-top-arrow');
      if (arrow) {
        arrow.style.transformOrigin = '91% 50%';
        arrow.style.transform = 'translate(0%,-10%) rotate(0deg)';
      }
    } catch (e) {}
  }

  setText(summaryEl, get('summary','summaryText','summ'));
  setText(aboutEl, get('about','aboutText','profile'));
  setText(authorEl, get('author'));
  setText(companyEl, get('company'));
  setText(valuesEl, get('values'));
  setText(newsEl, get('news'));
  setText(requirementsEl, get('requirements'));
  setText(skillsEl, get('skills'));
  setText(missingSkillsEl, get('missingSkills','missing_skills'));
  setText(toolsEl, get('tools'));
  setText(missingToolsEl, get('missingTools','missing_tools'));
  setText(argumentsEl, get('arguments'));
  setText(forcesEl, get('forces','strengths'));
  setText(faiblesseEl, get('faiblesse','weaknesses'));
  for (let i=0;i<16;i++){
    setText(cvEls[i], get(`cvline${i+1}`, `CVline${i+1}`, `cv${i+1}`));
  }
  setText(objetEl, get('objet','object','objet'));
  setText(bodyEl, get('body'));
  setText(formule1El, get('formule 1','formule1','formule_1'));
  setText(formule2El, get('formule 2','formule2','formule_2'));
  setText(signatureEl, get('signature'));
  setText(atsEl, get('ATS','ats'));

  rawEl.textContent = JSON.stringify(parsed, null, 2);
}

input.addEventListener('paste', async (ev) => {
  setTimeout(() => {
    const text = input.value;
    const parsed = tryExtractJson(text);
    if (parsed) {
      populate(parsed);
    } else {
      setEmpty();
      rawEl.textContent = text.slice(0, 2000);
      rawEl.classList.remove('hidden');
    }
  }, 10);
});

input.addEventListener('input', () => {
  const text = input.value.trim();
  if (!text) { setEmpty(); return; }
  const parsed = tryExtractJson(text);
  if (parsed) populate(parsed);
});

clearBtn.addEventListener('click', () => {
  input.value = '';
  setEmpty();
});

showRawBtn.addEventListener('click', () => {
  rawEl.classList.toggle('hidden');
});

// Popups logic
function openPopup(popup) {
  if (!popup) return;
  popup.classList.remove('hidden');
  popup.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // hide the main page Start button/container when the Start popup is opened
  if (popup === popupStart && centerStartEl) centerStartEl.style.display = 'none';
}
function closePopup(popup) {
  if (!popup) return;
  popup.classList.add('hidden');
  popup.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // restore visibility of the main page Start button/container when the Start popup is closed
  if (popup === popupStart && centerStartEl) centerStartEl.style.display = '';
}

/*
Require three quick clicks on the Data button to open the Data popup to avoid accidental opens.
Clicks must occur within a short window (1s) to count as consecutive.
*/
let dataClickCount = 0;
let dataClickTimer = null;
btnData.addEventListener('click', () => {
  dataClickCount++;
  // reset timer
  if (dataClickTimer) clearTimeout(dataClickTimer);
  dataClickTimer = setTimeout(() => {
    dataClickCount = 0;
    dataClickTimer = null;
  }, 1000);
  if (dataClickCount >= 3) {
    dataClickCount = 0;
    if (dataClickTimer) { clearTimeout(dataClickTimer); dataClickTimer = null; }
    openPopup(popupData);
  }
});

// Start button still opens Start popup immediately
btnStart.addEventListener('click', () => openPopup(popupStart));

popupCloseButtons.forEach(b => {
  b.addEventListener('click', (e) => {
    const target = b.getAttribute('data-target');
    const p = document.getElementById(target);
    closePopup(p);
  });
});

// Step-wizard logic for Start popup
const stepRoot = document.querySelector('.steps-root');
const stepEls = stepRoot ? Array.from(stepRoot.querySelectorAll('.step')) : [];
const indicatorPills = stepRoot ? Array.from(stepRoot.querySelectorAll('.step-pill')) : [];
const btnPrev = document.getElementById('stepPrev');
const btnNext = document.getElementById('stepNext');
const stepPrevInline = document.getElementById('stepPrevInline');
const step1Input = document.getElementById('step1Input');
const step3Review = document.getElementById('step3Review');

let currentStep = 1;
function showStep(n) {
  currentStep = Math.max(1, Math.min(5, n));
  stepEls.forEach(s => s.classList.toggle('hidden', Number(s.getAttribute('data-step')) !== currentStep));
  indicatorPills.forEach(p => p.classList.toggle('active', Number(p.getAttribute('data-step')) === currentStep));
  // primary previous button hidden on first step; inline Prev shown only on first step next to Next
  btnPrev.style.display = currentStep === 1 ? 'none' : '';
  if (stepPrevInline) stepPrevInline.style.display = currentStep === 1 ? '' : 'none';
  btnNext.textContent = currentStep === 5 ? 'X' : '→';
}
if (stepRoot) {
  showStep(1);

  // clicking pills jumps to step
  indicatorPills.forEach(p => p.addEventListener('click', () => showStep(Number(p.getAttribute('data-step')))));

  btnPrev.addEventListener('click', () => {
    // if already at the first step, close the Start popup (return to previous screen)
    if (currentStep === 1) closePopup(popupStart);
    else showStep(currentStep - 1);
  });
  if (stepPrevInline) stepPrevInline.addEventListener('click', () => {
    if (currentStep === 1) closePopup(popupStart);
    else showStep(currentStep - 1);
  });
  btnNext.addEventListener('click', async () => {
    // allow advancing up to step 5; when already on 5, perform Run
    if (currentStep < 5) {
      showStep(currentStep + 1);
      // review population removed because related DOM was removed
    } else {
      // Run: if step1Input exists copy its value, otherwise just run with current textarea
      if (step1Input && step1Input.value !== undefined) {
        input.value = step1Input.value;
        input.dispatchEvent(new Event('input'));
      }
      closePopup(popupStart);
    }
  });

  // when opening the Start popup, initialize step contents from existing form
  btnStart.addEventListener('click', () => {
    // set initial input to current textarea content if the field exists
    if (step1Input && input && input.value.trim()) step1Input.value = input.value;
    showStep(1);
    openPopup(popupStart);
  });
} else {
  // fallback: wire simple open
  btnStart.addEventListener('click', () => openPopup(popupStart));
}

 // basic handlers for new generate buttons: generate print-ready A4 pages
const generateResumeBtn = document.getElementById('generateResume');
const generateLetterBtn = document.getElementById('generateLetter');

function gatherFields() {
  // profile fields from step 2 (profile_* IDs)
  const profile = {
    name: (el('profile_name') && el('profile_name').textContent !== '—') ? el('profile_name').textContent : '',
    position: (el('profile_position') && el('profile_position').textContent !== '—') ? el('profile_position').textContent : '',
    linkedin: (el('profile_linkedin') && el('profile_linkedin').textContent !== '—') ? el('profile_linkedin').textContent : '',
    birthdate: (el('profile_birthdate') && el('profile_birthdate').textContent !== '—') ? el('profile_birthdate').textContent : '',
    email: (el('profile_email') && el('profile_email').textContent !== '—') ? el('profile_email').textContent : '',
    phone: (el('profile_phone') && el('profile_phone').textContent !== '—') ? el('profile_phone').textContent : '',
    address: (el('profile_address') && el('profile_address').textContent !== '—') ? el('profile_address').textContent : '',
    driving: (el('profile_driving') && el('profile_driving').textContent !== '—') ? el('profile_driving').textContent : '',
    languages: (el('profile_languages') && el('profile_languages').textContent !== '—') ? el('profile_languages').textContent : '',
    // combine the three new education containers into the original edu1 / edu2 multi-line strings
    edu1: (function(){
      const a = el('profile_edu1_institution') ? el('profile_edu1_institution').textContent : '';
      const b = el('profile_edu1_degree') ? el('profile_edu1_degree').textContent : '';
      const c = el('profile_edu1_dates') ? el('profile_edu1_dates').textContent : '';
      const parts = [a,b,c].map(s => s && s !== '—' ? s : '').filter(Boolean);
      return parts.length ? parts.join('\n') : '';
    })(),
    edu2: (function(){
      const a = el('profile_edu2_institution') ? el('profile_edu2_institution').textContent : '';
      const b = el('profile_edu2_degree') ? el('profile_edu2_degree').textContent : '';
      const c = el('profile_edu2_dates') ? el('profile_edu2_dates').textContent : '';
      const parts = [a,b,c].map(s => s && s !== '—' ? s : '').filter(Boolean);
      return parts.length ? parts.join('\n') : '';
    })()
  };

  const experiences = expEls.map(e => {
    if (!e) return '';
    // collect each child .exp-item into a tidy string (one experience as multiple lines)
    const items = Array.from(e.querySelectorAll('.exp-item')).map(n => n.textContent.trim()).filter(Boolean);
    return items.join(' • ');
  }).filter(Boolean);

  // collect all 16 cv lines as an array (keep empty strings for missing ones so they map to experiences)
  const cvLinesAll = cvEls.map(c => (c && c.textContent !== '—') ? c.textContent : '');

  return {
    score: scoreEl.textContent === '—' ? '' : scoreEl.textContent,
    summary: summaryEl.textContent === '—' ? '' : summaryEl.textContent,
    about: aboutEl.textContent === '—' ? '' : aboutEl.textContent,
    author: authorEl.textContent === '—' ? '' : authorEl.textContent,
    company: companyEl.textContent === '—' ? '' : companyEl.textContent,
    values: valuesEl.textContent === '—' ? '' : valuesEl.textContent,
    news: newsEl.textContent === '—' ? '' : newsEl.textContent,
    requirements: requirementsEl.textContent === '—' ? '' : requirementsEl.textContent,
    skills: skillsEl.textContent === '—' ? '' : skillsEl.textContent,
    missingSkills: missingSkillsEl.textContent === '—' ? '' : missingSkillsEl.textContent,
    tools: toolsEl.textContent === '—' ? '' : toolsEl.textContent,
    missingTools: missingToolsEl.textContent === '—' ? '' : missingToolsEl.textContent,
    arguments: argumentsEl.textContent === '—' ? '' : argumentsEl.textContent,
    forces: forcesEl.textContent === '—' ? '' : forcesEl.textContent,
    faiblesse: faiblesseEl.textContent === '—' ? '' : faiblesseEl.textContent,
    // expose both a filtered list and the full 16-line array for precise mapping in templates
    cvLines: cvLinesAll.filter(Boolean),
    cvLinesAll,
    experiences,
    profile,
    objet: objetEl.textContent === '—' ? '' : objetEl.textContent,
    body: bodyEl.textContent === '—' ? '' : bodyEl.textContent,
    formule1: formule1El.textContent === '—' ? '' : formule1El.textContent,
    formule2: formule2El.textContent === '—' ? '' : formule2El.textContent,
    signature: signatureEl.textContent === '—' ? '' : signatureEl.textContent,
    ats: atsEl.textContent === '—' ? '' : atsEl.textContent,
    raw: rawEl.textContent || ''
  };
}

function openPrintWindow(html) {
  const w = window.open('', '_blank');
  if (!w) return alert('Popup blocked: allow popups to print.');
  w.document.open();
  w.document.write(html);
  w.document.close();
  // give browser a moment to render
  setTimeout(() => {
    w.focus();
    w.print();
  }, 300);
}

function buildA4Template(title, contentHtml, opts = {pages:1, personalise:1}) {
  // embed the chosen defaults into the generated HTML so downstream consumers (or print metadata)
  // can read them if needed. The attributes are harmless in the DOM and help document the intended params.
  const pages = (opts && opts.pages) ? Number(opts.pages) : 1;
  const personalise = (opts && opts.personalise) ? Number(opts.personalise) : 1;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  /* Request zero page margins so browsers don't render header/footer;
     keep a 20mm inner padding on the .page element for proper printable margins */
  /* Set default print margins: 10mm left/right and minimal top/bottom padding.
     Use a small internal .page padding of 5mm top/bottom and 10mm left/right
     so content fits within the requested printable area. */
  @page { size: A4; margin: 10mm 10mm; }
  @media print {
    html, body { height: auto; margin: 0; padding: 0; }
  }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; color:#111; margin:0; }
  /* Use minimal top/bottom (5mm) and 10mm left/right internal padding to align with @page margins */
  .page { width:210mm; min-height:297mm; padding:5mm 10mm; box-sizing:border-box; }

  /* Requested sizing rules */
  h1 { font-size:26px; margin:0 0 8px 0; } /* Name: 26px */
  .position { font-size:16px; margin:0 0 8px 0; font-weight:600; } /* Position: 16px */
  .about { font-size:13px; color:#111; line-height:1.3; text-align:left; } /* About me: 13px */
  .section-title { font-size:13px; font-weight:700; margin:12px 0 6px; text-align:center; } /* Section titles: 13px */

  .company { font-weight:600; font-size:12px; } /* Company names: 12px */
  .jobtitle { font-size:10px; margin-top:4px; } /* Job titles: 10px */
  .meta-date { font-size:9px; color:#111; text-align:right; } /* Dates & locations: 9px */

  .bullets li { font-size:10px; color:#222; margin-top:4px; text-align:left; } /* Bullet points: 10px */

  .meta { font-size:12px; color:#555; margin-bottom:12px; }
  .section { margin-bottom:12px; }
  .cv-list { margin:0; padding-left:18px; }
  pre { white-space:pre-wrap; font-family:inherit; background: #f6f6f6; padding:8px; border-radius:6px; font-size:12px; }

  /* Ensure experience block lines (company / title / location / dates) print at 11px as requested */
  .experience-entry { font-size:11px; line-height:1.25; color:#111; }
  .experience-entry .cv-lines li { font-size:11px; color:#222; margin-top:2px; text-align:left; }

  /* Languages in profile printed 1px smaller than surrounding 11px text (10px) */
  .profile-languages { font-size:10px; color:#111; line-height:1.2; white-space:pre-wrap; }

</style>
</head>
<!-- pages:${pages} personalise:${personalise} -->
<body data-pages="${pages}" data-personalise="${personalise}">
  <div class="page">
    ${contentHtml}
  </div>
</body>
</html>`;
}

if (generateResumeBtn) generateResumeBtn.addEventListener('click', () => {
  const f = gatherFields();
  // Enforce requested Skills/Tools/Languages for generated resume
  f.skills = "Requirements Gathering, Stakeholder Communication, UAT / BAT Testing, Data Validation & Reconciliation, Process Improvement, Technical Problem Solving, Cross-functional Coordination, Analytical Skills, Documentation Writing, System Analysis";
  f.tools = "JIRA, SQL, API Integration & Monitoring, Confluence, Microsoft Excel, UAT Testing Environments, Documentation Tools, Workflow Management Tools, Collaboration Platforms";
  f.profile = f.profile || {};
  f.profile.languages = "French: C2 (Native)\\nEnglish: C1 (Fluent)\\nDutch: B1 (Intermediate)";
  // build resume content using collected fields without top name/title headers — only field contents
  // Build a grouped experience + cv-lines block:
  // For each experience 1..4 show the experience entry, then its 4 cvLines (if present).
  const groupedExperienceHtml = (function(){
    if (!f.experiences || !f.experiences.length) return '';
    const groups = [];
    // count used experiences to determine which cv lines were consumed
    let usedExperiences = 0;
    for (let i = 0; i < 4; i++) {
      const exp = f.experiences[i];
      if (!exp) continue;
      usedExperiences++;
      // split into up to four parts using the " • " separator
      const parts = exp.split(' • ').map(p => p.trim());
      const left1 = parts[0] || '';
      const left2 = parts[1] || '';
      const right1 = parts[2] || '';
      const right2 = parts[3] || '';
      // two-column row: left (stacked 1 then 2), right (stacked 1 then 2) aligned to the right
      const expHtml = `
        <div class="experience-entry" style="display:flex;justify-content:space-between;align-items:flex-start;margin-top:8px;">
          <div style="width:48%;text-align:left;">
            ${left1 ? `<div style="font-weight:600;">${escapeHtml(left1)}</div>` : ''}
            ${left2 ? `<div style="margin-top:4px;">${escapeHtml(left2)}</div>` : ''}
          </div>
          <div style="width:48%;text-align:right;">
            ${right1 ? `<div>${escapeHtml(right1)}</div>` : ''}
            ${right2 ? `<div style="margin-top:4px;">${escapeHtml(right2)}</div>` : ''}
          </div>
        </div>
      `;

      // Attach the corresponding four CV lines (cvLinesAll slice) under this experience
      const cvIndexStart = i * 4;
      const cvSlice = (f.cvLinesAll || []).slice(cvIndexStart, cvIndexStart + 4).filter(Boolean);
      // render CV lines as a left-aligned bulleted list
      const cvHtml = cvSlice.length ? `<ul style="margin-top:6px;margin-left:0;padding-left:18px;">${cvSlice.map(line => `<li style="font-size:11px;color:#222;margin-top:2px;text-align:left;">${escapeHtml(line)}</li>`).join('')}</ul>` : '';

      groups.push(expHtml + cvHtml);
    }
    if (groups.length === 0) return '';
    const trailingLine = `<div style="height:1px;background:#ddd;width:100%;margin-top:12px;"></div>`;
    return { html: `<div class="section">${groups.join('\n')}${trailingLine}</div>`, usedExperiences };
  })();

  const profileHtml = f.profile ? (function(){
    // build single-line meta: address • email • phone • linkedin (with requested linkedin path)
    const parts = [];
    if (f.profile.address) parts.push(escapeHtml(f.profile.address));
    if (f.profile.email) parts.push(escapeHtml(f.profile.email));
    if (f.profile.phone) parts.push(escapeHtml(f.profile.phone));
    if (f.profile.linkedin) parts.push('in/achraf-bouhlal-50210149/');
    // meta line styled smaller and centered
    const metaLine = parts.length ? `<div class="meta" style="margin-bottom:8px;font-size:10px;text-align:center;">${parts.join(' • ')}</div>` : '';
    // horizontal rule 80% width after meta line, explicitly visible in print
    const hrLine = `<div style="height:1px;background:#ddd;width:80%;margin:8px auto;"></div>`;
    // SUMMARY block placed immediately below the hrLine, with a trailing thin divider
    const summaryBlock = f.about ? `
      <div style="margin-top:8px;max-width:720px;margin-left:auto;margin-right:auto;">
        <div style="font-weight:700;font-size:12px;margin-bottom:6px;text-align:center;">SUMMARY</div>
        <div style="font-size:11px;color:#111;line-height:1.3;text-align:left;">${escapeHtml(f.about)}</div>
        <div style="height:1px;background:#eee;width:100%;margin-top:10px;"></div>
      </div>
    ` : '';

    return `
      <div class="section" style="text-align:center;">
        ${f.profile.position ? `<div style="margin:0 0 6px 0;font-size:18px;font-weight:700;">${escapeHtml(f.profile.position)}</div>` : ''}
        ${f.profile.name ? `<h1 style="font-size:16px;margin:0 0 6px 0;font-weight:700;">${escapeHtml(f.profile.name)}</h1>` : ''}
        ${metaLine}
        ${hrLine}
        ${summaryBlock}
        <!-- Centered SUMMARY title and justified about text handled inside summaryBlock.
             Insert EXPERIENCE heading directly after the summary block. -->
        <div style="font-weight:700;font-size:12px;margin:12px 0 6px;text-align:center;">EXPERIENCE</div>
        ${(groupedExperienceHtml && groupedExperienceHtml.html) ? groupedExperienceHtml.html : ''}
        <!-- EDUCATION AND CERTIFICATIONS block -->
        ${ (f.profile.edu1 || f.profile.edu2) ? (function(){
          const renderEdu = (eduRaw) => {
            if (!eduRaw) return '';
            // split lines (handles newlines pasted into the field)
            const lines = String(eduRaw).split(/\r?\n/).map(s => s.trim()).filter(Boolean);
            if (lines.length === 0) return '';
            // ensure we have up to three parts: institution, degree/details, dates
            const institution = lines[0] || '';
            const degree = lines.length > 1 ? lines[1] : '';
            const dates = lines.length > 2 ? lines.slice(2).join(' • ') : (lines.length === 2 ? '' : '');
            return `
              <div style="margin-top:8px; font-size:11px; line-height:1.2;">
                ${institution || dates ? `
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                    ${institution ? `<div style="font-weight:600;">${escapeHtml(institution)}</div>` : `<div></div>`}
                    ${dates ? `<div style="color:#111;text-align:right;">${escapeHtml(dates)}</div>` : `<div></div>`}
                  </div>
                ` : ''}
                ${degree ? `<div style="margin-top:1px;">${escapeHtml(degree)}</div>` : ''}
              </div>
            `;
          };

          return `
            <div style="margin-top:10px;max-width:720px;margin-left:auto;margin-right:auto;text-align:left;">
              <div style="font-weight:700;font-size:12px;margin-bottom:6px;text-align:center;">EDUCATION AND CERTIFICATIONS</div>
              ${ renderEdu(f.profile.edu1) }
              ${ renderEdu(f.profile.edu2) }
              <div style="height:1px;background:#ddd;width:100%;margin-top:10px;"></div>
            </div>
          `;
        })() : ''}
        <!-- SKILLS, TOOLS and LANGUAGES displayed as three label/value rows (no bullets) -->
        <div style="margin-top:10px;max-width:720px;margin-left:auto;margin-right:auto;text-align:center;">
          <div style="font-weight:700;font-size:12px;margin-bottom:6px;">SKILLS and LANGUAGES</div>
          <div style="max-width:720px;margin-left:auto;margin-right:auto;text-align:left;font-size:11px;color:#111;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px;">
              <div style="font-weight:600;min-width:110px;">Skills</div>
              <div style="flex:1;text-align:left;">${f.skills ? escapeHtml(f.skills) : ''}</div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:8px;">
              <div style="font-weight:600;min-width:110px;">Tools</div>
              <div style="flex:1;text-align:left;">${f.tools ? escapeHtml(f.tools) : ''}</div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
              <div style="font-weight:600;min-width:110px;">Languages</div>
              <div style="flex:1;text-align:left;">${f.profile.languages ? escapeHtml(f.profile.languages) : ''}</div>
            </div>
          </div>
        </div>
      </div>`;
  })() : '';

  // (moved grouped experience generation above and injected into the profileHtml)

  const contentParts = [];

  // profileHtml already contains SUMMARY, EXPERIENCE and EDUCATION blocks,
  // so avoid re-inserting the same "about"/experience/CV sections here to prevent duplication.
  if (profileHtml) contentParts.push(profileHtml);

  // If there are any CV lines that were not attached to experiences, add them as an Additional CV lines section
  (function(){
    // determine how many experiences were used in groupedExperienceHtml result
    const used = (groupedExperienceHtml && groupedExperienceHtml.usedExperiences) ? groupedExperienceHtml.usedExperiences : 0;
    // take remaining cv lines after the ones consumed by used experiences (each consumes up to 4)
    const startIndex = used * 4;
    const leftover = (f.cvLinesAll || []).slice(startIndex).filter(Boolean);
    if (leftover.length) {
      const extraHtml = `<div style="margin-top:8px;max-width:720px;margin-left:auto;margin-right:auto;text-align:left;">
        <div style="font-weight:700;font-size:12px;margin-bottom:6px;">ADDITIONAL CV LINES</div>
        <ul style="margin:0;padding-left:18px;">${leftover.map(line => `<li style="font-size:11px;color:#222;margin-top:4px;text-align:left;">${escapeHtml(line)}</li>`).join('')}</ul>
        <div style="height:1px;background:#ddd;width:100%;margin-top:10px;"></div>
      </div>`;
      contentParts.push(extraHtml);
    }
  })();

  // Intentionally do not re-insert missingSkills, missingTools, strengths/weaknesses,
  // values or requirements here to avoid duplicating or appending extraneous text.

  const content = contentParts.join('\n');

  // Do not inject avatar image into the generated resume output
  closePopup(popupStart);
  openPrintWindow(buildA4Template('Resume', content, {pages:1, personalise:1}));
});

if (generateLetterBtn) generateLetterBtn.addEventListener('click', () => {
  const f = gatherFields();
  // Build top header: right column contains the name on top followed by the vertical contact list (DOB, email, phone, linkedin)
  const rightContactItems = [];
  // Place name first (on top) then the other items in the requested order
  if (f.profile && f.profile.name) rightContactItems.push(`<div style="font-weight:700;font-size:14px;margin-bottom:6px;">${escapeHtml(f.profile.name)}</div>`);

  if (f.profile && f.profile.email) rightContactItems.push(`<div>${escapeHtml(f.profile.email)}</div>`);
  if (f.profile && f.profile.phone) rightContactItems.push(`<div>${escapeHtml(f.profile.phone)}</div>`);
  if (f.profile && f.profile.linkedin) {
    // display just the linkedin path as requested
    rightContactItems.push(`<div>in/achraf-bouhlal-50210149/</div>`);
  }
  const rightContactHtml = rightContactItems.length ? `<div style="text-align:right;font-size:11px;line-height:1.3;">${rightContactItems.join('')}</div>` : '';

  // Build header row: left is intentionally left blank / small spacer; right contains the stacked name + contact list
  const profileBlock = `<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
      <div style="text-align:left;min-width:120px;"></div>
      <div style="min-width:160px;">${rightContactHtml}</div>
    </div>`;

  // Explicitly include all Step 4 container contents (values only, no titles)
  // Add extra spacing before and after the objet, and indent the objet by 60px.
  const step4Fragments = [];
  if (f.objet) {
    // add extra vertical space (approx. three lines) before the objet area,
    // make the objet area compact (5vh) and indented 60px, increase the internal top padding,
    // add a 10mm bottom margin and underline the objet text for print.
    step4Fragments.push(`<div style="height:42px;"></div>`);
    step4Fragments.push(`<div style="margin-left:60px; min-height:5vh; display:flex; align-items:flex-start; padding-top:18px; margin-bottom:10mm; text-decoration:underline;">${escapeHtml(f.objet)}</div>`);
    step4Fragments.push(`<div style="height:14px;"></div>`);
  }
  if (f.formule1) step4Fragments.push(`<div style="margin-top:8px;">${escapeHtml(f.formule1)}</div>`);
  if (f.body) {
    // split on double newlines to create separate paragraphs and render them justified
    const paras = String(f.body).split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    if (paras.length) {
      const parasHtml = paras.map(p => `<p style="text-align:justify;margin:0 0 12px 0;line-height:1.5;">${escapeHtml(p)}</p>`).join('');
      step4Fragments.push(`<div style="margin-top:12px;margin-bottom:12px;">${parasHtml}</div>`);
    } else {
      step4Fragments.push(`<div style="margin-top:12px;margin-bottom:12px;">${escapeHtml(f.body)}</div>`);
    }
  }
  // add extra top and bottom margin so there's a clear gap between formule2 and the signature
  if (f.formule2) step4Fragments.push(`<div style="margin-top:24px;margin-bottom:24px;">${escapeHtml(f.formule2)}</div>`);
  // include signature fragment as part of the flow; final rendering will center it above the date/location

  const step4Html = step4Fragments.length ? `<div class="section" style="margin-top:8px;">${step4Fragments.join('\n')}</div>` : '';

  // Ensure signature is centered and shown immediately above the centered date/location
  const signatureHtml = `<div class="section" style="margin-top:200px;text-align:center;">${f.signature ? `<div style="display:inline-block;">${escapeHtml(f.signature)}</div>` : '<div></div>'}</div>`;

  // Date & location should appear at the bottom below the signature and be centered: e.g., "Brussels, BE , 22/04/2026"
  // Keep bottom area free of the user's name.
  const loc = f.profile && f.profile.address ? escapeHtml(f.profile.address.split(',')[0] + ', ' + (f.profile.address.split(',')[1] || '').trim()) : 'Brussels, BE';
  const formattedDate = new Date().toLocaleDateString('en-GB'); // produces DD/MM/YYYY format like 22/04/2026
  const bottomDateHtml = `<div style="margin-top:8px;text-align:center;font-size:11px;">${loc} , ${formattedDate}</div>`;

  // Assemble content: profile header, step4 fragments (body), signature, then date+location at the very bottom
  let content = `
    ${profileBlock}
    ${step4Html}
    ${signatureHtml}
    ${bottomDateHtml}
  `;

  

  closePopup(popupStart);
  openPrintWindow(buildA4Template('Letter', content, {pages:1, personalise:1}));
});

// helper to escape raw text for inclusion in pre
function escapeHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

 // close on ESC
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    [popupData, popupProfile, popupStart].forEach(p => closePopup(p));
  }
});

// --- Auto prompt builder: watches the "Enter a short title" field and copies a composed prompt to clipboard ---

const mainTitleInput = document.getElementById('mainTitle');

/* Avatar upload + top static name/position display (moved to a top card) */
const avatarInput = document.getElementById('avatarInput');
const avatarImg = document.getElementById('avatarImg');
const avatarPlaceholder = document.getElementById('avatarPlaceholder');
const avatarWrap = document.getElementById('avatarWrap');
const topNameEl = document.getElementById('top_name');
const topPositionEl = document.getElementById('top_position');

 // avatar upload & preview (persist to localStorage)
if (avatarWrap && avatarInput) {
  avatarWrap.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const dataUrl = reader.result;
        // save to localStorage for persistence
        localStorage.setItem('avatarData', dataUrl);
        avatarImg.src = dataUrl;
        avatarImg.classList.remove('hidden');
        avatarPlaceholder.classList.add('hidden');
      } catch (err) {
        console.warn('Could not persist avatar:', err);
        // fallback to object URL
        const url = URL.createObjectURL(file);
        avatarImg.src = url;
        avatarImg.classList.remove('hidden');
        avatarPlaceholder.classList.add('hidden');
      }
    };
    reader.readAsDataURL(file);
  });
}

// initialize top name/position from existing profile cards if present
(function initTopProfileFromDefaults(){
  try {
    const pName = (el('profile_name') && el('profile_name').textContent) ? el('profile_name').textContent : null;
    const pPos = (el('profile_position') && el('profile_position').textContent) ? el('profile_position').textContent : null;
    if (topNameEl && pName) topNameEl.textContent = pName;
    if (topPositionEl && pPos) topPositionEl.textContent = pPos;
    // restore avatar from localStorage if present
    const stored = localStorage.getItem('avatarData');
    if (stored && avatarImg) {
      avatarImg.src = stored;
      avatarImg.classList.remove('hidden');
      if (avatarPlaceholder) avatarPlaceholder.classList.add('hidden');
    }
  } catch (e) { /* ignore */ }
})();

function buildPromptForClipboard(offerText, fields) {
  const originalTemplate = `{"Score":,"Summary":"","About":".","Author":"","Company":"","Values":"","Requirements":"","Skills":"","MissingSkills":"","Tools":"","Arguments":"","Forces":"","Faiblesse":"","CVline1":"Manage multi-country data and project initiatives focusing on process optimization and KPI-driven performance","CVline2":"Deliver data insights and business recommendations to improve operational efficiency and decision-making","CVline3":"Coordinate cross-functional stakeholders ensuring timely project delivery and alignment with objectives","CVline4":"Apply Agile methodologies to structure, track, and optimize project execution","CVline5":"Lead platform testing activities including UAT coordination and test case management","CVline6":"Collaborate with IT and business teams to define requirements and ensure solution alignment","CVline7":"Ensure compliance with governance standards and quality assurance processes","CVline8":"Validate platform functionality through end-to-end testing prior to release","CVline9":"Manage back-office payment operations across multiple banking platforms","CVline10":"Ensure accuracy and reconciliation of financial transactions and payment instructions","CVline11":"Investigate and resolve payment discrepancies and operational issues","CVline12":"Maintain compliance with financial regulations and internal controls","CVline13":"Lead benchmark operations ensuring data accuracy and regulatory compliance","CVline14":"Manage vendor coordination and data distribution across global financial platforms","CVline15":"Execute UAT and production validation for benchmark systems","CVline16":"Ensure auditability and integrity of financial data lifecycle processes","Objet":"","Body":"","Formule 1":"","Formule 2":"","Signature":"Bouhlal Achraf","ATS":""}`;

  const lines = [];
  lines.push(`Tu es un recruteur senior spécialisé en analyse de profils data et business, avec expertise avancée en matching sémantique profil-poste, analyse des compétences, outils, expériences et adéquation globale avec le marché belge et européen. OBJECTIF : Analyser l’adéquation entre un candidat et une offre d’emploi à partir de données structurées, en produisant un score global, un résumé, les forces et faiblesses, un matching compétences/outils, et des contenus complémentaires actionnables. INSTRUCTIONS. je veux tout le retours des textes en francais  .  Tu recois ci dessous le profile du candidat complet (cv,competences,experience,...) Analyse de l’offre d’emploi : Identifier les compétences clés demandées Identifier les outils / technologies Identifier le niveau d’expérience attendu. Voici ton prompt en texte continu (une seule ligne, prêt à envoyer) : Return ONLY valid JSON. No explanation. No text. No markdown. Score,Summary,About ,Author, Company , Values, News, Requirements, Skills, MissingSkills, Tools, MissingTools Arguments, Forces, Faiblesse,CVline1,CVline2,CVline3,CVline4, CVline5, CVline6, CVline7, CVline8, CVline9, CVline10, CVline11, CVline12, CVline13, CVline14, CVline15, CVline16, Objet, Body, Formule 1, Formule 2 , Signature, ATS}.Content : Score should be a 2 digits between 0 and 100 ¬ Summary should be a summary of the offer in 50-60 words ¬ about user should use the about me in profile (Office specialist. Strong expertise in data management, with a focus on keeping systems reliable, improving workflows, and supporting smooth day-to-day operations within financial services and operational efficiency and continuous improvement within financial institutions.  )and adapt it for the position in 50 to 70 words ¬ Author: check in the offer ¬ Company: check in the offer ¬ Values: create 3 real main values for this company based on your reserach and based on their communication ,check online real information from their website ¬ News: list real last news for this company based on your reserach check online real information from their website ¬ Requirements: check in the offer¬ Skills: compare my skills i sent you and the skills required , list only the ones that match and add 3 generic ones linked to the position ¬ MissingSkills: check the list of my skills i sent you and check the skills required that i m missing ¬ Tools: compare my tools i sent you and the tools required , list only the ones that match and add 3 generic ones linked to the position¬ MissingTools: check the list of my tools i sent you and check the tools required that i m missing¬ Arguments: create 3 main arguments why i m matching the position and be analytic ¬ Forces: create 3 forces ¬ Faiblesse: create 3 weaknesses¬ CVline1: take the points i m sending your experience 1 and adapt them into a cv line for exp 1 line 1 ¬ CVline2: take the points i m sending your experience 1 and adapt them into a cv line for exp 1 line 2¬ CVline3: take the points i m sending your experience 1 and adapt them into a cv line for exp 1 line 3¬ CVline4: take the points i m sending your experience 1 and adapt them into a cv line for exp 1 line 4¬ CVline5: take the points i m sending your experience 2 and adapt them into a cv line for exp 2 line 1¬ CVline6: take the points i m sending your experience 2 and adapt them into a cv line for exp 2 line 2¬ CVline7: take the points i m sending your experience 2 and adapt them into a cv line for exp 2 line 3¬ CVline8: take the points i m sending your experience 2 and adapt them into a cv line for exp 2 line 4¬ CVline9: take the points i m sending your experience 3 and adapt them into a cv line for exp 3 line 1¬ CVline10: take the points i m sending your experience 3 and adapt them into a cv line for exp 3 line 2¬ CVline11: take the points i m sending your experience 3 and adapt them into a cv line for exp3 line 3¬ CVline12: take the points i m sending your experience 3 and adapt them into a cv line for exp 3 line 4 ¬ CVline13: take the points i m sending your experience 4 and adapt them into a cv line for exp 4 line 1¬ CVline14: take the points i m sending your experience 4 and adapt them into a cv line for exp 4 line 2¬ CVline15: take the points i m sending your experience 4 and adapt them into a cv line for exp 4 line 3¬ CVline16: take the points i m sending your experience 4 and adapt them into a cv line for exp 4 line 4¬ Objet: here add a line where you say application for and add the position in the offer  ¬ Body: create a cover letter, maximim 250 words in 3 paragraphs , using what you undertand so my skills my experience can match what they expect. use same wording skills requirements than in the offer to match  , best ATS wording compatible, dont out a greetings begining or dear ..  and end as start with direct first paragraph . the text is in first person talkin and should not start par I   ¬ Formule 1: formule de politesse de debut soit bref et generique et rajoute le nom de l auteur de l offre,si tu ne trouves pas ecris a hiring manager  ¬ Formule 2: formule de potilesse de fin plus , soit formel et courtois ¬ Signature: mon nom ¬ ATS: liste de 10 mots qui sont reperables par les systemes ATS si il y a un screening pour cette offre. ¬1)Skills:Data Analysis & Insights ¬ Business Process Optimization ¬ Payments Systems Understanding ¬ Data Cleaning & Transformation ¬ Technical Problem Solving ¬ Client Communication & Advisory ¬ Workflow Automation (AI-assisted) ¬ Cross-functional Coordination ¬ Project Delivery (Multi-client) ¬ Reporting & KPI Tracking ¬ Platform & Data Management ¬ Remote Collaboration ¬ Business & User Acceptance Testing (UAT) ¬ SQL Data Analysis ¬ Data Validation & Reconciliation ¬ Test Case Design & Execution ¬ Defect Management ¬ Financial Data Analysis ¬ Requirements Gathering ¬ Stakeholder Communication ¬ Process Improvement ¬ Risk Analysis & Mitigation ¬ Reporting & Data Interpretation ¬ Attention to Detail ¬ Payment Processing (Domestic & International) ¬ SWIFT & SIC/EURO SIC Transactions ¬ Transaction Validation & Control ¬ Reconciliation & Data Accuracy ¬ Financial Compliance & Regulations ¬ Exception Handling & Investigation ¬ Risk Detection & Mitigation ¬ Operational Process Management ¬ Stakeholder Coordination ¬ Problem Solving & Analytical Skills ¬ Attention to Detail ¬ Process Improvement ¬ Benchmark Operations ¬ Financial Data Governance ¬ Regulatory Compliance (BMR) ¬ Data Validation & Reconciliation ¬ UAT / BAT Testing ¬ Operational Risk Control ¬ Stakeholder Management ¬ Process Optimization ¬ Attention to Detail ¬ Cross-functional Communication ¬ Business Continuity (BCP) ¬ Disaster Recovery (DR). Achivements:Improved operational efficiency by redesigning and automating data workflows across multi-client environments ¬ Delivered end-to-end analytical and data-driven projects on time across payments, business intelligence, and reporting use cases ¬ Recognized by clients for providing high-quality insights, technical clarity, and actionable business recommendations ¬ Reduced manual data processing efforts through AI-assisted automation and structured data management techniques ¬ Supported decision-making processes by transforming raw operational data into clear financial and business insights ¬ Maintained strong client satisfaction through consistent delivery, responsiveness, and problem-solving across diverse projects ¬ Identified critical defects during UAT, preventing potential financial and operational risks ¬ Improved data accuracy by validating and reconciling SQL-based financial datasets ¬ Enhanced reporting quality for Asset Managers and Distribution Partners ¬ Reduced issue resolution time through efficient defect tracking and stakeholder coordination ¬ Contributed to smoother platform releases by ensuring high-quality testing processes ¬ Optimized internal workflows by formalizing improvement requests in JIRA ¬ Strengthened stakeholder alignment by translating business needs into actionable requirements ¬ Supported financial operations with accurate calculation of fees and reporting ¬ Increased platform stability through rigorous testing and validation processes ¬ Contributed to maintaining high service quality across a global network of partners and providers ¬ Improved payment processing accuracy by ensuring strict validation and control of transaction data ¬ Reduced transaction errors and discrepancies through proactive investigation and resolution of payment issues ¬ Enhanced compliance with banking regulations and internal controls across payment operations ¬ Increased efficiency in handling domestic and international transactions across multiple platforms ¬ Minimized financial and operational risks by identifying and resolving abnormal transaction patterns ¬ Optimized resolution time for payment incidents through effective coordination with internal teams ¬ Ensured high data integrity and consistency across financial systems and transaction records ¬ Contributed to smoother operations by documenting processes and managing exceptions effectively ¬ Supported business continuity by maintaining reliable and compliant payment processing workflows ¬ Strengthened operational performance through continuous process improvement initiatives ¬ Contributed to the calculation, and operational production of key European benchmarks including EURIBOR® and EONIA® under EMMI governance ¬ Ensured accuracy, integrity, and auditability of daily benchmark submissions and fixing processes across regulated environments ¬ Operated within a controlled regulatory framework ensuring compliance with EU Benchmark Regulation (BMR) standards ¬ Managed end-to-end benchmark data lifecycle including collection, validation, calculation, and distribution to financial market participants ¬ Coordinated access and licensing operations across 50+ global financial data vendors and institutions ¬ Performed UAT, BAT, and production validation for benchmark calculation systems and release cycles (GRSS platforms) ¬ Supported central banking and ECB-related operational processes for overnight index publication and continuity frameworks ¬ Identified system anomalies and ensured resolution prior to production release to maintain benchmark integrity ¬ Maintained operational resilience through Disaster Recovery (DR) and Business Continuity Planning (BCP) procedures ¬ Collaborated with internal teams, panel banks, and external stakeholders to ensure seamless benchmark publication cycles. Tools:Microsoft Excel (Advanced Data Analysis) ¬ Microsoft Word ¬ Microsoft PowerPoint ¬ Visual Studio Code ¬ GitHub ¬ Trello ¬ Slack JIRA ¬ SQL (MySQL / PostgreSQL / Oracle) ¬ Microsoft Excel (Advanced) ¬ Microsoft Office Suite ¬ Confluence ¬ Fund Compass ¬ Provider Explorer ¬ SAP Platform ¬ Morningstar ¬ Web-based Financial Platforms SWIFT ¬ Core Banking Systems ¬ E-banking Platforms ¬ Payment Service Providers (PSP) ¬ JIRA ¬ VISA/MASTER CARD ¬ Microsoft Excel ¬ Microsoft Office Suite ¬ Internal Banking Tools VIES ¬ ExactOnline ¬ SharePoint ¬ UAT / BAT Testing Environments ¬ API Integration & Monitoring ¬ Central Bank Communication Systems ¬ Bloomberg Terminal ¬ Refinitiv / Thomson Reuters Data Feeds ¬ Internal Calculation Engines ¬ Excel (Financial Analysis) ¬ Disaster Recovery Systems (DR) ¬ Business Continuity Systems (BCP) Microsoft Teams ¬ API Testing & Integration Tools ¬ Platform Management Systems ¬ AI Tools ¬ Adobe Premiere Pro. Tasks:Managed end-to-end freelance data operations including data cleaning, structuring, and transformation for business and financial use cases ¬ Delivered business analysis and actionable insights across payments systems, platforms, and operational data flows ¬ Advised clients on data-driven process optimization, back-office efficiency, and digital transformation strategies ¬ Designed and maintained structured datasets, dashboards, and reporting frameworks for multi-client environments ¬ Provided technical support and clarification on payment systems, data pipelines, and platform integrations ¬ Built and managed AI-assisted workflows for data creation, enrichment, and automation of repetitive business tasks ¬ Collaborated remotely with diverse clients across multiple industries ensuring timely delivery of analytical and operational outputs ¬ Translated complex data structures into clear business insights for decision-making and reporting purposes ¬ Supported ad-hoc consulting missions including business intelligence, KPI tracking, and operational diagnostics ¬ Managed lightweight digital platforms and data-driven workflows for personal and client-facing systems ¬ Conducted Business & User Acceptance Testing (UAT) on web-based financial platforms (UI & database layers) ¬ Wrote and executed SQL queries to validate financial data and ensure data integrity ¬ Analyzed test results to identify defects, inconsistencies, and potential risks ¬ Collaborated with stakeholders to define requirements and test scenarios ¬ Logged, tracked, and managed issues and improvements in JIRA ¬ Calculated Trailer Fees and Service Fees for financial operations ¬ Produced reports for Asset Managers and Distribution Partners ¬ Ensured data accuracy through validation and reconciliation processes ¬ Supported daily platform operations in a global fund distribution environment ¬ Contributed to process improvements within the Platform Management team ¬ Processed domestic and international payments across multiple platforms (PSP, E-banking, SWIFT, SIC/EURO SIC) ¬ Verified accuracy and compliance of payment instructions using internal banking systems ¬ Authorized electronic fund transfers in accordance with banking procedures and controls ¬ Investigated and resolved payment discrepancies, failed transactions, and exception cases ¬ Ensured compliance with internal policies and external financial regulations ¬ Monitored and managed pending transactions in coordination with cross-functional teams ¬ Documented operational processes, exceptions, and resolution procedures ¬ Collaborated with internal departments to resolve complex payment and system issues ¬ Maintained high data accuracy and integrity across financial operations ¬ Contributed to process improvements and operational efficiency initiatives ¬ Led daily benchmark calculation operations for financial indices (EURIBOR, EONIA, PRIBOR) ¬ Ensured data accuracy, integrity, and reliability of benchmark submissions and calculations ¬ Monitored and enforced compliance with regulatory frameworks and internal governance standards ¬ Managed licensing activities including contract negotiation, client onboarding, and vendor coordination ¬ Coordinated data access and distribution across 50+ vendors and financial platforms ¬ Performed User Acceptance Testing (UAT) and production validation for benchmark systems ¬ Identified system defects and ensured resolution before production releases ¬ Collaborated with internal and external stakeholders to ensure smooth benchmark operations ¬ Maintained documentation of processes, controls, and compliance procedures ¬ Oversaw end-to-end benchmark data lifecycle from calculation to distribution. : l Offre est ici, plus bas tu trouveras les details des profiles et les cv. :  ${offerText || ''}`);
  lines.push('');
  lines.push('Profile information:');
  if (fields.profile) {
    const p = fields.profile;
    if (p.name) lines.push(`Name: ${p.name}`);
    if (p.position) lines.push(`Position: ${p.position}`);
    if (p.linkedin) lines.push(`LinkedIn: ${p.linkedin}`);
    if (p.birthdate) lines.push(`Birthdate: ${p.birthdate}`);
    if (p.email) lines.push(`Email: ${p.email}`);
    if (p.phone) lines.push(`Phone: ${p.phone}`);
    if (p.address) lines.push(`Address: ${p.address}`);
    if (p.driving) lines.push(`Driving licence: ${p.driving}`);
    if (p.languages) lines.push(`Languages: ${p.languages}`);
    if (p.edu1) lines.push(`Education 1: ${p.edu1.replace(/\n/g,' | ')}`);
    if (p.edu2) lines.push(`Education 2: ${p.edu2.replace(/\n/g,' | ')}`);
  }
  lines.push('');
  lines.push('Experiences:');
  if (fields.experiences && fields.experiences.length) {
    fields.experiences.forEach((ex, i) => {
      lines.push(`Experience ${i+1}: ${ex}`);
    });
  }
  lines.push('');
  lines.push('CV lines:');
  if (fields.cvLinesAll && fields.cvLinesAll.length) {
    fields.cvLinesAll.forEach((l, i) => {
      if (l) lines.push(`CVline${i+1}: ${l}`);
    });
  }
  lines.push('');
  lines.push('Original JSON template:');
  lines.push(originalTemplate);

  return lines.join('\n');
}

async function copyPromptToClipboard() {
  if (!mainTitleInput) return;
  const offerText = mainTitleInput.value || '';
  const fields = gatherFields();
  const prompt = buildPromptForClipboard(offerText, fields);
  try {
    await navigator.clipboard.writeText(prompt);
    // brief visual feedback: show raw panel then hide
    rawEl.textContent = prompt.slice(0, 2000);
    rawEl.classList.remove('hidden');
    setTimeout(() => { rawEl.classList.add('hidden'); }, 1400);
  } catch (err) {
    console.warn('Clipboard copy failed', err);
  }
}

// debounce wiring for input/paste on mainTitle
let copyTimer = null;
if (mainTitleInput) {
  mainTitleInput.addEventListener('input', () => {
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(copyPromptToClipboard, 500);
  });
  mainTitleInput.addEventListener('paste', () => {
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(copyPromptToClipboard, 300);
  });
}
