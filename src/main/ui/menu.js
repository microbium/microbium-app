import { PALETTE_TYPES } from '@renderer/constants/types'

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
          id: 'prev-style-layer',
          label: 'Previous Style Layer',
          accelerator: 'Cmd+[',
          click () {
            actions.selectNextStyleLayer(-1)
          }
        },
        {
          id: 'next-style-layer',
          label: 'Next Style Layer',
          accelerator: 'Cmd+]',
          click () {
            actions.selectNextStyleLayer(1)
          }
        },
        {type: 'separator'},
        {
          id: 'prev-constraint-group',
          label: 'Previous Constraint Group',
          accelerator: 'Cmd+{',
          click () {
            actions.selectNextConstraintGroup(-1)
          }
        },
        {
          id: 'next-constraint-group',
          label: 'Next Constraint Group',
          accelerator: 'Cmd+}',
          click () {
            actions.selectNextConstraintGroup(1)
          }
        },
        {type: 'separator'},
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
        },
        {type: 'separator'}
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
        {type: 'separator'},
        {
          id: 'toolbar-on',
          label: 'Show Toolbar',
          enabled: false,
          visible: false,
          click () {
            actions.toggleMainToolbar()
          }
        },
        {
          id: 'toolbar-off',
          label: 'Hide Toolbar',
          click () {
            actions.toggleMainToolbar()
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
        {
          id: 'palette-on',
          label: 'Show Palette',
          accelerator: 'Cmd+.',
          enabled: false,
          visible: false,
          click () {
            actions.togglePalette()
          }
        },
        {
          id: 'palette-off',
          label: 'Hide Palette',
          accelerator: 'Cmd+.',
          click () {
            actions.togglePalette()
          }
        },
        {
          id: 'active-palette',
          label: 'Active Palette',
          submenu: PALETTE_TYPES.map(({ id, name }, index) => ({
            id: `palette-${id}`,
            label: name,
            type: 'radio',
            accelerator: `Cmd+${index + 1}`,
            click () {
              actions.setActivePalette(id)
            }
          }))
        },
        {type: 'separator'},
        {
          id: 'aspect-ratio',
          label: 'Aspect Ratio',
          submenu: [
            {
              id: 'aspect-ratio-0',
              label: 'None',
              type: 'radio',
              click () {
                actions.setAspectRatio('0')
              }
            },
            {
              id: 'aspect-ratio-1:1',
              label: '1:1',
              type: 'radio',
              click () {
                actions.setAspectRatio('1:1')
              }
            },
            {
              id: 'aspect-ratio-4:5',
              label: '4:5',
              type: 'radio',
              click () {
                actions.setAspectRatio('4:5')
              }
            },
            {
              id: 'aspect-ratio-16:9',
              label: '16:9',
              type: 'radio',
              click () {
                actions.setAspectRatio('16:9')
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
