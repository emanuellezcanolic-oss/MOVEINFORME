// MOVE Informe — Groq API (Llama 4 Scout, batched)

/* ===== CLAUDE API CALL — MULTI-IMAGE (BATCHED 2x) ===== */

async function callGroqBatch(apiKey, batchImages, batchIdx, totalImages) {
  const img = batchImages[0];
  const prompt = `Sos experto en evaluación isométrica con Valkyria Trainer (dinamómetro isométrico).

Analizá la imagen ${batchIdx+1} de ${totalImages}.

Identificá:
1. MÚSCULO — uno de estos keys exactos:
   QUAD=Cuádriceps, HAM=Isquiotibiales, EXT_ROT=Rot.Externa, INT_ROT=Rot.Interna, ROW=Remo, MTP=Mid Thigh Pull, OTRO=otro

2. LADO — solo la letra R (Derecho/Right) o L (Izquierdo/Left)

3. MÉTRICAS — todos los valores numéricos de la tabla

Respondé SOLO JSON válido sin markdown:
{"resultados":[{"imagen":${batchIdx+1},"musculo_key":"EXT_ROT","musculo_label":"Rotador Externo Derecho","lado":"R","metrics":{"fmax":null,"favg":null,"finit":null,"tpeak":null,"f50":null,"f100":null,"f150":null,"f200":null,"f250":null,"rfd50":null,"rfd100":null,"rfd150":null,"rfd250":null}}]}
Nunca inventes valores — null si no es claramente visible.`;

  const msgContent = [
    { type: 'image_url', image_url: { url: `data:${img.mime};base64,${img.base64}` } },
    { type: 'text', text: prompt }
  ];

  const body = {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 1024,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: msgContent }]
  };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45000);
  let res;
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
  } catch(e) {
    clearTimeout(timer);
    if (e.name === 'AbortError') throw new Error('Tiempo de espera agotado. La API tardó más de 45s. Reintentá.');
    throw new Error('Error de red: ' + e.message);
  }
  clearTimeout(timer);

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = errBody?.error?.message || `Error API: ${res.status}`;
    if (res.status === 401) throw new Error('API Key inválida.');
    if (res.status === 429) throw new Error('Límite de requests excedido. Esperá 30 segundos y reintentá.');
    throw new Error(msg);
  }

  const result = await res.json();
  const text = result.choices[0].message.content.trim();
  console.log(`[Img ${batchIdx+1}] API raw:`, text.slice(0, 300));

  // Try parsing — multiple strategies
  const strategies = [
    t => JSON.parse(t),
    t => JSON.parse(t.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'')),
    t => { const m = t.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; },
    t => { const m = t.match(/\[[\s\S]*\]/); return m ? { resultados: JSON.parse(m[0]) } : null; }
  ];
  for (const fn of strategies) {
    try { const r = fn(text); if (r) return r; } catch(e) {}
  }

  // All parsing failed — return null result for this image so others still process
  console.warn(`[Img ${batchIdx+1}] JSON parse failed, skipping. Raw:`, text.slice(0,500));
  return { resultados: [] };
}

async function extractWithClaude(apiKey, images, patient) {
  const allResults = [];

  for (let i = 0; i < images.length; i++) {
    const sub = document.getElementById('overlay-sub');
    if (sub) sub.textContent = `Analizando imagen ${i+1} de ${images.length}...`;

    const batchData = await callGroqBatch(apiKey, [images[i]], i, images.length);
    if (batchData.resultados) {
      allResults.push(...batchData.resultados);
    }

    if (i + 1 < images.length) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Detect global test label from results
  const keyCount = {};
  allResults.forEach(r => { keyCount[r.musculo_key] = (keyCount[r.musculo_key] || 0) + 1; });
  const dominant = Object.entries(keyCount).sort((a,b) => b[1]-a[1])[0]?.[0] || 'OTRO';
  const labelMap = {
    QUAD: 'Cuádriceps Bilateral', HAM: 'Isquiotibiales Bilateral',
    EXT_ROT: 'Rotadores Externos de Hombro', INT_ROT: 'Rotadores Internos de Hombro',
    ROW: 'Remo Isométrico Bilateral', MTP: 'Mid Thigh Pull Bilateral', OTRO: 'Evaluación Isométrica'
  };
  const musculo_global = Object.keys(keyCount).length > 1
    ? 'Perfil Rotador de Hombro (ER + IR)'
    : (labelMap[dominant] || 'Evaluación Isométrica');

  return { musculo_global, resultados: allResults };
}
