const {app, BrowserWindow, ipcMain, session} = require('electron')
let defaultWindowOpts = require('electron-browser-window-options')
var Positioner = require('electron-positioner')

const url = require('url')
const path = require('path')

const { WebExtensionBlocker } = require('@cliqz/adblocker-webextension');

WebExtensionBlocker.fromPrebuiltAdsAndTracking().then((blocker) => {
  blocker.enableBlockingInBrowser();
});

let main_window_open_flag = false;

let float_button, main_win


function createWindow() {

   let electronScreen = require('electron').screen
   let display = electronScreen.getPrimaryDisplay();
   let display_width = display.bounds.width;
   let display_height = display.bounds.height;

   let float_button_ops = Object.assign({}, defaultWindowOpts, {
      skipTaskbar: true,
      transparent: true,
      width: 50, 
      height: 40,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
   })

   float_button = new BrowserWindow(float_button_ops)

   float_button.loadURL(url.format ({
      pathname: path.join(__dirname, 'floatter.html'),
      protocol: 'file:',
      slashes: true
   }))

   float_button.setPosition(display_width-float_button_ops.width-80,display_height-float_button_ops.height-10)


   // /float_button.webContents.openDevTools()

   let main_win_ops = Object.assign({}, defaultWindowOpts, {
      skipTaskbar: true,
      width: 600, 
      height: 800,
      webPreferences: {
         partition: 'persist:xxx',
         plugins: true,
         nodeIntegration: true
       }
   })

   main_win = new BrowserWindow(main_win_ops);
   main_win.loadURL('http://youtube.com')

   /*main_win.loadURL(url.format ({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
   }))*/

   //main_win.webContents.openDevTools()

   main_win.setMenuBarVisibility(false)

   main_win.setPosition(display_width-main_win_ops.width-100,display_height-main_win_ops.height)

   main_win.setTitle("Sticky YouTube ...")



   main_win.hide()

   main_win.on('close', (event) => {
     if (app.quitting) {
       main_win = null
     } else {
       event.preventDefault()
       main_window_open_flag = false;
       main_win.hide()
     }
   })

   session.defaultSession.loadExtension(path.join(__dirname, 'react-devtools'))
     
}


// Event handler for synchronous incoming messages
ipcMain.on('action', (event, arg) => {
   
   if(arg == "clicked"){

      if(main_window_open_flag){
         main_window_open_flag = false;
         main_win.hide()
      }
       else{
         main_window_open_flag = true;
         main_win.show()
       }
   }
   event.returnValue = 'sync reply'
})


app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//app.on('activate', () => { main_win.show() })
app.on('before-quit', () => app.quitting = true)