/* eslint-disable prefer-promise-reject-errors */
import {
  isRegExp,
  isString,
  isArray,
  isFunction,
  isEmpty,
  isNumber,
  series
} from './util'

import { rules } from './buildinRule'
import { messages } from './config'

/**
 * 验证规则：
 * 1：字段为空，使用默认值default代替
 * 2：是否是required字段
 * 3：使用type判断字段类型
 * 4: 使用check判断是否通过
 */
function validate (rule, ctx) {
  return new Promise((resolve, reject) => {
    let {
      msg = messages,
      required,
      type,
      check,
      doVerify,
      format
    } = rule

    let proxy = (err) => {
      if (isString(err)) {
        reject(msg[err] || messages[err] || '输入的值不合法')
      } else {
        reject(err.message)
      }
    }

    let { value } = ctx

    // 是否需要验证
    if (isFunction(doVerify)) {
      if (!doVerify.call(this, value, ctx)) {
        return resolve()
      }
    }

    // 对数据进行处理
    if (isFunction(format)) {
      value = format.call(this, value, ctx)
    }

    if (isEmpty(value)) {
      // 必填
      if (required) {
        return proxy('required')
      } else if (required === false) { // required=undefined 忽略，继续校验下面的规则
        // 声明式非必填，为空直接跳过
        return resolve()
      }
    }

    // 验证类型，默认是string
    let types = type
    if (types) {
      if (!isArray(types)) {
        types = [types]
      }
    } else {
      types = ['string']
    }

    let promises = types.map((type) => verify.bind(this, type, value, ctx, rule))

    series(promises).then(() => {
      if (isFunction(check)) {
        var boo = check.call(this, value, ctx)
        return isString(boo) ? reject(boo) : boo ? resolve() : proxy('check')
      }

      resolve()
    }).catch(proxy)
  })
}

function verify (type, value, ctx, rule) {
  let {
    minlength,
    maxlength,
    length,
    min,
    max,
    range,
    remote
  } = rule

  return new Promise((resolve, reject) => {
    if (isString(type)) {
      switch (type) {
        case 'string':
          value = String(value)
          if (isNumber(minlength) && value.length < minlength) {
            return reject('minlength')
          }

          if (isNumber(maxlength) && value.length > maxlength) {
            return reject('maxlength')
          }

          if (isArray(length) && (value.length < length[0] || value.length > length[1])) {
            return reject('length')
          }

          resolve()
          break
        case 'number':
          if (!isNumber(value)) {
            return reject('number')
          }
          if (isNumber(min) && value < min) {
            return reject('min')
          }
          if (isNumber(max) && value > max) {
            return reject('max')
          }
          if (isArray(range) && (value < range[0] || value > range[1])) {
            return reject('range')
          }

          resolve()
          break
        case 'remote':
          if (isFunction(remote)) {
            remote.call(this, value, ctx, function (boo) {
              isString(boo) ? reject(new Error(boo)) : boo ? resolve() : reject('remote')
            })
          }
          break
        case 'enum':
          if (isArray(rule.enum) && rule.enum.indexOf(value) === -1) {
            return reject('enum')
          }

          resolve()
          break
        default:
          if (type in rules) {
            var boo = rules[type].call(this, value, ctx)
            return isString(boo) ? reject(new Error(boo)) : boo ? resolve() : reject(type)
          }

          resolve()
          break
      }
    } else if (isRegExp(type)) {
      if (!type.test(value)) {
        return reject('regexp')
      }

      resolve()
    }
  })
}

export default validate
