/*
 * 测试
 * @Author: chen_huang 
 * @Date: 2017-09-11 17:06:24 
 * @Last Modified by: chen_huang
 * @Last Modified time: 2017-09-11 17:22:13
 */
import './toolsCommon.css'
let Validate = require('./Validate')

window.onload = function () {
    var validEntity = new Validate({
        'data-valid-name': {
            required: {
                err: '姓名不可省略'
            },
            IsName: {
                err: '姓名不合法'
            },
            len: {
                args: [2],
                err: '姓名长度过短'
            },
            delegate: {
                args: function () {
                    document.querySelector('[data-valid-name]').focus()
                }
            }
        },
        'data-valid-telphone': {
            blur: true,
            IsPhone: {
                err: '手机号码不合法'
            }
        }
    }, function () {
        alert('success')
    })
    document.querySelector('#test').onclick = function () {
        validEntity.trigger()
        return false
    }
}
