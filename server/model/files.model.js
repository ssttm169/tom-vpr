const config = require("../config");
const qiniu = require("qiniu");
const knex = require("../utils/mysql");

var commonErrMsg = ["请求成功", "请求参数错误", "服务器内部错误"];

/**
 * 参数检查错误信息返回
 * code 取值 0~5
 */
function getErrMsg(code) {
	var ret = {};
	ret.code = code;
	ret.message = commonErrMsg[code];
	return ret;
}


async function add(options){


	var resData = {
		code:1,
		message:''
	}

    var rows = await knex("files").count("serverId as nums").where({ serverId: options.serverId});
    if (rows[0].nums == 0) {

		await knex("files").insert({
			errMsg: options.errMsg,
			serverId: options.serverId,
			addtime: knex.fn.now()
		});
		resData.code = 1;
		resData.message = '微信录音文件写入成功!'
	}else{
		resData.code = 0;
		resData.message = '文件已在存!'
	}

	return resData;
}

function getToken() {
	var accessKey = config.qiniu.AccessKey;
	var secretKey = config.qiniu.SecretKey;
	var bucket = config.qiniu.Bucket;
	var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	var putPolicy = new qiniu.rs.PutPolicy({
		scope: bucket
	});

	var token = putPolicy.uploadToken(mac);
	return token;
}

function delFile(filePath) {
	var accessKey = config.qiniu.AccessKey;
	var secretKey = config.qiniu.SecretKey;
	var bucket = config.qiniu.Bucket;

	var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
	var qconfig = new qiniu.conf.Config();
	qconfig.zone = qiniu.zone.Zone_z0;
	var bucketManager = new qiniu.rs.BucketManager(mac, qconfig);

	//var bucket = "if-pbl";
	var key = filePath;
	bucketManager.delete(bucket, key, function(err, respBody, respInfo) {
		if (err) {
			console.log(err);
			//throw err;
		} else {
			console.log(respInfo.statusCode);
			console.log(respBody);
		}
	});
}

module.exports = {
	getToken,
	getErrMsg,
	delFile,
	add
};
