const express = require('express');
const fs = require('fs');
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const path = require('path');
const service = require('../public/js/service');
const get_search_html = require('../public/js/get_search_html');

var router = express.Router();
const basic_novel_url = "https://www.2952.cc";

async function get_html(url) { 
    try{
        let res = await service({url});
        let num = 0;
        while(res === undefined) {
            if(num >= 20) {
                throw(new Error("get_html error!"));
            }
            console.log("undefined")
            res = await service({url});
            num ++;
        }
        let buf = Buffer.from(res.data, 'binary');
        const str = iconv.decode(buf, 'gbk');
        return str;
    } catch(err) {
        console.log("get_info error:");
        console.log(err);
    }
}

router.get('/', async function(req, res) {
    let html = await get_html(basic_novel_url);
    let $ = cheerio.load(html);
    let hot_contents = [];
    let hot_content_boxs = $('.item', '#hotcontent');
    for(let i=0; i<hot_content_boxs.length; i++) {
        let img_src = $(hot_content_boxs[i]).find('.image').find('img').attr('src');
        let book_link = $(hot_content_boxs[i]).find('.image').find('a').attr('href');
        let author = $(hot_content_boxs[i]).find('dl').find('dt').find('span').text();
        let book_name = $(hot_content_boxs[i]).find('dl').find('dt').find('a').text();
        let intro = $(hot_content_boxs[i]).find('dl').find('dd').text().split('\n')[0];
        hot_contents.push({img_src, book_link, author, book_name, intro});
    }
    let type_contents = [];
    let type_contents_boxs = $(".content");
    for(let i=0; i<type_contents_boxs.length; i++) {
        let type_name = $(type_contents_boxs[i]).find('h2').text();
        let first_book_imgsrc = $(type_contents_boxs[i]).find('img').attr('src');
        let first_book_name = $(type_contents_boxs[i]).find('dt').text();
        let first_book_link = $(type_contents_boxs[i]).find('dt').find('a').attr('href');
        let first_book_intro = $(type_contents_boxs[i]).find('dd').text();
        let first_book_info = {first_book_imgsrc, first_book_name, first_book_link, first_book_intro};
        let other_books_info = [];
        let other_books_list = $(type_contents_boxs[i]).find('li');
        for(let j=0; j<other_books_list.length; j++) {
            let other_book_name = $(other_books_list[j]).find('a').text();
            let other_book_link = $(other_books_list[j]).find('a').attr('href');
            let other_book_author = $(other_books_list[j]).text().split('/')[1];
            other_books_info.push({other_book_name, other_book_link, other_book_author});
        }
        type_contents.push({type_name, first_book_info, other_books_info: other_books_info.slice(0, 5)});
    }
    res.json({hot_contents, type_contents})
});

router.post("/search", async (req, res) => {
    let { searchkey, searchtype } = req.body;
    let html = await get_search_html({
        searchkey,
        searchtype
    });
    let $ = cheerio.load(html);
    let title = $('title');
    let search_res = [];
    if(title.text() === "二九小说网") {
        let res_items = $('#nr');
        if(res_items.text() !== "") {
            for(let i=0; i<res_items.length; i++) {
                let item = $(res_items[i]).find('td');
                let book_name = $(item[0]).text();
                let book_link = $(item[0]).find('a').attr('href');
                let latest_chapter = $(item[1]).text();
                let latest_chapter_href = basic_novel_url + '/b' + $(item[1]).find('a').attr('href').split("_").join('/');
                let author = $(item[2]).text();
                let latest_time = new Date(parseInt($(item[4]).text()) * 1000).toLocaleString();
                search_res.push({book_name, book_link, latest_chapter, latest_chapter_href, author, latest_time});
            }
            res.json({status: true, search_res});
        } else {
            res.json({status: false})
        }   
    } else {
        let chapter_list = $('#list').find('li');
        let relative_path = $(chapter_list[0]).find('a').attr('href').split('/');
        relative_path = relative_path.slice(0, relative_path.length-1);

        let book_name = $('#info').find('h1').text();
        let book_link = basic_novel_url + relative_path.join('/') + '/index.html';
        let latest_chapter = $(chapter_list[chapter_list.length-1]).text();
        let latest_chapter_href = $(chapter_list[chapter_list.length-1]).find('a').attr('href');
        let author = $($('#info').find('p')[0]).text().split('：')[1];
        let latest_time = $($('#info').find('p')[2]).text();
        search_res.push({book_name, book_link, latest_chapter, latest_chapter_href, author, latest_time})
        res.json({status: true, search_res});
    }
});

router.post('/booktype', async (req, res) => {
    let url = req.body.url;
    let html = await get_html(url);
    let $ = cheerio.load(html);
    let type_list_li = $('.l').find('li');
    let type_list = [];
    for(let i=0; i<type_list_li.length; i++) {
        let book_name = $($(type_list_li[i]).find('a')[0]).text();
        let book_link = $($(type_list_li[i]).find('a')[0]).attr('href');
        let latest_chapter = $($(type_list_li[i]).find('a')[1]).text();
        let book_author = $(type_list_li[i]).find('.s5').text();
        type_list.push({book_name, book_link, latest_chapter, book_author});
    }
    let list_page_num = parseInt($('#pagestats').text().split('/')[1]);
    let basic_typeurl = $('.first').attr('href').split('-')[0]+"-";
    res.json({type_list, list_page_num, basic_typeurl});
});

router.post('/ranklist', async (req, res) => {
    let url = req.body.url;
    let html = await get_html(url);
    let $ = cheerio.load(html);
    let rank_box = $('.b4')[1];
    let rank_list_li = $(rank_box).find('li');
    let rank_list = [];
    for(let i=0; i<rank_list_li.length; i++) {
        let book_name = $(rank_list_li[i]).find('a').text();
        let book_link = $(rank_list_li[i]).find('a').attr('href');
        rank_list.push({book_name, book_link});
    }
    if(url.includes("allvote")) {
        rank_list = rank_list.slice(1, 21);
    } else {
        rank_list = rank_list.slice(0, 20);
    }
    res.json(rank_list)
});

router.post('/endbook', async (req, res) => {
    let url = req.body.url;
    let html = await get_html(url);
    let $ = cheerio.load(html);
    let hot_box = $('#hotcontent').find('.item');
    let hot_contents = [];
    for(let i=0; i<hot_box.length; i++) {
        let book_imgsrc = $(hot_box[i]).find('img').attr('src');
        let book_name = $(hot_box[i]).find('dt').find('a').text();
        let book_link = $(hot_box[i]).find('dt').find('a').attr('href');
        let book_author = $(hot_box[i]).find('span').text();
        hot_contents.push({book_imgsrc, book_name, book_link, book_author});
    }
    let endbook_list_li = $('.l').find('li');
    let endbook_list = [];
    for(let i=0; i<endbook_list_li.length; i++) {
        let book_name = $($(endbook_list_li[i]).find('a')[0]).text();
        let book_link = $($(endbook_list_li[i]).find('a')[0]).attr('href');
        let latest_chapter = $($(endbook_list_li[i]).find('a')[1]).text();
        let book_author = $(endbook_list_li[i]).find('.s5').text();
        endbook_list.push({book_name, book_link, latest_chapter, book_author});
    }
    let list_page_num = parseInt($('#pagestats').text().split('/')[1]);
    let basic_endurl = $('.first').attr('href').split('page=')[0]+"page=";
    res.json({hot_contents, endbook_list, list_page_num, basic_endurl})
});


router.post('/bookdetail', async(req, res) => {
    try {
        let book_link = req.body.book_link;
        let html = await get_html(book_link);
        let $ = cheerio.load(html);
        let book_imgsrc = basic_novel_url + $('#fmimg').find('img').attr('src');
        let chapter_list = $('#list').find('li');
        let latest_chapter = $(chapter_list[chapter_list.length-1]).text().split('.')[1];
        let book_author = $($('#info').find('p')[0]).text().split('：')[1];
        let latest_time = $($('#info').find('p')[2]).text().split(" ")[0];
        let book_intro = $('#intro').text();
        res.json({book_imgsrc, latest_chapter, book_author, latest_time, book_intro})
    } catch(err) {
        console.log("detail err", err);
    }  
});


router.post('/bookread', async (req, res) => {
    let url = req.body.book_link;
    let get_index = parseInt(req.body.get_index);
    let html = await get_html(url);
    let $ = cheerio.load(html);
    let list_li = $('#list').find('li');
    let title_list = [];
    for(let i=0; i<list_li.length; i++) {
        let chapter_name = $(list_li[i]).text().split('.')[1];
        let chapter_link = basic_novel_url + $(list_li[i]).find('a').attr('href');
        title_list.push({title_id: 'title_'+i, chapter_name, chapter_link});
    }
    let current_chapters = [];
    for(let i=get_index-1; i<get_index+1; i++) {
        let content_html = await get_html(title_list[i].chapter_link);
        let $$ = cheerio.load(content_html, {decodeEntities: false});
        let chapter_title = $$('.bookname').find('h1').text();
        let content_box = $$('#content');
        let chapter_content = content_box.html().split('<br><br>');
        current_chapters.push({chapter_id: 'chapter_'+i, chapter_title, chapter_content});
    }
    res.json({title_list, current_chapters});  
});

router.post('/getchapter', async (req, res) => {
    try {
        let { get_index, get_url } = req.body;
        let html = await get_html(get_url);
        let $ = cheerio.load(html, {decodeEntities: false});
        let chapter_title = $('.bookname').find('h1').text();
        let content_box = $('#content');
        let chapter_content = content_box.html().split('<br><br>');
        res.json({chapter_id: 'chapter_'+get_index, chapter_title, chapter_content});
    } catch(err) {
        console.log("getchapter error:");
        console.log(err);
    }   
});

router.get('/download', (req, res) => {
    // let { book_link } = req.body;
    res.sendFile('../public/TXT/何以.txt');
})

module.exports = router;
