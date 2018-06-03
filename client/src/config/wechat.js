//var wx = require('weixin-js-sdk');
import api from '../data/index';   //数据接口
import wx from 'weixin-js-sdk'

export default weset => {

    var data = {url :  window.location.href.split('#')[0] };
    api.com.wechat(data).then(function(res){
        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: res.appId, // 必填，公众号的唯一标识
            timestamp: res.timestamp, // 必填，生成签名的时间戳
            nonceStr: res.nonceStr, // 必填，生成签名的随机串
            signature: res.signature,// 必填，签名，见附录1
            jsApiList: ['onMenuShareTimeline','onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });

        wx.ready(function () {

            wx.onMenuShareAppMessage({
                title: weset.title, // 分享标题
                desc: weset.desc, // 分享描述
                link: weset.link || window.location.href, // 分享链接
                imgUrl: weset.img, // 分享图标
                success: function () {

                }
            });

            wx.onMenuShareTimeline({
                title: weset.title, // 分享标题
                link: weset.link || window.location.href, // 分享链接
                imgUrl: weset.img, // 分享图标
                success: function () {

                }
            });
        });
    });
}
