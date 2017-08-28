# 个人表单验证控件

* 已经兼容amd cmd umd标准
* seajs requireJS中直接require(Validate.js)
* 没有模块化环境中直接window.Validate

> ### 相关用法
* trigger

  默认通过trigger()方法触发所有input验证
  
  提供第二个参数接收callback
  
  若想指定触发某一个input验证则指定对应的data-valid-名称
  
  比如 trigger('data-valid-email')
  
* 第一个参数一定是一个对象
    
  ### key值 

    required  必填项
        
    IsEmail/IsNumber 等默认或自定义方法名称
    
  ### value值
        
    {
        err：输入自定义的错误提示文本
    }
  

* 自定义扩展验证规则
```
Validate.prototype.extend({
  'test': /^\d+$/
})
```


> 完整用法如下
```
--------------html-----------------

<div>
    <input type="text" placeholder="填写邮箱帐号例如：example@abc.com(必填项)" data-valid-email>
</div>
<div>
    <input type="text" placeholder="填写数字" data-valid-number>
</div>

--------------Js------------------

// 扩展验证规则
Validate.prototype.extend({
  'test': /^\d+$/
})

var test = new Validate({
   'data-valid-email': {
        required: {
            err: '邮箱不能为空'
        },
        'IsEmail': {
            err: '邮箱格式不正确'
        }
    },
    'data-valid-number': {
        test: {
            err: '只能输入数字'
        }
    }
}, function () {
    alert('测试通过')
})
// 全部验证
test.trigger()
// 单个验证
test.trigger('data-valid-number')

```