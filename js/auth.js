// MOVE Informe — Authentication & Admin

function setPhoto(e, type){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    if(type === 'prof'){
      profPhoto = ev.target.result;
      document.getElementById('prevProf').src = ev.target.result;
      document.getElementById('photoProf').classList.add('loaded');
    }
  };
  reader.readAsDataURL(file);
}


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

function selectProf(dni){
  const p = PROFESSIONALS.find(x=>x.dni===dni);
  if(!p) return;
  selectedProf = p;
  const photo = getPhoto(p.dni);
  const av = photo ? `<img src="${photo}" alt="">` : initials(p.name);
  document.getElementById('dniAvatar').innerHTML = av;
  document.getElementById('dniName').textContent = p.name;
  document.getElementById('dniInput').value = '';
  document.getElementById('dniErr').textContent = '';
  document.getElementById('dniModal').classList.add('open');
  setTimeout(()=>document.getElementById('dniInput').focus(), 120);
}

function closeDniModal(){
  document.getElementById('dniModal').classList.remove('open');
  selectedProf = null;
}

function tryLogin(){
  if(!selectedProf) return;
  const dni = document.getElementById('dniInput').value.trim();
  if(dni === selectedProf.dni){
    currentUser = selectedProf;
    closeDniModal();
    applyLogin();
  } else {
    const inp = document.getElementById('dniInput');
    inp.classList.add('err');
    document.getElementById('dniErr').textContent = 'DNI incorrecto. Intentá de nuevo.';
    setTimeout(()=>{ inp.classList.remove('err'); inp.value=''; }, 380);
  }
}

function applyLogin(){
  document.getElementById('pProf').value = currentUser.prof;
  const photo = getPhoto(currentUser.dni);
  if(photo){
    profPhoto = photo;
    document.getElementById('prevProf').src = photo;
    document.getElementById('photoProf').classList.add('loaded');
  }
  updateTopbarUser();
  document.getElementById('loginView').classList.remove('active');
  document.getElementById('uploadView').classList.add('active');
  if(currentUser.admin) renderAdminList();
}

function updateTopbarUser(){
  const area = document.getElementById('topUserArea');
  if(!currentUser){ area.innerHTML=''; return; }
  const photo = getPhoto(currentUser.dni);
  const av = photo ? `<img src="${photo}" alt="">` : initials(currentUser.name);
  area.innerHTML = `
    <div class="user-chip" ${currentUser.admin?'onclick="toggleAdminPanel()" title="Gestionar Equipo MOVE"':''}>
      <div class="uc-avatar">${av}</div>
      <div class="uc-name">${currentUser.name.split(' ')[0]}</div>
      ${currentUser.admin?'<span style="font-size:9px;color:#00c853">⚙</span>':''}
    </div>
    <button class="logout-btn" onclick="logout()" title="Cerrar sesión">✕</button>`;
}

function logout(){
  currentUser = null; selectedProf = null;
  profPhoto = null; uploadedImages = []; renderImgCards();
  document.getElementById('pProf').value = '';
  const pp = document.getElementById('prevProf');
  if(pp){ pp.src=''; document.getElementById('photoProf').classList.remove('loaded'); }
  document.getElementById('topUserArea').innerHTML = '';
  closeAdminPanel();
  document.getElementById('uploadView').classList.remove('active');
  document.getElementById('reportView').classList.remove('active');
  document.getElementById('loginView').classList.add('active');
  initLogin();
}

/* ===== ADMIN PANEL ===== */
function toggleAdminPanel(){ document.getElementById('adminPanel').classList.toggle('open') }
function closeAdminPanel(){ document.getElementById('adminPanel').classList.remove('open') }

function renderAdminList(){
  document.getElementById('adminList').innerHTML = PROFESSIONALS.map(p => {
    const photo = getPhoto(p.dni);
    const av = photo ? `<img src="${photo}" alt="">` : initials(p.name);
    return `<div class="admin-item" id="adm_${p.dni}">
      <div class="admin-avatar" id="admAv_${p.dni}">${av}</div>
      <div>
        <div class="admin-iname">${p.name}</div>
        <div class="admin-idni">DNI ${p.dni}${p.admin?' · ADMIN':''}</div>
      </div>
      <label class="admin-upload-btn">Foto<input type="file" accept="image/*" onchange="uploadProfPhoto(event,'${p.dni}')"></label>
    </div>`;
  }).join('');
}

function uploadProfPhoto(e, dni){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const url = ev.target.result;
    localStorage.setItem(`prof_photo_${dni}`, url);
    const admAv = document.getElementById(`admAv_${dni}`);
    if(admAv) admAv.innerHTML = `<img src="${url}" alt="">`;
    if(currentUser && currentUser.dni === dni){
      profPhoto = url;
      document.getElementById('prevProf').src = url;
      document.getElementById('photoProf').classList.add('loaded');
      updateTopbarUser();
    }
    initLogin();
  };
  reader.readAsDataURL(file);
}

document.getElementById('dniInput').addEventListener('keydown', e=>{ if(e.key==='Enter') tryLogin(); });
