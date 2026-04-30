/* Etter Isen Companion MVP
   Static app for GitHub Pages. Data is stored in localStorage. */

const STORAGE_KEY = "etterIsenCompanionMvp.v1";

const FALLBACK_ARCHETYPES = [
  { id: "stille", name: "Den stille", portrait: "assets/portraits/jeger_01.png", stats: { hel: 5, sty: 4, ova: 6, smi: 7, klo: 5 }, equipment: ["kastespyd", "flintkniv"], roleText: "kommer nær og kaster fra god posisjon" },
  { id: "sterke", name: "Den sterke", portrait: "assets/portraits/jeger_02.png", stats: { hel: 6, sty: 7, ova: 4, smi: 5, klo: 4 }, equipment: ["tungt spyd", "bærereim"], roleText: "holder unna og bærer tungt hjem" }
];

const FALLBACK_RESOURCES = {
  resources: [
    { id: "kjott", name: "Kjøtt", icon: "🥩" }, { id: "torket_kjott", name: "Tørket kjøtt", icon: "🍖" },
    { id: "skinn", name: "Skinn", icon: "🟫" }, { id: "bein", name: "Bein", icon: "🦴" },
    { id: "sener", name: "Sener", icon: "🪢" }, { id: "gevir", name: "Gevir", icon: "🦌" },
    { id: "fett", name: "Fett", icon: "🕯️" }, { id: "flint", name: "Flint", icon: "🔺" },
    { id: "treverk", name: "Treverk", icon: "🪵" }, { id: "urter", name: "Urter", icon: "🌿" },
    { id: "andegaver", name: "Åndegaver", icon: "✦" }
  ],
  allocations: []
};

const FALLBACK_SCENARIOS = [
  { id: "reindeer_moraine", name: "Reinflokken ved moreneryggen", description: "Første testscenario", defaultResources: { kjott: 4, skinn: 1, sener: 1, bein: 1, gevir: 1, fett: 1 }, successHint: "Fell minst én rein." }
];

const FALLBACK_EVENTS = [];

const STAT_LABELS = {
  mat: "Mat",
  samhold: "Samhold",
  andskraft: "Åndskraft",
  kunnskap: "Kunnskap",
  trygghet: "Trygghet",
  fare: "Fare"
};

const HUNTER_STAT_LABELS = {
  hel: "Helse / utholdenhet",
  sty: "Styrke",
  ova: "Overvåkenhet",
  smi: "Smidighet",
  klo: "Kløkt"
};

const SKILL_DEFINITIONS = [
  { id: "kaste_spyd", name: "Kaste spyd", formula: "(2 × OVÅ + SMI) / 3", calc: s => round((2 * s.ova + s.smi) / 3) },
  { id: "spyd_naerkamp", name: "Spyd nærkamp", formula: "(STY + SMI) / 2", calc: s => round((s.sty + s.smi) / 2) },
  { id: "sniking", name: "Sniking", formula: "(2 × SMI + OVÅ) / 3", calc: s => round((2 * s.smi + s.ova) / 3) },
  { id: "sporing", name: "Sporing", formula: "(OVÅ + KLØ) / 2", calc: s => round((s.ova + s.klo) / 2) },
  { id: "dyrekunnskap", name: "Dyrekunnskap", formula: "(2 × KLØ + OVÅ) / 3", calc: s => round((2 * s.klo + s.ova) / 3) },
  { id: "loping", name: "Løping", formula: "(2 × HEL + SMI + STY) / 4", calc: s => round((2 * s.hel + s.smi + s.sty) / 4) },
  { id: "hosting", name: "Høsting / slakting", formula: "(2 × KLØ + SMI + OVÅ) / 4", calc: s => round((2 * s.klo + s.smi + s.ova) / 4) },
  { id: "handverk", name: "Håndverk", formula: "(2 × KLØ + SMI) / 3", calc: s => round((2 * s.klo + s.smi) / 3) },
  { id: "forstehjelp", name: "Førstehjelp / stell", formula: "(KLØ + SMI) / 2", calc: s => round((s.klo + s.smi) / 2) },
  { id: "mot", name: "Mot / ro", formula: "(HEL + KLØ) / 2", calc: s => round((s.hel + s.klo) / 2) }
];

const MILESTONES = [
  { id: "first_hunt_logged", title: "Første jakt loggført", criteria: "Registrer én jakt i appen.", manual: true },
  { id: "first_success", title: "Første vellykkede jakt", criteria: "En jakt avsluttes som vellykket eller dyrt kjøpt.", triggerKey: "first_success", manual: true },
  { id: "first_failed", title: "Første mislykkede jakt", criteria: "En jakt avsluttes som mislykket.", triggerKey: "first_failed", manual: true },
  { id: "first_injury", title: "Første skadede jeger", criteria: "En jeger kommer hjem lett eller alvorlig skadet.", triggerKey: "hunter_injured", manual: true },
  { id: "first_death", title: "Første døde jeger", criteria: "En jeger dør under jakt.", triggerKey: "hunter_dead", manual: true },
  { id: "good_catch", title: "God fangst", criteria: "Minst 8 kjøtt eller minst 2 dyr felt i én jakt.", triggerKey: "good_catch", manual: true },
  { id: "first_resource_allocation", title: "Første ressursfordeling", criteria: "Bruk en stammehandling i ressursfasen.", manual: true },
  { id: "first_ritual", title: "Første ritual", criteria: "Velg ritual ved bålet eller annen rituell stammehandling.", manual: true },
  { id: "four_hunters", title: "Fire jegere klare", criteria: "Stammen har minst fire levende jegere.", manual: true },
  { id: "low_food_warning", title: "Sulten banker på", criteria: "Mat faller til 2 eller lavere.", triggerKey: "low_food", manual: true },
  { id: "clan_memory", title: "Stammens hukommelse", criteria: "Minst fem fortellinger er lagret i loggen.", manual: true }
];

let data = {
  archetypes: [],
  resourceConfig: { resources: [], allocations: [] },
  scenarios: [],
  events: []
};

let state = loadState();

const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

function round(value) {
  return Math.floor(value + 0.5);
}

function clamp(value, min = 0, max = 10) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function uid(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function today() {
  return new Date().toLocaleDateString("no-NO", { year: "numeric", month: "2-digit", day: "2-digit" });
}

function nowStamp() {
  return new Date().toISOString();
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("no-NO", { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function defaultResources() {
  const base = {};
  for (const resource of data.resourceConfig.resources.length ? data.resourceConfig.resources : FALLBACK_RESOURCES.resources) {
    base[resource.id] = 0;
  }
  return base;
}

function createDefaultState() {
  return {
    version: 1,
    tribe: {
      name: "Stammen ved moreneryggen",
      stats: { mat: 3, samhold: 5, andskraft: 4, kunnskap: 3, trygghet: 3, fare: 2 },
      resources: {
        kjott: 0, torket_kjott: 0, skinn: 0, bein: 0, sener: 0, gevir: 0, fett: 0, flint: 2, treverk: 2, urter: 1, andegaver: 0
      }
    },
    hunters: [],
    hunts: [],
    milestones: {},
    usedEvents: {},
    log: []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    const parsed = JSON.parse(raw);
    return migrateState(parsed);
  } catch (error) {
    console.warn("Kunne ikke lese lagring, starter på nytt", error);
    return createDefaultState();
  }
}

function migrateState(incoming) {
  const fresh = createDefaultState();
  return {
    ...fresh,
    ...incoming,
    tribe: {
      ...fresh.tribe,
      ...(incoming.tribe || {}),
      stats: { ...fresh.tribe.stats, ...(incoming.tribe?.stats || {}) },
      resources: { ...fresh.tribe.resources, ...(incoming.tribe?.resources || {}) }
    },
    hunters: incoming.hunters || [],
    hunts: incoming.hunts || [],
    milestones: incoming.milestones || {},
    usedEvents: incoming.usedEvents || {},
    log: incoming.log || []
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function loadJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Bruker fallback for ${path}`, error);
    return fallback;
  }
}

async function init() {
  data.archetypes = await loadJson("data/archetypes.json", FALLBACK_ARCHETYPES);
  data.resourceConfig = await loadJson("data/resources.json", FALLBACK_RESOURCES);
  data.scenarios = await loadJson("data/scenarios.json", FALLBACK_SCENARIOS);
  data.events = await loadJson("data/events.json", FALLBACK_EVENTS);
  ensureResourceKeys();
  bindEvents();
  populateStaticControls();
  renderAll();
  updateSkillPreview();
}

function ensureResourceKeys() {
  for (const resource of data.resourceConfig.resources) {
    if (typeof state.tribe.resources[resource.id] !== "number") state.tribe.resources[resource.id] = 0;
  }
  saveState();
}

function bindEvents() {
  $$('[data-view]').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));
  $$('.tab').forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.view)));

  $('#renameTribeBtn').addEventListener('click', renameTribe);
  $('#hunterForm').addEventListener('submit', saveHunterFromForm);
  $('#hunterArchetype').addEventListener('change', applyArchetypeToForm);
  ['#statHel', '#statSty', '#statOva', '#statSmi', '#statKlo'].forEach(id => $(id).addEventListener('input', updateSkillPreview));
  $('#previewSheetBtn').addEventListener('click', previewCurrentHunterSheet);
  $('#addSampleHuntersBtn').addEventListener('click', addSampleHunters);

  $('#huntForm').addEventListener('submit', handleHuntSubmit);
  $('#quickFoodBtn').addEventListener('click', () => applyQuickFood());
  $('#manualResourceForm').addEventListener('submit', handleManualResource);
  $('#recheckMilestonesBtn').addEventListener('click', () => { checkAutomaticMilestones(); renderAll(); });
  $('#clearLogBtn').addEventListener('click', clearStoryLog);
  $('#exportStateBtn').addEventListener('click', exportState);
  $('#importStateBtn').addEventListener('click', importState);
  $('#resetAllBtn').addEventListener('click', resetAll);
}

function showView(viewName) {
  $$('.view').forEach(view => view.classList.remove('is-active'));
  const target = $(`#view-${viewName}`);
  if (target) target.classList.add('is-active');
  $$('.tab').forEach(tab => tab.classList.toggle('is-active', tab.dataset.view === viewName));
  if (viewName === 'hunt') renderHuntParticipants();
}

function populateStaticControls() {
  const archetypeSelect = $('#hunterArchetype');
  archetypeSelect.innerHTML = data.archetypes.map(a => `<option value="${escapeHtml(a.id)}">${escapeHtml(a.name)}</option>`).join('');
  applyArchetypeToForm();

  const scenarioSelect = $('#huntScenario');
  scenarioSelect.innerHTML = data.scenarios.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`).join('');

  const manualSelect = $('#manualResourceSelect');
  manualSelect.innerHTML = data.resourceConfig.resources.map(r => `<option value="${escapeHtml(r.id)}">${escapeHtml(r.name)}</option>`).join('');
  renderHuntResources();
}

function renderAll() {
  checkAutomaticMilestones(false);
  renderTribeStats();
  renderResourceSummary();
  renderNextHuntAdvice();
  renderLatestStory();
  renderHunterList();
  renderHuntParticipants();
  renderResourceInventory();
  renderAllocationActions();
  renderMilestones();
  renderStoryLog();
  saveState();
}

function renderTribeStats() {
  const html = Object.entries(state.tribe.stats).map(([id, value]) => {
    const label = STAT_LABELS[id] || id;
    const percent = clamp(value, 0, 10) * 10;
    return `<div class="statBar">
      <div class="statBar__top"><span>${escapeHtml(label)}</span><strong>${value}/10</strong></div>
      <div class="statBar__track"><div class="statBar__fill" style="width:${percent}%"></div></div>
    </div>`;
  }).join('');
  $('#tribeStats').innerHTML = `<h3>${escapeHtml(state.tribe.name)}</h3>${html}`;
}

function resourceMeta(id) {
  return data.resourceConfig.resources.find(r => r.id === id) || { id, name: id, icon: "•" };
}

function renderResourceSummary() {
  const entries = Object.entries(state.tribe.resources).filter(([, amount]) => amount > 0);
  $('#resourceSummary').innerHTML = entries.length ? entries.map(([id, amount]) => resourceItemHtml(id, amount)).join('') : '<p class="muted">Ingen synlige ressurser ennå. Registrer en jakt eller juster lageret manuelt.</p>';
}

function renderResourceInventory() {
  $('#resourceInventory').innerHTML = data.resourceConfig.resources.map(r => resourceItemHtml(r.id, state.tribe.resources[r.id] || 0, true)).join('');
}

function resourceItemHtml(id, amount) {
  const meta = resourceMeta(id);
  return `<div class="resourceItem" title="${escapeHtml(meta.description || '')}"><span>${escapeHtml(meta.icon || '')} ${escapeHtml(meta.name)}</span><strong>${amount}</strong></div>`;
}

function renderNextHuntAdvice() {
  const s = state.tribe.stats;
  const advice = [];
  if (s.mat <= 2) advice.push("Mat er kritisk lav. Neste jakt bør handle om kjøtt, ikke prestisje.");
  if (s.fare >= 7) advice.push("Fare er høy. Rovdyr, rivaler eller dårlig vær bør få en fysisk markør på bordet.");
  if (s.samhold <= 2) advice.push("Samholdet er skjørt. Tap, ulik fordeling eller harde valg bør svi ekstra.");
  if (state.hunters.filter(h => h.status !== 'dead').length < 4) advice.push("Stammen har færre enn fire levende jegere. Lag en ny jeger eller la en ung bli med.");
  if (!advice.length) advice.push("Stammen kan puste. Neste jakt bør teste vind, sniking og fordeling av risiko.");
  $('#nextHuntAdvice').innerHTML = advice.map(a => `<p>${escapeHtml(a)}</p>`).join('');
}

function renderLatestStory() {
  const latest = state.log[0];
  $('#latestStory').innerHTML = latest ? `<strong>${escapeHtml(latest.title)}</strong><p>${escapeHtml(latest.text).slice(0, 280)}${latest.text.length > 280 ? '…' : ''}</p>` : '<p class="muted">Ingen fortellinger ennå. Registrer en jakt for å tenne bålet.</p>';
}

function renameTribe() {
  const name = prompt("Hva heter stammen?", state.tribe.name);
  if (!name || !name.trim()) return;
  state.tribe.name = name.trim();
  addLog("Stammen får navn", `Fra denne kvelden sier de navnet tydeligere: ${state.tribe.name}. Et navn er ikke bare lyd. Det er stedet minnene kan samles.`);
  renderAll();
}

function applyArchetypeToForm() {
  const id = $('#hunterArchetype').value;
  const archetype = data.archetypes.find(a => a.id === id) || data.archetypes[0];
  if (!archetype) return;
  $('#statHel').value = archetype.stats.hel;
  $('#statSty').value = archetype.stats.sty;
  $('#statOva').value = archetype.stats.ova;
  $('#statSmi').value = archetype.stats.smi;
  $('#statKlo').value = archetype.stats.klo;
  $('#hunterPortrait').value = archetype.portrait || "assets/portraits/jeger_01.png";
  $('#hunterEquipment').value = (archetype.equipment || []).join(', ');
  updateSkillPreview();
}

function readStatsFromForm() {
  return {
    hel: clamp($('#statHel').value, 1, 10),
    sty: clamp($('#statSty').value, 1, 10),
    ova: clamp($('#statOva').value, 1, 10),
    smi: clamp($('#statSmi').value, 1, 10),
    klo: clamp($('#statKlo').value, 1, 10)
  };
}

function calculateSkills(stats) {
  const skills = {};
  for (const skill of SKILL_DEFINITIONS) skills[skill.id] = skill.calc(stats);
  return skills;
}

function updateSkillPreview() {
  const stats = readStatsFromForm();
  const skills = calculateSkills(stats);
  $('#skillPreview').innerHTML = SKILL_DEFINITIONS.map(skill => `
    <div class="skillRow">
      <div><strong>${escapeHtml(skill.name)}</strong><div class="skillFormula">${escapeHtml(skill.formula)}</div></div>
      <strong>${skills[skill.id]}</strong>
    </div>`).join('');
}

function createHunterFromForm() {
  const stats = readStatsFromForm();
  const archetype = data.archetypes.find(a => a.id === $('#hunterArchetype').value);
  const name = $('#hunterName').value.trim() || "Navnløs jeger";
  return {
    id: uid('hunter'),
    name,
    player: $('#hunterPlayer').value.trim(),
    age: Number($('#hunterAge').value) || 24,
    archetypeId: archetype?.id || "custom",
    role: archetype?.name || "Egendefinert",
    roleText: archetype?.roleText || "finner sin rolle ved bålet",
    portrait: $('#hunterPortrait').value.trim() || "assets/portraits/jeger_01.png",
    stats,
    skills: calculateSkills(stats),
    breath: stats.hel,
    equipment: splitList($('#hunterEquipment').value),
    note: $('#hunterNote').value.trim(),
    status: "alive",
    conditions: [],
    xp: {},
    createdAt: nowStamp()
  };
}

function splitList(value) {
  return String(value || '').split(',').map(v => v.trim()).filter(Boolean);
}

function saveHunterFromForm(event) {
  event.preventDefault();
  const hunter = createHunterFromForm();
  state.hunters.push(hunter);
  addLog("En ny jeger trer frem", `${hunter.name} setter seg ved ildstedet med ${hunter.equipment.length ? hunter.equipment.join(', ') : 'tomme hender og våkent blikk'}. Stammen måler ikke en jeger bare i styrke, men i hva som skjer når vinden snur.`);
  $('#hunterForm').reset();
  populateStaticControls();
  unlockMilestoneIfNeeded('four_hunters');
  renderAll();
  printHunterSheet(hunter.id, false);
}

function previewCurrentHunterSheet() {
  const hunter = createHunterFromForm();
  printHunterSheet(null, true, hunter);
}

function addSampleHunters() {
  if (!data.archetypes.length) return;
  const names = ["Nara", "Ulv", "Aila", "Siv" ];
  const players = ["Spiller 1", "Spiller 2", "Spiller 3", "Spiller 4"];
  data.archetypes.slice(0, 4).forEach((a, index) => {
    const hunter = {
      id: uid('hunter'),
      name: names[index] || `Jeger ${index + 1}`,
      player: players[index] || "",
      age: [19, 31, 27, 34][index] || 24,
      archetypeId: a.id,
      role: a.name,
      roleText: a.roleText,
      portrait: a.portrait || `assets/portraits/jeger_0${index + 1}.png`,
      stats: { ...a.stats },
      skills: calculateSkills(a.stats),
      breath: a.stats.hel,
      equipment: [...(a.equipment || [])],
      note: "Testjeger for første MVP.",
      status: "alive",
      conditions: [],
      xp: {},
      createdAt: nowStamp()
    };
    state.hunters.push(hunter);
  });
  addLog("Fire skygger rundt bålet", "Fire jegere er klare. De bærer ulike hender, ulike feil og ulike håp. Nå kan stammen sendes mot moreneryggen og se om reglene holder når reinen løfter hodet.");
  unlockMilestoneIfNeeded('four_hunters');
  renderAll();
}

function renderHunterList() {
  const container = $('#hunterList');
  if (!state.hunters.length) {
    container.innerHTML = '<p class="muted">Ingen jegere ennå. Lag en jeger, eller trykk «Legg inn fire testjegere».</p>';
    return;
  }
  container.innerHTML = state.hunters.map(h => {
    const dead = h.status === 'dead';
    const topSkills = Object.entries(h.skills || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id, val]) => `${skillName(id)} ${val}`);
    return `<div class="hunterCard ${dead ? 'is-dead' : ''}">
      <img class="hunterPortrait" src="${escapeHtml(h.portrait)}" alt="Portrett av ${escapeHtml(h.name)}" onerror="this.onerror=null; this.src='assets/portraits/portrait-placeholder.svg';" />
      <div>
        <h4>${escapeHtml(h.name)} ${dead ? '†' : ''}</h4>
        <div class="hunterMeta">${escapeHtml(h.role)} · ${h.age} år${h.player ? ` · ${escapeHtml(h.player)}` : ''}</div>
        <div class="pillList">
          <span class="pill neutral">Pust ${h.breath}</span>
          ${topSkills.map(s => `<span class="pill">${escapeHtml(s)}</span>`).join('')}
          ${(h.conditions || []).map(c => `<span class="pill bad">${escapeHtml(c)}</span>`).join('')}
        </div>
        <div class="buttonRow">
          <button class="small" onclick="printHunterSheet('${h.id}')">Karakterark / PDF</button>
          <button class="small" onclick="editHunter('${h.id}')">Rediger</button>
          <button class="small danger" onclick="deleteHunter('${h.id}')">Slett</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function skillName(id) {
  return SKILL_DEFINITIONS.find(s => s.id === id)?.name || id;
}

window.printHunterSheet = function(hunterId, previewOnly = false, overrideHunter = null) {
  const hunter = overrideHunter || state.hunters.find(h => h.id === hunterId);
  if (!hunter) return;
  const statsRows = Object.entries(hunter.stats).map(([id, value]) => `<tr><th>${HUNTER_STAT_LABELS[id] || id.toUpperCase()}</th><td>${value}</td></tr>`).join('');
  const skillRows = SKILL_DEFINITIONS.map(s => `<tr><th>${s.name}</th><td>${hunter.skills[s.id] || 0}</td><td>${s.formula}</td></tr>`).join('');
  const equipment = (hunter.equipment || []).map(e => `<li>${escapeHtml(e)}</li>`).join('') || '<li>Ingen registrert</li>';
  const tokens = Array.from({ length: hunter.breath || hunter.stats.hel || 0 }, () => '<span class="breathToken"></span>').join('');
  $('#printArea').innerHTML = `
    <article class="sheet">
      <div class="sheetHeader">
        <img class="sheetPortrait" src="${escapeHtml(hunter.portrait)}" onerror="this.onerror=null; this.src='assets/portraits/portrait-placeholder.svg';" alt="Portrett" />
        <div>
          <h1>${escapeHtml(hunter.name)}</h1>
          <p><strong>Rolle:</strong> ${escapeHtml(hunter.role)} · <strong>Alder:</strong> ${hunter.age} · <strong>Spiller:</strong> ${escapeHtml(hunter.player || '')}</p>
          <p>${escapeHtml(hunter.roleText || '')}</p>
          <p><strong>Portrettfil:</strong> ${escapeHtml(hunter.portrait)}</p>
        </div>
      </div>
      <div class="sheetGrid">
        <section>
          <h2>Egenskaper</h2>
          <table class="sheetTable"><tbody>${statsRows}</tbody></table>
          <h2>Pust-tokens</h2>
          <div class="tokenRow">${tokens}</div>
          <p>Fjern én token når jegeren presser kroppen. Pust = HEL i MVP.</p>
        </section>
        <section>
          <h2>Ferdigheter</h2>
          <table class="sheetTable"><thead><tr><th>Ferdighet</th><th>Verdi</th><th>Default</th></tr></thead><tbody>${skillRows}</tbody></table>
        </section>
      </div>
      <section>
        <h2>Utstyr</h2>
        <ul>${equipment}</ul>
      </section>
      <section>
        <h2>Tilstander / stat cards</h2>
        <div class="sheetNote">${escapeHtml((hunter.conditions || []).join(', ') || 'Ingen')}</div>
      </section>
      <section>
        <h2>Bakgrunn og notater</h2>
        <div class="sheetNote">${escapeHtml(hunter.note || 'Skriv videre etter første jakt.')}</div>
      </section>
      <section>
        <h2>Terningkjerne</h2>
        <p>Rull 2D6 + relevant ferdighet mot vanskelighetsgrad. 9 svært lett, 12 normal, 14 vanskelig, 16 svært vanskelig.</p>
      </section>
    </article>`;
  if (!previewOnly) window.print();
  else {
    const proceed = confirm('Karakterarket er klart. Vil du åpne utskrift nå? Velg «Lagre som PDF» i utskriftsdialogen for PDF.');
    if (proceed) window.print();
  }
};

window.editHunter = function(id) {
  const hunter = state.hunters.find(h => h.id === id);
  if (!hunter) return;
  const name = prompt("Nytt navn", hunter.name);
  if (name === null) return;
  hunter.name = name.trim() || hunter.name;
  const condition = prompt("Legg til / overskriv tilstander, separert med komma", (hunter.conditions || []).join(', '));
  if (condition !== null) hunter.conditions = splitList(condition);
  hunter.skills = calculateSkills(hunter.stats);
  addLog("Jeger endret", `${hunter.name} blir skrevet inn på nytt i stammens hukommelse. Noen endringer er små. Andre merker man først neste gang spydet løftes.`);
  renderAll();
};

window.deleteHunter = function(id) {
  const hunter = state.hunters.find(h => h.id === id);
  if (!hunter) return;
  if (!confirm(`Slette ${hunter.name}?`)) return;
  state.hunters = state.hunters.filter(h => h.id !== id);
  addLog("En jeger fjernes fra prototypen", `${hunter.name} tas ut av appen. I en senere versjon bør dette kanskje være pensjon, død eller flytting – ikke bare sletting.`);
  renderAll();
};

function renderHuntResources() {
  const container = $('#huntResources');
  const core = ['kjott', 'skinn', 'bein', 'sener', 'gevir', 'fett', 'flint', 'treverk', 'urter', 'andegaver'];
  container.innerHTML = core.map(id => {
    const meta = resourceMeta(id);
    return `<label>${escapeHtml(meta.icon || '')} ${escapeHtml(meta.name)}
      <input class="huntResourceInput" data-resource="${id}" type="number" min="0" value="0" />
    </label>`;
  }).join('');
  $('#huntScenario').addEventListener('change', prefillScenarioResources);
  prefillScenarioResources();
}

function prefillScenarioResources() {
  const scenario = data.scenarios.find(s => s.id === $('#huntScenario').value) || data.scenarios[0];
  if (!scenario) return;
  $$('.huntResourceInput').forEach(input => {
    input.value = scenario.defaultResources?.[input.dataset.resource] || 0;
  });
}

function renderHuntParticipants() {
  const living = state.hunters.filter(h => h.status !== 'dead');
  $('#huntParticipants').innerHTML = living.length ? living.map(h => `<label class="checkCard"><input type="checkbox" class="participantCheck" value="${h.id}" checked /> ${escapeHtml(h.name)} <span class="muted">${escapeHtml(h.role)}</span></label>`).join('') : '<p class="muted">Lag minst én jeger først.</p>';
  renderParticipantStatus();
  $$('.participantCheck').forEach(input => input.addEventListener('change', renderParticipantStatus));
}

function renderParticipantStatus() {
  const ids = $$('.participantCheck').filter(input => input.checked).map(input => input.value);
  $('#participantStatus').innerHTML = ids.map(id => {
    const hunter = state.hunters.find(h => h.id === id);
    if (!hunter) return '';
    return `<div class="statusRow">
      <strong>${escapeHtml(hunter.name)}</strong>
      <select class="hunterStatusSelect" data-hunter-id="${hunter.id}">
        <option value="ok">Kom hjem i orden</option>
        <option value="exhausted">Utmattet</option>
        <option value="light_injury">Lett skadet</option>
        <option value="serious_injury">Alvorlig skadet</option>
        <option value="dead">Død</option>
      </select>
    </div>`;
  }).join('') || '<p class="muted">Velg deltakere over.</p>';
}

function handleHuntSubmit(event) {
  event.preventDefault();
  const participantIds = $$('.participantCheck').filter(input => input.checked).map(input => input.value);
  if (!participantIds.length) {
    alert('Velg minst én deltaker.');
    return;
  }
  const resources = {};
  $$('.huntResourceInput').forEach(input => resources[input.dataset.resource] = Math.max(0, Number(input.value) || 0));
  const statuses = {};
  $$('.hunterStatusSelect').forEach(select => statuses[select.dataset.hunterId] = select.value);
  const scenario = data.scenarios.find(s => s.id === $('#huntScenario').value) || data.scenarios[0];
  const hunt = {
    id: uid('hunt'),
    date: nowStamp(),
    scenarioId: scenario?.id,
    scenarioName: scenario?.name || 'Ukjent scenario',
    outcome: $('#huntOutcome').value,
    participantIds,
    animalsFelled: Math.max(0, Number($('#huntAnimals').value) || 0),
    animalsFled: Math.max(0, Number($('#huntFled').value) || 0),
    leftBehind: Math.max(0, Number($('#huntLeftBehind').value) || 0),
    resources,
    statuses,
    notes: $('#huntNotes').value.trim()
  };
  applyHunt(hunt);
}

function applyHunt(hunt) {
  state.hunts.push(hunt);
  for (const [id, amount] of Object.entries(hunt.resources)) {
    state.tribe.resources[id] = (state.tribe.resources[id] || 0) + amount;
  }

  const dead = [];
  const injured = [];
  const exhausted = [];
  for (const [hunterId, status] of Object.entries(hunt.statuses)) {
    const hunter = state.hunters.find(h => h.id === hunterId);
    if (!hunter) continue;
    if (status === 'dead') {
      hunter.status = 'dead';
      hunter.conditions = [...new Set([...(hunter.conditions || []), 'Død'])];
      dead.push(hunter.name);
    } else if (status === 'serious_injury') {
      hunter.conditions = [...new Set([...(hunter.conditions || []), 'Alvorlig skadet'])];
      injured.push(hunter.name);
    } else if (status === 'light_injury') {
      hunter.conditions = [...new Set([...(hunter.conditions || []), 'Skadet'])];
      injured.push(hunter.name);
    } else if (status === 'exhausted') {
      hunter.conditions = [...new Set([...(hunter.conditions || []), 'Utmattet'])];
      exhausted.push(hunter.name);
    }
  }

  const totalMeat = hunt.resources.kjott || 0;
  const success = hunt.outcome === 'success' || hunt.outcome === 'costly';
  if (success) adjustStats({ mat: totalMeat >= 4 ? 1 : 0, samhold: dead.length ? -1 : 1, fare: hunt.leftBehind >= 4 ? 1 : 0 });
  if (hunt.outcome === 'failed') adjustStats({ mat: -1, samhold: -1, fare: 1 });
  if (hunt.outcome === 'costly') adjustStats({ samhold: -1, andskraft: -1 });
  if (injured.length) adjustStats({ trygghet: -1 });
  if (dead.length) adjustStats({ samhold: -1, andskraft: -1 });

  const narrative = generateHuntNarrative(hunt, { dead, injured, exhausted });
  addLog(`Jakt: ${hunt.scenarioName}`, narrative, 'hunt');

  const triggerKeys = collectHuntTriggers(hunt, { dead, injured });
  const eventCards = triggerKeys.map(key => triggerEvent(key, { hunt, dead, injured })).filter(Boolean);
  checkAutomaticMilestones();
  renderHuntOutput(narrative, eventCards);
  renderAll();
  $('#huntForm').reset();
  populateStaticControls();
  showView('hunt');
}

function generateHuntNarrative(hunt, context) {
  const participants = hunt.participantIds.map(id => state.hunters.find(h => h.id === id)?.name).filter(Boolean);
  const brought = Object.entries(hunt.resources).filter(([, amount]) => amount > 0).map(([id, amount]) => `${amount} ${resourceMeta(id).name.toLowerCase()}`);
  const opener = hunt.outcome === 'failed'
    ? `Jaktlaget kom tilbake fra ${hunt.scenarioName} med lave skuldre og blikk som søkte bakken.`
    : hunt.outcome === 'costly'
      ? `Jaktlaget kom tilbake fra ${hunt.scenarioName} med bytte, men ingen ropte seiersrop før alle var talt.`
      : `Jaktlaget kom tilbake fra ${hunt.scenarioName} mens røyk fra leiren la seg lavt mellom steinene.`;
  const people = participants.length ? ` ${participants.join(', ')} hadde gått ut sammen.` : '';
  const animals = hunt.animalsFelled > 0 ? ` ${hunt.animalsFelled} dyr ble felt, og ${hunt.animalsFled} forsvant videre over landet.` : ` Ingen dyr falt, og ${hunt.animalsFled} forsvant med vinden.`;
  const resources = brought.length ? ` De bar med seg ${brought.join(', ')}.` : ` De bar nesten ingenting hjem.`;
  const loss = context.dead.length ? ` Men ved opptellingen manglet ${context.dead.join(', ')}.` : '';
  const hurt = context.injured.length ? ` ${context.injured.join(', ')} kom hjem med blod, stiv gange eller smerte de forsøkte å skjule.` : '';
  const tired = context.exhausted.length ? ` ${context.exhausted.join(', ')} satte seg uten å ta av seg utstyret først.` : '';
  const left = hunt.leftBehind ? ` Bak dem lå ${hunt.leftBehind} deler igjen i terrenget, og landskapet fikk sin andel.` : '';
  const notes = hunt.notes ? ` Rundt bålet ble dette husket: ${hunt.notes}` : '';
  return `${opener}${people}${animals}${resources}${loss}${hurt}${tired}${left}${notes}`;
}

function collectHuntTriggers(hunt, { dead, injured }) {
  const triggers = [];
  unlockMilestoneIfNeeded('first_hunt_logged');
  if ((hunt.outcome === 'success' || hunt.outcome === 'costly') && !state.milestones.first_success) triggers.push('first_success');
  if (hunt.outcome === 'failed' && !state.milestones.first_failed) triggers.push('first_failed');
  if (dead.length) triggers.push('hunter_dead');
  if (injured.length) triggers.push('hunter_injured');
  if ((hunt.resources.kjott || 0) >= 8 || hunt.animalsFelled >= 2) triggers.push('good_catch');
  if ((hunt.resources.kjott || 0) >= 6 || hunt.leftBehind >= 4) triggers.push('smell_slaughter');
  if (hunt.notes.toLowerCase().includes('vind')) triggers.push('wind_trouble');
  if (state.tribe.stats.mat <= 2) triggers.push('low_food');
  return [...new Set(triggers)];
}

function renderHuntOutput(narrative, events) {
  const output = $('#huntOutput');
  output.classList.remove('hidden');
  output.innerHTML = `
    <h3 class="storyTitle">Fortellingen etter jakten</h3>
    <p class="storyText">${escapeHtml(narrative)}</p>
    ${events.length ? `<h3>Utløste hendelser</h3><div class="eventGrid">${events.map(eventCardHtml).join('')}</div>` : '<p class="muted">Ingen særskilte hendelser ble utløst denne gangen.</p>'}
  `;
}

function triggerEvent(triggerKey, context = {}) {
  const eventDef = data.events.find(e => e.triggerKey === triggerKey);
  if (!eventDef) return null;
  if (eventDef.oneTime && state.usedEvents[eventDef.id]) return null;
  state.usedEvents[eventDef.id] = (state.usedEvents[eventDef.id] || 0) + 1;
  unlockMilestoneByTrigger(triggerKey);
  addLog(eventDef.title, eventDef.story, 'event');
  return eventDef;
}

function eventCardHtml(eventDef) {
  const choices = (eventDef.choices || []).map((choice, index) => `<button class="eventChoice" onclick="chooseEvent('${eventDef.id}', ${index})"><strong>${escapeHtml(choice.label)}</strong><br><span>${escapeHtml(choice.text || '')}</span></button>`).join('');
  return `<div class="eventCard">
    <h4>${escapeHtml(eventDef.title)}</h4>
    <p>${escapeHtml(eventDef.story)}</p>
    ${eventDef.physicalCard ? `<p class="badge">Legg fysisk kort: ${escapeHtml(eventDef.physicalCard)}</p>` : ''}
    <div class="eventChoices">${choices}</div>
  </div>`;
}

window.chooseEvent = function(eventId, choiceIndex) {
  const eventDef = data.events.find(e => e.id === eventId);
  const choice = eventDef?.choices?.[choiceIndex];
  if (!eventDef || !choice) return;
  if (choice.cost && !hasResources(choice.cost)) {
    alert(`Stammen mangler ressurser: ${formatCosts(choice.cost)}`);
    return;
  }
  if (choice.cost) spendResources(choice.cost);
  if (choice.resourceEffects) addResources(choice.resourceEffects);
  if (choice.effects) adjustStats(choice.effects);
  addLog(`${eventDef.title}: ${choice.label}`, `${choice.text || ''} ${describeEffects(choice.effects, choice.resourceEffects)}`, 'choice');
  renderAll();
  $('#huntOutput').classList.add('hidden');
};

function renderAllocationActions() {
  const actions = data.resourceConfig.allocations || [];
  $('#allocationActions').innerHTML = actions.length ? actions.map(action => `
    <div class="actionCard">
      <h4>${escapeHtml(action.name)}</h4>
      <p>${escapeHtml(action.summary)}</p>
      <div class="costLine"><strong>Kostnad:</strong> ${formatCosts(action.cost)}${action.produce ? ` · <strong>Gir:</strong> ${formatCosts(action.produce)}` : ''}</div>
      <div class="costLine"><strong>Effekt:</strong> ${formatEffects(action.effects)}</div>
      ${action.physicalCard ? `<div class="badge">Fysisk kort: ${escapeHtml(action.physicalCard)}</div>` : ''}
      <label>Antall ganger
        <input type="number" min="1" value="1" id="qty_${escapeHtml(action.id)}" />
      </label>
      <button onclick="applyAllocation('${escapeHtml(action.id)}')">Utfør handling</button>
    </div>
  `).join('') : '<p class="muted">Ingen handlinger er definert.</p>';
}

window.applyAllocation = function(actionId) {
  const action = data.resourceConfig.allocations.find(a => a.id === actionId);
  if (!action) return;
  const qty = Math.max(1, Number($(`#qty_${actionId}`).value) || 1);
  const totalCost = multiplyMap(action.cost || {}, qty);
  if (!hasResources(totalCost)) {
    alert(`Stammen mangler ressurser: ${formatCosts(totalCost)}`);
    return;
  }
  spendResources(totalCost);
  if (action.produce) addResources(multiplyMap(action.produce, qty));
  if (action.effects) adjustStats(multiplyMap(action.effects, qty));
  if (action.bonusAt && qty >= action.bonusAt && action.bonusEffects) adjustStats(action.bonusEffects);
  if (action.milestone) unlockMilestoneIfNeeded(action.milestone);
  unlockMilestoneIfNeeded('first_resource_allocation');
  addLog(action.name, `${action.story} ${qty > 1 ? `(Utført ${qty} ganger.)` : ''}`, 'allocation');
  triggerResourceEvents(action);
  renderAll();
};

function triggerResourceEvents(action) {
  if (state.tribe.stats.mat <= 2) triggerEvent('low_food');
}

function applyQuickFood() {
  const action = data.resourceConfig.allocations.find(a => a.id === 'feed_clan');
  if (!action) return;
  const qtyInput = document.querySelector('#qty_feed_clan');
  if (qtyInput) qtyInput.value = 2;
  window.applyAllocation('feed_clan');
}

function handleManualResource(event) {
  event.preventDefault();
  const id = $('#manualResourceSelect').value;
  const amount = Number($('#manualResourceAmount').value) || 0;
  const reason = $('#manualResourceReason').value.trim();
  state.tribe.resources[id] = Math.max(0, (state.tribe.resources[id] || 0) + amount);
  addLog("Ressurslager justert", `${amount >= 0 ? 'Stammen får' : 'Stammen mister'} ${Math.abs(amount)} ${resourceMeta(id).name.toLowerCase()}. ${reason || 'Ingen begrunnelse skrevet.'}`);
  renderAll();
}

function hasResources(cost = {}) {
  return Object.entries(cost).every(([id, amount]) => (state.tribe.resources[id] || 0) >= amount);
}

function spendResources(cost = {}) {
  for (const [id, amount] of Object.entries(cost)) state.tribe.resources[id] = Math.max(0, (state.tribe.resources[id] || 0) - amount);
}

function addResources(map = {}) {
  for (const [id, amount] of Object.entries(map)) state.tribe.resources[id] = (state.tribe.resources[id] || 0) + amount;
}

function adjustStats(effects = {}) {
  for (const [id, amount] of Object.entries(effects)) {
    state.tribe.stats[id] = clamp((state.tribe.stats[id] || 0) + amount, 0, 10);
  }
}

function multiplyMap(map = {}, qty = 1) {
  return Object.fromEntries(Object.entries(map).map(([id, amount]) => [id, amount * qty]));
}

function formatCosts(cost = {}) {
  const entries = Object.entries(cost || {});
  if (!entries.length) return 'ingen';
  return entries.map(([id, amount]) => `${amount} ${resourceMeta(id).name.toLowerCase()}`).join(', ');
}

function formatEffects(effects = {}) {
  const entries = Object.entries(effects || {});
  if (!entries.length) return 'ingen direkte effekt';
  return entries.map(([id, amount]) => `${amount > 0 ? '+' : ''}${amount} ${STAT_LABELS[id] || id}`).join(', ');
}

function describeEffects(effects = {}, resourceEffects = {}) {
  const parts = [];
  if (effects && Object.keys(effects).length) parts.push(`Stammeeffekt: ${formatEffects(effects)}.`);
  if (resourceEffects && Object.keys(resourceEffects).length) parts.push(`Ressurser: ${formatCosts(resourceEffects)}.`);
  return parts.join(' ');
}

function addLog(title, text, type = 'story') {
  state.log.unshift({ id: uid('log'), date: nowStamp(), title, text: String(text || '').trim(), type });
  unlockMilestoneIfNeeded('clan_memory');
  saveState();
}

function unlockMilestoneByTrigger(triggerKey) {
  const milestones = MILESTONES.filter(m => m.triggerKey === triggerKey);
  milestones.forEach(m => unlockMilestoneIfNeeded(m.id));
}

function unlockMilestoneIfNeeded(id) {
  if (state.milestones[id]) return false;
  state.milestones[id] = { complete: true, date: nowStamp(), manual: false };
  return true;
}

function checkAutomaticMilestones(shouldSave = true) {
  if (state.hunts.length >= 1) unlockMilestoneIfNeeded('first_hunt_logged');
  if (state.hunts.some(h => h.outcome === 'success' || h.outcome === 'costly')) unlockMilestoneIfNeeded('first_success');
  if (state.hunts.some(h => h.outcome === 'failed')) unlockMilestoneIfNeeded('first_failed');
  if (state.hunters.some(h => (h.conditions || []).some(c => c.toLowerCase().includes('skadet')))) unlockMilestoneIfNeeded('first_injury');
  if (state.hunters.some(h => h.status === 'dead')) unlockMilestoneIfNeeded('first_death');
  if (state.hunts.some(h => (h.resources?.kjott || 0) >= 8 || h.animalsFelled >= 2)) unlockMilestoneIfNeeded('good_catch');
  if (state.hunters.filter(h => h.status !== 'dead').length >= 4) unlockMilestoneIfNeeded('four_hunters');
  if (state.tribe.stats.mat <= 2) unlockMilestoneIfNeeded('low_food_warning');
  if (state.log.length >= 5) unlockMilestoneIfNeeded('clan_memory');
  if (shouldSave) saveState();
}

function renderMilestones() {
  $('#milestoneList').innerHTML = MILESTONES.map(m => {
    const complete = Boolean(state.milestones[m.id]?.complete);
    return `<div class="milestoneRow ${complete ? 'is-complete' : ''}">
      <div class="milestoneIcon">${complete ? '✓' : '○'}</div>
      <div>
        <h4>${escapeHtml(m.title)}</h4>
        <p>${escapeHtml(m.criteria)}${complete ? ` · Fullført ${formatDate(state.milestones[m.id].date)}` : ''}</p>
      </div>
      <button class="small" onclick="toggleMilestone('${m.id}')">${complete ? 'Angre' : 'Marker'}</button>
    </div>`;
  }).join('');
}

window.toggleMilestone = function(id) {
  if (state.milestones[id]) delete state.milestones[id];
  else state.milestones[id] = { complete: true, date: nowStamp(), manual: true };
  renderAll();
};

function renderStoryLog() {
  $('#storyLog').innerHTML = state.log.length ? state.log.map(entry => `
    <article class="logEntry">
      <time>${formatDate(entry.date)}</time>
      <h4>${escapeHtml(entry.title)}</h4>
      <p>${escapeHtml(entry.text)}</p>
    </article>
  `).join('') : '<p class="muted">Fortellingsloggen er tom.</p>';
}

function clearStoryLog() {
  if (!confirm('Tømme fortellingsloggen? Dette sletter ikke jegere, ressurser eller milepæler.')) return;
  state.log = [];
  renderAll();
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `etter-isen-kampanje-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

function importState() {
  const file = $('#importStateInput').files[0];
  if (!file) { alert('Velg en JSON-fil først.'); return; }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      state = migrateState(imported);
      saveState();
      renderAll();
      alert('Kampanjedata importert.');
    } catch (error) {
      alert('Kunne ikke importere JSON-filen.');
      console.error(error);
    }
  };
  reader.readAsText(file);
}

function resetAll() {
  const answer = prompt('Skriv SLETT for å nullstille all lokal lagring.');
  if (answer !== 'SLETT') return;
  state = createDefaultState();
  saveState();
  renderAll();
}

init();
