// MOVE Informe — Groq API (visión, con modelos de respaldo)

const GROQ_MODELS = [
  'qwen/qwen3.8-27b',
  'qwen/qwen3.6-27b',
  'meta-llama/llama-4-maverick-17b-128e-instruct'
];
let groqModelIdx = 0;

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
    model: GROQ_MODELS[groqModelIdx],
    max_tokens: 4096,
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [{ role: 'user', content: msgContent }]
  };

  let res, errBody, msg;
  let mi = groqModelIdx;
  let useReasoningFmt = true;
  while (true) {
    body.model = GROQ_MODELS[mi];
    if (useReasoningFmt && body.model.startsWith('qwen/')) { body.reasoning_format = 'hidden'; body.reasoning_effort = 'none'; }
    else { delete body.reasoning_format; delete body.reasoning_effort; }
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 45000);
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
    if (res.ok) { groqModelIdx = mi; break; }
    errBody = await res.json().catch(() => ({}));
    msg = errBody?.error?.message || `Error API: ${res.status}`;
    if (res.status === 400 && (body.reasoning_format || body.reasoning_effort) && /reasoning/i.test(msg)) { useReasoningFmt = false; continue; }
    if (res.status === 400 && body.response_format && /response_format|json/i.test(msg)) { delete body.response_format; continue; }
    const badModel = res.status === 404 || errBody?.error?.code === 'model_not_found' || /does not exist|decommissioned|model_not_found|(does not|not) support(ed)? (image|vision)/i.test(msg);
    if (!badModel || mi + 1 >= GROQ_MODELS.length) break;
    console.warn(`Modelo ${GROQ_MODELS[mi]} no disponible: ${msg}`);
    mi++;
    useReasoningFmt = true;
  }

  if (!res.ok) {
    if (res.status === 401) throw new Error('API Key inválida.');
    if (res.status === 429) throw new Error('Límite de requests excedido. Esperá 30 segundos y reintentá.');
    const e = new Error(msg);
    if (res.status >= 500 || res.status === 498) e.retryable = true;
    throw e;
  }

  const result = await res.json();
  const text = (result.choices?.[0]?.message?.content || '')
    .replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/^[\s\S]*<\/think>/i, '').trim();
  console.log(`[Img ${batchIdx+1}] API raw:`, text.slice(0, 300));

  // Try parsing — multiple strategies
  const strategies = [
    t => JSON.parse(t),
    t => JSON.parse(t.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,'')),
    t => { const i = t.indexOf('{"resultados"'); return i >= 0 ? JSON.parse(t.slice(i, t.lastIndexOf('}') + 1)) : null; },
    t => { const m = t.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; },
    t => { const m = t.match(/\[[\s\S]*\]/); return m ? { resultados: JSON.parse(m[0]) } : null; }
  ];
  for (const fn of strategies) {
    try { const r = fn(text); if (r) return r.resultados ? r : { resultados: [r] }; } catch(e) {}
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
        if ((is429 || e.retryable) && attempt < maxRetries - 1) {
          const waitSec = is429 ? 35 + attempt * 20 : 5;
          const sub = document.getElementById('overlay-sub');
          for (let s = waitSec; s > 0; s--) {
            if (sub) sub.textContent = is429
              ? `Límite de requests — esperando ${s}s antes de reintentar imagen ${idx+1}...`
              : `Groq no respondió — reintentando imagen ${idx+1} en ${s}s...`;
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
      allResults.push(...batchData.resultados.map(r => ({ ...r, _img: i })));
    }

    if (i + 1 < images.length) {
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  if (!allResults.length) throw new Error('La IA no devolvió datos legibles de las capturas. Reintentá.');

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
