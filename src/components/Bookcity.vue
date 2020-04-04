<template>
    <div id="book-city">
        <div class="fixed-top bg-white py-3 row text-center">
            <div class="col-3 px-0 text-center">
                <button id="searchtype" class="btn btn-info px-2 ml-3" @click="change_searchtype">
                    {{ searchtype }}
                    <img src="../../static/img/icon/xiajiantou.png" alt="选择" width="15px">
                </button>
            </div>
            <div class="col-6 text-center px-0">
                <input type="text" class="form-control" placeholder="请输入小说作者或名称" v-model="searchkey">
            </div>
            <div class="col-3 px-0">
                <button class="btn btn-outline-success px-3 mr-3" @click="go_search">
                    搜索
                </button>
            </div>
        </div>

        <warn :warn_msg= warn_msg v-if="is_warn"></warn>

        <keep-alive>
            <router-view v-if="$route.meta.keepAlive"/>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive" />    
    </div>
</template>

<script>
import axios from 'axios';
import CONF from '../../static/js/CONF';
import Warnmodel from '../components/Warnmodel';
import { mapState, mapMutations } from 'vuex';

function str_len(str) {
    return str.replace(/[^\x00-\xff]/g, 'xxx').length;
}

export default {
    name: "Bookcity",
    data() {
        return {
            searchtype: "书名",
            searchkey: "",
            warn_msg: "",
            is_warn: false,
        }
    },
    computed: {
        ...mapState(['current_window_index'])
    },
    components: {
        warn: Warnmodel
    },
    methods: {
        ...mapMutations(['set_current_window_index']),
        change_searchtype() {
            if(this.searchtype === "书名") {
                this.searchtype = "作者";
            } else {
                this.searchtype = "书名";
            }
        },
        go_search() {
            let searchkey = this.searchkey;
            if(searchkey === "") {
                this.warn_msg = "请先输入书名或作者";
                this.is_warn = true;
                setTimeout(() => {
                    this.is_warn = false;
                    this.warn_msg = "";
                }, 1500)
                return
            } else if(str_len(searchkey) < 4) {
                this.warn_msg = "输入字符不得少于4字节！";
                this.is_warn = true;
                setTimeout(() => {
                    this.is_warn = false;
                    this.warn_msg = "";
                }, 1500)
                return
            }
            let searchtype = "";
            if(this.searchtype === "作者") {
                searchtype = "author";
            } else {
                searchtype = "articlaname";
            }
            this.$router.push({path: "/searchres", query: {searchkey, searchtype}})
        }
    },
    // activated() {
    //     this.set_current_window_index(1);
    // },
    watch: {
        $route() {
            if(this.$route.path === "/bookcity") {
                this.searchkey = "";
                this.searchtype = "书名";
            }
        }
    },

}
</script>

<style scoped>
#book-city {
    width: 100%;
    height: 100%;
}
</style>