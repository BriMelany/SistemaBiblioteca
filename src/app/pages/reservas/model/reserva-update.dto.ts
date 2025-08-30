export type EstadoApi =  'cumplida'|'expirada'|'pendiente';

export interface ReservaUpdate {
estado: EstadoApi;
  notificado: boolean;
  fechaNotificacion: string | null;
  sustento?: string | null;
  penalidades?: boolean;
  montoPenalidad?: number;
}
