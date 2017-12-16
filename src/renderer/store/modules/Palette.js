export function createControlsState () {
  return {
    lineTool: {
      strokeWidth: 2,
      strokeColor: '#222222',
      strokeAlpha: 1,
      strokeWidthMod: 0,
      inputModTypeIndex: 1,
      physicsTypeIndex: 1,
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

    physicsTypes: [
      {
        index: 0,
        name: 'Static'
      },
      {
        index: 1,
        name: 'Dynamic'
      }
    ],

    styles: [
      {
        index: 0,
        name: 'Solid',
        textureIndex: 0,
        alphaTextureIndex: 0,
        alphaFuncIndex: 0,
        tintHex: '#FFFFFF',
        tintAlpha: 1,
        useScreenTintFunc: 0,
        thickness: 1,
        strokeWidthMod: 0.6
      },
      {
        index: 1,
        name: 'Dashed',
        textureIndex: 0,
        alphaTextureIndex: 0,
        alphaFuncIndex: 1,
        tintHex: '#EEEEEE',
        tintAlpha: 1,
        useScreenTintFunc: 0,
        thickness: 0.25,
        strokeWidthMod: 0.6
      },
      {
        index: 2,
        name: 'Hairy',
        textureIndex: 0,
        alphaTextureIndex: 1,
        alphaFuncIndex: 0,
        tintHex: '#AAAAAA',
        tintAlpha: 1,
        useScreenTintFunc: 0,
        thickness: 4,
        strokeWidthMod: 0.3
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

    alphaTextures: [
      {
        index: 0,
        name: 'Blank',
        path: null
      },
      {
        index: 1,
        name: 'Hairy',
        path: 'alpha-hairy'
      },
      {
        index: 2,
        name: 'Hatchy',
        path: 'alpha-hatchy'
      }
    ],

    // FEAT: Design alpha functions / params
    alphaFunctions: [
      {
        index: 0,
        name: 'Solid',
        dashFunction: 0
      },
      {
        index: 1,
        name: 'Radial Dash',
        dashFunction: 1
      },
      {
        index: 2,
        name: 'Concentric Dash',
        dashFunction: 2
      },
      {
        index: 3,
        name: 'Bulging Dash',
        dashFunction: 3
      }
    ],

    forces: [
      {
        id: 'nudge',
        name: 'Nudge',
        radius: 8,
        radiusScaleIndex: 0,
        intensity: 0.1
      },
      {
        id: 'diffusor',
        name: 'Diffusor',
        radius: 8,
        radiusScaleIndex: 1,
        intensity: 0.1
      },
      {
        id: 'rotator',
        name: 'Rotator',
        radius: 8,
        radiusScaleIndex: 1,
        intensity: 0.1
      }
    ],

    forceScales: [
      {
        index: 0,
        name: '10x',
        value: 10
      },
      {
        index: 1,
        name: '100x',
        value: 100
      },
      {
        index: 2,
        name: '1000x',
        value: 1000
      }
    ],

    modifiers: {
      polarIterations: 3,
      curveSubDivisions: 6
    },

    postEffects: {
      clearAlphaFactor: 1,
      bloomIntensityFactor: 1,
      noiseIntensityFactor: 1
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
