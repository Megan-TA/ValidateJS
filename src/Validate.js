/*
 * 参照之前ValidateJs仿写的正则相关验证
 * 支持IE8及以上
 * @Author: chen_huang
 * @Date: 
 * @Last Modified by: chen_huang
 * @Last Modified time: 2017-09-20 14:02:20
 *
 * 文档
 * 默认点击空白处不关闭错误提示  如果以后存在这样的需求再加上
 * 
 * 需要验证的input加上属性名称data-valid-名称 比如 data-valid-email
 * 错误文本提示写在err属性后面 err: '请输入合法的号码'
 *
 * 必填项 加上required属性 required: {}
 *
 * 默认触发控件验证方法 trigger()  全部验证通过后 提供第二个参数接收callback
 * 单个触发控件只需要加上data-valid-名称   trigger('data-valid-tel')
 *
 * 指定input失败的回调事件加在delegate属性中指定args属性后面  delegate: {args: function() {}}
 * 
 * 限制文字长度  len   len:{args: [0, 100]} 0~100  len: {args: [3]}  3~max
 * 
 * 失焦验证 blur  默认通过trigger()来触发错误提示  如果想单独失焦验证的话 加上 blur: true
 * 
 * 具体用法:   (也可参考需求单填写页相关具体用法)
 * 
 *  new Validate({
 *      'data-valid-email': {
            required: {
                err: '请输入正确的邮箱'
            },
            IsEmail: {
                err: '邮箱格式不正确'
            },
            blur: true,
            delegate: {
                agrs: function () {
                    alert(1)
                }
            },
            len: {
                args: [0, 100],
                err: '输入字符不能超过100'
            }
        }
 * })
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory()
        : typeof define === 'function'
            ? define(factory) : (global.Validate = factory())
}(this, function () {
    var tipsTmpl = '<span>$err</span>'

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
        // 用来记录状态
        this.state = {
            // 失焦验证状态
            blurDelegate: true
        }

        this.callback = callback
        // 显示错误提示
        this.showTips = function ($targetDom, err) {
            var $tempTips = $targetDom.parentNode.querySelector('[data-error-tips]')
            var $targetParent = $targetDom.parentNode
            if ($tempTips === null) {
                var aDiv = document.createElement('div')
                var ai = document.createElement('i')
                var ab = document.createElement('b')
                aDiv.setAttribute('data-error-tips', true)
                aDiv.innerHTML = tipsTmpl.replace(/\$err/, err)
                aDiv.style.top = $targetDom.offsetTop + 'px'
                aDiv.style.left = $targetDom.offsetLeft + $targetDom.offsetWidth + 20 + 'px'
                // aDiv.style.cssText += ';position:absolute;z-index:20;border:1px solid #FFB533;background:#FFF5D1;padding:3px'
                // ai.style.cssText += ';display: block;width: 0px;height: 0px;border-style: solid;border-left: 0;border-color: transparent #FFF5D1 transparent;border-width: 5px;position: absolute;left: -5px;top: 6px;z-index: 11'
                // ab.style.cssText += ';display: block;width: 0px;height: 0px;border-style: solid;border-left: 0;border-color: transparent #FFB533 transparent;border-width: 5px;position: absolute;left: -5px;top: 6px'
                aDiv.appendChild(ai)
                aDiv.appendChild(ab)
                $targetDom.setAttribute('data-valid-tip', 'true')
                $targetParent.appendChild(aDiv)
            } else {
                $targetDom.setAttribute('data-valid-tip', 'true')
                $tempTips.querySelector('span').innerHTML = err
                $tempTips.className = ''
            }
            return false
        }
        // 隐藏错误提示
        this.hideTips = function ($targetDom) {
            var $tempTips = $targetDom.parentNode.querySelector('[data-error-tips]')
            if ($tempTips != null) {
                $targetDom.removeAttribute('data-valid-tip')
                $tempTips.className = 'hidden'
            }
        }
        // 触发验证
        this.trigger = function (hook) {
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
                return false
            }
        }
        // 根据required判断是否是必填项 不是进行''二次验证
        this.required = function (requiredOroptionalObj, val) {
            if (!requiredOroptionalObj['required']) {
                // 如果选填项为''跳过 否则验证
                if (val == '') return true
                return false
            }
            return false
        }

        // 遍历 找出失焦验证的对应的name
        // 直接失焦验证的情况下不会触发delegate allValidate的时候触发
        this.blur = function ($targetDom) {
            var that = this
            var val = $targetDom.value
            // 兼容Cquery
            if ($targetDom.className.indexOf('inputSel') > -1) val = $($targetDom).value()
            // 值为空的情况不做判断
            if (val == null || val.length == 0) return
            for (var i in that.inputObj) {
                if (that.inputObj[i] == $targetDom) {
                    that.state.blurDelegate = false
                    that.trigger(i)
                    break
                }
            }
        }
        // 单个验证
        this.oneValidated = function (config, hook) {
            var that = this
            var $targetDom
            var resultOnoff = true
            Object.keys(config).forEach(function (item, key) {
                if (item === hook) {
                    $targetDom = that.inputObj[item]
                    var temp = config[item]
                    resultOnoff = that.judge(temp, $targetDom)
                }
            })
            return resultOnoff
        }
        // 全部验证
        this.allValidated = function (config) {
            var that = this
            var resultOnoff = true
            var $targetDom
            var temp
            var val
            var result
            // 默认全部input校验
            for (var i in config) {
                temp = config[i]
                $targetDom = that.inputObj[i]
                val = $targetDom.value
                if ($targetDom.className.indexOf('inputSel') > -1) val = $($targetDom).value()
                // 选填、必填项判断   false: 必填项 只为了判断是否要验证 故需要验证之后还要再做一次严格判断
                result = this.required(temp, val)
                if (!result) {
                    resultOnoff = that.judge(temp, $targetDom)
                    // 找到一个非法则停止验证
                    if (!resultOnoff) break
                }
            }
            return resultOnoff
        }
        // 验证是否合法逻辑
        this.judge = function (temp, $targetDom) {
            var result
            var val = $targetDom.value
            var len = val.length
            var argsArr
            var resultOnoff = true
            var that = this
            // 兼容生产的cQuery控件
            if ($targetDom.className.indexOf('inputSel') > -1) val = $($targetDom).value()
            // 兼容只写回调函数的delegate验证情况
            if (Object.keys(temp).length == 1 && Object.keys(temp)[0] == 'delegate') {
                temp['delegate']['args']()
                return
            }
            for (var j in temp) {
                // 失焦判断
                if (j == 'blur') continue
                if (j == 'delegate') continue
                if (that.formValidate.Check[j] == null) console.error('实例属性中不存在' + j + '属性')
                // 最小值最大值判断
                if (j == 'len') {
                    if (!temp[j]['args']) console.error('args为空')
                    if (!(temp[j]['args'] instanceof Array)) console.error('args必须为数组')
                    argsArr = temp[j]['args']
                    // 只有一个参数为最小值
                    if (argsArr.length == 0) {
                        result = that.formValidate.Check[j].call(that, argsArr[0], null, len)
                    } else {
                        result = that.formValidate.Check[j].call(that, argsArr[0], argsArr[1], len)
                    }
                } else {
                    result = that.formValidate.Check[j].call(that, val)
                }
                if (!result) {
                    if (temp['delegate'] && that.state.blurDelegate == true) {
                        if (typeof (temp['delegate']['args']) === 'function') temp['delegate']['args']()
                    }
                    that.showTips($targetDom, temp[j].err)
                    resultOnoff = false
                    break
                }
            }
            return resultOnoff
        }
        this.init = function (config) {
            var that = this
            var $targetDom
            for (var i in config) {
                $targetDom = document.querySelector('[' + i + ']')
                if ($targetDom == null) console.error('没有找到属性为' + i + '相应的DOM')
                // 记录要验证的input的属性名和对应的input的dom结构
                that.inputObj[i] = $targetDom
                addEventListener($targetDom, 'focus', function (event) {
                    event = event || window.event
                    that.hideTips(this)
                    if (event.cancelBubble) {
                        event.cancelBubble = true
                    } else {
                        event.stopPropagation()
                    }
                    return false
                })
                addEventListener($targetDom, 'keydown', function (event) {
                    event = event || window.event
                    var errTip = this.parentNode.querySelector('[data-error-tips="true"]')
                    if (errTip && errTip.className == '') that.hideTips(this)
                    if (event.cancelBubble) {
                        event.cancelBubble = true
                    } else {
                        event.stopPropagation()
                    }
                    return false
                })
                // 判断是否增加失焦验证
                if (config[i].hasOwnProperty('blur')) {
                    addEventListener($targetDom, 'blur', function (event, i) {
                        event = event || window.event
                        that.blur(this)
                        if (event.cancelBubble) {
                            event.cancelBubble = true
                        } else {
                            event.stopPropagation()
                        }
                        return false
                    })
                }
            }
            // 点击空白处关闭错误提示
            // addEventListener(document.body, 'click', function (event) {
            //     event = event || window.event
            //     // 防止点击input触发focus事件的同时触发全局click事件
            //     if (event.target.type != null && event.target.type == 'text') return false
            //     var $errorTips = document.querySelectorAll('[data-error-tips="true"]')
            //     if ($errorTips.length == 0) return
            //     [].slice.call($errorTips).forEach(function (val, index) {
            //         val.className = 'hidden'
            //         var $target = val.parentNode.querySelector('input')
            //         $target.removeAttribute('data-valid-tip')
            //     })
            //     if (event.cancelBubble) {
            //         event.cancelBubble = true
            //     } else {
            //         event.stopPropagation()
            //     }
            //     return false
            // })
        }
        this.init(config)
    }
    Validate.prototype.formValidate = {
        Check: {
            required: function (val) {
                if (val == null || val.length == 0) return false
                return true
            },
            IsNullOrEmpty: function (val) {
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
            },
            IsNormal: function (val) {
                if (!this.rules.normal.test(val)) return false
                return true
            },
            IsPhone: function (val) {
                if (!this.rules.phone.test(val)) return false
                return true
            },
            IsName: function (val) {
                if (!this.rules.name.test(val)) return false
                return true
            },
            IsText: function (val) {
                if (!this.rules.text.test(val)) return false
                return true
            },
            len: function (min, max, len) {
                if (max == null) max = 99999999
                if (Number(min) <= len && len <= Number(max)) return true
                return false
            }
        }
    }
    Validate.prototype.rules = {
        email: /^[\w-]+@[\w-]+\.[a-zA-Z]{2,4}$/,
        number: /^\d+$/,
        phone: /^1[34578]\d{9}$/,
        name: /^[\u4e00-\u9fa5a()（）0-9a-zA-Z\s]+$/,
        text: /^[^<>()]+$/,
        normal: /^[\u4e00-\u9fa5\w\s]+$/ // 中文 数字 字母 下划线
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
}))
