const {app, Menu, BrowserWindow} = require('electron')

function sendSignal(command) {
  const win = BrowserWindow.getAllWindows()[0]
  win.webContents.send("shortcut", command)
}

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'Snippet',
    submenu: [
      {
        label: 'New snippet',
        accelerator: 'CmdOrCtrl+Shift+N',
        click () {
          sendSignal('snippet-new');
        }
      },
      {
        label: 'Save',
        accelerator: 'CmdOrCtrl+Shift+S',
        click () {
          sendSignal('snippet-save');
        }
      },
      {
        label: 'Delete',
        accelerator: 'CmdOrCtrl+Shift+D',
        click () {
          sendSignal('snippet-delete');
        }
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Zoom',
        role: 'zoom'
      },
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: `Learn more about snippetz`,
        click () {
          require('electron').shell.openExternal('https://github.com/inventcode/snippetz')
        }
      },
      {
        label: `Report Issue / Bug`,
        click () {
          require('electron').shell.openExternal('https://github.com/inventcode/snippetz/issues')
        }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        role: 'about',
        click () {
          dialog.showMessageBox({
            title: `About Snippetz`,
            message: `Snippets manager`,
            detail: 'Created by raghuram',
            icon: path.join(__dirname, 'static/icon.png'),
            buttons: []
          })
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
}
else {
  template.unshift({
    label: 'File',
    submenu: [
      {
        role: 'quit'
      }
    ]
  })
}

const menu = Menu.buildFromTemplate(template)
module.exports = {
  menu: menu
}
