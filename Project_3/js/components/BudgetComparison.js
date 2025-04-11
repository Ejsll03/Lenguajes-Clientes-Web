export class BudgetComparison {
  constructor(budgets, transactions) {
    this.budgets = budgets;
    this.transactions = transactions;
    this.monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  }

  calculateMonthlySummary() {
    const summary = {};
    
    // Procesar presupuestos
    this.budgets.forEach(budget => {
      const monthKey = `${budget.year}-${budget.month}`;
      if (!summary[monthKey]) {
        summary[monthKey] = {
          estimated: { income: 0, expense: 0 },
          actual: { income: 0, expense: 0 },
          categories: {}
        };
      }
      
      if (budget.type === 'income') {
        summary[monthKey].estimated.income += budget.amount;
      } else {
        summary[monthKey].estimated.expense += budget.amount;
      }
    });

    // Procesar transacciones
    this.transactions.forEach(transaction => {
      const monthKey = transaction.date.substring(0, 7); // YYYY-MM
      if (!summary[monthKey]) {
        summary[monthKey] = {
          estimated: { income: 0, expense: 0 },
          actual: { income: 0, expense: 0 },
          categories: {}
        };
      }
      
      if (transaction.type === 'income') {
        summary[monthKey].actual.income += transaction.amount;
      } else {
        summary[monthKey].actual.expense += transaction.amount;
        if (!summary[monthKey].categories[transaction.category]) {
          summary[monthKey].categories[transaction.category] = 0;
        }
        summary[monthKey].categories[transaction.category] += transaction.amount;
      }
    });

    return summary;
  }

  render() {
    const summary = this.calculateMonthlySummary();
    const container = document.createElement('div');
    container.className = 'budget-comparison';
    
    if (Object.keys(summary).length === 0) {
      container.innerHTML = `
        <h2>Comparación de Gastos Estimados vs. Reales</h2>
        <p>No hay datos para mostrar en ningún mes.</p>
      `;
      return container;
    }
    
    container.innerHTML = '<h2>Comparación de Gastos Estimados vs. Reales</h2>';
    
    const monthsGrid = document.createElement('div');
    monthsGrid.className = 'months-grid';
    
    Object.entries(summary).sort().reverse().forEach(([period, data]) => {
      const [year, month] = period.split('-');
      const monthName = this.monthNames[parseInt(month)-1];
      
      const monthCard = document.createElement('div');
      monthCard.className = 'month-card';
      
      const estimatedIncome = data.estimated.income;
      const estimatedExpense = data.estimated.expense;
      const actualIncome = data.actual.income;
      const actualExpense = data.actual.expense;
      
      monthCard.innerHTML = `
        <h3>${monthName} ${year}</h3>
        <div class="comparison-section">
          <div class="estimated">
            <h4>Estimado</h4>
            <p class="income">Ingresos: $${estimatedIncome.toFixed(2)}</p>
            <p class="expense">Egresos: $${estimatedExpense.toFixed(2)}</p>
            <p class="balance">Balance: $${(estimatedIncome - estimatedExpense).toFixed(2)}</p>
          </div>
          <div class="actual">
            <h4>Real</h4>
            <p class="income">Ingresos: $${actualIncome.toFixed(2)}</p>
            <p class="expense">Egresos: $${actualExpense.toFixed(2)}</p>
            <p class="balance">Balance: $${(actualIncome - actualExpense).toFixed(2)}</p>
          </div>
        </div>
        ${Object.entries(data.categories).length > 0 ? `
          <div class="categories">
            <h4>Desglose por Categoría</h4>
            <ul>
              ${Object.entries(data.categories)
                .map(([category, amount]) => `
                  <li>${category}: $${amount.toFixed(2)}</li>
                `).join('')}
            </ul>
          </div>
        ` : ''}
      `;
      
      monthsGrid.appendChild(monthCard);
    });
    
    container.appendChild(monthsGrid);
    return container;
  }
}