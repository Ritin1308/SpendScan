let allExpenses = [];

document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);

  const res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    body: formData,
  });

  if (res.ok) {
    alert("✅ Receipt uploaded and analyzed!");
    e.target.reset();
    await fetchAndStoreExpenses();
    applyFilter();
  } else {
    alert("❌ Upload failed. Please try again.");
  }
});

document.getElementById("filterBtn").addEventListener("click", applyFilter);
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("yearSelect").value = "";
  document.getElementById("monthSelect").value = "";
  renderTable(allExpenses);
  renderChart(allExpenses);
});


async function fetchAndStoreExpenses() {
  const res = await fetch("http://localhost:5000/analyze");
  allExpenses = await res.json();

  // Populate year dropdown
  const yearSet = new Set(allExpenses.map(e => new Date(e.date).getFullYear()));
  const yearSelect = document.getElementById("yearSelect");
  yearSelect.innerHTML = `<option value="">All</option>`;
  [...yearSet].sort().forEach(year => {
    yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
  });
}

function applyFilter() {
  const selectedYear = document.getElementById("yearSelect").value;
  const selectedMonth = document.getElementById("monthSelect").value;

  let filtered = [...allExpenses];

  if (selectedYear) {
    filtered = filtered.filter(exp => new Date(exp.date).getFullYear().toString() === selectedYear);
  }

  if (selectedMonth) {
    filtered = filtered.filter(exp => {
      const month = String(new Date(exp.date).getMonth() + 1).padStart(2, "0");
      return month === selectedMonth;
    });
  }

  renderTable(filtered);
  renderChart(filtered);
}

function renderTable(expenses) {
  const tbody = document.querySelector("#expenseTable tbody");
  tbody.innerHTML = "";
  expenses.forEach(exp => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${exp.merchant}</td>
      <td>${new Date(exp.date).toLocaleDateString()}</td>
      <td>₹${exp.total.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  // ✅ Total spending calculation and display
  const total = expenses.reduce((sum, exp) => sum + exp.total, 0);
  document.getElementById("totalSpending").innerHTML =
    `<strong>Total Spending:</strong> ₹${total.toFixed(2)}`;
}

function renderChart(expenses) {
  const monthlyTotals = {};

  expenses.forEach(exp => {
    const date = new Date(exp.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    monthlyTotals[key] = (monthlyTotals[key] || 0) + exp.total;
  });

  const labels = Object.keys(monthlyTotals).sort();
  const values = labels.map(label => monthlyTotals[label]);

  const ctx = document.getElementById("expenseChart").getContext("2d");
  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Monthly Expense (₹)",
        data: values,
        backgroundColor: "#3b82f6",
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Load data initially
(async () => {
  await fetchAndStoreExpenses();
  applyFilter();
})();
