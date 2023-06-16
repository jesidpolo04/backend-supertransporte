import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'reporte'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('asignado').defaultTo(false)
      table.string('ultimo_usuario_asignado')
      table.integer('estado_verificacion_id')
      table.string('asignador')
  })
}

public async down () {
  this.schema.alterTable(this.tableName, (table) => {
    table.dropColumn('asignado')
    table.dropColumn('ultimo_usuario_asignado')
    table.dropColumn('estado_verificacion_id')
    table.dropColumn('asignador')
})
}
}
