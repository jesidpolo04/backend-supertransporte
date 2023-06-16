import { EnviadorEmail } from 'App/Dominio/Email/EnviadorEmail';
import { Encriptador } from 'App/Dominio/Encriptacion/Encriptador';
import { RepositorioReporte } from 'App/Dominio/Repositorios/RepositorioReporte'
import { RepositorioUsuario } from 'App/Dominio/Repositorios/RepositorioUsuario';
import { GeneradorContrasena } from 'App/Dominio/GenerarContrasena/GenerarContrasena';
import { ServicioUsuario } from './ServicioUsuario';
import { Reportadas } from 'App/Dominio/Dto/Encuestas/Reportadas';
import { Paginador } from 'App/Dominio/Paginador';
import { PayloadJWT } from 'App/Dominio/Dto/PayloadJWT';

export class ServicioReportes {
  constructor (private repositorio: RepositorioReporte,
    private servicioUsuarios: ServicioUsuario) { 
      
    }
  

  async obtenerVerificadores(): Promise<any> {    
    return await this.servicioUsuarios.obtenerUsuarioPorRol('002')
  }

  async obtenerAsignadas(params: any): Promise<{ reportadas: Reportadas[], paginacion: Paginador }> {
    params.pagina = params.pagina??1;
    params.limite = params.limite??100;
    return this.repositorio.obtenerAsignadas(params);
  }

  async asignar(datos: string, payload:PayloadJWT): Promise<AsyncGeneratorFunction> {
    const asignador = payload.documento;
    return this.repositorio.asignar(datos, asignador);
  }

  async eliminar(reporte: string, payload:PayloadJWT): Promise<AsyncGeneratorFunction> {
    const asignador = payload.documento;
    return this.repositorio.eliminar(reporte, asignador);
  }


}
