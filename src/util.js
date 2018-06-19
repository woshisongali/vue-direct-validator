/* eslint-disable no-inner-declarations */
const toString = (obj) => Object.prototype.toString.call(obj)

export function isRegExp (obj) {
  return toString(obj) === '[object RegExp]'
}

export function isString (obj) {
  return toString(obj) === '[object String]'
}

export function isArray (obj) {
  return toString(obj) === '[object Array]'
}

export function isFunction (obj) {
  return toString(obj) === '[object Function]'
}

export function isNumber (obj) {
  return toString(obj) === '[object Number]'
}

export function isObject (obj) {
  return obj != null && typeof obj === 'object'
}

export function isEmpty (obj) {
  if (obj == null) return true
  if (typeof obj.length === 'number') return obj.length === 0
  return false
}
const function trim(str) {
  let result = str.replace(/(^\s+)|(\s+$)/g, '')
}
export function addClass (ele, name) {
  let classStr = ele.getAttribute('class')
  if (classStr.indexOf(name) > -1) {
    return
  }
  classStr += (classStr !== '') ? (' ' + name): name
  ele.setAttribute('class', classStr)
}
export function removeClass (ele, name) {
  let classStr = ele.getAttribute('class')
  if (classStr.indexOf(name) === -1) {
    return
  }
  classStr = ' ' + classStr + ' '
  classStr = classStr.replace(name, '')
  classStr = trim(classStr)
  ele.setAttribute('class', classStr)
}

/**
 * promise 顺序懒执行
 * @param tasks 函数列表，返回Promise
 * @returns {Promise}
 */
export function series (tasks) {
  return new Promise((resolve, reject) => {
    if (Array.isArray(tasks)) {
      var result = []
      var i = 0
      var length = tasks.length
      if (length === 0) {
        return resolve(result)
      }

      run()

      function run () {
        var task = tasks[i]
        Promise.resolve(task()).then((res) => {
          result[i] = res
          i++
          if (i < length) {
            run()
          } else {
            resolve(result)
          }
        }).catch(reject)
      }
    } else {
      reject(new Error('Series Methods must be provided an Array'))
    }
  })
}
