export interface Multa {
  prestamoId: number;
  estado: 'Pendiente' | 'Pagada' | 'Condonada';
  motivo: string;
  monto: number;
  fechaGeneracion: string;
  usuarioDocumento: string;
  multaId: number;
  usuarioId: number;
  usuarioNombre: string;
  fechaPago?: string;
  diasRetraso: number;

}
