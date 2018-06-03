
const ffmpeg = require('fluent-ffmpeg');
const rp = require("request-promise");
const md5 = require("js-md5");
const fs = require("fs.promised");
const errMsg = require('../utils/errMsg');
const config = require('../config')
const multiparty = require("multiparty");
const filesModel = require("../model/files.model");
const WechatAPI = require("co-wechat-api");
const userModel = require('../model/user.model');
const vprModel = require('../model/vpr.model');

const ctrl = { Verify: {}, Upload:{} };
const commonErrMsg = ["请求成功", "请求参数错误", "服务器内部错误"];



function rString(len, charSet) {
	charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var randomString = '';
	for (var i = 0; i < len; i++) {
		var randomPoz = Math.floor(Math.random() * charSet.length);
		randomString += charSet.substring(randomPoz, randomPoz + 1);
	}
	return randomString;
}


/**
* 删除左右两端的空格
*/
String.prototype.trim=function()
{
    return this.replace(/(^\s*)|(\s*$)/g, '');
}
/**
* 删除左边的空格
*/
String.prototype.ltrim=function()
{
     return this.replace(/(^\s*)/g,'');
}
/**
* 删除右边的空格
*/
String.prototype.rtrim=function()
{
     return this.replace(/(\s*$)/g, '');
}


Date.prototype.Format = function(fmt) {
	//author: meizz
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		S: this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(
			RegExp.$1,
			(this.getFullYear() + "").substr(4 - RegExp.$1.length)
		);
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(
				RegExp.$1,
				RegExp.$1.length == 1
					? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length)
			);
	//fmt = fmt.replace(RegExp.$1,  o[k]);
	return fmt;
};


//上传音频文件识别
ctrl.Upload = async (ctx, next) => {


	if (!ctx.request.body) {
		ctx.body = commonErrMsg[1];
		return;
	}

	let form = new multiparty.Form({uploadDir:'./audio/' });
	form.maxFilesSize = 8 * 1024 * 1024;
	var _files = {};

	await new Promise((resolve, reject) => {
		form.parse(ctx.req, async(err,fields,files) => {
			if(err){reject(err)}
			_files = JSON.stringify(files) != "{}" ? files.file[0]:{};
			resolve();
		});
	})


	if (!_files.originalFilename) ctx.throw(400, '你还没有选择文件!');

	var fileData = {
		name: _files.originalFilename,
		path: _files.path,
		type: 'audio/mpeg'
	}

	if (fileData.type != "audio/mp3" && fileData.type != "audio/mpeg" && fileData.type != "audio/wav" ){
		fs.unlinkSync(fileData.path);
		ctx.throw(400, '文件格式不对!');
	}



	//用户数据
	var userData = {
		userID:'',
		scored: 0,
		groupID: config.vpr.groupid,
		serverId: ctx.request.body.serverId || ''
	}


	vprModel.Init(fileData);


	//识别请求, 低于阈值 比如72的，userid为空
	var ret = await vprModel.Verify({act:'reco'});

	//使用识别的data
	userData.userID = ret.data.userID || '', userData.scored = ret.data.scored || 0;

	//userID为空是找不到用户, code为14024是没有样本
	if(ret.data.userID == '' || ret.code == '14024'){

		//注册请求  找不到记录，就注册
		ret = await vprModel.Verify({act:'reg'});

		//使用请求的data
		userData.userID = ret.data.userID || '', userData.scored = ret.data.scored || 0;

	}else{

		//判别请求 这里不会返回userid
		ret = await vprModel.Verify({act:'verify', userid: userData.userID});


		//判别请求 返回 如果不是同一个人，就注册
		if(ret.data.code == 0){
			ret = await vprModel.Verify({act:'reg'});

			//使用请求的data
			userData.userID = ret.data.userID || '', userData.scored = ret.data.scored || 0;
		}
	}




	if(ret.code == '0'){
		var options = {
			userID: userData.userID,
			nickName: '游客_'+ rString(6),
			scored: userData.scored,
			groupID: userData.groupID,
			serverId: userData.serverId
		}

		var udata = await userModel.Update(options);

		ret.message = udata.msg;
		ret.data.code = udata.code;
	}

	fs.unlinkSync(fileData.path);

	ctx.body = ret;

};





//在线音频识别
ctrl.Verify = async (ctx, next) => {




	if (!ctx.request.body) {
		ctx.body = commonErrMsg[1];
		return;
	}



	var options = {
        errMsg: ctx.request.body.errMsg,
        serverId: ctx.request.body.serverId
	};


	//'微信录音文件写入成功!';
	await filesModel.add(options);



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
			await fs.writeFile(
				"./token/access_token.txt",
				JSON.stringify(token)
			);
		}
	);

	//获取微信 音频的buffer对象
	var mediaRes = await api.getMedia(ctx.request.body.serverId);


	var _str = new Date().Format("yyyyMMddhhmmss") + rString(5),  _delPath = {
		amr:'',
		fix:''
	}

	var fileForm = '.wav';

	_delPath.amr = './audio/amr/'+_str+'.amr';
	_delPath.fix = './audio/fix/'+_str + fileForm;

	fs.writeFileSync(_delPath.amr, mediaRes);

	//ffmpeg 转码, 转成mp3
	new Promise((resolve, reject) => {

var command = ffmpeg(_delPath.amr)
.audioBitrate('16k')
.audioFrequency(16000)
.audioQuality(10)
.on('end', function() {
	console.log('file has been converted succesfully');
	resolve();
})
.on('error', function(err) {
	reject(err.message)
	console.log('an error happened: ' + err.message);
})
.save(_delPath.fix);
	});


	var soundData = {
		name: _str + fileForm,
		path: _delPath.fix,
		//type: 'audio/mpeg'
		type: 'audio/wav'
	}

	//用户数据
	var userData = {
		userID:'',
		scored: 0,
		groupID: config.vpr.groupid,
		serverId: ctx.request.body.serverId
	}
	//初始化提声纹请求
	vprModel.Init(soundData);

	//识别请求, 低于阈值 比如72的，userid为空
	var ret = await vprModel.Verify({act:'reco'});

	//使用识别的data
	userData.userID = ret.data.userID || '', userData.scored = ret.data.scored || 0;

	//userID为空是找不到用户, code为14024是没有样本
	if(ret.data.userID == '' || ret.code == '14024'){

		//注册请求  找不到记录，就注册
		ret = await vprModel.Verify({act:'reg'});

		//使用请求的data
		userData.userID = ret.data.userID || '', userData.scored = ret.data.scored || 0;

	/* }else{

		//判别请求 这里不会返回userid
		ret = await vprModel.Verify({act:'verify', userid: userData.userID});


		//判别请求 返回 如果不是同一个人，就注册
		if(ret.data.code == 0){
			ret = await vprModel.Verify({act:'reg'});

			//使用请求的data
			userData.userID = ret.data.userID || '', userData.scored = ret.data.scored || 0;
		} */
	}






	if(ret.code == '0'){
		var options = {
			userID: userData.userID,
			nickName: '游客_'+ rString(6),
			scored: userData.scored,
			groupID: userData.groupID,
			serverId: userData.serverId
		}

		var udata = await userModel.Update(options);

		ret.message = udata.msg;
		ret.data.code = udata.code;
	}

	//删除文件
	fs.unlinkSync(_delPath.amr);
	fs.unlinkSync(_delPath.fix);


	ctx.body = ret;

};

module.exports = ctrl;
