export interface CatalogoVista {
    id: number;
  tipo: string;
  titulo: string;
  autor: string;
  editorial: string;
  anio: number;
   isbn: string;
  categoria: string;
  subtitulo?: string;
  descripcion?: string;
  fecha_ingreso?: Date;

  // extras para staff
  ejemplares?: number;
  es_consulta_sala: boolean;
  portadaUrl?: string;
  estado?: 'Activo' | 'En revision' | 'Retirado' | null;
}
