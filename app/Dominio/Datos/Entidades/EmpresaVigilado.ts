export class EmpresaVigilado {
  id?: number;
  idEmpresa: string;
  idVigilado: string;
  token: string;
  estado: boolean;
  fechaInicial: Date;
  fechaFinal:Date;
  documento?: string;
  ruta?: string;
  nombreOriginal?: string;
}
