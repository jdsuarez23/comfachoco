const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LABELS = [
  'MEDICO',
  'VACACIONES',
  'PERSONAL',
  'CALAMIDAD',
  'ESTUDIO',
  'JUDICIAL',
  'LABORAL',
];

async function classifyMotivo(motivo) {
  try {
    const system =
      'Eres un clasificador experto de motivos de solicitudes de permiso laborales en español. '
      + 'Devuelve SOLO una de las etiquetas permitidas sin explicación: '
      + LABELS.join(', ')
      + '. Interpreta el texto y el contexto. No inventes etiquetas.';

    const user = `Motivo: ${motivo}\nEtiqueta:`;

    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0,
      max_tokens: 5,
    });

    const text = resp.choices?.[0]?.message?.content?.trim()?.toUpperCase() || '';
    const label = LABELS.includes(text) ? text : 'PERSONAL';
    return { success: true, label };
  } catch (err) {
    console.error('AI classification error:', err.message);
    return { success: false, label: 'PERSONAL', error: err.message };
  }
}

module.exports = { classifyMotivo, LABELS };
