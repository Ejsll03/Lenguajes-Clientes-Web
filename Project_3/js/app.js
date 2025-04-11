import { Navbar } from './components/Navbar.js';
import { TransactionForm } from './components/TransactionForm.js';
import { BudgetForm } from './components/BudgetForm.js';
import { TransactionList } from './components/TransactionList.js';
import { BudgetComparison } from './components/BudgetComparison.js';
import { FinanceCharts } from './components/Charts.js';
import { CategoryManager } from './components/CategoryManager.js';
import { SimpleChart } from './components/SimpleChart.js';
import { Dashboard } from './components/Dashboard.js';
import { FinanceDB } from './db.js';

class FinanceApp {
  constructor() {
    this.db = new FinanceDB();
    this.currentTab = 'dashboard';
    this.transactions = [];
    this.budgets = [];
    this.categories = [];
    this.defaultCategories = ['Alimentación', 'Transporte', 'Ocio', 'Vivienda', 'Salud', 'Educación', 'Otros'];
    this.chartLoaded = false;
    
    this.init();
  }

  async loadChartJS() {
    return new Promise((resolve, reject) => {
      if (typeof Chart !== 'undefined') {
        this.chartLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
      script.async = true;
      script.onload = () => {
        this.chartLoaded = true;
        resolve();
      };
      script.onerror = () => {
        console.error('Error al cargar Chart.js');
        reject();
      };
      document.head.appendChild(script);
    });
  }

  async init() {
    await this.db.init();
    await this.initializeCategories();
    await this.loadData();
    this.render();
  }

  async initializeCategories() {
    const storedCategories = await this.db.getCategories();
    
    if (storedCategories.length === 0) {
      for (const category of this.defaultCategories) {
        await this.db.addCategory(category);
      }
      this.categories = [...this.defaultCategories];
    } else {
      this.categories = storedCategories;
    }
  }

  async loadData() {
    this.transactions = await this.db.getAllTransactions();
    this.budgets = await this.db.getAllBudgets();
    this.categories = await this.db.getCategories();
  }

  async updateCategories(newCategories) {
    this.categories = newCategories;
    if (this.currentTab === 'transactions' || this.currentTab === 'budgets') {
      this.renderContent();
    }
  }

  render() {
    document.body.innerHTML = '';
    
    // Crear el contenedor principal
    const appContainer = document.createElement('div');
    appContainer.className = 'app-container';
    
    // Crear el navbar
    const navbar = new Navbar((tab) => {
      this.currentTab = tab;
      this.renderContent();
    });
    
    // Crear el contenedor principal del contenido
    this.mainContainer = document.createElement('main');
    this.mainContainer.className = 'main-content';
    
    // Agregar elementos al DOM
    appContainer.appendChild(navbar.render());
    appContainer.appendChild(this.mainContainer);
    document.body.appendChild(appContainer);
    
    this.renderContent();
  }

  renderContent() {
    this.mainContainer.innerHTML = '';
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'tab-content';
    
    switch (this.currentTab) {
      case 'dashboard':
        this.renderDashboardTab(contentContainer);
        break;
      case 'transactions':
        this.renderTransactionsTab(contentContainer);
        break;
      case 'budgets':
        this.renderBudgetsTab(contentContainer);
        break;
      case 'comparison':
        this.renderComparisonTab(contentContainer);
        break;
      case 'categories':
        this.renderCategoriesTab(contentContainer);
        break;
    }
    
    this.mainContainer.appendChild(contentContainer);
  }

  async renderTransactionsTab(container) {
    // Transaction form
    const transactionForm = new TransactionForm(
      async (transaction) => {
        await this.db.addTransaction(transaction);
        await this.loadData();
        this.renderContent();
      }, 
      this.categories
    );
    container.appendChild(transactionForm.render());
    
    // Transaction list con filtros
    const transactionList = new TransactionList(
      this.transactions,
      async (transaction) => {
        const newAmount = prompt('Nuevo monto:', transaction.amount);
        if (newAmount !== null) {
          await this.db.updateTransaction({
            ...transaction,
            amount: parseFloat(newAmount)
          });
          await this.loadData();
          this.renderContent();
        }
      },
      async (id) => {
        if (confirm('¿Estás seguro de eliminar esta transacción?')) {
          await this.db.deleteTransaction(id);
          await this.loadData();
          this.renderContent();
        }
      }
    );
    
    container.appendChild(transactionList.render());
    
    // Añadir gráfico de transacciones
    if (!this.chartLoaded) {
      try {
        await this.loadChartJS();
      } catch (error) {
        console.error('No se pudo cargar Chart.js:', error);
        container.innerHTML += '<p class="error">Error al cargar los gráficos. Por favor, recarga la página.</p>';
        this.mainContainer.appendChild(container);
        return;
      }
    }
    
    const transactionsChart = new SimpleChart(this.transactions, 'transactions', this.categories);
    container.appendChild(transactionsChart.render());
  }

  async renderBudgetsTab(container) {
    // Budget form
    const budgetForm = new BudgetForm(
      async (budget) => {
        await this.db.addBudget(budget);
        await this.loadData();
        this.renderContent();
      },
      this.categories
    );
    container.appendChild(budgetForm.render());
    
    // Budget list
    const budgetList = document.createElement('div');
    budgetList.className = 'budget-list';

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    budgetList.innerHTML = `
      <h2>Presupuestos Registrados</h2>
      ${this.budgets.length === 0 ? 
        '<p>No hay presupuestos registrados.</p>' : 
        '<ul>' + this.budgets.map(b => {
          const monthName = monthNames[parseInt(b.month) - 1];
          const type = b.type === 'income' ? 'Ingreso' : 'Egreso';
          return `
            <li style="display: flex; justify-content: space-between; align-items: center;">
              <span>Presupuesto de ${type} - ${b.category} (${monthName} ${b.year}): $${b.amount.toFixed(2)}</span>
              <button class="icon-btn delete-btn" data-id="${b.id}" title="Eliminar presupuesto">
                <i class="fas fa-trash-alt text-danger"></i>
              </button>
            </li>
          `;
        }).join('') + '</ul>'}
    `;
    
    budgetList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.closest('.delete-btn').getAttribute('data-id');
        if (confirm('¿Estás seguro de eliminar este presupuesto?')) {
          await this.db.deleteBudget(id);
          await this.loadData();
          this.renderContent();
        }
      });
    });
    
    container.appendChild(budgetList);
    
    // Añadir gráfico de presupuestos
    if (!this.chartLoaded) {
      try {
        await this.loadChartJS();
      } catch (error) {
        console.error('No se pudo cargar Chart.js:', error);
        container.innerHTML += '<p class="error">Error al cargar los gráficos. Por favor, recarga la página.</p>';
        this.mainContainer.appendChild(container);
        return;
      }
    }
    
    const budgetsChart = new SimpleChart(this.budgets, 'budgets', this.categories);
    container.appendChild(budgetsChart.render());
  }

  async renderComparisonTab(container) {
    const comparison = new BudgetComparison(this.budgets, this.transactions);
    container.appendChild(comparison.render());
    
    if (!this.chartLoaded) {
      try {
        await this.loadChartJS();
      } catch (error) {
        console.error('No se pudo cargar Chart.js:', error);
        container.innerHTML += '<p class="error">Error al cargar los gráficos. Por favor, recarga la página.</p>';
        this.mainContainer.appendChild(container);
        return;
      }
    }
    
    const charts = new FinanceCharts(this.budgets, this.transactions);
    container.appendChild(charts.render());
  }

  renderCategoriesTab(container) {
    const categoryManager = new CategoryManager(
      this.db,
      async (updatedCategories) => {
        this.categories = updatedCategories;
        await this.updateCategories(updatedCategories);
      }
    );
    
    container.appendChild(categoryManager.render());
  }

  async renderDashboardTab(container) {
    if (!this.chartLoaded) {
      try {
        await this.loadChartJS();
      } catch (error) {
        console.error('No se pudo cargar Chart.js:', error);
        this.mainContainer.innerHTML = '<p class="error">Error al cargar los gráficos. Por favor, recarga la página.</p>';
        return;
      }
    }

    const dashboard = new Dashboard(this.transactions, this.budgets);
    container.appendChild(dashboard.render());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new FinanceApp();
});