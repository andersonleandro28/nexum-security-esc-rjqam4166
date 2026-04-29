onRecordAfterDeleteSuccess((e) => {
  try {
    const kyc = $app.findRecordsByFilter('kyc_documents', 'client_id = {:id}', '', 0, 0, {
      id: e.record.id,
    })
    for (const k of kyc) $app.delete(k)
  } catch (err) {}

  try {
    const proposals = $app.findRecordsByFilter('proposals', 'client_id = {:id}', '', 0, 0, {
      id: e.record.id,
    })
    for (const p of proposals) $app.delete(p)
  } catch (err) {}

  e.next()
}, 'clients')
