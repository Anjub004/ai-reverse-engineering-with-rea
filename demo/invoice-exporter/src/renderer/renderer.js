'use strict';

const summary = document.getElementById('summary');
const result = document.getElementById('result');
const button = document.getElementById('export');

window.invoiceApi.count().then((n) => {
  summary.textContent = `${n} invoices loaded`;
});

button.addEventListener('click', async () => {
  button.disabled = true;
  try {
    const filePath = await window.invoiceApi.exportCsv();
    result.textContent = `Saved to ${filePath}`;
  } catch (error) {
    result.textContent = `Export failed: ${error.message}`;
  } finally {
    button.disabled = false;
  }
});
