// src/lib/translateHelper.ts
import { getOpenAIClient, OPENAI_MODEL } from './openaiClient'
import { getDb } from './db'

export type TranslatableEntity =
  | 'bares'
  | 'cafes'
  | 'eventos'
  | 'galerias'
  | 'hoteles'
  | 'restaurantes'
  | 'shopping'

/**
 * Traduce automáticamente una entidad usando OpenAI
 * Se ejecuta en background y no bloquea la operación principal
 */
export async function autoTranslate(
  entity: TranslatableEntity,
  id: number
): Promise<void> {
  try {
    const pool = await getDb()

    // 1) Determinar campos según entidad
    const fieldConfig = getFieldsForEntity(entity)

    // 2) Traer datos en español
    const { rows } = await pool.query(
      `SELECT ${fieldConfig.selectFields} FROM ${entity} WHERE id = $1`,
      [id]
    )

    if (rows.length === 0) {
      console.warn(`[autoTranslate] ${entity} id=${id} no encontrado`)
      return
    }

    const item = rows[0]

    // 3) Armar prompt para OpenAI
    const prompt = buildTranslationPrompt(entity, item, fieldConfig.fields)

    // 4) Llamar a OpenAI
    const client = getOpenAIClient()
    const completion = await client.chat.completions.create({
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
      const error = `Error parseando JSON de OpenAI: ${content.substring(0, 200)}`
      console.error('[autoTranslate]', error)
      throw new Error(error)
    }

    const en = parsed.en ?? {}
    const pt = parsed.pt ?? {}

    // 5) Actualizar columnas traducidas
    await updateTranslations(pool, entity, id, en, pt, fieldConfig.fields)

    console.log(`[autoTranslate] ✅ ${entity} id=${id} traducido exitosamente`)
  } catch (err) {
    console.error(`[autoTranslate] ❌ Error traduciendo ${entity} id=${id}:`, err)
    // Lanzar el error para que el endpoint lo pueda reportar
    throw err
  }
}

/**
 * Configuración de campos por entidad
 */
function getFieldsForEntity(entity: TranslatableEntity) {
  const configs: Record<
    TranslatableEntity,
    { fields: string[]; selectFields: string }
  > = {
    bares: {
      fields: [
        'nombre',
        'descripcion_corta',
        'descripcion_larga',
        'resena',
        'horario_text',
        'tipo_comida',
        'meta_title',
        'meta_description',
      ],
      selectFields:
        'nombre, descripcion_corta, descripcion_larga, resena, horario_text, tipo_comida, meta_title, meta_description',
    },
    cafes: {
      fields: [
        'nombre',
        'descripcion_corta',
        'descripcion_larga',
        'resena',
        'horario_text',
        'tipo_comida',
        'meta_title',
        'meta_description',
      ],
      selectFields:
        'nombre, descripcion_corta, descripcion_larga, resena, horario_text, tipo_comida, meta_title, meta_description',
    },
    eventos: {
      fields: [
        'titulo',
        'categoria',
        'resena',
        'meta_title',
        'meta_description',
      ],
      selectFields:
        'titulo, categoria, resena, meta_title, meta_description',
    },
    galerias: {
      fields: [
        'nombre',
        'descripcion_corta',
        'resena',
        'meta_title',
        'meta_description',
      ],
      selectFields:
        'nombre, descripcion_corta, resena, meta_title, meta_description',
    },
    hoteles: {
      fields: [
        'nombre',
        'descripcion_corta',
        'descripcion_larga',
        'resena',
        'horario_text',
        'meta_title',
        'meta_description',
      ],
      selectFields:
        'nombre, descripcion_corta, descripcion_larga, resena, horario_text, meta_title, meta_description',
    },
    restaurantes: {
      fields: [
        'nombre',
        'descripcion_corta',
        'descripcion_larga',
        'resena',
        'horario_text',
        'tipo_comida',
        'meta_title',
        'meta_description',
      ],
      selectFields:
        'nombre, descripcion_corta, descripcion_larga, resena, horario_text, tipo_comida, meta_title, meta_description',
    },
    shopping: {
      fields: [
        'nombre',
        'descripcion_corta',
        'descripcion_larga',
        'resena',
        'horario_text',
        'meta_title',
        'meta_description',
      ],
      selectFields:
        'nombre, descripcion_corta, descripcion_larga, resena, horario_text, meta_title, meta_description',
    },
  }

  return configs[entity]
}

/**
 * Construye el prompt para OpenAI
 */
function buildTranslationPrompt(
  entity: string,
  item: any,
  fields: string[]
): string {
  const fieldValues = fields.reduce((acc, field) => {
    acc[field] = item[field] ?? null
    return acc
  }, {} as Record<string, any>)

  const fieldList = fields.map(f => `"${f}": null o "..."`).join(',\n    ')

  return `
Eres un traductor profesional. Vas a recibir información de un ${entity} en español
y debes traducirla a INGLÉS y PORTUGUÉS (Brasil).

- Mantén el tono natural y descriptivo.
- Respeta los nombres propios y lugares (no los traduzcas).
- Mantén una longitud similar al texto original.
- Si algún campo viene vacío o null, déjalo null en las traducciones.

ENTRADA (español):
${JSON.stringify(fieldValues, null, 2)}

SALIDA:
Devuelve SOLO un objeto JSON válido (sin comentarios, sin texto extra) con esta forma exacta:

{
  "en": {
    ${fieldList}
  },
  "pt": {
    ${fieldList}
  }
}
  `.trim()
}

/**
 * Actualiza las columnas traducidas en la BD
 */
async function updateTranslations(
  pool: any,
  entity: string,
  id: number,
  en: any,
  pt: any,
  fields: string[]
) {
  const setClauses: string[] = []
  const params: any[] = []
  let paramIndex = 1

  fields.forEach(field => {
    setClauses.push(`${field}_en = $${paramIndex}`)
    params.push(en[field] ?? null)
    paramIndex++

    setClauses.push(`${field}_pt = $${paramIndex}`)
    params.push(pt[field] ?? null)
    paramIndex++
  })

  setClauses.push(`updated_at = now()`)
  params.push(id)

  const query = `
    UPDATE ${entity}
    SET ${setClauses.join(', ')}
    WHERE id = $${paramIndex}
  `

  await pool.query(query, params)
}
