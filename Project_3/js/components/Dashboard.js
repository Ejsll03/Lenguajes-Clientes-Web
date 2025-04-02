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
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        const calendarBtn = document.querySelector('.calendar-btn');
        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => this.showMonthPicker());
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
        // Actualizar el período mostrado
        const periodText = document.querySelector('.period-text');
        if (periodText) {
            periodText.textContent = `${this.monthNames[this.selectedMonth]} ${this.selectedYear}`;
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
        const balance = filteredTransactions.reduce((acc, curr) => {
            return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
        }, 0);

        const balanceElement = document.querySelector('.balance-amount h2');
        if (balanceElement) {
            balanceElement.textContent = `$${balance.toFixed(2)}`;
        }
    }

    updateChart(filteredTransactions) {
        const ctx = document.querySelector('#activitiesChart')?.getContext('2d');
        if (!ctx) return;

        const monthlyData = this.calculateMonthlyData();
        const totalIncome = monthlyData.incomes.reduce((a, b) => a + b, 0);
        const totalExpenses = monthlyData.expenses.reduce((a, b) => a + b, 0);
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
                        fill: true
                    },
                    {
                        label: 'Gastos',
                        data: monthlyData.expenses,
                        borderColor: '#FF4B55',
                        backgroundColor: 'rgba(255, 75, 85, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
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
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#fff',
                            font: {
                                size: 10
                            },
                            maxTicksLimit: 5
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

        transactionsList.innerHTML = '';
        
        filteredTransactions.forEach(transaction => {
            const transactionElement = this.createTransactionElement(transaction);
            transactionsList.appendChild(transactionElement);
        });
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

    calculateSavingsWallets() {
        const categories = [...new Set(this.transactions.map(t => t.category))];
        const wallets = categories.map(category => {
            const transactions = this.transactions.filter(t => t.category === category);
            const total = transactions.reduce((sum, t) => {
                return sum + (t.type === 'income' ? t.amount : -t.amount);
            }, 0);
            
            const icons = {
                'Alimentación': '🍽️',
                'Transporte': '🚗',
                'Ocio': '🎮',
                'Vivienda': '🏠',
                'Salud': '🏥',
                'Educación': '📚',
                'Otros': '📦'
            };

            return {
                name: category,
                amount: Math.abs(total),
                icon: icons[category] || '💰'
            };
        });

        return wallets.sort((a, b) => b.amount - a.amount).slice(0, 4);
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

        filteredTransactions.forEach(t => {
            const day = new Date(t.date).getDate() - 1;
            if (t.type === 'income') {
                incomes[day] += t.amount;
            } else {
                expenses[day] += t.amount;
            }
        });

        return { days, incomes, expenses };
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
        
        const balance = filteredTransactions.reduce((total, t) => {
            return total + (t.type === 'income' ? t.amount : -t.amount);
        }, 0);
        
        const lastTransaction = filteredTransactions.length > 0 ? 
            [...filteredTransactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0] : null;
        const timeAgo = lastTransaction ? this.getTimeAgo(new Date(lastTransaction.date)) : 'No hay transacciones';
        const wallets = this.calculateSavingsWallets();
        const totalSavings = wallets.reduce((sum, wallet) => sum + wallet.amount, 0);
        const transactions = this.getRecentTransactions();
        
        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const currentMonth = monthNames[new Date().getMonth()];

        dashboard.innerHTML = `
            <div class="dashboard-grid">
                <div class="main-section">
                    <div class="dashboard-header">
                        <h1>Dashboard</h1>
                        <p>Vista general de ${currentMonth}</p>
                        <div class="period-selector">
                            <span class="period-text">${this.monthNames[this.selectedMonth]} ${this.selectedYear}</span>
                            <button class="calendar-btn">
                                <i class="fas fa-calendar"></i>
                            </button>
                        </div>
                    </div>

                    <div class="balance-card">
                        <div class="balance-amount">
                            <h2>$${balance.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h2>
                            <button class="copy-btn" title="Copiar al portapapeles">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <p class="last-transaction">
                            Última transacción: ${lastTransaction ? `${lastTransaction.type === 'income' ? 'Ingreso' : 'Gasto'} de $${lastTransaction.amount.toFixed(2)} en ${lastTransaction.category}` : 'No hay transacciones'} • ${timeAgo}
                        </p>
                        <div class="action-buttons">
                            <button class="move-money">
                                <i class="fas fa-exchange-alt"></i> Mover Dinero
                            </button>
                            <button class="request">
                                <i class="fas fa-hand-holding-usd"></i> Solicitar
                            </button>
                            <button class="transfer">
                                <i class="fas fa-paper-plane"></i> Transferir
                            </button>
                        </div>
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
                            ${transactions.map(t => `
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

                    <div class="saving-wallets">
                        <div class="section-header">
                            <h3>Carteras de Ahorro</h3>
                            <button class="add-new">
                                <i class="fas fa-plus"></i> Agregar
                            </button>
                        </div>
                        <div class="total-savings">
                            <span>Ahorros Totales</span>
                            <h3>$${totalSavings.toLocaleString('es-MX', {minimumFractionDigits: 2})}</h3>
                        </div>
                        <div class="wallets-grid">
                            ${wallets.map(wallet => `
                                <div class="wallet-card">
                                    <span class="wallet-icon">${wallet.icon}</span>
                                    <span class="wallet-name">${wallet.name}</span>
                                    <span class="wallet-amount">$${wallet.amount.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
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
                
                dashboard.querySelector('.transactions-list').innerHTML = filteredTransactions.map(t => `
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
            });
        });

        // Inicializar el gráfico de actividades
        setTimeout(() => {
            const ctx = dashboard.querySelector('#activitiesChart').getContext('2d');
            const monthlyData = this.calculateMonthlyData();
            const totalIncome = monthlyData.incomes.reduce((a, b) => a + b, 0);
            const totalExpenses = monthlyData.expenses.reduce((a, b) => a + b, 0);
            const percentageChange = ((totalIncome - totalExpenses) / totalExpenses * 100).toFixed(1);
            
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
                            fill: true
                        },
                        {
                            label: 'Gastos',
                            data: monthlyData.expenses,
                            borderColor: '#FF4B55',
                            backgroundColor: 'rgba(255, 75, 85, 0.1)',
                            tension: 0.4,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
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
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#fff',
                                font: {
                                    size: 10
                                },
                                maxTicksLimit: 5
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

        // Añadir evento al botón de agregar cartera
        dashboard.querySelector('.add-new').addEventListener('click', () => {
            alert('Funcionalidad de agregar cartera en desarrollo');
        });

        // Inicializar con los datos del mes actual
        this.updateDashboard();

        return dashboard;
    }
} 