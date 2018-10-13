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
            actions.createNewScene()
          }
        },
        {
          id: 'open-scene',
          label: 'Open...',
          accelerator: 'Cmd+O',
          click () {
            actions.openScene()
          }
        },
        {
          label: 'Save',
          accelerator: 'Cmd+S',
          click () {
            actions.saveScene(true)
          }
        },
        {
          label: 'Save As...',
          accelerator: 'Cmd+Shift+S',
          click () {
            actions.saveScene(false)
          }
        },
        {
          id: 'revert-scene',
          label: 'Revert',
          accelerator: 'Cmd+Shift+R',
          click () {
            actions.revertScene()
          }
        },
        {
          label: 'Export Image',
          accelerator: 'Cmd+Shift+E',
          click () {
            actions.saveFrameImage()
          }
        },
        {
          label: 'Export Scene',
          submenu: [
            {
              label: 'JSON',
              click () {
                actions.exportJSON()
              }
            },
            {
              label: 'HTML',
              click () {
                actions.exportHTML()
              }
            }
          ]
        }
        /*
        {type: 'separator'},
        {
          id: 'start-screen-recording',
          label: 'Start Screen Recording',
          enabled: true,
          click () {
            actions.startScreenRecording()
          }
        },
        {
          id: 'stop-screen-recording',
          label: 'Stop Screen Recording',
          enabled: false,
          click () {
            actions.stopScreenRecording()
          }
        }
        */
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          id: 'delete-last-vertex',
          label: 'Delete Last Vertex',
          accelerator: 'X',
          click () {
            actions.deleteLastVertex()
          }
        },
        {
          id: 'complete-segment',
          label: 'Complete Segment',
          accelerator: 'C',
          click () {
            actions.completeSegment()
          }
        },
        {
          id: 'delete-last-segment',
          label: 'Delete Last Segment',
          accelerator: 'Cmd+Backspace',
          click () {
            actions.deleteLastSegment()
          }
        }
        // {role: 'undo'},
        // {role: 'redo'},
        // {type: 'separator'}
      ]
    },
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
          id: 'simulation-toggle-pause',
          label: 'Pause Simulation',
          type: 'checkbox',
          checked: false,
          accelerator: 'Alt+Space',
          click () {
            actions.toggleSimulationPause()
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
        {
          id: 'status-on',
          label: 'Show Status',
          accelerator: 'Cmd+/',
          click () {
            actions.toggleStatus()
          }
        },
        {
          id: 'status-off',
          label: 'Hide Status',
          accelerator: 'Cmd+/',
          enabled: false,
          visible: false,
          click () {
            actions.toggleStatus()
          }
        },
        {type: 'separator'},
        {
          id: 'aspect-ratio',
          label: 'Aspect Ratio',
          submenu: [
            {
              label: 'None',
              type: 'radio',
              click () {
                actions.setAspectRatio(0)
              }
            },
            {
              label: '1:1',
              type: 'radio',
              click () {
                actions.setAspectRatio(1)
              }
            },
            {
              label: '4:5',
              type: 'radio',
              click () {
                actions.setAspectRatio(4 / 5)
              }
            },
            {
              label: '16:9',
              type: 'radio',
              click () {
                actions.setAspectRatio(16 / 9)
              }
            }
          ]
        },
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      label: 'Window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Report an Issue',
          click () {
            actions.reportIssue()
          }
        },
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
    template[4].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }

  return template
}
