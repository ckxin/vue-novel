const axios = require('axios');
const qs = require('querystring');
const iconv = require('iconv-lite');

const search_req = axios.create({
    url: "https://www.2952.cc/modules/article/search.php",
    method: "POST",
    responseType: 'arraybuffer',
    data: {},
    headers: {
        'Content-Type':'application/x-www-form-urlencoded;charset=GB2312',
    },
    transformRequest: [function (data) {
        data = qs.stringify(data, null, null, { encodeURIComponent: function (str){
            var chinese = new RegExp(/[^\x00-\xff]/g);
            var gbkBuffer = null;
            var i = 0;
            var tempStr = '';
            if (chinese.test(str)){//
                gbkBuffer = iconv.encode(str,'gbk');
                for (i; i<gbkBuffer.length; i++) {
                    tempStr += '%' + gbkBuffer[i].toString(16);
                };
                tempStr = tempStr.toUpperCase();
                return tempStr;
            }else{
                return qs.escape(str);
            }
        }});
        return data;
        }],
});

let  get_search_html = async function(data) {
    try {
        let res = await search_req({data});
        let buf = Buffer.from(res.data, 'binary');
        const str = iconv.decode(buf, 'gbk');
        return str;
    }
    catch(err) {
        console.log("get_searchres error:");
        console.log(err);
    }
}

module.exports = get_search_html;