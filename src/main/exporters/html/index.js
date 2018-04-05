import {
  readFile,
  writeFile
} from 'fs-extra'
import {
  basename,
  join as pathJoin
} from 'path'
import compileTemplate from 'lodash.template'

const cachedTemplates = {}
function getTemplate (srcPath) {
  if (cachedTemplates[srcPath]) return cachedTemplates[srcPath]

  const srcFullPath = pathJoin(__dirname, srcPath)
  return (cachedTemplates[srcPath] = readFile(srcFullPath)
    .then((str) => compileTemplate(str)))
}

function toTitleCase (str) {
  return str.replace(/\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
}

// TODO: Improve scene data accessors (cn -> controls)
export function exportSceneHTML (destPath, sceneData) {
  return getTemplate('./template.ejs')
    .then((template) => {
      const subTitle = toTitleCase(
        basename(destPath, '.html').replace(/[-_]+/g, ' '))
      const rawSceneData = JSON.stringify(sceneData)
      const backgroundColor = sceneData.cn.postEffects.clear.colorHex
      console.log(backgroundColor)

      return template({
        subTitle,
        backgroundColor,
        rawSceneData
      })
    })
    .then((htmlOut) => writeFile(destPath, htmlOut))
}
