

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const indexPath = path.join(__dirname, 'index-pro-final.html');
  mainWindow.loadFile(indexPath).catch(err => {
    const fallbackPath = path.join(__dirname, 'index.html');
    mainWindow.loadFile(fallbackPath);
  });


}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


ipcMain.handle('generate-fractal', async (event, fractalKey, numPoints) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'scripts', 'fractal_generator.py');

    const pythonProcess = spawn('python', [scriptPath, fractalKey.toString(), numPoints.toString()]);

    let fractalData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      fractalData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        if (!fractalData.trim()) {
          reject(new Error('Python produced no output'));
          return;
        }

        try {
          const parsedData = JSON.parse(fractalData);
          resolve(parsedData);
        } catch (parseError) {
          reject(new Error(`JSON parse failed: ${parseError.message}`));
        }
      } else {
        const errorMsg = errorData || `Python exited with code ${code}`;
        reject(new Error(errorMsg));
      }
    });

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python: ${err.message}`));
    });
  });
});
