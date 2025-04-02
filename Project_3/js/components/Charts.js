export class FinanceCharts {
    constructor(budgets, transactions) {
      this.budgets = budgets;
      this.transactions = transactions;
      this.selectedYear = new Date().getFullYear();
      this.categoryColors = {
        'Alimentación': '#e74c3c',
        'Transporte': '#3498db',
        'Ocio': '#2ecc71',
        'Vivienda': '#f1c40f',
        'Salud': '#9b59b6',
        'Educación': '#1abc9c'
      };
      this.monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      this.monthAbbreviations = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      this.chart = null;
    }

    calculateMonthlyData() {
      const monthlyData = {};
      const uniqueCategories = [...new Set(this.transactions.map(t => t.category))];
      
      // Inicializar datos mensuales en orden de enero a diciembre
      for (let i = 1; i <= 12; i++) {
        const monthKey = i.toString().padStart(2, '0');
        monthlyData[monthKey] = {
          incomes: {},
          expenses: {},
          estimatedIncomes: {},
          estimatedExpenses: {}
        };
        
        uniqueCategories.forEach(category => {
          monthlyData[monthKey].incomes[category] = 0;
          monthlyData[monthKey].expenses[category] = 0;
          monthlyData[monthKey].estimatedIncomes[category] = 0;
          monthlyData[monthKey].estimatedExpenses[category] = 0;
        });
      }

      // Procesar transacciones
      this.transactions.forEach(transaction => {
        const [year, month] = transaction.date.split('-');
        if (parseInt(year) === this.selectedYear) {
          const category = transaction.category;
          if (transaction.type === 'income') {
            monthlyData[month].incomes[category] = (monthlyData[month].incomes[category] || 0) + transaction.amount;
          } else {
            monthlyData[month].expenses[category] = (monthlyData[month].expenses[category] || 0) + transaction.amount;
          }
        }
      });

      // Procesar presupuestos
      this.budgets.forEach(budget => {
        if (parseInt(budget.year) === this.selectedYear) {
          const category = budget.category;
          if (budget.type === 'income') {
            monthlyData[budget.month].estimatedIncomes[category] = (monthlyData[budget.month].estimatedIncomes[category] || 0) + budget.amount;
          } else {
            monthlyData[budget.month].estimatedExpenses[category] = (monthlyData[budget.month].estimatedExpenses[category] || 0) + budget.amount;
          }
        }
      });

      return monthlyData;
    }

    getColorForCategory(category) {
      return this.categoryColors[category] || `hsl(${Math.random() * 360}, 70%, 50%)`;
    }

    renderYearSelector() {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.gap = '10px';
      container.style.marginBottom = '20px';
      
      const label = document.createElement('label');
      label.textContent = 'Año:';
      label.style.fontWeight = 'bold';
      
      const select = document.createElement('select');
      select.style.padding = '5px';
      select.style.borderRadius = '4px';
      
      const years = new Set([
        ...this.transactions.map(t => parseInt(t.date.split('-')[0])),
        ...this.budgets.map(b => parseInt(b.year)),
        this.selectedYear
      ]);
      
      Array.from(years).sort((a, b) => b - a).forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        option.selected = year === this.selectedYear;
        select.appendChild(option);
      });
      
      select.addEventListener('change', (e) => {
        this.selectedYear = parseInt(e.target.value);
        this.updateChart();
      });
      
      container.appendChild(label);
      container.appendChild(select);
      return container;
    }

    updateChart() {
      const container = document.querySelector('.finance-charts');
      if (container) {
        container.innerHTML = '';
        container.appendChild(this.renderStackedBarChart());
      }
    }

    renderStackedBarChart() {
      const monthlyData = this.calculateMonthlyData();
      const container = document.createElement('div');
      container.className = 'chart-container';
      container.style.width = '95%';
      container.style.padding = '20px';
      container.style.height = '400px';
      
      container.innerHTML = `<h3>Resumen Mensual de Finanzas ${this.selectedYear}</h3><canvas id="financeChart"></canvas>`;
      
      const canvas = container.querySelector('#financeChart');
      canvas.style.height = '300px';
      canvas.style.width = '100%';
      const ctx = canvas.getContext('2d');

      // Verificar que Chart.js esté disponible
      if (typeof Chart === 'undefined') {
        console.error('Chart.js no está disponible');
        container.innerHTML += '<p class="error">Error: Chart.js no está disponible</p>';
        return container;
      }

      // Preparar datos para Chart.js en orden de enero a diciembre
      const labels = Array.from({length: 12}, (_, i) => this.monthAbbreviations[i]);
      
      // Obtener todas las categorías únicas tanto de transacciones como de presupuestos
      const uniqueCategories = [...new Set([
        ...this.transactions.map(t => t.category),
        ...this.budgets.map(b => b.category)
      ])];
      
      // Crear datasets para ingresos reales
      const incomeDatasets = uniqueCategories.map(category => ({
        label: `Ingreso ${category}`,
        data: Array.from({length: 12}, (_, i) => {
          const monthKey = (i + 1).toString().padStart(2, '0');
          return monthlyData[monthKey].incomes[category] || 0;
        }),
        backgroundColor: '#2ecc71',
        stack: 'income',
        hidden: false
      }));

      // Crear datasets para egresos reales
      const expenseDatasets = uniqueCategories.map(category => ({
        label: `Egreso ${category}`,
        data: Array.from({length: 12}, (_, i) => {
          const monthKey = (i + 1).toString().padStart(2, '0');
          return monthlyData[monthKey].expenses[category] || 0;
        }),
        backgroundColor: this.getColorForCategory(category),
        stack: 'expense'
      }));

      // Crear datasets para ingresos estimados
      const estimatedIncomeDatasets = uniqueCategories.map(category => ({
        label: `Ingreso Estimado ${category}`,
        data: Array.from({length: 12}, (_, i) => {
          const monthKey = (i + 1).toString().padStart(2, '0');
          return monthlyData[monthKey].estimatedIncomes[category] || 0;
        }),
        backgroundColor: '#95a5a6',
        stack: 'estimatedIncome',
        hidden: false,
        borderWidth: 2,
        borderColor: '#2ecc71'
      }));

      // Crear datasets para egresos estimados
      const estimatedExpenseDatasets = uniqueCategories.map(category => ({
        label: `Egreso Estimado ${category}`,
        data: Array.from({length: 12}, (_, i) => {
          const monthKey = (i + 1).toString().padStart(2, '0');
          return monthlyData[monthKey].estimatedExpenses[category] || 0;
        }),
        backgroundColor: '#95a5a6',
        stack: 'estimatedExpense',
        borderWidth: 2,
        borderColor: this.getColorForCategory(category)
      }));

      // Configuración del gráfico
      const config = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            ...incomeDatasets,
            ...expenseDatasets,
            ...estimatedIncomeDatasets,
            ...estimatedExpenseDatasets
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              stacked: true,
              grid: {
                display: false
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45
              }
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            }
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                filter: function(legendItem, data) {
                  const dataset = data.datasets[legendItem.datasetIndex];
                  return dataset.data.some(value => value > 0);
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += '$' + context.parsed.y.toLocaleString();
                  }
                  return label;
                }
              }
            }
          }
        }
      };

      // Destruir el gráfico anterior si existe
      if (this.chart) {
        this.chart.destroy();
      }

      // Crear el nuevo gráfico
      this.chart = new Chart(ctx, config);
      
      return container;
    }

    render() {
      const container = document.createElement('div');
      container.className = 'finance-charts';
      container.style.width = '100%';
      container.style.maxWidth = '100%';
      container.style.overflowX = 'hidden';
      container.style.minHeight = '500px';
      container.style.position = 'relative';
      
      container.appendChild(this.renderYearSelector());
      container.appendChild(this.renderStackedBarChart());
      
      return container;
    }
}