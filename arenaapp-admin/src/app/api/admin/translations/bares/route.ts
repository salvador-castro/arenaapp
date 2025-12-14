// src/app/api/admin/translations/bares/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { openai, OPENAI_MODEL } from '@/lib/openaiClient'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const barId = body?.barId
    if (!barId || typeof barId !== 'number') {
      return NextResponse.json(
        { error: 'barId es obligatorio y debe ser número' },
        { status: 400 }
      )
    }

    const pool = await getDb()

    // 1) Traer datos del bar en español
    const { rows } = await pool.query(
      `
      SELECT
        id,
        nombre,
        descripcion_corta,
        descripcion_larga,
        resena,
        horario_text,
        tipo_comida,
        meta_title,
        meta_description
      FROM public.bares
      WHERE id = $1
      `,
      [barId]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { error: `No se encontró bar con id=${barId}` },
        { status: 404 }
      )
    }

    const bar = rows[0]

    // 2) Armar prompt para OpenAI
    const prompt = `
Eres un traductor profesional. Vas a recibir información de un bar en español
y debes traducirla a INGLÉS y PORTUGUÉS (Brasil).

- Mantén el tono natural y descriptivo.
- Respeta los nombres propios y lugares (no los traduzcas).
- Mantén una longitud similar al texto original.
- Si algún campo viene vacío o null, déjalo null en las traducciones.

ENTRADA (español):
{
  "nombre": ${JSON.stringify(bar.nombre)},
  "descripcion_corta": ${JSON.stringify(bar.descripcion_corta)},
  "descripcion_larga": ${JSON.stringify(bar.descripcion_larga)},
  "resena": ${JSON.stringify(bar.resena)},
  "horario_text": ${JSON.stringify(bar.horario_text)},
  "tipo_comida": ${JSON.stringify(bar.tipo_comida)},
  "meta_title": ${JSON.stringify(bar.meta_title)},
  "meta_description": ${JSON.stringify(bar.meta_description)}
}

SALIDA:
Devuelve SOLO un objeto JSON válido (sin comentarios, sin texto extra) con esta forma exacta:

{
  "en": {
    "nombre": "...",
    "descripcion_corta": null o "...",
    "descripcion_larga": null o "...",
    "resena": null o "...",
    "horario_text": null o "...",
    "tipo_comida": null o "...",
    "meta_title": null o "...",
    "meta_description": null o "..."
  },
  "pt": {
    "nombre": "...",
    "descripcion_corta": null o "...",
    "descripcion_larga": null o "...",
    "resena": null o "...",
    "horario_text": null o "...",
    "tipo_comida": null o "...",
    "meta_title": null o "...",
    "meta_description": null o "..."
  }
}
    `.trim()

    // 3) Llamada a OpenAI
    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Eres un traductor profesional de español a inglés y portugués (Brasil). Siempre devuelves JSON válido.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content?.trim() ?? ''

    let parsed: any
    try {
      parsed = JSON.parse(content)
    } catch (e) {
      console.error('No se pudo parsear JSON de OpenAI:', content)
      return NextResponse.json(
        {
          error: 'La respuesta de OpenAI no fue un JSON válido',
          raw: content,
        },
        { status: 502 }
      )
    }

    const en = parsed.en ?? {}
    const pt = parsed.pt ?? {}

    // 4) Actualizar las columnas *_en y *_pt en la tabla
    const updateQuery = `
      UPDATE public.bares
      SET
        nombre_en            = $1,
        descripcion_corta_en = $2,
        descripcion_larga_en = $3,
        resena_en            = $4,
        horario_text_en      = $5,
        tipo_comida_en       = $6,
        meta_title_en        = $7,
        meta_description_en  = $8,
        nombre_pt            = $9,
        descripcion_corta_pt = $10,
        descripcion_larga_pt = $11,
        resena_pt            = $12,
        horario_text_pt      = $13,
        tipo_comida_pt       = $14,
        meta_title_pt        = $15,
        meta_description_pt  = $16,
        updated_at           = now()
      WHERE id = $17
      RETURNING id
    `

    const params = [
      en.nombre ?? null,
      en.descripcion_corta ?? null,
      en.descripcion_larga ?? null,
      en.resena ?? null,
      en.horario_text ?? null,
      en.tipo_comida ?? null,
      en.meta_title ?? null,
      en.meta_description ?? null,
      pt.nombre ?? null,
      pt.descripcion_corta ?? null,
      pt.descripcion_larga ?? null,
      pt.resena ?? null,
      pt.horario_text ?? null,
      pt.tipo_comida ?? null,
      pt.meta_title ?? null,
      pt.meta_description ?? null,
      barId,
    ]

    const updated = await pool.query(updateQuery, params)

    return NextResponse.json({
      success: true,
      barId,
      updated: updated.rows[0],
      translations: parsed,
    })
  } catch (err: any) {
    console.error('Error en /api/admin/translations/bares', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de bares' },
      { status: 500 }
    )
  }
}
