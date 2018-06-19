# vue-direct-validator

## Install
npm install vue-direct-validator

## Use
import validator from 'vue-direct-validator'
Vue.use(validator, options)

> options:

```
  autoHint: 是否自动引入错误提示（在元素后面追加错误dom节点，引入错误样式，比较简单的错误提示），默认false 
  field: 验证插件默认会在vue组件上添加一个属性，用于保存错误对象信息，默认是errors
  messages: 全局错误提示信息，默认空
```

> addValidation: 添加一个通用的规则

  添加一个规则,如
  ```javascript
  addValidation('mobile', function (value, ctx) {
    return /^1\d{10}$/.test(value);
  })
  ```

> 第一步：编写验证规则model

例子：
```javascript
  export default {
    title: {
      required: true,
      minlength: 3,
      maxlength: 5,
      msg: {required: '必填', minlength: '最少3个字符', maxlength: '最多5个字符'}
    },
    city: {
      type: 'enum', 
      enum: ['2', '3'], 
      msg: {enum: '请选择一个'}
    },
    mobile: {
      required: true,
      type: ['mobile', 'remote'],
      remote: function (val, ctx, cb) {
        setTimeout(function () {
            cb(false);
        }, 1000);
      },
      msg: {required: '必填', mobile: '手机格式不正确', remote: '手机号不存在'}
    },
    num: {
      required: true,
      type: 'number',
      range: [1, 10],
      check: function (val) {
        return val % 2 === 0;
      },
      msg: { required: '必填', number: '不是数字', range: '1-10之间', check: '不是1-10之间的偶数' }
    }
  }
  ```
  
> 第二步：初始化验证规则

在vue组件中，初始化规则

如：
```
beforeCreate () {
  this.$initValidate(model)
}
```
> 第三步：在模版中使用

如：
```html
<input
v-model="title"
v-validator:title="title" 
>
// 或
<input 
v-model="title"
v-validator:title="title" 
data-key="title">
>
```

> 第四步：错误处理

如果设置autoHint为true，会自动错误提示，因为样式比较单一，一般不满足需求。

插件在vue组件的data中添加一个errors属性，保存错误信息，可以自己设置错误提示
errors的key的可以这样设置如下：
```
1. 在dom节点上添加key属性，如：<input v-model="title" v-validator:title="title" data-key="title">
2. 如果不设置，默认会取指令的arg作为key,如：<input v-model="title" v-validator:title="title">
```

## model验证规则

> key

属性key作为指令的arg，将验证规则绑定在一起

> 规则

1. required: 是否必填，默认false
2. type: 类型，已有的类型：string(默认)，number，regexp，remote，enum
3. check函数, 返回true或false

> doVerify函数 返回值boolean

是否校验该规则

返回值：
true：校验该规则（默认值）
false: 不检验该规则

this指向当前vue实例，第一个参数val,第二个参数ctx

check,remote函数和doVerify的上下文和参数一样

> format函数 返回值处理后的新值

对输入的值预先处理一下，返回处理后的新值


> type: string 默认

1. minlength: 0 最小长度0
2. maxlength: 10 最大长度10
3. length: [3,5] 最小长度3，最大长度5
```
{
  required: true,
  minlength: 3,
  maxlength: 5,
  msg: {required: '必填', minlength: '最少3个字符', maxlength: '最多5个字符'}
}
```

> type: number

1. min: 0 最小值0
2. max:10 最大值10
3. range: [3,5]  最小值3，最大值5

```
{
  required: true,
  type: 'number',
  min: 3,
  max: 5,
  msg: {required: '必填', min: '最小值3', max: '最大值5'}
}
```

> type: regexp 直接写正则表达式就好

```
{
  required: true,
  type: /^1\d{10}$/,
  msg: {regexp: '手机号不正确'}
}
```

> type: remote 异步校验

```
{
  required: true,
  type: 'remote',
  remote: function (val, ctx, cb) {
    setTimeout(function () {
        cb(false);
    }, 1000);
  },
  msg: {required: '必填', remote: '手机号不存在'}
}

remote函数的this是vm实例
参数val: 当前绑定的值
参数ctx: 一些上下文信息，一般不需要

```

> type: enum 枚举

```
{
  type: 'enum', 
  enum: ['2', '3'], 
  msg: {enum: '请选择一个'}
}
```
  
> 其他内嵌的规则

1. type: 'mobile' 手机号(中国大陆)
2. type: 'money' 钱
3. type: 'ip' ip地址
4. type: 'idcard' 身份证(中国大陆)

> type可以是个数组，数组中的规则以此校验

type: ['mobile', 'remote']

> check函数

在一些复杂情况下可以使用check函数校验, 返回值可以字符串错误信息，也可以是true或false，当时false时取msg中的check错误信息
```
{
  check (val) {
    return val % 2 === 0
  },
  msg: {check: 'error'}
}
```

## $isValid

插件会将错误信息保存在errors对象中,
可以使用this.$isValid()函数验证所有规则是否通过,返回值是Promise

## $validate

this.$validate(rule,value)
rule: 规则名称
value：验证的值
返回值是Promise
