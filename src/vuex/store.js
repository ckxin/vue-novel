import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const state = {
    current_window_index: 0,
    is_nav: true,
    list_scroll: 0,
    book_search_scroll: 0,
    bookcity_home_scroll: 0,
    novel_list: []
}

const mutations = {
    set_is_nav(state, is_nav) {
        state.is_nav = is_nav;
    },
    set_list_scroll(state, list_scroll) {
        state.list_scroll = list_scroll;
    },
    set_book_search_scroll(state, book_search_scroll) {
        state.book_search_scroll = book_search_scroll;
    },
    set_bookcity_home_scroll(state, bookcity_home_scroll) {
        state.bookcity_home_scroll = bookcity_home_scroll;
    },
    set_current_window_index(state, current_window_index) {
        state.current_window_index = current_window_index;
    },
    set_novel_list(state, novel_list) {
        state.novel_list = novel_list;
    }
}

export default new Vuex.Store({
    state, mutations
})