<template>
  <div id="home">
    <!-- 功能区 -->
    <div id="home-top" class="fixed-top bg-white fixed-top-line row">
      <div class="col-8 pl-4 font-weight-bold">书架</div>
      <a href="javascript:" class="col-2 text-center" @click="search_book">
        <img src="../../static/img/icon/sousuo.png" width="20px" alt="搜索" />
      </a>
      <a href="javascript:" class="col-2 text-center" @click="more_func">
        <img src="../../static/img/icon/gengduo.png" width="18px" alt="更多" />
      </a>
    </div>
    <!-- 选择界面头部 -->
    <div id="select-top" class="fixed-top  bg-white fixed-top-line row" style="z-index: 250" v-if="is_select">
      <div class="col-6 pl-5">
        <a href="javascript:" style="font-size:16px" @click="cancel_select">取消</a>
      </div>
      <div class="col-6 text-right pr-5">
        <a href="javascript:" style="font-size:16px" @click="select_all">全选</a>
      </div>
    </div>
    <!-- 书籍列表区 -->
    <div class="row mx-0 p-3 bg-light" v-if="novel_list.length === 0">{{ no_book_msg }}</div>
    <div id="book-list" class="row mx-0">
      <div v-for="(novel,idx) in novel_list" :key="idx" :id="get_novelid(idx)" class="col-4 px-3 my-2">
        <div class="novel-cover" :style="{backgroundImage: 'url(' + (novel.is_local === 'true' ? local_bgimg : novel.novel_img) + ')', backgroundSize:'95px 140px', backgroundRepeat: 'no-repeat'}" 
        @touchstart="book_process(idx)" 
        @touchend="cleartime(novel)" 
        @touchmove="do_move">
          <div class="cover-text" v-if="novel.is_local === 'true'">
            {{ novel.novel_name }}
          </div>
          <div :id="get_select_id(idx)" class="book-select" v-if="is_select">
            <img :src="select_before" alt="选择" width="32px">
          </div>
        </div>
        <div class="text-center h6 pt-2 two-lines novel-name">{{ novel.novel_name }}</div>
        <div id="read-schedule">
            {{ novel.read_schedule }}
        </div>
      </div>
    </div>

    <!-- 删除提示框 -->
    <Alertmodel :alert_msg="alert_msg" v-if="is_alert_delete">
       <div id="alert-btn" class="row mx-0 mt-4">
          <div class="col-6"></div>
          <div class="col-3 text-center px-0">
            <button class="btn btn-outline-success px-3" @click="cancel_delete">
              取消
            </button> 
          </div>
          <div class="col-3 text-center px-0">
            <button class="btn btn-outline-danger px-3" @click="delete_book">
              确定
            </button>
          </div>
        </div>
    </Alertmodel>
    <!-- 加密、解密、显示提示框 -->
    <Alertmodel :alert_msg="alert_msg" v-if="is_alert_jiami">
      <div id="password-input" class="row mt-4">
        <input type="password" placeholder="字母数字下划线" v-model="password">
      </div>
      <div id="alert-btn" class="row mx-0 mt-4">
          <div class="col-6"></div>
          <div class="col-3 text-center px-0">
            <button class="btn btn-outline-success px-3" @click="quxiao_mima_chuli">
              取消
            </button> 
          </div>
          <div class="col-3 text-center px-0">
            <button class="btn btn-outline-danger px-3" @click="queding_mima_chuli">
              确定
            </button>
          </div>
        </div>
    </Alertmodel>

    <!-- 修改密码界面 -->
    <Alertmodel :alert_msg="alert_msg" v-if="is_alert_xiugai">
      <div id="password-input" class="row mt-4">
        <input type="password" placeholder="请输入原始密码" v-model="old_password">
      </div>
      <div id="password-input" class="row mt-4">
        <input type="password" placeholder="请输入新密码" v-model="new_password">
      </div>
      <div id="alert-btn" class="row mx-0 mt-4">
          <div class="col-6"></div>
          <div class="col-3 text-center px-0">
            <button class="btn btn-outline-success px-3" @click="quxiao_xiugai">
              取消
            </button> 
          </div>
          <div class="col-3 text-center px-0">
            <button class="btn btn-outline-danger px-3" @click="queding_xiugai">
              确定
            </button>
          </div>
        </div>
    </Alertmodel>

    <!-- 警告信息 -->
    <div class="row fixed-top bg-transparent h-100" v-if="is_warn" style="font-size: 15px">
      <div class="m-auto bg-dark text-white warn-msg">{{ warn_msg }}</div>
    </div>

    <!-- 选择界面底部 -->
    <div class="fixed-bottom bg-white text-center py-3 row" style="z-index: 250" v-if="is_select">
      <div class="col-6 text-center">
        <img src="../../static/img/icon/shanchu.png" alt="删除" width="32px" @click="if_delete">
        <div style="font-size: 14px">删除</div>
      </div>
      <div class="col-6 text-center">
        <img src="../../static/img/icon/jiami.png" alt="加密" width="32px" @click="if_jiami">
        <div style="font-size: 14px">加密</div>
      </div>  
    </div>
    

    <!-- 搜索界面 -->
    <div id="search-book" v-if="is_search">
      <div id="search-top" class="row fixed-top  bg-white fixed-top-line  py-3 bg-light mx-0">
        <div class="col-1 text-center"></div>
        <div class="col-8 pr-0">
          <input id="search-input" class="text-secondary" type="text" v-model="search_key">
        </div>
        <div class="col-2 text-center">
          <a class="text-danger" href="javascript:" @click="cancel_search">
            取消
          </a>
        </div>
        <div class="col-1 text-center"></div>
        <div id="search-tip" v-html="search_tip">{{ search_tip }}</div>
      </div>

      <div id="search-res">
        <div v-if="search_res.length === 0"></div>
        <div v-else>
          <li class="row w-100 mx-0 py-2" v-for="(novel, idx) in search_res" :key="idx"  
          @click="open_book(novel)">
            <div class="col-2 text-right pr-0">
              <img :src="novel.is_local ==='true' ? local_bgimg : novel.novel_img" alt="封面" width="40px" height="55px">
            </div>
            <div class="col-10 text-left h6 my-auto">
              <div v-html="novel.novel_name">{{ novel.novel_name }}</div>
              <div class="py-2 text-secondary" style="font-size: 13px">{{ novel.read_schedule }}</div>
            </div>
          </li>
        </div>
      </div>
    </div>

    <!-- 更多功能界面 -->
    <div id="more-func" class="fixed-top h-100" v-if="is_morefunc" @click="close_morefunc">
      <div id="more-func-main">
        <!-- 显示隐藏文件 -->
        <div class="row bg-white py-3" @click.stop="xianshi_jiami">
          <div class="col-2 px-0 text-right">
            <img src="../../static/img/icon/display.png" alt="显示隐藏文件夹" width="30px">
          </div>
          <div class="col-8 text-dark">
            显示隐藏文件
          </div>
          <div class="col-2">
            <img src="../../static/img/icon/youjiantou.png" alt="进入" width="25px">
          </div>
        </div>
        <!-- 关闭隐藏功能 -->
        <div class="row bg-white py-3" @click.stop="jiemi_all">
          <div class="col-2 px-0 text-right">
            <img src="../../static/img/icon/jiemi.png" alt="关闭隐藏功能" width="30px">
          </div>
          <div class="col-8 text-dark">
            关闭隐藏功能
          </div>
          <div class="col-2">
            <img src="../../static/img/icon/youjiantou.png" alt="进入" width="25px">
          </div>
        </div>
        <!-- 修改密码 -->
        <div class="row bg-white py-3" @click.stop="xiugai_mima">
          <div class="col-2 px-0 text-right">
            <img src="../../static/img/icon/xiugaimima.png" alt="修改密码" width="30px">
          </div>
          <div class="col-8 text-dark">
            修改密码
          </div>
          <div class="col-2">
            <img src="../../static/img/icon/youjiantou.png" alt="进入" width="25px">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import CONF from "../../static/js/CONF";
import store from '@/vuex/store';
import { mapState, mapMutations } from 'vuex';
import md5 from 'js-md5';
import deep_clone from '../../static/js/deep_clone';
import Alertmodel from './Alertmodel';

function sort_novels(novel1, novel2) {
  let id1 = parseInt(novel1.novel_id);
  let id2 = parseInt(novel2.novel_id);
  return id2 - id1
}

var home_topSpace = 0;
export default {
  name: "Home",
  data() {
    return {
      no_book_msg: "加载中...",
      search_tip: "等待搜索",
      search_key: "",
      search_res: [],
      select_before: require('../../static/img/icon/xuanze_before.png'),
      select_after: require('../../static/img/icon/xuanze_after.png'),
      alert_msg: "",
      warn_msg: "",
      password: "",
      md5_password: "",
      old_password: "",
      new_password: "",
      jiami_novels: [],
      local_bgimg:  require('../../static/img/fengmian/fengmian.jpeg'),
      error_bgimg: require('../../static/img/fengmian/fengmian1.jpg'),

      is_search: false,
      is_select: false,
      is_alert_delete: false,
      is_alert_jiami: false,
      is_alert_xiugai: false,
      is_jiami: false,
      is_jiemi: false,
      is_xianshi: false,
      is_warn: false,
      is_morefunc: false,
      is_click: true,
      is_move: false,
    };
  },
  store,
  computed: {
    ...mapState(['list_scroll', 'book_search_scroll', 'novel_list']),
  },
  components: {
    Alertmodel
  },
  methods: {
    ...mapMutations(['set_list_scroll', 'set_book_search_scroll', 'set_is_nav', 'set_novel_list', 'set_current_window_index']),
    get_novelid(idx) {
      return "novel_" + idx;
    },
    get_select_id(idx) {
      return "select_" + idx;
    },
    // 取消事件默认行为
    preventDefault(event) {
        if(event.preventDefault){
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
     // 禁止底层滚动
    BodyScroll(isState) {
        var bodyDoc = document.body || document.documentElement;
        if (isState) {
            home_topSpace = window.scrollY  //保存当前滚轮位置
            bodyDoc.style.position = 'fixed'
            bodyDoc.style.top = -home_topSpace + 'px'
        } else {
            bodyDoc.style.position = ''
            bodyDoc.style.top = ''
            window.scrollTo(0, home_topSpace ) // 回到原先位置
        }
    },
    search_book() {
      this.BodyScroll(true);
      this.is_search = true;
    },
    cancel_search() {
      this.search_tip = "等待搜索",
      this.search_res = [];
      this.search_key = "";
      this.is_search = false;
      this.BodyScroll(false);
    },
    open_book(novel) {
      let novel_name = novel.novel_name
        .split(`<span style="color: green">${this.search_key}</span>`)
        .join(this.search_key);
      let tmp_list_top = home_topSpace;
      this.BodyScroll(false);
      home_topSpace = tmp_list_top;
      if(novel.is_local === "true") {
        let novel_id = novel.novel_id;
        let last_read = {novel_name, novel_id};
        localStorage.setItem("last_read", JSON.stringify(last_read));
        this.$router.push({path: "/novelcontent", query: {novel_name, novel_id}});
      } else {
        let novel_id = novel.novel_id;
        let last_read = {novel_name, novel_id};
        localStorage.setItem("last_read", JSON.stringify(last_read));
        let book_link = novel.novel_path;
        this.$router.push({path: '/bookread', query:{book_name: novel_name, book_link}});
      }
    },

    book_process(idx, event) {
      if(this.is_select) {
        let select_img = document.getElementById("select_"+idx).getElementsByTagName("img")[0];
        if(select_img.src === this.select_before) {
          select_img.src = this.select_after;
        } else {
          select_img.src = this.select_before;
        }
        return;
      }
      clearTimeout(this.Loop);
      this.Loop = setTimeout(() => {
        this.is_click = false;
        this.is_select = true;
        this.$nextTick(() => {
          let select_img = document.getElementById("select_"+idx).getElementsByTagName('img')[0];
          select_img.src = this.select_after;
        })
      }, 800);
    },
    cleartime(novel) {
      if(this.is_move) {
        this.is_move = false;
        return
      }
      let e = event || window.event;
      this.preventDefault(e);
      clearTimeout(this.Loop);
      if(this.is_click) {
        let novel_name = novel.novel_name;
        if(novel.is_local === "true") {
          let novel_id = novel.novel_id;
          let last_read = {novel_name, novel_id};
          localStorage.setItem("last_read", JSON.stringify(last_read));
          this.$router.push({path: "/novelcontent", query: {novel_name, novel_id}});
        } else {
          let novel_id = novel.novel_id;
          let last_read = {novel_name, novel_id};
          localStorage.setItem("last_read", JSON.stringify(last_read));
          let book_link = novel.novel_path;
          this.$router.push({path: '/bookread', query:{book_name: novel_name, book_link}});
        }  
      }
    },
    do_move(event) {
      clearTimeout(this.Loop);
      this.is_move = true;
      // return
    },
    cancel_select() {
      let select_imgs = document.getElementsByClassName("book-select");
      for(let i=0; i<select_imgs.length; i++) {
        select_imgs[i].getElementsByTagName("img")[0].src = this.select_before;
      }
      this.is_select = false;
      this.is_click = true;
    },
    select_all() {
      let select_imgs = document.getElementsByClassName("book-select");
      for(let i=0; i<select_imgs.length; i++) {
        select_imgs[i].getElementsByTagName("img")[0].src = this.select_after;
      }
    },
    if_delete() {
      this.alert_msg = "是否删除选中书籍？"
      this.is_alert_delete = true;
      this.BodyScroll(true);
    },
    cancel_delete() {
      this.alert_msg = "";
      this.is_alert_delete = false;
      this.BodyScroll(false);
    },
    delete_book() {
      this.alert_msg = "";
      this.is_alert_delete = false;
      this.BodyScroll(false);
      let select_imgs = document.getElementsByClassName("book-select");
      let novel_list = deep_clone(this.novel_list);
      for(let i=0; i<select_imgs.length; i++) {
        let select_img_src = select_imgs[i].getElementsByTagName("img")[0].src;
        if(select_img_src === this.select_after) {
          if(novel_list[i].is_local === "false") {
            let net_novel_list = JSON.parse(localStorage.getItem("net_novel_list"));
            if(net_novel_list !== null) {
              let delete_index = net_novel_list.findIndex(item => {
                return item.novel_id === novel_list[i].novel_id;
              })
              net_novel_list.splice(delete_index, 1);
              localStorage.setItem('net_novel_list', JSON.stringify(net_novel_list));
            }
          }
          delete novel_list[i];
          select_imgs[i].getElementsByTagName("img")[0].src = this.select_before;
        }
      }
      novel_list = novel_list.filter( item => {
        return item !== undefined
      });
      this.set_novel_list(novel_list);
    },

    more_func() {
      this.BodyScroll(true);
      this.is_morefunc = true;
    },
    close_morefunc(event) {
      let e = event || window.event;
      let morefunc_main = document.getElementById("more-func-main");
      if(!morefunc_main.contains(e.target)) {
        this.is_morefunc = false;
        this.BodyScroll(false);
      }
    },
    if_jiami() {
      this.alert_msg = "请输入加密密码：";
      this.BodyScroll(true);
      this.is_alert_jiami = true;
      this.is_jiami = true;
      this.is_jiemi = false;
      this.is_xianshi = false;
    },
    xianshi_jiami() {
      this.is_morefunc = false;
      if(this.jiami_novels.length === 0) {
        this.warn_msg = "您没有加密文档！";
        this.is_warn = true;
        setTimeout(() => {
          this.warn_msg = "";
          this.is_warn = false;
        }, 1500);
        this.BodyScroll(false);
        return
      }
      this.alert_msg = "请输入密码：";
      this.is_alert_jiami = true;
      this.is_jiami = false;
      this.is_jiemi = false;
      this.is_xianshi = true;
    },
    jiemi_all() {
      this.is_morefunc = false;
      if(this.jiami_novels.length === 0) {
        this.warn_msg = "您没有加密文档！";
        this.is_warn = true;
        setTimeout(() => {
          this.warn_msg = "";
          this.is_warn = false;
        }, 1500);
        this.BodyScroll(false);
        return
      }
      this.alert_msg = "请输入密码：";
      this.is_alert_jiami = true;
      this.is_jiami = false;
      this.is_jiemi = true;
      this.is_xianshi = false;
    },
    xiugai_mima() {
      this.is_morefunc = false;
      if(this.md5_password === "") {
        this.warn_msg = "您还没有设置加密文档！";
        this.is_warn = true;
        setTimeout(() => {
          this.warn_msg = "";
          this.is_warn = false;
        }, 1500);
        this.BodyScroll(false);
        return;
      }
      this.alert_msg = "修改密码："
      this.is_alert_xiugai = true;
    },
    quxiao_xiugai() {
      this.alert_msg = "";
      this.is_alert_xiugai = false;
      this.BodyScroll(false);
    },
    queding_xiugai() {
      if(this.md5_password !== md5(this.old_password)) {
        this.warn_msg = "原始密码输入错误，请重试！";
        this.is_warn = true;
        setTimeout(() => {
          this.warn_msg = "";
          this.is_warn = false;
        }, 1500);
      } else if(this.new_password === this.old_password) {
        this.warn_msg = "新密码与原始密码相同！";
        this.is_warn = true;
        setTimeout(() => {
          this.warn_msg = "";
          this.is_warn = false;
        }, 1500);
      } else {
        this.md5_password = md5(this.new_password);
        this.warn_msg = "密码修改成功！";
        this.is_warn = true;
        setTimeout(() => {
          this.warn_msg = "";
          this.is_warn = false;
        }, 1500);
        localStorage.setItem("jiami_novels", JSON.stringify({md5_password: this.md5_password, jiami_novels: this.jiami_novels}));
        this.alert_msg = "";
        this.is_alert_xiugai = false;
        this.BodyScroll(false);
      }
      this.old_password = "";
      this.new_password = "";
    },
    quxiao_mima_chuli() {
      this.alert_msg = "";
      this.is_alert_jiami = false;
      this.BodyScroll(false);
    },
    queding_mima_chuli() {
      if(this.password === "") {
        this.warn_msg = "请输入密码！";
        this.is_warn = true;
        setTimeout(() => {
          this.warn_msg = "";
          this.is_warn = false;
        }, 1500);
        return
      } else {
        if(this.md5_password !== "" && this.md5_password !== md5(this.password)) {
          this.warn_msg = "密码错误！";
          this.is_warn = true;
          setTimeout(() => {
            this.warn_msg = "";
            this.is_warn = false;
          }, 1500);
          this.password = "";
          return
        } else {
          this.alert_msg = "";
          this.is_alert_jiami = false;
          this.BodyScroll(false);
          if(this.is_jiami) {
            if(this.md5_password === "") {
              this.md5_password = md5(this.password);
            }
            let select_imgs = document.getElementsByClassName("book-select");
            let novel_list = deep_clone(this.novel_list);
            for(let i=0; i<select_imgs.length; i++) {
              let select_img_src = select_imgs[i].getElementsByTagName("img")[0].src;
              if(select_img_src === this.select_after) {
                this.jiami_novels.push(this.novel_list[i]);
                delete novel_list[i];
                select_imgs[i].getElementsByTagName("img")[0].src = this.select_before;
              }
            }
            this.jiami_novels = [... new Set(this.jiami_novels)];
            localStorage.setItem("jiami_novels", JSON.stringify({md5_password: this.md5_password, jiami_novels: this.jiami_novels}));
            novel_list = novel_list.filter( item => {
              return item !== undefined
            });
            this.set_novel_list(novel_list);
            this.warn_msg = "文档加密成功！";
            this.is_warn = true;
            setTimeout(() => {
              this.warn_msg = "";
              this.is_warn = false;
            }, 1500);
          }
          if(this.is_xianshi) {
            let novel_list = deep_clone(this.novel_list);
            novel_list = novel_list.concat(this.jiami_novels);
            // novel_list = [... new Set(novel_list)];
            var obj = {};
            novel_list = novel_list.reduce(function(item, next) {
              obj[next.novel_id] ? '' : obj[next.novel_id] = true && item.push(next);
              return item;
            }, []);
            novel_list.sort(sort_novels);
            this.set_novel_list(novel_list);
            this.warn_msg = "文档显示成功，将在下次刷新前保持显示";
            this.is_warn = true;
            setTimeout(() => {
              this.warn_msg = "";
              this.is_warn = false;
            }, 1500);
          }
          if(this.is_jiemi) {
            let novel_list = deep_clone(this.novel_list);
            novel_list = novel_list.concat(this.jiami_novels);
            // novel_list = [... new Set(novel_list)];
            var obj = {};
            novel_list = novel_list.reduce(function(item, next) {
              obj[next.novel_id] ? '' : obj[next.novel_id] = true && item.push(next);
              return item;
            }, []);
            novel_list.sort(sort_novels);
            this.set_novel_list(novel_list);
            this.jiami_novels = [];
            localStorage.removeItem("jiami_novels");
            this.password = "";
            this.md5_password = "";
            this.warn_msg = "文档解密成功！";
            this.is_warn = true;
            setTimeout(() => {
              this.warn_msg = "";
              this.is_warn = false;
            }, 1500);
          }
          this.password = "";
        }
      }
    },

  },
  async activated() {
    if(this.novel_list.length === 0) {
      return;
    }
    this.set_is_nav(true);
    this.$nextTick(() => {
      this.set_current_window_index(0);
    })
    if(this.is_search) {
      document.getElementById("search-book").scrollTop = this.book_search_scroll;
    } else {
      document.documentElement.scrollTop = this.list_scroll;
      document.body.scrollTop = this.list_scroll;
    }
    let novel_list = deep_clone(this.novel_list);
    for(let i=0; i<novel_list.length; i++) {
      let novel_history = JSON.parse(localStorage.getItem(novel_list[i].novel_id));
      if(novel_history === null) {
        novel_list[i].read_schedule = "未阅读";
      } else {
        novel_history = novel_history.novel_history;
        let read_schedule = parseFloat(novel_history.read_schedule);
        if(read_schedule === 100) {
          novel_list[i].read_schedule = "已读完";
        } else {
          read_schedule = Math.floor(read_schedule * 10000) / 100;
          novel_list[i].read_schedule = "已读" + read_schedule + "%";
        }
      }
    }
    novel_list.sort(sort_novels);
    let last_read = JSON.parse(localStorage.getItem("last_read"));
    if(last_read === null) {
      this.set_novel_list(novel_list);
    } else {
      let novel_index = novel_list.findIndex(item => {
        return item.novel_id === last_read.novel_id;
      });
      this.set_novel_list(novel_list);
      if(novel_index !== -1) {
        this.$nextTick(() => {
          let novel_name_boxs = document.getElementsByClassName('novel-name');
          for(let i=0; i<novel_name_boxs.length; i++) {
            novel_name_boxs[i].style.color = "#555";
          }
          novel_name_boxs[novel_index].style.color = "green";
        });
      }
    }
  },

  beforeRouteLeave (to, from, next) {
    if(this.is_search) {
      let book_search_scroll = document.getElementById("search-book").scrollTop;
      this.set_book_search_scroll(book_search_scroll);
    } else {
      let list_scroll = document.documentElement.scrollTop || document.body.scrollTop;
      this.set_list_scroll(list_scroll);
    }
    next();
  },

  async mounted() {
    this.set_is_nav(true);
    let res = await axios.get(`${CONF.host}/novel_list`);
    let novel_list = res.data;
    let net_novel_list = JSON.parse(localStorage.getItem("net_novel_list"));
    if(net_novel_list !== null){
      novel_list = novel_list.concat(net_novel_list);
    }
    for(let i=0; i<novel_list.length; i++) {
      let novel_history = JSON.parse(localStorage.getItem(novel_list[i].novel_id));
      if(novel_history === null) {
        novel_list[i].read_schedule = "未阅读";
      } else {
        novel_history = novel_history.novel_history;
        let read_schedule = parseFloat(novel_history.read_schedule);
        if(read_schedule === 100) {
          novel_list[i].read_schedule = "已读完";
        } else {
          read_schedule = Math.floor(read_schedule * 10000) / 100;
          novel_list[i].read_schedule = "已读" + read_schedule + "%";
        }
      }
    }
    if(JSON.parse(localStorage.getItem("jiami_novels")) !== null) {
      let jiami_info = JSON.parse(localStorage.getItem("jiami_novels"));
      this.jiami_novels = jiami_info.jiami_novels;
      for(let i=0; i<this.jiami_novels.length; i++) {
        let novel_history = JSON.parse(localStorage.getItem(this.jiami_novels[i].novel_id));
        if(novel_history === null) {
          this.jiami_novels[i].read_schedule = "未阅读";
        } else {
          novel_history = novel_history.novel_history;
          let read_schedule = parseFloat(novel_history.read_schedule);
          if(read_schedule === 100) {
            this.jiami_novels[i].read_schedule = "已读完";
          } else {
            read_schedule = Math.floor(read_schedule * 10000) / 100;
            this.jiami_novels[i].read_schedule = "已读" + read_schedule + "%";
          }
        }
      }
      this.md5_password = jiami_info.md5_password;
    }
    for(let i=0; i<this.jiami_novels.length; i++) {
      novel_list = novel_list.filter(item => {
        return item.novel_id !== this.jiami_novels[i].novel_id;
      });
    }
    novel_list.sort(sort_novels);
    let last_read = JSON.parse(localStorage.getItem("last_read"));
    if(last_read === null) {
      this.set_novel_list(novel_list);
    } else {
      let novel_index = novel_list.findIndex(item => {
        return item.novel_id === last_read.novel_id;
      });
      this.set_novel_list(novel_list);
      if(novel_index !== -1) {
        this.$nextTick(() => {
          let novel_name_boxs = document.getElementsByClassName('novel-name');
          for(let i=0; i<novel_name_boxs.length; i++) {
            novel_name_boxs[i].style.color = "#555";
          }
          novel_name_boxs[novel_index].style.color = "green";
        });
      }
    }

    if(this.novel_list.length === 0) {
      this.no_book_msg = "暂无书籍，请前往书城添加"
    }
  },
  watch: {
    search_key() {
      if(this.search_key === ""){
        this.search_res = [];
        this.search_tip = "等待搜索"
        return
      }
      this.search_res = [];
      let novel = {};
      for(let i=0; i<this.novel_list.length; i++) {
        if(this.novel_list[i].novel_name.includes(this.search_key)) {
          novel = deep_clone(this.novel_list[i]);
          this.search_res.push(novel);
        }
      }
      for(let i=0; i<this.search_res.length; i++) {
        this.search_res[i].novel_name = this.search_res[i].novel_name
        .split(this.search_key)
        .join(`<span style="color: green">${this.search_key}</span>`)
      }
      this.search_tip = `本地书架共搜索到<span style="color:#28a745">${this.search_res.length}</span>本书籍`
    }
  },
  
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#home {
  padding-top: 56px;
  font-size: 20px;
}
#home-top {
  z-index: 100;
}
.fixed-top-line {
  line-height: 56px;
}
#book-list {
  padding-bottom: 90px;
}

.novel-cover {
  height: 140px;
  width: 95px;
  margin: 0 auto;
}
.cover-text {
  text-align: center;
  overflow:hidden; 
  text-overflow:ellipsis;
  display:-webkit-box; 
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2;
  padding-top: 45px;
  color: white;
  z-index: inherit;
  -webkit-touch-callout:none;
  -webkit-user-select:none;
  -khtml-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
}
.book-select {
  width: 100%;
  text-align: center;
  position: absolute;
  top: 50px;
  left: 0;
  z-index: 200;
}

#read-schedule {
  font-size: 13px;
  color: grey;
  width: 100%;
  text-align: center;
}

#password-input {
  height: 40px;
  line-height: 40px;
}
#password-input input {
  height: 35px;
  width: 300px;
  margin: auto;
  border: 1px solid grey;
  border-radius: 5px;
  padding-left: 10px;
}

.warn-msg {
  height: 40px;
  width: 300px;
  line-height: 40px;
  border-radius: 5px;
  text-align: center;
  opacity: 0.8;
}

.two-lines {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

#search-book {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 300;
  overflow: auto;
  -webkit-overflow-scrolling : touch;
}
#search-top {
  line-height: 35px;
  font-size: 15px;
}
#search-input {
  height: 35px;
  width: 100%;
  border: 0.5px solid grey;
  border-radius: 5px;
  outline: none;
  padding-left: 10px;
  font-size: 16px;
}
#search-tip {
  position: fixed;
  width: 100%;
  top: 60px;
  padding: 5px 0 5px 20px;
  background: #f0f0f0;
  opacity: 1;
}
#search-res {
  padding-top: 110px;
}
#search-res li {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

#more-func {
  z-index: 300;
  background: rgba(128, 128, 128, 0.5);
  font-size: 18px;
}

</style>
