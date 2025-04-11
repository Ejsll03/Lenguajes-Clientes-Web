export class Dashboard {
    constructor(transactions, budgets) {
        this.transactions = transactions;
        this.budgets = budgets;
        this.currentDate = new Date();
        this.selectedMonth = this.currentDate.getMonth();
        this.selectedYear = this.currentDate.getFullYear();
        this.monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        this.currentPeriod = this.getCurrentMonthPeriod();
        this.chart = null;
    }

    init() {
        const dashboard = this.render();
        document.querySelector('#main').appendChild(dashboard);
        
        // Asegurarse de que el DOM esté listo antes de configurar los event listeners
        setTimeout(() => {
            this.setupEventListeners();
            this.updateDashboard();
        }, 0);
    }

    setupEventListeners() {
        /* // Eventos para navegación de meses
        const prevMonthBtn = document.querySelector('.prev-month');
        const nextMonthBtn = document.querySelector('.next-month');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                if (this.selectedMonth === 0) {
                    this.selectedMonth = 11;
                    this.selectedYear--;
                } else {
                    this.selectedMonth--;
                }
                this.updateDashboard();
            });
        }

        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                if (this.selectedMonth === 11) {
                    this.selectedMonth = 0;
                    this.selectedYear++;
                } else {
                    this.selectedMonth++;
                }
                this.updateDashboard();
            });
        } */

        // Eventos para filtros de transacciones
        const filterButtons = document.querySelectorAll('.transaction-filters button');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                filterButtons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                
                let filteredTransactions = this.getRecentTransactions();
                if (filter !== 'all') {
                    filteredTransactions = filteredTransactions.filter(t => t.type === filter);
                }
                
                this.updateTransactionsList(filteredTransactions);
            });
        });

        // Evento para copiar balance
        const copyBtn = document.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const balance = document.querySelector('.balance-amount h2').textContent.replace('$', '');
                navigator.clipboard.writeText(balance)
                    .then(() => alert('Balance copiado al portapapeles'))
                    .catch(err => console.error('Error al copiar:', err));
            });
        }
    }

    showMonthPicker() {
        const input = document.createElement('input');
        input.type = 'month';
        input.value = `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}`;
        
        input.addEventListener('change', (e) => {
            const date = new Date(e.target.value);
            this.selectedMonth = date.getMonth();
            this.selectedYear = date.getFullYear();
            this.updateDashboard();
        });

        input.click();
    }

    updateDashboard() {
        // Actualizar el mes y año mostrados
        const monthText = document.querySelector('.month-text');
        const yearText = document.querySelector('.year-text');
        if (monthText) {
            monthText.textContent = this.monthNames[this.selectedMonth];
        }
        if (yearText) {
            yearText.textContent = this.selectedYear;
        }

        // Filtrar transacciones por mes seleccionado
        const filteredTransactions = this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === this.selectedMonth && 
                   transactionDate.getFullYear() === this.selectedYear;
        });

        // Actualizar balance
        this.updateBalance(filteredTransactions);
        
        // Actualizar gráfica
        this.updateChart(filteredTransactions);
        
        // Actualizar lista de transacciones
        this.updateTransactionsList(filteredTransactions);
    }

    updateBalance(filteredTransactions) {
        const ingresos = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((total, t) => total + t.amount, 0);
            
        const egresos = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((total, t) => total + t.amount, 0);
            
        const balance = ingresos - egresos;

        const balanceElement = document.querySelector('.balance-amount h2');
        if (balanceElement) {
            balanceElement.textContent = `$${balance.toFixed(2)}`;
            balanceElement.className = balance >= 0 ? 'positive' : 'negative';
        }
    }

    updateChart(filteredTransactions) {
        const ctx = document.querySelector('#activitiesChart')?.getContext('2d');
        if (!ctx) return;

        const monthlyData = this.calculateMonthlyData();
        const totalIncome = monthlyData.totalIncome;
        const totalExpenses = monthlyData.totalExpenses;
        const percentageChange = totalExpenses > 0 ? 
            ((totalIncome - totalExpenses) / totalExpenses * 100).toFixed(1) : 
            totalIncome > 0 ? 100 : 0;
        
        const percentageElement = document.querySelector('.percentage');
        if (percentageElement) {
            percentageElement.textContent = `${percentageChange >= 0 ? '+' : ''}${percentageChange}%`;
            percentageElement.classList.toggle('negative', percentageChange < 0);
        }

        if (this.chart) {
            this.chart.destroy();
        }
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.days,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: monthlyData.incomes,
                        borderColor: '#00A86B',
                        backgroundColor: 'rgba(0, 168, 107, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Gastos',
                        data: monthlyData.expenses,
                        borderColor: '#FF4B55',
                        backgroundColor: 'rgba(255, 75, 85, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Balance Acumulado',
                        data: monthlyData.balance,
                        borderColor: '#7F3DFF',
                        backgroundColor: 'rgba(127, 61, 255, 0.1)',
                        tension: 0.4,
                        fill: true,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#fff',
                            boxWidth: 10,
                            padding: 8,
                            font: {
                                size: 11
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
                                    label += new Intl.NumberFormat('es-MX', {
                                        style: 'currency',
                                        currency: 'MXN'
                                    }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 10
                            },
                            maxTicksLimit: 5,
                            callback: function(value) {
                                return new Intl.NumberFormat('es-MX', {
                                    style: 'currency',
                                    currency: 'MXN',
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 10
                            },
                            maxTicksLimit: 5,
                            callback: function(value) {
                                return new Intl.NumberFormat('es-MX', {
                                    style: 'currency',
                                    currency: 'MXN',
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 10
                            },
                            maxTicksLimit: 10,
                            maxRotation: 0
                        },
                        title: {
                            display: true,
                            text: 'Días del mes',
                            color: '#fff',
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            padding: {
                                top: 10
                            }
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 2,
                        hoverRadius: 4
                    },
                    line: {
                        borderWidth: 2
                    }
                },
                layout: {
                    padding: {
                        top: 5,
                        right: 5,
                        bottom: 5,
                        left: 5
                    }
                }
            }
        });
    }

    updateTransactionsList(filteredTransactions) {
        const transactionsList = document.querySelector('.transactions-list');
        if (!transactionsList) return;

        transactionsList.innerHTML = filteredTransactions.map(t => `
            <div class="transaction-item">
                <div class="transaction-icon">
                    <i class="fas ${t.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"
                       style="color: ${t.type === 'income' ? '#00A86B' : '#FF4B55'}"></i>
                </div>
                <div class="transaction-info">
                    <span class="transaction-name">${t.category}</span>
                    <span class="transaction-type">
                        ${t.type === 'income' ? 'Ingreso' : 'Gasto'} • ${new Date(t.date).toLocaleDateString()}
                    </span>
                </div>
                <span class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </span>
            </div>
        `).join('');
    }

    getCurrentMonthPeriod() {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
            start: firstDay.toISOString().split('T')[0],
            end: lastDay.toISOString().split('T')[0]
        };
    }

    calculateTotalBalance() {
        return this.transactions.reduce((total, t) => {
            return total + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
    }

    getRecentTransactions(limit = 5) {
        return [...this.transactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    calculateMonthlyData() {
        // Crear fecha para el primer y último día del mes seleccionado
        const startDate = new Date(this.selectedYear, this.selectedMonth, 1);
        const endDate = new Date(this.selectedYear, this.selectedMonth + 1, 0);
        
        const filteredTransactions = this.transactions.filter(t => {
            const date = new Date(t.date);
            return date >= startDate && date <= endDate;
        });

        const daysInMonth = endDate.getDate();
        const days = [...Array(daysInMonth).keys()].map(i => i + 1);
        const incomes = Array(daysInMonth).fill(0);
        const expenses = Array(daysInMonth).fill(0);
        const balance = Array(daysInMonth).fill(0);
        let runningBalance = 0;

        filteredTransactions.forEach(t => {
            const day = new Date(t.date).getDate() - 1;
            if (t.type === 'income') {
                incomes[day] += t.amount;
                runningBalance += t.amount;
            } else {
                expenses[day] += t.amount;
                runningBalance -= t.amount;
            }
            balance[day] = runningBalance;
        });

        // Calcular totales y promedios
        const totalIncome = incomes.reduce((a, b) => a + b, 0);
        const totalExpenses = expenses.reduce((a, b) => a + b, 0);
        const averageIncome = totalIncome / daysInMonth;
        const averageExpenses = totalExpenses / daysInMonth;
        const maxBalance = Math.max(...balance);
        const minBalance = Math.min(...balance);

        return { 
            days, 
            incomes, 
            expenses, 
            balance,
            totalIncome,
            totalExpenses,
            averageIncome,
            averageExpenses,
            maxBalance,
            minBalance
        };
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 60) return `hace ${diffMinutes} minutos`;
        if (diffHours < 24) return `hace ${diffHours} horas`;
        return `hace ${diffDays} días`;
    }

    render() {
        const dashboard = document.createElement('div');
        dashboard.className = 'dashboard-container';
        
        // Filtrar transacciones por mes seleccionado
        const filteredTransactions = this.transactions.filter(transaction => {
            const transactionDate = new Date(transaction.date);
            return transactionDate.getMonth() === this.selectedMonth && 
                   transactionDate.getFullYear() === this.selectedYear;
        });
        
        // Calcular ingresos y egresos por separado
        const ingresos = filteredTransactions
            .filter(t => t.type === 'income')
            .reduce((total, t) => total + t.amount, 0);
            
        const egresos = filteredTransactions
            .filter(t => t.type === 'expense')
            .reduce((total, t) => total + t.amount, 0);
            
        const balance = ingresos - egresos;
        
        const lastTransaction = this.transactions.length > 0 ? 
            [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
        const timeAgo = lastTransaction ? this.getTimeAgo(new Date(lastTransaction.date)) : 'No hay transacciones';
        const recentTransactions = this.getRecentTransactions();
        const currentMonth = this.monthNames[new Date().getMonth()];

        dashboard.innerHTML = `
            <div class="dashboard-grid">
                <div class="main-section">
                    <div class="dashboard-header">
                        <div class="header-content">
                            <h1>Dashboard</h1>
                            <p>Vista general de ${currentMonth}</p>
                        </div>
                        <div class="month-selector">
                            <button class="prev-month" title="Mes anterior"></button>
                            <div class="current-month">
                                <span class="month-text">${this.monthNames[this.selectedMonth]}</span>
                                <span class="year-text">${this.selectedYear}</span>
                            </div>
                            <button class="next-month" title="Mes siguiente"></button>
                        </div>
                    </div>

                    <div class="balance-card">
                        <div class="balance-amount">
                            <h2 class="${balance >= 0 ? 'positive' : 'negative'}">$${balance.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h2>
                            <button class="copy-btn" title="Copiar al portapapeles">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <p class="last-transaction">
                            Última transacción: ${lastTransaction ? `${lastTransaction.type === 'income' ? 'Ingreso' : 'Gasto'} de $${lastTransaction.amount.toFixed(2)} en ${lastTransaction.category}` : 'No hay transacciones'} • ${timeAgo}
                        </p>
                    </div>

                    <div class="activities-chart">
                        <div class="chart-header">
                            <h3>Actividades</h3>
                            <div class="chart-stats">
                                <span class="percentage">Calculando...</span>
                                <span class="period">del mes anterior</span>
                            </div>
                        </div>
                        <canvas id="activitiesChart" style="width: 100%; height: 300px;"></canvas>
                    </div>
                </div>

                <div class="side-section">
                    <div class="recent-transactions">
                        <div class="section-header">
                            <h3>Transacciones Recientes</h3>
                            <div class="transaction-filters">
                                <button class="active" data-filter="all">Todas</button>
                                <button data-filter="income">Ingresos</button>
                                <button data-filter="expense">Gastos</button>
                            </div>
                        </div>
                        <div class="transactions-list">
                            ${recentTransactions.map(t => `
                                <div class="transaction-item">
                                    <div class="transaction-icon">
                                        <i class="fas ${t.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"
                                           style="color: ${t.type === 'income' ? '#00A86B' : '#FF4B55'}"></i>
                                    </div>
                                    <div class="transaction-info">
                                        <span class="transaction-name">${t.category}</span>
                                        <span class="transaction-type">
                                            ${t.type === 'income' ? 'Ingreso' : 'Gasto'} • ${new Date(t.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span class="transaction-amount ${t.type}">
                                        ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Añadir funcionalidad al botón de copiar
        dashboard.querySelector('.copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(balance.toFixed(2))
                .then(() => alert('Balance copiado al portapapeles'))
                .catch(err => console.error('Error al copiar:', err));
        });

        // Añadir eventos a los filtros de transacciones
        dashboard.querySelectorAll('.transaction-filters button').forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                dashboard.querySelectorAll('.transaction-filters button').forEach(btn => 
                    btn.classList.remove('active'));
                e.target.classList.add('active');
                
                let filteredTransactions = this.getRecentTransactions();
                if (filter !== 'all') {
                    filteredTransactions = filteredTransactions.filter(t => t.type === filter);
                }
                
                this.updateTransactionsList(filteredTransactions);
            });
        });

        // Inicializar el gráfico de actividades
        setTimeout(() => {
            const ctx = dashboard.querySelector('#activitiesChart').getContext('2d');
            const monthlyData = this.calculateMonthlyData();
            
            const totalIncome = monthlyData.totalIncome;
            const totalExpenses = monthlyData.totalExpenses;
            const percentageChange = totalExpenses > 0 ? 
                ((totalIncome - totalExpenses) / totalExpenses * 100).toFixed(1) : 
                totalIncome > 0 ? 100 : 0;
            
            dashboard.querySelector('.percentage').textContent = 
                `${percentageChange >= 0 ? '+' : ''}${percentageChange}%`;
            dashboard.querySelector('.percentage').classList.toggle('negative', percentageChange < 0);

            if (this.chart) {
                this.chart.destroy();
            }
            
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: monthlyData.days,
                    datasets: [
                        {
                            label: 'Ingresos',
                            data: monthlyData.incomes,
                            borderColor: '#00A86B',
                            backgroundColor: 'rgba(0, 168, 107, 0.1)',
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Gastos',
                            data: monthlyData.expenses,
                            borderColor: '#FF4B55',
                            backgroundColor: 'rgba(255, 75, 85, 0.1)',
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y'
                        },
                        {
                            label: 'Balance Acumulado',
                            data: monthlyData.balance,
                            borderColor: '#7F3DFF',
                            backgroundColor: 'rgba(127, 61, 255, 0.1)',
                            tension: 0.4,
                            fill: true,
                            yAxisID: 'y1'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#fff',
                                boxWidth: 10,
                                padding: 8,
                                font: {
                                    size: 11
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
                                        label += new Intl.NumberFormat('es-MX', {
                                            style: 'currency',
                                            currency: 'MXN'
                                        }).format(context.parsed.y);
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#fff',
                                font: {
                                    size: 10
                                },
                                maxTicksLimit: 5,
                                callback: function(value) {
                                    return new Intl.NumberFormat('es-MX', {
                                        style: 'currency',
                                        currency: 'MXN',
                                        maximumFractionDigits: 0
                                    }).format(value);
                                }
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                                drawOnChartArea: false
                            },
                            ticks: {
                                color: '#fff',
                                font: {
                                    size: 10
                                },
                                maxTicksLimit: 5,
                                callback: function(value) {
                                    return new Intl.NumberFormat('es-MX', {
                                        style: 'currency',
                                        currency: 'MXN',
                                        maximumFractionDigits: 0
                                    }).format(value);
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: '#fff',
                                font: {
                                    size: 10
                                },
                                maxTicksLimit: 10,
                                maxRotation: 0
                            },
                            title: {
                                display: true,
                                text: 'Días del mes',
                                color: '#fff',
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                },
                                padding: {
                                    top: 10
                                }
                            }
                        }
                    },
                    elements: {
                        point: {
                            radius: 2,
                            hoverRadius: 4
                        },
                        line: {
                            borderWidth: 2
                        }
                    },
                    layout: {
                        padding: {
                            top: 5,
                            right: 5,
                            bottom: 5,
                            left: 5
                        }
                    }
                }
            });
        }, 0);

        return dashboard;
    }
} 