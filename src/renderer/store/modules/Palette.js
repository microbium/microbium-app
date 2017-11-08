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
        name: 'Watercolor',
        diffuseMap: 'watercolor',
        hatchAlpha: 0,
        tint: [1, 1, 1, 1],
        useScreenTintFunc: 1,
        thickness: 1
      },
      {
        index: 1,
        name: 'Radial Dash',
        diffuseMap: null,
        hatchAlpha: 1,
        tint: [0.2, 0.1, 0.3, 1],
        useScreenTintFunc: 0,
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
