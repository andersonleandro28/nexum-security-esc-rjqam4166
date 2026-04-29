cronAdd('update_late_installments', '0 0 * * *', () => {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0] + ' 00:00:00.000Z'

  const lateInstallments = $app.findRecordsByFilter(
    'installments',
    "status = 'Pendente' && due_date < {:todayStr}",
    '',
    0,
    0,
    { todayStr },
  )

  for (const inst of lateInstallments) {
    inst.set('status', 'Atrasado')

    const amount = inst.get('amount') || 0
    inst.set('penalty_amount', amount * 0.02)

    const dueDate = new Date(inst.getString('due_date'))
    const diffTime = Math.abs(today.getTime() - dueDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const mora = amount * (0.01 / 30) * diffDays
    inst.set('mora_interest_amount', mora)

    $app.saveNoValidate(inst)
  }
})
