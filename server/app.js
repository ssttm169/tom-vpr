const Koa = require("koa");
const app = new Koa();
//const koaBody = require("koa-body");
const debug = require("debug")("koa-weapp-demo");
const response = require("./middlewares/response");
const bodyParser = require("./middlewares/bodyparser");
const config = require("./config");
const cors = require("koa-cors");
const logger = require("koa-logger");
const views = require("koa-views");

/* const redis = require('./nredis.js');
redis.connect(); */
//跨域请求
/* app.use(
	cors({
		origin: "http://client.xxxx.com",  //允许请求的网址
		maxAge: 5,
		credentials: true,
		allowMethods: ["OPTIONS", "GET", "POST", "DELETE"],
		allowHeaders: ['Content-Type', 'Accept']
	})
);
 */

// 使用响应处理中间件
app.use(response);

// 解析请求体
app.use(bodyParser());

//日志adsfsadf
app.use(logger());



app.use(require("koa-static")(__dirname + "/public"));

// 引入路由分发
const router = require("./routes");

//view
app.use(
	views(__dirname + "/views", {
		extension: "ejs"
	})
);

app.use(router.routes());



// 启动程序，监听端口
app.listen(config.port, () => debug(`listening on port ${config.port}`));
