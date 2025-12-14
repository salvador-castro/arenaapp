// src/app/api/admin/translations/eventos/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { openai, OPENAI_MODEL } from '@/lib/openaiClient'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)

    const eventoId = body?.eventoId
    if (!eventoId || typeof eventoId !== 'number') {
      return NextResponse.json(
        { error: 'eventoId es obligatorio y debe ser número' },
        { status: 400 }
      )
    }

    const pool = await getDb()

    // 1) Traer datos del evento en español
    const { rows } = await pool.query(
      `
      SELECT
        id,
        titulo,
        categoria,
        resena,
        descripcion_corta,
        descripcion_larga,
        meta_title,
        meta_description
      FROM public.eventos
      WHERE id = $1
      `,
      [eventoId]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { error: `No se encontró evento con id=${eventoId}` },
        { status: 404 }
      )
    }

    const evento = rows[0]

    // 2) Armar prompt para OpenAI
    const prompt = `
Eres un traductor profesional. Vas a recibir información de un evento en español
y debes traducirla a INGLÉS y PORTUGUÉS (Brasil).

- Mantén el tono natural y descriptivo.
- Respeta los nombres propios y lugares (no los traduzcas).
- Mantén una longitud similar al texto original.
- Si algún campo viene vacío o null, déjalo null en las traducciones.

ENTRADA (español):
{
  "titulo": ${JSON.stringify(evento.titulo)},
  "categoria": ${JSON.stringify(evento.categoria)},
  "resena": ${JSON.stringify(evento.resena)},
  "descripcion_corta": ${JSON.stringify(evento.descripcion_corta)},
  "descripcion_larga": ${JSON.stringify(evento.descripcion_larga)},
  "meta_title": ${JSON.stringify(evento.meta_title)},
  "meta_description": ${JSON.stringify(evento.meta_description)}
}

SALIDA:
Devuelve SOLO un objeto JSON válido (sin comentarios, sin texto extra) con esta forma exacta:

{
  "en": {
    "titulo": "...",
    "categoria": null o "...",
    "resena": null o "...",
    "descripcion_corta": null o "...",
    "descripcion_larga": null o "...",
    "meta_title": null o "...",
    "meta_description": null o "..."
  },
  "pt": {
    "titulo": "...",
    "categoria": null o "...",
    "resena": null o "...",
    "descripcion_corta": null o "...",
    "descripcion_larga": null o "...",
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
      UPDATE public.eventos
      SET
        titulo_en            = $1,
        categoria_en         = $2,
        resena_en            = $3,
        descripcion_corta_en = $4,
        descripcion_larga_en = $5,
        meta_title_en        = $6,
        meta_description_en  = $7,
        titulo_pt            = $8,
        categoria_pt         = $9,
        resena_pt            = $10,
        descripcion_corta_pt = $11,
        descripcion_larga_pt = $12,
        meta_title_pt        = $13,
        meta_description_pt  = $14,
        updated_at           = now()
      WHERE id = $15
      RETURNING id
    `

    const params = [
      en.titulo ?? null,
      en.categoria ?? null,
      en.resena ?? null,
      en.descripcion_corta ?? null,
      en.descripcion_larga ?? null,
      en.meta_title ?? null,
      en.meta_description ?? null,
      pt.titulo ?? null,
      pt.categoria ?? null,
      pt.resena ?? null,
      pt.descripcion_corta ?? null,
      pt.descripcion_larga ?? null,
      pt.meta_title ?? null,
      pt.meta_description ?? null,
      eventoId,
    ]

    const updated = await pool.query(updateQuery, params)

    return NextResponse.json({
      success: true,
      eventoId,
      updated: updated.rows[0],
      translations: parsed,
    })
  } catch (err: any) {
    console.error('Error en /api/admin/translations/eventos', err)
    return NextResponse.json(
      { error: 'Error interno en traducción de eventos' },
      { status: 500 }
    )
  }
}
