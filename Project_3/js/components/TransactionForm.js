export class TransactionForm {
  constructor(onSubmit, categories) {
    this.onSubmit = onSubmit;
    this.categories = categories || ['Alimentación', 'Transporte', 'Ocio', 'Vivienda', 'Salud', 'Educación'];
  }
  
    render() {
      const form = document.createElement('form');
      form.className = 'transaction-form';
      
      // Obtener la fecha actual en formato YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];
      
      form.innerHTML = `
        <h2>Registrar Transacción</h2>
        <div class="form-group">
          <label><i class="fas fa-exchange-alt"></i> Tipo:</label>
          <select id="transaction-type" required>
            <option value="">Seleccione...</option>
            <option value="income">Ingreso</option>
            <option value="expense">Egreso</option>
          </select>
        </div>
        <div class="form-group budget-amount-group">
          <label><i class="fas fa-dollar-sign"></i> Monto:</label>
          <input type="number" id="transaction-amount" min="0" step="0.01" required>
        </div>
        <div class="form-group">
          <label><i class="fas fa-calendar-alt"></i> Fecha:</label>
          <input type="date" id="transaction-date" required max="${today}">
        </div>
        <div class="form-group">
          <label><i class="fas fa-tags"></i> Categoría:</label>
          <select id="transaction-category" required>
            <option value="">Seleccione...</option>
            ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
          </select>
        </div>
        <button type="submit" class="save-btn" title="Guardar Transacción">
          <i class="fas fa-save"></i>
        </button>
      `;
  
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const dateInput = form.querySelector('#transaction-date');
        const selectedDate = new Date(dateInput.value);
        const currentDate = new Date();
        
        // Verificar que la fecha no sea futura
        if (selectedDate > currentDate) {
          alert('No se pueden registrar transacciones con fecha futura');
          return;
        }

        const transaction = {
          type: form.querySelector('#transaction-type').value,
          amount: parseFloat(form.querySelector('#transaction-amount').value),
          date: dateInput.value,
          category: form.querySelector('#transaction-category').value
        };
        
        this.onSubmit(transaction);
        form.reset();
      });
  
      return form;
    }
  }