export function createMenuTemplate (app, actions) {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          id: 'create-scene',
          label: 'New Scene',
          accelerator: 'Cmd+N',
          enabled: false,
          click () {
            actions.createScene()
          }
        }
        // {
        //   label: 'Save Scene',
        //   accelerator: 'Cmd+S',
        //   click () {
        //     actions.saveScene()
        //   }
        // }
      ]
    },
    // {
    //   label: 'Edit',
    //   submenu: [
    //     // {role: 'undo'},
    //     // {role: 'redo'},
    //     // {type: 'separator'}
    //   ]
    // },
    {
      label: 'View',
      submenu: [
        {
          id: 'simulation-toggle',
          label: 'Run Simulation',
          type: 'checkbox',
          checked: false,
          accelerator: 'Space',
          click () {
            actions.toggleSimulation()
          }
        },
        {
          id: 'palette-on',
          label: 'Show Palette',
          accelerator: 'Cmd+1',
          enabled: false,
          visible: false,
          click () {
            actions.togglePalette()
          }
        },
        {
          id: 'palette-off',
          label: 'Hide Palette',
          accelerator: 'Cmd+1',
          click () {
            actions.togglePalette()
          }
        },
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Send Feedback',
          click () {
            actions.sendFeedback()
          }
        }
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    })

    // Window menu
    template[3].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }

  return template
}