function __set (sup, prop, that, val) {
    var desc = Object.getOwnPropertyDescriptor(sup, prop);
    return desc.get ?
        desc.set.call(that, val) :
        that[prop] = val;
}
