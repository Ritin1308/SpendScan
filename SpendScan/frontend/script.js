
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
                resetFileUpload(); // Reset the file upload display
                await fetchAndStoreExpenses();
                applyFilter();
            } else {
                alert("❌ Upload failed. Please try again.");
            }
        });

        // File input change handler to show selected file
        document.getElementById("receipt").addEventListener("change", function(e) {
            const file = e.target.files[0];
            const uploadArea = document.getElementById("uploadArea");
            const uploadIcon = document.getElementById("uploadIcon");
            const uploadText = document.getElementById("uploadText");
            const fileInfo = document.getElementById("fileInfo");
            const fileName = document.getElementById("fileName");
            const fileSize = document.getElementById("fileSize");

            if (file) {
                // Show file info
                fileName.textContent = `📎 ${file.name}`;
                fileSize.textContent = `📊 ${(file.size / 1024 / 1024).toFixed(2)} MB`;
                
                // Update UI
                uploadArea.classList.add("has-file");
                uploadIcon.textContent = "✅";
                uploadText.textContent = "File selected successfully!";
                uploadText.style.color = "#48bb78";
                fileInfo.style.display = "block";
            } else {
                resetFileUpload();
            }
        });

        function resetFileUpload() {
            const uploadArea = document.getElementById("uploadArea");
            const uploadIcon = document.getElementById("uploadIcon");
            const uploadText = document.getElementById("uploadText");
            const fileInfo = document.getElementById("fileInfo");

            uploadArea.classList.remove("has-file");
            uploadIcon.textContent = "📄";
            uploadText.textContent = "Drop your receipt here or click to browse";
            uploadText.style.color = "#666";
            fileInfo.style.display = "none";
        }

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
            yearSelect.innerHTML = `<option value="">All Years</option>`;
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
                        backgroundColor: "rgba(102, 126, 234, 0.8)",
                        borderColor: "rgba(102, 126, 234, 1)",
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(0,0,0,0.1)'
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            }
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
  