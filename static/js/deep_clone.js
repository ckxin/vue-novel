function deep_clone(obj) {
    let buf;
    if(obj instanceof Array){
        buf = [];
        let length = obj.length;
        for(let i=0; i<length; i++)
            buf[i] = deep_clone(obj[i]);
        return buf;
    } else if(obj === null){
        buf = null;
        return buf;
    } else if(obj.constructor === RegExp){
        buf = obj;
        return buf;
    } else if(obj instanceof Object){
        buf = {};
        for(let i in obj){
            buf[i] = deep_clone(obj[i])
        }
        return buf;
    } else {
        buf = obj;
        return buf;
    }
}

export default deep_clone