import type { HttpContextContract } from "@ioc:Adonis/Core/HttpContext";
import { ServicioEmpresaVigilado } from "App/Dominio/Datos/Servicios/ServicioEmpresaVigilado";
import { RepositorioEmpresaVigiladoDB } from "App/Infraestructura/Implementacion/Lucid/RepositorioEmpresaVigiladoDB";

export default class ControladorEmpresa {
  private service: ServicioEmpresaVigilado;
  constructor() {
    this.service = new ServicioEmpresaVigilado(
      new RepositorioEmpresaVigiladoDB()
    );
  }

  public async listar({ request, response }: HttpContextContract) {
    const empresas = await this.service.obtenerEmpresas();
    return response.status(200).send(empresas);
  }

  public async seleccionadas({ request, response }: HttpContextContract) {
    const payload = await request.obtenerPayloadJWT()
    const empresas = await this.service.obtenerSeleccionadas(payload.documento);
    return response.status(200).send(empresas);
  }

  public async asignar({request, response}: HttpContextContract) {
    const payload = await request.obtenerPayloadJWT()
    const {idEmpresa,fechaInicial,fechaFinal} = request.all()
    if (!idEmpresa || !fechaInicial || !fechaFinal) {
      return response.status(400).send("Todos los campos son necesarios");
    }

    //devolver 

      const empresas = await this.service.asignar(payload.documento, request.all());

      if(!empresas[0]?.estado){
        return response.status(400).send({mensaje:empresas[0].mensaje});
      }
    return response.status(200).send(empresas);
  }

  public async editar({request, response}: HttpContextContract) {
    const payload = await request.obtenerPayloadJWT()
    const empresas = await this.service.editar(payload.documento, request.all());
    return response.status(200).send(empresas);
  }

  public async activar({request, response}: HttpContextContract) {
    const payload = await request.obtenerPayloadJWT()
    const empresas = await this.service.activar(payload.documento, request.all());
    return response.status(200).send(empresas);
  }

}
