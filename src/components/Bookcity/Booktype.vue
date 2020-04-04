<template>
    <div id="book-type">
        <div id="rank-top" class="fixed-top row bg-light py-3">
            <div class="col-3 pl-4">
                <img src="../../../static/img/icon/fanhui_grey.png" alt="返回" width="20px" @click="go_back">
            </div>
            <div class="col-6 text-center font-weight-bold text-secondary" style="font-size: 18px">分类</div>
            <div class="col-3"></div>
        </div>
        <div id="slide-container">
            <div id="slide-wrapper" class="bg-light">
                <div id="type-slide">
                    <button v-for="(booktype, index) in booktypes" :key="index" class="btn" :id="get_typeid(index)" @click="go_type(index)">
                        {{ booktype.type_name }}
                    </button>
                </div>
            </div>
        </div>
        <div id="type-list" class="container w-100 px-2 pb-2">
            <div class="row mx-auto bg-white p-3" v-if="type_list.length === 0">加载中...</div>
            <div class="row mx-auto border-bottom p-3" v-for="(item, index) in type_list" :key="index" @click="go_bookdetail(item.book_name, item.book_link)">
                <div class="col-6 one-line font-weight-bold">{{ item.book_name }}</div>
                <div class="col-6 one-line">作者：{{ item.book_author }}</div>
                <div class="col-12 one-line text-secondary pt-2">最新章节：{{ item.latest_chapter }}</div>
            </div>
            <div class="row mx-auto bg-white p-3" v-if="loading">加载中...</div>
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex';
import axios from 'axios';
import booktypes  from '../../../static/js/booktypes';
import CONF from '../../../static/js/CONF';

export default {
    name: "Booktype",
    data() {
        return {
            booktypes,
            type_list: [],
            list_page_num: 0,
            basic_typeurl: "",
            current_list_page: 1,

            loading: false,
            is_detailback: false
        }
    },   
    methods: {
        ...mapMutations(['set_is_nav']),
        go_back() {
            this.$router.push('/bookcity');
        },
        get_typeid(index) {
            return "type_" + index;
        },
        async go_type(index) {
            this.type_list = [];
            let btns = document.getElementById("type-slide").getElementsByTagName('button');
            for(let i=0; i<btns.length; i++) {
                btns[i].style.color = "black";
            }
            btns[index].style.color = "green";
            let url = booktypes[index].type_link;
            let res = await axios.post(CONF.host+"/book_city/booktype", {
                url
            });
            this.type_list = res.data.type_list;
            this.list_page_num = res.data.list_page_num;
            this.basic_typeurl = res.data.basic_typeurl;
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
                if(this.type_list.length !== 0 && this.current_list_page <= this.list_page_num) {
                    this.loading = true;
                    this.current_list_page++;
                    let url = this.basic_typeurl + this.current_list_page + ".html";
                    let res = await axios.post(CONF.host+"/book_city/booktype", {
                        url
                    });
                    let type_list = res.data.type_list;
                    this.type_list = this.type_list.concat(type_list);
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
        this.type_list = [];
        this.current_list_page = 1;
        let idx = this.$route.query.idx;
        let btns = document.getElementById("type-slide").getElementsByTagName('button');
        for(let i=0; i<btns.length; i++) {
            btns[i].style.color = "black";
        }
        if(idx === undefined) {
            document.getElementById("type-slide").getElementsByTagName('button')[0].style.color = "green";
            let url = booktypes[0].type_link;
            let res = await axios.post(CONF.host+"/book_city/booktype", {
                url
            });
            this.type_list = res.data.type_list;
            this.list_page_num = res.data.list_page_num;
            this.basic_typeurl = res.data.basic_typeurl;
        } else {
            idx = parseInt(idx);
            document.getElementById("type-slide").getElementsByTagName('button')[idx].style.color = "green";
            let url = booktypes[idx].type_link;
            let res = await axios.post(CONF.host+"/book_city/booktype", {
                url
            });
            this.type_list = res.data.type_list;
            this.list_page_num = res.data.list_page_num;
            this.basic_typeurl = res.data.basic_typeurl;
        }
        window.addEventListener('scroll', this.handel_scroll, true);
    },
    deactivated() {
        window.removeEventListener('scroll', this.handel_scroll, true);
    },
    beforeRouteLeave (to, from, next) {
        let scroll = document.body.scrollTop || document.documentElement.scrollTop;
        sessionStorage.setItem("scroll", scroll);
        next();
    }
}
</script>

<style scoped>
#book-type {
    padding-top: 120px;
}

#slide-container {
    position: fixed;
    top: 59px;
    left: 0;
    width: 100%;
    overflow: hidden;
    z-index: 100;
}
#slide-wrapper {
    overflow: hidden;
    height: 60px;
}
#type-slide {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    white-space: nowrap;
    height: 86px;
    padding: 10px 0;
}



</style>