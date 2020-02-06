const electron = require('electron');
const ipcMain = electron.ipcMain;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Notification = electron.Notification;

const { resolve } = require('path');

// const path = require('path');
// const url = require('url');

let mainWindow;

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 900, height: 680, webPreferences: {
        webSecurity: false,
        nodeIntegration: true,
        icon: resolve(__dirname, '..', 'assets', 'images', 'server.png')
    }});

    // and load the index.html of the app.
    mainWindow.loadURL('http://localhost:3000');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null
    })
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow()
    }
});

// ipcMain.on('notification', (event, arg) => {
//     newServerWindow.show();
//     newServerWindow.webContents.send('args', arg);
// })
ipcMain.on('notification', (event, arg) => {
    console.log("Notification -> ", arg)
    new Notification({
        title: "Server Status",
        body: arg,
        icon: resolve(__dirname, '..', 'assets', 'images', 'server.png')
    }).show();
})