// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let pythonProcess = null;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, 
      nodeIntegration: false  
    }
  });
  win.loadFile('index.html');
}


app.whenReady().then(() => {
  createWindow();

  console.log("Uygulama hazir. Ana pencere olusturuldu.");

  ipcMain.on('start-crn', (event, data) => {
    console.log('IPC: start-crn olayi alindi, veri:', data);
    const { username, password, crns } = data;
    pythonProcess = spawn('python', [
      path.join(__dirname, 'selectcourse.py'),
      username,
      password,
      ...crns
    ], {
      env: { ...process.env, PYTHONUNBUFFERED: '1' }
    });

    pythonProcess.stdout.on('data', (data) => {
      console.log('Python ciktisi:', data.toString());
      event.sender.send('crn-output', data.toString());
    });
    pythonProcess.stderr.on('data', (data) => {
      console.error('Python hatasi:', data.toString());
      event.sender.send('crn-error', data.toString());
    });
    pythonProcess.on('close', (code) => {
      console.log('Python islemi sonlandi, kod:', code);
      event.sender.send('crn-close', code);
      app.quit();
    });
  });

  ipcMain.on('load-config', (event) => {
    console.log("IPC: load-config olayi alindi.");
    const filePath = path.join(__dirname, 'config.json');
    const defaultConfig = {
      login: {
        username: "username",
        password: "password"
      },
      crns: [0, 0, 0, 0, 0, 0, 0]
    };

    console.log("IPC: config.json araniyor:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("IPC: config.json bulunamadi. Varsayilan config olusturuluyor.");
      try {
        fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2), 'utf8');
        console.log("IPC: Varsayilan config olusturuldu.");
      } catch (err) {
        console.error("IPC: Varsayilan config olustururken hata:", err);
        event.sender.send('load-config-error', err.toString());
        return;
      }
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error("IPC: Config dosyasi okuma hatasi:", err);
        event.sender.send('load-config-error', err.toString());
      } else {
        console.log("IPC: Config basariyla yuklendi:", data);
        event.sender.send('load-config-success', data);
      }
    });
  });

  ipcMain.on('save-config', (event, configData) => {
    console.log("IPC: save-config olayi alindi, veri:", configData);
    const filePath = path.join(__dirname, 'config.json');
    fs.writeFile(filePath, JSON.stringify(configData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error("IPC: Config kaydetme hatasi:", err);
        event.sender.send('save-config-error', err.toString());
      } else {
        console.log("IPC: Config basariyla kaydedildi.");
        event.sender.send('save-config-success', "Yapilandirma basariyla kaydedildi.");
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
