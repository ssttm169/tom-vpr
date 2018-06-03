
const errMsg = [
    {code:'0', msg:'成功'},
    {code:'14001', msg:'错误的音频数据(一般为长度超出限制)'},
    {code:'14002', msg:'错误的编码（编码类型不支持）'},
    {code:'14003', msg:'请求参数错误（一般为audioformat错误）'},
    {code:'14004', msg:'请求token为空'},
    {code:'14005', msg:'请求配置串错误（一般为某些配置项没找到）'},
    {code:'14006', msg:'音频长度小于0（为兼容老版本而设，此版本返回14001）'},
    {code:'14007', msg:'音频数据错误'},
    {code:'14008', msg:'用户ID不存在'},
    {code:'14009', msg:'组ID不存在'},
    {code:'14010', msg:'平台协议初始化失败'},
    {code:'14011', msg:'mongodb初始化失败'},
    {code:'14012', msg:'服务处理失败 1、内部小错误(new失败) 2、其他文件格式转PCM失败'},
    {code:'14013', msg:'添加请求数据块识别失败'},
    {code:'14014', msg:'处理超时'},
    {code:'14015', msg:'读取模型文件失败'},
    {code:'14016', msg:'保存模型文件失败'},
    {code:'14017', msg:'保存模型配置文件失败'},
    {code:'14018', msg:'设置引擎参数识别'},
    {code:'14019', msg:'训练失败'},
    {code:'14020', msg:'识别失败'},
    {code:'14021', msg:'引擎相关错误号,初始化失败'},
    {code:'14022', msg:'多选一失败'},
    {code:'14023', msg:'提取特征数据失败'},
    {code:'14024', msg:'获取模型句柄失败'},
    {code:'14025', msg:'会话创建失败'},
    {code:'14026', msg:'声纹模型文件路径不存在 '},
    {code:'14027', msg:'获取模型文件列表失败'}
]



function getMsg(code){
    var rVal = '';
    for(var i=0;i<errMsg.length;i++){
        if(errMsg[i].code == code){
            rVal = errMsg[i].msg;
        }
    }
    return rVal;
}


module.exports = getMsg;
