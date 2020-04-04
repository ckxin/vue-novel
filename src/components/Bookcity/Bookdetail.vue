<template>
    <div id="detail">
        <div id="detail-top" class="fixed-top row bg-dark text-white py-3">
            <div class="col-3 pl-4">
                <img src="../../../static/img/icon/fanhui_white.png" alt="返回" width="20px" @click="go_back">
            </div>
            <div class="col-6 text-center h6 one-line">{{ book_name }}</div>
            <div class="col-3"></div>
        </div>
        <div class="row mx-0 w-100 p-3" v-if="book_intro === ''">{{ indicate_msg }}</div>
        <div id="book-detail" v-else>
             <div class="row mx-0 bg-dark text-white py-3">
                <div class="col-4 text-right">
                    <img :src="book_imgsrc"  :alt="book_name" width="100" height="120">
                </div>
                <div class="col-8 text-left my-auto">
                    <div class="h5 font-weight-bold one-line text-warning">{{ book_name }}</div>
                    <div class="text-success one-line pb-2">{{ book_author }}</div>
                    <div class="one-line pb-2 text-danger">最新章节：{{ latest_chapter }}</div>
                    <div class="one-line text-info">{{ latest_time }}</div>
                </div>
            </div>
            <div class="row mx-0 bg-light py-2 mb-2 text-center">
                <div class="col-4"><button class="btn btn-danger" @click="go_read">开始阅读</button></div>
                <div class="col-4"><button class="btn btn-secondary" @click="add_book">加入书架</button></div>
                <div class="col-4"><button class="btn btn-secondary" @click="go_shelf">返回书架</button></div>
            </div>
            <div class="row mx-0 bg-light p-3">
                简介：{{ book_intro }}
            </div>
        </div>
        <Warnmodel :warn_msg="warn_msg" v-if="is_warn"></Warnmodel>
    </div>
</template>


<script>
import { mapState, mapMutations } from 'vuex';
import axios from 'axios';
import CONF from '../../../static/js/CONF';
import deep_clone from '../../../static/js/deep_clone';
import Warnmodel from '../Warnmodel';

const fengmian = require("../../../static/img/fengmian/fengmian.jpeg");
const fengmian1 = require("../../../static/img/fengmian/fengmian1.jpg");

let imageIsExist = function(url) {
    return new Promise((resolve) => {
        var img = new Image();
        img.onload = function () {
            if (this.complete == true){
                resolve(true);
                img = null;
            }
        }
        img.onerror = function () {
            resolve(false);
            img = null;
        }
        img.src = url;
    })
}

export default {
    name: "Bookdetail",
    data() {
        return {
            book_name: "",
            book_link: "",
            book_author: "",
            book_imgsrc: fengmian1,
            latest_chapter: "",
            latest_time: "",
            book_intro: "",
            indicate_msg: "Loading...",
            warn_msg: "",

            is_warn: false,
        }
    },
    components: {
        Warnmodel
    },
    computed: {
        ...mapState(['novel_list']),
    },
    methods: {
        ...mapMutations(['set_is_nav', 'set_novel_list']),
        go_back() {
            this.$router.go(-1);
        },
        go_read() {
            this.$router.push({path: '/bookread', query:{book_name: this.book_name, book_link: this.book_link, book_imgsrc: this.book_imgsrc}})
        },
        add_book() {
            let novel_id = new Date().getTime();
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
                let novel_list = deep_clone(this.novel_list);
                novel_list.push(net_novel_info);
                this.set_novel_list(novel_list);
                this.warn_msg = "成功加入书架";
                this.is_warn = true;
                setTimeout(() => {
                    this.is_warn = false;
                    this.warn_msg = "";
                }, 1000);
            } else {
                let find_index = net_novel_list.findIndex(item => {
                    return item.novel_name === this.book_name;
                });
                if(find_index === -1) {
                    let novel_list = deep_clone(this.novel_list);
                    novel_list.push(net_novel_info);
                    this.set_novel_list(novel_list);
                    net_novel_list.push(net_novel_info);
                    localStorage.setItem('net_novel_list', JSON.stringify(net_novel_list));
                     this.warn_msg = "成功加入书架";
                    this.is_warn = true;
                    setTimeout(() => {
                        this.is_warn = false;
                        this.warn_msg = "";
                    }, 1000);
                } else {
                    this.warn_msg = "该书已在书架";
                    this.is_warn = true;
                    setTimeout(() => {
                        this.is_warn = false;
                        this.warn_msg = "";
                    }, 1000);
                }
            }
        },

        async go_shelf() {
            this.$router.push('/')
        },
    },
    beforeRouteEnter (to, from, next) {
        if(from.path === '/bookread') {
            sessionStorage.setItem("is_readback", "true");
        } else {
            sessionStorage.setItem("is_readback", "false");
        }
        next();
    },
    async activated() {
        try {
            this.set_is_nav(false);
            let is_readback = sessionStorage.getItem("is_readback");
            sessionStorage.removeItem("is_readback");
            if(is_readback === "true") {
                return;
            }
            this.book_intro = "";
            this.book_name = this.$route.query.book_name;
            this.book_link = this.$route.query.book_link;
            let res = await axios.post(CONF.host+'/book_city/bookdetail', {book_link: this.book_link}, {timeout: 15000});
            this.book_author = res.data.book_author;
            let book_imgsrc = res.data.book_imgsrc;
            let exist = await imageIsExist(book_imgsrc);
            if(exist) {
                this.book_imgsrc = book_imgsrc;
            }
            this.latest_chapter = res.data.latest_chapter;
            this.latest_time = res.data.latest_time;
            this.book_intro = res.data.book_intro.split('	').join('');
        } catch(err) {
            this.indicate_msg = `
                请求超时!\n
                若多次重试仍然超时，可能该资源已失效！
            `
        }
    },
    async mounted() {
        
    },
}
</script>

<style scoped>
#detail {
    padding-top: 58px;
}
</style>