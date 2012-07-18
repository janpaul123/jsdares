function __get (sup, prop, that) {
    var desc = Object.getOwnPropertyDescriptor(sup, prop);
    return desc.get ?
        desc.get.call(that) :
        desc.value;
}
