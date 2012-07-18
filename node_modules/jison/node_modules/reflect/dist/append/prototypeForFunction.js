function __prototypeForFunction (proto, obj) {
    obj.__proto__ = proto;
    obj.prototype = {
        __proto__: proto.prototype,
        constructor: obj
    };
    return obj;
}
