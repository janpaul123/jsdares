function __prototypeForObject (proto, obj) {
    return Object.create(proto, Object.getOwnPropertyDescriptors(obj));
}
