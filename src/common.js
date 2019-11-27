export const TYPE_ARRAY = "[object Array]";
export const TYPE_OBJECT = "[object Object]";
export const _typeOf = function(val) {
  return Object.prototype.toString.call(val);
};
export const _deepClone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};
