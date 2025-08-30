export interface ReservaDetalle {
  reservaId: number;
  fechaReserva: string;        
  fechaExpiracion: string;     
  estado: string;
  sustento: string | null;
  
  recursoId: number;
  tipoRecurso: string;
  tituloRecurso: string;
  esConsultaSala: boolean;

  usuarioId: number;
  usuarioNombre: string;
  usuarioApellido: string;
  usuarioDocumento: string;
}