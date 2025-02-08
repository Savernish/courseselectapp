const { contextBridge, ipcRenderer } = require('electron');

console.log("Preload: Loaded");

contextBridge.exposeInMainWorld('electronAPI', {
  startCRN: (data) => {
    console.log("Preload: Sending start-crn", data);
    ipcRenderer.send('start-crn', data);
  },
  onCRNOutput: (callback) => ipcRenderer.on('crn-output', (event, data) => callback(data)),
  onCRNError: (callback) => ipcRenderer.on('crn-error', (event, data) => callback(data)),
  onCRNClose: (callback) => ipcRenderer.on('crn-close', (event, code) => callback(code)),
  loadConfig: () => {
    console.log("Preload: Sending load-config");
    ipcRenderer.send('load-config');
  },
  onLoadConfigSuccess: (callback) => ipcRenderer.on('load-config-success', (event, data) => callback(data)),
  onLoadConfigError: (callback) => ipcRenderer.on('load-config-error', (event, data) => callback(data)),
  saveConfig: (configData) => {
    console.log("Preload: Sending save-config", configData);
    ipcRenderer.send('save-config', configData);
  },
  onSaveConfigSuccess: (callback) => ipcRenderer.on('save-config-success', (event, message) => callback(message)),
  onSaveConfigError: (callback) => ipcRenderer.on('save-config-error', (event, error) => callback(error))
});
