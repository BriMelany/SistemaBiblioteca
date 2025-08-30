export interface  PrestamoRecurso {
  recursoId: number;
  fechaActual: string; 
  tipoRecurso: string;
  tituloRecurso: string;
  fechaLimite: string;
  estadosPrestamo: string[];
  tiposRecurso: string[];
}