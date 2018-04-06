import {
  readFile,
  writeFile
} from 'fs-extra'
import {
  basename,
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

export function exportSceneHTML (destPath, sceneData) {
  return getTemplate(TEMPLATE_SRC)
    .then((template) => {
      const subTitle = toTitleCase(
        basename(destPath, '.html').replace(/[-_]+/g, ' '))
      const rawSceneData = JSON.stringify(sceneData)
      const backgroundColor = '#222222'

      return template({
        API_VERSION,
        PEP_VERSION,
        subTitle,
        backgroundColor,
        rawSceneData
      })
    })
    .then((htmlOut) => writeFile(destPath, htmlOut))
    .catch((err) => {
      log.error(err)
    })
}
