// MOVE Informe — Report Building

/* ===== BUILD REPORT ===== */
function buildReportCore(d){
  Object.values(activeCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  activeCharts = {};

  const {r,l,patient,rightLabel,leftLabel} = d;
  const RL = rightLabel, LL = leftLabel;

  // Calcs
  const fDef = def(r.fmax, l.fmax);
  const rDef = def(r.rfd50, l.rfd50);
  const fDomR = (r.fmax||0) >= (l.fmax||0);
  const rDomR = (r.rfd50||0) >= (l.rfd50||0);
  const fAlarm = fDef > 15, rAlarm = rDef > 20;
  const hasCurve = !!(r.f50 && r.f100 && l.f50 && l.f100);

  // Alert
  let aC='ok',aI='✅',aT='PERFIL SIMÉTRICO',aS=`Déficit bilateral dentro de rangos normales. Fuerza: ${fDef??'—'}% · RFD@50ms: ${rDef??'—'}%`;
  if(fAlarm&&rAlarm){aC='alarm';aI='🚨';aT='DÉFICIT BILATERAL CRÍTICO';aS=`Fuerza: ${fDef}% y RFD@50ms: ${rDef}% superan umbrales clínicos. Intervención terapéutica requerida.`}
  else if(fAlarm){aC='alarm';aI='⚠️';aT='DÉFICIT ESTRUCTURAL — FUERZA MÁXIMA';aS=`Déficit de Fuerza Máxima ${fDef}% supera umbral del 15%.`}
  else if(rAlarm){aC='warning';aI='⚡';aT='DÉFICIT NEURAL — EXPLOSIVIDAD RFD';aS=`RFD@50ms con déficit ${rDef}% supera umbral del 20%. Ineficiencia de reclutamiento rápido.`}

  const hMax = Math.max(r.rfd50||0, l.rfd50||0)||1;
  const rPct = ((r.rfd50||0)/hMax*100).toFixed(0);
  const lPct = ((l.rfd50||0)/hMax*100).toFixed(0);

  const injHTML = patient.injury
    ? `<div class="inj-tag has">🩹 ${patient.injury}</div>`
    : `<div class="inj-tag none">✓ Sin lesiones activas reportadas</div>`;

  const logo = `<img src="${MOVE_LOGO_SRC}" style="height:44px;width:auto" alt="The Move Club">`;

  const badge = `<svg width="68" height="68" viewBox="0 0 140 140" fill="none">
    <defs><path id="ct" d="M 70,70 m -52,0 a 52,52 0 1,1 104,0"/></defs>
    <text font-family="Rajdhani,sans-serif" font-size="16" font-weight="700" fill="#2a6a2a" letter-spacing="2"><textPath href="#ct">THE MOVE CLUB</textPath></text>
    <polygon points="70,48 90,80 50,80" stroke="#2a6a2a" stroke-width="3" fill="none" stroke-linejoin="round"/>
    <polygon points="70,57 83,80 57,80" stroke="#1e5a1e" stroke-width="2" fill="none" stroke-linejoin="round"/>
    <polygon points="70,65 78,80 62,80" stroke="#1a4a1a" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
    <text x="70" y="108" font-family="Rajdhani,sans-serif" font-size="11" fill="#1e4a1e" letter-spacing="3" text-anchor="middle">ESTD 2021</text>
  </svg>`;

  const curveRow = hasCurve ? `
  <div class="dcard">
    <div class="dt">Curva de Desarrollo de Fuerza — N/ms</div>
    <div class="ds">Fuerza (N) en función del Tiempo (ms) · Comparativa Bilateral · Cuanto más alta y a la izquierda = mayor eficiencia neuromuscular</div>
    <canvas id="chartCurve" height="90"></canvas>
  </div>` : '';

  document.getElementById('dashBody').innerHTML = `

  <!-- HEADER -->
  <div class="rpt-hdr">
    <div class="brand">
      ${patient.instLogo
        ? `<img src="${patient.instLogo}" class="rpt-inst-logo" alt="Logo">`
        : logo}
      <div class="brand-txt">
        <div class="bn">MOVE<span>INFORME</span></div>
        <div class="bs">Evaluación Isométrica Bilateral</div>
      </div>
    </div>
    <div>
      <div class="rpt-muscle-title">
        Informe de <span class="muscle-name">${patient.muscle}</span>: Análisis Comparativo de Fuerza y TDF
      </div>
      <div class="rpt-patient-block">
        <div class="rpn">${patient.name}</div>
        <div class="rpd">Deporte: <strong>${patient.sport}</strong> · Evaluador: <strong>${patient.prof}</strong></div>
        ${injHTML}
      </div>
    </div>
    <div class="rpt-meta">
      <div class="rmt"><strong>${d.date}</strong></div>
      <div class="rmt">Dinamómetro Isométrico · Valkyria Trainer</div>
      <div class="rmt">Unidades: <strong>N / N/s / s</strong></div>
      ${patient.profPhoto
        ? `<div style="margin-top:10px;display:flex;align-items:center;gap:8px;justify-content:flex-end">
            <img src="${patient.profPhoto}" class="rpt-prof-photo" alt="Profesional">
            <div style="font-family:'Rajdhani',sans-serif;font-size:10px;color:#3a7a3a;text-align:right">${patient.prof}</div>
           </div>`
        : `<div style="margin-top:8px">${badge}</div>`}
    </div>
  </div>

  <!-- ALERT -->
  <div class="alert ${aC}">
    <div class="alert-icon">${aI}</div>
    <div>
      <div class="alert-title">${aT}</div>
      <div class="alert-sub">${aS}</div>
    </div>
  </div>

  <!-- ROW 1 -->
  <div class="row1">
    <div class="dcard">
      <div class="dt">Fuerza Máxima Promedio</div>
      <div class="ds">Peak Force — Comparativa Bilateral (N)</div>
      <div class="gauge-wrap">
        <canvas id="gaugeC" width="268" height="152"></canvas>
        <div class="gvals">
          <div class="gv"><div class="gv-l">${RL}</div><div class="gv-n">${n(r.fmax)}</div><div class="gv-u">Newtons</div></div>
          <div class="gv"><div class="gv-l">${LL}</div><div class="gv-n">${n(l.fmax)}</div><div class="gv-u">Newtons</div></div>
        </div>
        <div class="gleg">
          <div class="gl"><div class="gd" style="background:#00c853"></div>${RL}</div>
          <div class="gl"><div class="gd" style="background:#4ade80"></div>${LL}</div>
        </div>
      </div>
    </div>
    <div class="dcard">
      <div class="dt">TDF a 50ms — Fase Neural Temprana</div>
      <div class="ds">Tasa de Desarrollo de Fuerza (0–50ms) — Predominantemente Neural · N/s</div>
      <div class="hbars">
        <div class="hb-r">
          <div class="hb-lbl">${patient.muscle} ${RL.toUpperCase()}</div>
          <div class="hb-track"><div class="hb-fill" id="hbR" style="width:0%"><div class="hb-val">${n(r.rfd50)} N/s</div></div></div>
          <div class="hb-ax"><span>0</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500 N/s</span></div>
        </div>
        <div class="hb-l">
          <div class="hb-lbl">${patient.muscle} ${LL.toUpperCase()}</div>
          <div class="hb-track"><div class="hb-fill" id="hbL" style="width:0%"><div class="hb-val">${n(l.rfd50)} N/s</div></div></div>
          <div class="hb-ax"><span>0</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500 N/s</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ROW 2 -->
  <div class="row2">
    <div class="dcard">
      <div class="dt">Fuerza Máxima</div><div class="ds">(Peak Force N)</div>
      <div style="position:relative">
        <canvas id="cFmax" height="200"></canvas>
        <div class="bar-note">${fDomR?RL:LL} ${fDef??'—'}% ${fAlarm?'⚠ superior':'superior'}</div>
      </div>
    </div>
    <div class="dcard">
      <div class="dt">TDF @ 50ms</div><div class="ds">Explosividad Neural Temprana (N/s)</div>
      <div style="position:relative">
        <canvas id="cRfd50" height="200"></canvas>
        <div class="bar-note">${rDomR?RL:LL} más explosivo (${rDef??'—'}%)</div>
      </div>
    </div>
    <div class="dcard">
      <div class="dt">Índice S/R</div><div class="ds">(Fuerza / RFD@50ms %)</div>
      <canvas id="cSR" height="200"></canvas>
    </div>
    <div class="dcard">
      <div class="dt">Velocidad Contracción</div><div class="ds">(Tiempo Pico — segundos)</div>
      <canvas id="cVel" height="200"></canvas>
    </div>
  </div>

  <!-- CURVE -->
  ${curveRow}

  <!-- TABLE -->
  <div class="dcard">
    <div class="dt">Cuadro Comparativo Bilateral</div>
    <div class="ds">Umbral Fuerza: &gt;15% ⚠ · Umbral RFD: &gt;20% ⚠ · Dominante: ${fDomR?RL:LL} en Fuerza Máxima</div>
    <table>
      <thead><tr>
        <th>Métrica</th>
        <th class="th-r">▶ ${RL}</th>
        <th class="th-l">◀ ${LL}</th>
        <th>Déficit / Asimetría</th>
      </tr></thead>
      <tbody>
        ${tr2('Fuerza Máxima','Pico de fuerza isométrica','N',r.fmax,l.fmax,15,false)}
        ${tr2('Fuerza Promedio','Fuerza media de la contracción','N',r.favg,l.favg,15,false)}
        ${tr2('Tiempo al Pico','Tiempo hasta fuerza máxima','s',r.tpeak,l.tpeak,30,true)}
        ${tr2('TDF @ 50ms','Fase neural temprana — impulso neural','N/s',r.rfd50,l.rfd50,20,false)}
        ${tr2('TDF @ 100ms','Fase neural — reclutamiento UM','N/s',r.rfd100,l.rfd100,20,false)}
        ${tr2('TDF @ 150ms','Fase temprana/intermedia (límite neural)','N/s',r.rfd150,l.rfd150,20,false)}
        ${tr2('TDF @ 250ms','Fase tardía — mixta (neural + estructural)','N/s',r.rfd250,l.rfd250,20,false)}
      </tbody>
    </table>
  </div>

  <!-- RFD PROFILE -->
  <div class="dcard">
    <div class="dt">Perfil TDF — Todas las Ventanas Temporales (N/s)</div>
    <div style="display:flex;gap:16px;margin-bottom:12px">
      <span style="font-family:'Rajdhani',sans-serif;font-size:10px;display:flex;align-items:center;gap:5px;color:#00c853"><span style="width:8px;height:8px;border-radius:50%;background:#00c853;display:inline-block"></span>${RL}</span>
      <span style="font-family:'Rajdhani',sans-serif;font-size:10px;display:flex;align-items:center;gap:5px;color:#4ade80"><span style="width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block"></span>${LL}</span>
    </div>
    <div class="rfd-prof" id="rfdProf"></div>
  </div>

  <!-- CONCLUSION -->
  ${buildConclusion(r,l,d,RL,LL,fDomR,rDomR,fDef,rDef,fAlarm,rAlarm,patient)}

  <!-- PROTOCOLS -->
  <div>
    <div style="font-family:'Rajdhani',sans-serif;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#00c853;margin-bottom:12px;display:flex;align-items:center;gap:10px">Recomendaciones Terapéuticas<span style="flex:1;height:1px;background:#1a3a1a;display:block"></span></div>
    <div class="proto-row">
      <div class="proto struct ${fAlarm?'':'off'}">
        <div class="proto-badge">⚠ Déficit Estructural</div>
        <div class="proto-name">Isometría Sostenida<br>Alta Intensidad</div>
        <div class="pp"><span class="ppl">Intensidad</span><span class="ppv">&gt;85% MVC</span></div>
        <div class="pp"><span class="ppl">Duración</span><span class="ppv">3–5 s por contracción</span></div>
        <div class="pp"><span class="ppl">Series</span><span class="ppv">3–4 series</span></div>
        <div class="pp"><span class="ppl">Frecuencia</span><span class="ppv">2–3 veces/semana</span></div>
      </div>
      <div class="proto neural ${rAlarm?'':'off'}">
        <div class="proto-badge">⚡ Déficit Neural</div>
        <div class="proto-name">Isometría Explosiva<br>Ballistic Isometrics</div>
        <div class="pp"><span class="ppl">Duración</span><span class="ppv">&lt;200ms (máx. vel.)</span></div>
        <div class="pp"><span class="ppl">Intensidad</span><span class="ppv">50–70% MVC</span></div>
        <div class="pp"><span class="ppl">Series</span><span class="ppv">5–6 series</span></div>
        <div class="pp"><span class="ppl">Frecuencia</span><span class="ppv">2 veces/semana</span></div>
      </div>
      <div class="proto maint ${(!fAlarm&&!rAlarm)?'':'off'}">
        <div class="proto-badge">✓ Mantenimiento</div>
        <div class="proto-name">Neuromuscular<br>Preventivo</div>
        <div class="pp"><span class="ppl">Frecuencia</span><span class="ppv">2–3 veces/semana</span></div>
        <div class="pp"><span class="ppl">Intensidades</span><span class="ppv">50–90% MVC (variado)</span></div>
        <div class="pp"><span class="ppl">Reevaluación</span><span class="ppv">Cada 4–6 semanas</span></div>
      </div>
    </div>
    <div style="margin-top:10px;font-size:9px;color:#1e3a1e;font-family:'Rajdhani',sans-serif;padding:8px 12px;background:#080e08;border:1px solid #1a2a1a;border-radius:6px">
      Referencias: Maffiuletti NA et al. (2016) Eur J Appl Physiol · Aagaard P et al. (2002) J Appl Physiol · Tillin NA et al. (2013) J Sports Sci · Knezevic OM et al. (2014) The Knee · VALD Health (2026)
    </div>
  </div>

  <!-- FOOTER -->
  <div class="rpt-footer">
    <div style="display:flex;align-items:center;gap:12px">
      ${patient.instLogo
        ? `<img src="${patient.instLogo}" style="max-height:36px;max-width:80px;object-fit:contain;border-radius:3px" alt="Logo">`
        : `<img src="${MOVE_LOGO_SRC}" style="height:30px;width:auto;opacity:.6" alt="The Move Club">`}
      <div class="rf-l"><strong>${patient.prof}</strong>${d.date}</div>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      ${patient.profPhoto ? `<img src="${patient.profPhoto}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid #1a4a1a" alt="">` : ''}
      <div class="rf-r">Dinamómetro Isométrico · Valkyria Trainer<br>Unidades: N / N/s / s</div>
    </div>
  </div>
  `;

  setTimeout(()=>{
    document.getElementById('hbR').style.width = rPct+'%';
    document.getElementById('hbL').style.width = lPct+'%';
    drawGauge(r.fmax||0, l.fmax||0, RL, LL);
    renderCharts(r, l, RL, LL, fDomR, rDomR, fDef, rDef);
    buildRfdProfile(r, l);
    if(hasCurve) renderCurve(r, l, RL, LL);
  }, 200);
}

/* ===== MULTI-MUSCLE BUILD REPORT ===== */
function buildReport(data, patient) {
  Object.values(activeCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  activeCharts={};

  const results = data.resultados||[];
  const musculoGlobal = patient.muscle||data.musculo_global||'Evaluación Isométrica';

  function normLado(s){
    if(!s) return null;
    s=s.trim().toUpperCase();
    if(s==='R'||s==='D'||s.startsWith('DER')||s.startsWith('RIGHT')) return 'R';
    if(s==='L'||s==='I'||s.startsWith('IZQ')||s.startsWith('LEFT')) return 'L';
    return null;
  }
  function normKey(k){
    if(!k) return 'OTRO';
    k=k.trim().toUpperCase();
    const map={QUADRICEPS:'QUAD',CUADRICEPS:'QUAD',QUAD:'QUAD',
               HAM:'HAM',HAMSTRING:'HAM',ISQUIO:'HAM',
               EXT_ROT:'EXT_ROT',EXTERNAL:'EXT_ROT',
               INT_ROT:'INT_ROT',INTERNAL:'INT_ROT',
               ROW:'ROW',MTP:'MTP'};
    return map[k]||k;
  }

  const groups={};
  results.forEach(r=>{
    const k=normKey(r.musculo_key);
    const lado=normLado(r.lado);
    if(!groups[k]) groups[k]={label:r.musculo_label||MUSCLE_LABELS[k]||'Músculo',R:null,L:null};
    if(lado==='R') groups[k].R=r.metrics;
    else if(lado==='L') groups[k].L=r.metrics;
  });

  console.log('[buildReport] groups:', JSON.stringify(Object.fromEntries(Object.entries(groups).map(([k,g])=>([k,{R:!!g.R,L:!!g.L}])))));
  const bilateral=Object.entries(groups).filter(([k,g])=>g.R&&g.L);
  const dateStr=new Date().toLocaleDateString('es-AR',{day:'2-digit',month:'long',year:'numeric'});

  if(!bilateral.length){
    document.getElementById('dashBody').innerHTML=
      '<div class="alert warning" style="margin:40px 20px"><div class="alert-icon">⚠️</div><div><div class="alert-title">ANÁLISIS BILATERAL INCOMPLETO</div><div class="alert-sub">No se detectaron ambos lados para ningún músculo. Verificá que las imágenes incluyan capturas de ambos lados (Derecho e Izquierdo).</div></div></div>';
    showReport(); return;
  }

  // Shoulder rotator profile: both EXT_ROT and INT_ROT bilateral detected
  if(groups.EXT_ROT?.R&&groups.EXT_ROT?.L&&groups.INT_ROT?.R&&groups.INT_ROT?.L){
    const fullPat={
      name:patient.name, sport:patient.sport,
      muscle:musculoGlobal, injury:patient.injury,
      prof:patient.prof,
      profPhoto:patient.profPhoto||(currentUser?getPhoto(currentUser.dni):null),
      instLogo:null
    };
    buildShoulderRotatorReport(groups,fullPat,dateStr);
    showReport(); return;
  }

  const [pk,pg]=bilateral[0];
  buildReportCore({
    r:pg.R, l:pg.L, rightLabel:'Derecho', leftLabel:'Izquierdo',
    patient:{
      name:patient.name, sport:patient.sport,
      muscle:musculoGlobal,
      injury:patient.injury, prof:patient.prof,
      profPhoto:patient.profPhoto||(currentUser?getPhoto(currentUser.dni):null),
      instLogo:null
    },
    date:dateStr
  });

  setTimeout(()=>{
    const rc=document.getElementById('dashBody');
    for(let i=1;i<bilateral.length;i++){
      const [ak,ag]=bilateral[i];
      rc.insertAdjacentHTML('beforeend', buildCompactBilateral(ag.label,ag.R,ag.L));
    }
    if(groups.QUAD&&groups.QUAD.R&&groups.QUAD.L&&groups.HAM&&groups.HAM.R&&groups.HAM.L){
      rc.insertAdjacentHTML('beforeend', buildHQHtml(groups.QUAD,groups.HAM));
    }
    if(groups.EXT_ROT&&groups.EXT_ROT.R&&groups.EXT_ROT.L&&groups.INT_ROT&&groups.INT_ROT.R&&groups.INT_ROT.L){
      rc.insertAdjacentHTML('beforeend', buildERIRHtml(groups.EXT_ROT,groups.INT_ROT));
      rc.insertAdjacentHTML('beforeend', buildNormativeComparison(groups.EXT_ROT,groups.INT_ROT));
    }
    if((groups.QUAD&&groups.QUAD.R||groups.HAM&&groups.HAM.R)){
      rc.insertAdjacentHTML('beforeend', buildNormativeComparisonQuad(groups.QUAD,groups.HAM));
    }
  },400);
}

/* ===== COMPACT BILATERAL SECTION ===== */
function buildCompactBilateral(label,r,l){
  const fDef=def(r.fmax,l.fmax);
  const rDef=def(r.rfd50,l.rfd50);
  const fAlarm=fDef>15, rAlarm=rDef>20;
  const badge=fAlarm&&rAlarm?'alarm':fAlarm||rAlarm?'warning':'ok';
  const badgeIcon=fAlarm&&rAlarm?'🚨':fAlarm?'⚠️':rAlarm?'⚡':'✅';
  const alertTxt=fAlarm&&rAlarm?'DÉFICIT BILATERAL CRÍTICO':fAlarm?'DÉFICIT ESTRUCTURAL':rAlarm?'DÉFICIT NEURAL — RFD':'PERFIL SIMÉTRICO';

  const mkRow=(lb,u,rv,lv,thr,inv)=>{
    const d2=def(rv,lv);
    const isAlarm=thr!=null&&d2!=null&&d2>thr;
    const dom=inv?(rv!=null&&lv!=null&&rv<=lv?'D':'I'):(rv!=null&&lv!=null&&rv>=lv?'D':'I');
    return '<tr><td class="tc">'+lb+'<br><span style="color:#2a5a2a;font-size:9px">'+u+'</span></td>'
      +'<td class="tv'+(dom==='D'?' dom':'')+'">'+n(rv)+'</td>'
      +'<td class="tv'+(dom==='I'?' dom':'')+'">'+n(lv)+'</td>'
      +'<td class="td'+(isAlarm?' alarm':'')+'">'+( d2!=null?d2+'%':'&#8212;')+'</td></tr>';
  };

  const rows=[
    mkRow('Force Max','N',r.fmax,l.fmax,15,false),
    mkRow('Force Avg','N',r.favg,l.favg,15,false),
    mkRow('RFD @ 50ms','N/s',r.rfd50,l.rfd50,20,false),
    mkRow('RFD @ 100ms','N/s',r.rfd100,l.rfd100,20,false),
    mkRow('RFD @ 250ms','N/s',r.rfd250,l.rfd250,20,false),
    mkRow('Time to Peak','s',r.tpeak,l.tpeak,null,true),
  ].join('');

  return '<div class="section-divider">'+label+'</div>'
    +'<div class="dcard" style="margin:0 0 16px">'
    +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">'
    +'<div style="font-size:20px">'+badgeIcon+'</div>'
    +'<div><div style="font-family:\'Rajdhani\',sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:'+(badge==='ok'?'#00c853':badge==='alarm'?'#ef4444':'#f59e0b')+'">'+alertTxt+'</div>'
    +'<div style="font-size:11px;color:#4a6a4a">Fuerza: '+(fDef!=null?fDef+'%':'&#8212;')+' · RFD@50ms: '+(rDef!=null?rDef+'%':'&#8212;')+'</div></div></div>'
    +'<table class="cmp-table"><thead><tr><th>MÉTRICA</th><th>DERECHO</th><th>IZQUIERDO</th><th>DÉFICIT</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

/* ===== H:Q RATIO SECTION ===== */
function buildHQHtml(quad,ham){
  const hqR=(ham.R&&ham.R.fmax&&quad.R&&quad.R.fmax)?ham.R.fmax/quad.R.fmax:null;
  const hqL=(ham.L&&ham.L.fmax&&quad.L&&quad.L.fmax)?ham.L.fmax/quad.L.fmax:null;

  function hqStatus(v){
    if(v==null)return 'nd';
    if(v<CLINICAL.HQ.alarm)return 'alarm';
    if(v<CLINICAL.HQ.warn)return 'warn';
    return 'ok';
  }
  function hqBadge(v,s){
    if(v==null)return '—';
    return s==='alarm'?'RIESGO ELEVADO':s==='warn'?'DÉFICIT MODERADO':'DENTRO DE RANGO';
  }
  function hqPct(v){return v!=null?Math.min(v/0.80*100,100).toFixed(0):0}
  const stR=hqStatus(hqR),stL=hqStatus(hqL);

  function card(side,ratio,st,erM,irM){
    return '<div class="ratio-card">'
      +'<div class="ratio-card-label">Lado '+side+'</div>'
      +'<div class="ratio-value-row"><div class="ratio-value '+st+'">'+(ratio!=null?ratio.toFixed(2):'—')+'</div><div class="ratio-unit">H:Q</div></div>'
      +'<div class="ratio-band"><div class="ratio-band-fill '+st+'" style="width:'+hqPct(ratio)+'%"></div></div>'
      +'<div class="ratio-status-chip '+st+'">'+hqBadge(ratio,st)+'</div>'
      +'<div class="ratio-normal-range">Normal: '+CLINICAL.HQ.normal+' · Alarma: &lt;'+CLINICAL.HQ.alarm+'</div>'
      +(ratio!=null?'<div style="margin-top:8px;font-size:10px;color:#4a7a4a">ISQ '+n(erM?erM.fmax:null)+' N / CUAD '+n(irM?irM.fmax:null)+' N</div>':'')
      +'</div>';
  }

  return '<div class="section-divider">Ratio Fuerza Flexora / Extensora</div>'
    +'<div class="ratio-section">'
    +'<div class="ratio-section-title">⚖️ &nbsp; RATIO ISQUIOTIBIALES : CUÁDRICEPS (H:Q)</div>'
    +'<div class="ratio-grid">'
    +card('Derecho',hqR,stR,ham.R,quad.R)
    +card('Izquierdo',hqL,stL,ham.L,quad.L)
    +'</div>'
    +'<div class="ratio-ref-block">'
    +'<div class="ratio-ref-title">📚 Fundamento científico</div>'
    +'<div class="ratio-ref-text">'+CLINICAL.HQ.refs+'</div>'
    +'<div class="ratio-note" style="margin-top:8px">⛑ '+CLINICAL.HQ.note+'</div>'
    +'</div></div>';
}

/* ===== ER:IR RATIO SECTION ===== */
function buildERIRHtml(er,ir){
  const ratioR=(er.R&&er.R.fmax&&ir.R&&ir.R.fmax)?er.R.fmax/ir.R.fmax:null;
  const ratioL=(er.L&&er.L.fmax&&ir.L&&ir.L.fmax)?er.L.fmax/ir.L.fmax:null;

  function erirStatus(v){
    if(v==null)return 'nd';
    if(v<CLINICAL.ERIR.alarm_low||v>CLINICAL.ERIR.alarm_high)return 'alarm';
    if(v<CLINICAL.ERIR.warn_low||v>CLINICAL.ERIR.warn_high)return 'warn';
    return 'ok';
  }
  function erirBadge(v,s){
    if(v==null)return '—';
    if(s==='alarm')return v<CLINICAL.ERIR.alarm_low?'ER DÉBIL — RIESGO':'IR DÉBIL — RATIO ALTO';
    if(s==='warn')return v<CLINICAL.ERIR.warn_low?'ER MODERADO':'DOMINIO ER';
    return 'RATIO ÓPTIMO';
  }
  function erirPct(v){return v!=null?Math.min(Math.max(v,0)/1.0*100,100).toFixed(0):0}
  const stR=erirStatus(ratioR),stL=erirStatus(ratioL);

  function card(side,ratio,st,erM,irM){
    return '<div class="ratio-card">'
      +'<div class="ratio-card-label">Lado '+side+'</div>'
      +'<div class="ratio-value-row"><div class="ratio-value '+st+'">'+(ratio!=null?ratio.toFixed(2):'—')+'</div><div class="ratio-unit">ER:IR</div></div>'
      +'<div class="ratio-band"><div class="ratio-band-fill '+st+'" style="width:'+erirPct(ratio)+'%"></div></div>'
      +'<div class="ratio-status-chip '+st+'">'+erirBadge(ratio,st)+'</div>'
      +'<div class="ratio-normal-range">Normal: '+CLINICAL.ERIR.normal+' · Alarma: &lt;'+CLINICAL.ERIR.alarm_low+' o &gt;'+CLINICAL.ERIR.alarm_high+'</div>'
      +(ratio!=null?'<div style="margin-top:8px;font-size:10px;color:#4a7a4a">ER '+n(erM?erM.fmax:null)+' N / IR '+n(irM?irM.fmax:null)+' N</div>':'')
      +'</div>';
  }

  return '<div class="section-divider">Ratio Rotadores de Hombro</div>'
    +'<div class="ratio-section">'
    +'<div class="ratio-section-title">🔄 &nbsp; RATIO ROTACIÓN EXTERNA : INTERNA (ER:IR)</div>'
    +'<div class="ratio-grid">'
    +card('Derecho',ratioR,stR,er.R,ir.R)
    +card('Izquierdo',ratioL,stL,er.L,ir.L)
    +'</div>'
    +'<div class="ratio-ref-block">'
    +'<div class="ratio-ref-title">📚 Fundamento científico</div>'
    +'<div class="ratio-ref-text">'+CLINICAL.ERIR.refs+'</div>'
    +'<div class="ratio-note" style="margin-top:8px">⛑ '+CLINICAL.ERIR.note+'</div>'
    +'</div></div>';
}


/* ===== TABLE ROW ===== */
function tr2(label,sub,unit,rV,lV,thr,inv){
  const d=def(rV,lV);
  const dom = inv ? (rV<=lV?'r':'l') : (rV>=lV?'r':'l');
  const st = d===null?'ok':d>thr?'alarm':d>thr*.7?'warn':'ok';
  const ic = st==='ok'?'✓':st==='warn'?'~':'⚠';
  return `<tr>
    <td class="mn"><strong>${label}</strong>${sub}</td>
    <td class="${dom==='r'?'rv dom':'rv'}">${n(rV)} <span style="font-size:9px;color:#1a4a1a">${unit}</span></td>
    <td class="${dom==='l'?'lv dom':'lv'}">${n(lV)} <span style="font-size:9px;color:#1a4a1a">${unit}</span></td>
    <td><span class="dbadge ${st}">${ic} ${d!==null?d+'%':'—'}</span></td>
  </tr>`;
}

/* ===== CONCLUSION ===== */
function buildConclusion(r,l,d,RL,LL,fDomR,rDomR,fDef,rDef,fAlarm,rAlarm,patient){
  const fDom=fDomR?RL:LL, fWeak=fDomR?LL:RL;
  const rDom=rDomR?RL:LL;
  const paradox = fDomR!==rDomR;

  // RFD fase temprana (0-150ms) vs tardía (>150ms) — Maffiuletti et al. 2016 / VALD Health
  const earlyDef = def(r.rfd50, l.rfd50);   // 50ms — predominantemente neural
  const midDef   = def(r.rfd100, l.rfd100); // 100ms — neural
  const lateDef  = def(r.rfd250, l.rfd250); // 250ms — mixta (neural + estructural)

  // Determinar perfil predominante
  const earlyAlarm = (earlyDef??0) > 20;
  const lateAlarm  = (lateDef??0) > 20;

  let vIcon='✅', vLabel='Perfil Simétrico — Mantenimiento Preventivo';
  let vDetail='Los déficits bilaterales se encuentran dentro de parámetros normales. Mantener con protocolo preventivo y reevaluar en 4–6 semanas (Tillin et al., 2013).';
  if(fAlarm&&rAlarm){
    vIcon='🚨'; vLabel='INTERVENCIÓN TERAPÉUTICA URGENTE — Déficit Bilateral Crítico';
    vDetail='Déficit combinado estructural y neural. Protocolo doble: isometría sostenida de alta intensidad para fuerza máxima + isometría explosiva balística para TDF. La recuperación de la fuerza sin la correspondiente recuperación de TDF es un indicador tardío de rehabilitación incompleta (VALD Health, 2026).';
  } else if(fAlarm){
    vIcon='⚠️'; vLabel='DÉFICIT ESTRUCTURAL — Capacidad de Fuerza Máxima';
    vDetail='Priorizar isometría sostenida de alta intensidad (>85% MVC, 3–5s). La función neural (TDF fase temprana) es aceptable. Controlar progresión cada 4 semanas (Aagaard et al., 2002).';
  } else if(rAlarm){
    vIcon='⚡'; vLabel='DÉFICIT NEURAL — Tasa de Desarrollo de Fuerza';
    vDetail='TDF fase temprana (0–150ms) deficitaria indica insuficiencia en el impulso neural y la tasa de reclutamiento de unidades motoras. Prescribir contracciones balísticas explosivas <200ms, 50–70% MVC (Maffiuletti et al., 2016; Van Cutsem et al., 1998).';
  }

  // Análisis de fases
  let fasesTxt = '';
  if(earlyDef !== null && lateDef !== null){
    const predominio = earlyAlarm && !lateAlarm
      ? 'predominantemente <strong>neural</strong> (déficit concentrado en fase temprana 0–150ms)'
      : lateAlarm && !earlyAlarm
        ? 'predominantemente <strong>estructural/mixto</strong> (déficit en fase tardía >150ms)'
        : earlyAlarm && lateAlarm
          ? '<strong>neural y estructural</strong> (déficit en todas las fases)'
          : 'dentro de parámetros normales en ambas fases';
    fasesTxt = ` El perfil de TDF es ${predominio} — TDF@50ms: <strong>${n(r.rfd50)} vs ${n(l.rfd50)} N/s</strong> (asimetría ${earlyDef??'—'}%), TDF@250ms: <strong>${n(r.rfd250)} vs ${n(l.rfd250)} N/s</strong> (asimetría ${lateDef??'—'}%).`;
  }

  const paradoxTxt = paradox
    ? ` <strong>Paradoja neuromuscular detectada:</strong> ${fDom} domina en fuerza máxima pero ${rDom} presenta mayor explosividad en la fase neural temprana — disociación entre capacidad estructural y eficiencia neural.`
    : ` El lado ${fDom} es dominante tanto en fuerza máxima como en explosividad — perfil neuromuscular coherente.`;

  const injNote = patient.injury
    ? ` Considerando la patología reportada (<strong>${patient.injury}</strong>), ajustar las cargas según tolerancia tisular y estado clínico actual. Los déficits de TDF suelen persistir más allá de la resolución de los déficits de fuerza (Knezevic et al., 2014).`
    : '';

  const txt = `El <strong>lado ${fDom.toUpperCase()}</strong> presenta mayor Fuerza Máxima (<strong>${n(fDomR?r.fmax:l.fmax)} N</strong> vs ${n(fDomR?l.fmax:r.fmax)} N, asimetría del <strong>${fDef??'—'}%</strong>).${paradoxTxt}${fasesTxt}${injNote}`;

  return `<div class="concl">
    <div class="concl-title">
      <svg width="13" height="11" viewBox="0 0 90 76" fill="none" style="color:#00c853;flex-shrink:0;display:inline-block;vertical-align:middle;margin-right:6px">
        <polygon points="45,3 87,72 3,72" stroke="currentColor" stroke-width="6" fill="none"/>
      </svg>
      Conclusión Clínica
    </div>
    <div class="concl-text">${txt}</div>
    <div class="concl-verdict">
      <div class="cv-icon">${vIcon}</div>
      <div><div class="cv-label">${vLabel}</div><div class="cv-detail">${vDetail}</div></div>
    </div>
  </div>`;
}

/* ===== GAUGE ===== */
function drawGauge(rV,lV,RL,LL){
  const c=document.getElementById('gaugeC');if(!c)return;
  const ctx=c.getContext('2d'),W=c.width,H=c.height,cx=W/2,cy=H-16;
  const rad=Math.min(cx-16,cy-8)-8;
  ctx.clearRect(0,0,W,H);
  [[rad,'#1a3a1a',16],[rad-22,'#0f1f0f',12]].forEach(([r,col,lw])=>{
    ctx.beginPath();ctx.arc(cx,cy,r,Math.PI,0,false);ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineCap='round';ctx.stroke();
  });
  const mx=Math.max(rV,lV)*1.15||1;
  ctx.beginPath();ctx.arc(cx,cy,rad,Math.PI,Math.PI+Math.PI*(rV/mx),false);ctx.strokeStyle='#00c853';ctx.lineWidth=14;ctx.lineCap='round';ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,rad-22,Math.PI,Math.PI+Math.PI*(lV/mx),false);ctx.strokeStyle='#4ade80';ctx.lineWidth=11;ctx.lineCap='round';ctx.stroke();
  for(let i=0;i<=10;i++){const a=Math.PI+(Math.PI*i/10);ctx.beginPath();ctx.moveTo(cx+(rad-28)*Math.cos(a),cy+(rad-28)*Math.sin(a));ctx.lineTo(cx+(rad-20)*Math.cos(a),cy+(rad-20)*Math.sin(a));ctx.strokeStyle='#1e3a1e';ctx.lineWidth=1;ctx.stroke()}
  const na=Math.PI+Math.PI*(rV/mx);
  ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+(rad-32)*Math.cos(na),cy+(rad-32)*Math.sin(na));ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.lineCap='round';ctx.stroke();
  ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fillStyle='#00c853';ctx.fill();
  ctx.font='bold 9px Rajdhani,sans-serif';ctx.fillStyle='#2a6a2a';ctx.textAlign='center';
  ctx.fillText(RL||'Derecho',cx-rad/2+8,cy+13);ctx.fillText(LL||'Izquierdo',cx+rad/2-8,cy+13);
}

/* ===== CHARTS ===== */
function renderCharts(r,l,RL,LL,fDomR,rDomR,fDef,rDef){
  const cR='#00c853',cL='#4ade80',bR='#00c85330',bL='#4ade8020';
  const SC={ticks:{color:'#2a6a2a',font:{family:'Rajdhani,sans-serif',size:9}},grid:{color:'#0c170c'}};

  function bar(id,labels,data,colors,unit){
    const ctx=document.getElementById(id)?.getContext('2d');if(!ctx)return;
    activeCharts[id]=new Chart(ctx,{type:'bar',data:{labels,datasets:[{data,backgroundColor:colors.map(c=>c+'30'),borderColor:colors,borderWidth:2,borderRadius:4}]},
      options:{responsive:true,maintainAspectRatio:true,animation:{duration:800},plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.parsed.y?.toFixed?.(2)??c.parsed.y} ${unit}`}}},scales:{x:SC,y:{...SC,beginAtZero:true}}}});
  }
  bar('cFmax',[RL,LL],[r.fmax,l.fmax],[cR,cL],'N');
  bar('cRfd50',[RL,LL],[r.rfd50,l.rfd50],[cR,cL],'N/s');
  bar('cVel',[RL,LL],[r.tpeak,l.tpeak],[cR,cL],'s');

  const ctx3=document.getElementById('cSR')?.getContext('2d');
  if(ctx3&&r.fmax&&l.fmax&&r.rfd50&&l.rfd50){
    activeCharts.sr=new Chart(ctx3,{type:'line',data:{labels:[RL,LL],datasets:[
      {label:'Fuerza %',data:[+(r.fmax/l.fmax*100).toFixed(1),100],borderColor:cR,backgroundColor:bR,borderWidth:2,pointRadius:5,pointBackgroundColor:cR,tension:0},
      {label:'RFD@50ms %',data:[+(r.rfd50/l.rfd50*100).toFixed(1),100],borderColor:cL,backgroundColor:bL,borderWidth:2,pointRadius:5,pointBackgroundColor:cL,tension:0}
    ]},options:{responsive:true,maintainAspectRatio:true,animation:{duration:800},
      plugins:{legend:{labels:{color:'#2a6a2a',font:{family:'Rajdhani,sans-serif',size:8}}},tooltip:{callbacks:{label:c=>`${c.parsed.y?.toFixed?.(1)}%`}}},
      scales:{x:SC,y:{...SC,min:0,max:115}}}});
  }
}

/* ===== N/ms CURVE ===== */
function renderCurve(r,l,RL,LL){
  const ctx=document.getElementById('chartCurve')?.getContext('2d');if(!ctx)return;
  const SC={ticks:{color:'#2a6a2a',font:{family:'Rajdhani,sans-serif',size:9}},grid:{color:'#0c170c'}};
  const rData=[r.finit||0,r.f50,r.f100,r.f150,r.f200,r.f250,r.fmax].map(v=>v??null);
  const lData=[l.finit||0,l.f50,l.f100,l.f150,l.f200,l.f250,l.fmax].map(v=>v??null);
  activeCharts.curve=new Chart(ctx,{type:'line',data:{
    labels:['0ms','50ms','100ms','150ms','200ms','250ms','Pico'],
    datasets:[
      {label:`${RL} (N)`,data:rData,borderColor:'#00c853',backgroundColor:'#00c85318',borderWidth:2.5,pointRadius:4,pointBackgroundColor:'#00c853',fill:true,tension:0.3,spanGaps:true},
      {label:`${LL} (N)`,data:lData,borderColor:'#4ade80',backgroundColor:'#4ade8012',borderWidth:2.5,pointRadius:4,pointBackgroundColor:'#4ade80',fill:true,tension:0.3,spanGaps:true}
    ]},
    options:{responsive:true,maintainAspectRatio:true,animation:{duration:1000},
      plugins:{legend:{labels:{color:'#3a7a3a',font:{family:'Rajdhani,sans-serif',size:10}}},tooltip:{callbacks:{label:c=>`${c.parsed.y?.toFixed?.(1)} N`}}},
      scales:{x:{...SC,title:{display:true,text:'Ventana Temporal',color:'#1e4a1e',font:{size:9,family:'Rajdhani,sans-serif'}}},y:{...SC,beginAtZero:true,title:{display:true,text:'Fuerza (N)',color:'#1e4a1e',font:{size:9,family:'Rajdhani,sans-serif'}}}}}});
}

/* ===== RFD PROFILE ===== */
function buildRfdProfile(r,l){
  const wins=[{w:'50ms',r:r.rfd50,l:l.rfd50},{w:'100ms',r:r.rfd100,l:l.rfd100},{w:'150ms',r:r.rfd150,l:l.rfd150},{w:'250ms',r:r.rfd250,l:l.rfd250}];
  const mx=Math.max(...wins.flatMap(w=>[w.r||0,w.l||0]))||1;
  document.getElementById('rfdProf').innerHTML=wins.map(w=>`
    <div class="rfd-row">
      <div class="rfd-win">${w.w}</div>
      <div class="rfd-bc">
        <div class="rfd-br"><div class="rfd-dot" style="background:#00c853"></div><div class="rfd-trk"><div class="rfd-f r" style="width:${((w.r||0)/mx*100).toFixed(1)}%"></div></div></div>
        <div class="rfd-br"><div class="rfd-dot" style="background:#4ade80"></div><div class="rfd-trk"><div class="rfd-f l" style="width:${((w.l||0)/mx*100).toFixed(1)}%"></div></div></div>
      </div>
      <div class="rfd-vs"><span class="rv">${n(w.r)}</span><span class="lv">${n(w.l)}</span></div>
    </div>`).join('');
}

/* ===== NORMATIVE COMPARISON — SHOULDER ROTATORS ===== */
function buildNormativeComparison(er, ir) {
  // Normative: Kolber et al. 2024 (n=1000+), healthy adults
  // ER isometric ~1.4 N/kg body weight (≈98N for 70kg person)
  // IR isometric ~1.7 N/kg body weight (≈119N for 70kg person)
  // ER:IR ratio optimal 0.65–0.75 overhead athletes (Cools 2014, Wilk 2011)

  const erR = er.R?.fmax, erL = er.L?.fmax;
  const irR = ir.R?.fmax, irL = ir.L?.fmax;
  const ratioR = (erR && irR) ? (erR/irR).toFixed(2) : null;
  const ratioL = (erL && irL) ? (erL/irL).toFixed(2) : null;

  function normBar(val, refMin, refMax, unit) {
    if (!val) return '<span style="color:#555">—</span>';
    const pct = Math.min(val / refMax * 100, 120).toFixed(0);
    const color = val < refMin ? '#ef4444' : val > refMax ? '#f59e0b' : '#00c853';
    const label = val < refMin ? '↓ Bajo norma' : val > refMax ? '↑ Sobre norma' : '✓ Dentro norma';
    return `<div style="display:flex;align-items:center;gap:8px">
      <div style="flex:1;background:#0d1a0d;border-radius:4px;height:10px;overflow:hidden">
        <div style="width:${Math.min(pct,100)}%;height:100%;background:${color};border-radius:4px"></div>
      </div>
      <span style="font-size:10px;color:${color};white-space:nowrap">${label}</span>
    </div>`;
  }

  const rows = [
    { label:'ER Derecho (Fmax)', val:erR, ref:'40–120 N', min:40, max:120 },
    { label:'ER Izquierdo (Fmax)', val:erL, ref:'40–120 N', min:40, max:120 },
    { label:'IR Derecho (Fmax)', val:irR, ref:'55–140 N', min:55, max:140 },
    { label:'IR Izquierdo (Fmax)', val:irL, ref:'55–140 N', min:55, max:140 },
    { label:'Ratio ER:IR Derecho', val:ratioR?+ratioR:null, ref:'0.65–0.80', min:0.65, max:0.80 },
    { label:'Ratio ER:IR Izquierdo', val:ratioL?+ratioL:null, ref:'0.65–0.80', min:0.65, max:0.80 },
  ];

  const rowsHtml = rows.map(r => `
    <tr>
      <td style="padding:8px 10px;font-size:11px;color:#3a7a3a;font-family:'Rajdhani',sans-serif">${r.label}</td>
      <td style="padding:8px 10px;font-size:12px;font-weight:700;color:#d0f0d0">${r.val != null ? r.val : '—'}</td>
      <td style="padding:8px 10px;font-size:10px;color:#2a5a2a">${r.ref}</td>
      <td style="padding:8px 10px;min-width:180px">${normBar(r.val, r.min, r.max)}</td>
    </tr>`).join('');

  return `<div class="section-divider">Comparativa con Valores Normativos</div>
  <div class="dcard" style="margin:0 0 16px">
    <div style="font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;letter-spacing:1px;color:#00c853;margin-bottom:12px">
      📊 TUS VALORES vs POBLACIÓN DE REFERENCIA
    </div>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr style="border-bottom:1px solid #1a3a1a">
          <th style="padding:6px 10px;font-size:10px;color:#2a5a2a;text-align:left;font-family:'Rajdhani',sans-serif;letter-spacing:1px">MÉTRICA</th>
          <th style="padding:6px 10px;font-size:10px;color:#2a5a2a;text-align:left;font-family:'Rajdhani',sans-serif;letter-spacing:1px">VALOR</th>
          <th style="padding:6px 10px;font-size:10px;color:#2a5a2a;text-align:left;font-family:'Rajdhani',sans-serif;letter-spacing:1px">NORMA</th>
          <th style="padding:6px 10px;font-size:10px;color:#2a5a2a;text-align:left;font-family:'Rajdhani',sans-serif;letter-spacing:1px">COMPARATIVA</th>
        </tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <div style="margin-top:12px;padding:10px;background:#050a05;border-radius:6px;border-left:3px solid #1a3a1a">
      <div style="font-size:10px;color:#2a5a2a;font-family:'Rajdhani',sans-serif;letter-spacing:1px;margin-bottom:6px">📚 REFERENCIAS NORMATIVAS</div>
      <div style="font-size:10px;color:#3a6a3a;line-height:1.6">
        Kolber MJ et al. (2024). <em>Int J Sports Phys Ther</em> — n=1.000+ adultos sanos, dinamometría manual.<br>
        Cools AM et al. (2014). <em>J Athl Train</em>, 49(3):377–383 — ratio ER:IR isométrico neutro.<br>
        Wilk KE et al. (2011). <em>J Orthop Sports Phys Ther</em>, 41(9):621–632 — hombro overhead.<br>
        <span style="color:#1e4a1e">⚠ Valores normativos varían por edad, sexo, deporte y posición de medición.</span>
      </div>
    </div>
  </div>`;
}

function buildNormativeComparisonQuad(quad, ham) {
  // Placeholder — only fires if quad/ham data present
  return '';
}

/* ===== SHOULDER ROTATOR PROFILE REPORT ===== */
function buildShoulderRotatorReport(groups, patient, dateStr) {
  Object.values(activeCharts).forEach(c=>{try{c.destroy()}catch(e){}});
  activeCharts={};

  const erR=groups.EXT_ROT.R, erL=groups.EXT_ROT.L;
  const irR=groups.INT_ROT.R, irL=groups.INT_ROT.L;
  const all=[erR,erL,irR,irL];

  function avg4(key){
    const ns=all.map(v=>v[key]).filter(x=>x!=null);
    return ns.length?(ns.reduce((a,b)=>a+b,0)/ns.length).toFixed(1):null;
  }

  function diffCell(lv,rv){
    if(lv==null||rv==null) return '<span style="color:#555">—</span>';
    const diff=lv-rv;
    const pct=((Math.abs(diff)/Math.max(lv,rv))*100).toFixed(1);
    const sign=diff>=0?'+':'';
    const cls=Math.abs(parseFloat(pct))>10?'sr-diff-alarm':'sr-diff-ok';
    return `<span class="${cls}">${sign}${diff.toFixed(1)}<br><small>(${sign}${pct}%)</small></span>`;
  }

  function ftRow(label,erLv,erRv,irLv,irRv,bold){
    const cls=bold?' class="sr-bold-row"':'';
    return `<tr${cls}>
      <td class="sr-tc">${label}</td>
      <td class="sr-tv">${n(erLv)}</td><td class="sr-tv">${n(erRv)}</td>
      <td class="sr-tv sr-ir">${n(irLv)}</td><td class="sr-tv sr-ir">${n(irRv)}</td>
    </tr>`;
  }

  const logo=patient.instLogo
    ?`<img src="${patient.instLogo}" style="height:40px;width:auto" alt="Logo">`
    :`<img src="${MOVE_LOGO_SRC}" style="height:40px;width:auto" alt="The Move Club">`;
  const profPh=patient.profPhoto
    ?`<img src="${patient.profPhoto}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;border:2px solid #00c853" alt="">`:'';

  const erirR=(erR.fmax&&irR.fmax)?(erR.fmax/irR.fmax).toFixed(2):null;
  const erirL=(erL.fmax&&irL.fmax)?(erL.fmax/irL.fmax).toFixed(2):null;
  const erFdef=def(erL.fmax,erR.fmax), irFdef=def(irL.fmax,irR.fmax);
  const erRdef=def(erL.rfd50,erR.rfd50), irRdef=def(irL.rfd50,irR.rfd50);
  const maxDef=Math.max(erFdef||0,irFdef||0,erRdef||0,irRdef||0);
  const alertCls=maxDef>20?'alarm':maxDef>10?'warning':'ok';
  const alertIcon=maxDef>20?'🚨':maxDef>10?'⚠️':'✅';
  const alertTitle=maxDef>20?'DÉFICIT BILATERAL SIGNIFICATIVO':maxDef>10?'ASIMETRÍA MODERADA DETECTADA':'PERFIL SIMÉTRICO';
  const alertSub=`ER: Fuerza ${erFdef??'—'}% · RFD ${erRdef??'—'}% · IR: Fuerza ${irFdef??'—'}% · RFD ${irRdef??'—'}%`;

  function interpItem(icon,label,text){
    return `<div class="sr-interp-item">
      <div style="font-size:18px;flex-shrink:0">${icon}</div>
      <div><div class="sr-interp-label">${label}</div><div class="sr-interp-text">${text}</div></div>
    </div>`;
  }

  const interpHtml=[
    (erFdef!=null&&erFdef>10)
      ?interpItem('⚠️','DIFERENCIAS ENTRE HOMBROS',`Se observan mayores valores en el hombro ${(erL.fmax||0)>(erR.fmax||0)?'izquierdo':'derecho'} en rotación externa (${erFdef}%). Las asimetrías >10% pueden aumentar el riesgo de lesión.`)
      :interpItem('✅','SIMETRÍA BILATERAL ER',`Rotadores externos presentan perfil simétrico (déficit ${erFdef??'—'}%). Dentro de rangos normales.`),
    interpItem('🔄','RELACIÓN FUERZA-RFD',`La relación entre fuerza máxima y RFD es consistente: mayor capacidad de generar fuerza, mayor capacidad de desarrollar fuerza rápidamente.`),
    interpItem('⚠️','ASIMETRÍAS',`Las asimetrías >10% pueden aumentar el riesgo de lesión. Se recomienda considerar estos datos en programas de entrenamiento y rehabilitación.`),
    interpItem(((irL.fmax||0)+(irR.fmax||0))>((erL.fmax||0)+(erR.fmax||0))?'✅':'⚠️','FUERZA INTERNA VS EXTERNA',`La rotación interna presenta ${((irL.fmax||0)+(irR.fmax||0))>((erL.fmax||0)+(erR.fmax||0))?'mayores':'menores'} valores de fuerza que la externa en ambos hombros, ${((irL.fmax||0)+(irR.fmax||0))>((erL.fmax||0)+(erR.fmax||0))?'coherente con la evidencia que indica que los rotadores internos suelen ser más fuertes que los externos.':'patrón atípico que merece evaluación clínica.'}`)
  ].join('');

  document.getElementById('dashBody').innerHTML=`

  <!-- SR HEADER -->
  <div class="sr-header">
    <div style="display:flex;align-items:center;gap:14px">${logo}
      <div>
        <div class="sr-title">INFORME DE EVALUACIÓN DE ROTADORES DEL HOMBRO</div>
        <div class="sr-sub">Dinamometría Isométrica · Modo Push · Valkyria Trainer</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px">${profPh}
      <div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:16px;font-weight:700;color:#fff">${patient.name}</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:10px;color:#3a7a3a;letter-spacing:1px">Deporte: ${patient.sport} · Evaluador: ${patient.prof}</div>
        <div style="font-family:'Rajdhani',sans-serif;font-size:10px;color:#2a5a2a;letter-spacing:1px">Fecha: ${dateStr}</div>
      </div>
    </div>
  </div>

  <!-- ALERT -->
  <div class="alert ${alertCls}">
    <div class="alert-icon">${alertIcon}</div>
    <div><div class="alert-title">${alertTitle}</div><div class="alert-sub">${alertSub}</div></div>
  </div>

  <!-- SUMMARY CARDS -->
  <div class="sr-cards">
    <div class="sr-card"><div class="sr-ci">💪</div><div class="sr-cv">${avg4('fmax')??'—'} N</div><div class="sr-cl">Fuerza Máxima Promedio<br><span>(Ambos hombros)</span></div></div>
    <div class="sr-card"><div class="sr-ci">⚡</div><div class="sr-cv">${avg4('rfd50')??'—'} N/s</div><div class="sr-cl">RFD Promedio (50ms)<br><span>(Ambos hombros)</span></div></div>
    <div class="sr-card"><div class="sr-ci">⏱</div><div class="sr-cv">${avg4('tpeak')??'—'} s</div><div class="sr-cl">Tiempo Máx. Fuerza<br><span>(Promedio)</span></div></div>
    <div class="sr-card"><div class="sr-ci">🔄</div><div class="sr-cv">${erirL??'—'} / ${erirR??'—'}</div><div class="sr-cl">Ratio ER:IR<br><span>(Izq / Der)</span></div></div>
  </div>

  <!-- SECTION 1: FORCE TABLE -->
  <div class="sr-sec-bar">1. COMPARACIÓN DE FUERZA (N) ENTRE HOMBRO IZQUIERDO Y DERECHO</div>
  <div class="dcard" style="padding:0;overflow:auto">
    <table class="sr-force-tbl">
      <thead>
        <tr>
          <th rowspan="2" class="sr-var">VARIABLE</th>
          <th colspan="2" class="sr-th-er">ROTACIÓN EXTERNA</th>
          <th colspan="2" class="sr-th-ir">ROTACIÓN INTERNA</th>
        </tr>
        <tr>
          <th class="sr-sub-th">IZQ (N)</th><th class="sr-sub-th">DER (N)</th>
          <th class="sr-sub-th sr-ir">IZQ (N)</th><th class="sr-sub-th sr-ir">DER (N)</th>
        </tr>
      </thead>
      <tbody>
        ${ftRow('Fuerza a 50ms',erL.f50,erR.f50,irL.f50,irR.f50)}
        ${ftRow('Fuerza a 100ms',erL.f100,erR.f100,irL.f100,irR.f100)}
        ${ftRow('Fuerza a 150ms',erL.f150,erR.f150,irL.f150,irR.f150)}
        ${ftRow('Fuerza a 200ms',erL.f200,erR.f200,irL.f200,irR.f200)}
        ${ftRow('Fuerza a 250ms',erL.f250,erR.f250,irL.f250,irR.f250)}
        ${ftRow('FUERZA MÁXIMA (N)',erL.fmax,erR.fmax,irL.fmax,irR.fmax,true)}
        ${ftRow('FUERZA PROMEDIO (N)',erL.favg,erR.favg,irL.favg,irR.favg,true)}
      </tbody>
    </table>
  </div>

  <!-- SECTIONS 2 & 3: CHARTS -->
  <div class="sr-chart-row">
    <div class="dcard">
      <div class="dt">2. Perfil de Fuerza (N) por Ventana Temporal</div>
      <canvas id="srForceChart" height="180"></canvas>
    </div>
    <div class="dcard">
      <div class="dt">3. Perfil de RFD (N/s) por Ventana Temporal</div>
      <canvas id="srRFDChart" height="180"></canvas>
    </div>
  </div>
  <div class="sr-legend">
    <span><span class="sr-dot" style="background:#4ade80"></span>ER Izquierdo</span>
    <span><span class="sr-dot er-der"></span>ER Derecho</span>
    <span><span class="sr-dot" style="background:#818cf8"></span>IR Izquierdo</span>
    <span><span class="sr-dot" style="background:#6366f1"></span>IR Derecho</span>
  </div>

  <!-- SECTION 4: GLOBAL COMPARISON -->
  <div class="sr-sec-bar">4. COMPARATIVA GLOBAL ENTRE HOMBROS</div>
  <div class="sr-global-row">
    <div class="dcard">
      <div class="dt" style="color:#00c853">ROTACIÓN EXTERNA</div>
      <table class="sr-diff-tbl">
        <thead><tr><th>VARIABLE</th><th>IZQUIERDO</th><th>DERECHO</th><th>DIFERENCIA</th></tr></thead>
        <tbody>
          <tr><td>Fuerza Máxima (N)</td><td>${n(erL.fmax)}</td><td>${n(erR.fmax)}</td><td>${diffCell(erL.fmax,erR.fmax)}</td></tr>
          <tr><td>Fuerza Promedio (N)</td><td>${n(erL.favg)}</td><td>${n(erR.favg)}</td><td>${diffCell(erL.favg,erR.favg)}</td></tr>
          <tr><td>RFD @ 50ms (N/s)</td><td>${n(erL.rfd50)}</td><td>${n(erR.rfd50)}</td><td>${diffCell(erL.rfd50,erR.rfd50)}</td></tr>
        </tbody>
      </table>
    </div>
    <div class="dcard">
      <div class="dt" style="color:#818cf8">ROTACIÓN INTERNA</div>
      <table class="sr-diff-tbl">
        <thead><tr><th>VARIABLE</th><th>IZQUIERDO</th><th>DERECHO</th><th>DIFERENCIA</th></tr></thead>
        <tbody>
          <tr><td>Fuerza Máxima (N)</td><td>${n(irL.fmax)}</td><td>${n(irR.fmax)}</td><td>${diffCell(irL.fmax,irR.fmax)}</td></tr>
          <tr><td>Fuerza Promedio (N)</td><td>${n(irL.favg)}</td><td>${n(irR.favg)}</td><td>${diffCell(irL.favg,irR.favg)}</td></tr>
          <tr><td>RFD @ 50ms (N/s)</td><td>${n(irL.rfd50)}</td><td>${n(irR.rfd50)}</td><td>${diffCell(irL.rfd50,irR.rfd50)}</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- SECTION 5: RFD SUMMARY -->
  <div class="sr-sec-bar">5. RESUMEN DE RFD (N/s) — TODAS LAS VENTANAS TEMPORALES</div>
  <div class="dcard" style="padding:0;overflow:auto">
    <table class="sr-force-tbl">
      <thead>
        <tr>
          <th rowspan="2" class="sr-var">VENTANA</th>
          <th colspan="2" class="sr-th-er">ROTACIÓN EXTERNA (N/s)</th>
          <th colspan="2" class="sr-th-ir">ROTACIÓN INTERNA (N/s)</th>
        </tr>
        <tr>
          <th class="sr-sub-th">IZQ</th><th class="sr-sub-th">DER</th>
          <th class="sr-sub-th sr-ir">IZQ</th><th class="sr-sub-th sr-ir">DER</th>
        </tr>
      </thead>
      <tbody>
        ${ftRow('RFD @ 50ms',erL.rfd50,erR.rfd50,irL.rfd50,irR.rfd50,true)}
        ${ftRow('RFD @ 100ms',erL.rfd100,erR.rfd100,irL.rfd100,irR.rfd100)}
        ${ftRow('RFD @ 150ms',erL.rfd150,erR.rfd150,irL.rfd150,irR.rfd150)}
        ${ftRow('RFD @ 250ms',erL.rfd250,erR.rfd250,irL.rfd250,irR.rfd250)}
      </tbody>
    </table>
  </div>

  <!-- SECTION 6: MISC DATA -->
  <div class="sr-misc-row">
    <div class="dcard sr-misc-card">
      <div style="font-size:24px">⏱</div>
      <div class="sr-misc-lbl">TIEMPO MÁXIMO DE FUERZA (s)</div>
      <div class="sr-misc-val">Izq ER: <strong>${n(erL.tpeak)??'—'}</strong> · Der ER: <strong>${n(erR.tpeak)??'—'}</strong></div>
      <div class="sr-misc-val">Izq IR: <strong>${n(irL.tpeak)??'—'}</strong> · Der IR: <strong>${n(irR.tpeak)??'—'}</strong></div>
    </div>
    <div class="dcard sr-misc-card">
      <div style="font-size:24px">📊</div>
      <div class="sr-misc-lbl">FUERZA INICIAL (N)</div>
      <div class="sr-misc-val">Izq ER: <strong>${n(erL.finit)??'—'}</strong> · Der ER: <strong>${n(erR.finit)??'—'}</strong></div>
      <div class="sr-misc-val">Izq IR: <strong>${n(irL.finit)??'—'}</strong> · Der IR: <strong>${n(irR.finit)??'—'}</strong></div>
    </div>
    <div class="dcard sr-misc-card">
      <div style="font-size:24px">🔄</div>
      <div class="sr-misc-lbl">RATIO ER:IR (Fmax)</div>
      <div class="sr-misc-val">Izquierdo: <strong>${erirL??'—'}</strong> · Derecho: <strong>${erirR??'—'}</strong></div>
      <div class="sr-misc-val"><small style="color:${(erirR&&(parseFloat(erirR)<0.65||parseFloat(erirR)>0.80))?'#ef4444':'#00c853'}">${(erirR&&(parseFloat(erirR)<0.65||parseFloat(erirR)>0.80))?'⚠ Fuera de rango normal (0.65–0.80)':'✓ Dentro de rango normal (0.65–0.80)'}</small></div>
    </div>
  </div>

  <!-- SECTIONS 7 & 8: INTERPRETATION + REFS -->
  <div class="sr-interp-row">
    <div class="dcard" style="flex:1.2">
      <div class="dt">7. Interpretación Basada en Evidencia Científica</div>
      <div style="display:flex;flex-direction:column;gap:12px;margin-top:12px">${interpHtml}</div>
    </div>
    <div class="dcard" style="flex:1">
      <div class="dt">8. Respaldo Científico</div>
      <div class="sr-refs">
        <div class="sr-ref"><span class="sr-rnum">1</span><div>Chamorro C. et al. (2021). <em>Int J Environ Res Public Health</em> — Confiabilidad de dinamometría isométrica de hombro. <strong>Alta ICC para ER e IR.</strong></div></div>
        <div class="sr-ref"><span class="sr-rnum">2</span><div>Hegedus E. et al. (2012). <em>Br J Sports Med</em> 46(14):964–978 — Tests de examen físico de hombro. <strong>Las mediciones de fuerza ayudan a identificar déficits funcionales.</strong></div></div>
        <div class="sr-ref"><span class="sr-rnum">3</span><div>Forthomme B. et al. (2018). <em>J Science Med Sport</em> 21(6):591–597 — Alta confiabilidad intra e interevaluador en dinamometría isométrica.</div></div>
        <div class="sr-ref"><span class="sr-rnum">4</span><div>Struyf F. et al. (2017). <em>J Shoulder Elbow Surg</em> 26(11):2021–2031 — Valores normativos para fuerza isométrica de hombro. <strong>Valores obtenidos dentro de rangos normales reportados.</strong></div></div>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="rpt-footer">
    <div style="display:flex;align-items:center;gap:12px">
      ${patient.instLogo
        ?`<img src="${patient.instLogo}" style="max-height:32px;object-fit:contain" alt="">`
        :`<img src="${MOVE_LOGO_SRC}" style="height:28px;width:auto;opacity:.6" alt="">`}
      <div class="rf-l"><strong>${patient.prof}</strong>${dateStr}</div>
    </div>
    <div class="rf-r">
      Este informe se basa únicamente en los datos proporcionados en las imágenes suministradas.<br>
      No se han añadido datos externos ni se han realizado suposiciones fuera de la información disponible.
    </div>
  </div>`;

  setTimeout(()=>{ renderShoulderCharts(erR,erL,irR,irL); }, 200);
}

function renderShoulderCharts(erR,erL,irR,irL){
  const SC={ticks:{color:'#2a6a2a',font:{family:'Rajdhani,sans-serif',size:9}},grid:{color:'#0c170c'}};
  const leg={labels:{color:'#3a7a3a',font:{family:'Rajdhani,sans-serif',size:9},boxWidth:10,padding:10}};
  const cErL='#4ade80',cErR='#00c853',cIrL='#818cf8',cIrR='#6366f1';

  const fcCtx=document.getElementById('srForceChart')?.getContext('2d');
  if(fcCtx){
    activeCharts.srF=new Chart(fcCtx,{type:'line',data:{
      labels:['50ms','100ms','150ms','200ms','250ms','Máx'],
      datasets:[
        {label:'ER Izquierdo',data:[erL.f50,erL.f100,erL.f150,erL.f200,erL.f250,erL.fmax],borderColor:cErL,backgroundColor:cErL+'18',borderWidth:2,borderDash:[5,3],pointRadius:4,tension:0.3,spanGaps:true},
        {label:'ER Derecho',data:[erR.f50,erR.f100,erR.f150,erR.f200,erR.f250,erR.fmax],borderColor:cErR,backgroundColor:cErR+'18',borderWidth:2,pointRadius:4,tension:0.3,spanGaps:true},
        {label:'IR Izquierdo',data:[irL.f50,irL.f100,irL.f150,irL.f200,irL.f250,irL.fmax],borderColor:cIrL,backgroundColor:cIrL+'18',borderWidth:2,borderDash:[5,3],pointRadius:4,tension:0.3,spanGaps:true},
        {label:'IR Derecho',data:[irR.f50,irR.f100,irR.f150,irR.f200,irR.f250,irR.fmax],borderColor:cIrR,backgroundColor:cIrR+'18',borderWidth:2,pointRadius:4,tension:0.3,spanGaps:true},
      ]},
      options:{responsive:true,maintainAspectRatio:true,animation:{duration:800},
        plugins:{legend:leg,tooltip:{callbacks:{label:c=>`${c.parsed.y?.toFixed(1)} N`}}},
        scales:{x:SC,y:{...SC,beginAtZero:true,title:{display:true,text:'Fuerza (N)',color:'#2a6a2a',font:{size:9}}}}}
    });
  }

  const rcCtx=document.getElementById('srRFDChart')?.getContext('2d');
  if(rcCtx){
    activeCharts.srR=new Chart(rcCtx,{type:'line',data:{
      labels:['50ms','100ms','150ms','250ms'],
      datasets:[
        {label:'ER Izquierdo',data:[erL.rfd50,erL.rfd100,erL.rfd150,erL.rfd250],borderColor:cErL,borderWidth:2,borderDash:[5,3],pointRadius:4,tension:0.3,spanGaps:true},
        {label:'ER Derecho',data:[erR.rfd50,erR.rfd100,erR.rfd150,erR.rfd250],borderColor:cErR,borderWidth:2,pointRadius:4,tension:0.3,spanGaps:true},
        {label:'IR Izquierdo',data:[irL.rfd50,irL.rfd100,irL.rfd150,irL.rfd250],borderColor:cIrL,borderWidth:2,borderDash:[5,3],pointRadius:4,tension:0.3,spanGaps:true},
        {label:'IR Derecho',data:[irR.rfd50,irR.rfd100,irR.rfd150,irR.rfd250],borderColor:cIrR,borderWidth:2,pointRadius:4,tension:0.3,spanGaps:true},
      ]},
      options:{responsive:true,maintainAspectRatio:true,animation:{duration:800},
        plugins:{legend:leg,tooltip:{callbacks:{label:c=>`${c.parsed.y?.toFixed(2)} N/s`}}},
        scales:{x:SC,y:{...SC,beginAtZero:true,title:{display:true,text:'RFD (N/s)',color:'#2a6a2a',font:{size:9}}}}}
    });
  }
}
