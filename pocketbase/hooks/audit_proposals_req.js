onRecordUpdateRequest((e) => {
  const auth = e.auth
  if (!auth) return e.next()

  const body = e.requestInfo().body
  if (body.status || body.amount || body.operation_date) {
    try {
      const record = $app.findRecordById('proposals', e.request.pathValue('id'))
      let details = []
      if (body.status && record.getString('status') !== body.status) {
        details.push("Status de '" + record.getString('status') + "' para '" + body.status + "'")
      }
      if (body.amount && record.getFloat('amount') !== body.amount) {
        details.push('Valor alterado')
      }
      if (details.length > 0) {
        const auditCol = $app.findCollectionByNameOrId('audit_logs')
        const audit = new Record(auditCol)
        audit.set('user_id', auth.id)
        audit.set('action', 'Atualização de CCB')
        audit.set('details', 'CCB ' + record.id + ': ' + details.join(', '))
        $app.saveNoValidate(audit)
      }
    } catch (err) {
      console.log('Audit error:', err)
    }
  }
  e.next()
}, 'proposals')
