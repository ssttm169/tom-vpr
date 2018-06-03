<template>
	<div>
		<div class="vpr">

			<div class="flex">
				<i class="iconfont " v-bind:class=" {'icon-tingzhi':playing, 'icon-bofang':!playing } " @click="onPlay"></i>
			</div>

			<div class="flex">
				<i class="iconfont icon-luyin" @click="showWord"></i>
			</div>


		</div>
		<x-dialog v-model="isShow">
			<div class="msgbox">
				<div class="title">长按录音, 读以下文字</div>
				<div class="content">
					<span>小</span>
					<span>样</span>
					<span>吃</span>
					<span>了</span>
					<span>麻</span>
					<span>辣</span>
					<span>烫</span>
					<span>还</span>
					<span>想</span>
					<span>跑</span>
					<span>吗</span>
				</div>
				<div>
					<v-touch style="width: 50px;height: 50px;margin: 15px auto;margin-bottom: 0px;" v-on:press="onTap"  v-on:panend="offTap"  v-on:pressup="offTap" >
						<i class="iconfont icon-luyin" ></i>
					</v-touch>
				</div>
			</div>
		</x-dialog>
		<div v-transfer-dom>
			<loading :show="showLoading" :text="textLoading" ></loading>
		</div>
	</div>
</template>

<script>
import api from "../../data/index";
import wx from "weixin-js-sdk";
import { XDialog, Loading, TransferDomDirective as TransferDom } from "vux";

var START, END, recordTimer, limitTimer, limit = 0;
export default {
	directives: {
		TransferDom
	},

	data() {
		return {
			textLoading:'剩余5秒',
			countDown:4,
			playing: false,
			media_length: 0,
			showLoading: false,
			isShow: false,
			btnTxt: "录音",
			voice: {
				localId: ""
			},
			recording: false,
			headers: {},
			wechatData: {
				title: "分享标题",
				desc: "分享描述",
				link: window.location.href,
				img: "http://www.xxxx.com/xxx.png",  //分享图片C
				isCode: false
			}
		};
	},
	components: {
		XDialog,
		Loading
	},

	methods: {
		showWord() {
			this.isShow = true;
		},

		onPlay() {
			if (this.playing) return;
			if (this.voice.localId == "") {
				this.$vux.toast.text("你还没有录音!", "top");
				return;
			}
			var that = this;
			this.playing = true;
			wx.playVoice({
				localId: that.voice.localId // 需要播放的音频的本地ID，由stopRecord接口获得
			});
		},

		onTap() {


			console.log("onTap");
			var that = this;
			clearInterval(limitTimer);

			limit = 0;
			that.countDown = 4;
			that.textLoading = '剩余5秒';

			this.showLoading = true;

			if (this.recording) {
				this.offTap();
			} else {
				this.recording = true;

				limitTimer = setInterval(function(){
					limit++;
					that.textLoading = '剩余' + that.countDown +'秒';
					that.countDown = that.countDown - 1;
					if(limit > 4 ){
						clearInterval(limitTimer);
						that.offTap();
					}
				},1000);


				recordTimer = setTimeout(function() {
					wx.startRecord({
						success: function() {
							localStorage.rainAllowRecord = "true";
						},
						cancel: function() {
							alert("用户拒绝授权录音");
						}
					});
				}, 300);
			}
		},

		offTap() {
			clearInterval(limitTimer);
			//this.btnTxt = "录音";
			var that = this;
			console.log("offTap");
			this.showLoading = false;
			//that.$vux.loading.hide()
			this.recording = false;
			//return;
			var END = new Date().getTime();

			if (END - START < 300) {
				END = 0;
				START = 0;
				//小于300ms，不录音
				clearTimeout(recordTimer);
			} else {
				wx.stopRecord({
					success: function(res) {
						that.voice.localId = res.localId;
						that.isShow = false;
						that.uploadVoice();
					},
					fail: function(res) {
						console.log(JSON.stringify(res));
						alert(JSON.stringify(res));
					}
				});
			}
		},

		uploadVoice() {
			var that = this;
			//调用微信的上传录音接口把本地录音先上传到微信的服务器
			//不过，微信只保留3天，而我们需要长期保存，我们需要把资源从微信服务器下载到自己的服务器
			wx.uploadVoice({
				localId: that.voice.localId, // 需要上传的音频的本地ID，由stopRecord接口获得
				isShowProgressTips: 1, // 默认为1，显示进度提示
				success: async res => {
					console.log("上传结果", res);

					that.$vux.loading.show({text: '正在处理'})
					var vres = await api.vpr.verify(res);
					that.$vux.loading.hide()
					if(vres.code == '0'){

						//找不到记录，就注册用户
						if(vres.data.code == '1' ){
							that.$vux.confirm.prompt("请输入你的名称", {
								title: "设置你的名称",
								async onConfirm(cval) {

									var nData = {
										userID: vres.data.userID,
										groupID: vres.data.groupid,
										nickName: cval
									}
									var nres = await api.vpr.updateName(nData);
									that.$vux.toast.text(nres.message, "top");
								}
							});

						}else{
							that.$vux.alert.show({
								title: "信息提示",
								content: vres.message
							});
						}

					}else{
						that.$vux.alert.show({
							title: "信息提示",
							content: vres.message || vres.error
						});
					}

				}
			});
		},

		async pickFile(e) {
			var params = new FormData();
			var form = document.getElementById("form1");
			var files = e.target.files || e.dataTransfer.files;
			var formdata = new FormData();
			formdata.append("file", files[0]);
			api.axios.defaults.params = {};
			var res = await api.vpr.verify(formdata);
			console.log(res);
		},

		async wx_init() {
			var that = this;
			var data = { url: window.location.href.split("#")[0] };


			//获取签名，注册微信事件
			await api.com.wechat(data).then(function(res) {
				wx.config({
					debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
					appId: res.appId, // 必填，公众号的唯一标识
					timestamp: res.timestamp, // 必填，生成签名的时间戳
					nonceStr: res.nonceStr, // 必填，生成签名的随机串
					signature: res.signature, // 必填，签名，见附录1
					jsApiList: [
						"onMenuShareTimeline",
						"onMenuShareAppMessage",
						"uploadVoice",
						"startRecord",
						"playVoice",
						"stopRecord",
						"onVoicePlayEnd"
					] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				});

				wx.ready(function() {
					wx.onMenuShareAppMessage({
						title: that.wechatData.title, // 分享标题
						desc: that.wechatData.desc, // 分享描述
						link: that.wechatData.link || window.location.href, // 分享链接
						imgUrl: that.wechatData.img, // 分享图标
						success: function() {}
					});

					wx.onMenuShareTimeline({
						title: that.wechatData.title, // 分享标题
						link: that.wechatData.link || window.location.href, // 分享链接
						imgUrl: that.wechatData.img, // 分享图标
						success: function() {}
					});

					wx.onVoicePlayEnd({
						success: function(res) {
							that.playing = false;
							that.voice.localId = res.localId; // 返回音频的本地ID
						}
					});

					//提前提示用户授权录音功能， 为了避免 正式开始录音时，同时提示授权，此时录音功能状态已经失控。
					if (!localStorage.rainAllowRecord || localStorage.rainAllowRecord !== "true" ) {
						wx.startRecord({
							success: function() {
								localStorage.rainAllowRecord = "true";
								wx.stopRecord();
							},
							cancel: function() {
								alert("用户拒绝授权录音");
							}
						});
					}
				});
			});


		}
	},

	mounted() {
		var vm = this;
		document.title = "Web端声纹识别";


		//去掉微信 长按 弹出复制的按钮
		document.oncontextmenu = function(e) {
			//或者return false;
			e.preventDefault();
		};

		//初始化 微信jssdk
		vm.wx_init();
	}
};

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function(fmt) {
	//author: meizz
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		S: this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(
			RegExp.$1,
			(this.getFullYear() + "").substr(4 - RegExp.$1.length)
		);
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(
				RegExp.$1,
				RegExp.$1.length == 1
					? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length)
			);
	//fmt = fmt.replace(RegExp.$1,  o[k]);
	return fmt;
};
</script>

<style lang="scss" scoped>
.vpr {
	width: 200px;
	position: absolute;
	transform: translate(-50%, -50%);
	left: 50%;
	top: 50%;
	font-size: 0;
	i {
		font-size: 50px;
		color: #333;
		user-select: none;
	}
	.flex {
		width: 50%;
		display: inline-block;
		text-align: center;
	}
}

.msgbox {
	padding: 20px 0px;
	.title {
		font-size: 15px;
	}
	.content {
		margin-top: 10px;
		font-size: 30px;
		span {
			color: brown;
			display: inline-block;
			margin: 0px 5px;
			border-bottom: 1px dashed brown;
		}
	}
	i {
		font-size: 50px;
		user-select: none;
	}
}
</style>
