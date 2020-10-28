import {
  mkdir,
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
import { template as compileTemplate } from 'lodash'

import { version } from '@root/package.json'

const TEMPLATE_SRC = 'exporter-templates/html.ejs'
const API_VERSION = version
const PEP_VERSION = '0.4.3'
const { HOME } = process.env

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

function resolveDataAssets (scenePath, destPath, sceneData) {
  const { controls } = sceneData
  const textureAssetFiles = []
  const exportedAssets = {}
  const assetsPath = pathJoin(dirname(destPath), '/assets')

  textureAssetFiles.push(controls.postEffects.lut.textureFile)
  controls.styles.forEach((style) => {
    textureAssetFiles.push(style.lineAlphaMapFile, style.fillAlphaMapFile)
  })

  const resolveAssets = () => textureAssetFiles.map((textureFile) => {
    if (!textureFile) return null

    const srcName = textureFile.name
    const srcPath = textureFile.path
      .replace('../../', `${HOME}/`) // FIXME ... Why?

    const exportPath = `${srcName}`
    const assetDestPath = pathJoin(assetsPath, exportPath)
    textureFile.path = exportPath

    if (exportedAssets[srcPath] != null) return
    exportedAssets[srcPath] = 1

    return copyFile(srcPath, assetDestPath)
  }).filter(Boolean)

  return mkdir(assetsPath, { recursive: true })
    .then(() => Promise.all(resolveAssets()))
    .then(() => sceneData)
}

export function exportSceneHTML (scenePath, destPath, sceneData) {
  return Promise.all([
    resolveDataAssets(scenePath, destPath, sceneData),
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
