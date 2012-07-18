// To be part of ES.next
if (!Object.getOwnPropertyDescriptors) {
    Object.getOwnPropertyDescriptors = function (obj) {
        var descriptors = {};
        Object.getOwnPropertyNames(obj).forEach(function (prop) {
            descriptors[prop] = Object.getOwnPropertyDescriptor(obj, prop);
            });
        return descriptors;
    };
}
var __DMP__ = "__DEFMETHPROP__";
Object.defineMethod = function (obj, name, method) {
    if (__DMP__ in method) {
        var proto = Object.getPrototypeOf(obj);
        obj[name] = method[__DMP__](proto);
    } else {
        obj[name] = method;
    }
    return obj;
};
// end ES.next
