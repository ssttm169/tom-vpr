const knex = require("../utils/mysql");

/**
 * 参数校验通用错误信息列表
 */
var commonErrMsg = ["请求成功", "请求参数错误", "服务器内部错误"];

/**
 * 参数检查错误信息返回
 * code 取值 0~5
 */

const model = { Add: {}, Update: {}, getErrMsg: {} };

model.Add = async options => {
	var rows = await knex("user").count("userID as nums").where({ userID: options.userID, groupID: options.groupID });
	if (rows[0].nums == 0) {
		await knex("user").insert({
			userID: options.userID,
			groupID: options.groupID,
            nickName: options.nickName || '',
            addtime: knex.fn.now()
        });

        return '谢谢您注册成为声纹用户!';

	} else {


		await knex("user")
			.where({ userID: options.userID, groupID: options.groupID })
			.increment("logins", 1);
		await knex("user")
			.where({ userID: options.userID, groupID: options.groupID })
            .update({ lasttime: knex.fn.now() });


        var nRows = await knex("user").select("nickName").where({ userID: options.userID, groupID: options.groupID });


        return '您好, ' + nRows[0].nickName + ' 欢迎回来!';
    }


};

model.Update = async options => {



    var rows = await knex("user").count("userID as nums").where({ userID: options.userID, groupID: options.groupID });
    if (rows[0].nums == 0) {



		await knex("user").insert({
			userID: options.userID,
			groupID: options.groupID,
            nickName: options.nickName,
            path: options.path || '',
            scored: options.scored || 0,
            addtime: knex.fn.now()
        });

        if(options.serverId !="")
            await knex("files").where({ serverId: options.serverId }).update({userID:options.userID, score:options.scored || 0, lasttime: knex.fn.now() });


        return {
            code:1,
            msg:'谢谢您注册成为声纹用户!'
        }

    }else{

        var params = {};
        if (options.wechatID != "" && options.wechatID != undefined) params.wechatID = options.wechatID;
        if (options.scored != "" && options.scored != undefined) params.scored = options.scored;

        await knex("user")
            .where({ userID: options.userID, groupID: options.groupID })
            .increment("logins", 1);

        await knex("user")
            .where({ userID: options.userID, groupID: options.groupID })
            .update(params);


        if(options.serverId !="")
            await knex("files").where({ serverId: options.serverId }).update({userID:options.userID, score:options.scored, lasttime: knex.fn.now() });


        var nRows = await knex("user").select("nickName").where({ userID: options.userID, groupID: options.groupID });


        return {
            code:0,
            msg: '您好, ' + nRows[0].nickName + ' 欢迎回来!'
        }
    }
};



model.UpdateName = async options => {

    await knex("user")
        .where({ userID: options.userID, groupID: options.groupID })
        .update({ nickName: options.nickName});

    return {
        code:0,
        msg:'更改成功!'
    }

};

model.getErrMsg = function(code) {
	var ret = {};
	ret.code = code;
	ret.message = commonErrMsg[code];
	return ret;
};

module.exports = model;
