let client = require('scp2');
let os = require('os')
let path = require('path')
const args = process.argv.slice(2)
const privateKey = args[0]==undefined?require('fs').readFileSync(os.homedir()+path.sep+'.ssh'+path.sep+'id_rsa'):args[0]
// 服务器配置  https://github.com/mscdex/ssh2
// scp2 主页 https://www.npmjs.com/package/scp2
client.scp("/tmp/blog.tar.xz",{
  port:22,
  host:'www.tpfuture.top',
  username: 'ngmng',
  privateKey: privateKey,
  path:'/tmp/'
},function(){
  console.log("ok")
},function (error) {
  console.log(error)
});

