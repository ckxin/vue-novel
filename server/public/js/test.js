const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const get_search_html = require('./get_search_html');
const service = require('./service');

const basic_novel_url = "https://www.2952.cc";

async function get_html(url) { 
    try{
        let res = await service({url});
        while(res === undefined) {
            res = await service({url});
        }
        let buf = Buffer.from(res.data, 'binary');
        const str = iconv.decode(buf, 'gbk');
        return str;
    } catch(err) {
        console.log("get_info error:");
        console.log(err);
    }
}

async function get_book_content() {
    let url = "https://www.2952.cc/b/0/463/index.html"
    let html = await get_html(url);
    let $ = cheerio.load(html);
    let list_li = $('#list').find('li');
    let chapter_list = [];
    for(let i=0; i<list_li.length; i++) {
        let chapter_name = $(list_li[i]).text().split('.')[1];
        let chapter_link = basic_novel_url + $(list_li[i]).find('a').attr('href');
        chapter_list.push({chapter_id: 'title_'+i, chapter_name, chapter_link});
    }
    let content_html = await get_html(chapter_list[0].chapter_link);
    let $$ = cheerio.load(content_html, {decodeEntities: false});
    let chapter_title = $$('.bookname').find('h1').text();
    let content_box = $$('#content');
    let content_arr = content_box.html().split('<br><br>');
    console.log(chapter_title);
    
}

get_book_content();