export function createControlsState () {
  return {
    lineTool: {
      strokeWidth: 2,
      strokeColor: '#fafafa',
      strokeAlpha: 1,
      styleIndex: 0
    },

    styles: [
      {
        index: 0,
        name: 'Solid',
        textureIndex: 0,
        alphaFuncIndex: 0,
        tintHex: '#222222',
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
      polarIterations: 8,
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
