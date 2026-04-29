onRecordAfterDeleteSuccess(
  (e) => {
    try {
      if (e.auth) {
        const audit = new Record($app.findCollectionByNameOrId('audit_logs'))
        audit.set('user_id', e.auth.id)
        audit.set('action', 'Delete ' + e.collection.name)
        audit.set('details', `Registro ${e.record.id} removido de ${e.collection.name}.`)
        $app.saveNoValidate(audit)
      }
    } catch (err) {
      console.log('Audit Delete Error:', err)
    }
    e.next()
  },
  'proposals',
  'clients',
)
