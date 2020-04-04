<template>
    <div id="rank">
        <div id="rank-top" class="fixed-top">
            <div id="top" class="row bg-white py-3">
                <div class="col-3 pl-4">
                    <img src="../../../static/img/icon/fanhui_grey.png" alt="返回" width="25px" @click="go_back">
                </div>
                <div class="col-6 text-center"><img src="../../../static/img/icon/rank1.png" alt="Top20" width="60px"></div>
                <div class="col-3"></div>
            </div>
            <div id="rank-type" class="row py-2" style="background: #e8e9ea">
                <div class="col-4 text-center" v-for="(item, idx) in rank_type" :key="idx">
                    <span class="p-2" @click="go_ranktype(idx)">{{ item.type_name }}</span>
                </div>
            </div>
        </div>

        <div id="rank-list">
            <div class="row mx-0 py-2 pl-4 bg-light" v-if="rank_list.length === 0">
                加载中...
            </div>
            <div class="row mx-0 py-3 pl-4 bg-light border-bottom" v-for="(item, idx) in rank_list" :key="idx" @click="go_bookdetail(item.book_name, item.book_link)">
                <span class="font-italic font-weight-bold text-warning">{{idx+1}}、</span>
                <span class="text-danger font-weight-bold">{{ item.book_name }}</span>
            </div>
        </div>
    </div>
</template>
//  h4 font-weight-bold text-warning
<script>
import { mapMutations } from 'vuex';
import axios from 'axios';
import CONF from '../../../static/js/CONF';

export default {
    name: "Ranklist",
    data() {
        return {
            rank_list: [],
            rank_type: [
                {type_name: "推荐排行", type_link: "https://www.2952.cc/paihangbang/allvote.html"},
                {type_name: "收藏排行", type_link: "https://www.2952.cc/paihangbang/goodnum.html"},
                {type_name: "新书排行", type_link: "https://www.2952.cc/paihangbang/newbook.html"},
            ],
        }
    },
    methods: {
        ...mapMutations(['set_is_nav']),
        go_back() {
            this.$router.push('/bookcity');
        },
        async go_ranktype(idx) {
            this.rank_list = [];
            let type_box = document.getElementById('rank-type').getElementsByTagName('span');
            for(let i=0; i<type_box.length; i++) {
                type_box[i].style.color = "black";
            }
            type_box[idx].style.color = "green";
            let url = this.rank_type[idx].type_link;
            let res = await axios.post(CONF.host+"/book_city/ranklist", {
                url
            });
            this.rank_list = res.data;
        },

        go_bookdetail(book_name, book_link) {
            this.$router.push({path: "/bookdetail", query: {book_name, book_link}});
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
        this.rank_list = [];
        document.getElementById('rank-type').getElementsByTagName('span')[0].style.color = "green";
        let url = this.rank_type[0].type_link;
        let res = await axios.post(CONF.host+"/book_city/ranklist", {
            url
        });
        this.rank_list = res.data;
    },
    beforeRouteLeave (to, from, next) {
        let scroll = document.body.scrollTop || document.documentElement.scrollTop;
        sessionStorage.setItem("scroll", scroll);
        next();
    },
}
</script>

<style scoped>
#rank {
    width: 100%;
    height: 100%;
    padding-top: 97px;
}
</style>