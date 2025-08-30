export interface PrestamoModel {
  prestamoId: number;
  fechaPrestamo: string;     
  devolucion: string;
  devolucionReal: string | null;
  usuario: string;
  bibliotecario: string;
  codigoBarras: string;
  estado: string;
  idEjemplar: number | null;
  idReserva: number | null;
}