
import { DateTime } from 'luxon';
import { BaseModel, HasMany, column, hasMany} from '@ioc:Adonis/Lucid/Orm';
import { ClasificacionesUsuario } from 'App/Dominio/Datos/Entidades/ClasificacionesUsuario';

export default class TblClasificacionesUsuario extends BaseModel {
  public static table = 'tbl_clasificacion_usuarios';
  @column({ isPrimary: true, columnName: 'clu_id' })
  public id?: number

@column({ columnName: 'clu_usuario_id' }) public usuarioId:string;
@column({ columnName: 'clu_clasificacion_id' }) public clasificacionId:number;
@column({ columnName: 'estado' }) public estado:boolean;
  
  public establecerClasificacionesUsuarioDb (clasificacionesUsuario: ClasificacionesUsuario) {
    this.id = clasificacionesUsuario.id
    this.usuarioId = clasificacionesUsuario.usuarioId
    this.clasificacionId = clasificacionesUsuario.clasificacionId
    this.estado = clasificacionesUsuario.estado
  }

  public estableceClasificacionesUsuarioConId (clasificacionesUsuario: ClasificacionesUsuario) {
    this.usuarioId = clasificacionesUsuario.usuarioId
    this.clasificacionId = clasificacionesUsuario.clasificacionId
    this.estado = clasificacionesUsuario.estado
  }

  public obtenerClasificacionesUsuario (): ClasificacionesUsuario {
    const clasificacionesUsuario = new ClasificacionesUsuario()
     clasificacionesUsuario.usuarioId = this.usuarioId 
     clasificacionesUsuario.clasificacionId = this.clasificacionId 
     clasificacionesUsuario.estado = this.estado 
    return clasificacionesUsuario
  }


}
