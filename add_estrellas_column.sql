-- ============================================
-- Agregar campo 'estrellas' a eventos y galerias
-- ============================================

-- 1. Agregar columna estrellas a la tabla eventos
ALTER TABLE public.eventos 
ADD COLUMN IF NOT EXISTS estrellas SMALLINT NULL;

-- Agregar comentario a la columna eventos.estrellas
COMMENT ON COLUMN public.eventos.estrellas IS 'Calificación del evento en estrellas (1-5)';

-- Agregar constraint para validar que las estrellas estén entre 1 y 5
ALTER TABLE public.eventos 
ADD CONSTRAINT eventos_estrellas_check 
CHECK (estrellas IS NULL OR (estrellas >= 1 AND estrellas <= 5));

-- 2. Agregar columna estrellas a la tabla galerias
ALTER TABLE public.galerias 
ADD COLUMN IF NOT EXISTS estrellas SMALLINT NULL;

-- Agregar comentario a la columna galerias.estrellas
COMMENT ON COLUMN public.galerias.estrellas IS 'Calificación de la galería en estrellas (1-5)';

-- Agregar constraint para validar que las estrellas estén entre 1 y 5
ALTER TABLE public.galerias 
ADD CONSTRAINT galerias_estrellas_check 
CHECK (estrellas IS NULL OR (estrellas >= 1 AND estrellas <= 5));

-- ============================================
-- Opcional: Crear índices para mejor performance
-- ============================================

-- Crear índice en eventos.estrellas para búsquedas y filtros
CREATE INDEX IF NOT EXISTS idx_eventos_estrellas 
ON public.eventos USING btree (estrellas) 
TABLESPACE pg_default;

-- Crear índice en galerias.estrellas para búsquedas y filtros
CREATE INDEX IF NOT EXISTS idx_galerias_estrellas 
ON public.galerias USING btree (estrellas) 
TABLESPACE pg_default;

-- ============================================
-- Verificación
-- ============================================

-- Verificar que las columnas se agregaron correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('eventos', 'galerias')
  AND column_name = 'estrellas';
