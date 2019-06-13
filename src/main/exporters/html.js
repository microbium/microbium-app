import {
  copyFile,
  readFile,
  writeFile
} from 'fs-extra'
import {
  basename,
  dirname,
  join as pathJoin
} from 'path'
import log from 'electron-log'
import compileTemplate from 'lodash.template'

import { version } from '@root/package.json'

const TEMPLATE_SRC = 'exporter-templates/html.ejs'
const API_VERSION = version
const PEP_VERSION = '0.4.3'

const cachedTemplates = {}
function getTemplate (srcPath) {
  if (cachedTemplates[srcPath]) return cachedTemplates[srcPath]

  const fullPath = pathJoin(global.__static, srcPath)
  return (cachedTemplates[srcPath] = readFile(fullPath)
    .then((str) => compileTemplate(str)))
}

function toTitleCase (str) {
  return str.replace(/\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

function resolveDataAssets (destPath, sceneData) {
  let { controls } = sceneData
  let textureAssetFiles = []
  let exportedAssets = {}

  textureAssetFiles.push(controls.postEffects.lut.textureFile)
  controls.styles.forEach((style) => {
    textureAssetFiles.push(style.lineAlphaMapFile, style.fillAlphaMapFile)
  })

  let assetResolutions = textureAssetFiles.map((textureFile) => {
    if (!textureFile) return null

    let srcName = textureFile.name
    let srcPath = textureFile.path

    let exportPath = `${srcName}`
    let assetDestPath = pathJoin(dirname(destPath), exportPath)
    textureFile.path = exportPath

    if (exportedAssets[srcPath] != null) return
    exportedAssets[srcPath] = 1

    return copyFile(srcPath, assetDestPath)
  }).filter(Boolean)

  return Promise.all(assetResolutions).then(() => {
    return sceneData
  })
}

export function exportSceneHTML (destPath, sceneData) {
  return Promise.all([
    resolveDataAssets(destPath, sceneData),
    getTemplate(TEMPLATE_SRC)
  ]).then(([resolvedSceneData, template]) => {
    const subTitle = toTitleCase(
      basename(destPath, '.html').replace(/[-_]+/g, ' '))
    const rawSceneData = JSON.stringify(resolvedSceneData)
    const backgroundColor = '#222222'

    return template({
      API_VERSION,
      PEP_VERSION,
      subTitle,
      backgroundColor,
      rawSceneData
    })
  }).then((htmlOut) => writeFile(destPath, htmlOut))
    .catch((err) => {
      log.error(err)
    })
}
