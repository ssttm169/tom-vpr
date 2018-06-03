const fs = require("fs.promised");
const rp = require("request-promise");
const router = require("koa-router")({
	prefix: "" // 定义所有路由的前缀都已 /weapp 开头
});


const vpr = require("./controller/vpr.controller");
const wx = require("./controller/wx.controller");
const files = require("./controller/files.controller");
const user = require("./controller/user.controller");

router.post("/files/add", files.Add);
router.post("/wx/token", wx.Token);
router.post("/vpr/verify", vpr.Verify);
router.post("/vpr/upload", vpr.Upload);
router.post("/user/updatename", user.UpdateName);

router.get("/", async (ctx, next) => {


	ctx.state = {
		title: "web端声纹识别"
	};

	await ctx.render("index", {});
});

module.exports = router;
