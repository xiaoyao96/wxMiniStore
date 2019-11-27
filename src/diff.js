import { _typeOf, _deepClone, TYPE_ARRAY, TYPE_OBJECT } from "./common";
/**
 * diff库
 * @author Leisure
 * @update 2019.11.27
 * @param {object} current - 当前状态
 * @param {object} prev - 之前状态
 */
const diff = function diff(current = {}, prev = {}) {
  let result = {};
  updateDiff(current, prev, "", result);
  nullDiff(current, prev, "", result);
  return result;
};

const updateDiff = function updateDiff(
  current = {},
  prev = {},
  root = "",
  result = {}
) {
  Object.entries(current).forEach(item => {
    let key = item[0],
      value = item[1],
      path = root === "" ? key : root + "." + key;
    if (_typeOf(current) === TYPE_ARRAY) {
      path = root === "" ? key : root + "[" + key + "]";
    }

    if (!prev.hasOwnProperty(key)) {
      if (_typeOf(current) === TYPE_ARRAY) {
        let copyCurrent = _deepClone(current);
        copyCurrent[key] = value;
        Object.keys(result).forEach(rk => {
          if (~rk.indexOf(root + "[") || ~rk.indexOf(root + ".")) {
            delete result[rk];
          }
        });
        result[root] = copyCurrent;
      } else {
        result[path] = value;
      }
    } else if (
      (_typeOf(prev[key]) === TYPE_OBJECT &&
        _typeOf(current[key]) === TYPE_OBJECT) ||
      (_typeOf(prev[key]) === TYPE_ARRAY &&
        _typeOf(current[key]) === TYPE_ARRAY)
    ) {
      updateDiff(current[key], prev[key], path, result);
    } else if (prev[key] !== current[key]) {
      result[path] = value;
    }
  });
  return result;
};

const nullDiff = function nullDiff(
  current = {},
  prev = {},
  root = "",
  result = {}
) {
  Object.entries(prev).forEach(item => {
    let key = item[0],
      path = root === "" ? key : root + "." + key;
    if (_typeOf(current) === TYPE_ARRAY) {
      path = root === "" ? key : root + "[" + key + "]";
    }

    if (!current.hasOwnProperty(key)) {
      if (_typeOf(current) === TYPE_ARRAY) {
        let copyCurrent = _deepClone(current);
        copyCurrent.splice(key, 1);
        Object.keys(result).forEach(rk => {
          if (~rk.indexOf(root + "[") || ~rk.indexOf(root + ".")) {
            delete result[rk];
          }
        });
        result[root] = copyCurrent;
      } else {
        result[path] = null;
      }
    } else if (
      (_typeOf(prev[key]) === TYPE_OBJECT &&
        _typeOf(current[key]) === TYPE_OBJECT) ||
      (_typeOf(prev[key]) === TYPE_ARRAY &&
        _typeOf(current[key]) === TYPE_ARRAY)
    ) {
      nullDiff(current[key], prev[key], path, result);
    }
  });
  return result;
};

export default diff;
