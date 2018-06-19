'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/* eslint-disable no-inner-declarations */
var toString = function toString(obj) {
  return Object.prototype.toString.call(obj);
};

function isRegExp(obj) {
  return toString(obj) === '[object RegExp]';
}

function isString(obj) {
  return toString(obj) === '[object String]';
}

function isArray(obj) {
  return toString(obj) === '[object Array]';
}

function isFunction(obj) {
  return toString(obj) === '[object Function]';
}

function isNumber(obj) {
  return toString(obj) === '[object Number]';
}

function isObject(obj) {
  return obj != null && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object';
}

function isEmpty(obj) {
  if (obj == null) return true;
  if (typeof obj.length === 'number') return obj.length === 0;
  return false;
}

/**
 * promise 顺序懒执行
 * @param tasks 函数列表，返回Promise
 * @returns {Promise}
 */
function series(tasks) {
  return new Promise(function (resolve, reject) {
    if (Array.isArray(tasks)) {
      var run = function run() {
        var task = tasks[i];
        Promise.resolve(task()).then(function (res) {
          result[i] = res;
          i++;
          if (i < length) {
            run();
          } else {
            resolve(result);
          }
        }).catch(reject);
      };

      var result = [];
      var i = 0;
      var length = tasks.length;
      if (length === 0) {
        return resolve(result);
      }

      run();
    } else {
      reject(new Error('Series Methods must be provided an Array'));
    }
  });
}

var rules = {};

// 添加新的规则
function addValidation(type, handler) {
  rules[type] = handler;
}

// 手机号(中国大陆)
addValidation('mobile', function (value) {
  return (/^(\+?0?86-?)?1[34578]\d{9}$/.test(value)
  );
}

// 钱
);addValidation('money', function (value) {
  return (/^(?!0\.00)(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(value)
  );
}

// ip
);addValidation('ip', function (value) {
  return (/^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})$/i.test(value)
  );
}

// 身份证
);addValidation('idcard', function (value) {
  var isValid = true;
  var cityCode = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江 ',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北 ',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏 ',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外 '

    /* 15位校验规则： (dddddd yymmdd xx g)    g奇数为男，偶数为女
     * 18位校验规则： (dddddd yyyymmdd xxx p) xxx奇数为男，偶数为女，p校验位
      校验位公式：C17 = C[ MOD( ∑(Ci*Wi), 11) ]
     i----表示号码字符从由至左包括校验码在内的位置序号
     Wi 7 9 10 5 8 4 2 1 6 3 7 9 10 5 8 4 2 1
     Ci 1 0 X 9 8 7 6 5 4 3 2
     */
  };var rFormat = /^\d{6}(18|19|20)\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$|^\d{6}\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}$/;

  if (!rFormat.test(value) || !cityCode[value.substr(0, 2)]) {
    isValid = false;
  } else if (value.length === 18) {
    // 18位身份证需要验证最后一位校验位
    // 加权因子
    var Wi = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2, 1];
    // 校验字符
    var Ci = '10X98765432';
    // 加权求和
    var sum = 0;
    for (var i = 0; i < 17; i++) {
      sum += value.charAt(i) * Wi[i];
    }
    // 计算校验值
    var C17 = Ci.charAt(sum % 11
    // 与校验位比对
    );if (C17 !== value.charAt(17)) {
      isValid = false;
    }
  }
  return isValid;
});

// 全局错误信息提示
var messages = {};

function disposeMessages(obj) {
  if (!isObject(obj)) return;
  var keys = Object.keys(obj);
  keys.forEach(function (key) {
    messages[key] = obj[key];
  });
}

/* eslint-disable prefer-promise-reject-errors */
/**
 * 验证规则：
 * 1：字段为空，使用默认值default代替
 * 2：是否是required字段
 * 3：使用type判断字段类型
 * 4: 使用check判断是否通过
 */
function validate(rule, ctx) {
  var _this = this;

  return new Promise(function (resolve, reject) {
    if (!ctx){
      return resolve()
    }
    var _rule$msg = rule.msg,
        msg = _rule$msg === undefined ? messages : _rule$msg,
        required = rule.required,
        type = rule.type,
        check = rule.check,
        doVerify = rule.doVerify,
        format = rule.format;


    var proxy = function proxy(err) {
      if (isString(err)) {
        reject(msg[err] || messages[err] || '输入的值不合法');
      } else {
        reject(err.message);
      }
    };

    var value = ctx.value;

    // 是否需要验证

    if (isFunction(doVerify)) {
      if (!doVerify.call(_this, value, ctx)) {
        return resolve();
      }
    }

    // 对数据进行处理
    if (isFunction(format)) {
      value = format.call(_this, value, ctx);
    }

    if (isEmpty(value)) {
      // 必填
      if (required) {
        return proxy('required');
      } else if (required === false) {
        // required=undefined 忽略，继续校验下面的规则
        // 声明式非必填，为空直接跳过
        return resolve();
      }
    }

    // 验证类型，默认是string
    var types = type;
    if (types) {
      if (!isArray(types)) {
        types = [types];
      }
    } else {
      types = ['string'];
    }

    var promises = types.map(function (type) {
      return verify.bind(_this, type, value, ctx, rule);
    });

    series(promises).then(function () {
      if (isFunction(check)) {
        var boo = check.call(_this, value, ctx);
        return isString(boo) ? reject(boo) : boo ? resolve() : proxy('check');
      }

      resolve();
    }).catch(proxy);
  });
}

function verify(type, value, ctx, rule) {
  var _this2 = this;

  var minlength = rule.minlength,
      maxlength = rule.maxlength,
      length = rule.length,
      min = rule.min,
      max = rule.max,
      range = rule.range,
      remote = rule.remote;


  return new Promise(function (resolve, reject) {
    if (isString(type)) {
      switch (type) {
        case 'string':
          value = String(value);
          if (isNumber(minlength) && value.length < minlength) {
            return reject('minlength');
          }

          if (isNumber(maxlength) && value.length > maxlength) {
            return reject('maxlength');
          }

          if (isArray(length) && (value.length < length[0] || value.length > length[1])) {
            return reject('length');
          }

          resolve();
          break;
        case 'number':
          if (!isNumber(value)) {
            return reject('number');
          }
          if (isNumber(min) && value < min) {
            return reject('min');
          }
          if (isNumber(max) && value > max) {
            return reject('max');
          }
          if (isArray(range) && (value < range[0] || value > range[1])) {
            return reject('range');
          }

          resolve();
          break;
        case 'remote':
          if (isFunction(remote)) {
            remote.call(_this2, value, ctx, function (boo) {
              isString(boo) ? reject(new Error(boo)) : boo ? resolve() : reject('remote');
            });
          }
          break;
        case 'enum':
          if (isArray(rule.enum) && rule.enum.indexOf(value) === -1) {
            return reject('enum');
          }

          resolve();
          break;
        default:
          if (type in rules) {
            var boo = rules[type].call(_this2, value, ctx);
            return isString(boo) ? reject(new Error(boo)) : boo ? resolve() : reject(type);
          }

          resolve();
          break;
      }
    } else if (isRegExp(type)) {
      if (!type.test(value)) {
        return reject('regexp');
      }

      resolve();
    }
  });
}

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var validator = {};

validator.install = function (Vue) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (options.autoHint) {
    // 引入错误提示的css
    require('./style.css');
  }

  var _options$field = options.field,
      field = _options$field === undefined ? 'errors' : _options$field;


  disposeMessages(options.messages);

  var uid = 0;

  // 错误缓存对象
  var cache = {};

  Vue.errorCache = cache;

  // 给vue实例添加errors属性
  Vue.mixin({
    data: function data() {
      return _defineProperty({}, field, {});
    }
  });

  Vue.directive('validator', {
    inserted: function inserted(el, binding, vnode) {
      var vm = vnode.context;
      var errorCache = cache[vm._uid] = cache[vm._uid] || {};
      var id = uid++;
      el._erruid = id;

      // 对错误对象设置属性
      // 从dom节点获取key作为属性
      // 如果还不存在用指令的arg作为参数，如果存在多个这样的arg会新的会覆盖久的
      // 建议都设置一个key
      var value = binding.value;
      var key = void 0;
      if (!key) {
        key = el.getAttribute('data-key');
      }
      if (!key) {
        key = binding.arg;
      }
      Vue.set(vm[field], key, undefined

      // 设置一份上下文, 用于通信
      );var context = errorCache[id] = {
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
        check: function check() {
          vm.errors[key] = this.msg;

          // 对错误进行展示
          if (options.autoHint) {
            if (this.msg) {
              this.msgEl.innerHTML = this.msg;
              this.el.style.display = null;
            } else {
              this.msgEl.innerHTML = '';
              this.el.style.display = 'none';
            }
          }
        }
      };

      if (options.autoHint) {
        context.el = autoHint.call(this, el);
        context.msgEl = context.el.querySelector('.err-tip-msg');
      }
    },
    update: function update(el, binding, vnode) {
      var vm = vnode.context;
      if (!vm.__validationModel) return;

      var errorCache = cache[vm._uid];
      var context = errorCache[el._erruid];
      context.value = binding.value;
      context.oldValue = binding.oldValue;
      // 刚进页面和值没有更改不进行校验,但对于引用类型不拦截
      if (context.value === context.oldValue && !isObject(context.value)) return;

      // 验证规则
      var validationModel = vm.__validationModel[binding.arg];

      if (validationModel) {
        validate.call(vm, validationModel, context).then(function () {
          context.msg = undefined;
          context.check();
        }).catch(function (err) {
          context.msg = err;
          context.check();
        });
      }
    },
    unbind: function unbind(el, binding, vnode) {
      var context = cache[vnode.context._uid][el._erruid];
      delete vnode.context[field][context.key];
      delete cache[vnode.context._uid][el._erruid];
    }
  }

  // 验证一个规则
  );Vue.prototype.$validate = function (ruleName, value) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      if (!_this.__validationModel || !(ruleName in _this.__validationModel)) {
        resolve();
      } else {
        validate.call(_this, _this.__validationModel[ruleName], { value: value }).then(resolve).catch(function (err) {
          reject(new Error('验证失败：' + err));
        });
      }
    });
  };

  // 初始化验证规则
  // 不执行该方法,则不会进行验证
  Vue.prototype.$initValidate = function (model) {
    if (model) {
      this.__validationModel = model;
    }
  };

  // 验证所有规则是否通过
  Vue.prototype.$isValid = function () {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      if (!_this2.__validationModel) {
        resolve();
      } else {
        // 实例对应对错误缓存对象
        var errCache = cache[_this2._uid];
        if (!errCache) {
          return resolve()
        }
        var promises = Object.keys(errCache).map(function (key) {
          return new Promise(function (resolve, reject) {
            var context = errCache[key];
            if (!context) {
              return resolve()
            }
            // 验证规则
            var validationModel = _this2.__validationModel[context.rule];
            if (validationModel) {
              validate.call(_this2, validationModel, context).then(function () {
                context.msg = undefined;
                context.check();
                resolve();
              }).catch(function (err) {
                context.msg = err;
                context.check();
                reject(new Error('验证失败：' + err));
              });
            } else {
              resolve();
            }
          });
        });

        Promise.all(promises).then(function () {
          resolve();
        }).catch(reject);
      }
    });
  };
};

// 自动提示
function autoHint(el) {
  var hint = document.createElement('div');
  hint.setAttribute('class', 'err-tip-wrap');
  hint.innerHTML = '<div class="err-tip"><div class="err-tip-msg"></div></div>';
  hint.style.display = 'none';
  before(hint, el);
  return hint;
}

function before(el, target) {
  target.parentNode.insertBefore(el, target);
}

validator.addValidation = addValidation;

module.exports = validator;
//# sourceMappingURL=index.js.map
