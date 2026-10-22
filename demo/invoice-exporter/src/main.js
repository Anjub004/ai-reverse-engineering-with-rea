'use strict';

const path = require('node:path');
const fs = require('node:fs/promises');
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { buildCsv, exportFileName } = require('./lib/exporter');
const invoices = require('./data/invoices.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 720,
    height: 480,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

ipcMain.handle('invoices:count', () => invoices.length);

ipcMain.handle('invoices:export', async () => {
  const folder = path.join(app.getPath('documents'), 'InvoiceExporter');
  await fs.mkdir(folder, { recursive: true });
  const filePath = path.join(folder, exportFileName());
  await fs.writeFile(filePath, buildCsv(invoices), 'utf8');
  shell.showItemInFolder(filePath);
  return filePath;
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
