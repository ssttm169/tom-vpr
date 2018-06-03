import Vue from 'vue';
import VueRouter from 'vue-router';
import Index from '../pages/index'

//import break_egg_with_fortune_rule from '../pages/break_egg_with_fortune/rule.vue'
//import routes_json from './routes_json'


Vue.use(VueRouter);

const self = this;
const routes = [
    { path: '/index', name: 'home', component: Index },
    { path: '*', name: 'home', component: Index },
    { path: '/', name: 'home', component: Index },


    {
        path: '/vpr',
        name: 'vpr',
        component: resolve => require(['../pages/vpr/index'], resolve)
    }
]



//console.log(routes)
const router = new VueRouter({
    //mode: 'hash', //这样url就没有/#/XXX,而是常见的url形式
    mode:'history', //这样url就没有/#/XXX,而是常见的url形式
    routes: routes, // short for routes: routes
    scrollBehavior(to, from, savedPosition) {
        // return 期望滚动到哪个的位置
        return { x: 0, y: 0 }
    }
});


export default router
