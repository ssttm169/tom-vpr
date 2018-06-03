const files = require("../model/files.model");

const ctrl = {Add: {}};

ctrl.Add = async (ctx, next) => {
	if (
		!ctx.request.body ||
		!("errMsg" in ctx.request.body) ||
		!("serverId" in ctx.request.body)
	) {
		ctx.body = files.getErrMsg(1);
		return;
    }

	var options = {
        errMsg: ctx.request.body.errMsg,
        serverId: ctx.request.body.serverId
    };

	var ret = files.getErrMsg(0);
	ret.message = await files.add(options);
	ctx.body = ret;
};



module.exports = ctrl;
