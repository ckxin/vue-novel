# vue-novel

> 基于Vue和express的小说阅读系统

## Build Setup

``` bash
# client(vue) install dependencies and start
npm install
npm run dev
#server(express) install dependencies and start
cd server/
npm install (or cnpm install)
npm start


# build for production with minification
npm run build
#then, copy all files(static directory and index.html file) in the dist directory to server/public, and then
cd server
npm start

# build for production and view the bundle analyzer report
npm run build --report
```

如上所述，有两种启动方式，一种直接启动客户端(vue)和服务器(express)，另一种将客户端文件打包，然后将/dist文件夹下所有内容拷贝到/server/public/文件夹下，然后仅运行服务器即可

# 系统介绍
系统分为书架和书城两部分，书架中可添加本地书籍和书城书籍，并利用localStorage为书架中的书籍提供加密，解密，保存阅读记录和书签等功能

## 添加本地书籍
其实是添加伪本地书籍，因为前端并不能直接操作内存，因此是将书籍添加到/server/public/TXT文件夹中，再对书籍进行分章等处理后回应客户端请求，实现伪本地书籍阅读

## 添加书城书籍
进入书城，利用搜索或推荐，分类等功能找到想要阅读的书籍，点击进入书籍详情页，点击加入书架即可。或在阅读结束后返回前会提示是否加入书架，点击是即可

**注：** 由于书城是利用爬虫爬取的书籍信息，因此获取书籍或阅读时可能会发生网络延迟，网络错误等，返回并刷新即可，若仍不能解决问题，说明该书籍无法获取

# 功能简介
## 阅读功能
### 1.连续阅读(上拉加载下一章，下拉加载上一章)
### 2.本地书籍有全文搜索功能，由于书城书籍无法直接获取到全文，因此暂时没有搜索功能
### 3.改变阅读背景和字体大小
### 4.上一章和下一章
### 5.小说目录及章节跳转
### 6.书签保存
### 7.阅读记录，最新阅读

## 书架功能
### 1.书架书籍搜索
### 2.单击打开书籍，长按删除或隐藏书籍
### 3.显示隐藏书籍，取消隐藏书籍，修改隐藏书籍密码

## 书城功能
### 1.书籍搜索，支持对书名和作者分别进行搜索
### 2.热门书籍推荐
### 3.小说分类
### 4.小说排行榜(Top20)
### 4.完本小说

更多功能请自行体验(●'◡'●)


