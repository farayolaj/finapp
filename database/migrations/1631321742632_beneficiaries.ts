import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Beneficiaries extends BaseSchema {
  protected tableName = 'beneficiaries'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('bank_name', 255)
      table.string('bank_code', 5)
      table.string('account_number', 11)
      table.string('account_name', 255)
      table.string('recipient_code')
      table
        .integer('account_id')
        .unsigned()
        .references('accounts.id')
        .notNullable()
        .onDelete('CASCADE')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
