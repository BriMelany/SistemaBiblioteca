export interface ReservaDetalle {
reservaId: number;
  fechaReserva: string;       // formato "yyyy-MM-dd"
  fechaExpiracion: string;    // formato "yyyy-MM-dd"
  tipoRecursoId: number;
  tipoRecursoNombre: string;
  tituloRecurso: string;
  estado: string;
  notificado: boolean;
  fechaNotificacion: string | null;
  usuario: string;
  notificadoPor: string;
  penalidades?: string; 
}
