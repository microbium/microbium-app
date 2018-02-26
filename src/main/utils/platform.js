import { release } from 'os'

export function isOSX () {
  return process.platform === 'darwin'
}

export function isHighSierra () {
  return process.platform === 'darwin' &&
    Number(release().split('.')[0]) >= 17
}
