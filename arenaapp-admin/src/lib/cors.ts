export const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://arenapress.app',
    'https://www.arenapress.app',
]

/**
 * Devuelve los headers CORS dinámicos según el origen del request.
 * Si el origen está en la lista blanca, lo devuelve en Access-Control-Allow-Origin.
 * Si no (o es null/server-side), devuelve el principal por defecto o null.
 */
export function getCorsHeaders(origin: string | null) {
    // Por defecto, permitir el definido en env o el primero de la lista
    const defaultOrigin = process.env.FRONT_ORIGIN || ALLOWED_ORIGINS[0]

    let allowOrigin = defaultOrigin

    if (origin && ALLOWED_ORIGINS.includes(origin)) {
        allowOrigin = origin
    }

    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Access-Control-Allow-Headers':
            'Content-Type, Authorization, X-Requested-With',
    }
}
