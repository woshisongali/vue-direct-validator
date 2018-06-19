import validate from './validate'
import { addValidation } from './buildinRule'
import { 
  isObject,
  addClass,
  removeClass 
} from './util'
import { disposeMessages } from './config'

const validator = {}

validator.install = function (Vue, options = {}) {
  if (options.autoHint) {
    // 引入错误提示的css
    require('./style.css')
  }

  let { field = 'errors' } = options

  disposeMessages(options.messages)

  let uid = 0

  // 错误缓存对象
  const cache = {}

  Vue.errorCache = cache

  // 给vue实例添加errors属性
  Vue.mixin({
    data () {
      return {
        [field]: {}
      }
    }
  })

  Vue.directive('validator', {
    inserted: function (el, binding, vnode) {
      const vm = vnode.context
      const errorCache = cache[vm._uid] = cache[vm._uid] || {}
      let id = uid++
      el._erruid = id

      // 对错误对象设置属性
      // 从dom节点获取key作为属性
      // 如果还不存在用指令的arg作为参数，如果存在多个这样的arg会新的会覆盖久的
      // 建议都设置一个key
      let value = binding.value
      let key
      if (!key) {
        key = el.getAttribute('data-key')
      }
      if (!key) {
        key = binding.arg
      }
      Vue.set(vm[field], key, undefined)

      // 设置一份上下文, 用于通信
      const context = errorCache[id] = {
        // errors的key
        key: key,
        // 当前绑定的节点
        target: el,
        // 错误信息
        msg: undefined,
        // 保存的值
        value: value,
        oldValue: value,
        // 验证规则
        rule: binding.arg,
        // 验证函数
        check: function () {
          vm.errors[key] = this.msg
          // 对错误进行展示
          if (options.autoHint) {
            if (this.msg) {
              this.msgEl.innerHTML = this.msg
              this.el.style.display = null
            } else {
              this.msgEl.innerHTML = ''
              this.el.style.display = 'none'
            }
          }
          // 追加错误class
          if (this.msg) {
            addClass(this.el, 'active-error')
          } else {
            removeClass(this.el, 'active-error')
          }
        }
      }

      if (options.autoHint) {
        context.el = autoHint.call(this, el)
        context.msgEl = context.el.querySelector('.err-tip-msg')
      }
    },
    update: function (el, binding, vnode) {
      const vm = vnode.context
      if (!vm.__validationModel) return

      const errorCache = cache[vm._uid]
      const context = errorCache[el._erruid]
      context.value = binding.value
      context.oldValue = binding.oldValue
      // 刚进页面和值没有更改不进行校验,但对于引用类型不拦截
      if (context.value === context.oldValue && !isObject(context.value)) return

      // 验证规则
      var validationModel = vm.__validationModel[binding.arg]

      if (validationModel) {
        validate.call(vm, validationModel, context).then(() => {
          context.msg = undefined
          context.check()
        }).catch((err) => {
          context.msg = err
          context.check()
        })
      }
    },
    unbind: function (el, binding, vnode) {
      const context = cache[vnode.context._uid][el._erruid]
      delete vnode.context[field][context.key]
      delete cache[vnode.context._uid][el._erruid]
    }
  })

  // 验证一个规则
  Vue.prototype.$validate = function (ruleName, value) {
    return new Promise((resolve, reject) => {
      if (!this.__validationModel || !(ruleName in this.__validationModel)) {
        resolve()
      } else {
        validate.call(this, this.__validationModel[ruleName], { value: value }).then(resolve).catch((err) => {
          reject(new Error('验证失败：' + err))
        })
      }
    })
  }

  // 初始化验证规则
  // 不执行该方法,则不会进行验证
  Vue.prototype.$initValidate = function (model) {
    if (model) {
      this.__validationModel = model
    }
  }

  // 验证所有规则是否通过
  Vue.prototype.$isValid = function () {
    return new Promise((resolve, reject) => {
      if (!this.__validationModel) {
        resolve()
      } else {
        // 实例对应对错误缓存对象
        const errCache = cache[this._uid]
        const promises = Object.keys(errCache).map((key) => new Promise((resolve, reject) => {
          const context = errCache[key]
          // 验证规则
          const validationModel = this.__validationModel[context.rule]
          if (validationModel) {
            validate.call(this, validationModel, context).then(() => {
              context.msg = undefined
              context.check()
              resolve()
            }).catch((err) => {
              context.msg = err
              context.check()
              reject(new Error('验证失败：' + err))
            })
          } else {
            resolve()
          }
        }))

        Promise.all(promises).then(() => { resolve() }).catch(reject)
      }
    })
  }
}

// 自动提示
function autoHint (el) {
  var hint = document.createElement('div')
  hint.setAttribute('class', 'err-tip-wrap')
  hint.innerHTML = '<div class="err-tip"><div class="err-tip-msg"></div></div>'
  hint.style.display = 'none'
  before(hint, el)
  return hint
}

function before (el, target) {
  target.parentNode.insertBefore(el, target)
}

validator.addValidation = addValidation

export default validator
