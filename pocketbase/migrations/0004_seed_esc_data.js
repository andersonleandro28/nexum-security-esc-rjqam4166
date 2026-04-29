migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let clientUser
    try {
      clientUser = app.findAuthRecordByEmail('_pb_users_auth_', 'cliente@nexum.com')
    } catch (_) {
      clientUser = new Record(users)
      clientUser.setEmail('cliente@nexum.com')
      clientUser.setPassword('Skip@Pass')
      clientUser.setVerified(true)
      clientUser.set('name', 'Cliente Teste')
      clientUser.set('role', 'client')
      app.save(clientUser)
    }

    const clients = app.findCollectionByNameOrId('clients')
    let clientRec
    try {
      clientRec = app.findFirstRecordByData('clients', 'email', 'cliente@nexum.com')
    } catch (_) {
      clientRec = new Record(clients)
      clientRec.set('user_id', clientUser.id)
      clientRec.set('type', 'PJ')
      clientRec.set('name', 'Empresa Teste LTDA')
      clientRec.set('document', '11.222.333/0001-44')
      clientRec.set('email', 'cliente@nexum.com')
      clientRec.set('phone', '11999999999')
      app.save(clientRec)
    }

    const proposals = app.findCollectionByNameOrId('proposals')
    try {
      app.findFirstRecordByData('proposals', 'client_id', clientRec.id)
    } catch (_) {
      const prop = new Record(proposals)
      prop.set('client_id', clientRec.id)
      prop.set('amount', 35000)
      prop.set('installments', 12)
      prop.set('interest_rate', 2.0)
      prop.set('calculation_type', 'Price')
      prop.set('status', 'Liquidado')
      prop.set('operation_date', new Date().toISOString().replace('T', ' '))
      prop.set('score', 750)
      prop.set('purpose', 'Seed Data')
      app.save(prop)
    }
  },
  (app) => {
    try {
      const clientUser = app.findAuthRecordByEmail('_pb_users_auth_', 'cliente@nexum.com')
      app.delete(clientUser)
    } catch (_) {}
  },
)
