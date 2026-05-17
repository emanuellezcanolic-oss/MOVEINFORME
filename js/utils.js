// MOVE Informe — Utilities

document.getElementById('topDate').textContent =
  new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'long',year:'numeric'});
document.getElementById('topbarLogo').src = MOVE_LOGO_SRC;
document.getElementById('loginLogo').src = MOVE_LOGO_SRC;

/* ===== UTILS ===== */
function def(a,b){if(!a||!b)return null;return+((Math.max(a,b)-Math.min(a,b))/Math.max(a,b)*100).toFixed(1)}
function n(v){if(v===null||v===undefined||isNaN(v))return'—';return Number(v).toFixed(1)}

/* ===== OVERLAY ===== */
function showOverlay(msg){document.getElementById('overlay').classList.add('active');document.getElementById('overlay-sub').textContent=msg}
function hideOverlay(){document.getElementById('overlay').classList.remove('active')}

/* ===== VIEWS ===== */
function showReport(){document.getElementById('uploadView').classList.remove('active');document.getElementById('reportView').classList.add('active');window.scrollTo({top:0,behavior:'smooth'})}
function goBack(){document.getElementById('reportView').classList.remove('active');document.getElementById('uploadView').classList.add('active');document.getElementById('genBtn').disabled=false;window.scrollTo({top:0,behavior:'smooth'})}
