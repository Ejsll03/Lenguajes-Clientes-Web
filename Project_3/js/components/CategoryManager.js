export class CategoryManager {
  constructor(db, onUpdate) {
      this.db = db;
      this.onUpdate = onUpdate;
      this.categories = [];
      this.defaultCategories = ['Alimentación', 'Transporte', 'Ocio', 'Vivienda', 'Salud', 'Educación'];
  }

  async initDefaultCategories() {
      try {
          const existingCategories = await this.db.getCategories();
          if (existingCategories.length === 0) {
              await Promise.all(
                  this.defaultCategories.map(cat => this.db.addCategory(cat))
              );
              console.log('Categorías predefinidas creadas');
          }
      } catch (error) {
          console.error('Error al inicializar categorías:', error);
      }
  }

  async loadCategories() {
      try {
          this.categories = await this.db.getCategories();
          return this.categories;
      } catch (error) {
          console.error('Error al cargar categorías:', error);
          return [];
      }
  }

  async isCategoryInUse(category) {
      try {
          const transactions = await this.db.getAllTransactions();
          const budgets = await this.db.getAllBudgets();
          return transactions.some(t => t.category === category) || 
                 budgets.some(b => b.category === category);
      } catch (error) {
          console.error('Error al verificar uso:', error);
          return true; // Por seguridad, asumir que está en uso si hay error
      }
  }

  render() {
      const container = document.createElement('div');
      container.className = 'category-manager';

      container.innerHTML = `
          <h2><i class="fas fa-tags"></i> Gestión de Categorías</h2>
          <div class="controls">
              <div class="category-form">
                  <input type="text" id="new-category" placeholder="Nueva categoría">
                  <button id="add-category" class="btn-primary">
                      <i class="fas fa-plus-circle"></i> Agregar Categoría
                  </button>
              </div>
              <button id="restore-defaults" class="btn-secondary">
                  <i class="fas fa-undo"></i> Restaurar Predefinidas
              </button>
          </div>
          <ul class="category-list"></ul>
      `;

      const categoryList = container.querySelector('.category-list');
      this.renderCategoryList(categoryList);

      // Handler para agregar categorías
      container.querySelector('#add-category').addEventListener('click', async () => {
          const input = container.querySelector('#new-category');
          const categoryName = input.value.trim();

          if (!categoryName) {
              alert('Ingrese un nombre válido');
              return;
          }

          if (this.categories.includes(categoryName)) {
              alert('La categoría ya existe');
              return;
          }

          try {
              await this.db.addCategory(categoryName);
              this.categories = await this.loadCategories();
              input.value = '';
              await this.renderCategoryList(categoryList);
              this.onUpdate?.(this.categories);
          } catch (error) {
              console.error('Error al agregar:', error);
              alert('Error al agregar categoría');
          }
      });

      // Handler para restaurar categorías predefinidas
      container.querySelector('#restore-defaults').addEventListener('click', async () => {
          if (confirm('¿Restaurar categorías predefinidas? Se agregarán las faltantes.')) {
              try {
                  const currentCategories = await this.db.getCategories();
                  const missingDefaults = this.defaultCategories.filter(
                      cat => !currentCategories.includes(cat)
                  );

                  if (missingDefaults.length > 0) {
                      await Promise.all(
                          missingDefaults.map(cat => this.db.addCategory(cat))
                      );
                      this.categories = await this.loadCategories();
                      await this.renderCategoryList(categoryList);
                      this.onUpdate?.(this.categories);
                      alert(`Se agregaron ${missingDefaults.length} categorías predefinidas`);
                  } else {
                      alert('Todas las categorías predefinidas ya existen');
                  }
              } catch (error) {
                  console.error('Error al restaurar:', error);
                  alert('Error al restaurar categorías');
              }
          }
      });

      return container;
  }

  async renderCategoryList(listElement) {
      try {
          await this.loadCategories();
          listElement.innerHTML = '';

          if (this.categories.length === 0) {
              listElement.innerHTML = '<li class="empty"><i class="fas fa-folder-open"></i> No hay categorías</li>';
              return;
          }

          for (const category of this.categories) {
              const li = document.createElement('li');
              li.innerHTML = `
                  <span class="category-name"><i class="fas fa-tag"></i> ${category}</span>
                  <button class="icon-btn delete-btn" data-category="${category}" title="Eliminar categoría">
                      <i class="fas fa-trash-alt text-danger"></i>
                  </button>
              `;

              li.querySelector('.delete-btn').addEventListener('click', async (e) => {
                  e.preventDefault();
                  const categoryName = e.target.closest('.delete-btn').getAttribute('data-category');

                  if (await this.isCategoryInUse(categoryName)) {
                      alert('No se puede eliminar: está en uso en transacciones o presupuestos');
                      return;
                  }

                  if (confirm(`¿Eliminar "${categoryName}" permanentemente?`)) {
                      try {
                          await this.db.deleteCategory(categoryName);
                          this.categories = this.categories.filter(c => c !== categoryName);
                          await this.renderCategoryList(listElement);
                          this.onUpdate?.(this.categories);
                      } catch (error) {
                          console.error('Error al eliminar:', error);
                          alert('Error al eliminar categoría');
                      }
                  }
              });

              listElement.appendChild(li);
          }
      } catch (error) {
          console.error('Error al renderizar:', error);
          listElement.innerHTML = '<li class="error">Error al cargar categorías</li>';
      }
  }
}