<template>
  <div id="Novelcontent">
    <div class="w-100" style="background: #c7edcc">
    <!-- 小说名称 -->
    <div id="novel-name" v-if="is_novel_name">{{ novel_name }}</div>
    <!-- 上部空div，实现下拉加载上一章缓冲区域 -->
    <div style="height: 50px; width: 90%;"></div>
    <!-- 小说加载时loading界面 -->
    <div id="content-load" v-if="loading">
      <div class="spinner-border" role="loading"></div>
    </div>
    <!-- 小说当前显示部分的内容 -->
    <div
      v-for="(chapter, idx) in current_chapters"
      :key="idx"
      :id="chapter.chapter_index"
      class="chapter mx-auto"
      @click="open_menu(chapter.chapter_index, $event)"
      v-else
    >
      <div
        :id="chapter.chapter_title.id_index"
        v-html="chapter.chapter_title.data"
        style="font-weight:bold"
      >{{ chapter.chapter_title.data }}</div>
      <div
        v-for="(content, index) in chapter.chapter_content"
        :key="index"
        :id="content.id_index"
        v-html="content.data"
      >{{ content.data }}</div>
    </div>
    <!-- 底部空div，实现上拉加载下一章缓冲区域 -->
    <div style="height: 50px; width: 90%;"></div>
    </div>

    <!-- 目录model -->
    <div id="catalogue" v-if="is_catalogue" @click="close_catalogue">
      <div class="m-auto" v-if="catalogue_loading">正在生成目录</div>
      <div id="catalogue-titles" @click="go_chapter" v-else>
        <li v-for="(chapter_title, index) in chapter_titles" :key="index" :id="get_title_id(index)">
            {{ chapter_title.data }}
        </li>
      </div>
    </div>

    <!-- 书签model -->
    <div id="bookmark" v-if="is_bookmark" @click="close_bookmark">
      <div id="bookmark-none" v-if="bookmark_list.length === 0">暂无书签内容</div>
      <div id="bookmark-list" v-else>
        <li v-for="(bookmark, index) in bookmark_list" :key="index" @touchstart="bookmark_click_start" @touchend="bookmark_process(bookmark, $event)">
            {{ bookmark.bookmark_data }}
        </li>
      </div>
      <!-- 书签删除 -->
      <button id="delete-bookmark" class="btn btn-dark position-absolute" v-if="is_delete_bookmark" @click="delete_bookmark">
        删除
      </button>
    </div>

    <!-- 菜单model -->
    <div id="menu" v-if="is_menu" @click="close_menu">
      <div id="menu-top" class="row fixed-top bg-dark p-3">
        <div class="col-8 text-left">
          <img src="../../static/img/icon/fanhui_white.png" alt="返回" width="30px" @click="back_home">
        </div>
        <div class="col-2 text-center">
          <img src="../../static/img/icon/sousuo_white.png" alt="搜索" width="30px" @click="go_search">
        </div>
        <div class="col-2 text-center">
          <img :src="bookmark_icon" alt="书签" width="30px" @click="control_bookmark">
        </div>
      </div>
      <div id="menu-bottom" class="row fixed-bottom bg-dark py-3 px-4">
        <div class="col-3 px-0 text-center">
          <button class="btn btn-success px-2" @click="go_prev">上一章</button>
        </div>
        <div class="col-3 px-0 text-center">
          <button class="btn btn-success px-3" style="font-size: 15px" @click="open_catalogue">目录</button>
        </div>
        <div class="col-3 px-0 text-center">
          <button class="btn btn-success px-3" @click="open_bookmark">书签</button>
        </div>
        <div class="col-3 px-0 text-center">
          <button class="btn btn-success px-2" @click="go_next">下一章</button>
        </div>
      </div>
    </div>

    <!-- 搜索model -->
    <div id="search" v-if="is_search">
      <div id="search-top" class="row fixed-top py-3 bg-light mx-0">
        <div class="col-2 text-center">
          <a class="text-danger" href="javascript:" @click="cancel_search">
            取消
          </a>
        </div>
        <div class="col-8 text-center">
          <input id="search-input" class="text-secondary" type="text" v-model="search_key">
        </div>
        <div class="col-2 text-center">
          <a class="text-success" href="javascript:" @click="start_search">
            搜索
          </a>
        </div>
         <div id="search-tip" v-html="search_tip">{{ search_tip }}</div>
      </div>
      <div v-if="search_res.length === 0"></div>
      <div id="search-res" class="mx-auto" v-else>
        <li v-for="(item, idx) in search_res" :key="idx" :id="get_search_id(idx)" v-html="item.data" @click="go_search_res(item)">
          {{ item.data }}
        </li>
      </div>
    </div>

    <!-- 搜索控制model，取消当前搜索或回到搜索界面 -->
    <div id="search-control" v-if="is_search_control">
      <div class="row fixed-bottom bg-transparent pb-4">
        <div class="col-3"></div>
        <div class="col-3 text-center">
          <img src="../../static/img/icon/guanbi.png" alt="关闭" width="30px" @click="close_key_style">
        </div>
        <div class="col-3 text-center">
          <img src="../../static/img/icon/sousuo.png" alt="搜索" width="30px" @click="return_key_search">
        </div>
        <div class="col-3"></div>
      </div>
    </div>

    <!-- 警告提示框 -->
    <div class="row fixed-top bg-transparent h-100" v-if="is_alert">
      <div class="col-8 m-auto bg-dark text-white alert-msg">{{ alert_msg }}</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import path from 'path';
import CONF from "../../static/js/CONF";
import store from "@/vuex/store";
import {mapState, mapMutations } from "vuex";

const bookmark_before = require('../../static/img/icon/bookmark_before.png');
const bookmark_after = require('../../static/img/icon/bookmark_after.png');
var topSpace = 0;

export default {
  name: "Novelcontent",
  data() {
    return {
      novel_name: "",
      novel_id: "",
      current_chapters: [],
      chapter_num: 0,
      current_chapter_index: 0,
      chapter_titles: [],
      bookmark_list: [],
      bookmark_icon: bookmark_before,
      bookmark_item: {},
      bookmark_find_index: -1,
      bookmark_click_start_time: 0,
      search_key: "",
      search_res:[],
      current_search_scroll: 0,
      current_line_index: -1,
      search_res_chapter_idx: 0,
      search_tip: "等待搜索",
      alert_msg: "",

      is_novel_name: true,
      loading: true,
      is_scroll_listener: false,
      is_catalogue: false,
      is_bookmark: false,
      is_marked: false,
      is_delete_bookmark: false,
      catalogue_loading: true,
      is_menu: false,
      is_search: false,
      is_search_control: false,
      is_alert: false
    };
  },
  store,
  methods: {
    ...mapMutations(["set_is_nav"]),
    // 目录列表获取各自id
    get_title_id(index) {
        return "title_" + index;
    },
    // 搜索结果页获取搜索结果各自id
    get_search_id(idx) {
      return "search_" + idx;
    },

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
    // 阻止事件冒泡
    stopPropagation(event) {
        if(event.stopPropagation){
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    // 取消事件默认行为
    preventDefault(event) {
        if(event.preventDefault){
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    },
    // 打开主菜单
    open_menu(idx, event) {
      this.current_chapter_index = parseInt(idx.split("_")[1]);

      let current_chapter_index = 0;
      if(this.chapter_num < 3) {
        current_chapter_index = this.current_chapter_index;
      } else {
        current_chapter_index = parseInt(
          this.current_chapters[1].chapter_index.split("_")[1]
        );
      }
      let scroll_top = window.scrollY;
      let bookmark_id = `bookmark_${current_chapter_index}_${scroll_top}`;
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
        this.is_menu = false;
        this.BodyScroll(false);
        window.addEventListener("scroll", this.handle_scroll, true);
      }
    },
    // 返回书架
    back_home(event) {
      let e = event || window.event;
      this.stopPropagation(e);
      this.is_menu = false;
      this.BodyScroll(false);
      this.$router.push("/");
    },
    // 打开搜索界面
    go_search(event){
      let e = event || window.event;
      this.stopPropagation(e);
      this.is_menu = false;
      this.is_search = true;
      this.$nextTick(() => {
        if(this.current_search_scroll !== 0)
          document.getElementById("search").scrollTop = this.current_search_scroll;
      })
    },
    // 取消搜索，关闭搜索页面
    cancel_search(){
      this.current_search_scroll = document.getElementById("search").scrollTop;
      this.is_search = false;
      this.BodyScroll(false);
      window.addEventListener("scroll", this.handle_scroll, true);
      if(this.search_key === "") {
        this.current_search_scroll= 0;
        this.search_res = [];
        this.search_tip = "等待搜索";
      }
    },
    
    // 开始搜索
    async start_search() {
      if(this.search_key === "") {
        this.search_tip = '<span style="color:#dc3545">请输入搜索内容！</span>';
        return;
      }
      this.search_tip = "搜索中";
      let res = await axios.post(CONF.host + '/novel_content/search',
        {
          novel_id: this.novel_id,
          search_key: this.search_key
        }
      );
      let search_res = res.data;
      // setTimeout(() => {
        
      if(search_res.length === 0) {
          this.search_res = [];
          this.search_tip = '<span style="color:#dc3545">无搜索结果</span>'
      }
      else {
          this.search_res = search_res;
          this.search_tip = `共查找到<span style="color:#28a745">${search_res.length}</span>条结果`
      }
      // }, 0)
    },
    // 跳转到指定搜索内容
    async go_search_res(item) {
      let { chapter_index, id_index, data } = item;
      let res = await axios.post(CONF.host + "/novel_content", 
        { 
          novel_id: this.novel_id, 
          current_chapter_index: chapter_index
        }
      );
      this.is_search = false;
      this.BodyScroll(false);
      let current_chapters = res.data.current_chapters;
      this.current_chapters = [];
      for(let i=0; i< current_chapters.length; i++) {
        this.current_chapters.push(current_chapters[i]);
      }
      this.current_search_scroll = document.getElementById("search").scrollTop;
      this.is_search_control = true;
      this.$nextTick(() => {
        document.getElementById(id_index).scrollIntoView();
        window.addEventListener("scroll", this.handle_scroll, true);
        let chapter = {};
        let current_line_index = -1;
        for(let i=0; i<this.current_chapters.length; i++) {
          chapter = this.current_chapters[i];
          if(chapter.chapter_title.id_index === id_index) {
            this.current_chapters[i].chapter_title.data = this.current_chapters[i].chapter_title.data
            .split(this.search_key)
            .join(`<span style="background:#00ff00;">${this.search_key}</span>`);
            this.search_res_chapter_idx = i;
            break;
          } else {
            current_line_index = chapter.chapter_content.findIndex(item => {
              return item.id_index === id_index;
            })
            if(current_line_index !== -1) {
              this.current_chapters[i].chapter_content[current_line_index].data = 
              this.current_chapters[i].chapter_content[current_line_index].data.split(this.search_key)
              .join(`<span style="background:#00ff00;">${this.search_key}</span>`);
              this.search_res_chapter_idx = i;
              break;
            }
          }
        }
        this.current_line_index = current_line_index;
      })
    },
    // 关闭搜索字符串的格式
    close_key_style() {
      if(this.current_line_index === -1) {
        this.current_chapters[this.search_res_chapter_idx].chapter_title.data = 
        this.current_chapters[this.search_res_chapter_idx].chapter_title.data
        .split(`<span style="background:#00ff00;">${this.search_key}</span>`)
        .join(this.search_key);
      } else {
        this.current_chapters[this.search_res_chapter_idx].chapter_content[this.current_line_index].data = 
        this.current_chapters[this.search_res_chapter_idx].chapter_content[this.current_line_index].data
        .split(`<span style="background:#00ff00;">${this.search_key}</span>`)
        .join(this.search_key);
      }
      this.is_search_control = false;
    },
    return_key_search() {
      if(this.current_line_index === -1) {
        this.current_chapters[this.search_res_chapter_idx].chapter_title.data = 
        this.current_chapters[this.search_res_chapter_idx].chapter_title.data
        .split(`<span style="background:#00ff00;">${this.search_key}</span>`)
        .join(this.search_key);
      } else {
        this.current_chapters[this.search_res_chapter_idx].chapter_content[this.current_line_index].data = 
        this.current_chapters[this.search_res_chapter_idx].chapter_content[this.current_line_index].data
        .split(`<span style="background:#00ff00;">${this.search_key}</span>`)
        .join(this.search_key);
      }
      this.is_search_control = false;
      window.removeEventListener("scroll", this.handle_scroll, true);
      this.BodyScroll(true);
      this.is_search = true;
      this.$nextTick(() => {
        if(this.current_search_scroll !== 0)
          document.getElementById("search").scrollTop = this.current_search_scroll;
      })
    },
    // 打开小说目录
    open_catalogue(event) {
      let e = event || window.event;
      this.stopPropagation(e);
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
      })
    },
    // 关闭小说目录
    close_catalogue(event) {
      let e = event || window.event;
      let catalogue_titles = document.getElementById("catalogue-titles");
      if(! catalogue_titles.contains(e.target)) {
        this.is_catalogue = false;
        this.BodyScroll(false);
        window.addEventListener("scroll", this.handle_scroll, true);
      }
    },
    // 跳转到相应章节
    async go_chapter(event) {
      let e = event || window.event;
      this.stopPropagation(e);
      let index = parseInt(e.target.id.split("_")[1]);
      let res = await axios.post(CONF.host + "/novel_content", 
        { 
          novel_id: this.novel_id, 
          current_chapter_index: index
        }
      );
      this.is_catalogue = false;
      this.BodyScroll(false);
      let current_chapters = res.data.current_chapters;
      this.current_chapters = [];
      for(let i=0; i< current_chapters.length; i++) {
        this.current_chapters.push(current_chapters[i]);
      }
      this.$nextTick(() => {
        let current_chapter = document.getElementById("chapter_" + index);
        current_chapter.scrollIntoView();
        window.addEventListener("scroll", this.handle_scroll, true);
      })
    },

    // 打开小说书签
    open_bookmark(event) {
      let e = event || window.event;
      this.stopPropagation(e);
      this.is_menu = false;
      this.is_bookmark = true;
    },
    // 关闭小说书签
    close_bookmark(event) {
      let e = event || window.event;
      if(this.is_delete_bookmark) {
        this.is_delete_bookmark = false;
        return;
      }
      let bookmark_list = "";
      if(this.bookmark_list.length === 0) {
        bookmark_list = document.getElementById("bookmark-none")
      } else {
        bookmark_list = document.getElementById("bookmark-list");
      }
      if(! bookmark_list.contains(e.target)) {
        this.is_bookmark = false;
        this.BodyScroll(false);
        window.addEventListener("scroll", this.handle_scroll, true);
      }
    },
    bookmark_click_start() {
      this.bookmark_click_start_time = new Date().getTime();
    },
    // 跳转到指定书签
    async bookmark_process(bookmark, event) {
      let e = event || window.event;
      this.stopPropagation(e);
      if(this.is_delete_bookmark) {
        this.is_delete_bookmark = false;
        return;
      }
      let index = parseInt(bookmark.bookmark_id.split("_")[1]);
      let scroll = parseInt(bookmark.bookmark_id.split("_")[2]);
      let bookmark_click_end_time = new Date().getTime();
      if(bookmark_click_end_time - this.bookmark_click_start_time <= 500) {
        let res = await axios.post(CONF.host + "/novel_content", 
          { 
            novel_id: this.novel_id, 
            current_chapter_index: index
          }
        );
        this.is_bookmark = false;
        this.BodyScroll(false);
        this.current_chapters = [];
        this.current_chapters = res.data.current_chapters;
        this.$nextTick(() => {
          window.scrollTo(0, scroll);
          window.addEventListener("scroll", this.handle_scroll, true);
        })
      } else {
        this.preventDefault(e);
        let click_x = e.changedTouches[0].clientX;
        let click_y = e.changedTouches[0].clientY;
        this.is_delete_bookmark = true;
        this.$nextTick(() => {
          document.getElementById("delete-bookmark").style.left = click_x + 'px';
          document.getElementById("delete-bookmark").style.top = click_y + 10 + 'px';
          this.bookmark_item = this.bookmark_list.find(item => {
            return item.bookmark_id === bookmark.bookmark_id;
          });
        });
      }
    },
    delete_bookmark(event) {
      let e = event || window.event;
      this.stopPropagation(e);
      this.is_delete_bookmark = false;
      let delete_index = this.bookmark_list.findIndex(item => {
        return item.bookmark_id === this.bookmark_item.bookmark_id;
      })
      this.bookmark_list.splice(delete_index, 1);
    },
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

    // 转到上一章
    async go_prev(event) {
      let e = event || window.event;
      this.stopPropagation(e);
      this.is_menu = false;
      this.BodyScroll(false);
      if(this.current_chapter_index === 0) {
        this.alert_msg = "已是第一章！";
        this.is_alert = true;
        setTimeout(() => {
          this.is_alert = false;
        }, 1500);
        window.addEventListener("scroll", this.handle_scroll, true);
      } else {
        let res = await axios.post(CONF.host + "/novel_content", 
              { 
                novel_id: this.novel_id, 
                current_chapter_index: this.current_chapter_index - 1
              }
            );
        let current_chapters = res.data.current_chapters;
        this.current_chapters = [];
        for(let i=0; i< current_chapters.length; i++) {
          this.current_chapters.push(current_chapters[i]);
        }
        window.addEventListener("scroll", this.handle_scroll, true);
        this.$nextTick(() => {
          document.getElementById("chapter_"+(this.current_chapter_index-1)).scrollIntoView();
        })
        
      }
    },
    // 转到下一章
    async go_next(event) {
      let e = event || window.event;
      this.stopPropagation(e);
      this.is_menu = false;
      this.BodyScroll(false);
      if(this.current_chapter_index === this.chapter_num-1) {
        this.alert_msg = "已是最后一章！";
        this.is_alert = true;
        setTimeout(() => {
          this.is_alert = false;
        }, 1500);
        window.addEventListener("scroll", this.handle_scroll, true);
      } else {
        let res = await axios.post(CONF.host + "/novel_content", 
              { 
                novel_id: this.novel_id, 
                current_chapter_index: this.current_chapter_index + 1
              }
            );
        let current_chapters = res.data.current_chapters;
        this.current_chapters = [];
        for(let i=0; i< current_chapters.length; i++) {
          this.current_chapters.push(current_chapters[i]);
        }
        this.$nextTick(() => {
          document.getElementById("chapter_"+(this.current_chapter_index+1)).scrollIntoView();
          window.addEventListener("scroll", this.handle_scroll, true);
        })
      }
    },

    // 全局滚动事件监听处理函数
    async handle_scroll() {
      let content_scroll =
        document.body.scrollTop || document.documentElement.scrollTop;
      let content_height =
        document.body.scrollHeight || document.documentElement.scrollHeight;
      let screen_height =
        document.body.clientHeight || document.documentElement.clientHeight;

      if (content_scroll === 0) {
        if(this.is_search_control) {
          this.alert_msg = "请先关闭搜索!";
          this.is_alert = true;
          setTimeout(() => {
            this.is_alert = false;
          }, 1500);
          return;
        }
        if(this.chapter_num < 3) {
          this.alert_msg = "已到达小说顶部!";
          this.is_alert = true;
          setTimeout(() => {
            this.is_alert = false;
          }, 1500);
          return;
        }
        let current_middle_chapter = parseInt(
          this.current_chapters[1].chapter_index.split("_")[1]
        );
        if (current_middle_chapter !== 1) {
          let res = await axios.post(CONF.host + "/novel_content", 
            { 
              novel_id: this.novel_id, 
              current_chapter_index: current_middle_chapter - 1
            }
          );
          let current_chapters = res.data.current_chapters;
          this.current_chapters = [];
          for(let i=0; i< current_chapters.length; i++) {
            this.current_chapters.push(current_chapters[i]);
          }
          this.$nextTick(() => {
            let to_index = this.current_chapters[1].chapter_index;
            document.getElementById(to_index).scrollIntoView();
            this.$nextTick(() => {
              content_scroll =
                document.body.scrollTop || document.documentElement.scrollTop;
              document.body.scrollTop = content_scroll - 50;
              document.documentElement.scrollTop = content_scroll - 50;
            });
          });
        }
      }
      if (content_scroll + screen_height === content_height) {
        if(this.is_search_control) {
          this.alert_msg = "请先关闭搜索!";
          this.is_alert = true;
          setTimeout(() => {
            this.is_alert = false;
          }, 1500);
          return;
        }
        if(this.chapter_num < 3) {
          this.alert_msg = "已到达小说底部!";
          this.is_alert = true;
          setTimeout(() => {
            this.is_alert = false;
          }, 1500);
          return;
        }
        let current_middle_chapter = parseInt(
          this.current_chapters[1].chapter_index.split("_")[1]
        );
        if (current_middle_chapter !== this.chapter_num - 2) {
          let res = await axios.post(CONF.host + "/novel_content", 
            { 
              novel_id: this.novel_id, 
              current_chapter_index: current_middle_chapter + 1
            }
          );
          let current_chapters = res.data.current_chapters;
          this.current_chapters = [];
          for(let i=0; i< current_chapters.length; i++) {
            this.current_chapters.push(current_chapters[i]);
          }
          this.$nextTick(() => {
            let to_index = this.current_chapters[2].chapter_index;
            let last_box = document.getElementById(to_index);
            last_box.scrollIntoView();
            content_scroll = document.body.scrollTop || document.documentElement.scrollTop;
            document.body.scrollTop = content_scroll - screen_height + 50;
            document.documentElement.scrollTop = content_scroll - screen_height + 50;
          });
        } else {
          this.alert_msg = "已到达小说结尾！";
          this.is_alert = true;
          setTimeout(() => {
            this.is_alert = false;
          }, 1500);
          return;
        }
      }
    }
  },

  async mounted() {
    // 若有历史记录需修改
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    this.set_is_nav(false);
    this.novel_name = this.$route.query.novel_name;
    this.novel_id = this.$route.query.novel_id;
    // this.novel_name = novel_name.split(".txt")[0];
    // 若有历史记录需修改
    let novel_history = JSON.parse(localStorage.getItem(this.novel_id));
    if(novel_history !== null) {
      let current_chapter_index = parseInt(novel_history.current_chapter_index);
      let scroll_position = parseInt(novel_history.scroll_position);
      let res = await axios.post(CONF.host + "/novel_content", 
        { 
          novel_id: this.novel_id, 
          current_chapter_index
        }
      );
      let current_chapters = res.data.current_chapters;
      this.current_chapters = [];
      for(let i=0; i< current_chapters.length; i++) {
        this.current_chapters.push(current_chapters[i]);
      }
      this.chapter_num = res.data.chapter_num;
      this.$nextTick(() => {
        document.body.scrollTop = scroll_position;
        document.documentElement.scrollTop = scroll_position;
      });
    }
    else {
      let res = await axios.post(CONF.host + "/novel_content", 
        { 
          novel_id: this.novel_id, 
          current_chapter_index: 0 
        }
      );
      let current_chapters = res.data.current_chapters;
      this.current_chapters = [];
      for(let i=0; i< current_chapters.length; i++) {
        this.current_chapters.push(current_chapters[i]);
      }
      this.chapter_num = res.data.chapter_num;
    }
    
    this.loading = false;
    window.addEventListener("scroll", this.handle_scroll, true);
    setTimeout(async () => {
      let res = await axios.post(CONF.host + '/novel_content/chapter_titles',
        {
          novel_id: this.novel_id
        }
      );
      this.chapter_titles = res.data;
      this.catalogue_loading = false;
    }, 0);

  },
  watch: {
    current_chapters() {
      let current_first_chapter = parseInt(
        this.current_chapters[0].chapter_index.split("_")[1]
      );
      if (current_first_chapter === 0) 
        this.is_novel_name = true;
      else 
        this.is_novel_name = false;
    }
  },

  beforeRouteLeave (to, from, next) {
    let novel_id = this.novel_id;
    let novel_history = {};
    let current_chapter_index = 0;
    let scroll_position = document.body.scrollTop || document.documentElement.scrollTop;
    if(this.chapter_num >= 3) {
      current_chapter_index = parseInt(
          this.current_chapters[1].chapter_index.split("_")[1]
        );
    };
    novel_history = {
      current_chapter_index,
      scroll_position
    };

    localStorage.setItem(novel_id, JSON.stringify(novel_history));
    next();
  },

  destroyed() {
    this.set_is_nav(true);
    window.removeEventListener("scroll", this.handle_scroll, true);
  }
};
</script>

<style scoped>
#Novelcontent {
  height: 100%;
  width: 100%;
}
#novel-name {
  height: 80px;
  padding: 25px 0 25px 10px;
  line-height: 30px;
  font-size: 30px;
  font-weight: bold;
}
#content-load {
  height: 400px;
  width: 100%;
  text-align: center;
  line-height: 500px;
}
.chapter {
  text-align: left;
  width: 90%;
  font-size: 20px;
  word-break: break-all;
  word-wrap: break-word;
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
  background: white;
  width: 330px;
  height: 100%;
  opacity: 1.0;
}
#catalogue li {
    text-decoration: none;
    background: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 18px;
    padding: 10px;
    border-bottom: 0.1px solid grey;
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
  width: 330px;
  height: 100%;
  text-align: center;
  padding: 10px 0 0 0;
  background: white;
}
#bookmark-list {
  background: white;
  width: 330px;
  height: 100%;
  opacity: 1.0;
}
#bookmark li {
    text-decoration: none;
    background: white;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 18px;
    padding: 10px;
    border-bottom: 0.1px solid grey;
    -webkit-touch-callout:none;
    -webkit-user-select:none;
    -khtml-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
}

#search {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
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
  width: 90%;
}
#search-res li {
  font-size: 16px;
  border-bottom: .05px solid #aaaaaa;
  padding: 4px 0;
}

#search-control {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
}

.alert-msg {
  height: 40px;
  line-height: 40px;
  border-radius: 5px;
  text-align: center;
  opacity: 0.8;
}
</style>