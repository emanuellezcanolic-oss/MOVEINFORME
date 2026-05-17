// MOVE Informe — Utilities

document.getElementById('topDate').textContent =
  new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'long',year:'numeric'});
document.getElementById('topbarLogo').src = MOVE_LOGO_SRC;
document.getElementById('loginLogo').src = MOVE_LOGO_SRC;

function def(a,b){if(!a||!b)return null;return+((Math.max(a,b)-Math.min(a,b))/Math.max(a,b)*100).toFixed(1)}
function n(v){if(v===null||v===undefined||isNaN(v))return'—';return Number(v).toFixed(1)}

/* ===== OVERLAY ===== */
function showOverlay(msg){document.getElementById('overlay').classList.add('active');document.getElementById('overlay-sub').textContent=msg}
function hideOverlay(){document.getElementById('overlay').classList.remove('active')}

/* ===== VIEWS ===== */
function showReport(){document.getElementById('uploadView').classList.remove('active');document.getElementById('reportView').classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function goBack(){document.getElementById('reportView').classList.remove('active');document.getElementById('uploadView').classList.add('active');document.getElementById('genBtn').disabled=false;window.scrollTo({top:0,behavior:'smooth'})}

/* ===== LOGIN SYSTEM ===== */
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}

function initLogin(){
  const grid = document.getElementById('profGrid');
  grid.innerHTML = PROFESSIONALS.map(p => {
    const photo = getPhoto(p.dni);
    const av = photo ? `<img src="${photo}" alt="">` : initials(p.name);
    return `<div class="prof-card ${p.admin?'admin-card':''}" onclick="selectProf('${p.dni}')">
      <div class="prof-avatar">${av}</div>
      <div class="prof-name">${p.name}</div>
      <div class="prof-role">The Move Club</div>
    </div>`;
  }).join('');
}

function n(v){if(v===null||v===undefined||isNaN(v))return'—';return Number(v).toFixed(1)}

/* ===== OVERLAY ===== */
function showOverlay(msg){document.getElementById('overlay').classList.add('active');document.getElementById('overlay-sub').textContent=msg}
function hideOverlay(){document.getElementById('overlay').classList.remove('active')}

/* ===== VIEWS ===== */
function showReport(){document.getElementById('uploadView').classList.remove('active');document.getElementById('reportView').classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function goBack(){document.getElementById('reportView').classList.remove('active');document.getElementById('uploadView').classList.add('active');document.getElementById('genBtn').disabled=false;window.scrollTo({top:0,behavior:'smooth'})}

/* ===== LOGIN SYSTEM ===== */
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}

function initLogin(){
  const grid = document.getElementById('profGrid');
  grid.innerHTML = PROFESSIONALS.map(p => {
    const photo = getPhoto(p.dni);
    const av = photo ? `<img src="${photo}" alt="">` : initials(p.name);
    return `<div class="prof-card ${p.admin?'admin-card':''}" onclick="selectProf('${p.dni}')">
      <div class="prof-avatar">${av}</div>
      <div class="prof-name">${p.name}</div>
      <div class="prof-role">The Move Club</div>
    </div>`;
  }).join('');
}

function showOverlay(msg){document.getElementById('overlay').classList.add('active');document.getElementById('overlay-sub').textContent=msg}
function hideOverlay(){document.getElementById('overlay').classList.remove('active')}

/* ===== VIEWS ===== */
function showReport(){document.getElementById('uploadView').classList.remove('active');document.getElementById('reportView').classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function goBack(){document.getElementById('reportView').classList.remove('active');document.getElementById('uploadView').classList.add('active');document.getElementById('genBtn').disabled=false;window.scrollTo({top:0,behavior:'smooth'})}

/* ===== LOGIN SYSTEM ===== */
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}

function initLogin(){
  const grid = document.getElementById('profGrid');
  grid.innerHTML = PROFESSIONALS.map(p => {
    const photo = getPhoto(p.dni);
    const av = photo ? `<img src="${photo}" alt="">` : initials(p.name);
    return `<div class="prof-card ${p.admin?'admin-card':''}" onclick="selectProf('${p.dni}')">
      <div class="prof-avatar">${av}</div>
      <div class="prof-name">${p.name}</div>
      <div class="prof-role">The Move Club</div>
    </div>`;
  }).join('');
}

function hideOverlay(){document.getElementById('overlay').classList.remove('active')}

/* ===== VIEWS ===== */
function showReport(){document.getElementById('uploadView').classList.remove('active');document.getElementById('reportView').classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function goBack(){document.getElementById('reportView').classList.remove('active');document.getElementById('uploadView').classList.add('active');document.getElementById('genBtn').disabled=false;window.scrollTo({top:0,behavior:'smooth'})}

/* ===== LOGIN SYSTEM ===== */
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}

function initLogin(){
  const grid = document.getElementById('profGrid');
  grid.innerHTML = PROFESSIONALS.map(p => {
    const photo = getPhoto(p.dni);
    const av = photo ? `<img src="${photo}" alt="">` : initials(p.name);
    return `<div class="prof-card ${p.admin?'admin-card':''}" onclick="selectProf('${p.dni}')">
      <div class="prof-avatar">${av}</div>
      <div class="prof-name">${p.name}</div>
      <div class="prof-role">The Move Club</div>
    </div>`;
  }).join('');
}

function showReport(){document.getElementById('uploadView').classList.remove('active');document.getElementById('reportView').classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function goBack(){document.getElementById('reportView').classList.remove('active');document.getElementById('uploadView').classList.add('active');document.getElementById('genBtn').disabled=false;window.scrollTo({top:0,behavior:'smooth'})}

/* ===== LOGIN SYSTEM ===== */
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}

function initLogin(){
  const grid = document.getElementById('profGrid');
  grid.innerHTML = PROFESSIONALS.map(p => {
    const photo = getPhoto(p.dni);
    const av = photo ? `<img src="${photo}" alt="">` : initials(p.name);
    return `<div class="prof-card ${p.admin?'admin-card':''}" onclick="selectProf('${p.dni}')">
      <div class="prof-avatar">${av}</div>
      <div class="prof-name">${p.name}</div>
      <div class="prof-role">The Move Club</div>
    </div>`;
  }).join('');
}

function goBack(){document.getElementById('reportView').classList.remove('active');document.getElementById('uploadView').classList.add('active');document.getElementById('genBtn').disabled=false;window.scrollTo({top:0,behavior:'smooth'})}

/* ===== LOGIN SYSTEM ===== */
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}

function initLogin(){
  const grid = document.getElementById('profGrid');
  grid.innerHTML = PROFESSIONALS.map(p => {
    const photo = getPhoto(p.dni);
    const av = photo ? `<img src="${photo}" alt="">` : initials(p.name);
    return `<div class="prof-card ${p.admin?'admin-card':''}" onclick="selectProf('${p.dni}')">
      <div class="prof-avatar">${av}</div>
      <div class="prof-name">${p.name}</div>
      <div class="prof-role">The Move Club</div>
    </div>`;
  }).join('');
}

function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}

function initLogin(){
  const grid = document.getElementById('profGrid');
  grid.innerHTML = PROFESSIONALS.map(p => {
    const photo = getPhoto(p.dni);
    const av = photo ? `<img src="${photo}" alt="">` : initials(p.name);
    return `<div class="prof-card ${p.admin?'admin-card':''}" onclick="selectProf('${p.dni}')">
      <div class="prof-avatar">${av}</div>
      <div class="prof-name">${p.name}</div>
      <div class="prof-role">The Move Club</div>
    </div>`;
  }).join('');
}
