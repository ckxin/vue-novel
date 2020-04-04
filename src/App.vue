<template>
  <div id="app">
    <!-- <transition name="fades" mode="out-in"> -->
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"/>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" />
    <!-- </transition> -->
    
    <div id="win-select" class="fixed-bottom row py-3" @click="select_window" v-if="is_nav">
      <div class="col-6 text-center">
        <a href="javascript:" style="color: #28a745">
          <img :src="book_img" alt="bookshelft" width="32px">
          <div>书架</div>
        </a>
      </div>
      <div class="col-6 text-center">
        <a href="javascript:">
          <img :src="book_city_img" alt="bookcity" width="32px">
          <div>书城</div>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import store from '@/vuex/store';
import { mapState, mapMutations } from 'vuex'

export default {
  name: 'App',
  data() {
    return {
      book_img: require('../static/img/icon/book_green.png'),
      book_img_before: require('../static/img/icon/book.png'),
      book_img_after: require('../static/img/icon/book_green.png'),
      book_city_img: require('../static/img/icon/book_city.png'),
      book_city_img_before: require('../static/img/icon/book_city.png'),
      book_city_img_after: require('../static/img/icon/book_city_green.png'),
      my_img: require('../static/img/icon/my.png'),
      my_img_before: require('../static/img/icon/my.png'),
      my_img_after: require('../static/img/icon/my_green.png'),
    }
  },
  store,
  computed: {
    ...mapState(['current_window_index', 'is_nav'])
  },
  methods: {
    ...mapMutations(['set_current_window_index']),
    select_window(event) {
      let window_index = [].indexOf.call(event.currentTarget.children, event.target.parentNode.parentNode);
      if(window_index === this.current_window_index)
        return;
      this.set_current_window_index(window_index);
    }
  },

  mounted() {
    let link_items = document.getElementById("win-select").getElementsByTagName("a");
    let current_route = this.$route.path;
    if(current_route === "/") {
      this.set_current_window_index(0);
    } else if(current_route === "/bookcity") {
      this.set_current_window_index(1);
    }
  },

  watch: {
    current_window_index() {
      let link_items = document.getElementById("win-select").getElementsByTagName("a");
      switch(this.current_window_index) {
        case 0: {
          this.book_img = this.book_img_after;
          this.book_city_img = this.book_city_img_before;
          this.my_img = this.my_img_before;
          link_items[0].style = "color: #28a745";
          link_items[1].style = "color: #555";
          this.$router.push("/");
          break
        }
        case 1: {
          this.book_img = this.book_img_before;
          this.book_city_img = this.book_city_img_after;
          this.my_img = this.my_img_before;
          link_items[0].style = "color: #555";
          link_items[1].style = "color: #28a745";
          this.$router.push('/bookcity')
          break
        }
      }
    }
  }
}
</script>

<style>
body, html {
  height: 100%;
  width: 100%;
}

#app {
    height: 100%;
    width: 100%;
}
#win-select {
  z-index: 100;
}
.fixed-bottom {
  background: white;
}

.fades-leave {
  opacity: 1;
}
.fades-leave-active {
  opacity: 0;
  transition: opacity .5s;;
}
.fades-enter {
  opacity: 0;
}
.fades-enter-active {
  transition: opacity .5s;
}

</style>
