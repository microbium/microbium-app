export function createControlsState () {
  return {
    activeMode: {
      id: 'draw'
    },

    activePalettes: {
      id: 'tool'
    },

    lineTool: {
      strokeWidth: 1.5,
      strokeColor: '#222222',
      strokeAlpha: 1,
      strokeWidthMod: 0,
      inputModTypeIndex: 1,
      constraintIndex: 1,
      styleIndex: 0
    },

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
        index: 0,
        name: 'Nudge',
        typeIndex: 0,
        positionTypeIndex: 1,
        intensityTypeIndex: 1,
        polarAngle: 0,
        polarOffset: 0,
        radius: 8,
        intensity: 0.1
      },
      {
        index: 1,
        name: 'Diffusor',
        typeIndex: 0,
        positionTypeIndex: 0,
        intensityTypeIndex: 2,
        polarAngle: 30,
        polarOffset: 14,
        radius: 20,
        intensity: 0.1
      },
      {
        index: 2,
        name: 'Rotator',
        typeIndex: 1,
        positionTypeIndex: 0,
        intensityTypeIndex: 2,
        polarAngle: 20,
        polarOffset: 17,
        radius: 22,
        intensity: 0.1
      }
    ],

    constraintGroups: [
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
        blurStep: 4,
        blurScale: 0.25
      },
      colorShift: [0, 0, 0]
    }
  }
}

export function createControlsStaticParams () {
  return {
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
        name: 'Constraint Groups'
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

    forceTypes: [
      {
        index: 0,
        name: 'Attractor / Repulsor'
      },
      {
        index: 1,
        name: 'Rotator'
      }
    ],

    forcePositionTypes: [
      {
        index: 0,
        name: 'Static'
      },
      {
        index: 1,
        name: 'Pointer'
      }
    ],

    forceIntensityTypes: [
      {
        index: 0,
        name: 'Static'
      },
      {
        index: 1,
        name: 'Pointer Velocity'
      },
      {
        index: 2,
        name: 'Ebb and Flow'
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
    ]
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
