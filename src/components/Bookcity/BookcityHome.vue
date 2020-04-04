<template>
    <div id="bookcity-home">
        <!-- 功能区 -->
        <div id="book-nav" class="row mx-0">
            <div class="col-4 text-center">
                <img src="../../../static/img/icon/fenlei.png" alt="分类" width="30px" @click="gp_booktyped">
                <div>分类</div>
            </div>
            <div class="col-4 text-center">
                <img src="../../../static/img/icon/paihang.png" alt="排行榜" width="30px" @click="go_rank">
                <div>排行</div>
            </div>
            <div class="col-4 text-center">
                <img src="../../../static/img/icon/wanben.png" alt="完本" width="30px" @click="go_endbook">
                <div>完本</div>
            </div>
        </div>
        <!-- 加载中 -->
        <div class="row mx-0 p-3 bg-light" v-if="hot_contents.length === 0">
            加载中...
        </div>
        <!-- 热门书籍 -->
        <div class="container pt-2 pb-4" v-else>
            <div id="hotcontent" class="row pl-3">
                热门书籍
            </div>
            <div class="row p-2 mx-auto" v-for="(item, idx) in hot_contents" :key="idx" @click="go_bookdetail(item.book_name, item.book_link)">
                <div class="col-4 text-left pl-0">
                    <img :src="item.img_src" :alt="item.book_name" height="120px">
                </div>
                <div class="col-8 text-left pl-0">
                    <div id="hot-bookname" class="h6 font-weight-bold one-line">
                        {{item.book_name}}
                    </div>
                    <div id="hot-author" class="text-success">
                        {{item.author}}
                    </div>
                    <div id="hot-intro" class="text-secondary">
                        {{item.intro}}
                    </div>
                </div>
            </div>
        </div>

        <div id="type">
            <div id="type-book" class="container pb-4" v-for="(item, idx) in type_contents" :key="idx">
                <div id="type-title" class="row">
                   <div id="type-name" class="col-6 pl-3"> {{ item.type_name }} </div>
                   <div id="type-more" class="col-6 text-right pr-4 text-secondary">
                       <span @click="go_more(idx)">更多 ></span>
                    </div>
                </div>
                <div id="type-list" class="p-2">
                    <div id="first-book" class="row w-100 mx-auto" @click="go_bookdetail(item.first_book_info.first_book_name, item.first_book_info.first_book_link)">
                        <div id="first-book-img" class="col-4 text-left pl-0">
                            <img :src="item.first_book_info.first_book_imgsrc" :alt="item.first_book_info.first_book_name" height="120px">
                        </div>
                        <div id="first-book-info" class="col-8 text-left pl-0">
                            <div class="h6 font-weight-bold">{{item.first_book_info.first_book_name}}</div>
                            <div style="font-size: 15px">简介：{{item.first_book_info.first_book_intro}}</div>
                        </div>
                    </div>
                    <div id="other-books" class="row w-100 mx-auto border-bottom py-3" v-for="(ele, index) in item.other_books_info" :key="index" @click="go_bookdetail(ele.other_book_name, ele.other_book_link)">
                        <div class="col-6 one-line">{{ ele.other_book_name }}</div>
                        <div class="col-6 one-line ">作者: {{ ele.other_book_author }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import CONF from '../../../static/js/CONF';
import store from '../../vuex/store';
import { mapState, mapMutations } from 'vuex';


export default {
    name: "BookcityHome",
    data() {
        return {
            hot_contents: [],
            type_contents: [],
        }
    },
    store,
    computed: {
        ...mapState(['bookcity_home_scroll']),
    },
    methods: {
        ...mapMutations(['set_bookcity_home_scroll', 'set_is_nav', 'set_current_window_index']),
        gp_booktyped() {
            this.$router.push('/booktype')
        },
        go_more(idx) {
            this.$router.push({path: '/booktype', query: {idx}});
        },

        go_rank() {
            this.$router.push('/ranklist');
        },

        go_endbook() {
            this.$router.push('/endbook');
        },

        go_bookdetail(book_name, book_link) {
            this.$router.push({path: "/bookdetail", query: {book_name, book_link}});
        },
    },
    async mounted() {
        let res = await axios.get(`${CONF.host}/book_city`);
        this.hot_contents = res.data.hot_contents;
        this.type_contents = res.data.type_contents;
    },
    beforeRouteLeave (to, from, next) {
        let bookcity_home_scroll = document.body.scrollTop || document.documentElement.scrollTop;
        this.set_bookcity_home_scroll(bookcity_home_scroll);
        next();
    },
    activated() {
        this.set_is_nav(true);
        this.$nextTick(() => {
            this.set_current_window_index(1);
            let link_items = document.getElementById("win-select").getElementsByTagName("a");
            link_items[0].style = "color: #555";
            link_items[1].style = "color: #28a745";
        })
        document.body.scrollTop = this.bookcity_home_scroll;
        document.documentElement.scrollTop = this.bookcity_home_scroll;
    },

}
</script>

<style scoped>

#bookcity-home {
    padding-bottom: 90px;
}

#book-nav {
    padding-top: 70px;
}
#hotcontent {
    padding-top: 10px;
    font-size: 20px;
    font-weight: bold;
    color: #212529;
}

#hot-author {
    font-size: 12px;
}
#hot-intro {
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

#type-name {
    font-size: 20px;
    font-weight: bold;
    color: #212529;
}
#first-book-info {
    height: 115px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
}
.one-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>