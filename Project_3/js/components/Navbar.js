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
    this.isMenuOpen = false;
  }

  render() {
    // Crear el contenedor principal
    const nav = document.createElement('nav');
    nav.className = 'main-nav';
    
    // Crear el botón hamburguesa
    const menuButton = document.createElement('button');
    menuButton.className = 'menu-toggle';
    menuButton.setAttribute('aria-label', 'Menú');
    menuButton.setAttribute('type', 'button');
    menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Crear la lista de navegación
    const menuList = document.createElement('ul');
    
    // Crear los elementos del menú
    this.tabs.forEach(tab => {
      const li = document.createElement('li');
      
      const button = document.createElement('button');
      button.className = `tab-button${tab.id === 'dashboard' ? ' active' : ''}`;
      button.setAttribute('data-tab', tab.id);
      button.setAttribute('type', 'button');
      button.innerHTML = `<i class="fas ${tab.icon}"></i>${tab.name}`;
      
      // Usar touchstart para mejor respuesta en iOS
      const handleClick = () => {
        document.querySelectorAll('.tab-button').forEach(btn => 
          btn.classList.remove('active')
        );
        button.classList.add('active');
        this.closeMenu(menuList, menuButton);
        this.onTabChange(tab.id);
      };

      button.addEventListener('click', handleClick);
      button.addEventListener('touchstart', handleClick, { passive: true });
      
      li.appendChild(button);
      menuList.appendChild(li);
    });
    
    // Agregar elementos al navbar
    nav.appendChild(menuButton);
    nav.appendChild(menuList);

    // Manejar el toggle del menú
    const toggleMenu = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      this.isMenuOpen = !this.isMenuOpen;
      if (this.isMenuOpen) {
        menuList.classList.add('show');
        menuButton.innerHTML = '<i class="fas fa-times"></i>';
      } else {
        menuList.classList.remove('show');
        menuButton.innerHTML = '<i class="fas fa-bars"></i>';
      }
    };

    // Event listeners para el botón hamburguesa
    menuButton.addEventListener('click', toggleMenu);
    menuButton.addEventListener('touchstart', toggleMenu, { passive: false });

    // Cerrar el menú cuando se hace clic fuera
    const handleOutsideClick = (e) => {
      if (this.isMenuOpen && !nav.contains(e.target)) {
        toggleMenu();
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });

    // Cerrar el menú cuando se redimensiona la ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 700 && this.isMenuOpen) {
        toggleMenu();
      }
    });

    return nav;
  }

  closeMenu(menuList, menuButton) {
    if (this.isMenuOpen) {
      this.isMenuOpen = false;
      menuList.classList.remove('show');
      menuButton.innerHTML = '<i class="fas fa-bars"></i>';
    }
  }
}