const API = '/api/expenses';
let allExpenses = [];
let chartInstance = null;

window.onload = () => {
  loadExpenses();
  loadSummary();
};

async function loadExpenses() {
  const res = await fetch(API);
  allExpenses = await res.json();
  renderExpenses(allExpenses);
  renderChart(allExpenses);
}

async function loadSummary() {
  const res = await fetch(`${API}/stats/summary`);
  const data = await res.json();
  document.getElementById('totalAmount').textContent = `Rs. ${data.total.toLocaleString()}`;
  document.getElementById('totalCount').textContent = data.count;

  // Highest category
  if (Object.keys(data.byCategory).length > 0) {
    const highest = Object.entries(data.byCategory).sort((a, b) => b[1] - a[1])[0];
    document.getElementById('highestCategory').textContent = `${highest[0]}`;
  }
}

function renderChart(expenses) {
  const categories = ['Food', 'Transport', 'Shopping', 'Health', 'Education', 'Entertainment', 'Other'];
  const data = categories.map(cat =>
    expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  );

  const ctx = document.getElementById('categoryChart').getContext('2d');

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [{
        data: data,
        backgroundColor: [
          '#e74c3c', '#3498db', '#2ecc71',
          '#f39c12', '#9b59b6', '#1abc9c', '#95a5a6'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    }
  });
}

function renderExpenses(expenses) {
  const list = document.getElementById('expenseList');
  if (expenses.length === 0) {
    list.innerHTML = '<div class="no-expenses">No expenses found 🎉</div>';
    return;
  }
  list.innerHTML = expenses.map(e => `
    <div class="expense-card">
      <div class="expense-info">
        <h3>${e.title}</h3>
        <p>${new Date(e.date).toLocaleDateString()} ${e.description ? '• ' + e.description : ''}</p>
        <span class="category-badge">${e.category}</span>
      </div>
      <div style="display:flex; align-items:center;">
        <span class="expense-amount">Rs. ${e.amount.toLocaleString()}</span>
        <div class="expense-actions">
          <button class="btn-edit" onclick="editExpense('${e._id}')">✏️ Edit</button>
          <button class="btn-delete" onclick="deleteExpense('${e._id}')">🗑️ Delete</button>
        </div>
      </div>
    </div>
  `).join('');
}

function searchExpenses() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allExpenses.filter(e =>
    e.title.toLowerCase().includes(query) ||
    e.category.toLowerCase().includes(query) ||
    (e.description && e.description.toLowerCase().includes(query))
  );
  renderExpenses(filtered);
}

function filterExpenses() {
  const category = document.getElementById('filterCategory').value;
  const from = document.getElementById('filterFrom').value;
  const to = document.getElementById('filterTo').value;

  let filtered = allExpenses;

  if (category) filtered = filtered.filter(e => e.category === category);
  if (from) filtered = filtered.filter(e => new Date(e.date) >= new Date(from));
  if (to) filtered = filtered.filter(e => new Date(e.date) <= new Date(to));

  renderExpenses(filtered);
}

async function saveExpense() {
  const editId = document.getElementById('editId').value;
  const title = document.getElementById('title').value.trim();
  const amount = document.getElementById('amount').value;
  const category = document.getElementById('category').value;
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value.trim();
  const errorEl = document.getElementById('formError');

  if (!title || !amount || !category || !date) {
    errorEl.textContent = '❌ Please fill all required fields!';
    return;
  }
  if (amount < 0) {
    errorEl.textContent = '❌ Amount cannot be negative!';
    return;
  }

  errorEl.textContent = '';
  const body = { title, amount: Number(amount), category, date, description };

  if (editId) {
    await fetch(`${API}/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } else {
    await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  resetForm();
  loadExpenses();
  loadSummary();
}

async function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) return;
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadExpenses();
  loadSummary();
}

async function editExpense(id) {
  const res = await fetch(`${API}/${id}`);
  const e = await res.json();
  document.getElementById('editId').value = e._id;
  document.getElementById('title').value = e.title;
  document.getElementById('amount').value = e.amount;
  document.getElementById('category').value = e.category;
  document.getElementById('date').value = e.date.split('T')[0];
  document.getElementById('description').value = e.description;
  document.getElementById('formTitle').textContent = '✏️ Edit Expense';
  window.scrollTo(0, 0);
}

function resetForm() {
  document.getElementById('editId').value = '';
  document.getElementById('title').value = '';
  document.getElementById('amount').value = '';
  document.getElementById('category').value = '';
  document.getElementById('date').value = '';
  document.getElementById('description').value = '';
  document.getElementById('formTitle').textContent = 'Add New Expense';
  document.getElementById('formError').textContent = '';
}