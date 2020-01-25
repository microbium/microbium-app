import {
  MODE_TYPES,
  PALETTE_TYPES,
  INPUT_MOD_TYPES,
  FORCE_TYPES,
  FORCE_POSITION_TYPES,
  FORCE_INTENSITY_TYPES,
  CONSTRAINT_TYPES
} from '@renderer/constants/types'

import { range } from '@renderer/utils/array'
import { pixelRatioClamped } from '@renderer/utils/screen'

export function createControlsState () {
  return {
    layoutMode: {
      id: 'narrow'
    },

    activeMode: {
      id: 'draw'
    },

    activePalettes: {
      id: 'tool'
    },

    lineTool: {
      depth: 1,
      strokeWidth: 1.5,
      strokeColor: '#ffffff',
      strokeAlpha: 1,
      fillColor: '#ffffff',
      fillAlpha: 1,
      strokeWidthMod: 0,
      inputModTypeIndex: 1,
      constraintIndex: 1,
      styleIndex: 0,
      strokeWidthController: -1,
      strokeAlphaController: -1,
      fillAlphaController: -1,
      depthController: -1
    },

    simulation: {
      isRunning: false,
      isPaused: false,
      iterations: 3,
      speed: 1,
      speedController: -1
    },

    styles: [
      {
        index: 0,
        name: 'Solid',
        lineAlphaFuncIndex: 0,
        lineAlphaMapFile: null,
        lineAlphaMapRepeat: 40,
        lineTintHex: '#111111',
        lineTintAlpha: 1,
        fillAlphaFuncIndex: 0,
        fillAlphaMapFile: null,
        fillAlphaMapRepeat: 40,
        fillTintHex: '#444444',
        fillTintAlpha: 1,
        thickness: 1,
        depth: 1,
        strokeWidthMod: 0.6,
        curveSegMinLength: 10,
        curveSegMaxLength: 8, // x10
        curveSubDivisions: 4,
        tintAlphaController: -1,
        thicknessController: -1,
        depthController: -1,
        strokeWidthModController: -1
      },
      {
        index: 1,
        name: 'Dashed',
        lineAlphaFuncIndex: 1,
        lineAlphaMapFile: null,
        lineAlphaMapRepeat: 40,
        lineTintHex: '#eeeeee',
        lineTintAlpha: 1,
        fillAlphaFuncIndex: 1,
        fillAlphaMapFile: null,
        fillAlphaMapRepeat: 40,
        fillTintHex: '#666666',
        fillTintAlpha: 1,
        thickness: 0.25,
        depth: 1,
        strokeWidthMod: 0.6,
        curveSegMinLength: 10,
        curveSegMaxLength: 8, // x10
        curveSubDivisions: 4,
        tintAlphaController: -1,
        thicknessController: -1,
        depthController: -1,
        strokeWidthModController: -1
      },
      {
        index: 2,
        name: 'Crawling',
        lineAlphaFuncIndex: 3,
        lineAlphaMapFile: null,
        lineAlphaMapRepeat: 40,
        lineTintHex: '#ffffff',
        lineTintAlpha: 1,
        fillAlphaFuncIndex: 0,
        fillAlphaMapFile: null,
        fillAlphaMapRepeat: 40,
        fillTintHex: '#222222',
        fillTintAlpha: 1,
        thickness: 1,
        depth: 1,
        strokeWidthMod: 1.2,
        curveSegMinLength: 10,
        curveSegMaxLength: 8, // x10
        curveSubDivisions: 4,
        tintAlphaController: -1,
        thicknessController: -1,
        depthController: -1,
        strokeWidthModController: -1
      }
    ],

    stylesUI: [
      {
        index: 0,
        name: 'Solid',
        lineAlphaFuncIndex: 0,
        lineAlphaMapFile: null,
        lineAlphaMapRepeat: 0,
        lineTintHex: '#ffffff',
        lineTintAlpha: 1,
        fillAlphaFuncIndex: 0,
        fillAlphaMapFile: null,
        fillAlphaMapRepeat: 0,
        fillTintHex: '#ffffff',
        fillTintAlpha: 1,
        thickness: 1,
        depth: 1,
        strokeWidthMod: 1,
        curveSegMinLength: 10,
        curveSegMaxLength: 8, // x10
        curveSubDivisions: 4
      }
    ],

    // FEAT: Design alpha functions / params
    alphaFunctions: {
      all: [
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
          name: 'Basic Dash',
          dashFunction: 3
        },
        {
          index: 4,
          name: 'Bulging Dash',
          dashFunction: 4
        },
        {
          index: 5,
          name: 'Wavy Dash',
          dashFunction: 5
        },
        {
          index: 6,
          name: 'Lateral Dash',
          dashFunction: 6
        }
      ],
      line: [0, 1, 2, 3, 4, 5, 6],
      fill: [0, 1, 2]
    },

    forces: [
      {
        index: 0,
        name: 'Nudge',
        typeIndex: 0,
        positionTypeIndex: 1,
        intensityTypeIndex: 2,
        polarAngle: 0,
        polarOffset: 0,
        radius: 8,
        intensity: 0.1,
        intensityController: -1,
        radiusController: -1,
        polarAngleController: -1,
        polarOffsetController: -1
      },
      {
        index: 1,
        name: 'Diffusor',
        typeIndex: 0,
        positionTypeIndex: 0,
        intensityTypeIndex: 1,
        polarAngle: 30,
        polarOffset: 14,
        radius: 25,
        intensity: 0.1,
        intensityController: -1,
        radiusController: -1,
        polarAngleController: -1,
        polarOffsetController: -1
      },
      {
        index: 2,
        name: 'Rotator',
        typeIndex: 1,
        positionTypeIndex: 0,
        intensityTypeIndex: 1,
        polarAngle: 90,
        polarOffset: 17,
        radius: 20,
        intensity: 0.1,
        intensityController: -1,
        radiusController: -1,
        polarAngleController: -1,
        polarOffsetController: -1
      }
    ],

    constraintGroups: [
      {
        index: 0,
        name: 'Muscle',
        typeIndex: 2,
        slipTolerance: 0.1,
        engineCadence: 120,
        engineCadenceDelay: 1,
        engineFlex: 0.25,
        slipToleranceController: -1,
        engineCadenceController: -1,
        engineCadenceDelayController: -1,
        engineFlexController: -1
      },
      {
        index: 1,
        name: 'Bone',
        typeIndex: 1,
        slipTolerance: 0.1,
        engineCadence: 120,
        engineCadenceDelay: 1,
        engineFlex: 0,
        slipToleranceController: -1,
        engineCadenceController: -1,
        engineCadenceDelayController: -1,
        engineFlexController: -1
      },
      {
        index: 2,
        name: 'Anchor',
        typeIndex: 0,
        slipTolerance: 0,
        engineCadence: 120,
        engineCadenceDelay: 1,
        engineFlex: 0,
        slipToleranceController: -1,
        engineCadenceController: -1,
        engineCadenceDelayController: -1,
        engineFlexController: -1
      }
    ],

    viewport: {
      pixelRatio: pixelRatioClamped(),
      background: {
        colorHex: '#91CCCC',
        alphaFactor: 1,
        alphaFactorController: -1
      },
      overlay: {
        colorHighlightHex: '#92D9E7',
        alphaFactor: 1,
        alphaFactorController: -1
      }
    },

    camera: {
      enabled: false,
      stereoEnabled: false,
      polarAngle: 0,
      polarOffset: 20,
      depthOffset: 20,
      tweenFactor: 0.05,
      stereoDistance: 10,
      polarOffsetController: -1,
      polarAngleController: -1,
      depthOffsetController: -1,
      tweenFactorController: -1,
      stereoDistanceController: -1
    },

    // TODO: Scale by pixelRatio in renderer
    // Will fix resolution discrepancy when sharing / exporting
    postEffects: {
      polar: {
        enabled: true,
        iterations: 3,
        mirrorIntensityFactor: 0.5,
        depthOffset: 0,
        iterationsController: -1,
        mirrorIntensityFactorController: -1,
        depthOffsetController: -1
      },
      mirror: {
        enabled: false,
        angle: 0,
        angleController: -1
      },
      bloom: {
        enabled: true,
        feedbackEnabled: true,
        intensityFactor: 1,
        // blendMode: MULTIPLY,
        blurPasses: 1,
        blurStep: 4,
        bufferScale: 1,
        feedbackOffset: 0,
        feedbackPolarAngle: 0,
        feedbackPolarOffset: 0,
        feedbackDisplaceFile: null,
        feedbackDisplaceOffset: 0,
        intensityFactorController: -1,
        feedbackOffsetController: -1,
        blurPassesController: -1,
        blurStepController: -1,
        feedbackPolarAngleController: -1,
        feedbackPolarOffsetController: -1,
        feedbackDisplaceOffsetController: -1
      },
      banding: {
        enabled: false,
        intensityFactor: 1,
        // blendMode: MIX,
        bandStep: 32,
        bufferScale: 1,
        intensityController: -1,
        bandStepController: -1
      },
      edges: {
        enabled: false,
        intensityFactor: 1,
        // blendMode: OVERLAY,
        thickness: 0.5,
        repeat: 32,
        bufferScale: 1,
        intensityFactorController: -1,
        thicknessController: -1
      },
      lut: {
        enabled: false,
        intensityFactor: 1,
        textureFile: null,
        intensityFactorController: -1
      },
      vignette: {
        enabled: true,
        intensityFactor: 1,
        radius: 0.7,
        smoothness: 0.4,
        intensityFactorController: -1,
        radiusController: -1,
        smoothnessController: -1
      },
      defocus: {
        enabled: true,
        intensityFactor: 1,
        radius: 0.7,
        smoothness: 0.4,
        intensityFactorController: -1,
        radiusController: -1,
        smoothnessController: -1
      },
      colorShift: {
        enabled: false,
        none: [0, 0, 0],
        hsl: {
          0: 0.15,
          1: 0,
          2: 0,
          '0Controller': -1,
          '1Controller': -1,
          '2Controller': -1
        }
      },
      noise: {
        enabled: true,
        intensityFactor: 1,
        intensityFactorController: -1
      },
      watermark: {
        enabled: false,
        textureFile: null,
        intensityFactor: 1,
        intensityFactorController: -1
      }
    }
  }
}

export function createControllersState () {
  return {
    midi: {
      enabled: false,
      activeInput: null,
      availableInputs: [],
      currentSignal: { cc: null, value: -1 },
      channelValues: range(64).reduce((map, i) => {
        map[i] = 0
        return map
      }, {})
    }
  }
}

// TODO: Refactor to pull in directly rather than pass as props
export function createControlsStaticParams () {
  return {
    modeTypes: MODE_TYPES,
    paletteTypes: PALETTE_TYPES,
    inputModTypes: INPUT_MOD_TYPES,
    forceTypes: FORCE_TYPES,
    forcePositionTypes: FORCE_POSITION_TYPES,
    forceIntensityTypes: FORCE_INTENSITY_TYPES,
    constraintTypes: CONSTRAINT_TYPES
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
