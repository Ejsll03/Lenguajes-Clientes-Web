export class FinanceDB {
  constructor() {
    this.dbName = 'FinanceTrackerDB';
    this.dbVersion = 5; 
    this.db = null;
    this.defaultCategories = ['Alimentación', 'Transporte', 'Ocio', 'Vivienda', 'Salud', 'Educación'];
  }

  /**
   * Inicializa la base de datos y crea los object stores necesarios
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        console.log('Actualizando base de datos a versión', this.dbVersion);

        // Si existe el almacén de categorías, lo eliminamos para recrearlo
        if (db.objectStoreNames.contains('categories')) {
          db.deleteObjectStore('categories');
        }

        // Crear ObjectStore para transacciones si no existe
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          transactionStore.createIndex('date', 'date', { unique: false });
          transactionStore.createIndex('type', 'type', { unique: false });
          transactionStore.createIndex('category', 'category', { unique: false });
          console.log('ObjectStore "transactions" creado');
        }

        // Crear ObjectStore para presupuestos si no existe
        if (!db.objectStoreNames.contains('budgets')) {
          const budgetStore = db.createObjectStore('budgets', { 
            keyPath: 'id' 
          });
          budgetStore.createIndex('month', 'month', { unique: false });
          budgetStore.createIndex('category', 'category', { unique: false });
          console.log('ObjectStore "budgets" creado');
        }

        // Crear nuevo ObjectStore para categorías
        const categoryStore = db.createObjectStore('categories', { keyPath: 'name' });
        console.log('ObjectStore "categories" creado');

        // Agregar categorías por defecto
        const tx = e.target.transaction;
        const store = tx.objectStore('categories');
        this.defaultCategories.forEach(category => {
          store.add({ name: category, isDefault: true });
        });
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log('Base de datos inicializada correctamente');
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('Error al abrir la base de datos:', e.target.error);
        reject(e.target.error);
      };
    });
  }

  // ================== MÉTODOS PARA TRANSACCIONES ==================
  async getAllTransactions() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['transactions'], 'readonly');
      const store = tx.objectStore('transactions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async addTransaction(transaction) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['transactions'], 'readwrite');
      const store = tx.objectStore('transactions');
      const request = store.add({
        ...transaction,
        id: Date.now().toString()
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async updateTransaction(transaction) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['transactions'], 'readwrite');
      const store = tx.objectStore('transactions');
      const request = store.put(transaction);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async deleteTransaction(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['transactions'], 'readwrite');
      const store = tx.objectStore('transactions');
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // ================== MÉTODOS PARA PRESUPUESTOS ==================
  async getAllBudgets() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['budgets'], 'readonly');
      const store = tx.objectStore('budgets');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

async addBudget(budget) {
  return new Promise((resolve, reject) => {
    const tx = this.db.transaction(['budgets'], 'readwrite');
    const store = tx.objectStore('budgets');
    const request = store.add({
      ...budget,
      id: `${budget.period}-${budget.category}` // ID único basado en periodo y categoría
    });
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}

  async updateBudget(budget) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['budgets'], 'readwrite');
      const store = tx.objectStore('budgets');
      const request = store.put(budget);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async deleteBudget(id) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['budgets'], 'readwrite');
      const store = tx.objectStore('budgets');
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  // ================== MÉTODOS PARA CATEGORÍAS ==================
  async getCategories() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['categories'], 'readonly');
      const store = tx.objectStore('categories');
      const request = store.getAll();

      request.onsuccess = () => {
        const categories = request.result;
        resolve(categories.map(c => c.name));
      };
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async addCategory(category) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['categories'], 'readwrite');
      const store = tx.objectStore('categories');
      const request = store.add({ name: category, isDefault: false });

      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  async deleteCategory(category) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(['categories'], 'readwrite');
      const store = tx.objectStore('categories');
      const categoryName = typeof category === 'string' ? category : category.name;
      const request = store.delete(categoryName);
  
      request.onsuccess = () => {
        console.log('Categoría eliminada de la DB:', categoryName);
        resolve();
      };
  
      request.onerror = (e) => {
        console.error('Error al eliminar categoría:', e.target.error);
        reject(e.target.error);
      };
    });
  }
}