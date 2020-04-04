// function host(){
//     var interfaces = require('os').networkInterfaces();
//     for(var devName in interfaces){
//         var iface = interfaces[devName];
//         for(var i=0;i<iface.length;i++){
//             var alias = iface[i];
//             if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
//                 return `http://${alias.address}:3030`;
//             }
//         }
//     }
// }
  

export default {
    // host: "http://i7txfn.natappfree.cc"
    // host: "http://127.0.0.1:3030"
    // host: "http://192.168.0.109:3030"
    // host: "http://192.168.0.108:3030"
    host: "http://192.168.1.104:3030"
}