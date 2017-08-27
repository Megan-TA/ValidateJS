/*
 * 参照之前ValidateJs仿写的正则相关验证
 * 支持IE8及以上
 * @Author: chen_huang 
 * @Date: 2017-08-23 10:07:06 
 * @Last Modified by: chen_huang
 * @Last Modified time: 2017-08-25 11:20:43
 * 
 *  文档
 *
 * 需要验证的input加上属性名称data-valid-名称 比如 data-valid-email  
 * 错误文本提示写在err属性后面
 * 
 * 必填项 加上required属性
 *
 * 默认触发控件验证方法 trigger()  全部验证通过后 提供第二个参数接收callback
 * 单个触发控件只需要加上data-valid-名称
 * 
 *  new Validate({
 *      'data-valid-email': {
            required: {
                err: '请输入正确的邮箱'
            },
            'IsEmail': {
                err: '邮箱格式不正确'
            }
        }
 * })
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ?
        module.exports = factory() :
        typeof define === 'function' && define.amd ?
            define(factory) : (global.Validate = factory())
}(this, (function () {
    var tipsTmpl = `<span>$err</span>`
    var result

    function addEventListener (element, type, callback) {
        if (element == null) return false
        if (window.addEventListener) {
            element.addEventListener(type, callback, false)
        } else {
            element.attachEvent('on' + type, callback)
        }
    }
    // 两个对象合并
    function extend (o1, o2) {
        for (var item in o2) {
            if (!o1.hasOwnProperty(item)) {
                o1[item] = o2[item]
            }
        }
        return o1
    }
    /**
     * 
     * @param {以对象的形式传入要验证的内容} config 
     * @param {验证通过之后的回调函数} callback 
     */
    function Validate (config, callback) {
        // 记录所有对应的input dom
        this.inputObj = {}

        this.callback = callback
        // 显示错误提示
        this.showTips = function ($targetDom, err) {
            var $tempTips = $targetDom.parentNode.querySelector('[data-error-tips]')
            var $targetParent = $targetDom.parentNode
            if ($tempTips === null) {
                var aDiv = document.createElement('div')
                aDiv.setAttribute('data-error-tips', true)
                aDiv.innerHTML = tipsTmpl.replace(/\$err/, err)
                aDiv.style.position = 'absolute'
                aDiv.style.top = $targetDom.offsetTop + 'px'
                aDiv.style.left = $targetDom.offsetLeft + $targetDom.offsetWidth + 20 + 'px'
                $targetDom.className += ' active'
                $targetParent.appendChild(aDiv)
            } else {
                $targetDom.className += ' active'
                $tempTips.querySelector('span').innerHTML = err
                $tempTips.className = ''
            }
        }
        // 隐藏错误提示
        this.hideTips = function ($targetDom) {
            var $tempTips = $targetDom.parentNode.querySelector('[data-error-tips]')
            if ($tempTips != null) {
                $targetDom.className = ''
                $tempTips.className = 'hidden'
            }
        }
        // 触发验证
        this.trigger = function (hook) {
            var self = this
            var temp
            var $targetDom
            var resultOnoff
            // 添加一个钩子实现单个input验证触发
            if (hook != null) {
                resultOnoff = this.oneValidated(config, hook)
            } else {
                resultOnoff = this.allValidated(config)
            }

            if (resultOnoff) {
                // 单个input验证后的回调函数由用户自己控制
                if (hook != null) {
                    return true
                } else {
                    typeof callback === 'function' && callback()
                }
            } else {
                event.stopPropagation()
                event.preventDefault()
                return false
            }
        }
        // 根据required判断是否是必填项 不是进行''二次验证
        this.required = function (requiredOroptionalObj, $targetDom) {
            if (!requiredOroptionalObj['required']) {
                // 如果选填项为''跳过 否则验证
                if ($targetDom.value == '') return true
                return false
            }
            return false
        }

        // 遍历 找出失焦验证的对应的name
        this.blur = function ($targetDom) {
            var self = this
            for (var i in self.inputObj) {
                if (self.inputObj[i] == $targetDom) {
                    self.trigger(i)
                    break
                }
            }
        }
        // 单个验证
        this.oneValidated = function (config, hook) {
            var self = this
            var $targetDom
            var result
            var resultOnoff = true
            Object.keys(config).forEach(function (item, key) {
                if (item === hook) {
                    $targetDom = self.inputObj[item]
                    for (var i in config[item]) {
                        if (i == 'blur') continue
                        result = self.formValidate.Check[i].call(self, $targetDom.value)
                        if (!result) {
                            self.showTips($targetDom, config[item][i].err)
                            resultOnoff = false
                            break
                        }
                    }
                }
            })
            return resultOnoff
        }
        // 全部验证
        this.allValidated = function (config) {
            var self = this
            var result
            var $targetDom
            var temp
            var resultOnoff = true
            // 默认全部input校验
            for (var i in config) {
                temp = config[i]
                $targetDom = self.inputObj[i]
                // 选填、必填项判断
                result = this.required(temp, $targetDom)
                if (!result) {
                    for (var j in temp) {
                        if (j == 'blur') continue
                        result = self.formValidate.Check[j].call(this, $targetDom.value)
                        if (!result) {
                            this.showTips($targetDom, temp[j].err)
                            resultOnoff = false
                            break
                        }
                    }
                } 
            }
            return resultOnoff
        }
        this.init = function (config) {
            var self = this
            var $targetDom
            for (var i in config) {
                $targetDom = document.querySelector('[' + i + ']')
                // 记录要验证的input的属性名和对应的input的dom结构
                self.inputObj[i] = $targetDom
                addEventListener($targetDom, 'focus', function () {
                    self.hideTips(this)
                })
                // 判断是否增加失焦验证
                if (config[i].hasOwnProperty('blur')) {
                    addEventListener($targetDom, 'blur', function (event, i) {
                        self.blur(this)
                    })
                }
            }
            // 点击空白处关闭错误提示
            addEventListener(document.body, 'click', function (event) {
                event = event || window.event
                // 防止点击input触发focus事件的同时触发全局click事件
                if (event.target.type != null && event.target.type == 'text') return false
                var $errorTips = document.querySelectorAll('[data-error-tips="true"]')
                if ($errorTips.length == 0) return
                $errorTips.forEach(function (val, index) {
                    val.className = 'hidden'
                    val.parentNode.querySelector('input').className = ''
                })
            })
        }
        this.init(config)
    }
    Validate.prototype.formValidate = {
        Check: {
            required: function (val) {
                if (val == null || val.length == 0) return false
                return true
            },
            IsEmail: function (val) {
                if (!this.rules.email.test(val)) return false
                return true
            },
            IsNumber: function (val) {
                if (!this.rules.number.test(val)) return false
                return true
            }
        }
    }
    Validate.prototype.rules = {
        email: /^[\w-]+@[\w-]+\.[a-zA-Z]{2,4}$/,
        number: /^\d+$/
    }
    Validate.prototype.extend = function (extendObj) {
        extend(this.rules, extendObj)
        for (var key in extendObj) {
            this.formValidate.Check[key] = function (val) {
                if (!this.rules[key].test(val)) return false
                return true
            }
        }
    }
    return Validate
})))




    


