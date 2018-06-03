///import md5 from 'js-md5';

import axios from 'axios'
import qs from 'qs'

axios.defaults.withCredentials = true; // http rquest 跨域
axios.defaults.timeout = 6000;
axios.defaults.maxRedirects = 10;
axios.defaults.retry = 2;
axios.defaults.retryDelay = 1000;
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.baseURL = 'http://api.xxxxxx.com';   // 配置接口地址


// POST传参序列化
axios.interceptors.request.use((config) => {

    if(config.method  === 'post') {
        //超时后防止再二次转码.
        /* if (typeof(config.data) == 'object' && config.data!='')
            config.data = qs.stringify(config.data);  */

        if (config.data.toString() !='[object FormData]' )
            config.data = qs.stringify(config.data);

    }
    return config;
}, (error) => {

    return Promise.reject(error);
});


/* 添加响应拦截器*/
axios.interceptors.response.use(function(response) {
	return response;
}, function(error) {

	if(error.code == 'ECONNABORTED' && error.message.indexOf('timeout') != -1) {
        let config = error.config;

		config.__retryCount = config.__retryCount || 0;

		if(config.__retryCount >= config.retry) {
				// Reject with the error
				// window.location.reload();
				return Promise.reject(error);
		}

		// Increase the retry count
		config.__retryCount += 1;

		// Create new promise to handle exponential backoff
		let backoff = new Promise(function(resolve) {
				setTimeout(function() {
					resolve();
				}, config.retryDelay || 1);
		});

		return backoff.then(function() {
				return axios(config);
		});
	}else{
		return Promise.reject(error);
	}

});



// 返回一个Promise
export function fetch(url, params = {}, type = "GET", timeout = 6000) {
    type = type.toUpperCase();



    return new Promise((resolve, reject) => {
        if(type == 'GET') {


            let dataStr = ''; //数据拼接字符串
            Object.keys(params).forEach(key => {
                dataStr += key + '=' + params[key] + '&';
            })

            if (dataStr !== '') {
                dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
                url = url + '&' + dataStr;
            }

            axios.get(url, { timeout: timeout })
                .then(response => {
                    resolve(response.data);
                }, err => {
                    reject(err);
                })
                .catch((error) => {
                    reject(error)
                })
        }else{


            axios.post(url, params, {timeout: timeout})
            .then(response => {
                resolve(response.data);
            }, err => {
                reject(err);
            })
            .catch((error) => {
                reject(error)
            })

        }

    })
}


export default {
    vpr:{
        verify(params) {
            return fetch('/vpr/verify', params, "POST", 10000)
        },

        addFile(params) {
            return fetch('/files/add', params, "POST", 10000)
        },

        updateName(params) {
            return fetch('/user/updatename', params, "POST", 10000)
        }
    },
    com: {
        wechat(params) {
            axios.defaults.params = {};
            return fetch('/wx/token', params, "POST", 10000)
        }
    }
};
