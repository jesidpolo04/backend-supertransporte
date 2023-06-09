
import { Paginador } from 'App/Dominio/Paginador';
import { MapeadorPaginacionDB } from './MapeadorPaginacionDB';
import { RepositorioEncuesta } from 'App/Dominio/Repositorios/RepositorioEncuesta';
import { Reportadas } from 'App/Dominio/Dto/Encuestas/Reportadas';
import TblEncuestas from 'App/Infraestructura/Datos/Entidad/Encuesta';
import TblReporte from 'App/Infraestructura/Datos/Entidad/Reporte';
import TblUsuarios from 'App/Infraestructura/Datos/Entidad/Usuario';
import TbClasificacion from 'App/Infraestructura/Datos/Entidad/Clasificacion';
import TblRespuestas from 'App/Infraestructura/Datos/Entidad/Respuesta';
//import NoAprobado from 'App/Exceptions/NoAprobado';
import { Respuesta } from 'App/Dominio/Datos/Entidades/Respuesta';
import { Pregunta } from 'App/Dominio/Datos/Entidades/Pregunta';
import { ServicioAuditoria } from 'App/Dominio/Datos/Servicios/ServicioAuditoria';
import { ServicioEstados } from 'App/Dominio/Datos/Servicios/ServicioEstados';
import { DateTime } from 'luxon';
import { TblAnioVigencias } from 'App/Infraestructura/Datos/Entidad/AnioVigencia';

export class RepositorioEncuestasDB implements RepositorioEncuesta {
  private servicioAuditoria = new ServicioAuditoria();
  private servicioEstado = new ServicioEstados();
  async obtenerReportadas(params: any): Promise<{ reportadas: Reportadas[], paginacion: Paginador }> {
    const { idUsuario, idEncuesta, pagina, limite, idVigilado, idRol } = params;
    
      const anioVigencia = await TblAnioVigencias.query().where('anv_estado', true).orderBy('anv_id','desc').select('anv_anio').first()
    

    const reportadas: Reportadas[] = []
    const consulta = TblReporte.query().preload('usuario', sqlUsuario =>{
      sqlUsuario.preload('clasificacionUsuario')
    });

    if (idEncuesta) {
      consulta.preload('encuesta', sqlE => {
        sqlE.where('id', idEncuesta);
      }).whereHas('encuesta', sqlE => {
        sqlE.where('id', idEncuesta);
      })
    } else {
      consulta.preload('encuesta')
    }

    if (idRol === '003') {
      console.log("vigilado");

      consulta.where('login_vigilado', idVigilado);
    }
    consulta.preload('estadoVerificado')
    consulta.preload('estadoVigilado')

if(idEncuesta == 2){
  consulta.where('anio_vigencia', anioVigencia?.anio!)
}
    let reportadasBD = await consulta.orderBy('fecha_enviost', 'desc').paginate(pagina, limite)



    if (reportadasBD.length <= 0 && idRol === '003') {

      
      const usuario = await TblUsuarios.query().where('identificacion', idUsuario).first()


      const reporte = new TblReporte()
      reporte.estableceReporteConId({
        idEncuesta: idEncuesta,
        envioSt: '0',
        loginVigilado: idVigilado,
        razonSocialRues: usuario?.nombre!,
        nitRues: idVigilado,
        usuarioCreacion: idUsuario,
        estadoVerificacionId: 1002,
        anioVigencia : anioVigencia?.anio!
      })

      await reporte.save();
      reportadasBD = await consulta.orderBy('fecha_enviost', 'desc').paginate(pagina, limite)
 
      this.servicioEstado.Log(idUsuario, 1002, idEncuesta)

      this.servicioAuditoria.Auditar({
        accion: "Listar Encuestas",
        modulo: "Encuesta",
        usuario: idUsuario,
        vigilado: idVigilado,
        descripcion: 'Entra por primera vez a la encuesta',
        encuestaId: idEncuesta,
        tipoLog: 3
      })
    }


    reportadasBD.map(reportada => {  
      let estado = 'FORMULARIO EN BORRADOR';
      estado = reportada.estadoVerificado?.nombre??estado;
      estado = reportada.estadoVigilado?.nombre??estado;    
      reportadas.push({
        idEncuestaDiligenciada: reportada.encuesta.id,
        clasificacion: reportada.usuario.clasificacionUsuario[0]?.nombre??'Sin Clasificar',
        idVigilado: reportada.loginVigilado,
        numeroReporte: reportada.id!,
        encuesta: reportada.encuesta.nombre,
        descripcion: reportada.encuesta.descripcion,
        fechaInicio: reportada.encuesta.fechaInicio,
        fechaFinal: reportada.encuesta.fechaFin,
        fechaEnvioST: reportada.fechaEnviost!,
        razonSocial: reportada.razonSocialRues,
        nit: reportada.nitRues,
        email: reportada.usuario.correo,
        usuarioCreacion: reportada.usuarioCreacion,
        asignado: reportada.asignado,
        ultimoUsuarioAsignado: reportada.ultimoUsuarioAsignado,
        estado,
      //  estado: (reportada.envioSt == "1") ? "FORMULARIO ENVIADO ST" : "FORMULARIO EN BORRADOR",
      });
    })




    const paginacion = MapeadorPaginacionDB.obtenerPaginacion(reportadasBD)
    return { reportadas, paginacion }
  }



  async visualizar(params: any): Promise<any> {

    const { idEncuesta, idUsuario, idVigilado, idReporte } = params;
    let tipoAccion = (idUsuario === idVigilado) ? 2 : 1;
    let clasificacionesArr: any = [];


    let clasificacion = '';

    const consulta = TblEncuestas.query().preload('pregunta', sql => {
      sql.preload('clasificacion')
      sql.preload('tiposPregunta')
      sql.preload('respuesta', sqlResp => {
        sqlResp.where('id_reporte', idReporte)
      })
     
     // sql.orderBy('preguntas.orden', 'desc')
    
    
    }).where({ 'id_encuesta': idEncuesta }).first();
    const encuestaSql = await consulta


//BUscar la clasificacion del usuario
const usuario = await TblUsuarios.query().preload('clasificacionUsuario', (sqlClasC) => {
  sqlClasC.preload('clasificacion')
  sqlClasC.has('clasificacion')}).where('identificacion', idVigilado).first()

  const nombreClasificaion = usuario?.clasificacionUsuario[0]?.nombre;
  const descripcionClasificacion = usuario?.clasificacionUsuario[0]?.descripcion;
  const pasos = usuario?.clasificacionUsuario[0]?.clasificacion



    const claficiacionesSql = await TbClasificacion.query().orderBy('id_clasificacion', 'asc');
    let consecutivo: number = 1;
    claficiacionesSql.forEach(clasificacionSql => {
      let preguntasArr: any = [];
      clasificacion = clasificacionSql.nombre;

      //validar si el paso es obligatorio
      
      const obligatorio = pasos?.find(paso => paso.id === clasificacionSql.id)?true:false;


      encuestaSql?.pregunta.forEach(pregunta => {

        if (clasificacionSql.id === pregunta.clasificacion.id) {



          preguntasArr.push({
            idPregunta: pregunta.id,
            numeroPregunta: consecutivo,
            pregunta: pregunta.pregunta,
            obligatoria: obligatorio,// pregunta.obligatoria,
            respuesta: pregunta.respuesta[0]?.valor ?? '',
            tipoDeEvidencia: pregunta.tipoEvidencia,
            documento: pregunta.respuesta[0]?.documento ?? '',
            nombreOriginal: pregunta.respuesta[0]?.nombredocOriginal ?? '',
            ruta: pregunta.respuesta[0]?.ruta ?? '',
            adjuntable: pregunta.adjuntable,
            adjuntableObligatorio: obligatorio,// pregunta.adjuntableObligatorio,
            tipoPregunta: pregunta.tiposPregunta.nombre,
            valoresPregunta: pregunta.tiposPregunta.opciones,
            validaciones: pregunta.tiposPregunta.validaciones,

            observacion: pregunta.respuesta[0]?.observacion ?? '',
            cumple: pregunta.respuesta[0]?.cumple ?? '',
            observacionCumple: pregunta.respuesta[0]?.observacionCumple ?? '',
            corresponde: pregunta.respuesta[0]?.corresponde ?? '',
            observacionCorresponde: pregunta.respuesta[0]?.observacionCorresponde ?? '',
          });
          consecutivo++;
        }

      });
      if (preguntasArr.length >= 1) {
        clasificacionesArr.push(
          {
            clasificacion,
            preguntas: preguntasArr
          }

        );
      }



    });



    const encuesta = {
      tipoAccion,
      nombreEncuesta:encuestaSql?.nombre,
      clasificaion: nombreClasificaion,
      descripcionClasificacion,
      observacion:encuestaSql?.observacion,
      clasificaciones: clasificacionesArr
    }

    return encuesta
  }

  async enviarSt(params: any): Promise<any> {
    const { idEncuesta, idReporte, idVigilado, idUsuario } = params
    const usuario = await TblUsuarios.query().preload('clasificacionUsuario', (sqlClasC) => {
      sqlClasC.preload('clasificacion', (sqlCla) => {
        sqlCla.preload('pregunta', (sqlPre) => {
          sqlPre.where('id_encuesta', idEncuesta)
        }).whereHas('pregunta', sqlE => {
          sqlE.where('id_encuesta', idEncuesta);
        })
      })
    }).where('identificacion', idUsuario).first()

    let aprobado = true;
    const faltantes = new Array();
    const pasos = usuario?.clasificacionUsuario[0]?.clasificacion
    const respuestas = await TblRespuestas.query().where('id_reporte', idReporte).orderBy('id_pregunta', 'asc')
    pasos?.forEach(paso => {
      paso.pregunta.forEach(preguntaPaso => {
        let repuestaExiste = true
        let archivoExiste = true
        const respuesta = respuestas.find(r => r.idPregunta === preguntaPaso.id)
        if (preguntaPaso.obligatoria) {
          if (!respuesta) {            
            //throw new NoAprobado('Faltan preguntas por responder')     
            repuestaExiste = false       
          }

    if(respuesta && respuesta.valor === 'N' && respuesta.observacion === ''){
      repuestaExiste = false 
    }


          if (respuesta && respuesta.valor === 'S' && preguntaPaso.adjuntableObligatorio) {
            console.log(respuesta.observacion);
            
            archivoExiste = this.validarDocumento(respuesta, preguntaPaso);            
          }

        }


        if(!repuestaExiste || !archivoExiste){
          aprobado = false
          faltantes.push({
            preguntaId: preguntaPaso.id,
            archivoObligatorio: preguntaPaso.adjuntableObligatorio
          })

        }


      });

    });

    if(aprobado) {
      this.servicioEstado.Log(idUsuario, 1004, idEncuesta)
      const reporte = await TblReporte.findOrFail(idReporte)
      reporte.fechaEnviost = DateTime.fromJSDate(new Date())
      reporte.envioSt = '1'
      reporte.estadoVerificacionId = 1004
      reporte.save();
    }

    return {aprobado, faltantes}

  }

  validarDocumento = (r: Respuesta, p: Pregunta): boolean => {
      if (!r.documento || r.documento.length <= 0) {
        //throw new NoAprobado('Faltan archivos adjuntar')
        return false
      }
    return true
  }


}
