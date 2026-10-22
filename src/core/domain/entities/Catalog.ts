/** Tipo/categoría del catálogo de actividades (ej. "RUTINAS"). */
export interface CatalogCategory {
  id: string;
  /** Se muestra en mayúsculas, ej. "RUTINAS" */
  label: string;
  bg: string;
  stroke: string;
  /** Orden de aparición en el catálogo */
  order?: number;
}

/** Actividad disponible en el catálogo para construir "Mi día". */
export interface CatalogItem {
  id: string;
  /** Clave de ICON_MAP en PictoIcon */
  iconKey: string;
  /** Foto propia (data URI comprimida) — reemplaza al ícono. */
  imageUri?: string;
  label: string;
  categoryId: string;
}
