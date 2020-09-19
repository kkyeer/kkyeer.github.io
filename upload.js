let client = require('scp2');
let os = require('os')
let path = require('path')

// 服务器配置  https://github.com/mscdex/ssh2
// scp2 主页 https://www.npmjs.com/package/scp2
client.scp("public",{
  port:22,
  host:'www.tpfuture.top',
  username: 'ngmng',
  privateKey: require('fs').readFileSync(os.homedir()+path.sep+'.ssh'+path.sep+'id_rsa'),
  path:'/home/ngmng/data/dist/'
},function (error) {
  console.log(error)
});

