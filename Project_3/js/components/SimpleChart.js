export class SimpleChart {
    constructor(data, type, categories) {
      this.data = data;
      this.type = type; // 'transactions' o 'budgets'
      this.categories = categories;
      this.selectedYear = new Date().getFullYear();
      this.categoryColors = {
        'Alimentación': '#e74c3c',
        'Transporte': '#3498db',
        'Ocio': '#2ecc71',
        'Vivienda': '#f1c40f',
        'Salud': '#9b59b6',
        'Educación': '#1abc9c',
        'Otros': '#e67e22'
      };
      this.monthAbbreviations = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      this.chart = null;
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
      
      // Obtener años únicos de los datos
      const years = new Set();
      this.data.forEach(item => {
        const year = this.type === 'transactions' 
          ? parseInt(item.date.split('-')[0]) 
          : parseInt(item.year);
        years.add(year);
      });
      years.add(this.selectedYear);
      
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
  
    calculateMonthlyData() {
      const monthlyData = {
        income: {},
        expense: {}
      };
      
      // Inicializar estructura de datos para todos los meses
      for (let i = 1; i <= 12; i++) {
        const monthKey = i.toString().padStart(2, '0');
        monthlyData.income[monthKey] = {};
        monthlyData.expense[monthKey] = {};
        
        this.categories.forEach(category => {
          monthlyData.income[monthKey][category] = 0;
          monthlyData.expense[monthKey][category] = 0;
        });
      }
      
      // Procesar datos según el tipo
      this.data.forEach(item => {
        let year, month, category, amount, type;
        
        if (this.type === 'transactions') {
          [year, month] = item.date.split('-');
          category = item.category;
          amount = item.amount;
          type = item.type;
        } else { // budgets
          year = item.year;
          month = item.month;
          category = item.category;
          amount = item.amount;
          type = item.type;
        }
        
        if (parseInt(year) === this.selectedYear) {
          monthlyData[type][month][category] += amount;
        }
      });
      
      return monthlyData;
    }
  
    renderChart() {
      const monthlyData = this.calculateMonthlyData();
      const container = document.createElement('div');
      container.className = 'chart-container';
      container.style.width = '95%';
      container.style.padding = '20px';
      container.style.height = '400px';
      
      const title = this.type === 'transactions' 
        ? `Ingresos y Egresos Mensuales (${this.selectedYear})` 
        : `Presupuestos Mensuales (${this.selectedYear})`;
      
      container.innerHTML = `<h3>${title}</h3><canvas id="${this.type}Chart"></canvas>`;
      
      const canvas = container.querySelector(`#${this.type}Chart`);
      canvas.style.height = '300px';
      canvas.style.width = '100%';
      const ctx = canvas.getContext('2d');
  
      if (typeof Chart === 'undefined') {
        console.error('Chart.js no está disponible');
        container.innerHTML += '<p class="error">Error: Chart.js no está disponible</p>';
        return container;
      }
  
      const labels = this.monthAbbreviations;
      
      // Crear datasets para ingresos (en verde)
      const incomeDatasets = this.categories.map(category => ({
        label: `Ingreso - ${category}`,
        data: Array.from({length: 12}, (_, i) => {
          const monthKey = (i + 1).toString().padStart(2, '0');
          return monthlyData.income[monthKey][category] || 0;
        }),
        backgroundColor: '#2ecc71',
        borderColor: '#27ae60',
        borderWidth: 1,
        stack: 'income'
      }));

      // Crear datasets para egresos (en rojo)
      const expenseDatasets = this.categories.map(category => ({
        label: `Egreso - ${category}`,
        data: Array.from({length: 12}, (_, i) => {
          const monthKey = (i + 1).toString().padStart(2, '0');
          return monthlyData.expense[monthKey][category] || 0;
        }),
        backgroundColor: this.getColorForCategory(category),
        borderColor: this.getColorForCategory(category),
        borderWidth: 1,
        stack: 'expense'
      }));
  
      const config = {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [...incomeDatasets, ...expenseDatasets]
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
  
      if (this.chart) {
        this.chart.destroy();
      }
  
      this.chart = new Chart(ctx, config);
      
      return container;
    }
  
    updateChart() {
      const container = document.querySelector(`.${this.type}-chart-container`);
      if (container) {
        container.innerHTML = '';
        container.appendChild(this.renderChart());
      }
    }
  
    render() {
      const container = document.createElement('div');
      container.className = `${this.type}-chart-container`;
      
      container.appendChild(this.renderYearSelector());
      container.appendChild(this.renderChart());
      
      return container;
    }
  }