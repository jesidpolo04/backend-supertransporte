import { schema, rules } from "@ioc:Adonis/Core/Validator"

export const crearSoporteSchema = schema.create({
    descripcion: schema.string(),
    adjunto: schema.file.optional(),
    //parametros opcionales
    telefono: schema.string.optional({ trim: true }),
    correo: schema.string.optional({ trim: true }),
    nit: schema.string.optional({ trim: true }),
    razonSocial: schema.string.optional({ trim: true })
}) 