/* Verified: keeping existing popup/button behavior unchanged */
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popupTitle');
const popupBody = document.getElementById('popupBody');
const popupClose = document.getElementById('popupClose');

const detailPopup = document.getElementById('detailPopup');
const detailTitle = document.getElementById('detailTitle');
const detailBody = document.getElementById('detailBody');
const detailClose = document.getElementById('detailClose');

const toolsContainer = document.getElementById('toolsContainer');
const sidebar = document.getElementById('mySidebar');
const menuBtn = document.getElementById('menuBtn');
const closeSidebar = document.querySelector('#mySidebar .closebtn');

// dark mode toggle button (inserted in header)
const darkModeBtns = document.querySelectorAll('#darkModeBtn');

const langBtn = document.getElementById('langBtn');

if (menuBtn) menuBtn.addEventListener('click', ()=> sidebar.classList.add('open'));
if (closeSidebar) closeSidebar.addEventListener('click', ()=> sidebar.classList.remove('open'));

/* Dark mode toggle behavior: support multiple headers/pages (there can be several #darkModeBtn instances) */
function setDarkMode(enabled){
  if (enabled) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  // update button visuals and aria
  darkModeBtns.forEach(b=>{
    b.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    const icon = b.querySelector('i');
    if (icon){
      icon.classList.remove('fa-moon','fa-sun');
      icon.classList.add(enabled ? 'fa-sun' : 'fa-moon');
    }
  });
  try{ localStorage.setItem('quboor-dark','' + (enabled?1:0)); }catch(e){}
}

darkModeBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const current = document.documentElement.classList.contains('dark');
    setDarkMode(!current);
    btn.focus();
  });
});

// initialize from user preference or system
(function initDark(){
  let stored = null;
  try{ stored = localStorage.getItem('quboor-dark'); }catch(e){}
  if (stored !== null){
    setDarkMode(stored === '1');
  } else {
    // Default to light mode (do not enable dark by default)
    setDarkMode(false);
  }
})();

/* language buttons (show label + flag). French redirects to google.fr, Moroccan redirects to google.ma */
const langBtnFR = document.getElementById('langBtnFR');
const langBtnMA = document.getElementById('langBtnMA');

if (langBtnFR) {
  langBtnFR.addEventListener('click', () => {
    // Visual feedback and redirect to french page
    langBtnFR.classList.add('active');
    if (langBtnMA) langBtnMA.classList.remove('active');
    // redirect to France site
    window.location.href = 'https://www.google.fr';
  });
}
if (langBtnMA) {
  langBtnMA.addEventListener('click', () => {
    // Visual feedback and redirect to Morocco site
    langBtnMA.classList.add('active');
    if (langBtnFR) langBtnFR.classList.remove('active');
    window.location.href = 'https://www.google.ma';
  });
}

// Data: list of 114 sourates and 10 douas
const sourates = [
"1 Al-Fâtiha",
"2 Al-Baqara",
"3 Âl ʿImrân",
"4 An-Nisa'",
"5 Al-Mâ'idah",
"6 Al-An'am",
"7 Al-A'râf",
"8 Al-Anfâl",
"9 At-Tawba",
"10 Yûnus",
"11 Hûd",
"12 Yûsuf",
"13 Ar-Ra'd",
"14 Ibrâhîm",
"15 Al-Hijr",
"16 An-Naḥl",
"17 Al-Isrâ",
"18 Al-Kahf",
"19 Maryam",
"20 Tâ-Hâ",
"21 Al-Anbiyâ'",
"22 Al-Ḥajj",
"23 Al-Mu'minûn",
"24 An-Nûr",
"25 Al-Furqân",
"26 Ash-Shu‘arâ'",
"27 An-Naml",
"28 Al-Qaṣaṣ",
"29 Al-ʿAnkabût",
"30 Ar-Rûm",
"31 Luqmân",
"32 As-Sajda",
"33 Al-Ahzâb",
"34 Saba'",
"35 Fâṭir",
"36 Yâ-Sîn",
"37 As-Ṣâffât",
"38 Ṣâd",
"39 Az-Zumar",
"40 Ghâfir",
"41 Fuṣṣilat",
"42 Ash-Shûrâ",
"43 Az-Zukhruf",
"44 Ad-Dukhân",
"45 Al-Jâthiya",
"46 Al-Ahqâf",
"47 Muhammad",
"48 Al-Fatḥ",
"49 Al-Ḥujurât",
"50 Qâf",
"51 Adh-Dhâriyât",
"52 Aṭ-Ṭûr",
"53 An-Najm",
"54 Al-Qamar",
"55 Ar-Raḥmân",
"56 Al-Wâqi‘a",
"57 Al-Ḥadîd",
"58 Al-Mujâdila",
"59 Al-Ḥashr",
"60 Al-Mumtaḥana",
"61 Aṣ-Ṣaff",
"62 Al-Jumu‘a",
"63 Al-Munâfiqûn",
"64 At-Taghâbun",
"65 Aṭ-Ṭalâq",
"66 At-Taḥrîm",
"67 Al-Mulk",
"68 Al-Qalam",
"69 Al-Ḥâqqah",
"70 Al-Ma‘ârij",
"71 Nûḥ",
"72 Al-Jinn",
"73 Al-Muzzammil",
"74 Al-Muddaththir",
"75 Al-Qiyâma",
"76 Al-Insân",
"77 Al-Mursalât",
"78 An-Naba'",
"79 An-Nâzi‘ât",
"80 Abasa",
"81 At-Takwîr",
"82 Al-Infiṭâr",
"83 Al-Muṭaffifîn",
"84 Al-Inshiqâq",
"85 Al-Burûj",
"86 Aṭ-Ṭâriq",
"87 Al-A'lâ",
"88 Al-Ghâshiya",
"89 Al-Fajr",
"90 Al-Balad",
"91 Ash-Shams",
"92 Al-Layl",
"93 Ad-Dhuha",
"94 Al-Sharḥ",
"95 At-Tîn",
"96 Al-ʿAlaq",
"97 Al-Qadr",
"98 Al-Bayyinah",
"99 Az-Zalzalah",
"100 Al-ʿÂdiyât",
"101 Al-Qâri'a",
"102 At-Takâthur",
"103 Al-ʿAṣr",
"104 Al-Humaza",
"105 Al-Fîl",
"106 Quraysh",
"107 Al-Mâ'ûn",
"108 Al-Kawthar",
"109 Al-Kâfirûn",
"110 An-Naṣr",
"111 Al-Masad",
"112 Al-Ikhlâs",
"113 Al-Falaq",
"114 An-Nâs"
];

const douas = [
  {title: "Doua pour la protection", text: "Ô Allah, je cherche Ta protection..."},
  {title: "Doua pour la guérison", text: "Ô Seigneur, guéris-moi..."},
  {title: "Doua du matin", text: "Au réveil nous disons..."},
  {title: "Doua pour la famille", text: "Ô Allah, bénis ma famille..."},
  {title: "Doua pour la subsistance", text: "Ô pourvoyeur, augmente ma subsistance..."},
  {title: "Doua pour la facilité", text: "Ô Allah, rends les choses faciles..."},
  {title: "Doua du soir", text: "En cette soirée nous demandons..."},
  {title: "Doua pour le voyage", text: "Ô Allah, protège-nous pendant le voyage..."},
  {title: "Doua pour le pardon", text: "Seigneur pardonne nos péchés..."},
  {title: "Doua pour la guidance", text: "Guide-nous sur le droit chemin..."},
  {title: "Doua pour la patience", text: "Ô Allah, accorde-moi la patience face aux épreuves..."},
  {title: "Doua pour la sagesse", text: "Seigneur, donne-moi la sagesse et le discernement..."},
  {title: "Doua pour la réussite", text: "Ô Allah, fais que mes efforts soient couronnés de succès..."},
  {title: "Doua pour les enfants", text: "Ô Allah, protège et guide mes enfants..."},
  {title: "Doua pour les études", text: "Seigneur, facilite mon apprentissage et ma mémoire..."},
  {title: "Doua pour la tranquillité", text: "Ô Allah, remplis mon cœur de paix et de sérénité..."},
  {title: "Doua pour le mariage", text: "Seigneur, bénis notre union et accorde-nous amour et compréhension..."},
  {title: "Doua pour le travail", text: "Ô Allah, ouvre des portes de subsistance licite pour moi..."},
  {title: "Doua pour la sécurité", text: "Ô Allah, protège nos maisons et nos voisins..."},
  {title: "Doua pour la gratitude", text: "Seigneur, aide-moi à toujours être reconnaissant pour Tes bienfaits..."},
  {title: "Doua pour la confiance", text: "Ô Allah, augmente ma foi et ma confiance en Toi..."},
  {title: "Doua pour les malades", text: "Seigneur, accorde guérison et patience aux malades..."},
  {title: "Doua pour les orphelins", text: "Ô Allah, prends soin des orphelins et récompense leurs bienfaiteurs..."},
  {title: "Doua pour la rémission des dettes", text: "Seigneur, facilite le règlement de mes dettes..."},
  {title: "Doua pour la protection contre le mal", text: "Ô Allah, protège-moi des mauvaises influences et du mal..."},
  {title: "Doua pour l'humilité", text: "Seigneur, fais que je reste humble et juste..."},
  {title: "Doua pour le repentir", text: "Ô Allah, accepte mon repentir sincère et purifie mon cœur..."},
  {title: "Doua pour la miséricorde", text: "Seigneur, fais descendre Ta miséricorde sur nous et sur nos proches..."},
  {title: "Doua pour la force", text: "Ô Allah, donne-moi la force de surmonter mes faiblesses..."},
  {title: "Doua pour la communauté", text: "Seigneur, unis et protège notre communauté dans le bien..."}
];

// --- New: structured text data for each sourate and doua (editable bodies) ---
// For demonstration we create simple placeholder descriptions and full texts.
// You can edit the strings below to change what displays per result.
// Keys for sourates use the normalized slug produced by makeSlug() below.
/* Structured content is provided by the tools page (toolsfr.html) via window.sourateContents and window.douaContents.
   Fallback to empty objects if not present. */
const sourateContents = window.sourateContents || {};
const douaContents = window.douaContents || {};

// Event wiring
if (popupClose) popupClose.addEventListener('click', ()=> {
  // If a detail panel is open, close it and return to the main popup list.
  if (detailPopup.getAttribute('aria-hidden') === 'false') {
    // Close only the detail view and keep the list popup visible.
    closeDetail();
    // ensure main popup remains visible and focused
    popup.setAttribute('aria-hidden','false');
    popup.style.display = 'flex';
    popupClose.focus();
  } else {
    closePopup();
  }
});
popup.addEventListener('click', (e)=>{ if (e.target === popup) closePopup(); });
if (detailClose) detailClose.addEventListener('click', closeDetail);
detailPopup.addEventListener('click', (e)=>{ if (e.target === detailPopup) closeDetail(); });

document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape') {
    if (detailPopup.getAttribute('aria-hidden') === 'false') closeDetail();
    else closePopup();
  }
});



// open popup when clicking a tool card
toolsContainer.addEventListener('click', (e)=>{
  const btn = e.target.closest('.tool-card');
  if (!btn) return;
  const tool = btn.dataset.tool || '';
  openToolPopup(tool);
});

// Build popup content: search + table
function buildListView(items, renderRowCallback){
  popupBody.innerHTML = '';

  const searchRow = document.createElement('div');
  searchRow.className = 'search-row';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Rechercher...';
  searchInput.setAttribute('aria-label','Rechercher');
  const countSpan = document.createElement('div');
  countSpan.className = 'count';
  searchRow.appendChild(searchInput);
  searchRow.appendChild(countSpan);

  const listWrapper = document.createElement('div');
  listWrapper.className = 'list-wrapper';

  const table = document.createElement('table');
  table.className = 'list-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>#</th><th>Nom</th></tr>';
  const tbody = document.createElement('tbody');

  table.appendChild(thead);
  table.appendChild(tbody);
  listWrapper.appendChild(table);

  popupBody.appendChild(searchRow);
  popupBody.appendChild(listWrapper);

  // populate
  function render(filter = ''){
    tbody.innerHTML = '';
    const q = filter.trim().toLowerCase();
    const filtered = items.filter((it, idx)=>{
      const name = (typeof it === 'string') ? it : (it.title || it.name || '');
      return q === '' || name.toLowerCase().includes(q);
    });
    countSpan.textContent = `${filtered.length} résultat(s)`;
    filtered.forEach((it, idx)=>{
      const tr = document.createElement('tr');
      const numTd = document.createElement('td');

      // Determine the display number:
      // - If the item is a string and starts with a number (e.g. "2 Al-Baqarah"), use that number.
      // - Otherwise fall back to the position in the original items array (1-based) if available,
      //   or to the filtered index + 1 as a last resort.
      let displayNumber = '';
      if (typeof it === 'string') {
        const m = it.match(/^\s*(\d+)\b/);
        if (m) displayNumber = m[1];
      }
      if (!displayNumber) {
        // try to find the original index in the items array passed to buildListView
        const origIndex = items.indexOf(it);
        if (origIndex !== -1) displayNumber = String(origIndex + 1);
        else displayNumber = String(idx + 1);
      }
      numTd.textContent = displayNumber;

      const nameTd = document.createElement('td');
      // If the string includes the leading number, strip it for the name column for clarity
      if (typeof it === 'string') {
        nameTd.textContent = it.replace(/^\s*\d+\s*/, '');
      } else {
        nameTd.textContent = (it.title || it.name || '');
      }

      tr.appendChild(numTd);
      tr.appendChild(nameTd);
      tr.addEventListener('click', ()=> renderRowCallback(it));
      tbody.appendChild(tr);
    });
  }

  // initial render all
  render('');
  searchInput.addEventListener('input', ()=> render(searchInput.value));
}

// Open main tool popup
function openToolPopup(toolKey){
  let title = '';
  let items = [];
  switch(toolKey){
    case 'coran-audio': title = 'Coran — Audio'; items = sourates; break;
    case 'coran-livre': title = 'Coran — Livre'; items = sourates; break;
    case 'douas': title = "Dou'as & Invocations"; items = douas; break;
    default: title = 'Outil';
  }

  // hide the popup title area for tool listing to keep header compact (per design)
  popupTitle.textContent = title;
  popupTitle.style.display = 'none';

  buildListView(items, (selected)=>{
    // when an item is clicked open detail popup (85%)
    openDetail(selected, toolKey);
  });

  // prevent main page scrolling while popup is open
  document.body.classList.add('no-scroll');

  popup.setAttribute('aria-hidden','false');
  popup.style.display = 'flex';
  popupClose.focus();
}

function closePopup(){
  popup.setAttribute('aria-hidden','true');
  popup.style.display = 'none';
  document.body.classList.remove('no-scroll');
}

// Detail popup (smaller)
function openDetail(item, toolKey){
  let title = '';
  let html = '';

  // helper to create a safe slug for audio files (e.g. "2 Al-Baqarah" -> "al-baqarah")
  function makeSlug(name){
    if (!name) return '';
    // remove leading number and dots, then normalize
    const withoutNum = name.replace(/^\s*\d+\s*/,'');
    return withoutNum.toLowerCase().replace(/[^\w\u0600-\u06FF]+/g,'-').replace(/^-+|-+$/g,'');
  }

  // helper to fetch structured content for sourates/douas
  function getStructuredContentFor(itemKey, kind){
    if (kind === 'sourate') {
      const slug = makeSlug(itemKey);
      // prefer explicit mapping, fallback to placeholders
      const data = sourateContents[slug] || {
        short: 'Brève description non fournie. Éditez sourateContents dans app.js.',
        full: 'Texte complet non fourni. Ajoutez le texte complet dans sourateContents["' + slug + '"].'
      };
      return {slug, short: data.short, full: data.full};
    } else if (kind === 'doua') {
      const slug = (itemKey.title || itemKey.name || '').toLowerCase().replace(/[^\w\u0600-\u06FF]+/g,'-').replace(/^-+|-+$/g,'');
      const data = douaContents[slug] || {
        short: 'Brève description non fournie. Éditez douaContents dans app.js.',
        full: (itemKey.text || 'Texte complet non fourni. Ajoutez le texte complet dans douaContents["' + slug + '"].')
      };
      return {slug, short: data.short, full: data.full};
    }
    return {slug:'', short:'', full:''};
  }

  if (typeof item === 'string'){
    title = item;
    // handle sourate items (strings)
    const content = getStructuredContentFor(item, 'sourate');
    if (toolKey === 'coran-audio'){
      const audioSlug = content.slug || makeSlug(item);
      const src = `/audio/${audioSlug}.mp3`;
      html = `<div class="detail-body">
        <h3>${escapeHtml(item)}</h3>
        <div class="detail-short" style="margin-top:8px;color:var(--muted)">${escapeHtml(content.short)}</div>
        <div style="margin-top:12px">
          <audio controls preload="none" style="width:100%;margin-top:6px">
            <source src="${escapeHtml(src)}" type="audio/mpeg">
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        </div>
        <hr style="margin:14px 0;border:none;border-top:1px solid rgba(0,0,0,0.06)">
        <div class="detail-full" style="white-space:pre-wrap;color:var(--primary)">${escapeHtml(content.full)}</div>
      </div>`;
    } else {
      html = `<div class="detail-body">
        <h3>${escapeHtml(item)}</h3>
        <div class="detail-short" style="margin-top:8px;color:var(--muted)">${escapeHtml(content.short)}</div>
        <hr style="margin:14px 0;border:none;border-top:1px solid rgba(0,0,0,0.06)">
        <div class="detail-full" style="white-space:pre-wrap;color:var(--primary)">${escapeHtml(content.full)}</div>
      </div>`;
    }
  } else {
    // item is an object (doua)
    title = item.title || item.name || 'Détail';
    const content = getStructuredContentFor(item, 'doua');
    // try to build audio path for douas as well
    const duaSlug = content.slug || (item.title || item.name || '').toLowerCase().replace(/[^\w\u0600-\u06FF]+/g,'-').replace(/^-+|-+$/g,'');
    const audioSrc = `/audio/douas/${duaSlug}.mp3`;
    html = `<div class="detail-body">
      <h3>${escapeHtml(title)}</h3>
      <div class="detail-short" style="margin-top:8px;color:var(--muted)">${escapeHtml(content.short)}</div>
      <div style="margin-top:12px">
        <audio controls preload="none" style="width:100%;margin-top:6px">
          <source src="${escapeHtml(audioSrc)}" type="audio/mpeg">
          Votre navigateur ne supporte pas l'élément audio.
        </audio>
      </div>
      <hr style="margin:14px 0;border:none;border-top:1px solid rgba(0,0,0,0.06)">
      <div class="detail-full" style="white-space:pre-wrap;color:var(--primary)">${escapeHtml(content.full)}</div>
    </div>`;
  }

  detailTitle.textContent = title;
  detailBody.innerHTML = html;

  // prevent main page scrolling while detail popup is open
  document.body.classList.add('no-scroll');

  detailPopup.setAttribute('aria-hidden','false');
  detailPopup.style.display = 'flex';
  detailClose.focus();
}

function closeDetail(){
  // Hide detail overlay
  detailPopup.setAttribute('aria-hidden','true');
  detailPopup.style.display = 'none';

  // If the list popup beneath is still open, keep page scroll locked and return focus to it.
  if (popup.getAttribute('aria-hidden') === 'false') {
    // keep no-scroll so the page doesn't scroll while popup list is visible
    document.body.classList.add('no-scroll');
    // focus the popup close so keyboard users can continue
    popupClose.focus();
  } else {
    // otherwise remove scroll lock
    document.body.classList.remove('no-scroll');
  }
}

function escapeHtml(str){
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
}