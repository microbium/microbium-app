export function createControlsState () {
  return {
    activeMode: {
      id: 'draw'
    },

    activePalettes: {
      id: 'tool'
    },

    lineTool: {
      strokeWidth: 2,
      strokeColor: '#222222',
      strokeAlpha: 1,
      strokeWidthMod: 0,
      inputModTypeIndex: 1,
      constraintIndex: 1,
      styleIndex: 0
    },

    modeTypes: [
      {
        id: 'draw',
        name: 'Draw'
      },
      {
        id: 'select',
        name: 'Select'
      }
    ],

    paletteTypes: [
      {
        id: 'tool',
        name: 'Line Tool'
      },
      {
        id: 'geometry',
        name: 'Geometry Modifiers'
      },
      {
        id: 'styles',
        name: 'Style Layers'
      },
      {
        id: 'constraints',
        name: 'Constraint Types'
      },
      {
        id: 'forces',
        name: 'Simulation Forces'
      },
      {
        id: 'effects',
        name: 'Visual Effects'
      }
    ],

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
        name: 'Crawling',
        textureIndex: 0,
        alphaTextureIndex: 0,
        alphaFuncIndex: 3,
        tintHex: '#AAAAAA',
        tintAlpha: 1,
        useScreenTintFunc: 0,
        thickness: 1,
        strokeWidthMod: 1.2
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

    constraints: [
      {
        index: 0,
        name: 'Muscle',
        typeIndex: 2,
        slipTolerance: 0.1,
        engineCadence: 0.1,
        engineFlex: 0.25
      },
      {
        index: 1,
        name: 'Bone',
        typeIndex: 1,
        slipTolerance: 0.1,
        engineCadence: 0.1,
        engineFlex: 0
      },
      {
        index: 2,
        name: 'Anchor',
        typeIndex: 0,
        slipTolerance: 0,
        engineCadence: 0.1,
        engineFlex: 0
      }
    ],

    constraintTypes: [
      {
        index: 0,
        name: 'Pin'
      },
      {
        index: 1,
        name: 'Stick'
      },
      {
        index: 2,
        name: 'Engine'
      }
    ],

    modifiers: {
      polarIterations: 3,
      curve: {
        segMinLength: 12,
        segMaxLength: 12, // x10
        subDivisions: 6
      }
    },

    postEffects: {
      clear: {
        colorHex: '#7399A1',
        alphaFactor: 1
      },
      noise: {
        intensityFactor: 1
      },
      bloom: {
        intensityFactor: 1,
        blurPasses: 1,
        blurStep: 2
      },
      colorShift: [0, 0, 0]
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
