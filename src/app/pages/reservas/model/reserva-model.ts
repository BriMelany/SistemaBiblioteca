export interface ReservaModel {
    id: number;
  recurso: string;
  tipoRecurso: string;
  fechaReserva: string;   
  fechaExpiracion: string; 
  estado: string;
  usuario: string;
  notificado: boolean;
  notificadoPor: string; 
  fechaNotificacion: string | null;
    autor?: string;
  editorial?: string;
  portadaUrl?: string;
  penalidades?: string; 
}
