// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
//import global from "./config/global";
import router from "./config/router";
//import store from "./store/index";
var VueTouch = require("vue-touch");

//import "babel-polyfill";

//import VueAwesomeSwiper from "vue-awesome-swiper";

// require styles
//import "swiper/dist/css/swiper.css";

import  { AlertPlugin, ToastPlugin, ConfirmPlugin, LoadingPlugin  } from 'vux'


Vue.use(VueTouch, {name: 'v-touch'})

Vue.use(AlertPlugin)
Vue.use(ToastPlugin)
Vue.use(ConfirmPlugin)
Vue.use(LoadingPlugin)

//Vue.use(VueAwesomeSwiper);
Vue.use(VueTouch);

Vue.config.productionTip = false;

Vue.prototype.global = global;

/* router.beforeEach(function (to, from, next) {

	let { href, protocol, host, search, hash } = window.location
	//const pathname = '/frontend/' // 解决支付路径问题添加的前缀，替换成你的
	search = search || '?'
	hash = hash || '#/'
	//let newHref = `${protocol}//${host}${pathname}${search}${hash}`
	let newHref = `${protocol}//${host}/${search}${hash}`
	if (newHref !== href){
		window.location.replace(newHref)
		//console.log(newHref)
		//console.log(window.location.href)
	}
	//vuex_store.commit('updateLoadingStatus', {isLoading: true})
	next();
}) */

/* eslint-disable no-new */

new Vue({
	el: "#app",
	router,
	//store,
	template: "<App/>",
	components: { App }
});
