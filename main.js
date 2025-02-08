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
      contextIsolation: true, // Recommended for security
      nodeIntegration: false  // Recommended for security
    }
  });
  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  console.log("App is ready. Main window created.");

  // Listen for the 'start-crn' event to spawn the Python process.
  ipcMain.on('start-crn', (event, data) => {
    console.log('IPC: start-crn event received with data:', data);
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
      console.log('Python stdout:', data.toString());
      event.sender.send('crn-output', data.toString());
    });
    pythonProcess.stderr.on('data', (data) => {
      console.error('Python stderr:', data.toString());
      event.sender.send('crn-error', data.toString());
    });
    pythonProcess.on('close', (code) => {
      console.log('Python process closed with code:', code);
      event.sender.send('crn-close', code);
      app.quit();
    });
  });

  // Load config event handler.
  ipcMain.on('load-config', (event) => {
    console.log("IPC (main): load-config event received.");
    const filePath = path.join(__dirname, 'config.json');
    const defaultConfig = {
      login: {
        username: "username",
        password: "password"
      },
      crns: [0, 0, 0, 0, 0, 0, 0]
    };

    console.log("IPC (main): Looking for config.json at:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("IPC (main): config.json does not exist. Creating default config.");
      try {
        fs.writeFileSync(filePath, JSON.stringify(defaultConfig, null, 2), 'utf8');
        console.log("IPC (main): Default config created.");
      } catch (err) {
        console.error("IPC (main): Error writing default config:", err);
        event.sender.send('load-config-error', err.toString());
        return;
      }
    } else {
      console.log("IPC (main): config.json exists.");
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error("IPC (main): Error reading config file:", err);
        event.sender.send('load-config-error', err.toString());
      } else {
        console.log("IPC (main): Config loaded successfully:", data);
        event.sender.send('load-config-success', data);
      }
    });
  });

  // Save config event handler.
  ipcMain.on('save-config', (event, configData) => {
    console.log("IPC (main): save-config event received with data:", configData);
    const filePath = path.join(__dirname, 'config.json');
    // Write the new configuration to config.json asynchronously.
    fs.writeFile(filePath, JSON.stringify(configData, null, 2), 'utf8', (err) => {
      if (err) {
        console.error("IPC (main): Error saving config:", err);
        event.sender.send('save-config-error', err.toString());
      } else {
        console.log("IPC (main): Config saved successfully.");
        event.sender.send('save-config-success', "Configuration saved successfully.");
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
