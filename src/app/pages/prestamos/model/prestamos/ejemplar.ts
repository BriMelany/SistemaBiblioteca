export interface Ejemplar {
  id: number;
  codigoBarras: string;
  estadoFisico: string;
  ubicacionNombre: string;
  observaciones?: string;
  disponible?: boolean;
}