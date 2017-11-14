export function createControlsState () {
  return {
    lineTool: {
      strokeWidth: 2,
      strokeColor: '#222222',
      strokeAlpha: 1,
      strokeWidthMod: 0,
      inputModTypeIndex: 1,
      styleIndex: 0
    },

    inputModTypes: [
      {
        index: 0,
        name: 'No'
      },
      {
        index: 1,
        name: 'Velocity'
      },
      {
        index: 2,
        name: 'Pen Pressure'
      }
    ],

    styles: [
      {
        index: 0,
        name: 'Solid',
        textureIndex: 0,
        alphaFuncIndex: 0,
        tintHex: '#ffffff',
        tintAlpha: 1,
        useScreenTintFunc: 0,
        thickness: 1,
        strokeWidthMod: 1
      },
      {
        index: 1,
        name: 'Radial Dash',
        textureIndex: 0,
        alphaFuncIndex: 1,
        tintHex: '#A3A3CC',
        tintAlpha: 1,
        useScreenTintFunc: 0,
        thickness: 1,
        strokeWidthMod: 1
      },
      {
        index: 2,
        name: 'Watercolor',
        textureIndex: 1,
        alphaFuncIndex: 0,
        tintHex: '#FFFFFF',
        tintAlpha: 1,
        useScreenTintFunc: 1,
        thickness: 1,
        strokeWidthMod: 1
      }
    ],

    textures: [
      {
        index: 0,
        name: 'Blank',
        path: null
      },
      {
        index: 1,
        name: 'Watercolor',
        path: 'watercolor'
      },
      {
        index: 2,
        name: 'Ground Mud',
        path: 'ground-mud'
      }
    ],

    // FEAT: Design alpha functions / params
    alphaFunctions: [
      {
        index: 0,
        name: 'Solid',
        hatchAlpha: 0
      },
      {
        index: 1,
        name: 'Radial Dash',
        hatchAlpha: 1
      }
    ],

    modifiers: {
      polarIterations: 3,
      curveSubDivisions: 6
    }
  }
}

// TODO: Maybe implement some palette state in observable store
const state = {}
const mutations = {}
const actions = {}

export default {
  state,
  mutations,
  actions
}
