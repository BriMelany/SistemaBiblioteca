export interface CatalogoApi {
    id: number;
  nombreTipo: string;
  titulo: string;
  autores: string;
  nombreEditorial: string;
  anoPublicacion: number;
  nombreGenero: string;
  esConsultaSala: boolean;
  isbnIssn?: string | null;
  subtitulo?: string | null;
  descripcion?: string | null;
  pathImagen?: string | null;
  cantidadEjemplares?: number | null;

  idTipoRecurso?: number;
  idEditorial?: number;
  idGenero?: number;

  fechaIngreso?: string | null;
  estado?: 'Activo' | 'En revision' | 'Retirado' | null;
}
