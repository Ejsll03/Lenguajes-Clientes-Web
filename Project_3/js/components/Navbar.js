export class Navbar {
  constructor(onTabChange) {
    this.onTabChange = onTabChange;
    this.tabs = [
      { id: 'dashboard', name: 'Dashboard', icon: 'fa-chart-pie' },
      { id: 'transactions', name: 'Transacciones', icon: 'fa-exchange-alt' },
      { id: 'budgets', name: 'Presupuestos', icon: 'fa-wallet' },
      { id: 'comparison', name: 'Comparación', icon: 'fa-chart-bar' },
      { id: 'categories', name: 'Categorías', icon: 'fa-tags' }
    ];
  }

  render() {
    const nav = document.createElement('nav');
    nav.className = 'main-nav';
    
    nav.innerHTML = `
      <ul>
        ${this.tabs.map(tab => `
          <li>
            <button class="tab-button${tab.id === 'dashboard' ? ' active' : ''}" data-tab="${tab.id}">
              <i class="fas ${tab.icon}"></i>
              ${tab.name}
            </button>
          </li>
        `).join('')}
      </ul>
    `;

    nav.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab-button').getAttribute('data-tab');
        nav.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        e.target.closest('.tab-button').classList.add('active');
        this.onTabChange(tab);
      });
    });

    return nav;
  }
}