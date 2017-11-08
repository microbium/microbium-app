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
        textureIndex: -1,
        hatchAlpha: 0,
        tintHex: '#222222',
        useScreenTintFunc: 0,
        thickness: 1
      },
      {
        index: 1,
        name: 'Radial Dash',
        textureIndex: -1,
        hatchAlpha: 1,
        tintHex: '#A3A3CC',
        useScreenTintFunc: 0,
        thickness: 1
      },
      {
        index: 2,
        name: 'Watercolor',
        textureIndex: 0,
        hatchAlpha: 0,
        tintHex: '#FFFFFF',
        useScreenTintFunc: 1,
        thickness: 1
      }
    ],

    textures: [
      {
        name: 'Watercolor',
        path: 'watercolor'
      },
      {
        name: 'Ground Mud',
        path: 'ground-mud'
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
