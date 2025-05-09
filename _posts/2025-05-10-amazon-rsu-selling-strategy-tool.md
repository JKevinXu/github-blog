---
layout: post
title: "Amazon RSU Selling Strategy Tool"
date: 2025-05-10 09:00:00 -0500
categories: [finance, tools]
tags: [amazon, rsu, stock, investment, planning]
---

<div class="post-content">
  <h1>Amazon RSU Selling Strategy Tool</h1>
  
  <p>Managing the sale of Restricted Stock Units (RSUs) can be complex, especially when trying to maximize profits 
  while considering factors like market volatility, tax implications, and your personal financial goals. This tool 
  will help you develop a strategic selling plan for your Amazon RSUs.</p>

  <div class="tool-container">
    <h2>RSU Selling Strategy Calculator</h2>
    
    <form id="rsu-form">
      <div class="form-group">
        <label for="totalValue">Total RSU Value (RMB):</label>
        <input type="number" id="totalValue" value="2000000" step="10000">
      </div>
      
      <div class="form-group">
        <label for="currentPrice">Current Amazon Stock Price (USD):</label>
        <input type="number" id="currentPrice" placeholder="Enter current price" step="0.01">
      </div>
      
      <div class="form-group">
        <label for="vestingSchedule">Vesting Schedule:</label>
        <select id="vestingSchedule">
          <option value="quarterly">Quarterly</option>
          <option value="biannual">Bi-annual</option>
          <option value="annual">Annual</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <div class="form-group" id="customVestingDates" style="display:none;">
        <label for="vestingDates">Custom Vesting Dates (MM/DD/YYYY, comma separated):</label>
        <input type="text" id="vestingDates" placeholder="06/15/2025, 12/15/2025, 06/15/2026, 12/15/2026">
      </div>
      
      <div class="form-group">
        <label for="taxRate">Estimated Tax Rate (%):</label>
        <input type="number" id="taxRate" value="20" min="0" max="45">
      </div>
      
      <div class="form-group">
        <label for="strategy">Selling Strategy:</label>
        <select id="strategy">
          <option value="dca">Dollar Cost Averaging (Sell equal amounts regularly)</option>
          <option value="threshold">Price Threshold (Sell when price hits targets)</option>
          <option value="percentage">Percentage-based (Sell % of holdings regularly)</option>
          <option value="hybrid">Hybrid Strategy</option>
        </select>
      </div>
      
      <div class="strategy-options" id="dca-options">
        <div class="form-group">
          <label for="sellFrequency">Selling Frequency:</label>
          <select id="sellFrequency">
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="biannual">Bi-annual</option>
          </select>
        </div>
      </div>
      
      <div class="strategy-options" id="threshold-options" style="display:none;">
        <div class="form-group">
          <label for="priceTargets">Price Targets (USD, comma separated):</label>
          <input type="text" id="priceTargets" placeholder="180, 200, 220, 240">
        </div>
        <div class="form-group">
          <label for="percentAtTarget">Percent to Sell at Each Target:</label>
          <input type="text" id="percentAtTarget" placeholder="20, 25, 25, 30">
        </div>
      </div>
      
      <div class="strategy-options" id="percentage-options" style="display:none;">
        <div class="form-group">
          <label for="sellPercent">Percentage to Sell Each Time (%):</label>
          <input type="number" id="sellPercent" value="10" min="1" max="100">
        </div>
        <div class="form-group">
          <label for="sellInterval">Selling Interval (months):</label>
          <input type="number" id="sellInterval" value="3" min="1" max="12">
        </div>
      </div>
      
      <div class="strategy-options" id="hybrid-options" style="display:none;">
        <div class="form-group">
          <label for="basePercent">Base Percentage to Sell Regularly (%):</label>
          <input type="number" id="basePercent" value="5" min="1" max="50">
        </div>
        <div class="form-group">
          <label for="opportunisticTargets">Opportunistic Price Targets (USD, comma separated):</label>
          <input type="text" id="opportunisticTargets" placeholder="200, 225, 250">
        </div>
        <div class="form-group">
          <label for="opportunisticPercents">Additional % to Sell at Targets:</label>
          <input type="text" id="opportunisticPercents" placeholder="10, 15, 20">
        </div>
      </div>
      
      <div class="form-group">
        <label for="exchangeRate">USD to RMB Exchange Rate:</label>
        <input type="number" id="exchangeRate" value="7.1" step="0.01">
      </div>
      
      <button type="button" id="generatePlan">Generate Selling Plan</button>
    </form>
    
    <div id="results" style="display:none;">
      <h3>Your Customized RSU Selling Plan</h3>
      <div id="summary"></div>
      <div id="planTable"></div>
      <div id="chartContainer">
        <canvas id="planChart"></canvas>
      </div>
      <button type="button" id="downloadPlan">Download Plan as PDF</button>
    </div>
  </div>
</div>

<style>
.tool-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 30px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

button {
  background-color: #ff9900;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-top: 10px;
}

button:hover {
  background-color: #e68a00;
}

#results {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

#planTable {
  margin: 20px 0;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 8px 12px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

#chartContainer {
  margin-top: 30px;
  height: 400px;
}

@media (max-width: 768px) {
  input, select {
    font-size: 16px; /* Prevents zoom on mobile */
  }
}
</style>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // Show/hide custom vesting dates based on selection
  document.getElementById('vestingSchedule').addEventListener('change', function() {
    document.getElementById('customVestingDates').style.display = 
      this.value === 'custom' ? 'block' : 'none';
  });
  
  // Show/hide strategy options based on selection
  document.getElementById('strategy').addEventListener('change', function() {
    const strategyOptions = document.querySelectorAll('.strategy-options');
    strategyOptions.forEach(opt => opt.style.display = 'none');
    
    const selectedStrategy = this.value;
    document.getElementById(`${selectedStrategy}-options`).style.display = 'block';
  });

  // Fetch current Amazon stock price
  fetchAmazonStockPrice();
  
  // Generate plan button click handler
  document.getElementById('generatePlan').addEventListener('click', generateSellingPlan);
  
  // Download plan button click handler
  document.getElementById('downloadPlan').addEventListener('click', downloadPlanAsPDF);
});

function fetchAmazonStockPrice() {
  // This is a placeholder. In a real implementation, you would use an API to get live stock prices
  // For this demo, we'll simulate a fetch operation
  setTimeout(() => {
    document.getElementById('currentPrice').value = '185.07';
  }, 500);
}

function generateSellingPlan() {
  // Get form values
  const totalValue = parseFloat(document.getElementById('totalValue').value);
  const currentPrice = parseFloat(document.getElementById('currentPrice').value);
  const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);
  const taxRate = parseFloat(document.getElementById('taxRate').value) / 100;
  const strategy = document.getElementById('strategy').value;
  
  // Calculate total shares (RMB value / (USD price * exchange rate))
  const totalShares = Math.round(totalValue / (currentPrice * exchangeRate));
  
  // Create selling schedule based on selected strategy
  let sellingSchedule = [];
  const twoYearsFromNow = new Date();
  twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
  
  switch(strategy) {
    case 'dca':
      sellingSchedule = generateDCASchedule(totalShares, twoYearsFromNow);
      break;
    case 'threshold':
      sellingSchedule = generateThresholdSchedule(totalShares);
      break;
    case 'percentage':
      sellingSchedule = generatePercentageSchedule(totalShares, twoYearsFromNow);
      break;
    case 'hybrid':
      sellingSchedule = generateHybridSchedule(totalShares, twoYearsFromNow);
      break;
  }
  
  // Display results
  displayResults(sellingSchedule, totalShares, currentPrice, exchangeRate, taxRate);
}

function generateDCASchedule(totalShares, endDate) {
  const frequency = document.getElementById('sellFrequency').value;
  let intervalMonths;
  
  switch(frequency) {
    case 'monthly': intervalMonths = 1; break;
    case 'quarterly': intervalMonths = 3; break;
    case 'biannual': intervalMonths = 6; break;
    default: intervalMonths = 3;
  }
  
  const totalIntervals = 24 / intervalMonths; // 2 years
  const sharesPerInterval = Math.floor(totalShares / totalIntervals);
  
  let schedule = [];
  let currentDate = new Date();
  let remainingShares = totalShares;
  
  for (let i = 0; i < totalIntervals; i++) {
    if (i === totalIntervals - 1) {
      // Last interval, sell all remaining shares
      schedule.push({
        date: formatDate(currentDate),
        shares: remainingShares,
        priceTarget: null
      });
    } else {
      schedule.push({
        date: formatDate(currentDate),
        shares: sharesPerInterval,
        priceTarget: null
      });
      remainingShares -= sharesPerInterval;
    }
    
    // Advance to next date
    currentDate.setMonth(currentDate.getMonth() + intervalMonths);
  }
  
  return schedule;
}

function generateThresholdSchedule(totalShares) {
  const priceTargets = document.getElementById('priceTargets').value.split(',').map(num => parseFloat(num.trim()));
  const percentages = document.getElementById('percentAtTarget').value.split(',').map(num => parseFloat(num.trim()) / 100);
  
  // Validate that percentages sum to 100%
  const totalPercentage = percentages.reduce((sum, percent) => sum + percent, 0);
  if (Math.abs(totalPercentage - 1) > 0.01) {
    alert("Percentages should sum to approximately 100%");
    return [];
  }
  
  let schedule = [];
  let remainingShares = totalShares;
  
  for (let i = 0; i < priceTargets.length; i++) {
    const sharesToSell = i === priceTargets.length - 1 
      ? remainingShares 
      : Math.round(totalShares * percentages[i]);
    
    schedule.push({
      date: null, // Based on when price target is hit
      shares: sharesToSell,
      priceTarget: priceTargets[i]
    });
    
    remainingShares -= sharesToSell;
  }
  
  return schedule;
}

function generatePercentageSchedule(totalShares, endDate) {
  const sellPercent = parseFloat(document.getElementById('sellPercent').value) / 100;
  const intervalMonths = parseInt(document.getElementById('sellInterval').value);
  
  const totalIntervals = 24 / intervalMonths; // 2 years
  let schedule = [];
  let currentDate = new Date();
  let remainingShares = totalShares;
  
  for (let i = 0; i < totalIntervals; i++) {
    const isLastInterval = i === totalIntervals - 1;
    let sharesToSell;
    
    if (isLastInterval) {
      sharesToSell = remainingShares;
    } else {
      sharesToSell = Math.round(remainingShares * sellPercent);
      remainingShares -= sharesToSell;
    }
    
    schedule.push({
      date: formatDate(currentDate),
      shares: sharesToSell,
      priceTarget: null
    });
    
    // Advance to next date
    currentDate.setMonth(currentDate.getMonth() + intervalMonths);
  }
  
  return schedule;
}

function generateHybridSchedule(totalShares, endDate) {
  const basePercent = parseFloat(document.getElementById('basePercent').value) / 100;
  const priceTargets = document.getElementById('opportunisticTargets').value.split(',').map(num => parseFloat(num.trim()));
  const additionalPercents = document.getElementById('opportunisticPercents').value.split(',').map(num => parseFloat(num.trim()) / 100);
  
  // Regular selling schedule (quarterly)
  const intervalMonths = 3;
  const totalIntervals = 24 / intervalMonths; // 2 years
  
  let schedule = [];
  let currentDate = new Date();
  let remainingShares = totalShares;
  
  // Regular scheduled sales
  for (let i = 0; i < totalIntervals; i++) {
    const sharesToSell = Math.round(totalShares * basePercent);
    
    schedule.push({
      date: formatDate(currentDate),
      shares: Math.min(sharesToSell, remainingShares),
      priceTarget: null,
      type: 'scheduled'
    });
    
    remainingShares -= sharesToSell;
    if (remainingShares <= 0) break;
    
    // Advance to next date
    currentDate.setMonth(currentDate.getMonth() + intervalMonths);
  }
  
  // Opportunistic sales based on price targets
  for (let i = 0; i < priceTargets.length; i++) {
    const sharesToSell = Math.round(totalShares * additionalPercents[i]);
    
    schedule.push({
      date: null, // Based on when price target is hit
      shares: Math.min(sharesToSell, remainingShares),
      priceTarget: priceTargets[i],
      type: 'opportunistic'
    });
    
    remainingShares -= sharesToSell;
    if (remainingShares <= 0) break;
  }
  
  // If there are still remaining shares, add a final sale at the end
  if (remainingShares > 0) {
    const finalDate = new Date();
    finalDate.setMonth(finalDate.getMonth() + 24); // 2 years from now
    
    schedule.push({
      date: formatDate(finalDate),
      shares: remainingShares,
      priceTarget: null,
      type: 'final'
    });
  }
  
  return schedule;
}

function displayResults(schedule, totalShares, currentPrice, exchangeRate, taxRate) {
  const resultsDiv = document.getElementById('results');
  const summaryDiv = document.getElementById('summary');
  const planTableDiv = document.getElementById('planTable');
  
  // Calculate summary stats
  const totalValue = totalShares * currentPrice;
  const totalValueRMB = totalValue * exchangeRate;
  const estimatedTaxes = totalValue * taxRate;
  const netValue = totalValue - estimatedTaxes;
  
  // Create summary text
  summaryDiv.innerHTML = `
    <p><strong>Total Shares:</strong> ${totalShares}</p>
    <p><strong>Current Value:</strong> $${totalValue.toLocaleString()} USD (¥${totalValueRMB.toLocaleString()} RMB)</p>
    <p><strong>Estimated Taxes:</strong> $${estimatedTaxes.toLocaleString()} USD</p>
    <p><strong>Net Value After Taxes:</strong> $${netValue.toLocaleString()} USD</p>
  `;
  
  // Create selling plan table
  let tableHTML = `
    <table>
      <thead>
        <tr>
          <th>Sell Date</th>
          <th>Shares to Sell</th>
          <th>Price Target</th>
          <th>Est. Value (USD)</th>
          <th>Est. Value (RMB)</th>
          <th>Est. Taxes</th>
          <th>Net Proceeds</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  let runningTotal = 0;
  let labelData = [];
  let valueData = [];
  
  schedule.forEach(entry => {
    const entryValue = entry.shares * (entry.priceTarget || currentPrice);
    const entryValueRMB = entryValue * exchangeRate;
    const entryTaxes = entryValue * taxRate;
    const entryNet = entryValue - entryTaxes;
    
    runningTotal += entryNet;
    
    tableHTML += `
      <tr>
        <td>${entry.date || 'When price hits target'}</td>
        <td>${entry.shares.toLocaleString()}</td>
        <td>${entry.priceTarget ? '$' + entry.priceTarget : 'Market price'}</td>
        <td>$${entryValue.toLocaleString()}</td>
        <td>¥${entryValueRMB.toLocaleString()}</td>
        <td>$${entryTaxes.toLocaleString()}</td>
        <td>$${entryNet.toLocaleString()}</td>
      </tr>
    `;
    
    if (entry.date) {
      labelData.push(entry.date);
    } else {
      labelData.push(`$${entry.priceTarget} target`);
    }
    valueData.push(runningTotal);
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  planTableDiv.innerHTML = tableHTML;
  
  // Create chart
  const ctx = document.getElementById('planChart').getContext('2d');
  if (window.planChart) {
    window.planChart.destroy();
  }
  window.planChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labelData,
      datasets: [{
        label: 'Cumulative Net Proceeds (USD)',
        data: valueData,
        backgroundColor: 'rgba(255, 153, 0, 0.2)',
        borderColor: 'rgba(255, 153, 0, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(255, 153, 0, 1)',
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'USD'
          }
        }
      }
    }
  });
  
  resultsDiv.style.display = 'block';
}

function downloadPlanAsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(18);
  doc.text('Amazon RSU Selling Strategy Plan', 14, 20);
  
  // Add summary
  doc.setFontSize(12);
  doc.text('Plan Summary:', 14, 30);
  
  const summaryText = document.getElementById('summary').innerText;
  const summaryLines = doc.splitTextToSize(summaryText, 180);
  doc.text(summaryLines, 14, 35);
  
  // Add table
  doc.autoTable({
    html: 'table',
    startY: 65,
    theme: 'grid',
    headStyles: { fillColor: [255, 153, 0] },
    margin: { top: 10 },
  });
  
  // Add chart
  const canvas = document.getElementById('planChart');
  const chartImage = canvas.toDataURL('image/png', 1.0);
  const chartPageHeight = doc.internal.pageSize.height;
  
  // Add chart on a new page
  doc.addPage();
  doc.text('Selling Plan Visualization', 14, 20);
  doc.addImage(chartImage, 'PNG', 10, 30, 190, 100);
  
  // Add disclaimer
  doc.text('Disclaimer:', 14, 150);
  const disclaimer = 'This plan is for informational purposes only and does not constitute financial advice. ' +
                     'Stock prices fluctuate and actual results may vary significantly. ' +
                     'Consult with a financial advisor before making investment decisions.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, 180);
  doc.text(disclaimerLines, 14, 160);
  
  // Save PDF
  doc.save('Amazon_RSU_Selling_Plan.pdf');
}

// Helper function to format dates
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}
</script> 