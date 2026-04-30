import anime from "animejs";

const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
// enrollForm might be replaced when we inject offer content into modal-card, so query lazily where needed
let enrollForm = document.getElementById('enrollForm');
const contactForm = document.getElementById('contactForm');
const yearEl = document.getElementById('year');
const quickEnroll = document.getElementById('quickEnroll');
const learnMore = document.getElementById('learnMore');
const courseSelect = document.getElementById('courseSelect');
const frame = document.querySelector('.frame');

// keep a copy of the original modal-card content so we can restore it after injecting an offer
const modalCard = modal.querySelector('.modal-card');
const originalModalCardHTML = modalCard ? modalCard.innerHTML : '';

// dynamic nodes that need rebinding
let courseButtons = [];
let courseInfoButtons = [];

// preserve original main content so we can restore it later
const originalMainHTML = frame.innerHTML;

// set year
yearEl.textContent = new Date().getFullYear();

/* navigation toggle for mobile and category behavior:
   clicking a nav item will close the sidebar and display only that panel */
navToggle.addEventListener('click', ()=>{
  nav.classList.toggle('open');
  // toggle active state for animated hamburger (morph to X)
  navToggle.classList.toggle('is-active');
});

// Close button inside slide-out nav (mobile): close nav and reset hamburger
const navCloseBtn = document.getElementById('navClose');
if(navCloseBtn){
  navCloseBtn.addEventListener('click', ()=>{
    nav.classList.remove('open');
    navToggle.classList.remove('is-active');
  });
}

// Close the slide-out nav when clicking anywhere outside it (works for mouse/touch).
// We check the composedPath when available to correctly detect clicks inside shadow DOM or nested elements.
document.addEventListener('click', (e) => {
  if (!nav.classList.contains('open')) return;

  // get event path (fallbacks for cross-browser)
  const path = (e.composedPath && e.composedPath()) || e.path || (function () {
    const p = [];
    let el = e.target;
    while (el) { p.push(el); el = el.parentElement; }
    return p;
  })();

  // If click was inside nav or on the nav toggle button or the close button, do nothing.
  if (path.includes(nav) || path.includes(navToggle) || path.includes(navCloseBtn)) return;

  // Otherwise close nav and reset hamburger visual.
  nav.classList.remove('open');
  navToggle.classList.remove('is-active');
});

// show/hide panels by category and close nav on selection
const navLinks = Array.from(document.querySelectorAll('#nav a[data-cat]'));
function showCategory(catId, updateHash = true){
  document.querySelectorAll('.panel').forEach(p=>{
    p.style.display = (p.id === catId) ? '' : 'none';
  });
  // ensure header/footer remain visible and close sidebar on mobile
  nav.classList.remove('open');

  // scroll to top when showing a new section
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // special handling: if user asks for 'inscription' (Accueil) and main was replaced by Pro offer, restore original content
  if(catId === 'inscription' && document.getElementById('pro-offer')){
    restoreMainContent();
  }

  if(updateHash) history.replaceState(null, '', `#${catId}`);
}
// wire nav links to show categories
navLinks.forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const cat = a.dataset.cat;
    if(cat) showCategory(cat);
    // close mobile nav and reset hamburger visual (morph back to bars)
    nav.classList.remove('open');
    navToggle.classList.remove('is-active');
  });
});
 // default view: accueil (inscription) or preserve hash if present
 const initial = location.hash ? location.hash.replace('#','') : 'accueil';
 if(document.getElementById(initial)) showCategory(initial, false);

 // Ensure the Accueil "Particulier" and "B2B" buttons navigate via showCategory
 // (these are anchors inside #accueil that should redirect to the panels without full reload)
 const accueilEl = document.getElementById('accueil');
 if(accueilEl){
   const partBtn = accueilEl.querySelector('a[href="#inscription"]');
   const b2bBtn = accueilEl.querySelector('a[href="#courses"]');
   // links on Accueil that point to documents should use the site's showCategory routing
   const docsLinks = Array.from(accueilEl.querySelectorAll('a[href="#documents"]'));
   // links on Accueil that point to articles should also use showCategory
   const articlesLinks = Array.from(accueilEl.querySelectorAll('a[href="#articles"]'));
   if(partBtn){
     partBtn.addEventListener('click', (e)=>{
       e.preventDefault();
       showCategory('inscription');
     });
   }
   if(b2bBtn){
     b2bBtn.addEventListener('click', (e)=>{
       e.preventDefault();
       showCategory('courses');
     });
   }
   if(docsLinks && docsLinks.length){
     docsLinks.forEach(a=>{
       a.addEventListener('click', (e)=>{
         e.preventDefault();
         showCategory('documents');
       });
     });
   }
   if(articlesLinks && articlesLinks.length){
     articlesLinks.forEach(a=>{
       a.addEventListener('click', (e)=>{
         e.preventDefault();
         showCategory('articles');
       });
     });
   }
 }

// open modal helper
function openModal(selectedCourse){
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';

  // ensure page at top when modal opens
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // If the current modal contains a select for course, set it
  const sel = modal.querySelector('#courseSelect');
  if(selectedCourse && sel) {
    sel.value = selectedCourse;
  }
  anime({
    targets: '.modal-card',
    translateY: [-40,0],
    opacity: [0,1],
    duration: 420,
    easing: 'easeOutCubic'
  });
}

 // open the modal and inject a Basic offer modal that follows the same structure & buttons as the Pro view
function openOfferModal(){
  if(!modalCard) return openModal();

  // give the modal a grey overlay and ensure the card shows the decorative card art
  modal.style.background = 'rgba(2,6,23,0.6)'; // grey dim around the card
  modalCard.style.backgroundImage = 'url("/backback.png")';
  modalCard.style.backgroundRepeat = 'no-repeat';
  modalCard.style.backgroundPosition = 'center';
  modalCard.style.backgroundSize = 'cover';
  modalCard.style.border = '1px solid rgba(0,0,0,0.06)';

  modalCard.innerHTML = `
    <button class="close" id="modalClose" aria-label="Fermer">✕</button>
    <div style="position:relative">
      <div style="position:absolute;top:44px;right:16px;font-size:20px;font-weight:700">€49</div>
      <h3 style="margin-top:8px">Offre Basic — Confirmation</h3>
      <p><strong>CV professionnel unique + lettre de motivation</strong></p>
      <ul style="color:var(--muted);margin:10px 0 12px;line-height:1.4">
        <li> CV personnalisé</li>
        <li> Lettre de motivation</li>
        <li> Support par mail 7/7</li>
      </ul>
      <p style="margin-top:6px">Nous créons pour vous un CV clair et ciblé, conçu pour mettre en avant vos compétences et votre expérience de manière lisible par les recruteurs et les systèmes ATS.</p>
      <p style="margin-top:6px">La lettre de motivation fournie est rédigée pour s’adapter précisément à l’offre visée et à votre profil, avec des formulations faciles à personnaliser.</p>
      <p style="margin-top:6px">Vous bénéficiez d’un accompagnement par email 7j/7 pour ajuster les documents et obtenir des réponses rapides à vos questions.</p>
      <p style="margin-top:8px">Un service professionnel et réactif pour donner un coup d’accélérateur à votre recherche d’emploi.</p>
      <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;justify-content:center">
        <button class="btn basic" id="basicValidate" style="width:80%;background: linear-gradient(180deg,#526aef 0%, #131a1e 100%); color: #fff;">S'inscrire</button>
      </div>
      <hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:16px 0">
      <div style="display:flex;align-items:center;gap:8px;margin-top:8px;justify-content:center">
        <span style="color:var(--muted);text-align:center">Termes et conditions</span>
        <button class="btn info" id="basicInfo" aria-label="Infos">ℹ</button>
      </div>
    </div>
  `;
  openModal();

  // rebind close controls for the injected content
  const injectedClose = modal.querySelector('#modalClose');
  const injectedCancel = modal.querySelector('#modalCancelInjected');
  const injectedValidate = modal.querySelector('#basicValidate');

  if(injectedClose) injectedClose.addEventListener('click', closeModal);
  if(injectedValidate) {
    injectedValidate.addEventListener('click', ()=>{
      // generate 9-char alphanumeric request id
      function genId(len = 9){
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let out = '';
        for(let i=0;i<len;i++) out += chars.charAt(Math.floor(Math.random()*chars.length));
        return out;
      }
      const reqId = genId(9);
      const subject = encodeURIComponent('Demande d’information — Offre Basic');
      const body = encodeURIComponent(
`Bonjour,

Je souhaite obtenir des informations et valider une demande pour l'Offre Basic — CV professionnel unique + lettre de motivation (€49).

Merci de me contacter pour confirmer les délais, livrables et modalités.

Cordialement,
[Votre prénom et nom]
[Votre email]

Numéro de demande: ${reqId}`
      );
      window.location.href = `mailto:contact@example.com?subject=${subject}&body=${body}`;
    });
  }

  // bind the info button to open the terms popup (fixes issue where icon did not open the popup)
  const injectedBasicInfo = modal.querySelector('#basicInfo');
  if(injectedBasicInfo){
    injectedBasicInfo.addEventListener('click', ()=>{
      // ensure page is at top when popups open
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showTermsPopup('Offre Basic — Termes et conditions', `
        <div>
          <p>Ce message constitue une demande d’information et ne crée pas de contrat contraignant.</p>
          <p>Les détails finaux (délais, livrables) seront confirmés et validés par échange email avant toute production.</p>
          <p>Les prix indiqués peuvent être ajustés en fonction d’options supplémentaires ou demandes particulières.</p>
          <p>Les révisions incluses sont réalisées selon les modalités convenues lors de la validation finale.</p>
          <p>Les livrables finaux seront fournis après paiement ou selon l’accord convenu par email.</p>
        </div>

        <p><strong>Propriété intellectuelle et usage des outils</strong></p>
        <p>Tous les codes, prompts, scripts, modèles, algorithmes et éléments techniques fournis dans le cadre de Quboor AI sont la propriété exclusive de Quboor AI. Toute utilisation, reproduction, adaptation, distribution ou exploitation sans l'autorisation écrite préalable de Quboor AI est strictement interdite.</p>
        <p>Les prompts fournis par Quboor AI sont destinés à un usage personnel et non transférable par l'utilisateur final. Le détournement, la revente, le partage public ou toute exploitation non autorisée des prompts est strictement interdit.</p>

        <p><strong>Tests, vérifications et limites de responsabilité</strong></p>
        <p>Quboor AI fournit l'outil après des vérifications et tests préalables raisonnables ; toutefois, l'outil est livré "tel quel" et l'utilisateur est responsable de la manière dont il l'exploite. Quboor AI ne saurait être tenu responsable des dommages, incidents, ou "casse" résultant de modifications, manipulations ou usages impropres du code, des prompts ou des livrables fournis.</p>

        <p><strong>Intermédiation et responsabilité vis‑à‑vis des plateformes</strong></p>
        <p>Quboor AI agit uniquement en tant qu'intermédiaire technique entre l'utilisateur et les plateformes publiques (sites d'offres, réseaux sociaux, portails de recrutement, etc.). Quboor AI n'est pas responsable des résultats, décisions, retours, contenus ou politiques appliqués par ces plateformes, ni des conséquences découlant de l'interaction entre l'utilisateur et ces services tiers.</p>

        <p><strong>Clauses complémentaires de limitation</strong></p>
        <ul>
          <li>Vous vous engagez à ne pas divulguer ni publier des éléments techniques (prompts, extraits de code) reçus sans accord préalable.</li>
          <li>Quboor AI ne garantit pas l'absence d'erreurs, bugs, incompatibilités ou performances spécifiques sur tous les environnements et décline toute garantie implicite autre que celles prévues par la loi.</li>
          <li>Dans la mesure permise par la loi, la responsabilité financière de Quboor AI, pour tout préjudice direct résultant d'une prestation, est limitée au montant payé par l'utilisateur pour l'offre concernée.</li>
          <li>Quboor AI décline toute responsabilité pour les pertes indirectes, immatérielles, commerciales ou imprévisibles résultant de l'utilisation des outils, prompts ou livrables.</li>
          <li>Ces dispositions s'ajoutent aux conditions générales existantes et prévalent lorsque des clauses spécifiques viennent encadrer la propriété ou la responsabilité liée aux outils techniques fournis.</li>
        </ul>
      `);
    });
  }
}

function closeModal(){
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
  // restore modal overlay & card visuals to defaults
  modal.style.background = 'rgba(255,255,255,0.85)';
  if(modalCard) {
    modalCard.style.background = '';
    modalCard.style.border = '';
    // restore original modal-card content if it was replaced
    modalCard.innerHTML = originalModalCardHTML;
  }
  // rebind enrollForm reference in case restored content contains it
  enrollForm = document.getElementById('enrollForm');
}

// helper to bind dynamic controls inside main (cards, enroll buttons, info buttons)
function bindDynamicMainControls(){
  courseButtons = Array.from(document.querySelectorAll('[data-enroll]'));
  courseInfoButtons = Array.from(document.querySelectorAll('[data-course]'));

  courseButtons.forEach(b=>{
    b.addEventListener('click', ()=>openModal(b.dataset.enroll));
  });
  courseInfoButtons.forEach(b=>{
    b.addEventListener('click', ()=> showCoursePopup(b.dataset.course) );
  });
}

// helper to restore the saved main HTML and rebind events
function restoreMainContent(){
  frame.innerHTML = originalMainHTML;
  // small delay to ensure DOM is parsed before rebinding
  setTimeout(()=> {
    // re-query static references that lived inside main
    // rebind any top-level references used elsewhere
    const newQuick = document.getElementById('quickEnroll');
    const newLearn = document.getElementById('learnMore');
    if(newQuick) newQuick.addEventListener('click', quickEnrollHandler);
    if(newLearn) newLearn.addEventListener('click', ()=>openOfferModal());
    // rebind modal signup button (if needed)
    // rebind dynamic card controls
    bindDynamicMainControls();
  }, 30);
}



 // quickEnroll handler separated so we can rebind after restore
 function quickEnrollHandler(e){
   // open a Pro-style modal instead of replacing the main page
   if(!modalCard) return openModal();

   // give modal a grey overlay and ensure the card shows the decorative card art
   modal.style.background = 'rgba(2,6,23,0.6)';
   modalCard.style.backgroundImage = 'url("/backcard2.png")';
   modalCard.style.backgroundRepeat = 'no-repeat';
   modalCard.style.backgroundPosition = 'center';
   modalCard.style.backgroundSize = 'cover';
   modalCard.style.border = '1px solid rgba(0,0,0,0.06)';

   modalCard.innerHTML = `
     <button class="close" id="modalClose" aria-label="Fermer">✕</button>
     <div style="position:relative">
       <div style="position:absolute;top:44px;right:16px;font-size:20px;font-weight:700">€249</div>
       <h3 style="margin-top:8px">Quboor — Premium</h3>
       <p><strong>Accompagnement premium, livraison prioritaire</strong></p>
       <ul style="color:var(--muted);margin:10px 0 12px;line-height:1.4">
         <li>Jusqu’à 3 modèles et variantes</li>
         <li>Jusqu’à 5 heures de travail dédiées</li>
         <li>Support prioritaire et optimisation</li>
       </ul>
       <p style="margin-top:6px">Quboor Premium offre un accompagnement sur‑mesure : plusieurs modèles de CV et de lettres sont créés pour valoriser distinctement chaque aspect de votre parcours.</p>
       <p style="margin-top:6px">Nous consacrons jusqu’à 5 heures à l’optimisation de vos documents et à l’ajustement fin du contenu pour maximiser votre impact auprès des recruteurs.</p>
       <p style="margin-top:6px">Vous profitez d’une livraison prioritaire et d’un support réactif pour obtenir des révisions rapides et un suivi continu jusqu’à validation finale.</p>
       <p style="margin-top:8px">Un service exigeant et personnalisé pour accélérer vos candidatures et augmenter vos chances de succès.</p>
       <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;justify-content:center">
         <button class="btn basic" id="proValidate" style="width:80%;background: linear-gradient(180deg,#526aef 0%, #131a1e 100%); color: #fff;">S'inscrire</button>
       </div>
       <hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:16px 0">
       <div style="display:flex;align-items:center;gap:8px;margin-top:8px;justify-content:center">
         <span style="color:var(--muted);text-align:center">Termes et conditions</span>
         <button class="btn info" id="proInfoInjected" aria-label="Infos">ℹ</button>
       </div>
     </div>
   `;

   openModal();

   // rebind injected controls
   const injectedClose = modal.querySelector('#modalClose');
   const injectedCancel = modal.querySelector('#proCancelInjected');
   const injectedValidate = modal.querySelector('#proValidate');

   if(injectedClose) injectedClose.addEventListener('click', closeModal);
   if(injectedValidate){
     injectedValidate.addEventListener('click', ()=>{
       // generate 9-char alphanumeric request id
       function genId(len = 9){
         const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
         let out = '';
         for(let i=0;i<len;i++) out += chars.charAt(Math.floor(Math.random()*chars.length));
         return out;
       }
       const reqId = genId(9);
       const subject = encodeURIComponent('Demande d’information — Plan Premium');
       const body = encodeURIComponent(
`Bonjour,

Je souhaite obtenir des informations et valider une demande pour le plan Premium — Accompagnement complet et service multi-modèles (€249).

Merci de me contacter pour confirmer les délais, livrables et modalités.

Cordialement,
[Votre prénom et nom]
[Votre email]

Numéro de demande: ${reqId}`
       );
       window.location.href = `mailto:contact@example.com?subject=${subject}&body=${body}`;
     });
   }

   // bind the injected info button to open the terms popup
   const injectedProInfo = modal.querySelector('#proInfoInjected');
   if(injectedProInfo){
     injectedProInfo.addEventListener('click', ()=>{
       // ensure page is at top when popups open
       window.scrollTo({ top: 0, behavior: 'smooth' });
       showTermsPopup('Premium — Termes et conditions', `
         <div>
           <p>Ce message constitue une demande d’information et ne crée pas de contrat contraignant.</p>
           <p>Les détails finaux (délais, livrables) seront confirmés et validés par échange email avant toute production.</p>
           <p>Les prix indiqués peuvent être ajustés en fonction d’options supplémentaires ou demandes particulières.</p>
           <p>Les révisions incluses sont réalisées selon les modalités convenues lors de la validation finale.</p>
           <p>Les livrables finaux seront fournis après paiement ou selon l’accord convenu par email.</p>
         </div>

         <p><strong>Propriété intellectuelle et usage des outils</strong></p>
         <p>Tous les codes, prompts, scripts, modèles, algorithmes et éléments techniques fournis dans le cadre de Quboor AI sont la propriété exclusive de Quboor AI. Toute utilisation, reproduction, adaptation, distribution ou exploitation sans l'autorisation écrite préalable de Quboor AI est strictement interdite.</p>
         <p>Les prompts fournis par Quboor AI sont destinés à un usage personnel et non transférable par l'utilisateur final. Le détournement, la revente, le partage public ou toute exploitation non autorisée des prompts est strictement interdit.</p>

         <p><strong>Tests, vérifications et limites de responsabilité</strong></p>
         <p>Quboor AI fournit l'outil après des vérifications et tests préalables raisonnables ; toutefois, l'outil est livré "tel quel" et l'utilisateur est responsable de la manière dont il l'exploite. Quboor AI ne saurait être tenu responsable des dommages, incidents, ou "casse" résultant de modifications, manipulations ou usages impropres du code, des prompts ou des livrables fournis.</p>

         <p><strong>Intermédiation et responsabilité vis‑à‑vis des plateformes</strong></p>
         <p>Quboor AI agit uniquement en tant qu'intermédiaire technique entre l'utilisateur et les plateformes publiques (sites d'offres, réseaux sociaux, portails de recrutement, etc.). Quboor AI n'est pas responsable des résultats, décisions, retours, contenus ou politiques appliqués par ces plateformes, ni des conséquences découlant de l'interaction entre l'utilisateur et ces services tiers.</p>

         <p><strong>Clauses complémentaires de limitation</strong></p>
         <ul>
           <li>Vous vous engagez à ne pas divulguer ni publier des éléments techniques (prompts, extraits de code) reçus sans accord préalable.</li>
           <li>Quboor AI ne garantit pas l'absence d'erreurs, bugs, incompatibilités ou performances spécifiques sur tous les environnements et décline toute garantie implicite autre que celles prévues par la loi.</li>
           <li>Dans la mesure permise par la loi, la responsabilité financière de Quboor AI, pour tout préjudice direct résultant d'une prestation, est limitée au montant payé par l'utilisateur pour l'offre concernée.</li>
           <li>Quboor AI décline toute responsabilité pour les pertes indirectes, immatérielles, commerciales ou imprévisibles résultant de l'utilisation des outils, prompts ou livrables.</li>
           <li>Ces dispositions s'ajoutent aux conditions générales existantes et prévalent lorsque des clauses spécifiques viennent encadrer la propriété ou la responsabilité liée aux outils techniques fournis.</li>
         </ul>
       `);
     });
   }
 }
 // initial binding for quickEnroll and learnMore
 if(quickEnroll) quickEnroll.addEventListener('click', quickEnrollHandler);
 if(learnMore) learnMore.addEventListener('click', ()=>openOfferModal());

 // bind relocated buttons inside service cards
 const basicFromCV = document.getElementById('basicFromCV');
 const premiumFromProspect = document.getElementById('premiumFromProspect');
 if(basicFromCV) basicFromCV.addEventListener('click', ()=> openOfferModal()); // opens Basic offer
 if(premiumFromProspect) premiumFromProspect.addEventListener('click', ()=> quickEnrollHandler()); // opens Premium offer

modalClose.addEventListener('click', closeModal);
modalCancel.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if(e.target === modal) closeModal(); });

// bind dynamic controls initially
bindDynamicMainControls();

// enroll form submit (simulate)
enrollForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = new FormData(enrollForm);
  const name = data.get('fullname') || 'Participant';
  const course = data.get('course');
  // simulate API & success toast
  closeModal();
  toast(`${name}, votre inscription à "${course}" est enregistrée. Nous vous contactons par email.`);
});

 // contact form — open user's mail client with prefilled subject/body and a 9-char request id
 contactForm.addEventListener('submit', (e)=>{
   e.preventDefault();
   const fd = new FormData(contactForm);
   const sujet = (fd.get('sujet') || '').trim();
   const name = (fd.get('name') || '').trim();
   const email = (fd.get('email') || '').trim();
   const message = (fd.get('message') || '').trim();

   // generate 9-char alphanumeric request id
   function genId(len = 9){
     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     let out = '';
     for(let i=0;i<len;i++) out += chars.charAt(Math.floor(Math.random()*chars.length));
     return out;
   }
   const reqId = genId(9);

   // include the selected sujet in the subject line for clarity
   const subject = encodeURIComponent(`${sujet} — Demande de contact — ${name || 'Utilisateur'}`);
   const bodyText = `${message}\n\n---\nSujet: ${sujet}\nNom: ${name}\nEmail: ${email}\nNuméro de demande: ${reqId}`;
   const body = encodeURIComponent(bodyText);

   // open default mail client
   window.location.href = `mailto:contact@example.com?subject=${subject}&body=${body}`;

   contactForm.reset();
 });

 // open privacy / terms in on-screen popup instead of navigating away
 const privacyLink = document.getElementById('privacyLink');
 const termsLink = document.getElementById('termsLink');

 if(privacyLink){
   privacyLink.addEventListener('click', (e)=>{
     e.preventDefault();
     window.scrollTo({ top: 0, behavior: 'smooth' });
     showTermsPopup('Politique de confidentialité', `
<p>Nous accordons une importance particulière à la protection de vos données personnelles. Les informations collectées sont strictement limitées à celles nécessaires au traitement de vos demandes, à la fourniture de nos services et à l’amélioration continue de votre expérience utilisateur.</p>

<p>Vos données sont traitées de manière confidentielle et sécurisée, conformément à la réglementation en vigueur. Elles sont hébergées sur des serveurs protégés et ne sont en aucun cas vendues, louées ou partagées avec des tiers sans votre consentement explicite, sauf obligation légale.</p>

<p>Nous conservons vos données uniquement pour la durée nécessaire aux finalités pour lesquelles elles ont été collectées. Des mesures techniques et organisationnelles appropriées sont mises en place afin de garantir leur sécurité, leur intégrité et leur confidentialité.</p>

<p>Conformément à vos droits, vous pouvez à tout moment accéder à vos données, demander leur rectification, leur suppression ou limiter leur traitement. Pour exercer ces droits ou pour toute question relative à vos données personnelles, vous pouvez nous contacter via le formulaire dédié ou par email.</p>
     `);
   });
 }

 if(termsLink){
   termsLink.addEventListener('click', (e)=>{
     e.preventDefault();
     window.scrollTo({ top: 0, behavior: 'smooth' });
     showTermsPopup('Conditions générales d’utilisation (CGU)', `
<p>Les présentes Conditions Générales d’Utilisation (CGU) ont pour objet de définir les modalités d’accès et d’utilisation des services proposés. En accédant au site ou en utilisant les services, vous acceptez sans réserve les présentes conditions, qui précisent les droits et obligations de chaque partie.</p>

<p>Les services proposés sont présentés à titre informatif. Les informations figurant sur le site sont indicatives et peuvent être modifiées à tout moment sans préavis. Toute prestation payante fera systématiquement l’objet d’une confirmation écrite (email ou devis validé), constituant l’accord définitif entre les parties.</p>

<p>L’utilisateur s’engage à fournir des informations exactes et à utiliser les services de manière conforme à la législation en vigueur. Toute utilisation abusive, frauduleuse ou contraire à l’objet du service pourra entraîner une suspension ou une limitation d’accès, sans préjudice d’éventuelles poursuites.</p>

<p>Le prestataire s’engage à mettre en œuvre tous les moyens raisonnables pour assurer la qualité et la continuité des services. Toutefois, il ne saurait être tenu responsable des interruptions, erreurs ou indisponibilités temporaires, notamment liées à des contraintes techniques ou à des facteurs externes.</p>

<p>Les contenus, outils et ressources proposés restent la propriété exclusive du prestataire, sauf mention contraire. Toute reproduction, diffusion ou exploitation non autorisée est strictement interdite.</p>

<p>Les présentes CGU ne constituent pas un contrat commercial ferme tant qu’un accord explicite n’a pas été conclu et validé par écrit entre les parties. Pour toute question relative aux conditions d’utilisation, vous pouvez nous contacter via le formulaire dédié ou par email.</p>
     `);
   });
 }

 // simple toast
 function toast(msg){
   let t = document.createElement('div');
   t.textContent = msg;
   t.style.position = 'fixed';
   t.style.left = '50%';
   t.style.transform = 'translateX(-50%)';
   t.style.bottom = '72px';
   t.style.background = 'linear-gradient(90deg,#ffffff,#f3f6f8)';
   t.style.color = 'var(--text)';
   t.style.padding = '10px 14px';
   t.style.borderRadius = '10px';
   t.style.fontSize = '14px';
   t.style.zIndex = 120;
   t.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
   document.body.appendChild(t);
   setTimeout(()=>{ t.style.transition='all .5s'; t.style.opacity=0; t.style.transform='translateX(-50%) translateY(16px)'; }, 2400);
   setTimeout(()=>t.remove(), 3200);
 }

 // generate a small centered terms popup (separate from main modal)
 function showTermsPopup(title, htmlContent){
   // ensure page is at top when the terms popup opens
   window.scrollTo({ top: 0, behavior: 'smooth' });

   // remove any existing terms popup
   const existing = document.getElementById('termsPopup');
   if(existing) existing.remove();

   const wrapper = document.createElement('div');
   wrapper.id = 'termsPopup';
   wrapper.style.position = 'fixed';
   wrapper.style.inset = '0';
   wrapper.style.display = 'flex';
   wrapper.style.alignItems = 'center';
   wrapper.style.justifyContent = 'center';
   wrapper.style.background = 'rgba(2,6,23,0.6)';
   wrapper.style.zIndex = 200;

   const card = document.createElement('div');
   card.style.width = '90%';
   card.style.maxWidth = '560px';
   card.style.maxHeight = '70vh';
   card.style.overflow = 'auto';
   // use decorative card image instead of plain gradient
   card.style.backgroundImage = 'url("/backback.png")';
   card.style.backgroundRepeat = 'no-repeat';
   card.style.backgroundPosition = 'center';
   card.style.backgroundSize = 'cover';
   card.style.padding = '16px';
   card.style.borderRadius = '12px';
   card.style.border = '1px solid rgba(0,0,0,0.04)';
   card.style.color = 'var(--text)';
   card.innerHTML = `
     <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
       <strong style="font-size:16px">${title}</strong>
       <button id="termsClose" class="btn outline" style="padding:6px 8px;font-size:16px">✕</button>
     </div>
     <div style="color:var(--muted);line-height:1.5">${htmlContent}</div>
   `;
   wrapper.appendChild(card);
   document.body.appendChild(wrapper);

   const closeBtn = document.getElementById('termsClose');
   closeBtn.addEventListener('click', ()=> wrapper.remove());
   wrapper.addEventListener('click', (e)=>{ if(e.target === wrapper) wrapper.remove(); });
 }

 // generate a small course detail popup
 function showCoursePopup(key){
   // ensure page is at top when the course popup opens
   window.scrollTo({ top: 0, behavior: 'smooth' });

   const map = {
     "Transformer": {
       title: "Transformer son métier avec l’IA",
       topics: [
         "Cartographie des tâches et identification des opportunités d’automatisation",
         "Conception de workflows assistés par IA",
         "Choix et mise en place d’outils (RPA, scripts, intégrations API)",
         "Mesure d’impact et gouvernance des automations"
       ],
       results: [
         "Roadmap d’automatisation pour votre poste ou équipe",
         "Workflows automatisés prêts à déployer",
         "Gains de productivité identifiés et chiffrés"
       ],
       duration: "à définir",
       price: "Sur devis - HTVA"
     },
     "Optimisation": {
      title: "Optimisation des opérations & automatisation intelligente",
      topics: [
        "Audit des processus métiers",
        "Cartographie des flux de travail existants",
        "Analyse des tâches manuelles, répétitives ou à faible valeur",
        "Identification des points de blocage, erreurs et pertes de temps",
        "Priorisation des initiatives d’automatisation",
        "Évaluation impact vs effort et définition de roadmap",
        "Intégration d'automatisation pour pilotage et automatisation (Excel, ChatGPT, RPA, API)",
        "Plan de déploiement, KPI et suivi"
      ],
      results: [
        "Plan d’optimisation opérationnelle détaillé avec recommandations et priorités",
        "Automatisations prototypes (selon périmètre) démontrant faisabilité",
        "Templates et outils réutilisables pour standardiser les opérations",
        "Tableau de bord KPI pour mesurer et suivre les améliorations"
      ],
      duration: "Session d’analyse stratégique (4 heures) — durée finale adaptable • TJM: 500-600 €/jour",
      price: "📌 Tarification : sur devis personnalisé"
    },
     "CV": {
       title: "Pack CV & Lettre",
       topics: [
         "Analyse et restructuration de votre CV",
         "Rédaction ciblée par métier et ATS",
         "Modèles de documents et prompts réutilisables",
         "Exemples concrets et checklist de candidature"
       ],
       results: [
         "CV clair, concis, orienté résultats : compatible ATS",
         "Lettre adaptée au poste et facile à personnaliser",
         "Templates personelles prête à l'emploi"
       ],
       duration: "1 heure",
       price: "0€ (inclus dans Quboor Basic)"
     },
     "Prospection": {
       title: "Automatisation de la prospection",
       topics: [
         "Analyse et restructuration de votre CV",
         "Rédaction ciblée par métier et ATS",
         "Modèles de documents et prompts réutilisables",
         "Exemples concrets et checklist de candidature",
         "Recrutement et fonctionnement des ATS",
         "Scoring et screening automatisé",
         "On-demand video interview",
         "Performances et et taux de conversion",
         "Intégration de l'automatisation"
       ],
       results: [
         "Processus de candidature reproductible",
         "Modèles de CV, lettres et prompts optimisés ATS",
         "Automatisation des candidatures",
         "Maîtrise des outils ATS , HireVue",
         "Optimisation du recrutement et intégration de l’IA"
       ],
       duration: "5 heures",
       price: "0€ (inclus dans Quboor Premium)"
     }
   };
   const info = map[key] || { title: key, topics: [], results: [], duration: "", price: "" };

   // remove existing if any
   const existing = document.getElementById('coursePopup');
   if(existing) existing.remove();

   const wrap = document.createElement('div');
   wrap.id = 'coursePopup';
   wrap.style.position = 'fixed';
   wrap.style.inset = '0';
   wrap.style.display = 'flex';
   wrap.style.alignItems = 'center';
   wrap.style.justifyContent = 'center';
   wrap.style.background = 'rgba(2,6,23,0.6)';
   wrap.style.zIndex = 210;

   const card = document.createElement('div');
   card.style.width = '92%';
   card.style.maxWidth = '600px';
   card.style.maxHeight = '78vh';
   card.style.overflow = 'auto';
   // use decorative card background for course popup
   card.style.backgroundImage = 'url("/backback.png")';
   card.style.backgroundRepeat = 'no-repeat';
   card.style.backgroundPosition = 'center';
   card.style.backgroundSize = 'cover';
   card.style.padding = '16px';
   card.style.borderRadius = '12px';
   card.style.border = '1px solid rgba(0,0,0,0.04)';
   card.style.color = 'var(--text)';
   card.innerHTML = `
     <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
       <div>
         <strong style="font-size:16px">${info.title}</strong>
         <div style="color:var(--muted);font-size:13px;margin-top:4px">${info.duration} • ${info.price}</div>
       </div>
       <button id="courseClose" class="btn outline" style="padding:6px 8px;font-size:16px">✕</button>
     </div>
     <div style="color:var(--muted);line-height:1.5;margin-bottom:10px">
       <strong>Sujets abordés</strong>
       <ul style="margin:8px 0 12px 18px;color:var(--muted)">
         ${info.topics.map(t=>`<li>${t}</li>`).join('')}
       </ul>
       <strong>Résultats attendus</strong>
       <ul style="margin:8px 0 0 18px;color:var(--muted)">
         ${info.results.map(r=>`<li>${r}</li>`).join('')}
       </ul>
     </div>

     <div style="display:flex;gap:10px;justify-content:center;margin-top:8px">
       <button id="courseContact" class="btn primary" style="padding:8px 12px;border-radius:8px">Nous contacter</button>
     </div>

     <div style="height:8px"></div>
   `;
   wrap.appendChild(card);
   document.body.appendChild(wrap);

   const close = document.getElementById('courseClose');
   function rm(){ wrap.remove(); }
   close.addEventListener('click', rm);
   wrap.addEventListener('click', (e)=>{ if(e.target === wrap) rm(); });

   // bind the "Nous contacter" button to open a prefilled mailto for enquiries (only if present)
   const contactBtn = document.getElementById('courseContact');
   if(contactBtn){
     contactBtn.addEventListener('click', ()=>{
       // compose subject and body with course info and full topics list
       const subj = encodeURIComponent(`${info.title} — Demande d'information`);
       const lines = [];
       lines.push('Bonjour,');
       lines.push('');
       lines.push('Je souhaite obtenir un devis et des informations complémentaires pour la prestation suivante :');
       lines.push(info.title);
       lines.push('');
       lines.push('Détails souhaités :');
       lines.push('- Disponibilités pour une session d’analyse');
       lines.push('- Budget à prévoir');
       lines.push('- Modalités (distanciel / présentiel)');
       lines.push('');
       lines.push('Sujets que nous souhaitons aborder :');
       // include the full list of topics from the course details
       if(Array.isArray(info.topics) && info.topics.length){
         info.topics.forEach(t=> lines.push(`- ${t}`));
         lines.push('');
       }
       lines.push('Merci de me contacter pour convenir des prochaines étapes.');
       lines.push('');
       lines.push('Cordialement,');
       lines.push('[Votre prénom et nom]');
       lines.push('[Votre e-mail / téléphone]');

       const body = encodeURIComponent(lines.join('\n'));
       window.location.href = `mailto:contact@example.com?subject=${subj}&body=${body}`;
     });
   }
 }

 // reveal animations on scroll for panels
 const observers = [];
 document.querySelectorAll('.panel').forEach(panel=>{
   panel.classList.add('fade-in');
   const io = new IntersectionObserver((entries)=>{
     entries.forEach(ent=>{
       if(ent.isIntersecting) panel.classList.add('show');
     });
   }, {threshold:0.08});
   io.observe(panel);
   observers.push(io);
 });

 // Collapsible toggles for Accueil intro blocks
 function bindCollapsibles(){
   const toggles = Array.from(document.querySelectorAll('.collapse-toggle'));
   toggles.forEach(btn=>{
     const targetId = btn.getAttribute('aria-controls');
     const target = targetId ? document.getElementById(targetId) : null;
     btn.addEventListener('click', ()=>{
       const isOpen = btn.getAttribute('aria-expanded') === 'true';
       if(target){
         if(isOpen){
           target.setAttribute('hidden','');
           btn.setAttribute('aria-expanded','false');
           btn.textContent = '▸';
         } else {
           target.removeAttribute('hidden');
           btn.setAttribute('aria-expanded','true');
           btn.textContent = '▾';
         }
       }
     });
   });
 }
 // bind on initial load and after any main content restore
 bindCollapsibles();
 // ensure collapsibles rebind after main content restore
 const originalRestoreMainContent = restoreMainContent;
 restoreMainContent = function(){
   originalRestoreMainContent();
   setTimeout(bindCollapsibles, 50);
 };

// small animated accent on hero headline using anime.js
anime({
  targets: '.hero h1',
  translateY: [-6,0],
  opacity: [0,1],
  duration: 800,
  easing: 'easeOutCubic',
  delay: 200
});

// accessibility: keyboard Esc closes modal and nav
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape'){
    closeModal();
    nav.classList.remove('open');
  }
});

 // Add ripple effect to buttons with class 'btn'
 document.querySelectorAll('.btn').forEach(btn=>{
   btn.classList.add('ripple');
   btn.addEventListener('click', (e)=>{
     // small visual feedback already via CSS :active
   });
 });

 // Brand video: fade in for a short period then fade out, repeating every 20s.
 (function(){
   const vid = document.getElementById('brandVideo');
   const brand = document.querySelector('.brand');
   if(!vid) return;
   // Try to play the video (some browsers require interaction; muted helps)
   vid.play().catch(()=>{ /* ignore play failures */ });

   const VISIBLE_MS = 4000; // how long video stays visible
   const CYCLE_MS = 20000;  // total cycle length

   // Use class toggling for smooth CSS transitions and apply a gradient border on the brand container
   function showOnce(){
     vid.classList.add('visible');
     if(brand) brand.classList.add('video-visible');
     // ensure playback starts when visible
     if(vid.paused) vid.play().catch(()=>{});
     setTimeout(()=> {
       vid.classList.remove('visible');
       if(brand) brand.classList.remove('video-visible');
     }, VISIBLE_MS);
   }

   // start with a small stagger so it feels natural
   setTimeout(showOnce, 1200);
   // repeat on interval
   setInterval(showOnce, CYCLE_MS);
 })();

 // Remove header blur when user scrolls: toggle a class on the topbar to disable backdrop-filter
 (function(){
   const topbar = document.querySelector('.topbar');
   if(!topbar) return;
   let lastState = window.scrollY > 8;
   function update(){
     const scrolled = window.scrollY > 8;
     if(scrolled !== lastState){
       lastState = scrolled;
       if(scrolled) topbar.classList.add('no-blur');
       else topbar.classList.remove('no-blur');
     }
   }
   // initial check and bind
   update();
   window.addEventListener('scroll', update, {passive:true});
 })();

