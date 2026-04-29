onRecordAfterDeleteSuccess((e) => {
  try {
    const installments = $app.findRecordsByFilter('installments', 'proposal_id = {:id}', '', 0, 0, {
      id: e.record.id,
    })
    for (const inst of installments) $app.delete(inst)
  } catch (err) {}

  try {
    const boletos = $app.findRecordsByFilter('boletos', 'proposal_id = {:id}', '', 0, 0, {
      id: e.record.id,
    })
    for (const bol of boletos) $app.delete(bol)
  } catch (err) {}

  try {
    const clientId = e.record.get('client_id')
    if (clientId) {
      const docs = $app.findRecordsByFilter('kyc_documents', 'client_id = {:id}', '', 0, 0, {
        id: clientId,
      })
      for (const doc of docs) $app.delete(doc)
    }
  } catch (err) {}

  e.next()
}, 'proposals')
