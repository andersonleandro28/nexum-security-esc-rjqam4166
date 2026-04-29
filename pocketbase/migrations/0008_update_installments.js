migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('installments')
    if (!col.fields.getByName('penalty_amount')) {
      col.fields.add(new NumberField({ name: 'penalty_amount' }))
    }
    if (!col.fields.getByName('mora_interest_amount')) {
      col.fields.add(new NumberField({ name: 'mora_interest_amount' }))
    }
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('installments')
    col.fields.removeByName('penalty_amount')
    col.fields.removeByName('mora_interest_amount')
    app.save(col)
  },
)
