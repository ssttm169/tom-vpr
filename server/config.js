const CONF = {

	//端口
	port: "8888",


	//微信 appid & appsecret
	appid: "xxxx",
	appsecret: "xxxx",

	//声纹识别配置
	vpr:{
		appkey: 'xxx',  //appkey
		groupid: "001",  //音频文件分组号
		threshold: "61", //识别阈值
		thresholdVerify: "61", //判别阈值
		devkey:'xxx',  //devkey
		capkey:'vpr.cloud.recog',  //功能
		audioformat:'pcm16k16bit',  //提交音频文件的编码
		api:{
			reco:'http://api.xxxx.com/vpr/recognise',  //识别接口
			reg:'http://api.xxxx.com/vpr/register',   //判别接口
			verify:'http://api.xxxx.com/vpr/verify'  //注册接口
		}
	},


	//mysql 数据库配置
	mysql: {
		host: "localhost",
		port: 3306,
		user: "root",
		db: "xxx",
		pass: "xxxx",
		char: "utf8mb4"
	},

	//七牛配置 暂时用不到
	qiniu: {
		AccessKey: "xxx",
		SecretKey: "xx",
		Bucket: "xxx"
	}
};

//module.exports = CONF;
module.exports = process.env.NODE_ENV === 'local' ? Object.assign({}, CONF, require('./config.local')) : CONF;
