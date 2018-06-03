const fs = require("fs.promised");
const rp = require("request-promise");
const config = require("../config");
const WechatAPI = require("co-wechat-api");
const sha1 = require('sha1')
const ctrl = { Token: {} };

ctrl.Token = async (ctx, next) => {


	if (!ctx.request.body || !("url" in ctx.request.body) ) {
		ctx.body = model.getErrMsg(1);
		return;
    }


	var tokenData = {};
	var api = await new WechatAPI(
		config.appid,
		config.appsecret,
		async () => {
			// 传入一个获取全局token的方法
			var txt = await fs.readFile("./token/access_token.txt", "utf8");
			return JSON.parse(txt);
		},
		async token => {
			// 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
			// 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
			await fs.writeFile("./token/access_token.txt", JSON.stringify(token));
		}
	);



	//生成微信签名
	var jsapi_ticket = await api.getLatestTicket();
	let nonce_str = 'abcdefg';    // 密钥，字符串任意，可以随机生成
	let timestamp = parseInt(new Date().getTime() / 1000) + '';  // 时间戳
	let url = ctx.request.body.url;   // 使用接口的url链接，不包含#后的内容
	let str = 'jsapi_ticket=' + jsapi_ticket.ticket + '&noncestr=' + nonce_str + '&timestamp=' + timestamp + '&url=' + url;
	let signature = sha1(str);

	ctx.body = {
		appId: config.appid,
		timestamp: timestamp,
		nonceStr: nonce_str,
		signature: signature
	}
};

module.exports = ctrl;
