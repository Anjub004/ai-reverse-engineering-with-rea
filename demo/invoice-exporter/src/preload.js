'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('invoiceApi', {
  count: () => ipcRenderer.invoke('invoices:count'),
  exportCsv: () => ipcRenderer.invoke('invoices:export'),
});
