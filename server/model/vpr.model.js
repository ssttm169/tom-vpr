
const rp = require("request-promise");
const errMsg = require('../utils/errMsg');
const config = require('../config')
const fs = require("fs.promised");
const md5 = require("js-md5");
const commonErrMsg = ["请求成功", "请求参数错误", "服务器内部错误"];

var soundData = {
    name: '',
    path: '',
    type: ''
}


const model = { Init: {}, Verify: {} };

model.Init = options => {
    soundData = options;
}


//识别请求
model.Verify = async actions => {

    var api_url = '', task_config = '';

    switch(actions.act){
        case 'reco':
            api_url = config.vpr.api.reco;
            task_config = "capkey=" + config.vpr.capkey + ", audioformat=" + config.vpr.audioformat + ", threshold=" + config.vpr.threshold + ", groupid=" + config.vpr.groupid;
            break;
        case 'verify':
            api_url = config.vpr.api.verify;
            task_config = "capkey=" + config.vpr.capkey + ", audioformat=" + config.vpr.audioformat + ", userid=" + actions.userid + ", threshold=" + config.vpr.thresholdVerify + ", groupid=" + config.vpr.groupid;
            break;
        case 'reg':
            api_url = config.vpr.api.reg;
            task_config = "capkey=" + config.vpr.capkey + ", audioformat=" + config.vpr.audioformat + ", groupid=" + config.vpr.groupid;
            break;
    }

    if(api_url == '' || task_config == ''){
        return {
            code:-1,
            message: commonErrMsg[1]
        }
    }

	var xdate = new Date().Format("yyyy-MM-dd h:mm:ss");
	var session = md5(xdate + config.vpr.devkey);
	var vprData = {
		method: "POST",
		url: api_url,
		headers: {
			"cache-control": "no-cache",
			"x-udid": "101:1234567890",
			"x-session-key": session,
			"x-task-config": task_config,
			"x-request-date": xdate,
			"x-sdk-version": "5.1",
			"x-app-key": config.vpr.appkey
		},
		formData: {
			// Like <input type="file" name="file">
			file: {
				value: fs.createReadStream(soundData.path),
				options: {
					filename: soundData.name,
					contentType: soundData.type //mp3 = audio/mpeg, wav = audio/wav
				}
			}
		}
    };


    var ret = {
        code: 0,
        message: commonErrMsg[0],
        data: {}
    };


    var xml = await rp(vprData);

    // 返回的demo xml
	//var xml = '<?xml version=\"1.0\" encoding=\"UTF-8\"?><ResponseInfo><ResCode>Failed</ResCode><ResMessage>Extract feature failed.</ResMessage><ErrorNo>14023</ErrorNo><Result_Token>2_460_80_79019_20180510143642_1765487</Result_Token></ResponseInfo>';
	//var xml = '<?xml version="1.0" encoding="UTF-8"?><ResponseInfo><ResCode>Success</ResCode><ResMessage>Success</ResMessage><ErrorNo>0</ErrorNo><Result_Token>2_417_80_56294_20180509092601_207969</Result_Token><Result><UserId>userid_2_417_80_56294_20180509092601_207969</UserId></Result></ResponseInfo>';
	//var xml = '<?xml version="1.0" encoding="UTF-8"?><ResponseInfo><ResCode>Success</ResCode><ResMessage>Success</ResMessage><ErrorNo>0</ErrorNo><Result_Token>2_460_82_106678_20180511180233_123778</Result_Token><ResultCount>1</ResultCount><Result><UserId Score="86">userid_2_417_80_103302_20180510170258_1649275</UserId></Result></ResponseInfo>';
	//var xml = '<?xml version="1.0" encoding="UTF-8"?><ResponseInfo><ResCode>Success</ResCode><ResMessage>Success</ResMessage><ErrorNo>0</ErrorNo><Result_Token>2_460_82_127314_20180514163925_352115</Result_Token><ResultCount>1</ResultCount><Result><UserId Score="87">userid_2_460_80_79019_20180511194233_1872299</UserId></Result></ResponseInfo>';
	//var xml = '<?xml version="1.0" encoding="UTF-8"?><ResponseInfo><ResCode>Success</ResCode><ResMessage>Success</ResMessage><ErrorNo>0</ErrorNo><Result_Token>2_460_82_109142_20180517094644_968022</Result_Token><ResultCount>0</ResultCount><Result></Result></ResponseInfo>'

    var resJson = {};
    var parseString = require('xml2js').parseString;



    //XML 转 JSON
	await new Promise((resolve, reject) => {

		parseString(xml.toString(), async (err, result) => {
            resJson = result.ResponseInfo;

            switch(actions.act){
                case 'reco':
                ret = recoData(resJson);
                break;

                case 'verify':
                ret = verifyData(resJson);
                break;

                case 'reg':
                ret = regData(resJson);
                break;
            }

			resolve();
		});

	});

    //console.log('start-----------------------------------');
    console.log('post time:', xdate)
    console.log('post url:', api_url)
    console.log('xml result:', xml);
    console.dir(resJson);
    console.log('\n');
    //console.log('end--------------------------------------\n');

    return ret;
};


function regData(res){

    var ret = {
        code: 0,
        message: '',
        data: {}
    };

    ret.code = res.ErrorNo[0];
    ret.message = errMsg(ret.code);
    ret.data = {
        code:0,
        scored: 73,
        groupid: config.vpr.groupid,
        token: res.Result_Token[0] || '',
        userID: (res.Result ? (res.Result[0].UserId ? res.Result[0].UserId[0] : ''):'') || ''
    };

    return ret;
}




function verifyData(res){

    var ret = {
        code: 0,
        message: '',
        data: {}
    };

    ret.code = res.ErrorNo[0];
    ret.message = errMsg(ret.code);

    if(ret.code == '0'){
        ret.data = {
            code:0,
            groupid: config.vpr.groupid,
            token: res.Result_Token[0] || '',
            yes: (res.Result ? (res.Result[0].VerifyResult ? res.Result[0].VerifyResult[0]['_'] : ''):'') || '',
            scored: (res.Result ? (res.Result[0].VerifyResult ? res.Result[0].VerifyResult[0]['$']['Score'] : ''):'') || ''
        };

        ret.data.code = ret.data.yes == 'YES' ? 1:0;

    }else{
        ret.data = res;
    }

    return ret;
}


function recoData(res){

    var ret = {
        code: 0,
        message: '',
        data: {}
    };


    ret.code = res.ErrorNo[0];
    ret.message = errMsg(ret.code);

    if(ret.code == '0'){
        ret.data = {
            code:0,
            groupid: config.vpr.groupid,
            token: res.Result_Token[0] || '',
            userID: (res.Result ? (res.Result[0].UserId ? res.Result[0].UserId[0]['_'] : ''):'') || '',
            scored: (res.Result ? (res.Result[0].UserId ?  res.Result[0].UserId[0]['$']['Score'] : ''):'') || ''
        };

    }else{
        ret.data = res;
    }

    return ret;
}

module.exports = model;
