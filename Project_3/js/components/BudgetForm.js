export class BudgetForm {
  constructor(onSubmit, categories) {
    this.onSubmit = onSubmit;
    this.categories = categories || ['Alimentación', 'Transporte', 'Ocio', 'Vivienda', 'Salud', 'Educación'];
    this.currentYear = new Date().getFullYear();
  }

  render() {
    const form = document.createElement('form');
    form.className = 'budget-form';
    
    // Generar opciones de años (desde 2020 hasta 5 años en el futuro)
    const yearOptions = [];
    for (let year = 2020; year <= this.currentYear + 5; year++) {
      yearOptions.push(`<option value="${year}" ${year === this.currentYear ? 'selected' : ''}>${year}</option>`);
    }

    form.innerHTML = `
      <h2><i class="fas fa-wallet"></i> Presupuestos Estimados</h2>
      <div class="form-group">
        <label><i class="fas fa-exchange-alt"></i> Tipo:</label>
        <select id="budget-type" required>
          <option value="">Seleccione...</option>
          <option value="income">Ingreso</option>
          <option value="expense">Egreso</option>
        </select>
      </div>
      <div class="form-group">
        <label><i class="fas fa-calendar-alt"></i> Año:</label>
        <select id="budget-year" required>
          ${yearOptions.join('')}
        </select>
      </div>
      <div class="form-group">
        <label><i class="fas fa-calendar"></i> Mes:</label>
        <select id="budget-month" required>
          <option value="01">Enero</option>
          <option value="02">Febrero</option>
          <option value="03">Marzo</option>
          <option value="04">Abril</option>
          <option value="05">Mayo</option>
          <option value="06">Junio</option>
          <option value="07">Julio</option>
          <option value="08">Agosto</option>
          <option value="09">Septiembre</option>
          <option value="10">Octubre</option>
          <option value="11">Noviembre</option>
          <option value="12">Diciembre</option>
        </select>
      </div>
      <div class="form-group">
        <label><i class="fas fa-tags"></i> Categoría:</label>
        <select id="budget-category" required>
          <option value="">Seleccione...</option>
          ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
        </select>
      </div>
      <div class="form-group budget-amount-group">
        <label><i class="fas fa-dollar-sign"></i> Monto Estimado:</label>
        <input type="number" id="budget-amount" min="0" step="0.01" required>
        <button type="submit" class="save-btn" title="Guardar Presupuesto">
          <i class="fas fa-save"></i>
        </button>
      </div>
    `;

    // Establecer mes actual por defecto
    const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
    form.querySelector('#budget-month').value = currentMonth;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const budget = {
        period: `${form.querySelector('#budget-year').value}-${form.querySelector('#budget-month').value}`,
        year: form.querySelector('#budget-year').value,
        month: form.querySelector('#budget-month').value,
        category: form.querySelector('#budget-category').value,
        amount: parseFloat(form.querySelector('#budget-amount').value),
        type: form.querySelector('#budget-type').value
      };
      
      this.onSubmit(budget);
      form.reset();
      
      // Restablecer el mes actual después de resetear el formulario
      form.querySelector('#budget-month').value = currentMonth;
    });

    return form;
  }
}