
import { RepositorioModalidad } from 'App/Dominio/Repositorios/RepositorioModalidad'
import { Paginador } from '../../../Dominio/Paginador';
import { Modalidad } from 'App/Dominio/Datos/Entidades/Modalidad';
import TblModalidades from 'App/Infraestructura/Datos/Entidad/modalidad';
import TblTiposCategorias from 'App/Infraestructura/Datos/Entidad/TipoCategoria';
import { ModalidadRadio } from 'App/Dominio/Datos/Entidades/ModalidadRadio';
import Database from '@ioc:Adonis/Lucid/Database';
import TblModalidadesRadios from 'App/Infraestructura/Datos/Entidad/ModalidadRadio';

export class RepositorioModalidadDB implements RepositorioModalidad {

  async obtenerModalidades(): Promise<{ modalidades: Modalidad[] }> {
    const modalidades: Modalidad[] = []
    const modalidadDB = await TblModalidades.query()
    modalidadDB.forEach(modalidadDB => {
      modalidades.push(modalidadDB.obtenerModalidad())
    })
    return { modalidades }
  }

  async filtros(idUsuario: string): Promise<{}> {
    if(!idUsuario) return {mensaje: 'Usuario requerido'}

    const cabecerasModalidades = ["Modalidad", "Radio de acción u operación"];
    const filasModalidades: any[] = [];

    const modalidades = await TblModalidades.query().preload('radios', (sql) => {
      sql.where('tmr_usuario_id', idUsuario)
    }).has('radios')


    modalidades.forEach(modalidad => {
      modalidad.radios.forEach(radio => {
        filasModalidades.push({
          id: radio.$extras.pivot_tmr_id,
          modalidad:modalidad.nombre,
          radio: radio.nombre
         /*  modalidad: {
            idModalidad: modalidad.id,
            nombre: modalidad.nombre
          },
          radio: {
            idRadio: radio.id,
            nombre: radio.nombre
          } */

        })
      });

    });

    const modalidadRadio = {
      cabeceras: cabecerasModalidades,
      filas: filasModalidades
    };


    const tipoCategoria: any[] = [];

    const tiposCategoria = await TblTiposCategorias.query().preload('categoriaClasificacion', (sqlCat) => {
      sqlCat.preload('filaClasificacion', (sqlFila) => {
        sqlFila.preload('filasColumas', (sqlFilaCol) => {
          sqlFilaCol.preload('detalles', (sqlDet) => {
            sqlDet.where('usuarioId', idUsuario)
          })
        }).preload('filasColumnasDet')
      })
    }).orderBy('orden', 'asc')

    tiposCategoria.forEach(tipCategoria => {
      // console.log(tipoCategoria); //conductores
      const categoriaClasificacion: any[] = [];
      tipCategoria.categoriaClasificacion.forEach(catClasificacion => {
        //  console.log(catClasificacion); //Tipo contratación'

        const cabeceras: any[] = [];
        const filas: any[] = [];
        catClasificacion.filaClasificacion.forEach(filClasificacion => {
          const datos: any[] = [];
          filClasificacion.filasColumas.forEach(filColumas => {
            console.log(filColumas);
            
            if (filColumas.detalles.length >= 1) {
              datos.push({
                idFila: filClasificacion.id,     
                idColumna: filColumas.id,        
                //idDetalle: (filColumas.detalles[0].id)??'',
                valor: (filColumas.detalles[0].valor)??0
              })
            }else{
              datos.push({
                idFila: filClasificacion.id,   
                idColumna: filColumas.id,             
              //  idDetalle:null,
                valor: null
              })
            }
          });

          filas.push(
            {              
              nombre: filClasificacion.nombre,
              datos
            }
          )



          filClasificacion.filasColumnasDet.forEach(filColumnasDet => {
            if (!cabeceras.includes(filColumnasDet.nombre)) {
              cabeceras.push(filColumnasDet.nombre)
            }
          });


        });

        categoriaClasificacion.push({
          id: catClasificacion.id,
          nombre: catClasificacion.nombre,
          orden: catClasificacion.orden,
          cabeceras,
          filas
        })

      });

      tipoCategoria.push({
        idTipo: tipCategoria.id,
        nombre: tipCategoria.nombre,
        orden: tipCategoria.orden,
        categoriaClasificacion
      })

    });

    
    return { modalidadRadio, tipoCategoria }
  }

  async crearActualizar(idUsuario: string, datosIn:string): Promise<{}> {
    const {modalidadesRadio, datos} = JSON.parse(datosIn);
    
    if(modalidadesRadio.length >= 1){
      const datosMR: ModalidadRadio[] = [];
      modalidadesRadio.forEach(mr => {
        /*  datosMR.push({
          modalidadId : mr.idModalidad,
          radioId : mr.idRadio,
          usuarioId : idUsuario
        }) */
        
        // buscar si existe y guardar sino
        const modalidadesRadiosBd = new TblModalidadesRadios();

      modalidadesRadiosBd.establecerModalidadRadioDb({
        modalidadId : mr.idModalidad,
        radioId : mr.idRadio,
        usuarioId : idUsuario
      })

      modalidadesRadiosBd.save();

    });
    //const modalidadesRadiosBd = await TblModalidadesRadios.updateOrCreateMany('id',datosMR)
  //  await Database.table('tbl_modalidades_radios').multiInsert(datosMR)
    
    }
    

    return idUsuario

  }


}
