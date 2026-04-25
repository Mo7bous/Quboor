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
navToggle.addEventListener('click', ()=>nav.classList.toggle('open'));

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

  // special handling: if user asks for 'hero' (Accueil) and main was replaced by Pro offer, restore original content
  if(catId === 'hero' && document.getElementById('pro-offer')){
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
  });
});
// default view: accueil (hero) or preserve hash if present
const initial = location.hash ? location.hash.replace('#','') : 'hero';
if(document.getElementById(initial)) showCategory(initial, false);

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

  // give the modal a grey overlay and ensure the card itself is white (like the Pro offer look)
  modal.style.background = 'rgba(2,6,23,0.6)'; // grey dim around the card
  modalCard.style.background = '#ffffff';
  modalCard.style.border = '1px solid rgba(0,0,0,0.06)';

  modalCard.innerHTML = `
    <button class="close" id="modalClose" aria-label="Fermer">✕</button>
    <div style="position:relative">
      <div style="position:absolute;top:44px;right:16px;font-size:20px;font-weight:700">€49</div>
      <h3 style="margin-top:8px">Offre Basic — Confirmation</h3>
      <p><strong>One-off professional CV + cover</strong></p>
      <ul style="color:var(--muted);margin:10px 0 12px;line-height:1.4">
        <li> CV personalisé</li>
        <li> Lettre de motivation</li>
        <li> Support par mail 7/7</li>
      </ul>
      <p>Profitez d’un CV et d’une lettre de motivation entièrement personnalisés, conçus pour mettre en valeur vos compétences et maximiser vos chances auprès des recruteurs. Chaque document est adapté à votre profil et aux exigences du poste visé, pour vous démarquer immédiatement. Vous bénéficiez également d’un accompagnement par mail 7j/7, pour ajuster vos documents et répondre à toutes vos questions. Donnez un véritable coup d’accélérateur à votre recherche d’emploi avec un service professionnel, réactif et sur mesure.</p>
      <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
        <button class="btn basic" id="basicValidate">S'inscrire</button>
        <button class="btn outline" id="modalCancelInjected">Annuler</button>
      </div>
      <hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:16px 0">
      <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
        <span style="color:var(--muted)">Termes et conditions</span>
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
  if(injectedCancel) injectedCancel.addEventListener('click', closeModal);
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

Je souhaite obtenir des informations et valider une demande pour l'Offre Basic — One-off professional CV + cover (€49).

Merci de me contacter pour confirmer les délais, livrables et modalités.

Cordialement,
[Votre prénom et nom]
[Votre email]

Numéro de demande: ${reqId}`
      );
      window.location.href = `mailto:a.bouhlal@quboor.org?subject=${subject}&body=${body}`;
    });
  }

  // bind the info button to open the terms popup (fixes issue where icon did not open the popup)
  const injectedBasicInfo = modal.querySelector('#basicInfo');
  if(injectedBasicInfo){
    injectedBasicInfo.addEventListener('click', ()=>{
      // ensure page is at top when popups open
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showTermsPopup('Offre Basic — Termes et conditions', `
        <p>Ce document est une proposition / brouillon et n’engage pas contractuellement les parties.</p>
        <p>Les détails finaux (délais, livrables) seront confirmés après échange et validation par email.</p>
        <p>Les prix indiqués peuvent être ajustés en fonction des demandes particulières ou options supplémentaires.</p>
        <p>Les révisions et livraisons se font selon les conditions convenues lors de la validation finale.</p>
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

   // give modal a grey overlay and ensure the card is white like Pro look
   modal.style.background = 'rgba(2,6,23,0.6)';
   modalCard.style.background = '#ffffff';
   modalCard.style.border = '1px solid rgba(0,0,0,0.06)';

   modalCard.innerHTML = `
     <button class="close" id="modalClose" aria-label="Fermer">✕</button>
     <div style="position:relative">
       <div style="position:absolute;top:44px;right:16px;font-size:20px;font-weight:700">€249</div>
       <h3 style="margin-top:8px">Quboor Pro — Premium</h3>
       <p><strong>Accompagnement premium, livraison prioritaire</strong></p>
       <ul style="color:var(--muted);margin:10px 0 12px;line-height:1.4">
         <li>Jusqu’à 3 modèles et variantes</li>
         <li>Jusqu’à 5 heures de travail dédiées</li>
         <li>Support prioritaire et optimisation</li>
       </ul>
       <p>Avec Quboor Pro — Premium, bénéficiez d’un accompagnement haut de gamme et d’une livraison prioritaire pour avancer plus vite et plus efficacement. Profitez de jusqu’à 3 modèles et variantes de CV et lettres, conçus sur mesure pour valoriser chaque facette de votre profil. Jusqu’à 5 heures de travail dédiées sont investies pour optimiser chaque détail et maximiser votre impact auprès des recruteurs. Grâce à un support prioritaire et des ajustements continus, vous mettez toutes les chances de votre côté avec un service réactif et exigeant.</p>
       <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap">
         <button class="btn basic" id="proValidate">S'inscrire</button>
         <button class="btn outline" id="proCancelInjected">Annuler</button>
       </div>
       <hr style="border:none;border-top:1px solid rgba(0,0,0,0.06);margin:16px 0">
       <div style="display:flex;align-items:center;gap:8px;margin-top:8px">
         <span style="color:var(--muted)">Termes et conditions</span>
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
   if(injectedCancel) injectedCancel.addEventListener('click', closeModal);
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
       const subject = encodeURIComponent('Demande d’information — Plan Pro');
       const body = encodeURIComponent(
`Bonjour,

Je souhaite obtenir des informations et valider une demande pour le plan Pro — Accompagnement complet et service multi-modèles (€249).

Merci de me contacter pour confirmer les délais, livrables et modalités.

Cordialement,
[Votre prénom et nom]
[Votre email]

Numéro de demande: ${reqId}`
       );
       window.location.href = `mailto:a.bouhlal@quboor.org?subject=${subject}&body=${body}`;
     });
   }

   // bind the injected info button to open the terms popup
   const injectedProInfo = modal.querySelector('#proInfoInjected');
   if(injectedProInfo){
     injectedProInfo.addEventListener('click', ()=>{
       // ensure page is at top when popups open
       window.scrollTo({ top: 0, behavior: 'smooth' });
       showTermsPopup('Pro — Termes et conditions', `
         <p>Ce message constitue une demande d’information et ne crée pas de contrat contraignant.</p>
         <p>Les détails finaux (délais, livrables) seront confirmés et validés par échange email avant toute production.</p>
         <p>Les prix indiqués peuvent être ajustés en fonction d’options supplémentaires ou demandes particulières.</p>
         <p>Les révisions incluses sont réalisées selon les modalités convenues lors de la validation finale.</p>
         <p>Les livrables finaux seront fournis après paiement ou selon l’accord convenu par email.</p>
       `);
     });
   }
 }
// initial binding for quickEnroll and learnMore
if(quickEnroll) quickEnroll.addEventListener('click', quickEnrollHandler);
if(learnMore) learnMore.addEventListener('click', ()=>openOfferModal());

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
   window.location.href = `mailto:a.bouhlal@quboor.org?subject=${subject}&body=${body}`;

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
   card.style.background = 'linear-gradient(180deg,#ffffff,#f7fafc)';
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
     "CV": {
       title: "Pack CV & Lettre — Détails",
       topics: [
         "Analyse et restructuration de votre CV",
         "Rédaction ciblée par métier et ATS",
         "Modèles de lettre et prompts réutilisables",
         "Exemples concrets et checklist de candidature"
       ],
       results: [
         "CV clair, concis et orienté résultats",
         "Lettre adaptée au poste et facile à personnaliser",
         "Kit de templates prêt à l'emploi"
       ],
       duration: "1 heure",
       price: "0€ (inclus dans Quboor Basic)"
     },
     "Prospection": {
       title: "Automatisation de la prospection — Détails",
       topics: [
         "Recherche d'offres et sourcing structuré",
         "Séquences d'approche et templates",
         "Automatisation des suivis",
         "Mesures et optimisation du pipeline"
       ],
       results: [
         "Processus de prospection reproductible",
         "Séquences prêtes à envoyer",
         "Gain de temps et meilleur taux de réponse"
       ],
       duration: "5 heures",
       price: "0€ (inclus dans Quboor Basic)"
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
   card.style.background = 'linear-gradient(180deg,#ffffff,#f7fafc)';
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
   `;
   wrap.appendChild(card);
   document.body.appendChild(wrap);

   const close = document.getElementById('courseClose');
   function rm(){ wrap.remove(); }
   close.addEventListener('click', rm);
   wrap.addEventListener('click', (e)=>{ if(e.target === wrap) rm(); });
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

 // Demo buttons inside the demo panel: open Pro panel or Basic offer modal
 const demoProBtn = document.getElementById('demoPro');
 const demoBasicBtn = document.getElementById('demoBasic');
 if(demoProBtn) demoProBtn.addEventListener('click', quickEnrollHandler);
 if(demoBasicBtn) demoBasicBtn.addEventListener('click', ()=>openOfferModal());
