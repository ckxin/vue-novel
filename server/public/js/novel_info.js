const fs = require("fs");
const path = require('path');

const rootPath = path.resolve(__dirname, "..");
const novel_basic_path = path.join(rootPath, "TXT");
const filesName = fs.readdirSync(novel_basic_path);

let novel_info = [];
for(let i=0; i<filesName.length; i++) { 
    let novel_name = filesName[i].split('.txt')[0];
    let novel_path = path.join(novel_basic_path, filesName[i]);
    let novel_id = fs.statSync(novel_path).birthtime.getTime();
    novel_info.push({novel_id, novel_name, novel_path, is_local: "true"});
}
function sort_novels(novel1, novel2) {
    let id1 = parseInt(novel1.novel_id);
    let id2 = parseInt(novel2.novel_id);
    return id2 - id1
}
novel_info.sort(sort_novels);
module.exports = novel_info;
