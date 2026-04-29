onRecordAfterCreateSuccess(
  (e) => {
    try {
      if (e.auth) {
        const audit = new Record($app.findCollectionByNameOrId('audit_logs'))
        audit.set('user_id', e.auth.id)
        audit.set('action', 'Create ' + e.collection.name)
        audit.set('details', `Registro ${e.record.id} criado em ${e.collection.name}.`)
        $app.saveNoValidate(audit)
      }
    } catch (err) {
      console.log('Audit Create Error:', err)
    }
    e.next()
  },
  'proposals',
  'clients',
)
