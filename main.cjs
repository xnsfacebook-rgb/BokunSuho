const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

let mainWindow = null;
let serverProcess = null;
const SERVER_PORT = 3000;

function startBackendServer() {
  return new Promise((resolve) => {
    // Check if server is already running
    const http = require('http');
    const req = http.get(`http://localhost:${SERVER_PORT}/api/status`, (res) => {
      console.log('BokunSuho backend is already running on port', SERVER_PORT);
      resolve(true);
    });

    req.on('error', () => {
      console.log('Spawning BokunSuho backend server process...');
      const serverPath = path.join(__dirname, 'server.js');
      const nodeBin = 'node';
      serverProcess = spawn(nodeBin, [serverPath], {
        env: { ...process.env, PORT: SERVER_PORT.toString() },
        stdio: 'inherit'
      });
      setTimeout(() => resolve(true), 1500);
    });
  });
}

async function createWindow() {
  await startBackendServer();

  // Standard 9:16 Vertical Aspect Ratio Window (Vertical Live Streaming)
  mainWindow = new BrowserWindow({
    width: 540,
    height: 960,
    minWidth: 405,
    minHeight: 720,
    aspectRatio: 9 / 16,
    backgroundColor: '#0d0a08',
    title: '복운수호 온라인 사찰 — 향 공양 (9:16 Vertical)',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 12, y: 10 },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Load local server URL
  mainWindow.loadURL(`http://localhost:${SERVER_PORT}/stage.html`); // 2D LIVE 스테이지 (홈페이지는 3D 사찰)

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
