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

  e.next()
}, 'proposals')
