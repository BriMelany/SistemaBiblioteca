export interface PrestamoDetalle {
  prestamoId: number | null;
  fechaPrestamo: string;       
  devolucion: string;
  devolucionReal: string | null;
  bibliotecarioNombre: string;
  estado: string;
  reservaId: number | null;

  // Datos de multa
  multaId: number | null;
  monto: number | null;        
  estadoMulta: string | null;

  // Datos del recurso
  isbnIssn: string;
  tipoRecurso: string;
  titulo: string;
  autores: string;
  genero: string;
  editorial: string;
  anoPublicacion: number | null;
  edicion: string;
  clasificacionDdc: string;
  descripcion: string;
  pathImagen: string | null;
  idEjemplar: number | null;
}