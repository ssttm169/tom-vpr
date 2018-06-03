const model = require('../model/user.model');




const ctrl = {Add: {}, Update:{}, UpdateName:{} };


ctrl.Add = async (ctx, next) => {

	if (!ctx.request.body || !("userID" in ctx.request.body) ) {
		ctx.body = model.getErrMsg(1);
		return;
    }

	var options = {
        userID: ctx.request.body.userID,
        groupID: ctx.request.body.groupID,
        nickName: ctx.request.body.nickName,
        path: ctx.request.body.path
    };


	var ret = model.getErrMsg(0);
    model.Add(options)
    ctx.body = ret;
};


ctrl.Update = async (ctx, next) => {

	if (!ctx.request.body || !("userID" in ctx.request.body) ) {
		ctx.body = model.getErrMsg(1);
		return;
    }

	var options = {
		userID: ctx.request.body.userID,
        nickName: ctx.request.body.nickName,
        wechatID: ctx.request.body.wechatID || ''
    };

	var ret = model.getErrMsg(0);
    var res = await model.Update(options);
    ctx.body = ret;
};



ctrl.UpdateName = async (ctx, next) => {

	if (!ctx.request.body || !("userID" in ctx.request.body)  || !("groupID" in ctx.request.body) || !("nickName" in ctx.request.body) ) {
		ctx.body = model.getErrMsg(1);
		return;
    }

	var options = {
        userID: ctx.request.body.userID,
        groupID: ctx.request.body.groupID,
        nickName: ctx.request.body.nickName,
        wechatID: ctx.request.body.wechatID || ''
    };

	var ret = model.getErrMsg(0);
    var res = await model.UpdateName(options);
    ctx.body = ret;
};


module.exports = ctrl;
