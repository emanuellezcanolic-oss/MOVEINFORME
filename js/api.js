// MOVE Informe — Groq API (Llama 4 Scout, batched)

/* ===== CLAUDE API CALL — MULTI-IMAGE (BATCHED 2x) ===== */

async function callGroqBatch(apiKey, batchImages, batchIdx, totalImages) {
  const batchCount = batchImages.length;
  const prompt = `Sos experto en evaluación isométrica con el software Valkyria Trainer (dinamómetro isométrico).

Analizá las ${batchCount} imagen(es) de esta tanda (imágenes ${batchIdx+1} a ${batchIdx+batchCount} de ${totalImages} en total).

Para CADA imagen identificá:
1. MÚSCULO — usá exactamente uno de estos keys:
   QUAD = Cuádriceps / Quadriceps / Mid Thigh Push
   HAM = Isquiotibiales / Hamstrings
   EXT_ROT = Rotación Externa / External Rotation / Shoulder External Rotator
   INT_ROT = Rotación Interna / Internal Rotation / Shoulder Internal Rotator
   ROW = Remo Isométrico / Isometric Row
   MTP = Mid Thigh Pull
   OTRO = cualquier otro músculo

2. LADO — R (Derecho/Right) o L (Izquierdo/Left). Leé el título de la imagen.

3. MÉTRICAS — extraé TODOS los valores numéricos visibles en la tabla.

Respondé SOLO con JSON válido, sin texto ni markdown:
{
  "resultados": [
    {
      "imagen": 1,
      "musculo_key": "EXT_ROT",
      "musculo_label": "Rotador Externo Derecho",
      "lado": "R",
      "metrics": {
        "fmax": null, "favg": null, "finit": null, "tpeak": null,
        "f50": null, "f100": null, "f150": null, "f200": null, "f250": null,
        "rfd50": null, "rfd100": null, "rfd150": null, "rfd250": null
      }
    }
  ]
}
REGLA CRÍTICA: UN objeto por imagen, en el MISMO ORDEN enviado. Nunca inventes valores — null si no es claramente visible.`;

  const msgContent = [
    ...batchImages.map(img => ({
      type: 'image_url',
      image_url: { url: `data:${img.mime};base64,${img.base64}` }
    })),
    { type: 'text', text: prompt }
  ];

  const body = {
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    max_tokens: 1024,
    messages: [{ role: 'user', content: msgContent }]
  };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = errBody?.error?.message || `Error API: ${res.status}`;
    if (res.status === 401) throw new Error('API Key inválida.');
    if (res.status === 429) throw new Error('Límite de requests excedido. Esperá un momento y reintentá.');
    throw new Error(msg);
  }

  const result = await res.json();
  const text = result.choices[0].message.content.trim();
  const cleaned = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); }
  catch(e) {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) try { return JSON.parse(m[0]); } catch(e2) {}
    throw new Error('La IA devolvió un formato inesperado en la tanda. Reintentá.');
  }
}

async function extractWithClaude(apiKey, images, patient) {
  const BATCH_SIZE = 2;
  const allResults = [];

  for (let i = 0; i < images.length; i += BATCH_SIZE) {
    const batch = images.slice(i, i + BATCH_SIZE);
    const batchData = await callGroqBatch(apiKey, batch, i, images.length);
    if (batchData.resultados) {
      allResults.push(...batchData.resultados);
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
