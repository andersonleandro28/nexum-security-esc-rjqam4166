migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('proposals')
    if (!col.fields.getByName('manual_created_at')) {
      col.fields.add(new DateField({ name: 'manual_created_at' }))
    }
    if (!col.fields.getByName('issuance_fee')) {
      col.fields.add(new NumberField({ name: 'issuance_fee' }))
    }
    if (!col.fields.getByName('cet_monthly')) {
      col.fields.add(new NumberField({ name: 'cet_monthly' }))
    }
    if (!col.fields.getByName('cet_yearly')) {
      col.fields.add(new NumberField({ name: 'cet_yearly' }))
    }
    if (!col.fields.getByName('total_iof')) {
      col.fields.add(new NumberField({ name: 'total_iof' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('proposals')
    col.fields.removeByName('manual_created_at')
    col.fields.removeByName('issuance_fee')
    col.fields.removeByName('cet_monthly')
    col.fields.removeByName('cet_yearly')
    col.fields.removeByName('total_iof')
    app.save(col)
  },
)
