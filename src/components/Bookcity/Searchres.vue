<template>
    <div id="search-res">
        <div class="row bg-light py-2 pl-3 mx-0" v-if="loading">
            搜索中...
        </div>
        <div v-else>
            <div id="search-res-more" v-if="searchres.length !== 0">
                <div v-for="(item, idx) in searchres" :key="idx" class="row mx-0 py-3 bg-light border-bottom" @click="go_bookdetail(item.book_name, item.book_link)">
                    <div id="book-name" class="col-6 h5">
                        {{ item.book_name }}
                    </div>
                    <div id="book-author" class="col-6 text-secondary">
                        作者：{{ item.author }}
                    </div>
                    <div id="latest-chapter" class="col-12">
                        最新章节：{{ item.latest_chapter }}
                    </div>
                    <div id="latest-time" class="col-12">
                        最后更新时间：{{ item.latest_time }}
                    </div>
                </div>
            </div>
            <div id="search-error" v-else>
                {{error_msg}}
            </div>
        </div>

        <div id="go-back" class="fixed-bottom text-right mr-3 mb-5 bg-transparent">
            <img src="../../../static/img/icon/fanhui.png" alt="返回" width="25px" @click="go_back">
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import CONF from '../../../static/js/CONF';
import { mapMutations } from 'vuex';

export default {
    name: 'Searchres',
    data() {
        return {
            searchres: [],
            error_msg: "",

            loading: true,
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
            return;
        }
        this.searchres = [];
        let searchkey = this.$route.query.searchkey;
        let searchtype = this.$route.query.searchtype;
        let res = await axios.post(CONF.host+"/book_city/search", {
            searchkey, 
            searchtype
        });
        this.loading = false;
        if(res.data.status) {
            this.searchres = res.data.search_res;
        } else {
            this.error_msg = "抱歉，没有查找到您搜索的书籍";
        }
    },
    watch: {
        async $route() {
            let is_detailback = sessionStorage.getItem("is_detailback");
            if(is_detailback === "true") {
                return;
            }
            this.loading = true;
            let searchkey = this.$route.query.searchkey;
            let searchtype = this.$route.query.searchtype;
            let res = await axios.post(CONF.host+"/book_city/search", {
                searchkey, 
                searchtype
            });
            this.loading = false;
            if(res.data.status) {
                this.searchres = res.data.search_res;
            } else {
                this.error_msg = "抱歉，没有查找到您搜索的书籍";
            }
        }
    },
    beforeRouteEnter (to, from, next) {
        if(from.path === '/bookdetail') {
            sessionStorage.setItem("is_detailback", "true");
        } else {
            sessionStorage.setItem("is_detailback", "false");
        }
        next();
    },
    beforeRouteLeave (to, from, next) {
        let scroll = document.body.scrollTop || document.documentElement.scrollTop;
        sessionStorage.setItem("scroll", scroll);
        next();
    },
}
</script>

<style scoped>
#search-res {
    padding-top: 70px;
    height: 100%;
}
#go-back {
    margin-top: 80px;
}
</style>