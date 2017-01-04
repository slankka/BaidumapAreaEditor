/**
 * Created on 2017/1/4.
 */

//防止重复添加单击事件监听处理器，修复原始addEventListener的bug
BMap.Map.prototype.on =
    BMap.Map.prototype.addEventListener = function (type, handler, key) {
        if (typeof handler != "function") {
            return;
        }
        !handler.al && (handler.al = {});
        !this.Hi && (this.Hi = {});

        var listeners = this.Hi, e;
        if (typeof key == "string" && key) {
            /[^\w\-]/.test(key) && console.log("nonstandard key:" + key);
            e = handler.Dx = key
        }
        type.indexOf("on") && (type = "on" + type);

        typeof listeners[type] != "object" && (listeners[type] = {});
        typeof handler.al[type] != "object" && (handler.al[type] = {});

        // 避免函数重复注册
        for (var li in listeners[type]) {
            if (listeners[type].hasOwnProperty(li) && listeners[type][li] === handler){
                return handler;
            }
        }
        e = e || myguid("$BAIDU$");
        listeners[type][e] = handler;
        handler.al[type].Dx = e;
        key && typeof key == "string" && (listeners[type][key] = handler);

        return handler;
    };

var my = {};
my.isfunction = function(a) {
    return "[object Function]" == Object.prototype.toString.call(a)
};
my.isString = function(a) {
    return "[object String]" == Object.prototype.toString.call(a)
};

BMap.Map.prototype.removeEventListener = function(type, handler) {
    type.indexOf("on") != 0 && (type = "on" + type);
    if (my.isfunction(handler)) {
        if (!handler.al || !handler.al[type])
            return;
        handler = handler.al[type].Dx
    } else if (!my.isString(handler))
        return;
    !this.Hi && (this.Hi = {});
    var c = this.Hi;
    c[type] && c[type][handler] && delete c[type][handler]
};

function myguid(index){
    return "TANGRAM__" + (window[index]._counter++).toString(36);
}