export class TransactionList {
  constructor(transactions, onEdit, onDelete) {
    this.transactions = transactions;
    this.onEdit = onEdit;
    this.onDelete = onDelete;
    this.filters = {
      type: 'all',
      category: 'all'
    };
    this.listContainer = null;
    this.filterContainer = null;
  }

  applyFilters() {
    return this.transactions.filter(transaction => {
      const typeMatch = this.filters.type === 'all' || transaction.type === this.filters.type;
      const categoryMatch = this.filters.category === 'all' || transaction.category === this.filters.category;
      return typeMatch && categoryMatch;
    });
  }

  renderFilters() {
    const filterSection = document.createElement('div');
    filterSection.className = 'filters';
    
    // Obtener categorías únicas de las transacciones
    const uniqueCategories = [...new Set(this.transactions.map(t => t.category))];
    
    filterSection.innerHTML = `
      <h3>Filtrar Transacciones</h3>
      <div class="filter-group">
        <label>Tipo:</label>
        <select id="filter-type" class="filter-select">
          <option value="all">Todos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Egresos</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Categoría:</label>
        <select id="filter-category" class="filter-select">
          <option value="all">Todas</option>
          ${uniqueCategories.map(cat => 
            `<option value="${cat}">${cat}</option>`
          ).join('')}
        </select>
      </div>
    `;

    // Establecer valores actuales
    filterSection.querySelector('#filter-type').value = this.filters.type;
    filterSection.querySelector('#filter-category').value = this.filters.category;

    // Event listeners para cambios
    filterSection.querySelectorAll('.filter-select').forEach(select => {
      select.addEventListener('change', (e) => {
        this.filters[e.target.id.replace('filter-', '')] = e.target.value;
        this.updateList();
      });
    });

    return filterSection;
  }

  renderList() {
    const filteredTransactions = this.applyFilters();
    const listContainer = document.createElement('div');
    listContainer.className = 'transaction-list';
    
    if (filteredTransactions.length === 0) {
      listContainer.innerHTML = '<p class="no-results">No hay transacciones con los filtros actuales.</p>';
      return listContainer;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th><i class="fas fa-exchange-alt"></i> Tipo</th>
          <th><i class="fas fa-tags"></i> Categoría</th>
          <th><i class="fas fa-dollar-sign"></i> Monto</th>
          <th><i class="fas fa-calendar-alt"></i> Fecha</th>
          <th><i class="fas fa-cogs"></i> Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${filteredTransactions.map(transaction => `
          <tr>
            <td><i class="fas ${transaction.type === 'income' ? 'fa-arrow-down text-success' : 'fa-arrow-up text-danger'}"></i> ${transaction.type === 'income' ? 'Ingreso' : 'Egreso'}</td>
            <td><i class="fas fa-tag"></i> ${transaction.category}</td>
            <td class="${transaction.type}"><i class="fas ${transaction.type === 'income' ? 'fa-plus-circle text-success' : 'fa-minus-circle text-danger'}"></i> ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</td>
            <td><i class="fas fa-calendar"></i> ${new Date(transaction.date).toLocaleDateString()}</td>
            <td class="actions">
              <button class="icon-btn edit-btn" data-id="${transaction.id}" title="Editar">
                <i class="fas fa-edit text-primary"></i>
              </button>
              <button class="icon-btn delete-btn" data-id="${transaction.id}" title="Eliminar">
                <i class="fas fa-trash-alt text-danger"></i>
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;

    // Event listeners para botones
    table.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const transaction = this.transactions.find(t => t.id === id);
        this.onEdit(transaction);
      });
    });

    table.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        this.onDelete(id);
      });
    });

    listContainer.appendChild(table);
    return listContainer;
  }

  updateList() {
    if (this.listContainer) {
      const newList = this.renderList();
      this.listContainer.replaceWith(newList);
      this.listContainer = newList;
    }
  }

  render() {
    const container = document.createElement('div');
    container.className = 'transactions-container';
    
    // Sección de filtros
    this.filterContainer = this.renderFilters();
    
    // Sección de lista
    this.listContainer = this.renderList();
    
    container.appendChild(this.filterContainer);
    container.appendChild(this.listContainer);
    
    return container;
  }
}