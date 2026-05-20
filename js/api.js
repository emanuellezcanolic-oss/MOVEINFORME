// MOVE Informe — Groq API (Llama 4 Scout, batched)

/* ===== CLAUDE API CALL — MULTI-IMAGE (BATCHED 2x) ===== */

async function callGroqBatch(apiKey, batchImages, batchIdx, totalImages) {
  const img = batchImages[0];
  const prompt = `You are analyzing a screenshot from Valkyria Trainer isometric dynamometer software.

IMAGE ${batchIdx+1} OF ${totalImages}.

## TASK
Read the EXACT numeric values visible in this screenshot. DO NOT estimate, calculate, or infer any value. If you cannot read a number clearly and precisely, use null.

## VALKYRIA TRAINER UI LAYOUT
The software shows a results table with rows like:
- "Force Max" or "Fmax" → peak force in Newtons (N), typically 20–800 N → maps to fmax
- "Force Avg" or "Favg" → average force in Newtons (N) → maps to favg
- "Force Init" or "Finit" → initial force in Newtons (N) → maps to finit
- "Time to Peak" or "Tpeak" or "Time Max Force" → time in seconds (s), 0.2–10 s → maps to tpeak
- "Force at 50" or "F50" or "Force 50ms" → force value at 50ms time point in N (NOT N/s) → maps to f50
- "Force at 100" or "F100" or "Force 100ms" → force value at 100ms time point in N → maps to f100
- "Force at 150" or "F150" or "Force 150ms" → force value at 150ms time point in N → maps to f150
- "Force at 200" or "F200" or "Force 200ms" → force value at 200ms time point in N → maps to f200
- "Force at 250" or "F250" or "Force 250ms" → force value at 250ms time point in N → maps to f250
- "RFD at 50" or "RFD 50ms" → rate of force development at 50ms in N/s → maps to rfd50
- "RFD at 100" or "RFD 100ms" → rate of force development at 100ms in N/s → maps to rfd100
- "RFD at 150" or "RFD 150ms" → rate of force development at 150ms in N/s → maps to rfd150
- "RFD at 200" or "RFD 200ms" → rate of force development at 200ms in N/s → maps to rfd200
- "RFD at 250" or "RFD 250ms" → rate of force development at 250ms in N/s → maps to rfd250

The muscle name and side (Right/Left or Derecho/Izquierdo) usually appear in the header or title area of the screen.

## STRICT RULES
1. ONLY report numbers you can read character-by-character from the image
2. If a row is missing, partially cut off, or unclear → null
3. NEVER calculate or estimate a value from other values
4. NEVER use placeholder or example values
5. RFD values are typically 50–2000 N/s; Force values 20–800 N; Time 0.2–5.0 s — if your reading falls outside these, double-check or use null

## MUSCLE KEY
Use exactly one of: QUAD, HAM, EXT_ROT, INT_ROT, ROW, MTP, OTRO

## SIDE
Use exactly R (Right/Derecho) or L (Left/Izquierdo)

Respond ONLY with valid JSON matching this structure (replace ALL placeholder values with what you actually read from the image):
{"resultados":[{"imagen":${batchIdx+1},"musculo_key":"<one of: QUAD|HAM|EXT_ROT|INT_ROT|ROW|MTP|OTRO>","musculo_label":"<full name of the muscle and side shown in the image>","lado":"<R if Right/Derecho or L if Left/Izquierdo>","metrics":{"fmax":<number or null>,"favg":<number or null>,"finit":<number or null>,"tpeak":<number or null>,"f50":<number or null>,"f100":<number or null>,"f150":<number or null>,"f200":<number or null>,"f250":<number or null>,"rfd50":<number or null>,"rfd100":<number or null>,"rfd150":<number or null>,"rfd250":<number or null>}}]}`;

  const msgContent = [
    { type: 'image_url', image_url: { url: `data:${img.mime};base64,${img.base64}` } },
    { type: 'text', text: prompt }
  ];

  const body = {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 2048,
    temperature: 0,
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

  async function callWithRetry(img, idx, total, maxRetries=3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await callGroqBatch(apiKey, [img], idx, total);
      } catch(e) {
        const is429 = e.message && (e.message.includes('429') || e.message.includes('Límite'));
        if (is429 && attempt < maxRetries - 1) {
          const waitSec = 35 + attempt * 20;
          const sub = document.getElementById('overlay-sub');
          for (let s = waitSec; s > 0; s--) {
            if (sub) sub.textContent = `Límite de requests — esperando ${s}s antes de reintentar imagen ${idx+1}...`;
            await new Promise(r => setTimeout(r, 1000));
          }
        } else {
          throw e;
        }
      }
    }
  }

  for (let i = 0; i < images.length; i++) {
    const sub = document.getElementById('overlay-sub');
    if (sub) sub.textContent = `Analizando imagen ${i+1} de ${images.length}...`;

    const batchData = await callWithRetry(images[i], i, images.length);
    if (batchData.resultados) {
      allResults.push(...batchData.resultados);
    }

    if (i + 1 < images.length) {
      await new Promise(r => setTimeout(r, 4000));
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
