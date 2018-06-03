

let baseUrl = 'http://api.xxxxxx.com';
let routerMode = 'history';


if(process.env.NODE_ENV == 'production'){
    baseUrl = 'http://api.xxxxxx.com';
}

export {
	baseUrl,
	routerMode
}
