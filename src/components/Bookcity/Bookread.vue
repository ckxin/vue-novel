<template>
    <div id="read" class="bg-light">
        <div id="main-content" class="bg-light">
            <div id="book-name" class="row mx-0 pt-3 pl-3 h5 font-weight-bold" v-if="is_name">
                {{ book_name }}
            </div>
            <div class="row mx-0 pt-3 pl-3 h5 font-weight-bold" v-else>
            </div>
            <div class="row mx-0 p-3" v-if="current_chapters.length === 0 || loading">加载中...</div>
            <div id="content" class="w-100 mx-0 px-3" v-else>
                <div style="height: 50px; width: 90%;"></div>
                <div class="col-12 py-1 text-danger" v-if="tloading">加载中...</div>
                <div v-for="(item, idx) in current_chapters" :key="idx" :id="item.chapter_id" @click="open_menu(item.chapter_id)">
                    <div class="font-weight-bold mt-2" v-html="item.chapter_title">
                        {{ item.chapter_title }}
                    </div>
                    <div v-for="(content, index) in item.chapter_content" :key="index" v-html="content">
                        {{ content }}
                    </div>
                </div>
                <div class="col-12 py-1 text-danger" v-if="bloading">加载中...</div>
                <div style="height: 50px; width: 90%;"></div>
            </div>
        </div>

        <!-- 菜单model -->
        <div id="menu" v-if="is_menu" @click="close_menu">
            <div id="menu-top" class="row fixed-top bg-dark p-3">
                <div class="col-6 text-left">
                    <img src="../../../static/img/icon/fanhui_white.png" alt="返回" width="25px" @click.stop="go_back">
                </div>
                <div class="col-6 text-right">
                    <img :src="bookmark_icon" alt="书签" width="25px" @click.stop="control_bookmark">
                </div>
            </div>
            <div id="menu-bottom" class="row fixed-bottom bg-dark py-3 px-4">
                <div class="row mx-auto w-100 bg-light" v-if="is_bg" @click.stop="select_bg">
                    <div class="col-2 px-0 py-2 text-center bg-light">日间</div>
                    <div class="col-2 px-0 py-2 text-center bg-green">护眼</div>
                    <div class="col-2 px-0 py-2 text-center bg-yellow">杏黄</div>
                    <div class="col-2 px-0 py-2 text-center bg-red">胭红</div>
                    <div class="col-2 px-0 py-2 text-center bg-blue">海蓝</div>
                    <div class="col-2 px-0 py-2 text-center bg-night">夜间</div>
                </div>
                <div class="col-12 py-2" v-if="is_bg"></div>
                <div class="col-4 px-0 py-0 text-center text-center">
                    <button class="btn btn-outline-secondary text-white px-3" @click.stop="change_bg">切换背景</button>
                </div>
                <div class="col-4 px-0 text-center">
                    <button class="btn btn-outline-secondary text-white w-75" @click.stop="down_fontsize">A-</button>
                </div>
                <div class="col-4 px-0 text-center">
                    <button class="btn btn-outline-secondary text-white w-75" @click.stop="up_fontsize">A+</button>
                </div>
                <div class="col-12 py-2"></div>
                <div class="col-3 px-0 text-center">
                    <button class="btn btn-dark px-2" @click.stop="go_prev">上一章</button>
                </div>
                <div class="col-3 px-0 text-center">
                    <button class="btn btn-dark px-3" @click.stop="open_catalogue">目录</button>
                </div>
                <div class="col-3 px-0 text-center">
                    <button class="btn btn-dark px-3" @click.stop="open_bookmark">书签</button>
                </div>
                <div class="col-3 px-0 text-center">
                    <button class="btn btn-dark px-2" @click.stop="go_next">下一章</button>
                </div>
            </div>
        </div>

        <!-- 目录model -->
        <div id="catalogue" v-if="is_catalogue" @click="close_catalogue">
            <div id="catalogue-top" class="fixed-top bg-light p-3" style="width: 330px; font-size: 18px">目录</div>
            <div id="catalogue-titles">
                <li class="bg-white p-3 border-bottom" v-for="(title, index) in title_list" 
                :key="index" :id="title.title_id"
                @click.stop="go_chapter(index)">
                    {{ title.chapter_name }}
                </li>
            </div>
        </div>
        <!-- 书签model -->
        <div id="bookmark" v-if="is_bookmark" @click="close_bookmark">
            <div id="bookmark-top" class="fixed-top bg-light p-3" style="width: 330px; font-size: 18px">书签</div>
            <div id="bookmark-none" v-if="bookmark_list.length === 0">暂无书签内容</div>
            <div id="bookmark-list" v-else>
                <div class="bg-white pl-3 border-bottom row mx-0" v-for="(bookmark, index) in bookmark_list" :key="index">
                    <div class="col-10 px-0 my-auto" @click.stop="go_bookmark(index)">
                        {{ bookmark.bookmark_data }}
                    </div>
                    <div class="col-2 px-0 py-2 text-center bg-light" @click.stop="delete_bookmark(index)">
                        <div><img src="../../../static/img/icon/shanchu.png" alt="delete" width="15px"></div>
                        <div>删除</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 提示框 -->
        <Warnmodel :warn_msg="warn_msg" v-if="is_warn"></Warnmodel>
        <!-- 返回提示框 -->
        <Alertmodel :alert_msg="alert_msg" v-if="alert_goback">
            <div id="alert-btn" class="row mx-0 mt-4">
                <div class="col-6"></div>
                <div class="col-3 text-center px-0">
                    <button class="btn btn-outline-danger px-3" @click="no_add">
                    取消
                    </button> 
                </div>
                <div class="col-3 text-center px-0">
                    <button class="btn btn-outline-success px-3" @click="add_book">
                    确定
                    </button>
                </div>
            </div>
        </Alertmodel>
    </div>    
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import axios from 'axios';
import CONF from '../../../static/js/CONF';
import Warnmodel from '../Warnmodel';
import Alertmodel from '../Alertmodel';
import deep_clone from '../../../static/js/deep_clone';

const bookmark_before = require('../../../static/img/icon/bookmark_before.png');
const bookmark_after = require('../../../static/img/icon/bookmark_after.png');
var topSpace = 0;
export default {
    name: "Bookread",
    data() {
        return {
            book_name: "",
            book_link: "",
            book_imgsrc: "",
            novel_id: "",
            title_list: [],
            current_chapters: [],
            bookmark_icon: bookmark_before,
            bookmark_list: [],
            bookmark_item: {},
            bookmark_find_index: -1,
            current_chapter_index: 0,
            warn_msg: "",
            alert_msg: "",

            is_bookshelf: false,
            is_menu: false,
            is_catalogue: false,
            is_warn: false,
            tloading: false,
            bloading: false,
            is_name: true,
            loading: false,
            is_bookmark: false,
            is_marked: false,
            is_readfinish: false,
            alert_goback: false,
            is_bg: false
        }
    },
    computed: {
        ...mapState(['novel_list'])
    },
    components: {
        Warnmodel,
        Alertmodel
    },
    methods: {
        ...mapMutations(['set_is_nav', 'set_novel_list']),
        // 禁止底层滚动
        BodyScroll(isState) {
            var bodyDoc = document.body || document.documentElement;
            if (isState) {
                topSpace = window.scrollY  //保存当前滚轮位置
                bodyDoc.style.position = 'fixed'
                bodyDoc.style.top = -topSpace + 'px'
            } else {
                bodyDoc.style.position = ''
                bodyDoc.style.top = ''
                window.scrollTo(0, topSpace ) // 回到原先位置
            }
        },
        go_back() {
            this.is_menu = false;
            if(this.is_bookshelf) {
                this.BodyScroll(false);
                this.$router.go(-1);
                return;
            }           
            this.alert_msg = "是否将本书加入书架？"
            this.alert_goback = true;
        },
        // 不添加入书架，直接返回
        no_add() {
            this.BodyScroll(false);
            this.$router.go(-1);
        },
        // 添加书架
        add_book() {
            let novel_id = new Date().getTime();
            this.novel_id = novel_id;
            let novel_name = this.book_name;
            let novel_path = this.book_link;
            let is_local = "false";
            let novel_img = this.book_imgsrc;
            let net_novel_info = {novel_id, novel_name, novel_path, is_local, novel_img};
            let net_novel_list = JSON.parse(localStorage.getItem('net_novel_list'));
            if(net_novel_list === null) {
                net_novel_list = [];
                net_novel_list.push(net_novel_info);
                localStorage.setItem('net_novel_list', JSON.stringify(net_novel_list));
            } else {
                net_novel_list.push(net_novel_info);
                localStorage.setItem('net_novel_list', JSON.stringify(net_novel_list));
            }
            let novel_list = deep_clone(this.novel_list);
            novel_list.push(net_novel_info);
            this.set_novel_list(novel_list);
            let last_read = {novel_name, novel_id};
            localStorage.setItem('last_read', JSON.stringify(last_read));
            this.is_bookshelf = true;
            this.BodyScroll(false);
            this.$router.go(-1);
        },

        // 打开菜单
        open_menu(idx) {
            let event = event || window.event;
            this.current_chapter_index = parseInt(idx.split('_')[1]);
            let current_index = parseInt(this.current_chapters[1].chapter_id.split('_')[1]);
            let scroll_top = document.body.scrollTop || document.documentElement.scrollTop;
            let bookmark_id = `bookmark_${current_index}_${scroll_top}`;
            let bookmark_data = event.target.innerText;
            if(bookmark_data.length > 20)
                bookmark_data = bookmark_data.substring(0, 20);
            this.bookmark_item = {bookmark_id, bookmark_data};
            let bookmark_find_idx = this.bookmark_list.findIndex(item => {
                return item.bookmark_id === bookmark_id;
            });
            if(bookmark_find_idx !== -1) {
                this.is_marked = true;
                this.bookmark_find_index = bookmark_find_idx;
                this.bookmark_icon = bookmark_after;
            } else {
                this.is_marked = false;
                this.bookmark_icon = bookmark_before;
            }

            let e = event || window.event;
            let click_position = e.clientY;
            let screen_height = document.body.clientHeight || document.documentElement.clientHeight;
            if(click_position>=screen_height*0.25 && click_position<=screen_height*0.75){
                window.removeEventListener("scroll", this.handle_scroll, true);
                this.BodyScroll(true);
                this.is_menu = true;
            }
        },
        // 关闭主菜单
        close_menu(event) {
            let e = event || window.event;
            let menu_top = document.getElementById("menu-top");
            let menu_bottom = document.getElementById("menu-bottom");
            if(!menu_top.contains(e.target) && !menu_bottom.contains(e.target)) {
                this.is_bg = false;
                this.is_menu = false;
                this.BodyScroll(false);
                window.addEventListener("scroll", this.handle_scroll, true);
            }
        },

        // 操作书签
        control_bookmark() {
            if(this.is_marked) {
                this.bookmark_icon = bookmark_before;
                this.bookmark_list.splice(this.bookmark_find_index, 1);
                this.is_marked = false;
            } else {
                this.bookmark_icon = bookmark_after;
                this.bookmark_list.push(this.bookmark_item);
                this.is_marked = true;
            }
        },
        // 打开小说书签
        open_bookmark(event) {
            this.is_menu = false;
            this.is_bookmark = true;
        },
         // 关闭小说书签
        close_bookmark(event) {
            let e = event || window.event;
            let bookmark_list = "";
            if(this.bookmark_list.length === 0) {
                bookmark_list = document.getElementById("bookmark-none")
            } else {
                bookmark_list = document.getElementById("bookmark-list");
            }
            let bookmark_top = document.getElementById('bookmark-top');
            if(! bookmark_list.contains(e.target) && !bookmark_top.contains(e.target)) {
                this.is_bookmark = false;
                this.BodyScroll(false);
                window.addEventListener("scroll", this.handle_scroll, true);
            }
        },
        // 跳转到指定书签
        async go_bookmark(index) {
            let bookmark_item = this.bookmark_list[index];
            let bookmark_id = bookmark_item.bookmark_id;
            let current_index = parseInt(bookmark_id.split("_")[1]);
            let scroll_top = parseInt(bookmark_id.split("_")[2]);
            this.is_bookmark = false;
            this.BodyScroll(false);
            this.loading = true;
            let current_chapters = [];
            for(let i=current_index-1; i<current_index+1; i++) {
                let get_url = this.title_list[i].chapter_link;
                let res = await axios.post(CONF.host+'/book_city/getchapter', {get_index: i, get_url});
                current_chapters.push(res.data);
            }
            this.current_chapters = current_chapters;
            this.loading = false;
            this.$nextTick(() => {
                document.body.scrollTop = scroll_top;
                document.documentElement.scrollTop = scroll_top;
                window.addEventListener("scroll", this.handle_scroll, true);
            })
        },
        // 删除小说书签
        delete_bookmark(index) {
            this.bookmark_list.splice(index, 1);
        },

        // 切换背景
        change_bg() {
            this.is_bg = !this.is_bg;
        },
        // 选择背景
        select_bg(event) {
            let e = event || window.event;
            let bg = e.target.innerText;
            let read = document.getElementById("read");
            let maincontent = document.getElementById("main-content");
            switch(bg) {
                case "日间": read.className="bg-light"; maincontent.className="bg-light"; break;
                case "护眼": read.className="bg-green"; maincontent.className="bg-green"; break;
                case "杏黄": read.className="bg-yellow"; maincontent.className="bg-yellow"; break;
                case "胭红": read.className="bg-red"; maincontent.className="bg-red"; break;
                case "海蓝": read.className="bg-blue"; maincontent.className="bg-blue"; break;
                case "夜间": read.className="bg-night"; maincontent.className="bg-night"; break;
            }
        },
        // 减小小说字体
        down_fontsize() {
            let maincontent = document.getElementById("main-content");
            let fontsize = getComputedStyle(maincontent).getPropertyValue('font-size');
            fontsize = parseInt(fontsize);
            if(fontsize <= 14) {
                return;
            }
            fontsize--;
            document.getElementById("main-content").style.fontSize = fontsize + "px";
        },
        // 增大小说字体
        up_fontsize() {
            let maincontent = document.getElementById("main-content");
            let fontsize = getComputedStyle(maincontent).getPropertyValue('font-size');
            fontsize = parseInt(fontsize);
            if(fontsize >= 40) {
                return;
            }
            fontsize++;
            document.getElementById("main-content").style.fontSize = fontsize + "px";
        },

        // 打开小说目录
        open_catalogue() {
            this.is_menu = false;
            this.is_catalogue = true;
            this.$nextTick(() => {
                let title_id = "title_" + this.current_chapter_index;
                let titles = document.getElementById("catalogue-titles").getElementsByTagName("li");
                for(let i=0; i<titles.length; i++){
                titles[i].style.color = "black";
                }
                document.getElementById(title_id).style.color = "green";
                document.getElementById(title_id).scrollIntoView();
                let scroll = document.getElementById("catalogue").scrollTop;
                let scroll_height = document.getElementById("catalogue").scrollHeight;
                let screen_height = document.body.clientHeight || document.documentElement.clientHeight;
                if(this.current_chapter_index === this.title_list.length-1) {
                    return;
                }
                document.getElementById("catalogue").scrollTop = scroll - 59;
                document.getElementById("catalogue").scrollTop;
            })
        },
        // 关闭小说目录
        close_catalogue(event) {
            let e = event || window.event;
            let catalogue_titles = document.getElementById("catalogue-titles");
            let catalogue_top = document.getElementById('catalogue-top');
            if(!catalogue_titles.contains(e.target) && !catalogue_top.contains(e.target)) {
                this.is_catalogue = false;
                this.BodyScroll(false);
                window.addEventListener("scroll", this.handle_scroll, true);
            }
        },
        // 跳转到指定章节
        async go_chapter(index) {
            this.is_catalogue = false;
            this.BodyScroll(false);
            this.loading = true;
            let current_chapters = [];
            if(index === 0) {
                for(let i=0; i<2; i++) {
                    let get_url = this.title_list[i].chapter_link;
                    let res = await axios.post(CONF.host+'/book_city/getchapter', {get_index: i, get_url});
                    current_chapters.push(res.data);
                }
            } else {
                for(let i=index-1; i<index+1; i++) {
                    let get_url = this.title_list[i].chapter_link;
                    let res = await axios.post(CONF.host+'/book_city/getchapter', {get_index: i, get_url});
                    current_chapters.push(res.data);
                }
            }
            this.current_chapters = current_chapters;
            this.loading = false;
            this.$nextTick(() => {
                let chapter_id = "chapter_" + index;
                document.getElementById(chapter_id).scrollIntoView();
                window.addEventListener("scroll", this.handle_scroll, true);
            })
        },

        // 跳转到上一章
        async go_prev() {
            this.is_menu = false;
            this.BodyScroll(false);
            let current_index = parseInt(this.current_chapters[1].chapter_id.split('_')[1]);
            if(current_index === 1) {
                document.getElementById("chapter_0").scrollIntoView();
                window.addEventListener("scroll", this.handle_scroll, true);
            } else {
                this.loading = true;
                let get_url = this.title_list[current_index-2].chapter_link;
                let res = await axios.post(CONF.host+'/book_city/getchapter', {get_index: current_index-2, get_url});
                let get_chapter = res.data;
                this.current_chapters.unshift(get_chapter);
                this.current_chapters.pop();
                this.loading = false;
                this.$nextTick(() => {
                    let chapter_id = "chapter_" + (this.current_chapter_index - 1);
                    document.getElementById(chapter_id).scrollIntoView();
                    window.addEventListener("scroll", this.handle_scroll, true);
                })
            }
        },
        // 跳转到下一章
        async go_next() {
            this.is_menu = false;
            this.BodyScroll(false);
            if(this.current_chapter_index === this.title_list.length-1) {
                this.warn_msg = "已是最后一章";
                this.is_warn = true;
                setTimeout(() => {
                    this.is_warn = false;
                    this.warn_msg = "";
                }, 1000);
                window.addEventListener("scroll", this.handle_scroll, true);
                return;
            }
            let current_index = parseInt(this.current_chapters[1].chapter_id.split('_')[1]);
            if(current_index === this.title_list.length-1) {
                document.getElementById("chapter_" + current_index).scrollIntoView();
                window.addEventListener("scroll", this.handle_scroll, true);
            } else {
                this.loading = true;
                let get_url = this.title_list[current_index+1].chapter_link;
                let res = await axios.post(CONF.host+'/book_city/getchapter', {get_index: current_index+1, get_url});
                let get_chapter = res.data;
                this.current_chapters.push(get_chapter);
                this.current_chapters.shift();
                this.loading = false;
                this.$nextTick(() => {
                    let chapter_id = "chapter_" + (this.current_chapter_index+1);
                    document.getElementById(chapter_id).scrollIntoView();
                    window.addEventListener("scroll", this.handle_scroll, true);
                })
            }
        },
        async handle_scroll() {
            if(this.bloading || this.tloading) {
                return
            }
            this.is_readfinish = false;
            let scroll_top = document.body.scrollTop || document.documentElement.scrollTop;
            let scroll_height = document.body.scrollHeight || document.documentElement.scrollHeight;
            let screen_height = document.body.clientHeight || document.documentElement.clientHeight;
            let current_index = parseInt(this.current_chapters[1].chapter_id.split('_')[1]);
            if(scroll_top === 0) {
                if(current_index === 1) {
                    this.warn_msg = "已到小说顶部";
                    this.is_warn = true;
                    setTimeout(() => {
                        this.is_warn = false;
                        this.warn_msg = "";
                    }, 1000);
                } else {
                    this.tloading = true;
                    let get_url = this.title_list[current_index-2].chapter_link;
                    let res = await axios.post(CONF.host+'/book_city/getchapter', {get_index: current_index-2, get_url});
                    let get_chapter = res.data;
                    this.current_chapters.unshift(get_chapter);
                    this.current_chapters.pop();
                    this.$nextTick(() => {
                        let chapter_id = "chapter_" + (current_index-1);
                        document.getElementById(chapter_id).scrollIntoView();
                        let scroll_top = document.body.scrollTop || document.documentElement.scrollTop;
                        let scroll_height = document.body.scrollHeight || document.documentElement.scrollHeight;
                        if(scroll_top + screen_height >= scroll_height) {
                            scroll_top = scroll_height - screen_height;
                        }
                        document.body.scrollTop = scroll_top - 60;
                        document.documentElement.scrollTop = scroll_top - 60;
                        this.tloading = false;
                    })
                }
            }

            if(scroll_top+screen_height === scroll_height) {
                if(current_index === this.title_list.length-1) {
                    this.warn_msg = "已到小说底部";
                    this.is_readfinish = true;
                    this.is_warn = true;
                    setTimeout(() => {
                        this.is_warn = false;
                        this.warn_msg = "";
                    }, 1000);
                } else {
                    this.bloading = true;
                    let get_url = this.title_list[current_index+1].chapter_link;
                    let res = await axios.post(CONF.host+'/book_city/getchapter', {get_index: current_index+1, get_url});
                    let get_chapter = res.data;
                    this.current_chapters.push(get_chapter);
                    this.current_chapters.shift();
                    this.$nextTick(() => {
                        let chapter_id = "chapter_" + (current_index+1);
                        document.getElementById(chapter_id).scrollIntoView();
                        let scroll_top = document.body.scrollTop || document.documentElement.scrollTop;
                        let scroll_height = document.body.scrollHeight || document.documentElement.scrollHeight;
                        if(scroll_top <= screen_height) {
                            scroll_top = 50;
                        } else if(scroll_top+screen_height >= scroll_height) {
                            scroll_top = scroll_top - 50;
                        } else{
                            scroll_top = scroll_top - screen_height + 30;
                        }
                        document.body.scrollTop = scroll_top;
                        document.documentElement.scrollTop = scroll_top;
                        this.bloading = false;
                    })
                }
            }
        }
    },

    async mounted() {
        this.set_is_nav(false);
        let novel_style = JSON.parse(localStorage.getItem("novel_style"));
        if(novel_style !== null) {
            let fontsize = parseInt(novel_style.fontsize);
            let bgcolor = novel_style.bgcolor;
            let read = document.getElementById("read");
            let maincontent = document.getElementById("main-content");
            read.className = bgcolor;
            maincontent.style.fontSize = fontsize + "px";
            maincontent.className = bgcolor;
        }

        let { book_name, book_link, book_imgsrc } = this.$route.query;
        this.book_name = book_name;
        this.book_link = book_link;
        if(book_imgsrc) {
            this.book_imgsrc = book_imgsrc;
        }
        let net_novel_list = JSON.parse(localStorage.getItem('net_novel_list'));
        let is_read = false;
        let novel_readinfo = {};
        if(net_novel_list === null) {
            this.is_bookshelf = false;
        } else {
            let find_idx = net_novel_list.findIndex(item => {
                return item.novel_name === book_name;
            });
            if(find_idx === -1) {
                this.is_bookshelf = false;
            } else {
                this.is_bookshelf = true;
                let novel_id = net_novel_list[find_idx].novel_id;
                this.novel_id = novel_id;
                let item = localStorage.getItem(novel_id);
                if(item !== null) {
                    is_read = true;
                    novel_readinfo = JSON.parse(item);
                }
            }
        }
        if(is_read) {
            let novel_history = novel_readinfo.novel_history;
            this.bookmark_list = novel_readinfo.novel_bookmark;
            let current_index = parseInt(novel_history.current_chapter_index);
            let scroll_top = parseInt(novel_history.scroll_position);
            let res = await axios.post(CONF.host+'/book_city/bookread', {book_link, get_index: current_index});
            let { title_list, current_chapters } = res.data;
            this.title_list = title_list;
            this.current_chapters = current_chapters;
            this.$nextTick(() => {
                document.body.scrollTop = scroll_top;
                document.documentElement.scrollTop = scroll_top;
            })
        } else {
            let res = await axios.post(CONF.host+'/book_city/bookread', {book_link, get_index: 1});
            let { title_list, current_chapters } = res.data;
            this.title_list = title_list;
            this.current_chapters = current_chapters;
        }
        window.addEventListener("scroll", this.handle_scroll, true);
    },
    watch: {
        current_chapters() {
            let current_id = this.current_chapters[1].chapter_id;
            if(current_id === "chapter_1") {
                this.is_name = true;
            } else {
                this.is_name = false;
            }
        }
    },

    beforeRouteLeave (to, from, next) {
        if(this.is_bookshelf) {
            let novel_id = this.novel_id;
            let novel_history = {};
            let current_chapter_index = parseInt(this.current_chapters[1].chapter_id.split("_")[1]);
            let scroll_position = document.body.scrollTop || document.documentElement.scrollTop;
            let read_schedule = 0;
            if(this.is_readfinish) {
                read_schedule = 100;
            } else {
                read_schedule = current_chapter_index / this.title_list.length;
            }
            novel_history = {
                current_chapter_index,
                scroll_position,
                read_schedule
            };
            let novel_bookmark = this.bookmark_list;

            localStorage.setItem(novel_id, JSON.stringify({novel_history, novel_bookmark}));
        }

        let maincontent = document.getElementById("main-content");
        let fontsize = getComputedStyle(maincontent).getPropertyValue("font-size");
        let bgcolor = maincontent.className;
        let novel_style = {fontsize, bgcolor};
        localStorage.setItem("novel_style", JSON.stringify(novel_style));
        next();
    },
    destroyed() {
        window.removeEventListener("scroll", this.handle_scroll, true);
    }
}
</script>

<style scoped>
#read {
    width: 100%;
    height: 100%;
    line-height: 40px;
}
#main-content {
    font-size: 18px;
}
#content {
    overflow-x: hidden;
    text-overflow: clip;
}

#menu {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}

#catalogue {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling : touch;
    background: rgba(128, 128, 128, 0.5);
}

#catalogue-titles {
  padding-top: 59px;
  background: white;
  width: 330px;
  height: 100%;
  opacity: 1.0;
}
#catalogue li {
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
}

#bookmark {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling : touch;
    background: rgba(128, 128, 128, 0.5);
}
#bookmark-none {
    padding-top: 70px;
    width: 330px;
    height: 100%;
    text-align: center;
    background: white;
}
#bookmark-list {
    padding-top: 59px;
    background: white;
    width: 330px;
    height: 100%;
    opacity: 1.0;
}
#bookmark li {
    text-decoration: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 18px;
}
</style>