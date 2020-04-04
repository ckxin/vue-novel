<template>
    <div id="end">
        <div id="rank-top" class="fixed-top row bg-light py-3">
            <div class="col-3 pl-4">
                <img src="../../../static/img/icon/fanhui_grey.png" alt="返回" width="20px" @click="go_back">
            </div>
            <div class="col-6 text-center font-weight-bold text-secondary" style="font-size: 18px">完本小说</div>
            <div class="col-3"></div>
        </div>

        <div class="row mx-0 p-3 bg-warning" v-if="hot_contents.length === 0">
            加载中...
        </div>
        <div v-else>
            <div id="hot-content-wrapper">
                <div class="pl-3 text-black-50 font-weight-bold w-100 py-2" style="font-size: 17px;">
                    <span class="bg-danger" style="padding: 1px 2px"></span>
                    <span class="px-1"></span>
                    热门完本
                </div>
                <div id="hot-content" class="p-3 bg-light">
                    <div class="d-inline-block px-1" v-for="(item, idx) in hot_contents" :key="idx" @click="go_bookdetail(item.book_name, item.book_link)">
                        <div id="book-img">
                            <img :src="item.book_imgsrc" :alt="item.book_name" width="80px" height="100px">
                        </div>
                        <div id="book-name">
                            {{ item.book_name }}
                        </div>
                        <div id="book-author" class="text-secondary">
                            {{ item.book_author }}
                        </div>
                    </div>
                </div>
            </div>

            <div id="end-list" style="background: #f5f5f5">
                <div class="row mx-0 pl-3 text-black-50 font-weight-bold py-2 bg-white" style="font-size: 17px;">
                    <span class="bg-danger" style="padding: 1px 2px"></span>
                    <span class="px-1"></span>
                    完本列表
                </div>
                <div class="mx-3 py-3 border-bottom" v-for="(item, idx) in endbook_list" :key="idx" @click="go_bookdetail(item.book_name, item.book_link)">
                    <div id="book-name" class="w-100 one-line h6 font-weight-bold">{{ item.book_name }}</div>
                    <div id="book-author" class="w-100 one-line text-success">{{ item.book_author }}</div>
                    <div id="latest-chapter" class="w-100 one-line text-black-50">{{ item.latest_chapter }}</div>
                </div>
                <div class="row mx-auto bg-white p-3" v-if="loading">加载中...</div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex';
import axios from 'axios';
import CONF from '../../../static/js/CONF';

const first_url = "https://www.2952.cc/wanben/1.html";
export default {
    name: "Endbook",
    data() {
        return {
            hot_contents: [],
            endbook_list: [],
            list_page_num: 0, 
            basic_endurl: "",
            current_list_page: 1,

            loading: false
        }
    },
    methods: {
        ...mapMutations(['set_is_nav']),
        go_back() {
            this.$router.push('/bookcity');
        },
        go_bookdetail(book_name, book_link) {
            this.$router.push({path: "/bookdetail", query: {book_name, book_link}});
        },
        async handel_scroll() {
            if(this.loading) {
                return;
            }
            let screen_height = document.body.clientHeight || document.documentElement.clientHeight;
            let scroll_height = document.body.scrollHeight || document.documentElement.scrollHeight;
            let scroll_top = document.body.scrollTop || document.documentElement.scrollTop;
            if(scroll_top+screen_height === scroll_height) {
                if(this.current_list_page < this.list_page_num) {
                    this.loading = true;
                    this.current_list_page++;
                    let url = this.basic_endurl + this.current_list_page;
                    let res = await axios.post(CONF.host+"/book_city/endbook", {
                        url
                    });
                    let endbook_list = res.data.endbook_list;
                    this.endbook_list = this.endbook_list.concat(endbook_list);
                    this.loading = false;
                }
            }
        },
    },
    beforeRouteEnter (to, from, next) {
        if(from.path === '/bookdetail') {
            sessionStorage.setItem("is_detailback", "true");
        } else {
            sessionStorage.setItem("is_detailback", "false");
        }
        next();
    },
    async activated() {
        this.set_is_nav(false);
        let is_detailback = sessionStorage.getItem("is_detailback");
        sessionStorage.removeItem("is_detailback");
        if(is_detailback === "true") {
            let scroll = parseInt(sessionStorage.getItem("scroll"));
            sessionStorage.removeItem("scroll");
            document.body.scrollTop = scroll;
            document.documentElement.scrollTop = scroll;
            window.addEventListener('scroll', this.handel_scroll, true);
            return;
        }
        this.hot_contents = [];
        this.endbook_list = [];
        this.current_list_page = 1;
        let res = await axios.post(CONF.host+"/book_city/endbook", {
            url: first_url
        });
        this.hot_contents = res.data.hot_contents;
        this.endbook_list = res.data.endbook_list;
        this.list_page_num = res.data.list_page_num;
        this.basic_endurl = res.data.basic_endurl;
        window.addEventListener('scroll', this.handel_scroll, true); 
    },  
    beforeRouteLeave (to, from, next) {
        let scroll = document.body.scrollTop || document.documentElement.scrollTop;
        sessionStorage.setItem("scroll", scroll);
        next();
    },
    deactivated() {
        window.removeEventListener('scroll', this.handel_scroll, true);
    },
}
</script>

<style scoped>
#end {
    padding-top: 59px;
}
#hot-content-wrapper {
    height: 217px;
    overflow: hidden;
}
#hot-content {
    height: 189px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
}

#book-name {
    width: 80px;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
#book-author {
    width: 80px;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>