// MOVE Informe — Multi-Image Upload & Generate

/* ===== MULTI-IMAGE UPLOAD ===== */
const MUSCLE_LABELS = {
  QUAD:'Cuádriceps', HAM:'Isquiotibiales', EXT_ROT:'Rot. Externa',
  INT_ROT:'Rot. Interna', ROW:'Remo Isométrico', MTP:'Mid Thigh Push', OTRO:'Otro'
};

function multiOver(e){e.preventDefault();document.getElementById('multiDrop').classList.add('over')}
function multiLeave(e){document.getElementById('multiDrop').classList.remove('over')}
function multiDropFn(e){e.preventDefault();multiLeave(e);Array.from(e.dataTransfer.files).forEach(addImage)}
function onMultiFile(e){Array.from(e.target.files).forEach(addImage)}

function addImage(file){
  if(uploadedImages.length>=6)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    uploadedImages.push({dataURL:ev.target.result,base64:ev.target.result.split(',')[1],mime:file.type||'image/jpeg',muscleKey:null,muscleLabel:'...',side:null});
    renderImgCards();
  };
  reader.readAsDataURL(file);
}

function removeImage(i){uploadedImages.splice(i,1);renderImgCards()}

function renderImgCards(){
  const grid=document.getElementById('imgCards');
  const btn=document.getElementById('genBtn');
  if(!uploadedImages.length){grid.innerHTML='';btn.style.display='none';return}
  grid.innerHTML=uploadedImages.map((img,i)=>{
    const muscleHtml=img.muscleLabel&&img.muscleLabel!=='...'
      ?`<div class="img-card-muscle">${img.muscleLabel}</div><div class="img-card-side">${img.side==='R'?'Derecho':img.side==='L'?'Izquierdo':'Detectando...'}</div>`
      :`<div class="img-card-muscle" style="color:#555">Procesando...</div>`;
    return `<div class="img-card ${img.muscleLabel==='...'?'loading':''}">
      <span class="img-card-remove" onclick="removeImage(${i})">×</span>
      <img src="${img.dataURL}">
      <div class="img-card-info">${muscleHtml}</div>
    </div>`;
  }).join('');
  btn.style.display=uploadedImages.length>=2?'flex':'none';
}

/* ===== GENERATE ===== */
async function generate(){
  const err=document.getElementById('errMsg');
  err.className='err-msg';
  if(uploadedImages.length<2){err.textContent='Cargá al menos 2 capturas de Valkyria.';err.className='err-msg show';return}
  showOverlay(`La IA está analizando ${uploadedImages.length} capturas de Valkyria...
Esto tarda 10-20 segundos.`);
  document.getElementById('genBtn').disabled=true;
  try{
    const patient={
      name:document.getElementById('pName').value||'Sin especificar',
      sport:document.getElementById('pSport').value||'—',
      muscle:document.getElementById('pMuscle').value||'',
      injury:document.getElementById('pInjury').value||'',
      prof:document.getElementById('pProf').value||'Lic. Lezcano, E.',
      profPhoto:profPhoto,
    };
    const data=await extractWithClaude(GROQ_KEY,uploadedImages,patient);
    // Update card labels with detected info
    if(data.resultados){
      data.resultados.forEach((r,i)=>{
        if(uploadedImages[i]){
          uploadedImages[i].muscleKey=r.musculo_key;
          uploadedImages[i].muscleLabel=MUSCLE_LABELS[r.musculo_key]||r.musculo_label||'Otro';
          uploadedImages[i].side=r.lado;
        }
      });
      renderImgCards();
    }
    buildReport(data,patient);
    hideOverlay();
    showReport();
  }catch(e){
    hideOverlay();
    document.getElementById('genBtn').disabled=false;
    err.textContent=e.message||'Error al conectar con la API.';
    err.className='err-msg show';
  }
}
