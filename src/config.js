import { isObject } from './util'
// 全局错误信息提示
export const messages = {}

export function disposeMessages (obj) {
  if (!isObject(obj)) return
  let keys = Object.keys(obj)
  keys.forEach((key) => {
    messages[key] = obj[key]
  })
}
