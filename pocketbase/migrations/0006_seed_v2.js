migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'andersonleandro28@gmail.com')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('andersonleandro28@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      record.set('role', 'admin')
      app.save(record)
    }

    const suppliers = app.findCollectionByNameOrId('suppliers')
    try {
      app.findFirstRecordByData('suppliers', 'tax_id', '00.000.000/0001-00')
    } catch (_) {
      const s = new Record(suppliers)
      s.set('name', 'Fornecedor de Tecnologia LTDA')
      s.set('tax_id', '00.000.000/0001-00')
      s.set('category', 'TI')
      app.save(s)
    }
  },
  (app) => {},
)
