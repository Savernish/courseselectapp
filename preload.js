const { contextBridge, ipcRenderer } = require('electron');

// Ana işlem ile renderer işlemi arasındaki köprüyü kur
console.log("Preload: Yuklendi");

contextBridge.exposeInMainWorld('electronAPI', {
    // CRN işlemleri
    startCRN: (data) => {
        console.log("Preload: CRN başlatma isteği gönderiliyor", data);
        ipcRenderer.send('start-crn', data);
    },
    // CRN çıktı dinleyicileri
    onCRNOutput: (callback) => ipcRenderer.on('crn-output', (event, data) => callback(data)),
    onCRNError: (callback) => ipcRenderer.on('crn-error', (event, data) => callback(data)),
    onCRNClose: (callback) => ipcRenderer.on('crn-close', (event, code) => callback(code)),

    // Ayar işlemleri
    loadConfig: () => {
        console.log("Preload: Ayar yükleme isteği gönderiliyor");
        ipcRenderer.send('load-config');
    },
    onLoadConfigSuccess: (callback) => ipcRenderer.on('load-config-success', (event, data) => callback(data)),
    onLoadConfigError: (callback) => ipcRenderer.on('load-config-error', (event, data) => callback(data)),
    saveConfig: (configData) => {
        console.log("Preload: save-config gonderiliyor", configData);
        ipcRenderer.send('save-config', configData);
    },
    onSaveConfigSuccess: (callback) => ipcRenderer.on('save-config-success', (event, message) => callback(message)),
    onSaveConfigError: (callback) => ipcRenderer.on('save-config-error', (event, error) => callback(error)),

    // External link işlemleri
    openExternalLink: (url) => {
        ipcRenderer.send('open-external-link', url);
    }
});
