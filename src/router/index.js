import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import Bookcity from '@/components/Bookcity'
import BookcityHome from '@/components/Bookcity/BookcityHome'
import Searchres from '@/components/Bookcity/Searchres'
import Booktype from '@/components/Bookcity/Booktype'
import Ranklist from '@/components/Bookcity/Ranklist'
import Endbook from '@/components/Bookcity/Endbook'
import Bookdetail from '@/components/Bookcity/Bookdetail'
import Bookread from '@/components/Bookcity/Bookread'
import Myinfo from '@/components/Myinfo'
import Novelcontent from '@/components/Novelcontent'

// 解决两次访问相同路由地址报错
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
        keepAlive: true
      }
    },
    {
      path: '/bookcity',
      name: "Bookcity",
      component: Bookcity,
      meta: {
        keepAlive: true
      },
      children: [
        {
          path: '/',
          component: BookcityHome,
          meta: {
            keepAlive: true
          }
        },
        {
          path: '/searchres',
          component: Searchres,
          meta: {
            keepAlive: true
          }
        },
    ]
    },
    {
      path: '/myinfo',
      name: "Myinfo",
      component: Myinfo,
      meta: {
        keepAlive: true
      }
    },
    {
      path: "/novelcontent",
      name: "Novelcontent",
      component: Novelcontent,
      meta: {
        keepAlive: false
      }
    },
    {
      path: '/booktype',
      component: Booktype,
      meta: {
        keepAlive: true
      }
    },
    {
      path: "/ranklist",
      component: Ranklist,
      meta: {
        keepAlive: true
      }
    },
    {
      path: "/endbook",
      component: Endbook,
      meta: {
        keepAlive: true
      }
    },
    {
      path: "/bookdetail",
      component: Bookdetail,
      meta: {
        keepAlive: true
      }
    },
    {
      path: "/bookread",
      component: Bookread,
      meta: {
        keepAlive: false
      }
    },
  ]
})
