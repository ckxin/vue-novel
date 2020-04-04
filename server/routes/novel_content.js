var express = require('express');
const iconv = require("iconv-lite");
const fs = require("fs");
const jschardet = require("jschardet");
const path = require('path');
var router = express.Router();
var novel_info = require('../public/js/novel_info');

const rootPath = path.resolve(__dirname, "..");
const novel_content_path = path.join(rootPath, "public", "data", "novel_data");

// 查找指定字符串并返回内容
function find_str(str, key) {
  let res = "";
  let idx = str.indexOf(key);
  if(idx === -1) {
      return res;
  } else {
      if(key.length+40 >= str.length){
          res= str.split(key).join(`<span style="color:green;">${key}</span>`);
          return res;
      } else {
          if(idx < 20) {
              let tmp_str1 = str.substring(0, idx);
              let tmp_str2 = str.substr(idx+key.length, 40-tmp_str1.length);
              res = tmp_str1+'<span style="color:green;">'+key+"</span>"+tmp_str2;
          } else if(idx+key.length+20>=str.length){
              let tmp_str1 = str.substr(idx+key.length);
              let tmp_str2 = str.substring(idx-40+tmp_str1.length, idx);
              res = tmp_str2+'<span style="color:green;">'+key+"</span>"+tmp_str1;
          } else {
              let tmp_str1 = str.substring(idx-20, idx);
              let tmp_str2 = str.substr(idx+key.length, 20);
              res = tmp_str1+'<span style="color:green;">'+key+"</span>"+tmp_str2;
          }
          return res;
      }
  }   
}

/* GET novel content */
router.post('/', function(req, res) {
  let { novel_id, current_chapter_index } = req.body;
  var novle_files = fs.readdirSync(novel_content_path);
  let novel_item = novle_files.find(item => {
    return item === novel_id + ".json";
  });
  if(novel_item === undefined) {
    let novel_info_item = novel_info.find(item => {
      return item.novel_id === novel_id;
    });
    
    let novel_path = novel_info_item.novel_path;
    let buf = fs.readFileSync(novel_path);
    const encode = jschardet.detect(buf).encoding;
    let str = iconv.decode(buf, encode).toString();
    let lines = str.split("\n");
    let lines_size = lines.length;
    for(let i=0; i<lines_size; i++) {
        lines[i] = {
            data: lines[i],
            id_index: `line_${i}`
        }
    }
    const reg1 = /^\s*第\s*[零两一二三四五六七八九十百千0123456789]+\s*[章节卷集部篇回幕]/;
    const reg2 = /^\s*(正文).*[零两一二三四五六七八九十百千0123456789]+\s*[章节卷集部篇回幕]*/;
    let start = 0;
    let chapter_idx = 0;
    let chapter_title = [];
    let chapter_content = [[]];
    lines.forEach((item, idx, line_arr) => {
        if(reg1.test(item.data) || reg2.test(item.data)) {
            chapter_content[chapter_idx] = line_arr.slice(start, idx);
            chapter_title[chapter_idx] = item;
            chapter_idx++;
            start = idx;
        }
    });

    chapter_content[chapter_idx] = lines.slice(start);

    if(chapter_content[0] === []) {
        chapter_content.shift();
    } else {
        chapter_title.unshift({data:"序章", id_index:'line_-1'});
    }

    let chapters = [];
    let chapter_size = chapter_title.length;
    for(let i=0; i<chapter_size; i++) {
        let chapter = {
            chapter_index: `chapter_${i}`,
            chapter_title: chapter_title[i],
            chapter_content: chapter_content[i]
        };
        chapters.push(chapter);
    }
    fs.writeFileSync(path.join(novel_content_path, `${novel_id}.json`), JSON.stringify(chapters));
    if(chapters.length >= 3) {
      res.json({current_chapters: chapters.slice(0, 3), chapter_num: chapters.length});
    } else {
      res.json({current_chapters: chapters, chapter_num: chapters.length});
    }
  } else {
    let chapters = require(path.join(novel_content_path, `${novel_id}.json`));
    let chapter_num = chapters.length;
    let current_chapters = [];
    if(chapter_num < 3) {
      current_chapters = chapters;
    } else {
      if(current_chapter_index === 0) {
        current_chapters = chapters.slice(0, 3);
      } else if(current_chapter_index === chapter_num-1) {
        current_chapters = chapters.slice(chapter_num-3, chapter_num);
      } else {
        current_chapters = chapters.slice(current_chapter_index-1, current_chapter_index+2);
      }
    }
    res.json({current_chapters, chapter_num});
  }
});

router.post('/chapter_titles', (req, res) => {
  let { novel_id } = req.body;
  let chapters = require(path.join(novel_content_path, `${novel_id}.json`));
  let chapter_titles = [];
  for(let i=0; i<chapters.length; i++) {
    chapter_titles.push(chapters[i].chapter_title);
  }
  res.json(chapter_titles);
});

router.post('/search', (req, res) => {
  let novel_id = req.body.novel_id;
  let key = req.body.search_key;
  let chapters = require(path.join(novel_content_path, `${novel_id}.json`));
  let search_res = [];
  let item = {};
  for(let i=0; i<chapters.length; i++) {
    item = chapters[i];
    let tmp_res = find_str(item.chapter_title.data, key);
    if(tmp_res !== "") {
      search_res.push({
          chapter_index: i,
          id_index: item.chapter_title.id_index,
          data: tmp_res
      });
    }
    let ele = {};
    for(let j=0; j<item.chapter_content.length; j++) {
      ele = item.chapter_content[j];
      tmp_res = find_str(ele.data, key);
      if(tmp_res !== "") {
        search_res.push({
            chapter_index: i,
            id_index: ele.id_index,
            data: tmp_res
        });
      }
    }
  }
  
  res.json(search_res);
});

module.exports = router;
