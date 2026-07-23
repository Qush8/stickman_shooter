"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/matter-js/build/matter.js
  var require_matter = __commonJS({
    "node_modules/matter-js/build/matter.js"(exports, module) {
      (function webpackUniversalModuleDefinition(root, factory) {
        if (typeof exports === "object" && typeof module === "object")
          module.exports = factory();
        else if (typeof define === "function" && define.amd)
          define("Matter", [], factory);
        else if (typeof exports === "object")
          exports["Matter"] = factory();
        else
          root["Matter"] = factory();
      })(exports, function() {
        return (
          /******/
          function(modules) {
            var installedModules = {};
            function __webpack_require__(moduleId) {
              if (installedModules[moduleId]) {
                return installedModules[moduleId].exports;
              }
              var module2 = installedModules[moduleId] = {
                /******/
                i: moduleId,
                /******/
                l: false,
                /******/
                exports: {}
                /******/
              };
              modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
              module2.l = true;
              return module2.exports;
            }
            __webpack_require__.m = modules;
            __webpack_require__.c = installedModules;
            __webpack_require__.d = function(exports2, name, getter) {
              if (!__webpack_require__.o(exports2, name)) {
                Object.defineProperty(exports2, name, { enumerable: true, get: getter });
              }
            };
            __webpack_require__.r = function(exports2) {
              if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
              }
              Object.defineProperty(exports2, "__esModule", { value: true });
            };
            __webpack_require__.t = function(value, mode) {
              if (mode & 1) value = __webpack_require__(value);
              if (mode & 8) return value;
              if (mode & 4 && typeof value === "object" && value && value.__esModule) return value;
              var ns = /* @__PURE__ */ Object.create(null);
              __webpack_require__.r(ns);
              Object.defineProperty(ns, "default", { enumerable: true, value });
              if (mode & 2 && typeof value != "string") for (var key in value) __webpack_require__.d(ns, key, function(key2) {
                return value[key2];
              }.bind(null, key));
              return ns;
            };
            __webpack_require__.n = function(module2) {
              var getter = module2 && module2.__esModule ? (
                /******/
                function getDefault() {
                  return module2["default"];
                }
              ) : (
                /******/
                function getModuleExports() {
                  return module2;
                }
              );
              __webpack_require__.d(getter, "a", getter);
              return getter;
            };
            __webpack_require__.o = function(object, property) {
              return Object.prototype.hasOwnProperty.call(object, property);
            };
            __webpack_require__.p = "";
            return __webpack_require__(__webpack_require__.s = 20);
          }([
            /* 0 */
            /***/
            function(module2, exports2) {
              var Common = {};
              module2.exports = Common;
              (function() {
                Common._baseDelta = 1e3 / 60;
                Common._nextId = 0;
                Common._seed = 0;
                Common._nowStartTime = +/* @__PURE__ */ new Date();
                Common._warnedOnce = {};
                Common._decomp = null;
                Common.extend = function(obj, deep) {
                  var argsStart, args, deepClone2;
                  if (typeof deep === "boolean") {
                    argsStart = 2;
                    deepClone2 = deep;
                  } else {
                    argsStart = 1;
                    deepClone2 = true;
                  }
                  for (var i = argsStart; i < arguments.length; i++) {
                    var source = arguments[i];
                    if (source) {
                      for (var prop in source) {
                        if (deepClone2 && source[prop] && source[prop].constructor === Object) {
                          if (!obj[prop] || obj[prop].constructor === Object) {
                            obj[prop] = obj[prop] || {};
                            Common.extend(obj[prop], deepClone2, source[prop]);
                          } else {
                            obj[prop] = source[prop];
                          }
                        } else {
                          obj[prop] = source[prop];
                        }
                      }
                    }
                  }
                  return obj;
                };
                Common.clone = function(obj, deep) {
                  return Common.extend({}, deep, obj);
                };
                Common.keys = function(obj) {
                  if (Object.keys)
                    return Object.keys(obj);
                  var keys = [];
                  for (var key in obj)
                    keys.push(key);
                  return keys;
                };
                Common.values = function(obj) {
                  var values = [];
                  if (Object.keys) {
                    var keys = Object.keys(obj);
                    for (var i = 0; i < keys.length; i++) {
                      values.push(obj[keys[i]]);
                    }
                    return values;
                  }
                  for (var key in obj)
                    values.push(obj[key]);
                  return values;
                };
                Common.get = function(obj, path, begin, end) {
                  path = path.split(".").slice(begin, end);
                  for (var i = 0; i < path.length; i += 1) {
                    obj = obj[path[i]];
                  }
                  return obj;
                };
                Common.set = function(obj, path, val, begin, end) {
                  var parts = path.split(".").slice(begin, end);
                  Common.get(obj, path, 0, -1)[parts[parts.length - 1]] = val;
                  return val;
                };
                Common.shuffle = function(array) {
                  for (var i = array.length - 1; i > 0; i--) {
                    var j = Math.floor(Common.random() * (i + 1));
                    var temp = array[i];
                    array[i] = array[j];
                    array[j] = temp;
                  }
                  return array;
                };
                Common.choose = function(choices) {
                  return choices[Math.floor(Common.random() * choices.length)];
                };
                Common.isElement = function(obj) {
                  if (typeof HTMLElement !== "undefined") {
                    return obj instanceof HTMLElement;
                  }
                  return !!(obj && obj.nodeType && obj.nodeName);
                };
                Common.isArray = function(obj) {
                  return Object.prototype.toString.call(obj) === "[object Array]";
                };
                Common.isFunction = function(obj) {
                  return typeof obj === "function";
                };
                Common.isPlainObject = function(obj) {
                  return typeof obj === "object" && obj.constructor === Object;
                };
                Common.isString = function(obj) {
                  return toString.call(obj) === "[object String]";
                };
                Common.clamp = function(value, min, max) {
                  if (value < min)
                    return min;
                  if (value > max)
                    return max;
                  return value;
                };
                Common.sign = function(value) {
                  return value < 0 ? -1 : 1;
                };
                Common.now = function() {
                  if (typeof window !== "undefined" && window.performance) {
                    if (window.performance.now) {
                      return window.performance.now();
                    } else if (window.performance.webkitNow) {
                      return window.performance.webkitNow();
                    }
                  }
                  if (Date.now) {
                    return Date.now();
                  }
                  return /* @__PURE__ */ new Date() - Common._nowStartTime;
                };
                Common.random = function(min, max) {
                  min = typeof min !== "undefined" ? min : 0;
                  max = typeof max !== "undefined" ? max : 1;
                  return min + _seededRandom() * (max - min);
                };
                var _seededRandom = function() {
                  Common._seed = (Common._seed * 9301 + 49297) % 233280;
                  return Common._seed / 233280;
                };
                Common.colorToNumber = function(colorString) {
                  colorString = colorString.replace("#", "");
                  if (colorString.length == 3) {
                    colorString = colorString.charAt(0) + colorString.charAt(0) + colorString.charAt(1) + colorString.charAt(1) + colorString.charAt(2) + colorString.charAt(2);
                  }
                  return parseInt(colorString, 16);
                };
                Common.logLevel = 1;
                Common.log = function() {
                  if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
                    console.log.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                  }
                };
                Common.info = function() {
                  if (console && Common.logLevel > 0 && Common.logLevel <= 2) {
                    console.info.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                  }
                };
                Common.warn = function() {
                  if (console && Common.logLevel > 0 && Common.logLevel <= 3) {
                    console.warn.apply(console, ["matter-js:"].concat(Array.prototype.slice.call(arguments)));
                  }
                };
                Common.warnOnce = function() {
                  var message = Array.prototype.slice.call(arguments).join(" ");
                  if (!Common._warnedOnce[message]) {
                    Common.warn(message);
                    Common._warnedOnce[message] = true;
                  }
                };
                Common.deprecated = function(obj, prop, warning) {
                  obj[prop] = Common.chain(function() {
                    Common.warnOnce("\u{1F505} deprecated \u{1F505}", warning);
                  }, obj[prop]);
                };
                Common.nextId = function() {
                  return Common._nextId++;
                };
                Common.indexOf = function(haystack, needle) {
                  if (haystack.indexOf)
                    return haystack.indexOf(needle);
                  for (var i = 0; i < haystack.length; i++) {
                    if (haystack[i] === needle)
                      return i;
                  }
                  return -1;
                };
                Common.map = function(list, func) {
                  if (list.map) {
                    return list.map(func);
                  }
                  var mapped = [];
                  for (var i = 0; i < list.length; i += 1) {
                    mapped.push(func(list[i]));
                  }
                  return mapped;
                };
                Common.topologicalSort = function(graph) {
                  var result = [], visited = [], temp = [];
                  for (var node in graph) {
                    if (!visited[node] && !temp[node]) {
                      Common._topologicalSort(node, visited, temp, graph, result);
                    }
                  }
                  return result;
                };
                Common._topologicalSort = function(node, visited, temp, graph, result) {
                  var neighbors = graph[node] || [];
                  temp[node] = true;
                  for (var i = 0; i < neighbors.length; i += 1) {
                    var neighbor = neighbors[i];
                    if (temp[neighbor]) {
                      continue;
                    }
                    if (!visited[neighbor]) {
                      Common._topologicalSort(neighbor, visited, temp, graph, result);
                    }
                  }
                  temp[node] = false;
                  visited[node] = true;
                  result.push(node);
                };
                Common.chain = function() {
                  var funcs = [];
                  for (var i = 0; i < arguments.length; i += 1) {
                    var func = arguments[i];
                    if (func._chained) {
                      funcs.push.apply(funcs, func._chained);
                    } else {
                      funcs.push(func);
                    }
                  }
                  var chain = function() {
                    var lastResult, args = new Array(arguments.length);
                    for (var i2 = 0, l = arguments.length; i2 < l; i2++) {
                      args[i2] = arguments[i2];
                    }
                    for (i2 = 0; i2 < funcs.length; i2 += 1) {
                      var result = funcs[i2].apply(lastResult, args);
                      if (typeof result !== "undefined") {
                        lastResult = result;
                      }
                    }
                    return lastResult;
                  };
                  chain._chained = funcs;
                  return chain;
                };
                Common.chainPathBefore = function(base, path, func) {
                  return Common.set(base, path, Common.chain(
                    func,
                    Common.get(base, path)
                  ));
                };
                Common.chainPathAfter = function(base, path, func) {
                  return Common.set(base, path, Common.chain(
                    Common.get(base, path),
                    func
                  ));
                };
                Common.setDecomp = function(decomp) {
                  Common._decomp = decomp;
                };
                Common.getDecomp = function() {
                  var decomp = Common._decomp;
                  try {
                    if (!decomp && typeof window !== "undefined") {
                      decomp = window.decomp;
                    }
                    if (!decomp && typeof global !== "undefined") {
                      decomp = global.decomp;
                    }
                  } catch (e) {
                    decomp = null;
                  }
                  return decomp;
                };
              })();
            },
            /* 1 */
            /***/
            function(module2, exports2) {
              var Bounds = {};
              module2.exports = Bounds;
              (function() {
                Bounds.create = function(vertices) {
                  var bounds = {
                    min: { x: 0, y: 0 },
                    max: { x: 0, y: 0 }
                  };
                  if (vertices)
                    Bounds.update(bounds, vertices);
                  return bounds;
                };
                Bounds.update = function(bounds, vertices, velocity) {
                  bounds.min.x = Infinity;
                  bounds.max.x = -Infinity;
                  bounds.min.y = Infinity;
                  bounds.max.y = -Infinity;
                  for (var i = 0; i < vertices.length; i++) {
                    var vertex = vertices[i];
                    if (vertex.x > bounds.max.x) bounds.max.x = vertex.x;
                    if (vertex.x < bounds.min.x) bounds.min.x = vertex.x;
                    if (vertex.y > bounds.max.y) bounds.max.y = vertex.y;
                    if (vertex.y < bounds.min.y) bounds.min.y = vertex.y;
                  }
                  if (velocity) {
                    if (velocity.x > 0) {
                      bounds.max.x += velocity.x;
                    } else {
                      bounds.min.x += velocity.x;
                    }
                    if (velocity.y > 0) {
                      bounds.max.y += velocity.y;
                    } else {
                      bounds.min.y += velocity.y;
                    }
                  }
                };
                Bounds.contains = function(bounds, point) {
                  return point.x >= bounds.min.x && point.x <= bounds.max.x && point.y >= bounds.min.y && point.y <= bounds.max.y;
                };
                Bounds.overlaps = function(boundsA, boundsB) {
                  return boundsA.min.x <= boundsB.max.x && boundsA.max.x >= boundsB.min.x && boundsA.max.y >= boundsB.min.y && boundsA.min.y <= boundsB.max.y;
                };
                Bounds.translate = function(bounds, vector) {
                  bounds.min.x += vector.x;
                  bounds.max.x += vector.x;
                  bounds.min.y += vector.y;
                  bounds.max.y += vector.y;
                };
                Bounds.shift = function(bounds, position) {
                  var deltaX = bounds.max.x - bounds.min.x, deltaY = bounds.max.y - bounds.min.y;
                  bounds.min.x = position.x;
                  bounds.max.x = position.x + deltaX;
                  bounds.min.y = position.y;
                  bounds.max.y = position.y + deltaY;
                };
              })();
            },
            /* 2 */
            /***/
            function(module2, exports2) {
              var Vector = {};
              module2.exports = Vector;
              (function() {
                Vector.create = function(x, y) {
                  return { x: x || 0, y: y || 0 };
                };
                Vector.clone = function(vector) {
                  return { x: vector.x, y: vector.y };
                };
                Vector.magnitude = function(vector) {
                  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
                };
                Vector.magnitudeSquared = function(vector) {
                  return vector.x * vector.x + vector.y * vector.y;
                };
                Vector.rotate = function(vector, angle, output) {
                  var cos = Math.cos(angle), sin = Math.sin(angle);
                  if (!output) output = {};
                  var x = vector.x * cos - vector.y * sin;
                  output.y = vector.x * sin + vector.y * cos;
                  output.x = x;
                  return output;
                };
                Vector.rotateAbout = function(vector, angle, point, output) {
                  var cos = Math.cos(angle), sin = Math.sin(angle);
                  if (!output) output = {};
                  var x = point.x + ((vector.x - point.x) * cos - (vector.y - point.y) * sin);
                  output.y = point.y + ((vector.x - point.x) * sin + (vector.y - point.y) * cos);
                  output.x = x;
                  return output;
                };
                Vector.normalise = function(vector) {
                  var magnitude = Vector.magnitude(vector);
                  if (magnitude === 0)
                    return { x: 0, y: 0 };
                  return { x: vector.x / magnitude, y: vector.y / magnitude };
                };
                Vector.dot = function(vectorA, vectorB) {
                  return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
                };
                Vector.cross = function(vectorA, vectorB) {
                  return vectorA.x * vectorB.y - vectorA.y * vectorB.x;
                };
                Vector.cross3 = function(vectorA, vectorB, vectorC) {
                  return (vectorB.x - vectorA.x) * (vectorC.y - vectorA.y) - (vectorB.y - vectorA.y) * (vectorC.x - vectorA.x);
                };
                Vector.add = function(vectorA, vectorB, output) {
                  if (!output) output = {};
                  output.x = vectorA.x + vectorB.x;
                  output.y = vectorA.y + vectorB.y;
                  return output;
                };
                Vector.sub = function(vectorA, vectorB, output) {
                  if (!output) output = {};
                  output.x = vectorA.x - vectorB.x;
                  output.y = vectorA.y - vectorB.y;
                  return output;
                };
                Vector.mult = function(vector, scalar) {
                  return { x: vector.x * scalar, y: vector.y * scalar };
                };
                Vector.div = function(vector, scalar) {
                  return { x: vector.x / scalar, y: vector.y / scalar };
                };
                Vector.perp = function(vector, negate) {
                  negate = negate === true ? -1 : 1;
                  return { x: negate * -vector.y, y: negate * vector.x };
                };
                Vector.neg = function(vector) {
                  return { x: -vector.x, y: -vector.y };
                };
                Vector.angle = function(vectorA, vectorB) {
                  return Math.atan2(vectorB.y - vectorA.y, vectorB.x - vectorA.x);
                };
                Vector._temp = [
                  Vector.create(),
                  Vector.create(),
                  Vector.create(),
                  Vector.create(),
                  Vector.create(),
                  Vector.create()
                ];
              })();
            },
            /* 3 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Vertices = {};
              module2.exports = Vertices;
              var Vector = __webpack_require__(2);
              var Common = __webpack_require__(0);
              (function() {
                Vertices.create = function(points, body) {
                  var vertices = [];
                  for (var i = 0; i < points.length; i++) {
                    var point = points[i], vertex = {
                      x: point.x,
                      y: point.y,
                      index: i,
                      body,
                      isInternal: false
                    };
                    vertices.push(vertex);
                  }
                  return vertices;
                };
                Vertices.fromPath = function(path, body) {
                  var pathPattern = /L?\s*([-\d.e]+)[\s,]*([-\d.e]+)*/ig, points = [];
                  path.replace(pathPattern, function(match, x, y) {
                    points.push({ x: parseFloat(x), y: parseFloat(y) });
                  });
                  return Vertices.create(points, body);
                };
                Vertices.centre = function(vertices) {
                  var area = Vertices.area(vertices, true), centre = { x: 0, y: 0 }, cross, temp, j;
                  for (var i = 0; i < vertices.length; i++) {
                    j = (i + 1) % vertices.length;
                    cross = Vector.cross(vertices[i], vertices[j]);
                    temp = Vector.mult(Vector.add(vertices[i], vertices[j]), cross);
                    centre = Vector.add(centre, temp);
                  }
                  return Vector.div(centre, 6 * area);
                };
                Vertices.mean = function(vertices) {
                  var average = { x: 0, y: 0 };
                  for (var i = 0; i < vertices.length; i++) {
                    average.x += vertices[i].x;
                    average.y += vertices[i].y;
                  }
                  return Vector.div(average, vertices.length);
                };
                Vertices.area = function(vertices, signed) {
                  var area = 0, j = vertices.length - 1;
                  for (var i = 0; i < vertices.length; i++) {
                    area += (vertices[j].x - vertices[i].x) * (vertices[j].y + vertices[i].y);
                    j = i;
                  }
                  if (signed)
                    return area / 2;
                  return Math.abs(area) / 2;
                };
                Vertices.inertia = function(vertices, mass) {
                  var numerator = 0, denominator = 0, v = vertices, cross, j;
                  for (var n = 0; n < v.length; n++) {
                    j = (n + 1) % v.length;
                    cross = Math.abs(Vector.cross(v[j], v[n]));
                    numerator += cross * (Vector.dot(v[j], v[j]) + Vector.dot(v[j], v[n]) + Vector.dot(v[n], v[n]));
                    denominator += cross;
                  }
                  return mass / 6 * (numerator / denominator);
                };
                Vertices.translate = function(vertices, vector, scalar) {
                  scalar = typeof scalar !== "undefined" ? scalar : 1;
                  var verticesLength = vertices.length, translateX = vector.x * scalar, translateY = vector.y * scalar, i;
                  for (i = 0; i < verticesLength; i++) {
                    vertices[i].x += translateX;
                    vertices[i].y += translateY;
                  }
                  return vertices;
                };
                Vertices.rotate = function(vertices, angle, point) {
                  if (angle === 0)
                    return;
                  var cos = Math.cos(angle), sin = Math.sin(angle), pointX = point.x, pointY = point.y, verticesLength = vertices.length, vertex, dx, dy, i;
                  for (i = 0; i < verticesLength; i++) {
                    vertex = vertices[i];
                    dx = vertex.x - pointX;
                    dy = vertex.y - pointY;
                    vertex.x = pointX + (dx * cos - dy * sin);
                    vertex.y = pointY + (dx * sin + dy * cos);
                  }
                  return vertices;
                };
                Vertices.contains = function(vertices, point) {
                  var pointX = point.x, pointY = point.y, verticesLength = vertices.length, vertex = vertices[verticesLength - 1], nextVertex;
                  for (var i = 0; i < verticesLength; i++) {
                    nextVertex = vertices[i];
                    if ((pointX - vertex.x) * (nextVertex.y - vertex.y) + (pointY - vertex.y) * (vertex.x - nextVertex.x) > 0) {
                      return false;
                    }
                    vertex = nextVertex;
                  }
                  return true;
                };
                Vertices.scale = function(vertices, scaleX, scaleY, point) {
                  if (scaleX === 1 && scaleY === 1)
                    return vertices;
                  point = point || Vertices.centre(vertices);
                  var vertex, delta;
                  for (var i = 0; i < vertices.length; i++) {
                    vertex = vertices[i];
                    delta = Vector.sub(vertex, point);
                    vertices[i].x = point.x + delta.x * scaleX;
                    vertices[i].y = point.y + delta.y * scaleY;
                  }
                  return vertices;
                };
                Vertices.chamfer = function(vertices, radius, quality, qualityMin, qualityMax) {
                  if (typeof radius === "number") {
                    radius = [radius];
                  } else {
                    radius = radius || [8];
                  }
                  quality = typeof quality !== "undefined" ? quality : -1;
                  qualityMin = qualityMin || 2;
                  qualityMax = qualityMax || 14;
                  var newVertices = [];
                  for (var i = 0; i < vertices.length; i++) {
                    var prevVertex = vertices[i - 1 >= 0 ? i - 1 : vertices.length - 1], vertex = vertices[i], nextVertex = vertices[(i + 1) % vertices.length], currentRadius = radius[i < radius.length ? i : radius.length - 1];
                    if (currentRadius === 0) {
                      newVertices.push(vertex);
                      continue;
                    }
                    var prevNormal = Vector.normalise({
                      x: vertex.y - prevVertex.y,
                      y: prevVertex.x - vertex.x
                    });
                    var nextNormal = Vector.normalise({
                      x: nextVertex.y - vertex.y,
                      y: vertex.x - nextVertex.x
                    });
                    var diagonalRadius = Math.sqrt(2 * Math.pow(currentRadius, 2)), radiusVector = Vector.mult(Common.clone(prevNormal), currentRadius), midNormal = Vector.normalise(Vector.mult(Vector.add(prevNormal, nextNormal), 0.5)), scaledVertex = Vector.sub(vertex, Vector.mult(midNormal, diagonalRadius));
                    var precision = quality;
                    if (quality === -1) {
                      precision = Math.pow(currentRadius, 0.32) * 1.75;
                    }
                    precision = Common.clamp(precision, qualityMin, qualityMax);
                    if (precision % 2 === 1)
                      precision += 1;
                    var alpha = Math.acos(Vector.dot(prevNormal, nextNormal)), theta = alpha / precision;
                    for (var j = 0; j < precision; j++) {
                      newVertices.push(Vector.add(Vector.rotate(radiusVector, theta * j), scaledVertex));
                    }
                  }
                  return newVertices;
                };
                Vertices.clockwiseSort = function(vertices) {
                  var centre = Vertices.mean(vertices);
                  vertices.sort(function(vertexA, vertexB) {
                    return Vector.angle(centre, vertexA) - Vector.angle(centre, vertexB);
                  });
                  return vertices;
                };
                Vertices.isConvex = function(vertices) {
                  var flag = 0, n = vertices.length, i, j, k, z;
                  if (n < 3)
                    return null;
                  for (i = 0; i < n; i++) {
                    j = (i + 1) % n;
                    k = (i + 2) % n;
                    z = (vertices[j].x - vertices[i].x) * (vertices[k].y - vertices[j].y);
                    z -= (vertices[j].y - vertices[i].y) * (vertices[k].x - vertices[j].x);
                    if (z < 0) {
                      flag |= 1;
                    } else if (z > 0) {
                      flag |= 2;
                    }
                    if (flag === 3) {
                      return false;
                    }
                  }
                  if (flag !== 0) {
                    return true;
                  } else {
                    return null;
                  }
                };
                Vertices.hull = function(vertices) {
                  var upper = [], lower = [], vertex, i;
                  vertices = vertices.slice(0);
                  vertices.sort(function(vertexA, vertexB) {
                    var dx = vertexA.x - vertexB.x;
                    return dx !== 0 ? dx : vertexA.y - vertexB.y;
                  });
                  for (i = 0; i < vertices.length; i += 1) {
                    vertex = vertices[i];
                    while (lower.length >= 2 && Vector.cross3(lower[lower.length - 2], lower[lower.length - 1], vertex) <= 0) {
                      lower.pop();
                    }
                    lower.push(vertex);
                  }
                  for (i = vertices.length - 1; i >= 0; i -= 1) {
                    vertex = vertices[i];
                    while (upper.length >= 2 && Vector.cross3(upper[upper.length - 2], upper[upper.length - 1], vertex) <= 0) {
                      upper.pop();
                    }
                    upper.push(vertex);
                  }
                  upper.pop();
                  lower.pop();
                  return upper.concat(lower);
                };
              })();
            },
            /* 4 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Body2 = {};
              module2.exports = Body2;
              var Vertices = __webpack_require__(3);
              var Vector = __webpack_require__(2);
              var Sleeping = __webpack_require__(7);
              var Common = __webpack_require__(0);
              var Bounds = __webpack_require__(1);
              var Axes = __webpack_require__(11);
              (function() {
                Body2._timeCorrection = true;
                Body2._inertiaScale = 4;
                Body2._nextCollidingGroupId = 1;
                Body2._nextNonCollidingGroupId = -1;
                Body2._nextCategory = 1;
                Body2._baseDelta = 1e3 / 60;
                Body2.create = function(options) {
                  var defaults = {
                    id: Common.nextId(),
                    type: "body",
                    label: "Body",
                    parts: [],
                    plugin: {},
                    angle: 0,
                    vertices: Vertices.fromPath("L 0 0 L 40 0 L 40 40 L 0 40"),
                    position: { x: 0, y: 0 },
                    force: { x: 0, y: 0 },
                    torque: 0,
                    positionImpulse: { x: 0, y: 0 },
                    constraintImpulse: { x: 0, y: 0, angle: 0 },
                    totalContacts: 0,
                    speed: 0,
                    angularSpeed: 0,
                    velocity: { x: 0, y: 0 },
                    angularVelocity: 0,
                    isSensor: false,
                    isStatic: false,
                    isSleeping: false,
                    motion: 0,
                    sleepThreshold: 60,
                    density: 1e-3,
                    restitution: 0,
                    friction: 0.1,
                    frictionStatic: 0.5,
                    frictionAir: 0.01,
                    collisionFilter: {
                      category: 1,
                      mask: 4294967295,
                      group: 0
                    },
                    slop: 0.05,
                    timeScale: 1,
                    render: {
                      visible: true,
                      opacity: 1,
                      strokeStyle: null,
                      fillStyle: null,
                      lineWidth: null,
                      sprite: {
                        xScale: 1,
                        yScale: 1,
                        xOffset: 0,
                        yOffset: 0
                      }
                    },
                    events: null,
                    bounds: null,
                    chamfer: null,
                    circleRadius: 0,
                    positionPrev: null,
                    anglePrev: 0,
                    parent: null,
                    axes: null,
                    area: 0,
                    mass: 0,
                    inertia: 0,
                    deltaTime: 1e3 / 60,
                    _original: null
                  };
                  var body = Common.extend(defaults, options);
                  _initProperties(body, options);
                  return body;
                };
                Body2.nextGroup = function(isNonColliding) {
                  if (isNonColliding)
                    return Body2._nextNonCollidingGroupId--;
                  return Body2._nextCollidingGroupId++;
                };
                Body2.nextCategory = function() {
                  Body2._nextCategory = Body2._nextCategory << 1;
                  return Body2._nextCategory;
                };
                var _initProperties = function(body, options) {
                  options = options || {};
                  Body2.set(body, {
                    bounds: body.bounds || Bounds.create(body.vertices),
                    positionPrev: body.positionPrev || Vector.clone(body.position),
                    anglePrev: body.anglePrev || body.angle,
                    vertices: body.vertices,
                    parts: body.parts || [body],
                    isStatic: body.isStatic,
                    isSleeping: body.isSleeping,
                    parent: body.parent || body
                  });
                  Vertices.rotate(body.vertices, body.angle, body.position);
                  Axes.rotate(body.axes, body.angle);
                  Bounds.update(body.bounds, body.vertices, body.velocity);
                  Body2.set(body, {
                    axes: options.axes || body.axes,
                    area: options.area || body.area,
                    mass: options.mass || body.mass,
                    inertia: options.inertia || body.inertia
                  });
                  var defaultFillStyle = body.isStatic ? "#14151f" : Common.choose(["#f19648", "#f5d259", "#f55a3c", "#063e7b", "#ececd1"]), defaultStrokeStyle = body.isStatic ? "#555" : "#ccc", defaultLineWidth = body.isStatic && body.render.fillStyle === null ? 1 : 0;
                  body.render.fillStyle = body.render.fillStyle || defaultFillStyle;
                  body.render.strokeStyle = body.render.strokeStyle || defaultStrokeStyle;
                  body.render.lineWidth = body.render.lineWidth || defaultLineWidth;
                  body.render.sprite.xOffset += -(body.bounds.min.x - body.position.x) / (body.bounds.max.x - body.bounds.min.x);
                  body.render.sprite.yOffset += -(body.bounds.min.y - body.position.y) / (body.bounds.max.y - body.bounds.min.y);
                };
                Body2.set = function(body, settings, value) {
                  var property;
                  if (typeof settings === "string") {
                    property = settings;
                    settings = {};
                    settings[property] = value;
                  }
                  for (property in settings) {
                    if (!Object.prototype.hasOwnProperty.call(settings, property))
                      continue;
                    value = settings[property];
                    switch (property) {
                      case "isStatic":
                        Body2.setStatic(body, value);
                        break;
                      case "isSleeping":
                        Sleeping.set(body, value);
                        break;
                      case "mass":
                        Body2.setMass(body, value);
                        break;
                      case "density":
                        Body2.setDensity(body, value);
                        break;
                      case "inertia":
                        Body2.setInertia(body, value);
                        break;
                      case "vertices":
                        Body2.setVertices(body, value);
                        break;
                      case "position":
                        Body2.setPosition(body, value);
                        break;
                      case "angle":
                        Body2.setAngle(body, value);
                        break;
                      case "velocity":
                        Body2.setVelocity(body, value);
                        break;
                      case "angularVelocity":
                        Body2.setAngularVelocity(body, value);
                        break;
                      case "speed":
                        Body2.setSpeed(body, value);
                        break;
                      case "angularSpeed":
                        Body2.setAngularSpeed(body, value);
                        break;
                      case "parts":
                        Body2.setParts(body, value);
                        break;
                      case "centre":
                        Body2.setCentre(body, value);
                        break;
                      default:
                        body[property] = value;
                    }
                  }
                };
                Body2.setStatic = function(body, isStatic) {
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    if (isStatic) {
                      if (!part.isStatic) {
                        part._original = {
                          restitution: part.restitution,
                          friction: part.friction,
                          mass: part.mass,
                          inertia: part.inertia,
                          density: part.density,
                          inverseMass: part.inverseMass,
                          inverseInertia: part.inverseInertia
                        };
                      }
                      part.restitution = 0;
                      part.friction = 1;
                      part.mass = part.inertia = part.density = Infinity;
                      part.inverseMass = part.inverseInertia = 0;
                      part.positionPrev.x = part.position.x;
                      part.positionPrev.y = part.position.y;
                      part.anglePrev = part.angle;
                      part.angularVelocity = 0;
                      part.speed = 0;
                      part.angularSpeed = 0;
                      part.motion = 0;
                    } else if (part._original) {
                      part.restitution = part._original.restitution;
                      part.friction = part._original.friction;
                      part.mass = part._original.mass;
                      part.inertia = part._original.inertia;
                      part.density = part._original.density;
                      part.inverseMass = part._original.inverseMass;
                      part.inverseInertia = part._original.inverseInertia;
                      part._original = null;
                    }
                    part.isStatic = isStatic;
                  }
                };
                Body2.setMass = function(body, mass) {
                  var moment = body.inertia / (body.mass / 6);
                  body.inertia = moment * (mass / 6);
                  body.inverseInertia = 1 / body.inertia;
                  body.mass = mass;
                  body.inverseMass = 1 / body.mass;
                  body.density = body.mass / body.area;
                };
                Body2.setDensity = function(body, density) {
                  Body2.setMass(body, density * body.area);
                  body.density = density;
                };
                Body2.setInertia = function(body, inertia) {
                  body.inertia = inertia;
                  body.inverseInertia = 1 / body.inertia;
                };
                Body2.setVertices = function(body, vertices) {
                  if (vertices[0].body === body) {
                    body.vertices = vertices;
                  } else {
                    body.vertices = Vertices.create(vertices, body);
                  }
                  body.axes = Axes.fromVertices(body.vertices);
                  body.area = Vertices.area(body.vertices);
                  Body2.setMass(body, body.density * body.area);
                  var centre = Vertices.centre(body.vertices);
                  Vertices.translate(body.vertices, centre, -1);
                  Body2.setInertia(body, Body2._inertiaScale * Vertices.inertia(body.vertices, body.mass));
                  Vertices.translate(body.vertices, body.position);
                  Bounds.update(body.bounds, body.vertices, body.velocity);
                };
                Body2.setParts = function(body, parts, autoHull) {
                  var i;
                  parts = parts.slice(0);
                  body.parts.length = 0;
                  body.parts.push(body);
                  body.parent = body;
                  for (i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (part !== body) {
                      part.parent = body;
                      body.parts.push(part);
                    }
                  }
                  if (body.parts.length === 1)
                    return;
                  autoHull = typeof autoHull !== "undefined" ? autoHull : true;
                  if (autoHull) {
                    var vertices = [];
                    for (i = 0; i < parts.length; i++) {
                      vertices = vertices.concat(parts[i].vertices);
                    }
                    Vertices.clockwiseSort(vertices);
                    var hull = Vertices.hull(vertices), hullCentre = Vertices.centre(hull);
                    Body2.setVertices(body, hull);
                    Vertices.translate(body.vertices, hullCentre);
                  }
                  var total = Body2._totalProperties(body);
                  body.area = total.area;
                  body.parent = body;
                  body.position.x = total.centre.x;
                  body.position.y = total.centre.y;
                  body.positionPrev.x = total.centre.x;
                  body.positionPrev.y = total.centre.y;
                  Body2.setMass(body, total.mass);
                  Body2.setInertia(body, total.inertia);
                  Body2.setPosition(body, total.centre);
                };
                Body2.setCentre = function(body, centre, relative) {
                  if (!relative) {
                    body.positionPrev.x = centre.x - (body.position.x - body.positionPrev.x);
                    body.positionPrev.y = centre.y - (body.position.y - body.positionPrev.y);
                    body.position.x = centre.x;
                    body.position.y = centre.y;
                  } else {
                    body.positionPrev.x += centre.x;
                    body.positionPrev.y += centre.y;
                    body.position.x += centre.x;
                    body.position.y += centre.y;
                  }
                };
                Body2.setPosition = function(body, position, updateVelocity) {
                  var delta = Vector.sub(position, body.position);
                  if (updateVelocity) {
                    body.positionPrev.x = body.position.x;
                    body.positionPrev.y = body.position.y;
                    body.velocity.x = delta.x;
                    body.velocity.y = delta.y;
                    body.speed = Vector.magnitude(delta);
                  } else {
                    body.positionPrev.x += delta.x;
                    body.positionPrev.y += delta.y;
                  }
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    part.position.x += delta.x;
                    part.position.y += delta.y;
                    Vertices.translate(part.vertices, delta);
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                  }
                };
                Body2.setAngle = function(body, angle, updateVelocity) {
                  var delta = angle - body.angle;
                  if (updateVelocity) {
                    body.anglePrev = body.angle;
                    body.angularVelocity = delta;
                    body.angularSpeed = Math.abs(delta);
                  } else {
                    body.anglePrev += delta;
                  }
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    part.angle += delta;
                    Vertices.rotate(part.vertices, delta, body.position);
                    Axes.rotate(part.axes, delta);
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                    if (i > 0) {
                      Vector.rotateAbout(part.position, delta, body.position, part.position);
                    }
                  }
                };
                Body2.setVelocity = function(body, velocity) {
                  var timeScale = body.deltaTime / Body2._baseDelta;
                  body.positionPrev.x = body.position.x - velocity.x * timeScale;
                  body.positionPrev.y = body.position.y - velocity.y * timeScale;
                  body.velocity.x = (body.position.x - body.positionPrev.x) / timeScale;
                  body.velocity.y = (body.position.y - body.positionPrev.y) / timeScale;
                  body.speed = Vector.magnitude(body.velocity);
                };
                Body2.getVelocity = function(body) {
                  var timeScale = Body2._baseDelta / body.deltaTime;
                  return {
                    x: (body.position.x - body.positionPrev.x) * timeScale,
                    y: (body.position.y - body.positionPrev.y) * timeScale
                  };
                };
                Body2.getSpeed = function(body) {
                  return Vector.magnitude(Body2.getVelocity(body));
                };
                Body2.setSpeed = function(body, speed) {
                  Body2.setVelocity(body, Vector.mult(Vector.normalise(Body2.getVelocity(body)), speed));
                };
                Body2.setAngularVelocity = function(body, velocity) {
                  var timeScale = body.deltaTime / Body2._baseDelta;
                  body.anglePrev = body.angle - velocity * timeScale;
                  body.angularVelocity = (body.angle - body.anglePrev) / timeScale;
                  body.angularSpeed = Math.abs(body.angularVelocity);
                };
                Body2.getAngularVelocity = function(body) {
                  return (body.angle - body.anglePrev) * Body2._baseDelta / body.deltaTime;
                };
                Body2.getAngularSpeed = function(body) {
                  return Math.abs(Body2.getAngularVelocity(body));
                };
                Body2.setAngularSpeed = function(body, speed) {
                  Body2.setAngularVelocity(body, Common.sign(Body2.getAngularVelocity(body)) * speed);
                };
                Body2.translate = function(body, translation, updateVelocity) {
                  Body2.setPosition(body, Vector.add(body.position, translation), updateVelocity);
                };
                Body2.rotate = function(body, rotation, point, updateVelocity) {
                  if (!point) {
                    Body2.setAngle(body, body.angle + rotation, updateVelocity);
                  } else {
                    var cos = Math.cos(rotation), sin = Math.sin(rotation), dx = body.position.x - point.x, dy = body.position.y - point.y;
                    Body2.setPosition(body, {
                      x: point.x + (dx * cos - dy * sin),
                      y: point.y + (dx * sin + dy * cos)
                    }, updateVelocity);
                    Body2.setAngle(body, body.angle + rotation, updateVelocity);
                  }
                };
                Body2.scale = function(body, scaleX, scaleY, point) {
                  var totalArea = 0, totalInertia = 0;
                  point = point || body.position;
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    Vertices.scale(part.vertices, scaleX, scaleY, point);
                    part.axes = Axes.fromVertices(part.vertices);
                    part.area = Vertices.area(part.vertices);
                    Body2.setMass(part, body.density * part.area);
                    Vertices.translate(part.vertices, { x: -part.position.x, y: -part.position.y });
                    Body2.setInertia(part, Body2._inertiaScale * Vertices.inertia(part.vertices, part.mass));
                    Vertices.translate(part.vertices, { x: part.position.x, y: part.position.y });
                    if (i > 0) {
                      totalArea += part.area;
                      totalInertia += part.inertia;
                    }
                    part.position.x = point.x + (part.position.x - point.x) * scaleX;
                    part.position.y = point.y + (part.position.y - point.y) * scaleY;
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                  }
                  if (body.parts.length > 1) {
                    body.area = totalArea;
                    if (!body.isStatic) {
                      Body2.setMass(body, body.density * totalArea);
                      Body2.setInertia(body, totalInertia);
                    }
                  }
                  if (body.circleRadius) {
                    if (scaleX === scaleY) {
                      body.circleRadius *= scaleX;
                    } else {
                      body.circleRadius = null;
                    }
                  }
                };
                Body2.update = function(body, deltaTime) {
                  deltaTime = (typeof deltaTime !== "undefined" ? deltaTime : 1e3 / 60) * body.timeScale;
                  var deltaTimeSquared = deltaTime * deltaTime, correction = Body2._timeCorrection ? deltaTime / (body.deltaTime || deltaTime) : 1;
                  var frictionAir = 1 - body.frictionAir * (deltaTime / Common._baseDelta), velocityPrevX = (body.position.x - body.positionPrev.x) * correction, velocityPrevY = (body.position.y - body.positionPrev.y) * correction;
                  body.velocity.x = velocityPrevX * frictionAir + body.force.x / body.mass * deltaTimeSquared;
                  body.velocity.y = velocityPrevY * frictionAir + body.force.y / body.mass * deltaTimeSquared;
                  body.positionPrev.x = body.position.x;
                  body.positionPrev.y = body.position.y;
                  body.position.x += body.velocity.x;
                  body.position.y += body.velocity.y;
                  body.deltaTime = deltaTime;
                  body.angularVelocity = (body.angle - body.anglePrev) * frictionAir * correction + body.torque / body.inertia * deltaTimeSquared;
                  body.anglePrev = body.angle;
                  body.angle += body.angularVelocity;
                  for (var i = 0; i < body.parts.length; i++) {
                    var part = body.parts[i];
                    Vertices.translate(part.vertices, body.velocity);
                    if (i > 0) {
                      part.position.x += body.velocity.x;
                      part.position.y += body.velocity.y;
                    }
                    if (body.angularVelocity !== 0) {
                      Vertices.rotate(part.vertices, body.angularVelocity, body.position);
                      Axes.rotate(part.axes, body.angularVelocity);
                      if (i > 0) {
                        Vector.rotateAbout(part.position, body.angularVelocity, body.position, part.position);
                      }
                    }
                    Bounds.update(part.bounds, part.vertices, body.velocity);
                  }
                };
                Body2.updateVelocities = function(body) {
                  var timeScale = Body2._baseDelta / body.deltaTime, bodyVelocity = body.velocity;
                  bodyVelocity.x = (body.position.x - body.positionPrev.x) * timeScale;
                  bodyVelocity.y = (body.position.y - body.positionPrev.y) * timeScale;
                  body.speed = Math.sqrt(bodyVelocity.x * bodyVelocity.x + bodyVelocity.y * bodyVelocity.y);
                  body.angularVelocity = (body.angle - body.anglePrev) * timeScale;
                  body.angularSpeed = Math.abs(body.angularVelocity);
                };
                Body2.applyForce = function(body, position, force) {
                  var offset = { x: position.x - body.position.x, y: position.y - body.position.y };
                  body.force.x += force.x;
                  body.force.y += force.y;
                  body.torque += offset.x * force.y - offset.y * force.x;
                };
                Body2._totalProperties = function(body) {
                  var properties = {
                    mass: 0,
                    area: 0,
                    inertia: 0,
                    centre: { x: 0, y: 0 }
                  };
                  for (var i = body.parts.length === 1 ? 0 : 1; i < body.parts.length; i++) {
                    var part = body.parts[i], mass = part.mass !== Infinity ? part.mass : 1;
                    properties.mass += mass;
                    properties.area += part.area;
                    properties.inertia += part.inertia;
                    properties.centre = Vector.add(properties.centre, Vector.mult(part.position, mass));
                  }
                  properties.centre = Vector.div(properties.centre, properties.mass);
                  return properties;
                };
              })();
            },
            /* 5 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Events2 = {};
              module2.exports = Events2;
              var Common = __webpack_require__(0);
              (function() {
                Events2.on = function(object, eventNames, callback) {
                  var names = eventNames.split(" "), name;
                  for (var i = 0; i < names.length; i++) {
                    name = names[i];
                    object.events = object.events || {};
                    object.events[name] = object.events[name] || [];
                    object.events[name].push(callback);
                  }
                  return callback;
                };
                Events2.off = function(object, eventNames, callback) {
                  if (!eventNames) {
                    object.events = {};
                    return;
                  }
                  if (typeof eventNames === "function") {
                    callback = eventNames;
                    eventNames = Common.keys(object.events).join(" ");
                  }
                  var names = eventNames.split(" ");
                  for (var i = 0; i < names.length; i++) {
                    var callbacks = object.events[names[i]], newCallbacks = [];
                    if (callback && callbacks) {
                      for (var j = 0; j < callbacks.length; j++) {
                        if (callbacks[j] !== callback)
                          newCallbacks.push(callbacks[j]);
                      }
                    }
                    object.events[names[i]] = newCallbacks;
                  }
                };
                Events2.trigger = function(object, eventNames, event) {
                  var names, name, callbacks, eventClone;
                  var events = object.events;
                  if (events && Common.keys(events).length > 0) {
                    if (!event)
                      event = {};
                    names = eventNames.split(" ");
                    for (var i = 0; i < names.length; i++) {
                      name = names[i];
                      callbacks = events[name];
                      if (callbacks) {
                        eventClone = Common.clone(event, false);
                        eventClone.name = name;
                        eventClone.source = object;
                        for (var j = 0; j < callbacks.length; j++) {
                          callbacks[j].apply(object, [eventClone]);
                        }
                      }
                    }
                  }
                };
              })();
            },
            /* 6 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Composite2 = {};
              module2.exports = Composite2;
              var Events2 = __webpack_require__(5);
              var Common = __webpack_require__(0);
              var Bounds = __webpack_require__(1);
              var Body2 = __webpack_require__(4);
              (function() {
                Composite2.create = function(options) {
                  return Common.extend({
                    id: Common.nextId(),
                    type: "composite",
                    parent: null,
                    isModified: false,
                    bodies: [],
                    constraints: [],
                    composites: [],
                    label: "Composite",
                    plugin: {},
                    cache: {
                      allBodies: null,
                      allConstraints: null,
                      allComposites: null
                    }
                  }, options);
                };
                Composite2.setModified = function(composite, isModified, updateParents, updateChildren) {
                  composite.isModified = isModified;
                  if (isModified && composite.cache) {
                    composite.cache.allBodies = null;
                    composite.cache.allConstraints = null;
                    composite.cache.allComposites = null;
                  }
                  if (updateParents && composite.parent) {
                    Composite2.setModified(composite.parent, isModified, updateParents, updateChildren);
                  }
                  if (updateChildren) {
                    for (var i = 0; i < composite.composites.length; i++) {
                      var childComposite = composite.composites[i];
                      Composite2.setModified(childComposite, isModified, updateParents, updateChildren);
                    }
                  }
                };
                Composite2.add = function(composite, object) {
                  var objects = [].concat(object);
                  Events2.trigger(composite, "beforeAdd", { object });
                  for (var i = 0; i < objects.length; i++) {
                    var obj = objects[i];
                    switch (obj.type) {
                      case "body":
                        if (obj.parent !== obj) {
                          Common.warn("Composite.add: skipped adding a compound body part (you must add its parent instead)");
                          break;
                        }
                        Composite2.addBody(composite, obj);
                        break;
                      case "constraint":
                        Composite2.addConstraint(composite, obj);
                        break;
                      case "composite":
                        Composite2.addComposite(composite, obj);
                        break;
                      case "mouseConstraint":
                        Composite2.addConstraint(composite, obj.constraint);
                        break;
                    }
                  }
                  Events2.trigger(composite, "afterAdd", { object });
                  return composite;
                };
                Composite2.remove = function(composite, object, deep) {
                  var objects = [].concat(object);
                  Events2.trigger(composite, "beforeRemove", { object });
                  for (var i = 0; i < objects.length; i++) {
                    var obj = objects[i];
                    switch (obj.type) {
                      case "body":
                        Composite2.removeBody(composite, obj, deep);
                        break;
                      case "constraint":
                        Composite2.removeConstraint(composite, obj, deep);
                        break;
                      case "composite":
                        Composite2.removeComposite(composite, obj, deep);
                        break;
                      case "mouseConstraint":
                        Composite2.removeConstraint(composite, obj.constraint);
                        break;
                    }
                  }
                  Events2.trigger(composite, "afterRemove", { object });
                  return composite;
                };
                Composite2.addComposite = function(compositeA, compositeB) {
                  compositeA.composites.push(compositeB);
                  compositeB.parent = compositeA;
                  Composite2.setModified(compositeA, true, true, false);
                  return compositeA;
                };
                Composite2.removeComposite = function(compositeA, compositeB, deep) {
                  var position = Common.indexOf(compositeA.composites, compositeB);
                  if (position !== -1) {
                    var bodies = Composite2.allBodies(compositeB);
                    Composite2.removeCompositeAt(compositeA, position);
                    for (var i = 0; i < bodies.length; i++) {
                      bodies[i].sleepCounter = 0;
                    }
                  }
                  if (deep) {
                    for (var i = 0; i < compositeA.composites.length; i++) {
                      Composite2.removeComposite(compositeA.composites[i], compositeB, true);
                    }
                  }
                  return compositeA;
                };
                Composite2.removeCompositeAt = function(composite, position) {
                  composite.composites.splice(position, 1);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.addBody = function(composite, body) {
                  composite.bodies.push(body);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.removeBody = function(composite, body, deep) {
                  var position = Common.indexOf(composite.bodies, body);
                  if (position !== -1) {
                    Composite2.removeBodyAt(composite, position);
                    body.sleepCounter = 0;
                  }
                  if (deep) {
                    for (var i = 0; i < composite.composites.length; i++) {
                      Composite2.removeBody(composite.composites[i], body, true);
                    }
                  }
                  return composite;
                };
                Composite2.removeBodyAt = function(composite, position) {
                  composite.bodies.splice(position, 1);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.addConstraint = function(composite, constraint) {
                  composite.constraints.push(constraint);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.removeConstraint = function(composite, constraint, deep) {
                  var position = Common.indexOf(composite.constraints, constraint);
                  if (position !== -1) {
                    Composite2.removeConstraintAt(composite, position);
                  }
                  if (deep) {
                    for (var i = 0; i < composite.composites.length; i++) {
                      Composite2.removeConstraint(composite.composites[i], constraint, true);
                    }
                  }
                  return composite;
                };
                Composite2.removeConstraintAt = function(composite, position) {
                  composite.constraints.splice(position, 1);
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.clear = function(composite, keepStatic, deep) {
                  if (deep) {
                    for (var i = 0; i < composite.composites.length; i++) {
                      Composite2.clear(composite.composites[i], keepStatic, true);
                    }
                  }
                  if (keepStatic) {
                    composite.bodies = composite.bodies.filter(function(body) {
                      return body.isStatic;
                    });
                  } else {
                    composite.bodies.length = 0;
                  }
                  composite.constraints.length = 0;
                  composite.composites.length = 0;
                  Composite2.setModified(composite, true, true, false);
                  return composite;
                };
                Composite2.allBodies = function(composite) {
                  if (composite.cache && composite.cache.allBodies) {
                    return composite.cache.allBodies;
                  }
                  var bodies = [].concat(composite.bodies);
                  for (var i = 0; i < composite.composites.length; i++)
                    bodies = bodies.concat(Composite2.allBodies(composite.composites[i]));
                  if (composite.cache) {
                    composite.cache.allBodies = bodies;
                  }
                  return bodies;
                };
                Composite2.allConstraints = function(composite) {
                  if (composite.cache && composite.cache.allConstraints) {
                    return composite.cache.allConstraints;
                  }
                  var constraints = [].concat(composite.constraints);
                  for (var i = 0; i < composite.composites.length; i++)
                    constraints = constraints.concat(Composite2.allConstraints(composite.composites[i]));
                  if (composite.cache) {
                    composite.cache.allConstraints = constraints;
                  }
                  return constraints;
                };
                Composite2.allComposites = function(composite) {
                  if (composite.cache && composite.cache.allComposites) {
                    return composite.cache.allComposites;
                  }
                  var composites = [].concat(composite.composites);
                  for (var i = 0; i < composite.composites.length; i++)
                    composites = composites.concat(Composite2.allComposites(composite.composites[i]));
                  if (composite.cache) {
                    composite.cache.allComposites = composites;
                  }
                  return composites;
                };
                Composite2.get = function(composite, id, type) {
                  var objects, object;
                  switch (type) {
                    case "body":
                      objects = Composite2.allBodies(composite);
                      break;
                    case "constraint":
                      objects = Composite2.allConstraints(composite);
                      break;
                    case "composite":
                      objects = Composite2.allComposites(composite).concat(composite);
                      break;
                  }
                  if (!objects)
                    return null;
                  object = objects.filter(function(object2) {
                    return object2.id.toString() === id.toString();
                  });
                  return object.length === 0 ? null : object[0];
                };
                Composite2.move = function(compositeA, objects, compositeB) {
                  Composite2.remove(compositeA, objects);
                  Composite2.add(compositeB, objects);
                  return compositeA;
                };
                Composite2.rebase = function(composite) {
                  var objects = Composite2.allBodies(composite).concat(Composite2.allConstraints(composite)).concat(Composite2.allComposites(composite));
                  for (var i = 0; i < objects.length; i++) {
                    objects[i].id = Common.nextId();
                  }
                  return composite;
                };
                Composite2.translate = function(composite, translation, recursive) {
                  var bodies = recursive ? Composite2.allBodies(composite) : composite.bodies;
                  for (var i = 0; i < bodies.length; i++) {
                    Body2.translate(bodies[i], translation);
                  }
                  return composite;
                };
                Composite2.rotate = function(composite, rotation, point, recursive) {
                  var cos = Math.cos(rotation), sin = Math.sin(rotation), bodies = recursive ? Composite2.allBodies(composite) : composite.bodies;
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], dx = body.position.x - point.x, dy = body.position.y - point.y;
                    Body2.setPosition(body, {
                      x: point.x + (dx * cos - dy * sin),
                      y: point.y + (dx * sin + dy * cos)
                    });
                    Body2.rotate(body, rotation);
                  }
                  return composite;
                };
                Composite2.scale = function(composite, scaleX, scaleY, point, recursive) {
                  var bodies = recursive ? Composite2.allBodies(composite) : composite.bodies;
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], dx = body.position.x - point.x, dy = body.position.y - point.y;
                    Body2.setPosition(body, {
                      x: point.x + dx * scaleX,
                      y: point.y + dy * scaleY
                    });
                    Body2.scale(body, scaleX, scaleY);
                  }
                  return composite;
                };
                Composite2.bounds = function(composite) {
                  var bodies = Composite2.allBodies(composite), vertices = [];
                  for (var i = 0; i < bodies.length; i += 1) {
                    var body = bodies[i];
                    vertices.push(body.bounds.min, body.bounds.max);
                  }
                  return Bounds.create(vertices);
                };
              })();
            },
            /* 7 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Sleeping = {};
              module2.exports = Sleeping;
              var Body2 = __webpack_require__(4);
              var Events2 = __webpack_require__(5);
              var Common = __webpack_require__(0);
              (function() {
                Sleeping._motionWakeThreshold = 0.18;
                Sleeping._motionSleepThreshold = 0.08;
                Sleeping._minBias = 0.9;
                Sleeping.update = function(bodies, delta) {
                  var timeScale = delta / Common._baseDelta, motionSleepThreshold = Sleeping._motionSleepThreshold;
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], speed = Body2.getSpeed(body), angularSpeed = Body2.getAngularSpeed(body), motion = speed * speed + angularSpeed * angularSpeed;
                    if (body.force.x !== 0 || body.force.y !== 0) {
                      Sleeping.set(body, false);
                      continue;
                    }
                    var minMotion = Math.min(body.motion, motion), maxMotion = Math.max(body.motion, motion);
                    body.motion = Sleeping._minBias * minMotion + (1 - Sleeping._minBias) * maxMotion;
                    if (body.sleepThreshold > 0 && body.motion < motionSleepThreshold) {
                      body.sleepCounter += 1;
                      if (body.sleepCounter >= body.sleepThreshold / timeScale) {
                        Sleeping.set(body, true);
                      }
                    } else if (body.sleepCounter > 0) {
                      body.sleepCounter -= 1;
                    }
                  }
                };
                Sleeping.afterCollisions = function(pairs) {
                  var motionSleepThreshold = Sleeping._motionSleepThreshold;
                  for (var i = 0; i < pairs.length; i++) {
                    var pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    var collision = pair.collision, bodyA = collision.bodyA.parent, bodyB = collision.bodyB.parent;
                    if (bodyA.isSleeping && bodyB.isSleeping || bodyA.isStatic || bodyB.isStatic)
                      continue;
                    if (bodyA.isSleeping || bodyB.isSleeping) {
                      var sleepingBody = bodyA.isSleeping && !bodyA.isStatic ? bodyA : bodyB, movingBody = sleepingBody === bodyA ? bodyB : bodyA;
                      if (!sleepingBody.isStatic && movingBody.motion > motionSleepThreshold) {
                        Sleeping.set(sleepingBody, false);
                      }
                    }
                  }
                };
                Sleeping.set = function(body, isSleeping) {
                  var wasSleeping = body.isSleeping;
                  if (isSleeping) {
                    body.isSleeping = true;
                    body.sleepCounter = body.sleepThreshold;
                    body.positionImpulse.x = 0;
                    body.positionImpulse.y = 0;
                    body.positionPrev.x = body.position.x;
                    body.positionPrev.y = body.position.y;
                    body.anglePrev = body.angle;
                    body.speed = 0;
                    body.angularSpeed = 0;
                    body.motion = 0;
                    if (!wasSleeping) {
                      Events2.trigger(body, "sleepStart");
                    }
                  } else {
                    body.isSleeping = false;
                    body.sleepCounter = 0;
                    if (wasSleeping) {
                      Events2.trigger(body, "sleepEnd");
                    }
                  }
                };
              })();
            },
            /* 8 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Collision = {};
              module2.exports = Collision;
              var Vertices = __webpack_require__(3);
              var Pair = __webpack_require__(9);
              (function() {
                var _supports = [];
                var _overlapAB = {
                  overlap: 0,
                  axis: null
                };
                var _overlapBA = {
                  overlap: 0,
                  axis: null
                };
                Collision.create = function(bodyA, bodyB) {
                  return {
                    pair: null,
                    collided: false,
                    bodyA,
                    bodyB,
                    parentA: bodyA.parent,
                    parentB: bodyB.parent,
                    depth: 0,
                    normal: { x: 0, y: 0 },
                    tangent: { x: 0, y: 0 },
                    penetration: { x: 0, y: 0 },
                    supports: [null, null],
                    supportCount: 0
                  };
                };
                Collision.collides = function(bodyA, bodyB, pairs) {
                  Collision._overlapAxes(_overlapAB, bodyA.vertices, bodyB.vertices, bodyA.axes);
                  if (_overlapAB.overlap <= 0) {
                    return null;
                  }
                  Collision._overlapAxes(_overlapBA, bodyB.vertices, bodyA.vertices, bodyB.axes);
                  if (_overlapBA.overlap <= 0) {
                    return null;
                  }
                  var pair = pairs && pairs.table[Pair.id(bodyA, bodyB)], collision;
                  if (!pair) {
                    collision = Collision.create(bodyA, bodyB);
                    collision.collided = true;
                    collision.bodyA = bodyA.id < bodyB.id ? bodyA : bodyB;
                    collision.bodyB = bodyA.id < bodyB.id ? bodyB : bodyA;
                    collision.parentA = collision.bodyA.parent;
                    collision.parentB = collision.bodyB.parent;
                  } else {
                    collision = pair.collision;
                  }
                  bodyA = collision.bodyA;
                  bodyB = collision.bodyB;
                  var minOverlap;
                  if (_overlapAB.overlap < _overlapBA.overlap) {
                    minOverlap = _overlapAB;
                  } else {
                    minOverlap = _overlapBA;
                  }
                  var normal = collision.normal, tangent = collision.tangent, penetration = collision.penetration, supports = collision.supports, depth = minOverlap.overlap, minAxis = minOverlap.axis, normalX = minAxis.x, normalY = minAxis.y, deltaX = bodyB.position.x - bodyA.position.x, deltaY = bodyB.position.y - bodyA.position.y;
                  if (normalX * deltaX + normalY * deltaY >= 0) {
                    normalX = -normalX;
                    normalY = -normalY;
                  }
                  normal.x = normalX;
                  normal.y = normalY;
                  tangent.x = -normalY;
                  tangent.y = normalX;
                  penetration.x = normalX * depth;
                  penetration.y = normalY * depth;
                  collision.depth = depth;
                  var supportsB = Collision._findSupports(bodyA, bodyB, normal, 1), supportCount = 0;
                  if (Vertices.contains(bodyA.vertices, supportsB[0])) {
                    supports[supportCount++] = supportsB[0];
                  }
                  if (Vertices.contains(bodyA.vertices, supportsB[1])) {
                    supports[supportCount++] = supportsB[1];
                  }
                  if (supportCount < 2) {
                    var supportsA = Collision._findSupports(bodyB, bodyA, normal, -1);
                    if (Vertices.contains(bodyB.vertices, supportsA[0])) {
                      supports[supportCount++] = supportsA[0];
                    }
                    if (supportCount < 2 && Vertices.contains(bodyB.vertices, supportsA[1])) {
                      supports[supportCount++] = supportsA[1];
                    }
                  }
                  if (supportCount === 0) {
                    supports[supportCount++] = supportsB[0];
                  }
                  collision.supportCount = supportCount;
                  return collision;
                };
                Collision._overlapAxes = function(result, verticesA, verticesB, axes) {
                  var verticesALength = verticesA.length, verticesBLength = verticesB.length, verticesAX = verticesA[0].x, verticesAY = verticesA[0].y, verticesBX = verticesB[0].x, verticesBY = verticesB[0].y, axesLength = axes.length, overlapMin = Number.MAX_VALUE, overlapAxisNumber = 0, overlap, overlapAB, overlapBA, dot, i, j;
                  for (i = 0; i < axesLength; i++) {
                    var axis = axes[i], axisX = axis.x, axisY = axis.y, minA = verticesAX * axisX + verticesAY * axisY, minB = verticesBX * axisX + verticesBY * axisY, maxA = minA, maxB = minB;
                    for (j = 1; j < verticesALength; j += 1) {
                      dot = verticesA[j].x * axisX + verticesA[j].y * axisY;
                      if (dot > maxA) {
                        maxA = dot;
                      } else if (dot < minA) {
                        minA = dot;
                      }
                    }
                    for (j = 1; j < verticesBLength; j += 1) {
                      dot = verticesB[j].x * axisX + verticesB[j].y * axisY;
                      if (dot > maxB) {
                        maxB = dot;
                      } else if (dot < minB) {
                        minB = dot;
                      }
                    }
                    overlapAB = maxA - minB;
                    overlapBA = maxB - minA;
                    overlap = overlapAB < overlapBA ? overlapAB : overlapBA;
                    if (overlap < overlapMin) {
                      overlapMin = overlap;
                      overlapAxisNumber = i;
                      if (overlap <= 0) {
                        break;
                      }
                    }
                  }
                  result.axis = axes[overlapAxisNumber];
                  result.overlap = overlapMin;
                };
                Collision._findSupports = function(bodyA, bodyB, normal, direction) {
                  var vertices = bodyB.vertices, verticesLength = vertices.length, bodyAPositionX = bodyA.position.x, bodyAPositionY = bodyA.position.y, normalX = normal.x * direction, normalY = normal.y * direction, vertexA = vertices[0], vertexB = vertexA, nearestDistance = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y), vertexC, distance, j;
                  for (j = 1; j < verticesLength; j += 1) {
                    vertexB = vertices[j];
                    distance = normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y);
                    if (distance < nearestDistance) {
                      nearestDistance = distance;
                      vertexA = vertexB;
                    }
                  }
                  vertexC = vertices[(verticesLength + vertexA.index - 1) % verticesLength];
                  nearestDistance = normalX * (bodyAPositionX - vertexC.x) + normalY * (bodyAPositionY - vertexC.y);
                  vertexB = vertices[(vertexA.index + 1) % verticesLength];
                  if (normalX * (bodyAPositionX - vertexB.x) + normalY * (bodyAPositionY - vertexB.y) < nearestDistance) {
                    _supports[0] = vertexA;
                    _supports[1] = vertexB;
                    return _supports;
                  }
                  _supports[0] = vertexA;
                  _supports[1] = vertexC;
                  return _supports;
                };
              })();
            },
            /* 9 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Pair = {};
              module2.exports = Pair;
              var Contact2 = __webpack_require__(16);
              (function() {
                Pair.create = function(collision, timestamp) {
                  var bodyA = collision.bodyA, bodyB = collision.bodyB;
                  var pair = {
                    id: Pair.id(bodyA, bodyB),
                    bodyA,
                    bodyB,
                    collision,
                    contacts: [Contact2.create(), Contact2.create()],
                    contactCount: 0,
                    separation: 0,
                    isActive: true,
                    isSensor: bodyA.isSensor || bodyB.isSensor,
                    timeCreated: timestamp,
                    timeUpdated: timestamp,
                    inverseMass: 0,
                    friction: 0,
                    frictionStatic: 0,
                    restitution: 0,
                    slop: 0
                  };
                  Pair.update(pair, collision, timestamp);
                  return pair;
                };
                Pair.update = function(pair, collision, timestamp) {
                  var supports = collision.supports, supportCount = collision.supportCount, contacts = pair.contacts, parentA = collision.parentA, parentB = collision.parentB;
                  pair.isActive = true;
                  pair.timeUpdated = timestamp;
                  pair.collision = collision;
                  pair.separation = collision.depth;
                  pair.inverseMass = parentA.inverseMass + parentB.inverseMass;
                  pair.friction = parentA.friction < parentB.friction ? parentA.friction : parentB.friction;
                  pair.frictionStatic = parentA.frictionStatic > parentB.frictionStatic ? parentA.frictionStatic : parentB.frictionStatic;
                  pair.restitution = parentA.restitution > parentB.restitution ? parentA.restitution : parentB.restitution;
                  pair.slop = parentA.slop > parentB.slop ? parentA.slop : parentB.slop;
                  pair.contactCount = supportCount;
                  collision.pair = pair;
                  var supportA = supports[0], contactA = contacts[0], supportB = supports[1], contactB = contacts[1];
                  if (contactB.vertex === supportA || contactA.vertex === supportB) {
                    contacts[1] = contactA;
                    contacts[0] = contactA = contactB;
                    contactB = contacts[1];
                  }
                  contactA.vertex = supportA;
                  contactB.vertex = supportB;
                };
                Pair.setActive = function(pair, isActive, timestamp) {
                  if (isActive) {
                    pair.isActive = true;
                    pair.timeUpdated = timestamp;
                  } else {
                    pair.isActive = false;
                    pair.contactCount = 0;
                  }
                };
                Pair.id = function(bodyA, bodyB) {
                  return bodyA.id < bodyB.id ? bodyA.id.toString(36) + ":" + bodyB.id.toString(36) : bodyB.id.toString(36) + ":" + bodyA.id.toString(36);
                };
              })();
            },
            /* 10 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Constraint2 = {};
              module2.exports = Constraint2;
              var Vertices = __webpack_require__(3);
              var Vector = __webpack_require__(2);
              var Sleeping = __webpack_require__(7);
              var Bounds = __webpack_require__(1);
              var Axes = __webpack_require__(11);
              var Common = __webpack_require__(0);
              (function() {
                Constraint2._warming = 0.4;
                Constraint2._torqueDampen = 1;
                Constraint2._minLength = 1e-6;
                Constraint2.create = function(options) {
                  var constraint = options;
                  if (constraint.bodyA && !constraint.pointA)
                    constraint.pointA = { x: 0, y: 0 };
                  if (constraint.bodyB && !constraint.pointB)
                    constraint.pointB = { x: 0, y: 0 };
                  var initialPointA = constraint.bodyA ? Vector.add(constraint.bodyA.position, constraint.pointA) : constraint.pointA, initialPointB = constraint.bodyB ? Vector.add(constraint.bodyB.position, constraint.pointB) : constraint.pointB, length = Vector.magnitude(Vector.sub(initialPointA, initialPointB));
                  constraint.length = typeof constraint.length !== "undefined" ? constraint.length : length;
                  constraint.id = constraint.id || Common.nextId();
                  constraint.label = constraint.label || "Constraint";
                  constraint.type = "constraint";
                  constraint.stiffness = constraint.stiffness || (constraint.length > 0 ? 1 : 0.7);
                  constraint.damping = constraint.damping || 0;
                  constraint.angularStiffness = constraint.angularStiffness || 0;
                  constraint.angleA = constraint.bodyA ? constraint.bodyA.angle : constraint.angleA;
                  constraint.angleB = constraint.bodyB ? constraint.bodyB.angle : constraint.angleB;
                  constraint.plugin = {};
                  var render = {
                    visible: true,
                    lineWidth: 2,
                    strokeStyle: "#ffffff",
                    type: "line",
                    anchors: true
                  };
                  if (constraint.length === 0 && constraint.stiffness > 0.1) {
                    render.type = "pin";
                    render.anchors = false;
                  } else if (constraint.stiffness < 0.9) {
                    render.type = "spring";
                  }
                  constraint.render = Common.extend(render, constraint.render);
                  return constraint;
                };
                Constraint2.preSolveAll = function(bodies) {
                  for (var i = 0; i < bodies.length; i += 1) {
                    var body = bodies[i], impulse = body.constraintImpulse;
                    if (body.isStatic || impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
                      continue;
                    }
                    body.position.x += impulse.x;
                    body.position.y += impulse.y;
                    body.angle += impulse.angle;
                  }
                };
                Constraint2.solveAll = function(constraints, delta) {
                  var timeScale = Common.clamp(delta / Common._baseDelta, 0, 1);
                  for (var i = 0; i < constraints.length; i += 1) {
                    var constraint = constraints[i], fixedA = !constraint.bodyA || constraint.bodyA && constraint.bodyA.isStatic, fixedB = !constraint.bodyB || constraint.bodyB && constraint.bodyB.isStatic;
                    if (fixedA || fixedB) {
                      Constraint2.solve(constraints[i], timeScale);
                    }
                  }
                  for (i = 0; i < constraints.length; i += 1) {
                    constraint = constraints[i];
                    fixedA = !constraint.bodyA || constraint.bodyA && constraint.bodyA.isStatic;
                    fixedB = !constraint.bodyB || constraint.bodyB && constraint.bodyB.isStatic;
                    if (!fixedA && !fixedB) {
                      Constraint2.solve(constraints[i], timeScale);
                    }
                  }
                };
                Constraint2.solve = function(constraint, timeScale) {
                  var bodyA = constraint.bodyA, bodyB = constraint.bodyB, pointA = constraint.pointA, pointB = constraint.pointB;
                  if (!bodyA && !bodyB)
                    return;
                  if (bodyA && !bodyA.isStatic) {
                    Vector.rotate(pointA, bodyA.angle - constraint.angleA, pointA);
                    constraint.angleA = bodyA.angle;
                  }
                  if (bodyB && !bodyB.isStatic) {
                    Vector.rotate(pointB, bodyB.angle - constraint.angleB, pointB);
                    constraint.angleB = bodyB.angle;
                  }
                  var pointAWorld = pointA, pointBWorld = pointB;
                  if (bodyA) pointAWorld = Vector.add(bodyA.position, pointA);
                  if (bodyB) pointBWorld = Vector.add(bodyB.position, pointB);
                  if (!pointAWorld || !pointBWorld)
                    return;
                  var delta = Vector.sub(pointAWorld, pointBWorld), currentLength = Vector.magnitude(delta);
                  if (currentLength < Constraint2._minLength) {
                    currentLength = Constraint2._minLength;
                  }
                  var difference = (currentLength - constraint.length) / currentLength, isRigid = constraint.stiffness >= 1 || constraint.length === 0, stiffness = isRigid ? constraint.stiffness * timeScale : constraint.stiffness * timeScale * timeScale, damping = constraint.damping * timeScale, force = Vector.mult(delta, difference * stiffness), massTotal = (bodyA ? bodyA.inverseMass : 0) + (bodyB ? bodyB.inverseMass : 0), inertiaTotal = (bodyA ? bodyA.inverseInertia : 0) + (bodyB ? bodyB.inverseInertia : 0), resistanceTotal = massTotal + inertiaTotal, torque, share, normal, normalVelocity, relativeVelocity;
                  if (damping > 0) {
                    var zero = Vector.create();
                    normal = Vector.div(delta, currentLength);
                    relativeVelocity = Vector.sub(
                      bodyB && Vector.sub(bodyB.position, bodyB.positionPrev) || zero,
                      bodyA && Vector.sub(bodyA.position, bodyA.positionPrev) || zero
                    );
                    normalVelocity = Vector.dot(normal, relativeVelocity);
                  }
                  if (bodyA && !bodyA.isStatic) {
                    share = bodyA.inverseMass / massTotal;
                    bodyA.constraintImpulse.x -= force.x * share;
                    bodyA.constraintImpulse.y -= force.y * share;
                    bodyA.position.x -= force.x * share;
                    bodyA.position.y -= force.y * share;
                    if (damping > 0) {
                      bodyA.positionPrev.x -= damping * normal.x * normalVelocity * share;
                      bodyA.positionPrev.y -= damping * normal.y * normalVelocity * share;
                    }
                    torque = Vector.cross(pointA, force) / resistanceTotal * Constraint2._torqueDampen * bodyA.inverseInertia * (1 - constraint.angularStiffness);
                    bodyA.constraintImpulse.angle -= torque;
                    bodyA.angle -= torque;
                  }
                  if (bodyB && !bodyB.isStatic) {
                    share = bodyB.inverseMass / massTotal;
                    bodyB.constraintImpulse.x += force.x * share;
                    bodyB.constraintImpulse.y += force.y * share;
                    bodyB.position.x += force.x * share;
                    bodyB.position.y += force.y * share;
                    if (damping > 0) {
                      bodyB.positionPrev.x += damping * normal.x * normalVelocity * share;
                      bodyB.positionPrev.y += damping * normal.y * normalVelocity * share;
                    }
                    torque = Vector.cross(pointB, force) / resistanceTotal * Constraint2._torqueDampen * bodyB.inverseInertia * (1 - constraint.angularStiffness);
                    bodyB.constraintImpulse.angle += torque;
                    bodyB.angle += torque;
                  }
                };
                Constraint2.postSolveAll = function(bodies) {
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], impulse = body.constraintImpulse;
                    if (body.isStatic || impulse.x === 0 && impulse.y === 0 && impulse.angle === 0) {
                      continue;
                    }
                    Sleeping.set(body, false);
                    for (var j = 0; j < body.parts.length; j++) {
                      var part = body.parts[j];
                      Vertices.translate(part.vertices, impulse);
                      if (j > 0) {
                        part.position.x += impulse.x;
                        part.position.y += impulse.y;
                      }
                      if (impulse.angle !== 0) {
                        Vertices.rotate(part.vertices, impulse.angle, body.position);
                        Axes.rotate(part.axes, impulse.angle);
                        if (j > 0) {
                          Vector.rotateAbout(part.position, impulse.angle, body.position, part.position);
                        }
                      }
                      Bounds.update(part.bounds, part.vertices, body.velocity);
                    }
                    impulse.angle *= Constraint2._warming;
                    impulse.x *= Constraint2._warming;
                    impulse.y *= Constraint2._warming;
                  }
                };
                Constraint2.pointAWorld = function(constraint) {
                  return {
                    x: (constraint.bodyA ? constraint.bodyA.position.x : 0) + (constraint.pointA ? constraint.pointA.x : 0),
                    y: (constraint.bodyA ? constraint.bodyA.position.y : 0) + (constraint.pointA ? constraint.pointA.y : 0)
                  };
                };
                Constraint2.pointBWorld = function(constraint) {
                  return {
                    x: (constraint.bodyB ? constraint.bodyB.position.x : 0) + (constraint.pointB ? constraint.pointB.x : 0),
                    y: (constraint.bodyB ? constraint.bodyB.position.y : 0) + (constraint.pointB ? constraint.pointB.y : 0)
                  };
                };
                Constraint2.currentLength = function(constraint) {
                  var pointAX = (constraint.bodyA ? constraint.bodyA.position.x : 0) + (constraint.pointA ? constraint.pointA.x : 0);
                  var pointAY = (constraint.bodyA ? constraint.bodyA.position.y : 0) + (constraint.pointA ? constraint.pointA.y : 0);
                  var pointBX = (constraint.bodyB ? constraint.bodyB.position.x : 0) + (constraint.pointB ? constraint.pointB.x : 0);
                  var pointBY = (constraint.bodyB ? constraint.bodyB.position.y : 0) + (constraint.pointB ? constraint.pointB.y : 0);
                  var deltaX = pointAX - pointBX;
                  var deltaY = pointAY - pointBY;
                  return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                };
              })();
            },
            /* 11 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Axes = {};
              module2.exports = Axes;
              var Vector = __webpack_require__(2);
              var Common = __webpack_require__(0);
              (function() {
                Axes.fromVertices = function(vertices) {
                  var axes = {};
                  for (var i = 0; i < vertices.length; i++) {
                    var j = (i + 1) % vertices.length, normal = Vector.normalise({
                      x: vertices[j].y - vertices[i].y,
                      y: vertices[i].x - vertices[j].x
                    }), gradient = normal.y === 0 ? Infinity : normal.x / normal.y;
                    gradient = gradient.toFixed(3).toString();
                    axes[gradient] = normal;
                  }
                  return Common.values(axes);
                };
                Axes.rotate = function(axes, angle) {
                  if (angle === 0)
                    return;
                  var cos = Math.cos(angle), sin = Math.sin(angle);
                  for (var i = 0; i < axes.length; i++) {
                    var axis = axes[i], xx;
                    xx = axis.x * cos - axis.y * sin;
                    axis.y = axis.x * sin + axis.y * cos;
                    axis.x = xx;
                  }
                };
              })();
            },
            /* 12 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Bodies2 = {};
              module2.exports = Bodies2;
              var Vertices = __webpack_require__(3);
              var Common = __webpack_require__(0);
              var Body2 = __webpack_require__(4);
              var Bounds = __webpack_require__(1);
              var Vector = __webpack_require__(2);
              (function() {
                Bodies2.rectangle = function(x, y, width, height, options) {
                  options = options || {};
                  var rectangle = {
                    label: "Rectangle Body",
                    position: { x, y },
                    vertices: Vertices.fromPath("L 0 0 L " + width + " 0 L " + width + " " + height + " L 0 " + height)
                  };
                  if (options.chamfer) {
                    var chamfer = options.chamfer;
                    rectangle.vertices = Vertices.chamfer(
                      rectangle.vertices,
                      chamfer.radius,
                      chamfer.quality,
                      chamfer.qualityMin,
                      chamfer.qualityMax
                    );
                    delete options.chamfer;
                  }
                  return Body2.create(Common.extend({}, rectangle, options));
                };
                Bodies2.trapezoid = function(x, y, width, height, slope, options) {
                  options = options || {};
                  if (slope >= 1) {
                    Common.warn("Bodies.trapezoid: slope parameter must be < 1.");
                  }
                  slope *= 0.5;
                  var roof = (1 - slope * 2) * width;
                  var x1 = width * slope, x2 = x1 + roof, x3 = x2 + x1, verticesPath;
                  if (slope < 0.5) {
                    verticesPath = "L 0 0 L " + x1 + " " + -height + " L " + x2 + " " + -height + " L " + x3 + " 0";
                  } else {
                    verticesPath = "L 0 0 L " + x2 + " " + -height + " L " + x3 + " 0";
                  }
                  var trapezoid = {
                    label: "Trapezoid Body",
                    position: { x, y },
                    vertices: Vertices.fromPath(verticesPath)
                  };
                  if (options.chamfer) {
                    var chamfer = options.chamfer;
                    trapezoid.vertices = Vertices.chamfer(
                      trapezoid.vertices,
                      chamfer.radius,
                      chamfer.quality,
                      chamfer.qualityMin,
                      chamfer.qualityMax
                    );
                    delete options.chamfer;
                  }
                  return Body2.create(Common.extend({}, trapezoid, options));
                };
                Bodies2.circle = function(x, y, radius, options, maxSides) {
                  options = options || {};
                  var circle = {
                    label: "Circle Body",
                    circleRadius: radius
                  };
                  maxSides = maxSides || 25;
                  var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));
                  if (sides % 2 === 1)
                    sides += 1;
                  return Bodies2.polygon(x, y, sides, radius, Common.extend({}, circle, options));
                };
                Bodies2.polygon = function(x, y, sides, radius, options) {
                  options = options || {};
                  if (sides < 3)
                    return Bodies2.circle(x, y, radius, options);
                  var theta = 2 * Math.PI / sides, path = "", offset = theta * 0.5;
                  for (var i = 0; i < sides; i += 1) {
                    var angle = offset + i * theta, xx = Math.cos(angle) * radius, yy = Math.sin(angle) * radius;
                    path += "L " + xx.toFixed(3) + " " + yy.toFixed(3) + " ";
                  }
                  var polygon = {
                    label: "Polygon Body",
                    position: { x, y },
                    vertices: Vertices.fromPath(path)
                  };
                  if (options.chamfer) {
                    var chamfer = options.chamfer;
                    polygon.vertices = Vertices.chamfer(
                      polygon.vertices,
                      chamfer.radius,
                      chamfer.quality,
                      chamfer.qualityMin,
                      chamfer.qualityMax
                    );
                    delete options.chamfer;
                  }
                  return Body2.create(Common.extend({}, polygon, options));
                };
                Bodies2.fromVertices = function(x, y, vertexSets, options, flagInternal, removeCollinear, minimumArea, removeDuplicatePoints) {
                  var decomp = Common.getDecomp(), canDecomp, body, parts, isConvex, isConcave, vertices, i, j, k, v, z;
                  canDecomp = Boolean(decomp && decomp.quickDecomp);
                  options = options || {};
                  parts = [];
                  flagInternal = typeof flagInternal !== "undefined" ? flagInternal : false;
                  removeCollinear = typeof removeCollinear !== "undefined" ? removeCollinear : 0.01;
                  minimumArea = typeof minimumArea !== "undefined" ? minimumArea : 10;
                  removeDuplicatePoints = typeof removeDuplicatePoints !== "undefined" ? removeDuplicatePoints : 0.01;
                  if (!Common.isArray(vertexSets[0])) {
                    vertexSets = [vertexSets];
                  }
                  for (v = 0; v < vertexSets.length; v += 1) {
                    vertices = vertexSets[v];
                    isConvex = Vertices.isConvex(vertices);
                    isConcave = !isConvex;
                    if (isConcave && !canDecomp) {
                      Common.warnOnce(
                        "Bodies.fromVertices: Install the 'poly-decomp' library and use Common.setDecomp or provide 'decomp' as a global to decompose concave vertices."
                      );
                    }
                    if (isConvex || !canDecomp) {
                      if (isConvex) {
                        vertices = Vertices.clockwiseSort(vertices);
                      } else {
                        vertices = Vertices.hull(vertices);
                      }
                      parts.push({
                        position: { x, y },
                        vertices
                      });
                    } else {
                      var concave = vertices.map(function(vertex) {
                        return [vertex.x, vertex.y];
                      });
                      decomp.makeCCW(concave);
                      if (removeCollinear !== false)
                        decomp.removeCollinearPoints(concave, removeCollinear);
                      if (removeDuplicatePoints !== false && decomp.removeDuplicatePoints)
                        decomp.removeDuplicatePoints(concave, removeDuplicatePoints);
                      var decomposed = decomp.quickDecomp(concave);
                      for (i = 0; i < decomposed.length; i++) {
                        var chunk = decomposed[i];
                        var chunkVertices = chunk.map(function(vertices2) {
                          return {
                            x: vertices2[0],
                            y: vertices2[1]
                          };
                        });
                        if (minimumArea > 0 && Vertices.area(chunkVertices) < minimumArea)
                          continue;
                        parts.push({
                          position: Vertices.centre(chunkVertices),
                          vertices: chunkVertices
                        });
                      }
                    }
                  }
                  for (i = 0; i < parts.length; i++) {
                    parts[i] = Body2.create(Common.extend(parts[i], options));
                  }
                  if (flagInternal) {
                    var coincident_max_dist = 5;
                    for (i = 0; i < parts.length; i++) {
                      var partA = parts[i];
                      for (j = i + 1; j < parts.length; j++) {
                        var partB = parts[j];
                        if (Bounds.overlaps(partA.bounds, partB.bounds)) {
                          var pav = partA.vertices, pbv = partB.vertices;
                          for (k = 0; k < partA.vertices.length; k++) {
                            for (z = 0; z < partB.vertices.length; z++) {
                              var da = Vector.magnitudeSquared(Vector.sub(pav[(k + 1) % pav.length], pbv[z])), db = Vector.magnitudeSquared(Vector.sub(pav[k], pbv[(z + 1) % pbv.length]));
                              if (da < coincident_max_dist && db < coincident_max_dist) {
                                pav[k].isInternal = true;
                                pbv[z].isInternal = true;
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  if (parts.length > 1) {
                    body = Body2.create(Common.extend({ parts: parts.slice(0) }, options));
                    Body2.setPosition(body, { x, y });
                    return body;
                  } else {
                    return parts[0];
                  }
                };
              })();
            },
            /* 13 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Detector = {};
              module2.exports = Detector;
              var Common = __webpack_require__(0);
              var Collision = __webpack_require__(8);
              (function() {
                Detector.create = function(options) {
                  var defaults = {
                    bodies: [],
                    collisions: [],
                    pairs: null
                  };
                  return Common.extend(defaults, options);
                };
                Detector.setBodies = function(detector, bodies) {
                  detector.bodies = bodies.slice(0);
                };
                Detector.clear = function(detector) {
                  detector.bodies = [];
                  detector.collisions = [];
                };
                Detector.collisions = function(detector) {
                  var pairs = detector.pairs, bodies = detector.bodies, bodiesLength = bodies.length, canCollide = Detector.canCollide, collides = Collision.collides, collisions = detector.collisions, collisionIndex = 0, i, j;
                  bodies.sort(Detector._compareBoundsX);
                  for (i = 0; i < bodiesLength; i++) {
                    var bodyA = bodies[i], boundsA = bodyA.bounds, boundXMax = bodyA.bounds.max.x, boundYMax = bodyA.bounds.max.y, boundYMin = bodyA.bounds.min.y, bodyAStatic = bodyA.isStatic || bodyA.isSleeping, partsALength = bodyA.parts.length, partsASingle = partsALength === 1;
                    for (j = i + 1; j < bodiesLength; j++) {
                      var bodyB = bodies[j], boundsB = bodyB.bounds;
                      if (boundsB.min.x > boundXMax) {
                        break;
                      }
                      if (boundYMax < boundsB.min.y || boundYMin > boundsB.max.y) {
                        continue;
                      }
                      if (bodyAStatic && (bodyB.isStatic || bodyB.isSleeping)) {
                        continue;
                      }
                      if (!canCollide(bodyA.collisionFilter, bodyB.collisionFilter)) {
                        continue;
                      }
                      var partsBLength = bodyB.parts.length;
                      if (partsASingle && partsBLength === 1) {
                        var collision = collides(bodyA, bodyB, pairs);
                        if (collision) {
                          collisions[collisionIndex++] = collision;
                        }
                      } else {
                        var partsAStart = partsALength > 1 ? 1 : 0, partsBStart = partsBLength > 1 ? 1 : 0;
                        for (var k = partsAStart; k < partsALength; k++) {
                          var partA = bodyA.parts[k], boundsA = partA.bounds;
                          for (var z = partsBStart; z < partsBLength; z++) {
                            var partB = bodyB.parts[z], boundsB = partB.bounds;
                            if (boundsA.min.x > boundsB.max.x || boundsA.max.x < boundsB.min.x || boundsA.max.y < boundsB.min.y || boundsA.min.y > boundsB.max.y) {
                              continue;
                            }
                            var collision = collides(partA, partB, pairs);
                            if (collision) {
                              collisions[collisionIndex++] = collision;
                            }
                          }
                        }
                      }
                    }
                  }
                  if (collisions.length !== collisionIndex) {
                    collisions.length = collisionIndex;
                  }
                  return collisions;
                };
                Detector.canCollide = function(filterA, filterB) {
                  if (filterA.group === filterB.group && filterA.group !== 0)
                    return filterA.group > 0;
                  return (filterA.mask & filterB.category) !== 0 && (filterB.mask & filterA.category) !== 0;
                };
                Detector._compareBoundsX = function(bodyA, bodyB) {
                  return bodyA.bounds.min.x - bodyB.bounds.min.x;
                };
              })();
            },
            /* 14 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Mouse = {};
              module2.exports = Mouse;
              var Common = __webpack_require__(0);
              (function() {
                Mouse.create = function(element) {
                  var mouse = {};
                  if (!element) {
                    Common.log("Mouse.create: element was undefined, defaulting to document.body", "warn");
                  }
                  mouse.element = element || document.body;
                  mouse.absolute = { x: 0, y: 0 };
                  mouse.position = { x: 0, y: 0 };
                  mouse.mousedownPosition = { x: 0, y: 0 };
                  mouse.mouseupPosition = { x: 0, y: 0 };
                  mouse.offset = { x: 0, y: 0 };
                  mouse.scale = { x: 1, y: 1 };
                  mouse.wheelDelta = 0;
                  mouse.button = -1;
                  mouse.pixelRatio = parseInt(mouse.element.getAttribute("data-pixel-ratio"), 10) || 1;
                  mouse.sourceEvents = {
                    mousemove: null,
                    mousedown: null,
                    mouseup: null,
                    mousewheel: null
                  };
                  mouse.mousemove = function(event) {
                    var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                    if (touches) {
                      mouse.button = 0;
                      event.preventDefault();
                    }
                    mouse.absolute.x = position.x;
                    mouse.absolute.y = position.y;
                    mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                    mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                    mouse.sourceEvents.mousemove = event;
                  };
                  mouse.mousedown = function(event) {
                    var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                    if (touches) {
                      mouse.button = 0;
                      event.preventDefault();
                    } else {
                      mouse.button = event.button;
                    }
                    mouse.absolute.x = position.x;
                    mouse.absolute.y = position.y;
                    mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                    mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                    mouse.mousedownPosition.x = mouse.position.x;
                    mouse.mousedownPosition.y = mouse.position.y;
                    mouse.sourceEvents.mousedown = event;
                  };
                  mouse.mouseup = function(event) {
                    var position = Mouse._getRelativeMousePosition(event, mouse.element, mouse.pixelRatio), touches = event.changedTouches;
                    if (touches) {
                      event.preventDefault();
                    }
                    mouse.button = -1;
                    mouse.absolute.x = position.x;
                    mouse.absolute.y = position.y;
                    mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                    mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                    mouse.mouseupPosition.x = mouse.position.x;
                    mouse.mouseupPosition.y = mouse.position.y;
                    mouse.sourceEvents.mouseup = event;
                  };
                  mouse.mousewheel = function(event) {
                    mouse.wheelDelta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));
                    event.preventDefault();
                    mouse.sourceEvents.mousewheel = event;
                  };
                  Mouse.setElement(mouse, mouse.element);
                  return mouse;
                };
                Mouse.setElement = function(mouse, element) {
                  mouse.element = element;
                  element.addEventListener("mousemove", mouse.mousemove, { passive: true });
                  element.addEventListener("mousedown", mouse.mousedown, { passive: true });
                  element.addEventListener("mouseup", mouse.mouseup, { passive: true });
                  element.addEventListener("wheel", mouse.mousewheel, { passive: false });
                  element.addEventListener("touchmove", mouse.mousemove, { passive: false });
                  element.addEventListener("touchstart", mouse.mousedown, { passive: false });
                  element.addEventListener("touchend", mouse.mouseup, { passive: false });
                };
                Mouse.clearSourceEvents = function(mouse) {
                  mouse.sourceEvents.mousemove = null;
                  mouse.sourceEvents.mousedown = null;
                  mouse.sourceEvents.mouseup = null;
                  mouse.sourceEvents.mousewheel = null;
                  mouse.wheelDelta = 0;
                };
                Mouse.setOffset = function(mouse, offset) {
                  mouse.offset.x = offset.x;
                  mouse.offset.y = offset.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                };
                Mouse.setScale = function(mouse, scale) {
                  mouse.scale.x = scale.x;
                  mouse.scale.y = scale.y;
                  mouse.position.x = mouse.absolute.x * mouse.scale.x + mouse.offset.x;
                  mouse.position.y = mouse.absolute.y * mouse.scale.y + mouse.offset.y;
                };
                Mouse._getRelativeMousePosition = function(event, element, pixelRatio) {
                  var elementBounds = element.getBoundingClientRect(), rootNode = document.documentElement || document.body.parentNode || document.body, scrollX = window.pageXOffset !== void 0 ? window.pageXOffset : rootNode.scrollLeft, scrollY = window.pageYOffset !== void 0 ? window.pageYOffset : rootNode.scrollTop, touches = event.changedTouches, x, y;
                  if (touches) {
                    x = touches[0].pageX - elementBounds.left - scrollX;
                    y = touches[0].pageY - elementBounds.top - scrollY;
                  } else {
                    x = event.pageX - elementBounds.left - scrollX;
                    y = event.pageY - elementBounds.top - scrollY;
                  }
                  return {
                    x: x / (element.clientWidth / (element.width || element.clientWidth) * pixelRatio),
                    y: y / (element.clientHeight / (element.height || element.clientHeight) * pixelRatio)
                  };
                };
              })();
            },
            /* 15 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Plugin = {};
              module2.exports = Plugin;
              var Common = __webpack_require__(0);
              (function() {
                Plugin._registry = {};
                Plugin.register = function(plugin) {
                  if (!Plugin.isPlugin(plugin)) {
                    Common.warn("Plugin.register:", Plugin.toString(plugin), "does not implement all required fields.");
                  }
                  if (plugin.name in Plugin._registry) {
                    var registered = Plugin._registry[plugin.name], pluginVersion = Plugin.versionParse(plugin.version).number, registeredVersion = Plugin.versionParse(registered.version).number;
                    if (pluginVersion > registeredVersion) {
                      Common.warn("Plugin.register:", Plugin.toString(registered), "was upgraded to", Plugin.toString(plugin));
                      Plugin._registry[plugin.name] = plugin;
                    } else if (pluginVersion < registeredVersion) {
                      Common.warn("Plugin.register:", Plugin.toString(registered), "can not be downgraded to", Plugin.toString(plugin));
                    } else if (plugin !== registered) {
                      Common.warn("Plugin.register:", Plugin.toString(plugin), "is already registered to different plugin object");
                    }
                  } else {
                    Plugin._registry[plugin.name] = plugin;
                  }
                  return plugin;
                };
                Plugin.resolve = function(dependency) {
                  return Plugin._registry[Plugin.dependencyParse(dependency).name];
                };
                Plugin.toString = function(plugin) {
                  return typeof plugin === "string" ? plugin : (plugin.name || "anonymous") + "@" + (plugin.version || plugin.range || "0.0.0");
                };
                Plugin.isPlugin = function(obj) {
                  return obj && obj.name && obj.version && obj.install;
                };
                Plugin.isUsed = function(module3, name) {
                  return module3.used.indexOf(name) > -1;
                };
                Plugin.isFor = function(plugin, module3) {
                  var parsed = plugin.for && Plugin.dependencyParse(plugin.for);
                  return !plugin.for || module3.name === parsed.name && Plugin.versionSatisfies(module3.version, parsed.range);
                };
                Plugin.use = function(module3, plugins) {
                  module3.uses = (module3.uses || []).concat(plugins || []);
                  if (module3.uses.length === 0) {
                    Common.warn("Plugin.use:", Plugin.toString(module3), "does not specify any dependencies to install.");
                    return;
                  }
                  var dependencies = Plugin.dependencies(module3), sortedDependencies = Common.topologicalSort(dependencies), status = [];
                  for (var i = 0; i < sortedDependencies.length; i += 1) {
                    if (sortedDependencies[i] === module3.name) {
                      continue;
                    }
                    var plugin = Plugin.resolve(sortedDependencies[i]);
                    if (!plugin) {
                      status.push("\u274C " + sortedDependencies[i]);
                      continue;
                    }
                    if (Plugin.isUsed(module3, plugin.name)) {
                      continue;
                    }
                    if (!Plugin.isFor(plugin, module3)) {
                      Common.warn("Plugin.use:", Plugin.toString(plugin), "is for", plugin.for, "but installed on", Plugin.toString(module3) + ".");
                      plugin._warned = true;
                    }
                    if (plugin.install) {
                      plugin.install(module3);
                    } else {
                      Common.warn("Plugin.use:", Plugin.toString(plugin), "does not specify an install function.");
                      plugin._warned = true;
                    }
                    if (plugin._warned) {
                      status.push("\u{1F536} " + Plugin.toString(plugin));
                      delete plugin._warned;
                    } else {
                      status.push("\u2705 " + Plugin.toString(plugin));
                    }
                    module3.used.push(plugin.name);
                  }
                  if (status.length > 0) {
                    Common.info(status.join("  "));
                  }
                };
                Plugin.dependencies = function(module3, tracked) {
                  var parsedBase = Plugin.dependencyParse(module3), name = parsedBase.name;
                  tracked = tracked || {};
                  if (name in tracked) {
                    return;
                  }
                  module3 = Plugin.resolve(module3) || module3;
                  tracked[name] = Common.map(module3.uses || [], function(dependency) {
                    if (Plugin.isPlugin(dependency)) {
                      Plugin.register(dependency);
                    }
                    var parsed = Plugin.dependencyParse(dependency), resolved = Plugin.resolve(dependency);
                    if (resolved && !Plugin.versionSatisfies(resolved.version, parsed.range)) {
                      Common.warn(
                        "Plugin.dependencies:",
                        Plugin.toString(resolved),
                        "does not satisfy",
                        Plugin.toString(parsed),
                        "used by",
                        Plugin.toString(parsedBase) + "."
                      );
                      resolved._warned = true;
                      module3._warned = true;
                    } else if (!resolved) {
                      Common.warn(
                        "Plugin.dependencies:",
                        Plugin.toString(dependency),
                        "used by",
                        Plugin.toString(parsedBase),
                        "could not be resolved."
                      );
                      module3._warned = true;
                    }
                    return parsed.name;
                  });
                  for (var i = 0; i < tracked[name].length; i += 1) {
                    Plugin.dependencies(tracked[name][i], tracked);
                  }
                  return tracked;
                };
                Plugin.dependencyParse = function(dependency) {
                  if (Common.isString(dependency)) {
                    var pattern = /^[\w-]+(@(\*|[\^~]?\d+\.\d+\.\d+(-[0-9A-Za-z-+]+)?))?$/;
                    if (!pattern.test(dependency)) {
                      Common.warn("Plugin.dependencyParse:", dependency, "is not a valid dependency string.");
                    }
                    return {
                      name: dependency.split("@")[0],
                      range: dependency.split("@")[1] || "*"
                    };
                  }
                  return {
                    name: dependency.name,
                    range: dependency.range || dependency.version
                  };
                };
                Plugin.versionParse = function(range) {
                  var pattern = /^(\*)|(\^|~|>=|>)?\s*((\d+)\.(\d+)\.(\d+))(-[0-9A-Za-z-+]+)?$/;
                  if (!pattern.test(range)) {
                    Common.warn("Plugin.versionParse:", range, "is not a valid version or range.");
                  }
                  var parts = pattern.exec(range);
                  var major = Number(parts[4]);
                  var minor = Number(parts[5]);
                  var patch = Number(parts[6]);
                  return {
                    isRange: Boolean(parts[1] || parts[2]),
                    version: parts[3],
                    range,
                    operator: parts[1] || parts[2] || "",
                    major,
                    minor,
                    patch,
                    parts: [major, minor, patch],
                    prerelease: parts[7],
                    number: major * 1e8 + minor * 1e4 + patch
                  };
                };
                Plugin.versionSatisfies = function(version, range) {
                  range = range || "*";
                  var r = Plugin.versionParse(range), v = Plugin.versionParse(version);
                  if (r.isRange) {
                    if (r.operator === "*" || version === "*") {
                      return true;
                    }
                    if (r.operator === ">") {
                      return v.number > r.number;
                    }
                    if (r.operator === ">=") {
                      return v.number >= r.number;
                    }
                    if (r.operator === "~") {
                      return v.major === r.major && v.minor === r.minor && v.patch >= r.patch;
                    }
                    if (r.operator === "^") {
                      if (r.major > 0) {
                        return v.major === r.major && v.number >= r.number;
                      }
                      if (r.minor > 0) {
                        return v.minor === r.minor && v.patch >= r.patch;
                      }
                      return v.patch === r.patch;
                    }
                  }
                  return version === range || version === "*";
                };
              })();
            },
            /* 16 */
            /***/
            function(module2, exports2) {
              var Contact2 = {};
              module2.exports = Contact2;
              (function() {
                Contact2.create = function(vertex) {
                  return {
                    vertex,
                    normalImpulse: 0,
                    tangentImpulse: 0
                  };
                };
              })();
            },
            /* 17 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Engine2 = {};
              module2.exports = Engine2;
              var Sleeping = __webpack_require__(7);
              var Resolver = __webpack_require__(18);
              var Detector = __webpack_require__(13);
              var Pairs = __webpack_require__(19);
              var Events2 = __webpack_require__(5);
              var Composite2 = __webpack_require__(6);
              var Constraint2 = __webpack_require__(10);
              var Common = __webpack_require__(0);
              var Body2 = __webpack_require__(4);
              (function() {
                Engine2._deltaMax = 1e3 / 60;
                Engine2.create = function(options) {
                  options = options || {};
                  var defaults = {
                    positionIterations: 6,
                    velocityIterations: 4,
                    constraintIterations: 2,
                    enableSleeping: false,
                    events: [],
                    plugin: {},
                    gravity: {
                      x: 0,
                      y: 1,
                      scale: 1e-3
                    },
                    timing: {
                      timestamp: 0,
                      timeScale: 1,
                      lastDelta: 0,
                      lastElapsed: 0,
                      lastUpdatesPerFrame: 0
                    }
                  };
                  var engine = Common.extend(defaults, options);
                  engine.world = options.world || Composite2.create({ label: "World" });
                  engine.pairs = options.pairs || Pairs.create();
                  engine.detector = options.detector || Detector.create();
                  engine.detector.pairs = engine.pairs;
                  engine.grid = { buckets: [] };
                  engine.world.gravity = engine.gravity;
                  engine.broadphase = engine.grid;
                  engine.metrics = {};
                  return engine;
                };
                Engine2.update = function(engine, delta) {
                  var startTime = Common.now();
                  var world2 = engine.world, detector = engine.detector, pairs = engine.pairs, timing = engine.timing, timestamp = timing.timestamp, i;
                  if (delta > Engine2._deltaMax) {
                    Common.warnOnce(
                      "Matter.Engine.update: delta argument is recommended to be less than or equal to",
                      Engine2._deltaMax.toFixed(3),
                      "ms."
                    );
                  }
                  delta = typeof delta !== "undefined" ? delta : Common._baseDelta;
                  delta *= timing.timeScale;
                  timing.timestamp += delta;
                  timing.lastDelta = delta;
                  var event = {
                    timestamp: timing.timestamp,
                    delta
                  };
                  Events2.trigger(engine, "beforeUpdate", event);
                  var allBodies = Composite2.allBodies(world2), allConstraints = Composite2.allConstraints(world2);
                  if (world2.isModified) {
                    Detector.setBodies(detector, allBodies);
                    Composite2.setModified(world2, false, false, true);
                  }
                  if (engine.enableSleeping)
                    Sleeping.update(allBodies, delta);
                  Engine2._bodiesApplyGravity(allBodies, engine.gravity);
                  if (delta > 0) {
                    Engine2._bodiesUpdate(allBodies, delta);
                  }
                  Events2.trigger(engine, "beforeSolve", event);
                  Constraint2.preSolveAll(allBodies);
                  for (i = 0; i < engine.constraintIterations; i++) {
                    Constraint2.solveAll(allConstraints, delta);
                  }
                  Constraint2.postSolveAll(allBodies);
                  var collisions = Detector.collisions(detector);
                  Pairs.update(pairs, collisions, timestamp);
                  if (engine.enableSleeping)
                    Sleeping.afterCollisions(pairs.list);
                  if (pairs.collisionStart.length > 0) {
                    Events2.trigger(engine, "collisionStart", {
                      pairs: pairs.collisionStart,
                      timestamp: timing.timestamp,
                      delta
                    });
                  }
                  var positionDamping = Common.clamp(20 / engine.positionIterations, 0, 1);
                  Resolver.preSolvePosition(pairs.list);
                  for (i = 0; i < engine.positionIterations; i++) {
                    Resolver.solvePosition(pairs.list, delta, positionDamping);
                  }
                  Resolver.postSolvePosition(allBodies);
                  Constraint2.preSolveAll(allBodies);
                  for (i = 0; i < engine.constraintIterations; i++) {
                    Constraint2.solveAll(allConstraints, delta);
                  }
                  Constraint2.postSolveAll(allBodies);
                  Resolver.preSolveVelocity(pairs.list);
                  for (i = 0; i < engine.velocityIterations; i++) {
                    Resolver.solveVelocity(pairs.list, delta);
                  }
                  Engine2._bodiesUpdateVelocities(allBodies);
                  if (pairs.collisionActive.length > 0) {
                    Events2.trigger(engine, "collisionActive", {
                      pairs: pairs.collisionActive,
                      timestamp: timing.timestamp,
                      delta
                    });
                  }
                  if (pairs.collisionEnd.length > 0) {
                    Events2.trigger(engine, "collisionEnd", {
                      pairs: pairs.collisionEnd,
                      timestamp: timing.timestamp,
                      delta
                    });
                  }
                  Engine2._bodiesClearForces(allBodies);
                  Events2.trigger(engine, "afterUpdate", event);
                  engine.timing.lastElapsed = Common.now() - startTime;
                  return engine;
                };
                Engine2.merge = function(engineA, engineB) {
                  Common.extend(engineA, engineB);
                  if (engineB.world) {
                    engineA.world = engineB.world;
                    Engine2.clear(engineA);
                    var bodies = Composite2.allBodies(engineA.world);
                    for (var i = 0; i < bodies.length; i++) {
                      var body = bodies[i];
                      Sleeping.set(body, false);
                      body.id = Common.nextId();
                    }
                  }
                };
                Engine2.clear = function(engine) {
                  Pairs.clear(engine.pairs);
                  Detector.clear(engine.detector);
                };
                Engine2._bodiesClearForces = function(bodies) {
                  var bodiesLength = bodies.length;
                  for (var i = 0; i < bodiesLength; i++) {
                    var body = bodies[i];
                    body.force.x = 0;
                    body.force.y = 0;
                    body.torque = 0;
                  }
                };
                Engine2._bodiesApplyGravity = function(bodies, gravity) {
                  var gravityScale = typeof gravity.scale !== "undefined" ? gravity.scale : 1e-3, bodiesLength = bodies.length;
                  if (gravity.x === 0 && gravity.y === 0 || gravityScale === 0) {
                    return;
                  }
                  for (var i = 0; i < bodiesLength; i++) {
                    var body = bodies[i];
                    if (body.isStatic || body.isSleeping)
                      continue;
                    body.force.y += body.mass * gravity.y * gravityScale;
                    body.force.x += body.mass * gravity.x * gravityScale;
                  }
                };
                Engine2._bodiesUpdate = function(bodies, delta) {
                  var bodiesLength = bodies.length;
                  for (var i = 0; i < bodiesLength; i++) {
                    var body = bodies[i];
                    if (body.isStatic || body.isSleeping)
                      continue;
                    Body2.update(body, delta);
                  }
                };
                Engine2._bodiesUpdateVelocities = function(bodies) {
                  var bodiesLength = bodies.length;
                  for (var i = 0; i < bodiesLength; i++) {
                    Body2.updateVelocities(bodies[i]);
                  }
                };
              })();
            },
            /* 18 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Resolver = {};
              module2.exports = Resolver;
              var Vertices = __webpack_require__(3);
              var Common = __webpack_require__(0);
              var Bounds = __webpack_require__(1);
              (function() {
                Resolver._restingThresh = 2;
                Resolver._restingThreshTangent = Math.sqrt(6);
                Resolver._positionDampen = 0.9;
                Resolver._positionWarming = 0.8;
                Resolver._frictionNormalMultiplier = 5;
                Resolver._frictionMaxStatic = Number.MAX_VALUE;
                Resolver.preSolvePosition = function(pairs) {
                  var i, pair, contactCount, pairsLength = pairs.length;
                  for (i = 0; i < pairsLength; i++) {
                    pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    contactCount = pair.contactCount;
                    pair.collision.parentA.totalContacts += contactCount;
                    pair.collision.parentB.totalContacts += contactCount;
                  }
                };
                Resolver.solvePosition = function(pairs, delta, damping) {
                  var i, pair, collision, bodyA, bodyB, normal, contactShare, positionImpulse, positionDampen = Resolver._positionDampen * (damping || 1), slopDampen = Common.clamp(delta / Common._baseDelta, 0, 1), pairsLength = pairs.length;
                  for (i = 0; i < pairsLength; i++) {
                    pair = pairs[i];
                    if (!pair.isActive || pair.isSensor)
                      continue;
                    collision = pair.collision;
                    bodyA = collision.parentA;
                    bodyB = collision.parentB;
                    normal = collision.normal;
                    pair.separation = collision.depth + normal.x * (bodyB.positionImpulse.x - bodyA.positionImpulse.x) + normal.y * (bodyB.positionImpulse.y - bodyA.positionImpulse.y);
                  }
                  for (i = 0; i < pairsLength; i++) {
                    pair = pairs[i];
                    if (!pair.isActive || pair.isSensor)
                      continue;
                    collision = pair.collision;
                    bodyA = collision.parentA;
                    bodyB = collision.parentB;
                    normal = collision.normal;
                    positionImpulse = pair.separation - pair.slop * slopDampen;
                    if (bodyA.isStatic || bodyB.isStatic)
                      positionImpulse *= 2;
                    if (!(bodyA.isStatic || bodyA.isSleeping)) {
                      contactShare = positionDampen / bodyA.totalContacts;
                      bodyA.positionImpulse.x += normal.x * positionImpulse * contactShare;
                      bodyA.positionImpulse.y += normal.y * positionImpulse * contactShare;
                    }
                    if (!(bodyB.isStatic || bodyB.isSleeping)) {
                      contactShare = positionDampen / bodyB.totalContacts;
                      bodyB.positionImpulse.x -= normal.x * positionImpulse * contactShare;
                      bodyB.positionImpulse.y -= normal.y * positionImpulse * contactShare;
                    }
                  }
                };
                Resolver.postSolvePosition = function(bodies) {
                  var positionWarming = Resolver._positionWarming, bodiesLength = bodies.length, verticesTranslate = Vertices.translate, boundsUpdate = Bounds.update;
                  for (var i = 0; i < bodiesLength; i++) {
                    var body = bodies[i], positionImpulse = body.positionImpulse, positionImpulseX = positionImpulse.x, positionImpulseY = positionImpulse.y, velocity = body.velocity;
                    body.totalContacts = 0;
                    if (positionImpulseX !== 0 || positionImpulseY !== 0) {
                      for (var j = 0; j < body.parts.length; j++) {
                        var part = body.parts[j];
                        verticesTranslate(part.vertices, positionImpulse);
                        boundsUpdate(part.bounds, part.vertices, velocity);
                        part.position.x += positionImpulseX;
                        part.position.y += positionImpulseY;
                      }
                      body.positionPrev.x += positionImpulseX;
                      body.positionPrev.y += positionImpulseY;
                      if (positionImpulseX * velocity.x + positionImpulseY * velocity.y < 0) {
                        positionImpulse.x = 0;
                        positionImpulse.y = 0;
                      } else {
                        positionImpulse.x *= positionWarming;
                        positionImpulse.y *= positionWarming;
                      }
                    }
                  }
                };
                Resolver.preSolveVelocity = function(pairs) {
                  var pairsLength = pairs.length, i, j;
                  for (i = 0; i < pairsLength; i++) {
                    var pair = pairs[i];
                    if (!pair.isActive || pair.isSensor)
                      continue;
                    var contacts = pair.contacts, contactCount = pair.contactCount, collision = pair.collision, bodyA = collision.parentA, bodyB = collision.parentB, normal = collision.normal, tangent = collision.tangent;
                    for (j = 0; j < contactCount; j++) {
                      var contact = contacts[j], contactVertex = contact.vertex, normalImpulse = contact.normalImpulse, tangentImpulse = contact.tangentImpulse;
                      if (normalImpulse !== 0 || tangentImpulse !== 0) {
                        var impulseX = normal.x * normalImpulse + tangent.x * tangentImpulse, impulseY = normal.y * normalImpulse + tangent.y * tangentImpulse;
                        if (!(bodyA.isStatic || bodyA.isSleeping)) {
                          bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                          bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                          bodyA.anglePrev += bodyA.inverseInertia * ((contactVertex.x - bodyA.position.x) * impulseY - (contactVertex.y - bodyA.position.y) * impulseX);
                        }
                        if (!(bodyB.isStatic || bodyB.isSleeping)) {
                          bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                          bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                          bodyB.anglePrev -= bodyB.inverseInertia * ((contactVertex.x - bodyB.position.x) * impulseY - (contactVertex.y - bodyB.position.y) * impulseX);
                        }
                      }
                    }
                  }
                };
                Resolver.solveVelocity = function(pairs, delta) {
                  var timeScale = delta / Common._baseDelta, timeScaleSquared = timeScale * timeScale, timeScaleCubed = timeScaleSquared * timeScale, restingThresh = -Resolver._restingThresh * timeScale, restingThreshTangent = Resolver._restingThreshTangent, frictionNormalMultiplier = Resolver._frictionNormalMultiplier * timeScale, frictionMaxStatic = Resolver._frictionMaxStatic, pairsLength = pairs.length, tangentImpulse, maxFriction, i, j;
                  for (i = 0; i < pairsLength; i++) {
                    var pair = pairs[i];
                    if (!pair.isActive || pair.isSensor)
                      continue;
                    var collision = pair.collision, bodyA = collision.parentA, bodyB = collision.parentB, normalX = collision.normal.x, normalY = collision.normal.y, tangentX = collision.tangent.x, tangentY = collision.tangent.y, inverseMassTotal = pair.inverseMass, friction = pair.friction * pair.frictionStatic * frictionNormalMultiplier, contacts = pair.contacts, contactCount = pair.contactCount, contactShare = 1 / contactCount;
                    var bodyAVelocityX = bodyA.position.x - bodyA.positionPrev.x, bodyAVelocityY = bodyA.position.y - bodyA.positionPrev.y, bodyAAngularVelocity = bodyA.angle - bodyA.anglePrev, bodyBVelocityX = bodyB.position.x - bodyB.positionPrev.x, bodyBVelocityY = bodyB.position.y - bodyB.positionPrev.y, bodyBAngularVelocity = bodyB.angle - bodyB.anglePrev;
                    for (j = 0; j < contactCount; j++) {
                      var contact = contacts[j], contactVertex = contact.vertex;
                      var offsetAX = contactVertex.x - bodyA.position.x, offsetAY = contactVertex.y - bodyA.position.y, offsetBX = contactVertex.x - bodyB.position.x, offsetBY = contactVertex.y - bodyB.position.y;
                      var velocityPointAX = bodyAVelocityX - offsetAY * bodyAAngularVelocity, velocityPointAY = bodyAVelocityY + offsetAX * bodyAAngularVelocity, velocityPointBX = bodyBVelocityX - offsetBY * bodyBAngularVelocity, velocityPointBY = bodyBVelocityY + offsetBX * bodyBAngularVelocity;
                      var relativeVelocityX = velocityPointAX - velocityPointBX, relativeVelocityY = velocityPointAY - velocityPointBY;
                      var normalVelocity = normalX * relativeVelocityX + normalY * relativeVelocityY, tangentVelocity = tangentX * relativeVelocityX + tangentY * relativeVelocityY;
                      var normalOverlap = pair.separation + normalVelocity;
                      var normalForce = Math.min(normalOverlap, 1);
                      normalForce = normalOverlap < 0 ? 0 : normalForce;
                      var frictionLimit = normalForce * friction;
                      if (tangentVelocity < -frictionLimit || tangentVelocity > frictionLimit) {
                        maxFriction = tangentVelocity > 0 ? tangentVelocity : -tangentVelocity;
                        tangentImpulse = pair.friction * (tangentVelocity > 0 ? 1 : -1) * timeScaleCubed;
                        if (tangentImpulse < -maxFriction) {
                          tangentImpulse = -maxFriction;
                        } else if (tangentImpulse > maxFriction) {
                          tangentImpulse = maxFriction;
                        }
                      } else {
                        tangentImpulse = tangentVelocity;
                        maxFriction = frictionMaxStatic;
                      }
                      var oAcN = offsetAX * normalY - offsetAY * normalX, oBcN = offsetBX * normalY - offsetBY * normalX, share = contactShare / (inverseMassTotal + bodyA.inverseInertia * oAcN * oAcN + bodyB.inverseInertia * oBcN * oBcN);
                      var normalImpulse = (1 + pair.restitution) * normalVelocity * share;
                      tangentImpulse *= share;
                      if (normalVelocity < restingThresh) {
                        contact.normalImpulse = 0;
                      } else {
                        var contactNormalImpulse = contact.normalImpulse;
                        contact.normalImpulse += normalImpulse;
                        if (contact.normalImpulse > 0) contact.normalImpulse = 0;
                        normalImpulse = contact.normalImpulse - contactNormalImpulse;
                      }
                      if (tangentVelocity < -restingThreshTangent || tangentVelocity > restingThreshTangent) {
                        contact.tangentImpulse = 0;
                      } else {
                        var contactTangentImpulse = contact.tangentImpulse;
                        contact.tangentImpulse += tangentImpulse;
                        if (contact.tangentImpulse < -maxFriction) contact.tangentImpulse = -maxFriction;
                        if (contact.tangentImpulse > maxFriction) contact.tangentImpulse = maxFriction;
                        tangentImpulse = contact.tangentImpulse - contactTangentImpulse;
                      }
                      var impulseX = normalX * normalImpulse + tangentX * tangentImpulse, impulseY = normalY * normalImpulse + tangentY * tangentImpulse;
                      if (!(bodyA.isStatic || bodyA.isSleeping)) {
                        bodyA.positionPrev.x += impulseX * bodyA.inverseMass;
                        bodyA.positionPrev.y += impulseY * bodyA.inverseMass;
                        bodyA.anglePrev += (offsetAX * impulseY - offsetAY * impulseX) * bodyA.inverseInertia;
                      }
                      if (!(bodyB.isStatic || bodyB.isSleeping)) {
                        bodyB.positionPrev.x -= impulseX * bodyB.inverseMass;
                        bodyB.positionPrev.y -= impulseY * bodyB.inverseMass;
                        bodyB.anglePrev -= (offsetBX * impulseY - offsetBY * impulseX) * bodyB.inverseInertia;
                      }
                    }
                  }
                };
              })();
            },
            /* 19 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Pairs = {};
              module2.exports = Pairs;
              var Pair = __webpack_require__(9);
              var Common = __webpack_require__(0);
              (function() {
                Pairs.create = function(options) {
                  return Common.extend({
                    table: {},
                    list: [],
                    collisionStart: [],
                    collisionActive: [],
                    collisionEnd: []
                  }, options);
                };
                Pairs.update = function(pairs, collisions, timestamp) {
                  var pairUpdate = Pair.update, pairCreate = Pair.create, pairSetActive = Pair.setActive, pairsTable = pairs.table, pairsList = pairs.list, pairsListLength = pairsList.length, pairsListIndex = pairsListLength, collisionStart = pairs.collisionStart, collisionEnd = pairs.collisionEnd, collisionActive = pairs.collisionActive, collisionsLength = collisions.length, collisionStartIndex = 0, collisionEndIndex = 0, collisionActiveIndex = 0, collision, pair, i;
                  for (i = 0; i < collisionsLength; i++) {
                    collision = collisions[i];
                    pair = collision.pair;
                    if (pair) {
                      if (pair.isActive) {
                        collisionActive[collisionActiveIndex++] = pair;
                      }
                      pairUpdate(pair, collision, timestamp);
                    } else {
                      pair = pairCreate(collision, timestamp);
                      pairsTable[pair.id] = pair;
                      collisionStart[collisionStartIndex++] = pair;
                      pairsList[pairsListIndex++] = pair;
                    }
                  }
                  pairsListIndex = 0;
                  pairsListLength = pairsList.length;
                  for (i = 0; i < pairsListLength; i++) {
                    pair = pairsList[i];
                    if (pair.timeUpdated >= timestamp) {
                      pairsList[pairsListIndex++] = pair;
                    } else {
                      pairSetActive(pair, false, timestamp);
                      if (pair.collision.bodyA.sleepCounter > 0 && pair.collision.bodyB.sleepCounter > 0) {
                        pairsList[pairsListIndex++] = pair;
                      } else {
                        collisionEnd[collisionEndIndex++] = pair;
                        delete pairsTable[pair.id];
                      }
                    }
                  }
                  if (pairsList.length !== pairsListIndex) {
                    pairsList.length = pairsListIndex;
                  }
                  if (collisionStart.length !== collisionStartIndex) {
                    collisionStart.length = collisionStartIndex;
                  }
                  if (collisionEnd.length !== collisionEndIndex) {
                    collisionEnd.length = collisionEndIndex;
                  }
                  if (collisionActive.length !== collisionActiveIndex) {
                    collisionActive.length = collisionActiveIndex;
                  }
                };
                Pairs.clear = function(pairs) {
                  pairs.table = {};
                  pairs.list.length = 0;
                  pairs.collisionStart.length = 0;
                  pairs.collisionActive.length = 0;
                  pairs.collisionEnd.length = 0;
                  return pairs;
                };
              })();
            },
            /* 20 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Matter2 = module2.exports = __webpack_require__(21);
              Matter2.Axes = __webpack_require__(11);
              Matter2.Bodies = __webpack_require__(12);
              Matter2.Body = __webpack_require__(4);
              Matter2.Bounds = __webpack_require__(1);
              Matter2.Collision = __webpack_require__(8);
              Matter2.Common = __webpack_require__(0);
              Matter2.Composite = __webpack_require__(6);
              Matter2.Composites = __webpack_require__(22);
              Matter2.Constraint = __webpack_require__(10);
              Matter2.Contact = __webpack_require__(16);
              Matter2.Detector = __webpack_require__(13);
              Matter2.Engine = __webpack_require__(17);
              Matter2.Events = __webpack_require__(5);
              Matter2.Grid = __webpack_require__(23);
              Matter2.Mouse = __webpack_require__(14);
              Matter2.MouseConstraint = __webpack_require__(24);
              Matter2.Pair = __webpack_require__(9);
              Matter2.Pairs = __webpack_require__(19);
              Matter2.Plugin = __webpack_require__(15);
              Matter2.Query = __webpack_require__(25);
              Matter2.Render = __webpack_require__(26);
              Matter2.Resolver = __webpack_require__(18);
              Matter2.Runner = __webpack_require__(27);
              Matter2.SAT = __webpack_require__(28);
              Matter2.Sleeping = __webpack_require__(7);
              Matter2.Svg = __webpack_require__(29);
              Matter2.Vector = __webpack_require__(2);
              Matter2.Vertices = __webpack_require__(3);
              Matter2.World = __webpack_require__(30);
              Matter2.Engine.run = Matter2.Runner.run;
              Matter2.Common.deprecated(Matter2.Engine, "run", "Engine.run \u27A4 use Matter.Runner.run(engine) instead");
            },
            /* 21 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Matter2 = {};
              module2.exports = Matter2;
              var Plugin = __webpack_require__(15);
              var Common = __webpack_require__(0);
              (function() {
                Matter2.name = "matter-js";
                Matter2.version = true ? "0.20.0" : void 0;
                Matter2.uses = [];
                Matter2.used = [];
                Matter2.use = function() {
                  Plugin.use(Matter2, Array.prototype.slice.call(arguments));
                };
                Matter2.before = function(path, func) {
                  path = path.replace(/^Matter./, "");
                  return Common.chainPathBefore(Matter2, path, func);
                };
                Matter2.after = function(path, func) {
                  path = path.replace(/^Matter./, "");
                  return Common.chainPathAfter(Matter2, path, func);
                };
              })();
            },
            /* 22 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Composites = {};
              module2.exports = Composites;
              var Composite2 = __webpack_require__(6);
              var Constraint2 = __webpack_require__(10);
              var Common = __webpack_require__(0);
              var Body2 = __webpack_require__(4);
              var Bodies2 = __webpack_require__(12);
              var deprecated = Common.deprecated;
              (function() {
                Composites.stack = function(x, y, columns, rows, columnGap, rowGap, callback) {
                  var stack = Composite2.create({ label: "Stack" }), currentX = x, currentY = y, lastBody, i = 0;
                  for (var row = 0; row < rows; row++) {
                    var maxHeight = 0;
                    for (var column = 0; column < columns; column++) {
                      var body = callback(currentX, currentY, column, row, lastBody, i);
                      if (body) {
                        var bodyHeight = body.bounds.max.y - body.bounds.min.y, bodyWidth = body.bounds.max.x - body.bounds.min.x;
                        if (bodyHeight > maxHeight)
                          maxHeight = bodyHeight;
                        Body2.translate(body, { x: bodyWidth * 0.5, y: bodyHeight * 0.5 });
                        currentX = body.bounds.max.x + columnGap;
                        Composite2.addBody(stack, body);
                        lastBody = body;
                        i += 1;
                      } else {
                        currentX += columnGap;
                      }
                    }
                    currentY += maxHeight + rowGap;
                    currentX = x;
                  }
                  return stack;
                };
                Composites.chain = function(composite, xOffsetA, yOffsetA, xOffsetB, yOffsetB, options) {
                  var bodies = composite.bodies;
                  for (var i = 1; i < bodies.length; i++) {
                    var bodyA = bodies[i - 1], bodyB = bodies[i], bodyAHeight = bodyA.bounds.max.y - bodyA.bounds.min.y, bodyAWidth = bodyA.bounds.max.x - bodyA.bounds.min.x, bodyBHeight = bodyB.bounds.max.y - bodyB.bounds.min.y, bodyBWidth = bodyB.bounds.max.x - bodyB.bounds.min.x;
                    var defaults = {
                      bodyA,
                      pointA: { x: bodyAWidth * xOffsetA, y: bodyAHeight * yOffsetA },
                      bodyB,
                      pointB: { x: bodyBWidth * xOffsetB, y: bodyBHeight * yOffsetB }
                    };
                    var constraint = Common.extend(defaults, options);
                    Composite2.addConstraint(composite, Constraint2.create(constraint));
                  }
                  composite.label += " Chain";
                  return composite;
                };
                Composites.mesh = function(composite, columns, rows, crossBrace, options) {
                  var bodies = composite.bodies, row, col, bodyA, bodyB, bodyC;
                  for (row = 0; row < rows; row++) {
                    for (col = 1; col < columns; col++) {
                      bodyA = bodies[col - 1 + row * columns];
                      bodyB = bodies[col + row * columns];
                      Composite2.addConstraint(composite, Constraint2.create(Common.extend({ bodyA, bodyB }, options)));
                    }
                    if (row > 0) {
                      for (col = 0; col < columns; col++) {
                        bodyA = bodies[col + (row - 1) * columns];
                        bodyB = bodies[col + row * columns];
                        Composite2.addConstraint(composite, Constraint2.create(Common.extend({ bodyA, bodyB }, options)));
                        if (crossBrace && col > 0) {
                          bodyC = bodies[col - 1 + (row - 1) * columns];
                          Composite2.addConstraint(composite, Constraint2.create(Common.extend({ bodyA: bodyC, bodyB }, options)));
                        }
                        if (crossBrace && col < columns - 1) {
                          bodyC = bodies[col + 1 + (row - 1) * columns];
                          Composite2.addConstraint(composite, Constraint2.create(Common.extend({ bodyA: bodyC, bodyB }, options)));
                        }
                      }
                    }
                  }
                  composite.label += " Mesh";
                  return composite;
                };
                Composites.pyramid = function(x, y, columns, rows, columnGap, rowGap, callback) {
                  return Composites.stack(x, y, columns, rows, columnGap, rowGap, function(stackX, stackY, column, row, lastBody, i) {
                    var actualRows = Math.min(rows, Math.ceil(columns / 2)), lastBodyWidth = lastBody ? lastBody.bounds.max.x - lastBody.bounds.min.x : 0;
                    if (row > actualRows)
                      return;
                    row = actualRows - row;
                    var start = row, end = columns - 1 - row;
                    if (column < start || column > end)
                      return;
                    if (i === 1) {
                      Body2.translate(lastBody, { x: (column + (columns % 2 === 1 ? 1 : -1)) * lastBodyWidth, y: 0 });
                    }
                    var xOffset = lastBody ? column * lastBodyWidth : 0;
                    return callback(x + xOffset + column * columnGap, stackY, column, row, lastBody, i);
                  });
                };
                Composites.newtonsCradle = function(x, y, number, size, length) {
                  var newtonsCradle = Composite2.create({ label: "Newtons Cradle" });
                  for (var i = 0; i < number; i++) {
                    var separation = 1.9, circle = Bodies2.circle(
                      x + i * (size * separation),
                      y + length,
                      size,
                      { inertia: Infinity, restitution: 1, friction: 0, frictionAir: 1e-4, slop: 1 }
                    ), constraint = Constraint2.create({ pointA: { x: x + i * (size * separation), y }, bodyB: circle });
                    Composite2.addBody(newtonsCradle, circle);
                    Composite2.addConstraint(newtonsCradle, constraint);
                  }
                  return newtonsCradle;
                };
                deprecated(Composites, "newtonsCradle", "Composites.newtonsCradle \u27A4 moved to newtonsCradle example");
                Composites.car = function(x, y, width, height, wheelSize) {
                  var group = Body2.nextGroup(true), wheelBase = 20, wheelAOffset = -width * 0.5 + wheelBase, wheelBOffset = width * 0.5 - wheelBase, wheelYOffset = 0;
                  var car = Composite2.create({ label: "Car" }), body = Bodies2.rectangle(x, y, width, height, {
                    collisionFilter: {
                      group
                    },
                    chamfer: {
                      radius: height * 0.5
                    },
                    density: 2e-4
                  });
                  var wheelA = Bodies2.circle(x + wheelAOffset, y + wheelYOffset, wheelSize, {
                    collisionFilter: {
                      group
                    },
                    friction: 0.8
                  });
                  var wheelB = Bodies2.circle(x + wheelBOffset, y + wheelYOffset, wheelSize, {
                    collisionFilter: {
                      group
                    },
                    friction: 0.8
                  });
                  var axelA = Constraint2.create({
                    bodyB: body,
                    pointB: { x: wheelAOffset, y: wheelYOffset },
                    bodyA: wheelA,
                    stiffness: 1,
                    length: 0
                  });
                  var axelB = Constraint2.create({
                    bodyB: body,
                    pointB: { x: wheelBOffset, y: wheelYOffset },
                    bodyA: wheelB,
                    stiffness: 1,
                    length: 0
                  });
                  Composite2.addBody(car, body);
                  Composite2.addBody(car, wheelA);
                  Composite2.addBody(car, wheelB);
                  Composite2.addConstraint(car, axelA);
                  Composite2.addConstraint(car, axelB);
                  return car;
                };
                deprecated(Composites, "car", "Composites.car \u27A4 moved to car example");
                Composites.softBody = function(x, y, columns, rows, columnGap, rowGap, crossBrace, particleRadius, particleOptions, constraintOptions) {
                  particleOptions = Common.extend({ inertia: Infinity }, particleOptions);
                  constraintOptions = Common.extend({ stiffness: 0.2, render: { type: "line", anchors: false } }, constraintOptions);
                  var softBody = Composites.stack(x, y, columns, rows, columnGap, rowGap, function(stackX, stackY) {
                    return Bodies2.circle(stackX, stackY, particleRadius, particleOptions);
                  });
                  Composites.mesh(softBody, columns, rows, crossBrace, constraintOptions);
                  softBody.label = "Soft Body";
                  return softBody;
                };
                deprecated(Composites, "softBody", "Composites.softBody \u27A4 moved to softBody and cloth examples");
              })();
            },
            /* 23 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Grid = {};
              module2.exports = Grid;
              var Pair = __webpack_require__(9);
              var Common = __webpack_require__(0);
              var deprecated = Common.deprecated;
              (function() {
                Grid.create = function(options) {
                  var defaults = {
                    buckets: {},
                    pairs: {},
                    pairsList: [],
                    bucketWidth: 48,
                    bucketHeight: 48
                  };
                  return Common.extend(defaults, options);
                };
                Grid.update = function(grid, bodies, engine, forceUpdate) {
                  var i, col, row, world2 = engine.world, buckets = grid.buckets, bucket, bucketId, gridChanged = false;
                  for (i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    if (body.isSleeping && !forceUpdate)
                      continue;
                    if (world2.bounds && (body.bounds.max.x < world2.bounds.min.x || body.bounds.min.x > world2.bounds.max.x || body.bounds.max.y < world2.bounds.min.y || body.bounds.min.y > world2.bounds.max.y))
                      continue;
                    var newRegion = Grid._getRegion(grid, body);
                    if (!body.region || newRegion.id !== body.region.id || forceUpdate) {
                      if (!body.region || forceUpdate)
                        body.region = newRegion;
                      var union = Grid._regionUnion(newRegion, body.region);
                      for (col = union.startCol; col <= union.endCol; col++) {
                        for (row = union.startRow; row <= union.endRow; row++) {
                          bucketId = Grid._getBucketId(col, row);
                          bucket = buckets[bucketId];
                          var isInsideNewRegion = col >= newRegion.startCol && col <= newRegion.endCol && row >= newRegion.startRow && row <= newRegion.endRow;
                          var isInsideOldRegion = col >= body.region.startCol && col <= body.region.endCol && row >= body.region.startRow && row <= body.region.endRow;
                          if (!isInsideNewRegion && isInsideOldRegion) {
                            if (isInsideOldRegion) {
                              if (bucket)
                                Grid._bucketRemoveBody(grid, bucket, body);
                            }
                          }
                          if (body.region === newRegion || isInsideNewRegion && !isInsideOldRegion || forceUpdate) {
                            if (!bucket)
                              bucket = Grid._createBucket(buckets, bucketId);
                            Grid._bucketAddBody(grid, bucket, body);
                          }
                        }
                      }
                      body.region = newRegion;
                      gridChanged = true;
                    }
                  }
                  if (gridChanged)
                    grid.pairsList = Grid._createActivePairsList(grid);
                };
                deprecated(Grid, "update", "Grid.update \u27A4 replaced by Matter.Detector");
                Grid.clear = function(grid) {
                  grid.buckets = {};
                  grid.pairs = {};
                  grid.pairsList = [];
                };
                deprecated(Grid, "clear", "Grid.clear \u27A4 replaced by Matter.Detector");
                Grid._regionUnion = function(regionA, regionB) {
                  var startCol = Math.min(regionA.startCol, regionB.startCol), endCol = Math.max(regionA.endCol, regionB.endCol), startRow = Math.min(regionA.startRow, regionB.startRow), endRow = Math.max(regionA.endRow, regionB.endRow);
                  return Grid._createRegion(startCol, endCol, startRow, endRow);
                };
                Grid._getRegion = function(grid, body) {
                  var bounds = body.bounds, startCol = Math.floor(bounds.min.x / grid.bucketWidth), endCol = Math.floor(bounds.max.x / grid.bucketWidth), startRow = Math.floor(bounds.min.y / grid.bucketHeight), endRow = Math.floor(bounds.max.y / grid.bucketHeight);
                  return Grid._createRegion(startCol, endCol, startRow, endRow);
                };
                Grid._createRegion = function(startCol, endCol, startRow, endRow) {
                  return {
                    id: startCol + "," + endCol + "," + startRow + "," + endRow,
                    startCol,
                    endCol,
                    startRow,
                    endRow
                  };
                };
                Grid._getBucketId = function(column, row) {
                  return "C" + column + "R" + row;
                };
                Grid._createBucket = function(buckets, bucketId) {
                  var bucket = buckets[bucketId] = [];
                  return bucket;
                };
                Grid._bucketAddBody = function(grid, bucket, body) {
                  var gridPairs = grid.pairs, pairId = Pair.id, bucketLength = bucket.length, i;
                  for (i = 0; i < bucketLength; i++) {
                    var bodyB = bucket[i];
                    if (body.id === bodyB.id || body.isStatic && bodyB.isStatic)
                      continue;
                    var id = pairId(body, bodyB), pair = gridPairs[id];
                    if (pair) {
                      pair[2] += 1;
                    } else {
                      gridPairs[id] = [body, bodyB, 1];
                    }
                  }
                  bucket.push(body);
                };
                Grid._bucketRemoveBody = function(grid, bucket, body) {
                  var gridPairs = grid.pairs, pairId = Pair.id, i;
                  bucket.splice(Common.indexOf(bucket, body), 1);
                  var bucketLength = bucket.length;
                  for (i = 0; i < bucketLength; i++) {
                    var pair = gridPairs[pairId(body, bucket[i])];
                    if (pair)
                      pair[2] -= 1;
                  }
                };
                Grid._createActivePairsList = function(grid) {
                  var pair, gridPairs = grid.pairs, pairKeys = Common.keys(gridPairs), pairKeysLength = pairKeys.length, pairs = [], k;
                  for (k = 0; k < pairKeysLength; k++) {
                    pair = gridPairs[pairKeys[k]];
                    if (pair[2] > 0) {
                      pairs.push(pair);
                    } else {
                      delete gridPairs[pairKeys[k]];
                    }
                  }
                  return pairs;
                };
              })();
            },
            /* 24 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var MouseConstraint = {};
              module2.exports = MouseConstraint;
              var Vertices = __webpack_require__(3);
              var Sleeping = __webpack_require__(7);
              var Mouse = __webpack_require__(14);
              var Events2 = __webpack_require__(5);
              var Detector = __webpack_require__(13);
              var Constraint2 = __webpack_require__(10);
              var Composite2 = __webpack_require__(6);
              var Common = __webpack_require__(0);
              var Bounds = __webpack_require__(1);
              (function() {
                MouseConstraint.create = function(engine, options) {
                  var mouse = (engine ? engine.mouse : null) || (options ? options.mouse : null);
                  if (!mouse) {
                    if (engine && engine.render && engine.render.canvas) {
                      mouse = Mouse.create(engine.render.canvas);
                    } else if (options && options.element) {
                      mouse = Mouse.create(options.element);
                    } else {
                      mouse = Mouse.create();
                      Common.warn("MouseConstraint.create: options.mouse was undefined, options.element was undefined, may not function as expected");
                    }
                  }
                  var constraint = Constraint2.create({
                    label: "Mouse Constraint",
                    pointA: mouse.position,
                    pointB: { x: 0, y: 0 },
                    length: 0.01,
                    stiffness: 0.1,
                    angularStiffness: 1,
                    render: {
                      strokeStyle: "#90EE90",
                      lineWidth: 3
                    }
                  });
                  var defaults = {
                    type: "mouseConstraint",
                    mouse,
                    element: null,
                    body: null,
                    constraint,
                    collisionFilter: {
                      category: 1,
                      mask: 4294967295,
                      group: 0
                    }
                  };
                  var mouseConstraint = Common.extend(defaults, options);
                  Events2.on(engine, "beforeUpdate", function() {
                    var allBodies = Composite2.allBodies(engine.world);
                    MouseConstraint.update(mouseConstraint, allBodies);
                    MouseConstraint._triggerEvents(mouseConstraint);
                  });
                  return mouseConstraint;
                };
                MouseConstraint.update = function(mouseConstraint, bodies) {
                  var mouse = mouseConstraint.mouse, constraint = mouseConstraint.constraint, body = mouseConstraint.body;
                  if (mouse.button === 0) {
                    if (!constraint.bodyB) {
                      for (var i = 0; i < bodies.length; i++) {
                        body = bodies[i];
                        if (Bounds.contains(body.bounds, mouse.position) && Detector.canCollide(body.collisionFilter, mouseConstraint.collisionFilter)) {
                          for (var j = body.parts.length > 1 ? 1 : 0; j < body.parts.length; j++) {
                            var part = body.parts[j];
                            if (Vertices.contains(part.vertices, mouse.position)) {
                              constraint.pointA = mouse.position;
                              constraint.bodyB = mouseConstraint.body = body;
                              constraint.pointB = { x: mouse.position.x - body.position.x, y: mouse.position.y - body.position.y };
                              constraint.angleB = body.angle;
                              Sleeping.set(body, false);
                              Events2.trigger(mouseConstraint, "startdrag", { mouse, body });
                              break;
                            }
                          }
                        }
                      }
                    } else {
                      Sleeping.set(constraint.bodyB, false);
                      constraint.pointA = mouse.position;
                    }
                  } else {
                    constraint.bodyB = mouseConstraint.body = null;
                    constraint.pointB = null;
                    if (body)
                      Events2.trigger(mouseConstraint, "enddrag", { mouse, body });
                  }
                };
                MouseConstraint._triggerEvents = function(mouseConstraint) {
                  var mouse = mouseConstraint.mouse, mouseEvents = mouse.sourceEvents;
                  if (mouseEvents.mousemove)
                    Events2.trigger(mouseConstraint, "mousemove", { mouse });
                  if (mouseEvents.mousedown)
                    Events2.trigger(mouseConstraint, "mousedown", { mouse });
                  if (mouseEvents.mouseup)
                    Events2.trigger(mouseConstraint, "mouseup", { mouse });
                  Mouse.clearSourceEvents(mouse);
                };
              })();
            },
            /* 25 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Query2 = {};
              module2.exports = Query2;
              var Vector = __webpack_require__(2);
              var Collision = __webpack_require__(8);
              var Bounds = __webpack_require__(1);
              var Bodies2 = __webpack_require__(12);
              var Vertices = __webpack_require__(3);
              (function() {
                Query2.collides = function(body, bodies) {
                  var collisions = [], bodiesLength = bodies.length, bounds = body.bounds, collides = Collision.collides, overlaps = Bounds.overlaps;
                  for (var i = 0; i < bodiesLength; i++) {
                    var bodyA = bodies[i], partsALength = bodyA.parts.length, partsAStart = partsALength === 1 ? 0 : 1;
                    if (overlaps(bodyA.bounds, bounds)) {
                      for (var j = partsAStart; j < partsALength; j++) {
                        var part = bodyA.parts[j];
                        if (overlaps(part.bounds, bounds)) {
                          var collision = collides(part, body);
                          if (collision) {
                            collisions.push(collision);
                            break;
                          }
                        }
                      }
                    }
                  }
                  return collisions;
                };
                Query2.ray = function(bodies, startPoint, endPoint, rayWidth) {
                  rayWidth = rayWidth || 1e-100;
                  var rayAngle = Vector.angle(startPoint, endPoint), rayLength = Vector.magnitude(Vector.sub(startPoint, endPoint)), rayX = (endPoint.x + startPoint.x) * 0.5, rayY = (endPoint.y + startPoint.y) * 0.5, ray = Bodies2.rectangle(rayX, rayY, rayLength, rayWidth, { angle: rayAngle }), collisions = Query2.collides(ray, bodies);
                  for (var i = 0; i < collisions.length; i += 1) {
                    var collision = collisions[i];
                    collision.body = collision.bodyB = collision.bodyA;
                  }
                  return collisions;
                };
                Query2.region = function(bodies, bounds, outside) {
                  var result = [];
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i], overlaps = Bounds.overlaps(body.bounds, bounds);
                    if (overlaps && !outside || !overlaps && outside)
                      result.push(body);
                  }
                  return result;
                };
                Query2.point = function(bodies, point) {
                  var result = [];
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    if (Bounds.contains(body.bounds, point)) {
                      for (var j = body.parts.length === 1 ? 0 : 1; j < body.parts.length; j++) {
                        var part = body.parts[j];
                        if (Bounds.contains(part.bounds, point) && Vertices.contains(part.vertices, point)) {
                          result.push(body);
                          break;
                        }
                      }
                    }
                  }
                  return result;
                };
              })();
            },
            /* 26 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Render = {};
              module2.exports = Render;
              var Body2 = __webpack_require__(4);
              var Common = __webpack_require__(0);
              var Composite2 = __webpack_require__(6);
              var Bounds = __webpack_require__(1);
              var Events2 = __webpack_require__(5);
              var Vector = __webpack_require__(2);
              var Mouse = __webpack_require__(14);
              (function() {
                var _requestAnimationFrame, _cancelAnimationFrame;
                if (typeof window !== "undefined") {
                  _requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
                    window.setTimeout(function() {
                      callback(Common.now());
                    }, 1e3 / 60);
                  };
                  _cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
                }
                Render._goodFps = 30;
                Render._goodDelta = 1e3 / 60;
                Render.create = function(options) {
                  var defaults = {
                    engine: null,
                    element: null,
                    canvas: null,
                    mouse: null,
                    frameRequestId: null,
                    timing: {
                      historySize: 60,
                      delta: 0,
                      deltaHistory: [],
                      lastTime: 0,
                      lastTimestamp: 0,
                      lastElapsed: 0,
                      timestampElapsed: 0,
                      timestampElapsedHistory: [],
                      engineDeltaHistory: [],
                      engineElapsedHistory: [],
                      engineUpdatesHistory: [],
                      elapsedHistory: []
                    },
                    options: {
                      width: 800,
                      height: 600,
                      pixelRatio: 1,
                      background: "#14151f",
                      wireframeBackground: "#14151f",
                      wireframeStrokeStyle: "#bbb",
                      hasBounds: !!options.bounds,
                      enabled: true,
                      wireframes: true,
                      showSleeping: true,
                      showDebug: false,
                      showStats: false,
                      showPerformance: false,
                      showBounds: false,
                      showVelocity: false,
                      showCollisions: false,
                      showSeparations: false,
                      showAxes: false,
                      showPositions: false,
                      showAngleIndicator: false,
                      showIds: false,
                      showVertexNumbers: false,
                      showConvexHulls: false,
                      showInternalEdges: false,
                      showMousePosition: false
                    }
                  };
                  var render = Common.extend(defaults, options);
                  if (render.canvas) {
                    render.canvas.width = render.options.width || render.canvas.width;
                    render.canvas.height = render.options.height || render.canvas.height;
                  }
                  render.mouse = options.mouse;
                  render.engine = options.engine;
                  render.canvas = render.canvas || _createCanvas(render.options.width, render.options.height);
                  render.context = render.canvas.getContext("2d");
                  render.textures = {};
                  render.bounds = render.bounds || {
                    min: {
                      x: 0,
                      y: 0
                    },
                    max: {
                      x: render.canvas.width,
                      y: render.canvas.height
                    }
                  };
                  render.controller = Render;
                  render.options.showBroadphase = false;
                  if (render.options.pixelRatio !== 1) {
                    Render.setPixelRatio(render, render.options.pixelRatio);
                  }
                  if (Common.isElement(render.element)) {
                    render.element.appendChild(render.canvas);
                  }
                  return render;
                };
                Render.run = function(render) {
                  (function loop(time) {
                    render.frameRequestId = _requestAnimationFrame(loop);
                    _updateTiming(render, time);
                    Render.world(render, time);
                    render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                    if (render.options.showStats || render.options.showDebug) {
                      Render.stats(render, render.context, time);
                    }
                    if (render.options.showPerformance || render.options.showDebug) {
                      Render.performance(render, render.context, time);
                    }
                    render.context.setTransform(1, 0, 0, 1, 0, 0);
                  })();
                };
                Render.stop = function(render) {
                  _cancelAnimationFrame(render.frameRequestId);
                };
                Render.setPixelRatio = function(render, pixelRatio) {
                  var options = render.options, canvas = render.canvas;
                  if (pixelRatio === "auto") {
                    pixelRatio = _getPixelRatio(canvas);
                  }
                  options.pixelRatio = pixelRatio;
                  canvas.setAttribute("data-pixel-ratio", pixelRatio);
                  canvas.width = options.width * pixelRatio;
                  canvas.height = options.height * pixelRatio;
                  canvas.style.width = options.width + "px";
                  canvas.style.height = options.height + "px";
                };
                Render.setSize = function(render, width, height) {
                  render.options.width = width;
                  render.options.height = height;
                  render.bounds.max.x = render.bounds.min.x + width;
                  render.bounds.max.y = render.bounds.min.y + height;
                  if (render.options.pixelRatio !== 1) {
                    Render.setPixelRatio(render, render.options.pixelRatio);
                  } else {
                    render.canvas.width = width;
                    render.canvas.height = height;
                  }
                };
                Render.lookAt = function(render, objects, padding, center) {
                  center = typeof center !== "undefined" ? center : true;
                  objects = Common.isArray(objects) ? objects : [objects];
                  padding = padding || {
                    x: 0,
                    y: 0
                  };
                  var bounds = {
                    min: { x: Infinity, y: Infinity },
                    max: { x: -Infinity, y: -Infinity }
                  };
                  for (var i = 0; i < objects.length; i += 1) {
                    var object = objects[i], min = object.bounds ? object.bounds.min : object.min || object.position || object, max = object.bounds ? object.bounds.max : object.max || object.position || object;
                    if (min && max) {
                      if (min.x < bounds.min.x)
                        bounds.min.x = min.x;
                      if (max.x > bounds.max.x)
                        bounds.max.x = max.x;
                      if (min.y < bounds.min.y)
                        bounds.min.y = min.y;
                      if (max.y > bounds.max.y)
                        bounds.max.y = max.y;
                    }
                  }
                  var width = bounds.max.x - bounds.min.x + 2 * padding.x, height = bounds.max.y - bounds.min.y + 2 * padding.y, viewHeight = render.canvas.height, viewWidth = render.canvas.width, outerRatio = viewWidth / viewHeight, innerRatio = width / height, scaleX = 1, scaleY = 1;
                  if (innerRatio > outerRatio) {
                    scaleY = innerRatio / outerRatio;
                  } else {
                    scaleX = outerRatio / innerRatio;
                  }
                  render.options.hasBounds = true;
                  render.bounds.min.x = bounds.min.x;
                  render.bounds.max.x = bounds.min.x + width * scaleX;
                  render.bounds.min.y = bounds.min.y;
                  render.bounds.max.y = bounds.min.y + height * scaleY;
                  if (center) {
                    render.bounds.min.x += width * 0.5 - width * scaleX * 0.5;
                    render.bounds.max.x += width * 0.5 - width * scaleX * 0.5;
                    render.bounds.min.y += height * 0.5 - height * scaleY * 0.5;
                    render.bounds.max.y += height * 0.5 - height * scaleY * 0.5;
                  }
                  render.bounds.min.x -= padding.x;
                  render.bounds.max.x -= padding.x;
                  render.bounds.min.y -= padding.y;
                  render.bounds.max.y -= padding.y;
                  if (render.mouse) {
                    Mouse.setScale(render.mouse, {
                      x: (render.bounds.max.x - render.bounds.min.x) / render.canvas.width,
                      y: (render.bounds.max.y - render.bounds.min.y) / render.canvas.height
                    });
                    Mouse.setOffset(render.mouse, render.bounds.min);
                  }
                };
                Render.startViewTransform = function(render) {
                  var boundsWidth = render.bounds.max.x - render.bounds.min.x, boundsHeight = render.bounds.max.y - render.bounds.min.y, boundsScaleX = boundsWidth / render.options.width, boundsScaleY = boundsHeight / render.options.height;
                  render.context.setTransform(
                    render.options.pixelRatio / boundsScaleX,
                    0,
                    0,
                    render.options.pixelRatio / boundsScaleY,
                    0,
                    0
                  );
                  render.context.translate(-render.bounds.min.x, -render.bounds.min.y);
                };
                Render.endViewTransform = function(render) {
                  render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                };
                Render.world = function(render, time) {
                  var startTime = Common.now(), engine = render.engine, world2 = engine.world, canvas = render.canvas, context = render.context, options = render.options, timing = render.timing;
                  var allBodies = Composite2.allBodies(world2), allConstraints = Composite2.allConstraints(world2), background = options.wireframes ? options.wireframeBackground : options.background, bodies = [], constraints = [], i;
                  var event = {
                    timestamp: engine.timing.timestamp
                  };
                  Events2.trigger(render, "beforeRender", event);
                  if (render.currentBackground !== background)
                    _applyBackground(render, background);
                  context.globalCompositeOperation = "source-in";
                  context.fillStyle = "transparent";
                  context.fillRect(0, 0, canvas.width, canvas.height);
                  context.globalCompositeOperation = "source-over";
                  if (options.hasBounds) {
                    for (i = 0; i < allBodies.length; i++) {
                      var body = allBodies[i];
                      if (Bounds.overlaps(body.bounds, render.bounds))
                        bodies.push(body);
                    }
                    for (i = 0; i < allConstraints.length; i++) {
                      var constraint = allConstraints[i], bodyA = constraint.bodyA, bodyB = constraint.bodyB, pointAWorld = constraint.pointA, pointBWorld = constraint.pointB;
                      if (bodyA) pointAWorld = Vector.add(bodyA.position, constraint.pointA);
                      if (bodyB) pointBWorld = Vector.add(bodyB.position, constraint.pointB);
                      if (!pointAWorld || !pointBWorld)
                        continue;
                      if (Bounds.contains(render.bounds, pointAWorld) || Bounds.contains(render.bounds, pointBWorld))
                        constraints.push(constraint);
                    }
                    Render.startViewTransform(render);
                    if (render.mouse) {
                      Mouse.setScale(render.mouse, {
                        x: (render.bounds.max.x - render.bounds.min.x) / render.options.width,
                        y: (render.bounds.max.y - render.bounds.min.y) / render.options.height
                      });
                      Mouse.setOffset(render.mouse, render.bounds.min);
                    }
                  } else {
                    constraints = allConstraints;
                    bodies = allBodies;
                    if (render.options.pixelRatio !== 1) {
                      render.context.setTransform(render.options.pixelRatio, 0, 0, render.options.pixelRatio, 0, 0);
                    }
                  }
                  if (!options.wireframes || engine.enableSleeping && options.showSleeping) {
                    Render.bodies(render, bodies, context);
                  } else {
                    if (options.showConvexHulls)
                      Render.bodyConvexHulls(render, bodies, context);
                    Render.bodyWireframes(render, bodies, context);
                  }
                  if (options.showBounds)
                    Render.bodyBounds(render, bodies, context);
                  if (options.showAxes || options.showAngleIndicator)
                    Render.bodyAxes(render, bodies, context);
                  if (options.showPositions)
                    Render.bodyPositions(render, bodies, context);
                  if (options.showVelocity)
                    Render.bodyVelocity(render, bodies, context);
                  if (options.showIds)
                    Render.bodyIds(render, bodies, context);
                  if (options.showSeparations)
                    Render.separations(render, engine.pairs.list, context);
                  if (options.showCollisions)
                    Render.collisions(render, engine.pairs.list, context);
                  if (options.showVertexNumbers)
                    Render.vertexNumbers(render, bodies, context);
                  if (options.showMousePosition)
                    Render.mousePosition(render, render.mouse, context);
                  Render.constraints(constraints, context);
                  if (options.hasBounds) {
                    Render.endViewTransform(render);
                  }
                  Events2.trigger(render, "afterRender", event);
                  timing.lastElapsed = Common.now() - startTime;
                };
                Render.stats = function(render, context, time) {
                  var engine = render.engine, world2 = engine.world, bodies = Composite2.allBodies(world2), parts = 0, width = 55, height = 44, x = 0, y = 0;
                  for (var i = 0; i < bodies.length; i += 1) {
                    parts += bodies[i].parts.length;
                  }
                  var sections = {
                    "Part": parts,
                    "Body": bodies.length,
                    "Cons": Composite2.allConstraints(world2).length,
                    "Comp": Composite2.allComposites(world2).length,
                    "Pair": engine.pairs.list.length
                  };
                  context.fillStyle = "#0e0f19";
                  context.fillRect(x, y, width * 5.5, height);
                  context.font = "12px Arial";
                  context.textBaseline = "top";
                  context.textAlign = "right";
                  for (var key in sections) {
                    var section = sections[key];
                    context.fillStyle = "#aaa";
                    context.fillText(key, x + width, y + 8);
                    context.fillStyle = "#eee";
                    context.fillText(section, x + width, y + 26);
                    x += width;
                  }
                };
                Render.performance = function(render, context) {
                  var engine = render.engine, timing = render.timing, deltaHistory = timing.deltaHistory, elapsedHistory = timing.elapsedHistory, timestampElapsedHistory = timing.timestampElapsedHistory, engineDeltaHistory = timing.engineDeltaHistory, engineUpdatesHistory = timing.engineUpdatesHistory, engineElapsedHistory = timing.engineElapsedHistory, lastEngineUpdatesPerFrame = engine.timing.lastUpdatesPerFrame, lastEngineDelta = engine.timing.lastDelta;
                  var deltaMean = _mean(deltaHistory), elapsedMean = _mean(elapsedHistory), engineDeltaMean = _mean(engineDeltaHistory), engineUpdatesMean = _mean(engineUpdatesHistory), engineElapsedMean = _mean(engineElapsedHistory), timestampElapsedMean = _mean(timestampElapsedHistory), rateMean = timestampElapsedMean / deltaMean || 0, neededUpdatesPerFrame = Math.round(deltaMean / lastEngineDelta), fps = 1e3 / deltaMean || 0;
                  var graphHeight = 4, gap = 12, width = 60, height = 34, x = 10, y = 69;
                  context.fillStyle = "#0e0f19";
                  context.fillRect(0, 50, gap * 5 + width * 6 + 22, height);
                  Render.status(
                    context,
                    x,
                    y,
                    width,
                    graphHeight,
                    deltaHistory.length,
                    Math.round(fps) + " fps",
                    fps / Render._goodFps,
                    function(i) {
                      return deltaHistory[i] / deltaMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + gap + width,
                    y,
                    width,
                    graphHeight,
                    engineDeltaHistory.length,
                    lastEngineDelta.toFixed(2) + " dt",
                    Render._goodDelta / lastEngineDelta,
                    function(i) {
                      return engineDeltaHistory[i] / engineDeltaMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + (gap + width) * 2,
                    y,
                    width,
                    graphHeight,
                    engineUpdatesHistory.length,
                    lastEngineUpdatesPerFrame + " upf",
                    Math.pow(Common.clamp(engineUpdatesMean / neededUpdatesPerFrame || 1, 0, 1), 4),
                    function(i) {
                      return engineUpdatesHistory[i] / engineUpdatesMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + (gap + width) * 3,
                    y,
                    width,
                    graphHeight,
                    engineElapsedHistory.length,
                    engineElapsedMean.toFixed(2) + " ut",
                    1 - lastEngineUpdatesPerFrame * engineElapsedMean / Render._goodFps,
                    function(i) {
                      return engineElapsedHistory[i] / engineElapsedMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + (gap + width) * 4,
                    y,
                    width,
                    graphHeight,
                    elapsedHistory.length,
                    elapsedMean.toFixed(2) + " rt",
                    1 - elapsedMean / Render._goodFps,
                    function(i) {
                      return elapsedHistory[i] / elapsedMean - 1;
                    }
                  );
                  Render.status(
                    context,
                    x + (gap + width) * 5,
                    y,
                    width,
                    graphHeight,
                    timestampElapsedHistory.length,
                    rateMean.toFixed(2) + " x",
                    rateMean * rateMean * rateMean,
                    function(i) {
                      return (timestampElapsedHistory[i] / deltaHistory[i] / rateMean || 0) - 1;
                    }
                  );
                };
                Render.status = function(context, x, y, width, height, count, label, indicator, plotY) {
                  context.strokeStyle = "#888";
                  context.fillStyle = "#444";
                  context.lineWidth = 1;
                  context.fillRect(x, y + 7, width, 1);
                  context.beginPath();
                  context.moveTo(x, y + 7 - height * Common.clamp(0.4 * plotY(0), -2, 2));
                  for (var i = 0; i < width; i += 1) {
                    context.lineTo(x + i, y + 7 - (i < count ? height * Common.clamp(0.4 * plotY(i), -2, 2) : 0));
                  }
                  context.stroke();
                  context.fillStyle = "hsl(" + Common.clamp(25 + 95 * indicator, 0, 120) + ",100%,60%)";
                  context.fillRect(x, y - 7, 4, 4);
                  context.font = "12px Arial";
                  context.textBaseline = "middle";
                  context.textAlign = "right";
                  context.fillStyle = "#eee";
                  context.fillText(label, x + width, y - 5);
                };
                Render.constraints = function(constraints, context) {
                  var c = context;
                  for (var i = 0; i < constraints.length; i++) {
                    var constraint = constraints[i];
                    if (!constraint.render.visible || !constraint.pointA || !constraint.pointB)
                      continue;
                    var bodyA = constraint.bodyA, bodyB = constraint.bodyB, start, end;
                    if (bodyA) {
                      start = Vector.add(bodyA.position, constraint.pointA);
                    } else {
                      start = constraint.pointA;
                    }
                    if (constraint.render.type === "pin") {
                      c.beginPath();
                      c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                      c.closePath();
                    } else {
                      if (bodyB) {
                        end = Vector.add(bodyB.position, constraint.pointB);
                      } else {
                        end = constraint.pointB;
                      }
                      c.beginPath();
                      c.moveTo(start.x, start.y);
                      if (constraint.render.type === "spring") {
                        var delta = Vector.sub(end, start), normal = Vector.perp(Vector.normalise(delta)), coils = Math.ceil(Common.clamp(constraint.length / 5, 12, 20)), offset;
                        for (var j = 1; j < coils; j += 1) {
                          offset = j % 2 === 0 ? 1 : -1;
                          c.lineTo(
                            start.x + delta.x * (j / coils) + normal.x * offset * 4,
                            start.y + delta.y * (j / coils) + normal.y * offset * 4
                          );
                        }
                      }
                      c.lineTo(end.x, end.y);
                    }
                    if (constraint.render.lineWidth) {
                      c.lineWidth = constraint.render.lineWidth;
                      c.strokeStyle = constraint.render.strokeStyle;
                      c.stroke();
                    }
                    if (constraint.render.anchors) {
                      c.fillStyle = constraint.render.strokeStyle;
                      c.beginPath();
                      c.arc(start.x, start.y, 3, 0, 2 * Math.PI);
                      c.arc(end.x, end.y, 3, 0, 2 * Math.PI);
                      c.closePath();
                      c.fill();
                    }
                  }
                };
                Render.bodies = function(render, bodies, context) {
                  var c = context, engine = render.engine, options = render.options, showInternalEdges = options.showInternalEdges || !options.wireframes, body, part, i, k;
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (!body.render.visible)
                      continue;
                    for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                      part = body.parts[k];
                      if (!part.render.visible)
                        continue;
                      if (options.showSleeping && body.isSleeping) {
                        c.globalAlpha = 0.5 * part.render.opacity;
                      } else if (part.render.opacity !== 1) {
                        c.globalAlpha = part.render.opacity;
                      }
                      if (part.render.sprite && part.render.sprite.texture && !options.wireframes) {
                        var sprite = part.render.sprite, texture = _getTexture(render, sprite.texture);
                        c.translate(part.position.x, part.position.y);
                        c.rotate(part.angle);
                        c.drawImage(
                          texture,
                          texture.width * -sprite.xOffset * sprite.xScale,
                          texture.height * -sprite.yOffset * sprite.yScale,
                          texture.width * sprite.xScale,
                          texture.height * sprite.yScale
                        );
                        c.rotate(-part.angle);
                        c.translate(-part.position.x, -part.position.y);
                      } else {
                        if (part.circleRadius) {
                          c.beginPath();
                          c.arc(part.position.x, part.position.y, part.circleRadius, 0, 2 * Math.PI);
                        } else {
                          c.beginPath();
                          c.moveTo(part.vertices[0].x, part.vertices[0].y);
                          for (var j = 1; j < part.vertices.length; j++) {
                            if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                              c.lineTo(part.vertices[j].x, part.vertices[j].y);
                            } else {
                              c.moveTo(part.vertices[j].x, part.vertices[j].y);
                            }
                            if (part.vertices[j].isInternal && !showInternalEdges) {
                              c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                            }
                          }
                          c.lineTo(part.vertices[0].x, part.vertices[0].y);
                          c.closePath();
                        }
                        if (!options.wireframes) {
                          c.fillStyle = part.render.fillStyle;
                          if (part.render.lineWidth) {
                            c.lineWidth = part.render.lineWidth;
                            c.strokeStyle = part.render.strokeStyle;
                            c.stroke();
                          }
                          c.fill();
                        } else {
                          c.lineWidth = 1;
                          c.strokeStyle = render.options.wireframeStrokeStyle;
                          c.stroke();
                        }
                      }
                      c.globalAlpha = 1;
                    }
                  }
                };
                Render.bodyWireframes = function(render, bodies, context) {
                  var c = context, showInternalEdges = render.options.showInternalEdges, body, part, i, j, k;
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (!body.render.visible)
                      continue;
                    for (k = body.parts.length > 1 ? 1 : 0; k < body.parts.length; k++) {
                      part = body.parts[k];
                      c.moveTo(part.vertices[0].x, part.vertices[0].y);
                      for (j = 1; j < part.vertices.length; j++) {
                        if (!part.vertices[j - 1].isInternal || showInternalEdges) {
                          c.lineTo(part.vertices[j].x, part.vertices[j].y);
                        } else {
                          c.moveTo(part.vertices[j].x, part.vertices[j].y);
                        }
                        if (part.vertices[j].isInternal && !showInternalEdges) {
                          c.moveTo(part.vertices[(j + 1) % part.vertices.length].x, part.vertices[(j + 1) % part.vertices.length].y);
                        }
                      }
                      c.lineTo(part.vertices[0].x, part.vertices[0].y);
                    }
                  }
                  c.lineWidth = 1;
                  c.strokeStyle = render.options.wireframeStrokeStyle;
                  c.stroke();
                };
                Render.bodyConvexHulls = function(render, bodies, context) {
                  var c = context, body, part, i, j, k;
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (!body.render.visible || body.parts.length === 1)
                      continue;
                    c.moveTo(body.vertices[0].x, body.vertices[0].y);
                    for (j = 1; j < body.vertices.length; j++) {
                      c.lineTo(body.vertices[j].x, body.vertices[j].y);
                    }
                    c.lineTo(body.vertices[0].x, body.vertices[0].y);
                  }
                  c.lineWidth = 1;
                  c.strokeStyle = "rgba(255,255,255,0.2)";
                  c.stroke();
                };
                Render.vertexNumbers = function(render, bodies, context) {
                  var c = context, i, j, k;
                  for (i = 0; i < bodies.length; i++) {
                    var parts = bodies[i].parts;
                    for (k = parts.length > 1 ? 1 : 0; k < parts.length; k++) {
                      var part = parts[k];
                      for (j = 0; j < part.vertices.length; j++) {
                        c.fillStyle = "rgba(255,255,255,0.2)";
                        c.fillText(i + "_" + j, part.position.x + (part.vertices[j].x - part.position.x) * 0.8, part.position.y + (part.vertices[j].y - part.position.y) * 0.8);
                      }
                    }
                  }
                };
                Render.mousePosition = function(render, mouse, context) {
                  var c = context;
                  c.fillStyle = "rgba(255,255,255,0.8)";
                  c.fillText(mouse.position.x + "  " + mouse.position.y, mouse.position.x + 5, mouse.position.y - 5);
                };
                Render.bodyBounds = function(render, bodies, context) {
                  var c = context, engine = render.engine, options = render.options;
                  c.beginPath();
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    if (body.render.visible) {
                      var parts = bodies[i].parts;
                      for (var j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                        var part = parts[j];
                        c.rect(part.bounds.min.x, part.bounds.min.y, part.bounds.max.x - part.bounds.min.x, part.bounds.max.y - part.bounds.min.y);
                      }
                    }
                  }
                  if (options.wireframes) {
                    c.strokeStyle = "rgba(255,255,255,0.08)";
                  } else {
                    c.strokeStyle = "rgba(0,0,0,0.1)";
                  }
                  c.lineWidth = 1;
                  c.stroke();
                };
                Render.bodyAxes = function(render, bodies, context) {
                  var c = context, engine = render.engine, options = render.options, part, i, j, k;
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    var body = bodies[i], parts = body.parts;
                    if (!body.render.visible)
                      continue;
                    if (options.showAxes) {
                      for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                        part = parts[j];
                        for (k = 0; k < part.axes.length; k++) {
                          var axis = part.axes[k];
                          c.moveTo(part.position.x, part.position.y);
                          c.lineTo(part.position.x + axis.x * 20, part.position.y + axis.y * 20);
                        }
                      }
                    } else {
                      for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                        part = parts[j];
                        for (k = 0; k < part.axes.length; k++) {
                          c.moveTo(part.position.x, part.position.y);
                          c.lineTo(
                            (part.vertices[0].x + part.vertices[part.vertices.length - 1].x) / 2,
                            (part.vertices[0].y + part.vertices[part.vertices.length - 1].y) / 2
                          );
                        }
                      }
                    }
                  }
                  if (options.wireframes) {
                    c.strokeStyle = "indianred";
                    c.lineWidth = 1;
                  } else {
                    c.strokeStyle = "rgba(255, 255, 255, 0.4)";
                    c.globalCompositeOperation = "overlay";
                    c.lineWidth = 2;
                  }
                  c.stroke();
                  c.globalCompositeOperation = "source-over";
                };
                Render.bodyPositions = function(render, bodies, context) {
                  var c = context, engine = render.engine, options = render.options, body, part, i, k;
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (!body.render.visible)
                      continue;
                    for (k = 0; k < body.parts.length; k++) {
                      part = body.parts[k];
                      c.arc(part.position.x, part.position.y, 3, 0, 2 * Math.PI, false);
                      c.closePath();
                    }
                  }
                  if (options.wireframes) {
                    c.fillStyle = "indianred";
                  } else {
                    c.fillStyle = "rgba(0,0,0,0.5)";
                  }
                  c.fill();
                  c.beginPath();
                  for (i = 0; i < bodies.length; i++) {
                    body = bodies[i];
                    if (body.render.visible) {
                      c.arc(body.positionPrev.x, body.positionPrev.y, 2, 0, 2 * Math.PI, false);
                      c.closePath();
                    }
                  }
                  c.fillStyle = "rgba(255,165,0,0.8)";
                  c.fill();
                };
                Render.bodyVelocity = function(render, bodies, context) {
                  var c = context;
                  c.beginPath();
                  for (var i = 0; i < bodies.length; i++) {
                    var body = bodies[i];
                    if (!body.render.visible)
                      continue;
                    var velocity = Body2.getVelocity(body);
                    c.moveTo(body.position.x, body.position.y);
                    c.lineTo(body.position.x + velocity.x, body.position.y + velocity.y);
                  }
                  c.lineWidth = 3;
                  c.strokeStyle = "cornflowerblue";
                  c.stroke();
                };
                Render.bodyIds = function(render, bodies, context) {
                  var c = context, i, j;
                  for (i = 0; i < bodies.length; i++) {
                    if (!bodies[i].render.visible)
                      continue;
                    var parts = bodies[i].parts;
                    for (j = parts.length > 1 ? 1 : 0; j < parts.length; j++) {
                      var part = parts[j];
                      c.font = "12px Arial";
                      c.fillStyle = "rgba(255,255,255,0.5)";
                      c.fillText(part.id, part.position.x + 10, part.position.y - 10);
                    }
                  }
                };
                Render.collisions = function(render, pairs, context) {
                  var c = context, options = render.options, pair, collision, corrected, bodyA, bodyB, i, j;
                  c.beginPath();
                  for (i = 0; i < pairs.length; i++) {
                    pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    collision = pair.collision;
                    for (j = 0; j < pair.contactCount; j++) {
                      var contact = pair.contacts[j], vertex = contact.vertex;
                      c.rect(vertex.x - 1.5, vertex.y - 1.5, 3.5, 3.5);
                    }
                  }
                  if (options.wireframes) {
                    c.fillStyle = "rgba(255,255,255,0.7)";
                  } else {
                    c.fillStyle = "orange";
                  }
                  c.fill();
                  c.beginPath();
                  for (i = 0; i < pairs.length; i++) {
                    pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    collision = pair.collision;
                    if (pair.contactCount > 0) {
                      var normalPosX = pair.contacts[0].vertex.x, normalPosY = pair.contacts[0].vertex.y;
                      if (pair.contactCount === 2) {
                        normalPosX = (pair.contacts[0].vertex.x + pair.contacts[1].vertex.x) / 2;
                        normalPosY = (pair.contacts[0].vertex.y + pair.contacts[1].vertex.y) / 2;
                      }
                      if (collision.bodyB === collision.supports[0].body || collision.bodyA.isStatic === true) {
                        c.moveTo(normalPosX - collision.normal.x * 8, normalPosY - collision.normal.y * 8);
                      } else {
                        c.moveTo(normalPosX + collision.normal.x * 8, normalPosY + collision.normal.y * 8);
                      }
                      c.lineTo(normalPosX, normalPosY);
                    }
                  }
                  if (options.wireframes) {
                    c.strokeStyle = "rgba(255,165,0,0.7)";
                  } else {
                    c.strokeStyle = "orange";
                  }
                  c.lineWidth = 1;
                  c.stroke();
                };
                Render.separations = function(render, pairs, context) {
                  var c = context, options = render.options, pair, collision, corrected, bodyA, bodyB, i, j;
                  c.beginPath();
                  for (i = 0; i < pairs.length; i++) {
                    pair = pairs[i];
                    if (!pair.isActive)
                      continue;
                    collision = pair.collision;
                    bodyA = collision.bodyA;
                    bodyB = collision.bodyB;
                    var k = 1;
                    if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
                    if (bodyB.isStatic) k = 0;
                    c.moveTo(bodyB.position.x, bodyB.position.y);
                    c.lineTo(bodyB.position.x - collision.penetration.x * k, bodyB.position.y - collision.penetration.y * k);
                    k = 1;
                    if (!bodyB.isStatic && !bodyA.isStatic) k = 0.5;
                    if (bodyA.isStatic) k = 0;
                    c.moveTo(bodyA.position.x, bodyA.position.y);
                    c.lineTo(bodyA.position.x + collision.penetration.x * k, bodyA.position.y + collision.penetration.y * k);
                  }
                  if (options.wireframes) {
                    c.strokeStyle = "rgba(255,165,0,0.5)";
                  } else {
                    c.strokeStyle = "orange";
                  }
                  c.stroke();
                };
                Render.inspector = function(inspector, context) {
                  var engine = inspector.engine, selected = inspector.selected, render = inspector.render, options = render.options, bounds;
                  if (options.hasBounds) {
                    var boundsWidth = render.bounds.max.x - render.bounds.min.x, boundsHeight = render.bounds.max.y - render.bounds.min.y, boundsScaleX = boundsWidth / render.options.width, boundsScaleY = boundsHeight / render.options.height;
                    context.scale(1 / boundsScaleX, 1 / boundsScaleY);
                    context.translate(-render.bounds.min.x, -render.bounds.min.y);
                  }
                  for (var i = 0; i < selected.length; i++) {
                    var item = selected[i].data;
                    context.translate(0.5, 0.5);
                    context.lineWidth = 1;
                    context.strokeStyle = "rgba(255,165,0,0.9)";
                    context.setLineDash([1, 2]);
                    switch (item.type) {
                      case "body":
                        bounds = item.bounds;
                        context.beginPath();
                        context.rect(
                          Math.floor(bounds.min.x - 3),
                          Math.floor(bounds.min.y - 3),
                          Math.floor(bounds.max.x - bounds.min.x + 6),
                          Math.floor(bounds.max.y - bounds.min.y + 6)
                        );
                        context.closePath();
                        context.stroke();
                        break;
                      case "constraint":
                        var point = item.pointA;
                        if (item.bodyA)
                          point = item.pointB;
                        context.beginPath();
                        context.arc(point.x, point.y, 10, 0, 2 * Math.PI);
                        context.closePath();
                        context.stroke();
                        break;
                    }
                    context.setLineDash([]);
                    context.translate(-0.5, -0.5);
                  }
                  if (inspector.selectStart !== null) {
                    context.translate(0.5, 0.5);
                    context.lineWidth = 1;
                    context.strokeStyle = "rgba(255,165,0,0.6)";
                    context.fillStyle = "rgba(255,165,0,0.1)";
                    bounds = inspector.selectBounds;
                    context.beginPath();
                    context.rect(
                      Math.floor(bounds.min.x),
                      Math.floor(bounds.min.y),
                      Math.floor(bounds.max.x - bounds.min.x),
                      Math.floor(bounds.max.y - bounds.min.y)
                    );
                    context.closePath();
                    context.stroke();
                    context.fill();
                    context.translate(-0.5, -0.5);
                  }
                  if (options.hasBounds)
                    context.setTransform(1, 0, 0, 1, 0, 0);
                };
                var _updateTiming = function(render, time) {
                  var engine = render.engine, timing = render.timing, historySize = timing.historySize, timestamp = engine.timing.timestamp;
                  timing.delta = time - timing.lastTime || Render._goodDelta;
                  timing.lastTime = time;
                  timing.timestampElapsed = timestamp - timing.lastTimestamp || 0;
                  timing.lastTimestamp = timestamp;
                  timing.deltaHistory.unshift(timing.delta);
                  timing.deltaHistory.length = Math.min(timing.deltaHistory.length, historySize);
                  timing.engineDeltaHistory.unshift(engine.timing.lastDelta);
                  timing.engineDeltaHistory.length = Math.min(timing.engineDeltaHistory.length, historySize);
                  timing.timestampElapsedHistory.unshift(timing.timestampElapsed);
                  timing.timestampElapsedHistory.length = Math.min(timing.timestampElapsedHistory.length, historySize);
                  timing.engineUpdatesHistory.unshift(engine.timing.lastUpdatesPerFrame);
                  timing.engineUpdatesHistory.length = Math.min(timing.engineUpdatesHistory.length, historySize);
                  timing.engineElapsedHistory.unshift(engine.timing.lastElapsed);
                  timing.engineElapsedHistory.length = Math.min(timing.engineElapsedHistory.length, historySize);
                  timing.elapsedHistory.unshift(timing.lastElapsed);
                  timing.elapsedHistory.length = Math.min(timing.elapsedHistory.length, historySize);
                };
                var _mean = function(values) {
                  var result = 0;
                  for (var i = 0; i < values.length; i += 1) {
                    result += values[i];
                  }
                  return result / values.length || 0;
                };
                var _createCanvas = function(width, height) {
                  var canvas = document.createElement("canvas");
                  canvas.width = width;
                  canvas.height = height;
                  canvas.oncontextmenu = function() {
                    return false;
                  };
                  canvas.onselectstart = function() {
                    return false;
                  };
                  return canvas;
                };
                var _getPixelRatio = function(canvas) {
                  var context = canvas.getContext("2d"), devicePixelRatio = window.devicePixelRatio || 1, backingStorePixelRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
                  return devicePixelRatio / backingStorePixelRatio;
                };
                var _getTexture = function(render, imagePath) {
                  var image = render.textures[imagePath];
                  if (image)
                    return image;
                  image = render.textures[imagePath] = new Image();
                  image.src = imagePath;
                  return image;
                };
                var _applyBackground = function(render, background) {
                  var cssBackground = background;
                  if (/(jpg|gif|png)$/.test(background))
                    cssBackground = "url(" + background + ")";
                  render.canvas.style.background = cssBackground;
                  render.canvas.style.backgroundSize = "contain";
                  render.currentBackground = background;
                };
              })();
            },
            /* 27 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Runner = {};
              module2.exports = Runner;
              var Events2 = __webpack_require__(5);
              var Engine2 = __webpack_require__(17);
              var Common = __webpack_require__(0);
              (function() {
                Runner._maxFrameDelta = 1e3 / 15;
                Runner._frameDeltaFallback = 1e3 / 60;
                Runner._timeBufferMargin = 1.5;
                Runner._elapsedNextEstimate = 1;
                Runner._smoothingLowerBound = 0.1;
                Runner._smoothingUpperBound = 0.9;
                Runner.create = function(options) {
                  var defaults = {
                    delta: 1e3 / 60,
                    frameDelta: null,
                    frameDeltaSmoothing: true,
                    frameDeltaSnapping: true,
                    frameDeltaHistory: [],
                    frameDeltaHistorySize: 100,
                    frameRequestId: null,
                    timeBuffer: 0,
                    timeLastTick: null,
                    maxUpdates: null,
                    maxFrameTime: 1e3 / 30,
                    lastUpdatesDeferred: 0,
                    enabled: true
                  };
                  var runner = Common.extend(defaults, options);
                  runner.fps = 0;
                  return runner;
                };
                Runner.run = function(runner, engine) {
                  runner.timeBuffer = Runner._frameDeltaFallback;
                  (function onFrame(time) {
                    runner.frameRequestId = Runner._onNextFrame(runner, onFrame);
                    if (time && runner.enabled) {
                      Runner.tick(runner, engine, time);
                    }
                  })();
                  return runner;
                };
                Runner.tick = function(runner, engine, time) {
                  var tickStartTime = Common.now(), engineDelta = runner.delta, updateCount = 0;
                  var frameDelta = time - runner.timeLastTick;
                  if (!frameDelta || !runner.timeLastTick || frameDelta > Math.max(Runner._maxFrameDelta, runner.maxFrameTime)) {
                    frameDelta = runner.frameDelta || Runner._frameDeltaFallback;
                  }
                  if (runner.frameDeltaSmoothing) {
                    runner.frameDeltaHistory.push(frameDelta);
                    runner.frameDeltaHistory = runner.frameDeltaHistory.slice(-runner.frameDeltaHistorySize);
                    var deltaHistorySorted = runner.frameDeltaHistory.slice(0).sort();
                    var deltaHistoryWindow = runner.frameDeltaHistory.slice(
                      deltaHistorySorted.length * Runner._smoothingLowerBound,
                      deltaHistorySorted.length * Runner._smoothingUpperBound
                    );
                    var frameDeltaSmoothed = _mean(deltaHistoryWindow);
                    frameDelta = frameDeltaSmoothed || frameDelta;
                  }
                  if (runner.frameDeltaSnapping) {
                    frameDelta = 1e3 / Math.round(1e3 / frameDelta);
                  }
                  runner.frameDelta = frameDelta;
                  runner.timeLastTick = time;
                  runner.timeBuffer += runner.frameDelta;
                  runner.timeBuffer = Common.clamp(
                    runner.timeBuffer,
                    0,
                    runner.frameDelta + engineDelta * Runner._timeBufferMargin
                  );
                  runner.lastUpdatesDeferred = 0;
                  var maxUpdates = runner.maxUpdates || Math.ceil(runner.maxFrameTime / engineDelta);
                  var event = {
                    timestamp: engine.timing.timestamp
                  };
                  Events2.trigger(runner, "beforeTick", event);
                  Events2.trigger(runner, "tick", event);
                  var updateStartTime = Common.now();
                  while (engineDelta > 0 && runner.timeBuffer >= engineDelta * Runner._timeBufferMargin) {
                    Events2.trigger(runner, "beforeUpdate", event);
                    Engine2.update(engine, engineDelta);
                    Events2.trigger(runner, "afterUpdate", event);
                    runner.timeBuffer -= engineDelta;
                    updateCount += 1;
                    var elapsedTimeTotal = Common.now() - tickStartTime, elapsedTimeUpdates = Common.now() - updateStartTime, elapsedNextEstimate = elapsedTimeTotal + Runner._elapsedNextEstimate * elapsedTimeUpdates / updateCount;
                    if (updateCount >= maxUpdates || elapsedNextEstimate > runner.maxFrameTime) {
                      runner.lastUpdatesDeferred = Math.round(Math.max(0, runner.timeBuffer / engineDelta - Runner._timeBufferMargin));
                      break;
                    }
                  }
                  engine.timing.lastUpdatesPerFrame = updateCount;
                  Events2.trigger(runner, "afterTick", event);
                  if (runner.frameDeltaHistory.length >= 100) {
                    if (runner.lastUpdatesDeferred && Math.round(runner.frameDelta / engineDelta) > maxUpdates) {
                      Common.warnOnce("Matter.Runner: runner reached runner.maxUpdates, see docs.");
                    } else if (runner.lastUpdatesDeferred) {
                      Common.warnOnce("Matter.Runner: runner reached runner.maxFrameTime, see docs.");
                    }
                    if (typeof runner.isFixed !== "undefined") {
                      Common.warnOnce("Matter.Runner: runner.isFixed is now redundant, see docs.");
                    }
                    if (runner.deltaMin || runner.deltaMax) {
                      Common.warnOnce("Matter.Runner: runner.deltaMin and runner.deltaMax were removed, see docs.");
                    }
                    if (runner.fps !== 0) {
                      Common.warnOnce("Matter.Runner: runner.fps was replaced by runner.delta, see docs.");
                    }
                  }
                };
                Runner.stop = function(runner) {
                  Runner._cancelNextFrame(runner);
                };
                Runner._onNextFrame = function(runner, callback) {
                  if (typeof window !== "undefined" && window.requestAnimationFrame) {
                    runner.frameRequestId = window.requestAnimationFrame(callback);
                  } else {
                    throw new Error("Matter.Runner: missing required global window.requestAnimationFrame.");
                  }
                  return runner.frameRequestId;
                };
                Runner._cancelNextFrame = function(runner) {
                  if (typeof window !== "undefined" && window.cancelAnimationFrame) {
                    window.cancelAnimationFrame(runner.frameRequestId);
                  } else {
                    throw new Error("Matter.Runner: missing required global window.cancelAnimationFrame.");
                  }
                };
                var _mean = function(values) {
                  var result = 0, valuesLength = values.length;
                  for (var i = 0; i < valuesLength; i += 1) {
                    result += values[i];
                  }
                  return result / valuesLength || 0;
                };
              })();
            },
            /* 28 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var SAT = {};
              module2.exports = SAT;
              var Collision = __webpack_require__(8);
              var Common = __webpack_require__(0);
              var deprecated = Common.deprecated;
              (function() {
                SAT.collides = function(bodyA, bodyB) {
                  return Collision.collides(bodyA, bodyB);
                };
                deprecated(SAT, "collides", "SAT.collides \u27A4 replaced by Collision.collides");
              })();
            },
            /* 29 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var Svg = {};
              module2.exports = Svg;
              var Bounds = __webpack_require__(1);
              var Common = __webpack_require__(0);
              (function() {
                Svg.pathToVertices = function(path, sampleLength) {
                  if (typeof window !== "undefined" && !("SVGPathSeg" in window)) {
                    Common.warn("Svg.pathToVertices: SVGPathSeg not defined, a polyfill is required.");
                  }
                  var i, il, total, point, segment, segments, segmentsQueue, lastSegment, lastPoint, segmentIndex, points = [], lx, ly, length = 0, x = 0, y = 0;
                  sampleLength = sampleLength || 15;
                  var addPoint = function(px, py, pathSegType) {
                    var isRelative = pathSegType % 2 === 1 && pathSegType > 1;
                    if (!lastPoint || px != lastPoint.x || py != lastPoint.y) {
                      if (lastPoint && isRelative) {
                        lx = lastPoint.x;
                        ly = lastPoint.y;
                      } else {
                        lx = 0;
                        ly = 0;
                      }
                      var point2 = {
                        x: lx + px,
                        y: ly + py
                      };
                      if (isRelative || !lastPoint) {
                        lastPoint = point2;
                      }
                      points.push(point2);
                      x = lx + px;
                      y = ly + py;
                    }
                  };
                  var addSegmentPoint = function(segment2) {
                    var segType = segment2.pathSegTypeAsLetter.toUpperCase();
                    if (segType === "Z")
                      return;
                    switch (segType) {
                      case "M":
                      case "L":
                      case "T":
                      case "C":
                      case "S":
                      case "Q":
                        x = segment2.x;
                        y = segment2.y;
                        break;
                      case "H":
                        x = segment2.x;
                        break;
                      case "V":
                        y = segment2.y;
                        break;
                    }
                    addPoint(x, y, segment2.pathSegType);
                  };
                  Svg._svgPathToAbsolute(path);
                  total = path.getTotalLength();
                  segments = [];
                  for (i = 0; i < path.pathSegList.numberOfItems; i += 1)
                    segments.push(path.pathSegList.getItem(i));
                  segmentsQueue = segments.concat();
                  while (length < total) {
                    segmentIndex = path.getPathSegAtLength(length);
                    segment = segments[segmentIndex];
                    if (segment != lastSegment) {
                      while (segmentsQueue.length && segmentsQueue[0] != segment)
                        addSegmentPoint(segmentsQueue.shift());
                      lastSegment = segment;
                    }
                    switch (segment.pathSegTypeAsLetter.toUpperCase()) {
                      case "C":
                      case "T":
                      case "S":
                      case "Q":
                      case "A":
                        point = path.getPointAtLength(length);
                        addPoint(point.x, point.y, 0);
                        break;
                    }
                    length += sampleLength;
                  }
                  for (i = 0, il = segmentsQueue.length; i < il; ++i)
                    addSegmentPoint(segmentsQueue[i]);
                  return points;
                };
                Svg._svgPathToAbsolute = function(path) {
                  var x0, y0, x1, y1, x2, y2, segs = path.pathSegList, x = 0, y = 0, len = segs.numberOfItems;
                  for (var i = 0; i < len; ++i) {
                    var seg = segs.getItem(i), segType = seg.pathSegTypeAsLetter;
                    if (/[MLHVCSQTA]/.test(segType)) {
                      if ("x" in seg) x = seg.x;
                      if ("y" in seg) y = seg.y;
                    } else {
                      if ("x1" in seg) x1 = x + seg.x1;
                      if ("x2" in seg) x2 = x + seg.x2;
                      if ("y1" in seg) y1 = y + seg.y1;
                      if ("y2" in seg) y2 = y + seg.y2;
                      if ("x" in seg) x += seg.x;
                      if ("y" in seg) y += seg.y;
                      switch (segType) {
                        case "m":
                          segs.replaceItem(path.createSVGPathSegMovetoAbs(x, y), i);
                          break;
                        case "l":
                          segs.replaceItem(path.createSVGPathSegLinetoAbs(x, y), i);
                          break;
                        case "h":
                          segs.replaceItem(path.createSVGPathSegLinetoHorizontalAbs(x), i);
                          break;
                        case "v":
                          segs.replaceItem(path.createSVGPathSegLinetoVerticalAbs(y), i);
                          break;
                        case "c":
                          segs.replaceItem(path.createSVGPathSegCurvetoCubicAbs(x, y, x1, y1, x2, y2), i);
                          break;
                        case "s":
                          segs.replaceItem(path.createSVGPathSegCurvetoCubicSmoothAbs(x, y, x2, y2), i);
                          break;
                        case "q":
                          segs.replaceItem(path.createSVGPathSegCurvetoQuadraticAbs(x, y, x1, y1), i);
                          break;
                        case "t":
                          segs.replaceItem(path.createSVGPathSegCurvetoQuadraticSmoothAbs(x, y), i);
                          break;
                        case "a":
                          segs.replaceItem(path.createSVGPathSegArcAbs(x, y, seg.r1, seg.r2, seg.angle, seg.largeArcFlag, seg.sweepFlag), i);
                          break;
                        case "z":
                        case "Z":
                          x = x0;
                          y = y0;
                          break;
                      }
                    }
                    if (segType == "M" || segType == "m") {
                      x0 = x;
                      y0 = y;
                    }
                  }
                };
              })();
            },
            /* 30 */
            /***/
            function(module2, exports2, __webpack_require__) {
              var World2 = {};
              module2.exports = World2;
              var Composite2 = __webpack_require__(6);
              var Common = __webpack_require__(0);
              (function() {
                World2.create = Composite2.create;
                World2.add = Composite2.add;
                World2.remove = Composite2.remove;
                World2.clear = Composite2.clear;
                World2.addComposite = Composite2.addComposite;
                World2.addBody = Composite2.addBody;
                World2.addConstraint = Composite2.addConstraint;
              })();
            }
            /******/
          ])
        );
      });
    }
  });

  // node_modules/@bordiko/sdk/dist/index.js
  var INVALID_MOVE = Symbol("INVALID_MOVE");
  function seedFromString(str) {
    let h1 = 1779033703;
    let h2 = 3144134277;
    let h3 = 1013904242;
    let h4 = 2773480762;
    for (let i = 0; i < str.length; i++) {
      const k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
    h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
    h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
    h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
    h1 = (h1 ^ h2 ^ h3 ^ h4) >>> 0;
    return [h1, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
  }
  var Rng = class {
    a = 0;
    b = 0;
    c = 0;
    d = 0;
    constructor(state) {
      this.a = state[0] >>> 0;
      this.b = state[1] >>> 0;
      this.c = state[2] >>> 0;
      this.d = state[3] >>> 0;
    }
    /** Capture the current state so it can be persisted and later restored. */
    snapshot() {
      return [this.a >>> 0, this.b >>> 0, this.c >>> 0, this.d >>> 0];
    }
    /** Next uniform float in [0, 1). Advances the generator. */
    next() {
      let t = this.a + this.b | 0;
      this.a = this.b ^ this.b >>> 9;
      this.b = this.c + (this.c << 3) | 0;
      this.c = this.c << 21 | this.c >>> 11;
      this.d = this.d + 1 | 0;
      t = t + this.d | 0;
      this.c = this.c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  };
  function makeRandom(rng) {
    const float = () => rng.next();
    const int = (min, max) => min + Math.floor(float() * (max - min + 1));
    return {
      float,
      int,
      bool: (p = 0.5) => float() < p,
      die: (sides) => int(1, sides),
      dice: (count, sides) => {
        const out = [];
        for (let i = 0; i < count; i++) out.push(int(1, sides));
        return out;
      },
      pick: (arr) => arr[Math.floor(float() * arr.length)],
      shuffle: (arr) => {
        const out = arr.slice();
        for (let i = out.length - 1; i > 0; i--) {
          const j = Math.floor(float() * (i + 1));
          const tmp = out[i];
          out[i] = out[j];
          out[j] = tmp;
        }
        return out;
      }
    };
  }
  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function initFlow(playOrder) {
    return {
      phase: null,
      turn: 1,
      currentPlayer: playOrder[0],
      playOrder: playOrder.slice(),
      playOrderPos: 0
    };
  }
  function advanceTurn(flow) {
    flow.playOrderPos = (flow.playOrderPos + 1) % flow.playOrder.length;
    flow.currentPlayer = flow.playOrder[flow.playOrderPos];
    flow.turn += 1;
    delete flow.active;
  }
  function createMatch(def, opts) {
    const players = opts.players.slice();
    if (players.length < def.minPlayers || players.length > def.maxPlayers) {
      throw new Error(
        `${def.name} supports ${def.minPlayers}-${def.maxPlayers} players, got ${players.length}`
      );
    }
    const seed = opts.seed ?? "bordiko";
    const setupRng = new Rng(seedFromString(seed + ":setup"));
    const G = def.setup({
      players,
      numPlayers: players.length,
      random: makeRandom(setupRng),
      config: opts.config
    });
    const state = {
      seed,
      G,
      flow: initFlow(players),
      // The play stream is a separate, persisted RNG so setup order never
      // affects in-game rolls.
      rng: new Rng(seedFromString(seed + ":play")).snapshot(),
      log: [],
      ended: false,
      result: null
    };
    if (def.initialActive) {
      const act = def.initialActive(state.G);
      if (act && act.length > 0) state.flow.active = act.slice();
    }
    maybeEnd(def, state);
    return state;
  }
  function applyMove(def, state, move) {
    if (state.ended) return fail(state, "game has already ended");
    const handler = def.moves[move.type];
    if (!handler) return fail(state, `unknown move: ${move.type}`);
    const active = state.flow.active;
    const mayMove = move.playerId === state.flow.currentPlayer || active !== void 0 && active.includes(move.playerId);
    if (!mayMove) {
      return fail(state, `not ${move.playerId}'s turn`);
    }
    const nextG = deepClone(state.G);
    const nextFlow = deepClone(state.flow);
    const rng = new Rng(state.rng);
    const random = makeRandom(rng);
    const events = [];
    let turnEnded = false;
    let endResult = null;
    const flowApi = {
      endTurn: () => {
        turnEnded = true;
      },
      setPhase: (phase) => {
        nextFlow.phase = phase;
      },
      currentPlayer: () => nextFlow.currentPlayer,
      setActive: (playerId) => {
        nextFlow.currentPlayer = playerId;
        delete nextFlow.active;
      },
      setActiveSet: (playerIds) => {
        if (playerIds.length === 0) delete nextFlow.active;
        else nextFlow.active = playerIds.slice();
      },
      turnOwner: () => nextFlow.playOrder[nextFlow.playOrderPos],
      playOrder: () => nextFlow.playOrder.slice(),
      endGame: (result) => {
        endResult = result;
      }
    };
    const ctx = {
      playerId: move.playerId,
      random,
      flow: flowApi,
      emit: (type, data) => {
        events.push({ type, data, turn: nextFlow.turn });
      },
      log: () => {
      }
    };
    const outcome = handler(nextG, move.payload ?? null, ctx);
    if (outcome === INVALID_MOVE) {
      return fail(state, `illegal move: ${move.type}`);
    }
    const committed = {
      seed: state.seed,
      G: nextG,
      flow: nextFlow,
      rng: rng.snapshot(),
      log: state.log.concat([
        {
          id: state.log.length,
          type: move.type,
          payload: move.payload ?? null,
          playerId: move.playerId,
          turn: state.flow.turn
        }
      ]),
      ended: false,
      result: null
    };
    if (endResult !== null) {
      committed.ended = true;
      committed.result = endResult;
    } else {
      if (turnEnded) advanceTurn(committed.flow);
      maybeEnd(def, committed);
    }
    return { ok: true, state: committed, events };
  }
  function applyTick(def, state, dt) {
    if (state.ended) return fail(state, "game has already ended");
    if (!def.tick) return fail(state, "game is not real-time (no tick handler)");
    const nextG = deepClone(state.G);
    const nextFlow = deepClone(state.flow);
    const rng = new Rng(state.rng);
    const random = makeRandom(rng);
    const events = [];
    let endResult = null;
    const ctx = {
      dt,
      random,
      emit: (type, data) => {
        events.push({ type, data, turn: nextFlow.turn });
      },
      endGame: (result) => {
        endResult = result;
      }
    };
    def.tick(nextG, dt, ctx);
    const committed = {
      seed: state.seed,
      G: nextG,
      flow: nextFlow,
      rng: rng.snapshot(),
      log: state.log.concat([
        {
          id: state.log.length,
          type: "__tick",
          payload: { dt },
          playerId: "",
          turn: state.flow.turn
        }
      ]),
      ended: false,
      result: null
    };
    if (endResult !== null) {
      committed.ended = true;
      committed.result = endResult;
    } else {
      maybeEnd(def, committed);
    }
    return { ok: true, state: committed, events };
  }
  function getPlayerView(def, state, playerId) {
    const G = def.playerView ? def.playerView(state.G, playerId, state.flow) : state.G;
    return {
      G,
      phase: state.flow.phase,
      turn: state.flow.turn,
      currentPlayer: state.flow.currentPlayer,
      // The seats allowed to act at once (simultaneous mode); empty for ordinary
      // single-seat turns. Lets the client mark "your turn" for every active seat.
      active: state.flow.active ?? [],
      playOrder: state.flow.playOrder.slice(),
      ended: state.ended,
      result: state.result,
      moveCount: state.log.length
    };
  }
  function maybeEnd(def, state) {
    if (state.ended || !def.endIf) return;
    const result = def.endIf(state.G, state.flow);
    if (result) {
      state.ended = true;
      state.result = result;
    }
  }
  function fail(state, error) {
    return { ok: false, error, state, events: [] };
  }
  function enumerateMoves(def, state) {
    if (!def.enumerate || state.ended) return [];
    return def.enumerate(state.G, state.flow.currentPlayer, state.flow);
  }
  function enumerateMovesFor(def, state, playerId) {
    if (!def.enumerate || state.ended) return [];
    return def.enumerate(state.G, playerId, state.flow);
  }
  function createGuest(def) {
    const setup = (cmdJson) => {
      const { players, seed, config } = JSON.parse(cmdJson);
      return JSON.stringify(createMatch(def, { players, seed, config }));
    };
    const apply = (cmdJson) => {
      const { state, move } = JSON.parse(cmdJson);
      return JSON.stringify(applyMove(def, state, move));
    };
    const tick = (cmdJson) => {
      const { state, dt } = JSON.parse(cmdJson);
      return JSON.stringify(applyTick(def, state, dt));
    };
    const view = (cmdJson) => {
      const { state, playerId } = JSON.parse(cmdJson);
      return JSON.stringify(getPlayerView(def, state, playerId));
    };
    const legal = (cmdJson) => {
      const { state, playerId } = JSON.parse(cmdJson);
      return JSON.stringify(playerId ? enumerateMovesFor(def, state, playerId) : enumerateMoves(def, state));
    };
    const dispatch = (commandJson) => {
      const cmd = JSON.parse(commandJson);
      switch (cmd.op) {
        case "setup":
          return setup(commandJson);
        case "apply":
          return apply(commandJson);
        case "tick":
          return tick(commandJson);
        case "view":
          return view(commandJson);
        case "legal":
          return legal(commandJson);
        default:
          return JSON.stringify({ error: `unknown op: ${cmd.op}` });
      }
    };
    return { setup, apply, tick, view, legal, dispatch };
  }
  function defineGame(def) {
    if (!def.name || !/^[a-z0-9][a-z0-9-]*$/.test(def.name)) {
      throw new Error(
        `defineGame: "name" must be a lowercase kebab-case id, got ${JSON.stringify(def.name)}`
      );
    }
    if (def.minPlayers < 1 || def.maxPlayers < def.minPlayers) {
      throw new Error(
        `defineGame: invalid player range ${def.minPlayers}-${def.maxPlayers}`
      );
    }
    const moveTypes = Object.keys(def.moves ?? {});
    if (moveTypes.length === 0) {
      throw new Error(`defineGame: "${def.name}" declares no moves`);
    }
    if (typeof def.setup !== "function") {
      throw new Error(`defineGame: "${def.name}" is missing a setup() function`);
    }
    if (!def.meta || !def.meta.displayName) {
      throw new Error(`defineGame: "${def.name}" is missing meta.displayName`);
    }
    return def;
  }

  // src/wasm-polyfills.ts
  var wasmInitError = null;
  var getWasmInitError = () => wasmInitError;
  var setWasmInitError = (err) => {
    wasmInitError = err instanceof Error ? err.message : String(err);
  };
  var installWasmPolyfills = () => {
    const g = globalThis;
    let fakeTime = 0;
    const tick = () => fakeTime++;
    if (!g.Date) g.Date = function Date2() {
    };
    if (!g.Date.now) g.Date.now = tick;
    if (!g.performance) g.performance = { now: tick };
    else if (!g.performance.now) g.performance.now = tick;
    if (!g.window) g.window = g;
    if (!g.document) g.document = { createElement: () => ({}) };
  };
  installWasmPolyfills();

  // src/matter-lib.ts
  var import_matter = __toESM(require_matter(), 1);
  var matterInitError = null;
  try {
    if (!import_matter.default?.Engine?.create) {
      throw new Error("Matter.Engine.create missing after import");
    }
  } catch (err) {
    matterInitError = err instanceof Error ? err.message : String(err);
    setWasmInitError(`matter-lib: ${matterInitError}`);
  }
  var matter_lib_default = import_matter.default;

  // src/matter-physics.ts
  var physicsBootstrapError = matterInitError;
  var Engine;
  var MatterWorld;
  var Bodies;
  var MatterBody;
  var Constraint;
  var Events;
  var Query;
  var Composite;
  try {
    ({ Engine, World: MatterWorld, Bodies, Body: MatterBody, Constraint, Events, Query, Composite } = matter_lib_default);
    if (!Engine?.create) {
      throw new Error("Matter.js Engine unavailable after bootstrap");
    }
  } catch (err) {
    physicsBootstrapError = err instanceof Error ? err.message : String(err);
    setWasmInitError(`matter-physics: ${physicsBootstrapError}`);
  }
  var getPhysicsInitError = () => physicsBootstrapError ?? getWasmInitError();
  var assertMatterReady = () => {
    const err = getPhysicsInitError();
    if (err) throw new Error(`WASM INIT: ${err}`);
  };
  function Vec2(x, y) {
    return { x, y };
  }
  var WorldManifold = class {
    normal = Vec2(0, 1);
    points = [];
    pointCount = 0;
  };
  var contactIdSeq = 0;
  var activeContacts = /* @__PURE__ */ new Map();
  var contactsByBody = /* @__PURE__ */ new Map();
  var Fixture = class {
    body;
    shape;
    userData;
    constructor(body, shape, userData) {
      this.body = body;
      this.shape = shape;
      this.userData = userData;
    }
    getUserData() {
      return this.userData;
    }
    getBody() {
      return this.body;
    }
    getShape() {
      return this.shape;
    }
    getNext() {
      return null;
    }
    getTransform() {
      return { position: this.body.getPosition(), angle: this.body.getAngle() };
    }
  };
  var Contact = class {
    record;
    constructor(record) {
      this.record = record;
    }
    getFixtureA() {
      return this.record.fixtureA;
    }
    getFixtureB() {
      return this.record.fixtureB;
    }
    isTouching() {
      return this.record.touching && this.record.enabled;
    }
    setEnabled(enabled) {
      this.record.enabled = enabled;
      this.record.pair.isActive = enabled;
    }
    getId() {
      return this.record.id;
    }
    getWorldManifold(manifold) {
      manifold.normal.x = this.record.normal.x;
      manifold.normal.y = this.record.normal.y;
      if (manifold.points.length === 0) {
        manifold.points.push(Vec2(0, 0));
      }
      const fa = this.record.fixtureA.body.getPosition();
      const fb = this.record.fixtureB.body.getPosition();
      manifold.points[0].x = (fa.x + fb.x) * 0.5;
      manifold.points[0].y = (fa.y + fb.y) * 0.5;
      manifold.pointCount = 1;
    }
  };
  var ContactEdge = class {
    contact;
    next;
    constructor(contact, next) {
      this.contact = contact;
      this.next = next;
    }
  };
  function unlinkBodyContact(body, id) {
    const set = contactsByBody.get(body);
    if (!set) return;
    set.delete(id);
    if (set.size === 0) contactsByBody.delete(body);
  }
  var Body = class {
    matterBody = null;
    fixture = null;
    kind;
    opts;
    world;
    gravityScale = 1;
    targetVelocity = null;
    constructor(world2, kind, opts = {}) {
      this.world = world2;
      this.kind = kind;
      this.opts = opts;
      this.gravityScale = opts.gravityScale ?? 1;
    }
    getMatterBody() {
      return this.matterBody;
    }
    createFixture(shape, options = {}) {
      if (this.matterBody) {
        throw new Error("Body already has a fixture");
      }
      const pos = this.opts.position ?? Vec2(0, 0);
      const isStatic = this.kind === "static";
      const isSensor = options.isSensor ?? false;
      const density = options.density ?? 1;
      const friction = options.friction ?? 0.5;
      const restitution = options.restitution ?? 0;
      let matterShape;
      if (shape.kind === "box") {
        matterShape = Bodies.rectangle(
          pos.x + shape.cx,
          pos.y + shape.cy,
          shape.hx * 2,
          shape.hy * 2,
          {
            isStatic,
            isSensor,
            friction,
            restitution,
            density,
            inertia: this.opts.fixedRotation ? Infinity : void 0,
            chamfer: { radius: 0 }
          }
        );
      } else if (shape.kind === "circle") {
        matterShape = Bodies.circle(pos.x, pos.y, shape.radius, {
          isStatic,
          isSensor,
          friction,
          restitution,
          density,
          frictionAir: this.opts.bullet ? 0 : 0.01,
          inertia: this.opts.fixedRotation ? Infinity : void 0
        });
      } else {
        const mx = (shape.x1 + shape.x2) * 0.5;
        const my = (shape.y1 + shape.y2) * 0.5;
        const len = Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1);
        const angle = Math.atan2(shape.y2 - shape.y1, shape.x2 - shape.x1);
        matterShape = Bodies.rectangle(mx, my, len, 1, {
          isStatic: true,
          isSensor: false,
          friction,
          restitution,
          angle,
          inertia: Infinity
        });
      }
      if (this.opts.fixedRotation) {
        MatterBody.setInertia(matterShape, Infinity);
      }
      if (this.kind === "kinematic") {
        matterShape.isStatic = true;
        MatterBody.setStatic(matterShape, true);
      }
      matterShape.plugin = matterShape.plugin ?? {};
      matterShape.plugin.gravityScale = this.gravityScale;
      matterShape.plugin.gameBody = this;
      this.matterBody = matterShape;
      this.fixture = new Fixture(this, shape, options.userData ?? null);
      this.world.addBody(matterShape);
      return this.fixture;
    }
    getFixtureList() {
      return this.fixture;
    }
    getContactList() {
      const ids = contactsByBody.get(this);
      if (!ids || ids.size === 0) return null;
      let head = null;
      for (const id of ids) {
        const rec = activeContacts.get(id);
        if (!rec) continue;
        head = new ContactEdge(new Contact(rec), head);
      }
      return head;
    }
    getPosition() {
      const b = this.matterBody;
      if (!b) return Vec2(0, 0);
      return Vec2(b.position.x, b.position.y);
    }
    setTransform(position, angle) {
      const b = this.matterBody;
      if (!b) return;
      MatterBody.setPosition(b, { x: position.x, y: position.y });
      MatterBody.setAngle(b, angle);
    }
    getLinearVelocity() {
      const b = this.matterBody;
      if (this.targetVelocity) return Vec2(this.targetVelocity.x, this.targetVelocity.y);
      if (!b) return Vec2(0, 0);
      const dt = this.world.getStepSeconds();
      return Vec2(b.velocity.x / dt, b.velocity.y / dt);
    }
    setLinearVelocity(v) {
      this.targetVelocity = Vec2(v.x, v.y);
      this.syncMatterVelocity(v);
    }
    /** Matter.js Verlet velocity is displacement/step — sync positionPrev for impulses/jumps. */
    syncMatterVelocity(v) {
      const b = this.matterBody;
      if (!b) return;
      const dt = this.world.getStepSeconds();
      const bx = v.x * dt;
      const by = v.y * dt;
      MatterBody.setVelocity(b, { x: bx, y: by });
      MatterBody.set(b, {
        positionPrev: { x: b.position.x - bx, y: b.position.y - by }
      });
    }
    /** Projectiles: set m/s velocity once with correct Verlet state. */
    setBallisticVelocity(v) {
      this.setLinearVelocity(v);
    }
    syncMatterVelocityPublic(v) {
      this.syncMatterVelocity(v);
    }
    applyLinearImpulse(impulse, _point, _wake) {
      const b = this.matterBody;
      if (!b || b.mass <= 0 || !Number.isFinite(b.mass)) return;
      const current = this.getLinearVelocity();
      this.setLinearVelocity(
        Vec2(current.x + impulse.x / b.mass, current.y + impulse.y / b.mass)
      );
    }
    getWorldCenter() {
      return this.getPosition();
    }
    getAngle() {
      return this.matterBody?.angle ?? 0;
    }
    setAngle(angle) {
      const b = this.matterBody;
      if (!b) return;
      MatterBody.setAngle(b, angle);
    }
    setAwake(_awake) {
      const b = this.matterBody;
      if (!b) return;
      MatterBody.set(b, { sleeping: false });
    }
    getMass() {
      return this.matterBody?.mass ?? 1;
    }
    getType() {
      return this.kind;
    }
    getTransform() {
      return { position: this.getPosition(), angle: this.getAngle() };
    }
    applyTargetToMatter() {
      if (!this.targetVelocity || !this.matterBody) return;
      this.syncMatterVelocity(this.targetVelocity);
    }
    clearTarget() {
      this.targetVelocity = null;
    }
    destroy() {
      const ids = contactsByBody.get(this);
      if (ids) {
        for (const id of [...ids]) {
          const rec = activeContacts.get(id);
          if (!rec) continue;
          unlinkBodyContact(rec.bodyA, id);
          unlinkBodyContact(rec.bodyB, id);
          activeContacts.delete(id);
        }
      }
      if (this.matterBody) {
        this.world.removeBody(this.matterBody);
        this.matterBody = null;
      }
      contactsByBody.delete(this);
    }
  };
  var PhysicsWorld = class {
    engine;
    beginHandlers = [];
    preSolveHandlers = [];
    stepMs;
    baseGravity;
    constructor(options) {
      assertMatterReady();
      this.stepMs = options.stepMs ?? 1e3 / 60;
      this.baseGravity = options.gravity.y;
      const gravityScale = this.baseGravity * 1e-6;
      this.engine = Engine.create({
        gravity: { x: options.gravity.x, y: 1, scale: gravityScale },
        positionIterations: 6,
        velocityIterations: 4,
        enableSleeping: false
      });
      Events.on(this.engine, "beforeUpdate", () => {
        this.applyTargetVelocities();
        const { y: gravityY, scale: engineScale = gravityScale } = this.engine.gravity;
        for (const body of Composite.allBodies(this.engine.world)) {
          if (body.isStatic) continue;
          const customScale = body.plugin.gravityScale ?? 1;
          if (customScale === 1) continue;
          const extra = (customScale - 1) * gravityY * engineScale * body.mass;
          if (extra !== 0) {
            MatterBody.applyForce(body, body.position, { x: 0, y: extra });
          }
        }
      });
      Events.on(this.engine, "collisionStart", (event) => {
        for (const pair of event.pairs) {
          this.registerPair(pair, true);
        }
        this.dispatchContacts("begin");
      });
      Events.on(this.engine, "collisionActive", (event) => {
        for (const pair of event.pairs) {
          this.registerPair(pair, true);
        }
        this.dispatchContacts("pre");
      });
      Events.on(this.engine, "collisionEnd", (event) => {
        for (const pair of event.pairs) {
          this.unregisterPair(pair);
        }
      });
    }
    wrapMatterBody(matterBody) {
      if (!matterBody?.plugin) return null;
      return matterBody.plugin.gameBody ?? null;
    }
    fixtureFor(body) {
      return body?.getFixtureList() ?? null;
    }
    registerPair(pair, touching) {
      const bodyA = this.wrapMatterBody(pair.bodyA);
      const bodyB = this.wrapMatterBody(pair.bodyB);
      if (!bodyA || !bodyB) return;
      let id = pair.plugin?.contactId;
      if (id == null || !activeContacts.has(id)) {
        id = ++contactIdSeq;
        const pairPlugin = pair;
        pairPlugin.plugin = pairPlugin.plugin ?? {};
        pairPlugin.plugin.contactId = id;
      }
      const nx = pair.collision.normal.x;
      const ny = pair.collision.normal.y;
      const fixtureA = this.fixtureFor(bodyA);
      const fixtureB = this.fixtureFor(bodyB);
      const prev = activeContacts.get(id);
      const record = {
        id,
        pair,
        bodyA,
        bodyB,
        fixtureA,
        fixtureB,
        enabled: prev?.enabled ?? true,
        touching,
        normal: Vec2(nx, ny)
      };
      activeContacts.set(id, record);
      this.linkBodyContact(bodyA, id);
      this.linkBodyContact(bodyB, id);
    }
    unregisterPair(pair) {
      const id = pair.plugin?.contactId;
      if (id == null) return;
      const rec = activeContacts.get(id);
      if (rec) {
        this.unlinkBodyContact(rec.bodyA, id);
        this.unlinkBodyContact(rec.bodyB, id);
      }
      activeContacts.delete(id);
    }
    linkBodyContact(body, id) {
      let set = contactsByBody.get(body);
      if (!set) {
        set = /* @__PURE__ */ new Set();
        contactsByBody.set(body, set);
      }
      set.add(id);
    }
    unlinkBodyContact(body, id) {
      unlinkBodyContact(body, id);
    }
    dispatchContacts(phase) {
      const handlers = phase === "begin" ? this.beginHandlers : this.preSolveHandlers;
      for (const rec of activeContacts.values()) {
        if (!rec.touching) continue;
        const contact = new Contact(rec);
        for (const handler of handlers) {
          handler(contact);
        }
      }
    }
    on(event, handler) {
      if (event === "begin-contact") this.beginHandlers.push(handler);
      else this.preSolveHandlers.push(handler);
    }
    createBody(options = {}) {
      return new Body(this, "static", options);
    }
    createDynamicBody(options = {}) {
      return new Body(this, "dynamic", options);
    }
    createKinematicBody(options = {}) {
      return new Body(this, "kinematic", options);
    }
    destroyBody(body) {
      body.destroy();
    }
    createJoint(joint) {
      const a = joint.bodyA.getMatterBody();
      const b = joint.bodyB.getMatterBody();
      const anchor = joint.anchor;
      if (!a || !b) return;
      const pointA = { x: anchor.x - a.position.x, y: anchor.y - a.position.y };
      const pointB = { x: anchor.x - b.position.x, y: anchor.y - b.position.y };
      const restLength = Math.hypot(
        a.position.x + pointA.x - (b.position.x + pointB.x),
        a.position.y + pointA.y - (b.position.y + pointB.y)
      );
      const constraint = Constraint.create({
        bodyA: a,
        bodyB: b,
        pointA,
        pointB,
        length: Math.max(0.01, restLength),
        stiffness: 0.85,
        damping: 0.08
      });
      Composite.add(this.engine.world, constraint);
    }
    getStepSeconds() {
      return this.stepMs / 1e3;
    }
    applyTargetVelocities() {
      for (const mb of Composite.allBodies(this.engine.world)) {
        const gameBody = this.wrapMatterBody(mb);
        gameBody?.applyTargetToMatter();
      }
    }
    clearTargetVelocities() {
      for (const mb of Composite.allBodies(this.engine.world)) {
        const gameBody = this.wrapMatterBody(mb);
        gameBody?.clearTarget();
      }
    }
    addBody(body) {
      Composite.add(this.engine.world, body);
    }
    removeBody(body) {
      Composite.remove(this.engine.world, body);
    }
    step(_dt) {
      this.applyTargetVelocities();
      Engine.update(this.engine, this.stepMs);
      this.clearTargetVelocities();
    }
    rayCast(p1, p2, callback) {
      const rayBodies = Query.ray(this.getAllBodies(), p1, p2);
      let best = null;
      for (const mb of rayBodies) {
        const gameBody = this.wrapMatterBody(mb);
        const fixture = this.fixtureFor(gameBody);
        if (!fixture) continue;
        const x = p1.x;
        if (x < mb.bounds.min.x || x > mb.bounds.max.x) continue;
        const surfaceY = mb.bounds.min.y;
        if (surfaceY < p1.y - 0.05 || surfaceY > p2.y + 0.05) continue;
        const dist = surfaceY - p1.y;
        if (!best || dist < best.dist) {
          best = { fixture, point: Vec2(x, surfaceY), dist };
        }
      }
      if (!best) return;
      callback(best.fixture, best.point);
    }
    getAllBodies() {
      return Composite.allBodies(this.engine.world);
    }
  };
  function Box(hx, hy, center = Vec2(0, 0)) {
    return { kind: "box", hx, hy, cx: center.x, cy: center.y };
  }
  function Circle(radius) {
    return { kind: "circle", radius };
  }
  function Edge(v1, v2) {
    return { kind: "edge", x1: v1.x, y1: v1.y, x2: v2.x, y2: v2.y };
  }
  function testBodyOverlap(bodyA, bodyB) {
    const a = bodyA.getMatterBody();
    const b = bodyB.getMatterBody();
    if (!a || !b) return false;
    return Query.collides(a, [b]).length > 0;
  }
  var World = class extends PhysicsWorld {
    constructor(options) {
      super(options);
    }
  };

  // src/maps.ts
  var ARENA_W = 912;
  var ARENA_H = 500;
  var DEFAULT_PLATFORMS = [
    { id: 0, x: 63, y: 388, w: 118, h: 12, kind: "static" },
    {
      id: 1,
      x: 234,
      y: 273,
      w: 118,
      h: 12,
      kind: "elevator",
      vx: 22,
      minX: 154,
      maxX: 314
    },
    { id: 2, x: 405, y: 388, w: 118, h: 12, kind: "static" },
    {
      id: 3,
      x: 576,
      y: 273,
      w: 118,
      h: 12,
      kind: "elevator",
      vx: -22,
      minX: 496,
      maxX: 656
    },
    { id: 4, x: 405, y: 158, w: 118, h: 12, kind: "static" },
    {
      id: 5,
      x: 234,
      y: 43,
      w: 118,
      h: 12,
      kind: "elevator",
      vx: 22,
      minX: 154,
      maxX: 314
    }
  ];
  var TOWERS_PLATFORMS = [
    { id: 0, x: 80, y: 420, w: 100, h: 12, kind: "static" },
    { id: 1, x: 80, y: 320, w: 100, h: 12, kind: "static" },
    { id: 2, x: 80, y: 220, w: 100, h: 12, kind: "static" },
    { id: 3, x: 732, y: 420, w: 100, h: 12, kind: "static" },
    { id: 4, x: 732, y: 320, w: 100, h: 12, kind: "static" },
    { id: 5, x: 732, y: 220, w: 100, h: 12, kind: "static" },
    {
      id: 6,
      x: 350,
      y: 180,
      w: 212,
      h: 12,
      kind: "elevator",
      vx: 18,
      minX: 280,
      maxX: 420
    },
    {
      id: 7,
      x: 350,
      y: 340,
      w: 212,
      h: 12,
      kind: "elevator",
      vx: -18,
      minX: 280,
      maxX: 420
    }
  ];
  var OPEN_PLATFORMS = [
    { id: 0, x: 120, y: 388, w: 140, h: 12, kind: "static" },
    { id: 1, x: 652, y: 388, w: 140, h: 12, kind: "static" },
    {
      id: 2,
      x: 386,
      y: 273,
      w: 140,
      h: 12,
      kind: "elevator",
      vx: 24,
      minX: 300,
      maxX: 472
    },
    { id: 3, x: 386, y: 158, w: 140, h: 12, kind: "static" }
  ];
  var MAP_ORDER = ["default", "towers", "open"];
  var MAPS = {
    default: {
      id: "default",
      displayName: "Default Arena",
      platforms: DEFAULT_PLATFORMS,
      spawns: [114, ARENA_W - 114, 342, 570],
      elevatorYLevels: [158, 273, 388],
      theme: {
        background: 2368548,
        gridLine: 3815994,
        gridBorder: 5592405,
        floor: 4015700
      }
    },
    towers: {
      id: "towers",
      displayName: "Tower Flanks",
      platforms: TOWERS_PLATFORMS,
      spawns: [130, ARENA_W - 130, 456, 456],
      elevatorYLevels: [180, 340, 420],
      theme: {
        background: 1713203,
        gridLine: 2766149,
        gridBorder: 4478310,
        floor: 2964042
      }
    },
    open: {
      id: "open",
      displayName: "Open Center",
      platforms: OPEN_PLATFORMS,
      spawns: [180, ARENA_W - 180, 300, 612],
      elevatorYLevels: [158, 273, 388],
      theme: {
        background: 2761240,
        gridLine: 4011048,
        gridBorder: 6706500,
        floor: 4866101
      }
    }
  };
  var getMap = (mapId) => MAPS[mapId] ?? MAPS.default;
  var getNextMapId = (currentMapId) => {
    const idx = MAP_ORDER.indexOf(currentMapId);
    const next = idx < 0 ? 0 : (idx + 1) % MAP_ORDER.length;
    return MAP_ORDER[next];
  };

  // src/game.ts
  var WEAPON_ORDER = [
    "auto",
    "katana",
    "bazooka",
    "grenade",
    "winchester",
    "winchester_shotgun",
    "sniper"
  ];
  var WEAPONS = {
    auto: {
      damage: 80,
      spread: 0.06,
      speed: 48,
      maxActive: 6,
      fireRateTicks: 8,
      kind: "bullet",
      gravityScale: 0.62,
      barrelPx: 32,
      recoilForce: 22,
      muzzleFlashScale: 1.1
    },
    katana: {
      damage: 400,
      spread: 0,
      speed: 0,
      maxActive: 0,
      fireRateTicks: 24,
      kind: "melee",
      barrelPx: 38,
      meleeRange: 60,
      recoilForce: 8,
      muzzleFlashScale: 0.4
    },
    bazooka: {
      damage: 350,
      spread: 0.01,
      speed: 33,
      maxActive: 2,
      fireRateTicks: 45,
      kind: "rocket",
      aoeRadius: 80,
      gravityScale: 0.35,
      barrelPx: 52,
      recoilForce: 100,
      recoilImpulseMul: 2.6,
      muzzleFlashScale: 2.8
    },
    grenade: {
      damage: 280,
      spread: 0.08,
      speed: 30,
      maxActive: 2,
      fireRateTicks: 36,
      kind: "grenade",
      aoeRadius: 70,
      gravityScale: 0.85,
      barrelPx: 14,
      fuseTicks: 90,
      recoilForce: 30,
      muzzleFlashScale: 1.2
    },
    winchester: {
      damage: 250,
      spread: 0.02,
      speed: 54,
      maxActive: 3,
      fireRateTicks: 28,
      kind: "bullet",
      gravityScale: 0.62,
      barrelPx: 30,
      recoilForce: 36,
      muzzleFlashScale: 1.15
    },
    winchester_shotgun: {
      damage: 60,
      spread: 0.22,
      speed: 41,
      maxActive: 12,
      fireRateTicks: 36,
      pelletCount: 6,
      kind: "bullet",
      gravityScale: 0.62,
      barrelPx: 26,
      recoilForce: 50,
      recoilImpulseMul: 1.55,
      muzzleFlashScale: 1.65
    },
    sniper: {
      damage: 500,
      spread: 0,
      speed: 75,
      maxActive: 2,
      fireRateTicks: 75,
      kind: "bullet",
      gravityScale: 0.45,
      barrelPx: 42,
      recoilForce: 62,
      recoilImpulseMul: 1.75,
      muzzleFlashScale: 1.9
    }
  };
  var ROUNDS_TO_WIN = 3;
  var INTERMISSION_TICKS = 120;
  var FLOOR_Y = ARENA_H;
  var FLOOR_PICKUP_Y = FLOOR_Y - 20;
  var PICKUP_FALL_SPEED = 8;
  var SCALE = 30;
  var MAX_HEALTH = 1e3;
  var HEADSHOT_DAMAGE = MAX_HEALTH * 0.5;
  var BODY_BULLET_DAMAGE = MAX_HEALTH * 0.25;
  var HEAD_VISUAL_RADIUS_PX = 14;
  var HEAD_HIT_RADIUS_PX = HEAD_VISUAL_RADIUS_PX + 2;
  var BULLET_DAMAGE = 125;
  var PLAYER_HALF_W = 0.48;
  var PLAYER_HALF_H = 1.06;
  var HEAD_OFFSET = 36;
  var HEAD_RADIUS = HEAD_VISUAL_RADIUS_PX / SCALE;
  var PHYSICS_HZ = 60;
  var PHYSICS_DT = 1 / PHYSICS_HZ;
  var PHYSICS_STEPS_PER_TICK = PHYSICS_HZ / 30;
  var MOVE_SPEED = 15;
  var JUMP_IMPULSE = 34;
  var RECOIL_HEIGHT_OF_JUMP = 0.9;
  var GRAVITY = 97.5;
  var WALL_JUMP_IMPULSE_X = 11;
  var BULLET_SPEED = 40;
  var BULLET_GRAVITY_SCALE = 0.62;
  var FEET_PIXELS = PLAYER_HALF_H * SCALE;
  var GROUNDED_VEL_Y = 12;
  var GROUNDED_GAP = 0.5;
  var STAND_LIFT = 0.14;
  var MAX_BULLET_BOUNCES = 1;
  var PLATFORM_HITS_TO_BREAK = 4;
  var PLATFORM_MAX_HEALTH = WEAPONS.winchester.damage * PLATFORM_HITS_TO_BREAK;
  var SPAWN_INTERVAL_TICKS = 480;
  var ELEVATOR_TTL_TICKS = 1800;
  var PICKUP_RADIUS = 14;
  var HEALTH_PICKUP_AMOUNT = 300;
  var START_WEAPON = "winchester";
  var KATANA_BLADE_HIT_RADIUS = 30;
  var KATANA_SWING_HIT_SAMPLES = [0.28, 0.36, 0.44, 0.52, 0.6, 0.68];
  var STICK_BODY_LEN_PX = 44;
  var STICK_ARM_LEN_PX = 28;
  var STICK_CROUCH_DROP_PX = 46;
  var GUN_TIP_PX = 2.4;
  var spawnOnFloor = (x) => ({
    x,
    y: FLOOR_Y - PLAYER_HALF_H * SCALE
  });
  var world;
  var playerBodies = {};
  var platformBodies = {};
  var crateBodies = {};
  var pickupBodies = {};
  var bulletBodies = {};
  var bulletBounceCounts = {};
  var handledBulletContactsThisStep = /* @__PURE__ */ new Set();
  var handledBulletPlayerHitsThisStep = /* @__PURE__ */ new Set();
  var handledBulletWallBounceThisStep = /* @__PURE__ */ new Set();
  var playerGrounded = {};
  var playerWallJumpUsed = {};
  var playerWallContact = {};
  var playerJumpGrace = {};
  var pendingBulletDestroys = /* @__PURE__ */ new Set();
  var pendingHits = [];
  var pendingPlatformDamages = [];
  var pendingCrateDamages = [];
  var pendingExplosions = [];
  var currentG = null;
  var sharedWorldManifold = new WorldManifold();
  function setCurrentG(G) {
    currentG = G;
  }
  function parseGameConfig(config) {
    const mode = config?.mode;
    return mode === "teams2v2" ? "teams2v2" : "ffa";
  }
  function initScores(playerIds, gameMode) {
    if (gameMode === "teams2v2") {
      return { "0": 0, "1": 0 };
    }
    const scores = {};
    for (const id of playerIds) scores[id] = 0;
    return scores;
  }
  function assignTeams(playerIds) {
    const teams = {};
    playerIds.forEach((id, index) => {
      teams[id] = index < 2 ? 0 : 1;
    });
    return teams;
  }
  function canDamage(G, attackerId, targetId) {
    if (G.gameMode !== "teams2v2") return true;
    const attackerTeam = G.teams[attackerId];
    const targetTeam = G.teams[targetId];
    if (attackerTeam === void 0 || targetTeam === void 0) return true;
    return attackerTeam !== targetTeam;
  }
  function detectRoundWinner(G) {
    if (G.gameMode === "ffa") {
      const alive = Object.entries(G.players).filter(([, p]) => p.health > 0);
      if (alive.length === 1) return alive[0][0];
      return null;
    }
    const team0Alive = Object.entries(G.players).some(
      ([id, p]) => G.teams[id] === 0 && p.health > 0
    );
    const team1Alive = Object.entries(G.players).some(
      ([id, p]) => G.teams[id] === 1 && p.health > 0
    );
    if (!team0Alive && team1Alive) return "1";
    if (!team1Alive && team0Alive) return "0";
    return null;
  }
  function checkRoundEnd(G) {
    if (G.roundPhase !== "playing") return;
    const winner = detectRoundWinner(G);
    if (!winner) return;
    G.scores[winner] = (G.scores[winner] ?? 0) + 1;
    G.lastRoundWinner = winner;
    if ((G.scores[winner] ?? 0) >= ROUNDS_TO_WIN) {
      G.roundPhase = "intermission";
      G.intermissionTicksLeft = 0;
      return;
    }
    G.roundPhase = "intermission";
    G.intermissionTicksLeft = INTERMISSION_TICKS;
  }
  function startNextRound(G) {
    G.currentMapId = getNextMapId(G.currentMapId);
    G.currentRound += 1;
    G.lastRoundWinner = null;
    G.roundPhase = "playing";
    G.intermissionTicksLeft = 0;
    resetRound(G);
  }
  function buildMatchResult(G) {
    const maxScore = Math.max(...Object.values(G.scores).map((s) => Number(s)));
    if (maxScore < ROUNDS_TO_WIN) return;
    if (G.gameMode === "ffa") {
      const winner = Object.entries(G.scores).find(([, s]) => s >= ROUNDS_TO_WIN)?.[0];
      if (!winner) return;
      return { winner, scores: G.scores, reason: "best-of-5" };
    }
    const winningTeam = Object.entries(G.scores).find(([, s]) => s >= ROUNDS_TO_WIN)?.[0];
    if (winningTeam == null) return;
    const winners = Object.entries(G.teams).filter(([, team]) => String(team) === winningTeam).map(([id]) => id);
    return { winners, scores: G.scores, reason: "best-of-5" };
  }
  function getFixtureData(fixture) {
    return fixture.getUserData() ?? null;
  }
  function isSolidSurface(data, body) {
    if (data?.type === "ground") return true;
    if (data?.type === "platform") return true;
    if (data?.type === "crate") return true;
    return body.getType() === "static" && data?.type !== "bullet";
  }
  function platformCenterMeters(plat) {
    return Vec2((plat.x + plat.w / 2) / SCALE, (plat.y + plat.h / 2) / SCALE);
  }
  function createPlatformBody(plat) {
    const pos = platformCenterMeters(plat);
    const pBody = world.createBody({ position: pos });
    pBody.createFixture(Box(plat.w / 2 / SCALE, plat.h / 2 / SCALE), {
      friction: 0.35,
      restitution: 0.05,
      userData: { type: "platform", id: plat.id }
    });
    platformBodies[plat.id] = pBody;
  }
  function initPlatforms(G) {
    for (const body of Object.values(platformBodies)) {
      world.destroyBody(body);
    }
    platformBodies = {};
    const mapDef = getMap(G.currentMapId);
    G.platforms = mapDef.platforms.map((def) => ({
      id: def.id,
      x: def.x,
      y: def.y,
      w: def.w,
      h: def.h,
      health: PLATFORM_MAX_HEALTH,
      maxHealth: PLATFORM_MAX_HEALTH,
      broken: false,
      kind: def.kind,
      vx: def.kind === "elevator" ? def.vx : void 0,
      minX: def.kind === "elevator" ? def.minX : void 0,
      maxX: def.kind === "elevator" ? def.maxX : void 0
    }));
    for (const plat of G.platforms) {
      createPlatformBody(plat);
    }
  }
  function destroyCrateBody(id) {
    const body = crateBodies[id];
    if (body) {
      world.destroyBody(body);
      delete crateBodies[id];
    }
  }
  function destroyPickupBody(id) {
    const body = pickupBodies[id];
    if (body) {
      world.destroyBody(body);
      delete pickupBodies[id];
    }
  }
  function createPickupBody(pickup) {
    const body = world.createKinematicBody({
      position: Vec2(pickup.x / SCALE, pickup.y / SCALE)
    });
    body.createFixture(Circle(PICKUP_RADIUS / SCALE), {
      isSensor: true,
      userData: { type: "pickup", id: pickup.id }
    });
    pickupBodies[pickup.id] = body;
  }
  function getElevators(G) {
    return G.platforms.filter((p) => !p.broken && p.kind === "elevator");
  }
  function getRandomElevator(G, random) {
    const elevators = getElevators(G);
    if (!elevators.length) return null;
    return random.pick(elevators);
  }
  function findFallTargetY(G, x, fromY, excludePlatId, floorOnly = false) {
    if (floorOnly) return FLOOR_PICKUP_Y;
    let bestPlatY = FLOOR_Y;
    for (const plat of G.platforms) {
      if (plat.broken) continue;
      if (excludePlatId != null && plat.id === excludePlatId) continue;
      if (x < plat.x - 12 || x > plat.x + plat.w + 12) continue;
      const surfaceY = plat.y - 20;
      if (surfaceY <= fromY + 0.5) continue;
      if (plat.y < bestPlatY) bestPlatY = plat.y;
    }
    return bestPlatY - 20;
  }
  function pickupGoalY(G, pickup) {
    if (pickup.fallToFloor) return FLOOR_PICKUP_Y;
    return findFallTargetY(G, pickup.x, pickup.y + 0.5);
  }
  function pickupAffectedByPlatformBreak(pickup, plat) {
    if (pickup.onPlatformId === plat.id) return true;
    const padX = 24;
    if (pickup.x < plat.x - padX || pickup.x > plat.x + plat.w + padX) return false;
    return pickup.y <= plat.y + 24;
  }
  function fixOrphanedPickups(G) {
    for (const pickup of G.pickups) {
      if (pickup.fallToFloor) continue;
      if (pickup.y >= FLOOR_PICKUP_Y - 1) continue;
      if (findPlatformIdUnderPickup(G, pickup)) continue;
      if (pickup.onPlatformId != null) {
        const plat = G.platforms.find((p) => p.id === pickup.onPlatformId);
        if (!plat || plat.broken) {
          pickup.onPlatformId = void 0;
          pickup.fallToFloor = true;
          pickup.targetY = void 0;
        }
      }
    }
  }
  function pickupHasPlatformSupport(G, pickup) {
    if (pickup.fallToFloor) return false;
    if (pickup.y >= FLOOR_PICKUP_Y - 1) {
      pickup.y = FLOOR_PICKUP_Y;
      pickup.targetY = void 0;
      pickup.fallToFloor = false;
      return true;
    }
    return findPlatformIdUnderPickup(G, pickup) !== void 0;
  }
  function findPlatformIdUnderPickup(G, pickup) {
    for (const plat of G.platforms) {
      if (plat.broken) continue;
      if (pickup.x < plat.x - 12 || pickup.x > plat.x + plat.w + 12) continue;
      const surfaceY = plat.y - 20;
      if (pickup.y >= surfaceY - 2 && pickup.y <= surfaceY + 6) return plat.id;
    }
    return void 0;
  }
  function releasePickupsFromPlatform(G, _platId, plat) {
    for (const pickup of G.pickups) {
      if (!pickupAffectedByPlatformBreak(pickup, plat)) continue;
      pickup.onPlatformId = void 0;
      pickup.targetY = void 0;
      pickup.fallToFloor = true;
    }
  }
  function breakPlatform(G, id) {
    const plat = G.platforms.find((p) => p.id === id);
    if (!plat || plat.broken) return;
    plat.broken = true;
    plat.health = 0;
    releasePickupsFromPlatform(G, id, plat);
    const body = platformBodies[id];
    if (body) {
      world.destroyBody(body);
      delete platformBodies[id];
    }
    pendingHits.push({
      x: plat.x + plat.w / 2,
      y: plat.y + plat.h / 2,
      targetId: "",
      damage: 0
    });
  }
  function damagePlatform(G, id, damage, x, y) {
    const plat = G.platforms.find((p) => p.id === id);
    if (!plat || plat.broken) return;
    plat.health = Math.max(0, plat.health - damage);
    pendingHits.push({ x, y, targetId: "", damage: 0 });
    if (plat.health <= 0) {
      breakPlatform(G, id);
    }
  }
  function destroyCrate(G, id) {
    destroyCrateBody(id);
    const idx = G.crates.findIndex((c) => c.id === id);
    if (idx >= 0) G.crates.splice(idx, 1);
  }
  function damageCrate(G, id, damage, x, y) {
    const crate = G.crates.find((c) => c.id === id);
    if (!crate) return;
    crate.health = Math.max(0, crate.health - damage);
    pendingHits.push({ x, y, targetId: "", damage: 0 });
    if (crate.health <= 0) {
      destroyCrate(G, id);
    }
  }
  function removePickup(G, id) {
    destroyPickupBody(id);
    const idx = G.pickups.findIndex((p) => p.id === id);
    if (idx >= 0) G.pickups.splice(idx, 1);
  }
  function destroyBullet(G, bulletId) {
    const body = bulletBodies[bulletId];
    if (body) {
      world.destroyBody(body);
      delete bulletBodies[bulletId];
    }
    delete bulletBounceCounts[bulletId];
    const idx = G.bullets.findIndex((b) => b.id === bulletId);
    if (idx >= 0) G.bullets.splice(idx, 1);
  }
  function computeMuzzleMeters(torsoXpx, torsoYpx, aimAngle, facing, crouching, weaponId = "winchester") {
    const weapon = WEAPONS[weaponId];
    const drop = crouching ? STICK_CROUCH_DROP_PX : 0;
    const neckTop = torsoYpx - STICK_BODY_LEN_PX * 0.48 + drop * 0.2;
    if (weaponId === "bazooka") {
      const mountX = torsoXpx + facing * 3;
      const mountY = neckTop + 6;
      const tubeLen = weapon.barrelPx;
      return {
        x: (mountX + Math.cos(aimAngle) * tubeLen) / SCALE,
        y: (mountY + Math.sin(aimAngle) * tubeLen) / SCALE
      };
    }
    const shoulderX = torsoXpx + facing * 2.5;
    const shoulderY = neckTop + 2;
    const armReach = weaponId === "grenade" ? STICK_ARM_LEN_PX * 0.72 : STICK_ARM_LEN_PX;
    const handX = shoulderX + Math.cos(aimAngle) * armReach;
    const handY = shoulderY + Math.sin(aimAngle) * armReach;
    const muzzleDist = weapon.barrelPx + GUN_TIP_PX * 0.4;
    return {
      x: (handX + Math.cos(aimAngle) * muzzleDist) / SCALE,
      y: (handY + Math.sin(aimAngle) * muzzleDist) / SCALE
    };
  }
  function createPlayerPhysics(id, x, y) {
    const torso = world.createDynamicBody({
      position: Vec2(x / SCALE, y / SCALE),
      fixedRotation: true
    });
    torso.createFixture(Box(PLAYER_HALF_W, 0.78, Vec2(0, 0.28)), {
      density: 2,
      friction: 0.5,
      restitution: 0,
      userData: { type: "player", id }
    });
    const head = world.createBody({
      position: Vec2(x / SCALE, (y - HEAD_OFFSET) / SCALE)
    });
    head.createFixture(Circle(HEAD_RADIUS), {
      density: 1,
      friction: 0.6,
      restitution: 0,
      isSensor: true,
      userData: { type: "head", id }
    });
    playerBodies[id] = { torso, head };
    playerGrounded[id] = true;
    playerWallJumpUsed[id] = false;
    playerWallContact[id] = null;
    playerJumpGrace[id] = 0;
  }
  function destroyPlayerPhysics(id) {
    const bodies = playerBodies[id];
    if (!bodies) return;
    world.destroyBody(bodies.torso);
    world.destroyBody(bodies.head);
    delete playerBodies[id];
    delete playerGrounded[id];
    delete playerWallJumpUsed[id];
    delete playerWallContact[id];
    delete playerJumpGrace[id];
  }
  function feetPositionMeters(torso) {
    const pos = torso.getPosition();
    return Vec2(pos.x, pos.y + PLAYER_HALF_H);
  }
  function isStandableFixture(fixture, selfId) {
    const data = getFixtureData(fixture);
    const body = fixture.getBody();
    if (data?.type === "bullet" || data?.type === "pickup") return false;
    if (data?.type === "player" || data?.type === "head") {
      if (data.id === selfId) return false;
      return playerBodies[data.id] != null;
    }
    return isSolidSurface(data, body);
  }
  function raycastStandBelow(feetX, feetY, selfId, maxDist = 0.75) {
    const hit = { point: null };
    world.rayCast(
      Vec2(feetX, feetY - 0.4),
      Vec2(feetX, feetY + maxDist),
      (fixture, point) => {
        if (!isStandableFixture(fixture, selfId)) return 1;
        hit.point = point;
        return 0;
      }
    );
    return hit.point;
  }
  function feetOnSurface(feet, surfaceY) {
    const gap = surfaceY - feet.y;
    return gap >= -0.2 && gap <= GROUNDED_GAP;
  }
  function hasSupportContact(torso, selfId) {
    for (let edge = torso.getContactList(); edge; edge = edge.next) {
      const contact = edge.contact;
      if (!contact.isTouching()) continue;
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();
      const otherFixture = fixtureA.getBody() === torso ? fixtureB : fixtureA;
      if (fixtureA.getBody() !== torso && fixtureB.getBody() !== torso) continue;
      if (!isStandableFixture(otherFixture, selfId)) continue;
      contact.getWorldManifold(sharedWorldManifold);
      if (Math.abs(sharedWorldManifold.normal.y) > 0.1) return true;
    }
    return false;
  }
  function hasTopSupportContact(body, selfId) {
    for (let edge = body.getContactList(); edge; edge = edge.next) {
      const contact = edge.contact;
      if (!contact.isTouching()) continue;
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();
      const otherFixture = fixtureA.getBody() === body ? fixtureB : fixtureA;
      if (fixtureA.getBody() !== body && fixtureB.getBody() !== body) continue;
      if (!isStandableFixture(otherFixture, selfId)) continue;
      contact.getWorldManifold(sharedWorldManifold);
      const nx = sharedWorldManifold.normal.x;
      const ny = sharedWorldManifold.normal.y;
      if (Math.abs(ny) > 0.45 && Math.abs(nx) < 0.45) return true;
    }
    return false;
  }
  function canPerformStandingJump(id, torso, crouching) {
    if (crouching) return false;
    const vel = torso.getLinearVelocity();
    if (Math.abs(vel.y) > GROUNDED_VEL_Y) return false;
    if (hasTopSupportContact(torso, id) || hasTopSupportContact(playerBodies[id].head, id)) {
      return true;
    }
    const feet = feetPositionMeters(torso);
    const surfaceHit = raycastStandBelow(feet.x, feet.y, id, 0.85);
    if (surfaceHit !== null && feetOnSurface(feet, surfaceHit.y)) return true;
    return feet.y * SCALE >= FLOOR_Y - 14;
  }
  function measureGrounded(id, torso) {
    const vel = torso.getLinearVelocity();
    if (Math.abs(vel.y) > GROUNDED_VEL_Y) return false;
    if (hasSupportContact(torso, id)) return true;
    const feet = feetPositionMeters(torso);
    const surfaceHit = raycastStandBelow(feet.x, feet.y, id, 0.85);
    if (surfaceHit !== null && feetOnSurface(feet, surfaceHit.y)) return true;
    return feet.y * SCALE >= FLOOR_Y - 14;
  }
  function updatePlayerGroundedState() {
    for (const [id, bodies] of Object.entries(playerBodies)) {
      playerGrounded[id] = measureGrounded(id, bodies.torso);
    }
  }
  function isEntityOnPlatform(centerX, feetY, plat, tolerance = 10) {
    if (centerX < plat.x - 4 || centerX > plat.x + plat.w + 4) return false;
    return Math.abs(feetY - plat.y) <= tolerance;
  }
  function isPlayerOnPlatform(playerId, plat) {
    const bodies = playerBodies[playerId];
    if (!bodies || !measureGrounded(playerId, bodies.torso)) return false;
    const feet = feetPositionMeters(bodies.torso);
    return isEntityOnPlatform(feet.x * SCALE, feet.y * SCALE, plat);
  }
  function applyPlatformRiderDelta(G, plat, dx) {
    if (dx === 0) return;
    const dxM = dx / SCALE;
    for (const [id, bodies] of Object.entries(playerBodies)) {
      if (!isPlayerOnPlatform(id, plat)) continue;
      const torso = bodies.torso;
      const head = bodies.head;
      const tPos = torso.getPosition();
      const hPos = head.getPosition();
      const vel = torso.getLinearVelocity();
      torso.setTransform(Vec2(tPos.x + dxM, tPos.y), 0);
      head.setTransform(Vec2(hPos.x + dxM, hPos.y), head.getAngle());
      torso.setLinearVelocity(Vec2(vel.x + (plat.vx ?? 0) / SCALE, vel.y));
    }
    for (const crate of G.crates) {
      if (crate.onPlatformId !== plat.id) continue;
      const body = crateBodies[crate.id];
      if (!body) continue;
      const pos = body.getPosition();
      const vel = body.getLinearVelocity();
      body.setTransform(Vec2(pos.x + dxM, pos.y), 0);
      body.setLinearVelocity(Vec2(vel.x + (plat.vx ?? 0) / SCALE, vel.y));
      crate.x += dx;
    }
    for (const pickup of G.pickups) {
      if (pickup.onPlatformId !== plat.id) continue;
      pickup.x += dx;
      const body = pickupBodies[pickup.id];
      if (body) {
        body.setTransform(Vec2(pickup.x / SCALE, pickup.y / SCALE), 0);
      }
    }
  }
  function advancePlatformMotion(G) {
    const dt = PHYSICS_DT;
    for (const plat of G.platforms) {
      if (plat.broken || plat.kind !== "elevator" || plat.vx == null) continue;
      const prevX = plat.x;
      let newX = plat.x + plat.vx * dt;
      if (plat.minX != null && newX < plat.minX) {
        newX = plat.minX;
        plat.vx = Math.abs(plat.vx);
      }
      if (plat.maxX != null && newX > plat.maxX) {
        newX = plat.maxX;
        plat.vx = -Math.abs(plat.vx);
      }
      if (plat.ttlTicks != null) {
        plat.ttlTicks -= 1;
        if (plat.ttlTicks <= 0 || newX < -200 || newX > ARENA_W + 200) {
          breakPlatform(G, plat.id);
          continue;
        }
      }
      const dx = newX - prevX;
      plat.x = newX;
      const body = platformBodies[plat.id];
      if (body) {
        body.setTransform(platformCenterMeters(plat), 0);
      }
      applyPlatformRiderDelta(G, plat, dx);
    }
  }
  function snapPlayersToGround() {
    for (const [id, bodies] of Object.entries(playerBodies)) {
      const torso = bodies.torso;
      const vel = torso.getLinearVelocity();
      if (Math.abs(vel.y) > 12) continue;
      const feet = feetPositionMeters(torso);
      const surfaceHit = raycastStandBelow(feet.x, feet.y, id, 0.85);
      if (surfaceHit === null) continue;
      const targetTorsoY = surfaceHit.y - PLAYER_HALF_H - STAND_LIFT;
      const pos = torso.getPosition();
      const dy = targetTorsoY - pos.y;
      if (dy > -0.08 && dy < 0.35) {
        torso.setTransform(Vec2(pos.x, targetTorsoY), 0);
        if (Math.abs(vel.y) < 1.5) {
          torso.setLinearVelocity(Vec2(vel.x, 0));
        }
      }
    }
  }
  function isPlayerGrounded(id, torso) {
    return measureGrounded(id, torso);
  }
  function applyVerticalJump(torso, playerId, opts = {}) {
    torso.setAwake(true);
    const mass = torso.getMass();
    const horiz = opts.horizImpulse ?? 0;
    if (horiz !== 0) {
      torso.setLinearVelocity(Vec2(0, 0));
    } else {
      torso.setLinearVelocity(Vec2(opts.keepVx ?? 0, 0));
    }
    torso.applyLinearImpulse(
      Vec2(mass * horiz, -mass * JUMP_IMPULSE),
      torso.getWorldCenter(),
      true
    );
    playerJumpGrace[playerId] = 8;
  }
  function isWallLikeContact(otherFixture, selfId) {
    const data = getFixtureData(otherFixture);
    const body = otherFixture.getBody();
    if (data?.type === "bullet" || data?.type === "pickup") return false;
    if (data?.type === "player" || data?.type === "head") {
      if (data.id === selfId) return false;
      return playerBodies[data.id] != null;
    }
    return isSolidSurface(data, body);
  }
  function readSideContactNormal(contact, selfBody) {
    contact.getWorldManifold(sharedWorldManifold);
    const nx = sharedWorldManifold.normal.x;
    const ny = sharedWorldManifold.normal.y;
    if (Math.abs(nx) <= 0.5 || Math.abs(ny) >= 0.45) return null;
    return { nx, ny };
  }
  function scanBodyWallContact(body, selfId) {
    for (let edge = body.getContactList(); edge; edge = edge.next) {
      const contact = edge.contact;
      if (!contact.isTouching()) continue;
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();
      const otherFixture = fixtureA.getBody() === body ? fixtureB : fixtureA;
      if (fixtureA.getBody() !== body && fixtureB.getBody() !== body) continue;
      if (!isWallLikeContact(otherFixture, selfId)) continue;
      const side = readSideContactNormal(contact, body);
      if (side) return side;
    }
    return null;
  }
  function updatePlayerWallContacts() {
    for (const [id, bodies] of Object.entries(playerBodies)) {
      if (isPlayerGrounded(id, bodies.torso)) {
        playerWallJumpUsed[id] = false;
        playerWallContact[id] = null;
        continue;
      }
      playerWallContact[id] = scanBodyWallContact(bodies.torso, id) ?? scanBodyWallContact(bodies.head, id);
    }
  }
  function resolvePlayerSideStick() {
    for (const [id, bodies] of Object.entries(playerBodies)) {
      if (isPlayerGrounded(id, bodies.torso)) continue;
      if ((playerJumpGrace[id] ?? 0) > 0) continue;
      const torso = bodies.torso;
      const vel = torso.getLinearVelocity();
      if (vel.y < -2) continue;
      let adjusted = false;
      let slideVx = vel.x;
      let slideVy = vel.y;
      for (const body of [torso, bodies.head]) {
        for (let edge = body.getContactList(); edge; edge = edge.next) {
          const contact = edge.contact;
          if (!contact.isTouching()) continue;
          const fixtureA = contact.getFixtureA();
          const fixtureB = contact.getFixtureB();
          const otherFixture = fixtureA.getBody() === body ? fixtureB : fixtureA;
          if (fixtureA.getBody() !== body && fixtureB.getBody() !== body) continue;
          if (!isWallLikeContact(otherFixture, id)) continue;
          contact.getWorldManifold(sharedWorldManifold);
          const nx = sharedWorldManifold.normal.x;
          const ny = sharedWorldManifold.normal.y;
          if (Math.abs(nx) > 0.5 && Math.abs(ny) < 0.45) {
            slideVx *= 0.2;
            if (vel.y >= 0) slideVy = Math.max(slideVy, 5);
            adjusted = true;
            continue;
          }
          if (ny > 0.55 && vel.y >= 0 && vel.y < 2) {
            slideVy = Math.max(slideVy, 5);
            slideVx *= 0.7;
            adjusted = true;
          }
        }
      }
      if (adjusted) {
        torso.setLinearVelocity(Vec2(slideVx, slideVy));
      }
    }
    for (const id of Object.keys(playerJumpGrace)) {
      if (playerJumpGrace[id] > 0) playerJumpGrace[id]--;
    }
  }
  function syncStateFromPhysics(G) {
    for (const [id, p] of Object.entries(G.players)) {
      const bodies = playerBodies[id];
      if (bodies) {
        bodies.torso.setAngle(0);
        bodies.head.setAngle(0);
        const tPos = bodies.torso.getPosition();
        const hPos = bodies.head.getPosition();
        p.torso = { x: tPos.x * SCALE, y: tPos.y * SCALE, angle: 0 };
        p.head = { x: hPos.x * SCALE, y: hPos.y * SCALE, angle: 0 };
      }
    }
    for (const b of G.bullets) {
      const body = bulletBodies[b.id];
      if (body) {
        const pos = body.getPosition();
        b.body = { x: pos.x * SCALE, y: pos.y * SCALE, angle: body.getAngle() };
      }
    }
    for (const crate of G.crates) {
      const body = crateBodies[crate.id];
      if (body) {
        const pos = body.getPosition();
        crate.x = pos.x * SCALE - crate.w / 2;
        crate.y = pos.y * SCALE - crate.h / 2;
      }
    }
  }
  function queueExplosion(x, y, radius, damage, owner) {
    pendingExplosions.push({ x, y, radius, damage, owner });
  }
  function processExplosions(G) {
    for (const ex of pendingExplosions) {
      pendingHits.push({ x: ex.x, y: ex.y, targetId: "", damage: 0 });
      for (const [id, p] of Object.entries(G.players)) {
        if (p.health <= 0 || !playerBodies[id]) continue;
        if (!canDamage(G, ex.owner, id)) continue;
        const tPos = playerBodies[id].torso.getPosition();
        const dx = tPos.x * SCALE - ex.x;
        const dy = tPos.y * SCALE - ex.y;
        if (Math.hypot(dx, dy) <= ex.radius) {
          pendingHits.push({ x: ex.x, y: ex.y, targetId: id, damage: ex.damage });
        }
      }
      for (const crate of [...G.crates]) {
        const cx = crate.x + crate.w / 2;
        const cy = crate.y + crate.h / 2;
        if (Math.hypot(cx - ex.x, cy - ex.y) <= ex.radius) {
          damageCrate(G, crate.id, ex.damage, ex.x, ex.y);
        }
      }
    }
    pendingExplosions.length = 0;
  }
  function getKatanaSwingOffsets(progress) {
    if (progress < 0.25) {
      const w = progress / 0.25;
      return { aimOffset: -0.75 * w, armReach: -6 * w };
    }
    if (progress < 0.7) {
      const s = (progress - 0.25) / 0.45;
      return { aimOffset: -0.75 + 1.35 * s, armReach: -6 + 14 * s };
    }
    const r = (progress - 0.7) / 0.3;
    return { aimOffset: 0.6 * (1 - r), armReach: 8 * (1 - r) };
  }
  function computeKatanaBladeSegment(torsoX, torsoY, aimAngle, facing, swingProgress) {
    const drop = 0;
    const neckTop = torsoY - STICK_BODY_LEN_PX * 0.48 + drop * 0.2;
    const shoulderX = torsoX + facing * 2.5;
    const shoulderY = neckTop + 2;
    const swing = getKatanaSwingOffsets(swingProgress);
    const aim = aimAngle + swing.aimOffset * facing;
    const reach = STICK_ARM_LEN_PX + 4 + swing.armReach;
    const handX = shoulderX + Math.cos(aim) * reach;
    const handY = shoulderY + Math.sin(aim) * reach;
    const barrel = WEAPONS.katana.barrelPx;
    const tipLen = barrel + 10;
    return {
      x1: handX,
      y1: handY,
      x2: handX + Math.cos(aim) * tipLen,
      y2: handY + Math.sin(aim) * tipLen
    };
  }
  function distPointToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq < 1e-3) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + dx * t), py - (y1 + dy * t));
  }
  function resolveMeleeSwingHits(G, playerId, aimAngle, facing, weapon) {
    const bodies = playerBodies[playerId];
    if (!bodies) return;
    const hitIds = [];
    for (const progress of KATANA_SWING_HIT_SAMPLES) {
      const tPos = bodies.torso.getPosition();
      const blade = computeKatanaBladeSegment(
        tPos.x * SCALE,
        tPos.y * SCALE,
        aimAngle,
        facing,
        progress
      );
      for (const [targetId, target] of Object.entries(G.players)) {
        if (targetId === playerId || target.health <= 0 || !playerBodies[targetId]) continue;
        if (!canDamage(G, playerId, targetId)) continue;
        if (hitIds.includes(targetId)) continue;
        const targetBodies = playerBodies[targetId];
        const torsoPos = targetBodies.torso.getPosition();
        const headPos = targetBodies.head.getPosition();
        const hitPoints = [
          [torsoPos.x * SCALE, torsoPos.y * SCALE],
          [headPos.x * SCALE, headPos.y * SCALE]
        ];
        let hit = false;
        for (const [tx, ty] of hitPoints) {
          const dist = distPointToSegment(tx, ty, blade.x1, blade.y1, blade.x2, blade.y2);
          if (dist <= KATANA_BLADE_HIT_RADIUS) {
            hit = true;
            break;
          }
        }
        if (!hit) continue;
        hitIds.push(targetId);
        pendingHits.push({
          x: torsoPos.x * SCALE,
          y: torsoPos.y * SCALE,
          targetId,
          damage: weapon.damage
        });
      }
    }
  }
  function spawnProjectile(G, owner, weaponId, weapon, startX, startY, shotAngle) {
    const bulletId = G.nextBulletId++;
    const kind = weapon.kind === "rocket" ? "rocket" : weapon.kind === "grenade" ? "grenade" : weapon.pelletCount && weapon.pelletCount > 1 ? "pellet" : "bullet";
    const bBody = world.createDynamicBody({
      position: Vec2(startX, startY),
      bullet: true,
      gravityScale: weapon.gravityScale ?? BULLET_GRAVITY_SCALE
    });
    const radius = kind === "rocket" ? 0.11 : kind === "grenade" ? 0.09 : kind === "pellet" ? 0.05 : 0.07;
    bBody.createFixture(Circle(radius), {
      density: 5,
      restitution: kind === "grenade" ? 0.45 : 0.55,
      friction: 0.05,
      userData: { type: "bullet", id: bulletId, owner }
    });
    const speed = weapon.speed || BULLET_SPEED;
    bBody.setBallisticVelocity(
      Vec2(Math.cos(shotAngle) * speed, Math.sin(shotAngle) * speed)
    );
    bulletBodies[bulletId] = bBody;
    G.bullets.push({
      id: bulletId,
      owner,
      body: { x: startX * SCALE, y: startY * SCALE, angle: shotAngle },
      kind,
      weaponId,
      damage: weapon.damage,
      aoeRadius: weapon.aoeRadius,
      fuseTicks: weapon.fuseTicks
    });
  }
  function applyRecoil(torso, aimAngle, onGround, crouching, weaponId) {
    const mass = torso.getMass();
    const weaponScale = weaponId === "bazooka" ? 1.35 : weaponId === "sniper" ? 1.15 : weaponId === "winchester_shotgun" ? 0.85 : 1;
    let impulseMag = JUMP_IMPULSE * Math.sqrt(RECOIL_HEIGHT_OF_JUMP) * weaponScale;
    if (crouching && onGround) impulseMag *= 0.45;
    const ix = -Math.cos(aimAngle) * mass * impulseMag;
    const iy = -Math.sin(aimAngle) * mass * impulseMag;
    torso.setAwake(true);
    torso.applyLinearImpulse(Vec2(ix, iy), torso.getWorldCenter(), true);
  }
  function getPickupCollectY(pickup) {
    const body = pickupBodies[pickup.id];
    if (!body) return pickup.y;
    const bodyY = body.getPosition().y * SCALE;
    return Math.max(pickup.y, bodyY);
  }
  function isFloorCollectiblePickup(pickup, collectY, feetY) {
    if (collectY >= FLOOR_PICKUP_Y - 4) return true;
    if (!pickup.fallToFloor || feetY < FLOOR_Y - 28) return false;
    return collectY >= FLOOR_PICKUP_Y - 72;
  }
  function defaultOwnedWeapons() {
    return [START_WEAPON];
  }
  function playerOwnsWeapon(p, weaponId) {
    return p.ownedWeapons.includes(weaponId);
  }
  function addOwnedWeapon(p, weaponId) {
    if (!playerOwnsWeapon(p, weaponId)) {
      p.ownedWeapons.push(weaponId);
    }
  }
  function cycleOwnedWeapon(p) {
    const owned = WEAPON_ORDER.filter((w) => playerOwnsWeapon(p, w));
    if (owned.length <= 1) return;
    const idx = owned.indexOf(p.currentWeapon);
    p.currentWeapon = owned[(idx + 1) % owned.length] ?? p.currentWeapon;
  }
  function applyPickupToPlayer(G, playerId, pickup) {
    const p = G.players[playerId];
    if (!p || p.health <= 0) return false;
    if (!G.pickups.some((pu) => pu.id === pickup.id)) return false;
    if (pickup.kind === "health") {
      p.health = Math.min(MAX_HEALTH, p.health + HEALTH_PICKUP_AMOUNT);
    } else if (pickup.kind === "weapon" && pickup.weaponId) {
      addOwnedWeapon(p, pickup.weaponId);
      p.currentWeapon = pickup.weaponId;
    }
    pendingHits.push({ x: pickup.x, y: pickup.y, targetId: "", damage: 0 });
    removePickup(G, pickup.id);
    return true;
  }
  function canPlayerCollectPickup(px, py, headX, headY, feetY, pickup) {
    const collectY = getPickupCollectY(pickup);
    const playerHalfW = PLAYER_HALF_W * SCALE;
    const hPad = PICKUP_RADIUS + playerHalfW + 16;
    const nearX = Math.abs(pickup.x - px) <= hPad || Math.abs(pickup.x - headX) <= hPad || Math.abs(pickup.x - (px + headX) * 0.5) <= hPad;
    if (!nearX) return false;
    if (isFloorCollectiblePickup(pickup, collectY, feetY)) return true;
    const pTop = headY - HEAD_RADIUS * SCALE - 8;
    const pBottom = feetY + 10;
    const kTop = collectY - PICKUP_RADIUS - 8;
    const kBottom = collectY + PICKUP_RADIUS + 8;
    if (pTop <= kBottom && pBottom >= kTop) return true;
    return Math.hypot(pickup.x - px, collectY - py) <= PICKUP_RADIUS + 34;
  }
  function pickupBodyOverlapsPlayer(bodies, pickupId) {
    const pickBody = pickupBodies[pickupId];
    if (!pickBody) return false;
    return testBodyOverlap(bodies.torso, pickBody) || testBodyOverlap(bodies.head, pickBody);
  }
  function collectPickupsForPlayers(G) {
    for (const [playerId, bodies] of Object.entries(playerBodies)) {
      const p = G.players[playerId];
      if (!p || p.health <= 0) continue;
      const tPos = bodies.torso.getPosition();
      const hPos = bodies.head.getPosition();
      const px = tPos.x * SCALE;
      const py = tPos.y * SCALE;
      const headX = hPos.x * SCALE;
      const headY = hPos.y * SCALE;
      const feetY = py + FEET_PIXELS;
      for (const pickup of [...G.pickups]) {
        const overlaps = canPlayerCollectPickup(px, py, headX, headY, feetY, pickup) || pickupBodyOverlapsPlayer(bodies, pickup.id);
        if (!overlaps) continue;
        applyPickupToPlayer(G, playerId, pickup);
      }
    }
  }
  function handleContactPickupCollection(G, contact) {
    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const dataA = getFixtureData(fixtureA);
    const dataB = getFixtureData(fixtureB);
    const pickupData = dataA?.type === "pickup" ? dataA : dataB?.type === "pickup" ? dataB : null;
    if (!pickupData) return;
    const otherData = pickupData === dataA ? dataB : dataA;
    if (otherData?.type !== "player" && otherData?.type !== "head") return;
    const pickup = G.pickups.find((p) => p.id === pickupData.id);
    if (!pickup) return;
    applyPickupToPlayer(G, otherData.id, pickup);
  }
  function updatePickupDrops(G) {
    for (const pickup of G.pickups) {
      if (pickupHasPlatformSupport(G, pickup)) {
        pickup.targetY = void 0;
        pickup.onPlatformId = findPlatformIdUnderPickup(G, pickup);
        const body2 = pickupBodies[pickup.id];
        if (body2) {
          body2.setTransform(Vec2(pickup.x / SCALE, pickup.y / SCALE), 0);
        }
        continue;
      }
      pickup.onPlatformId = void 0;
      const goal = pickupGoalY(G, pickup);
      if (pickup.y < goal - 0.5) {
        pickup.y = Math.min(goal, pickup.y + PICKUP_FALL_SPEED);
        pickup.targetY = goal;
      } else {
        pickup.y = goal;
        pickup.targetY = void 0;
        if (pickup.fallToFloor && goal >= FLOOR_PICKUP_Y - 1) {
          pickup.fallToFloor = false;
        }
        const platId = findPlatformIdUnderPickup(G, pickup);
        if (platId != null) pickup.onPlatformId = platId;
      }
      const body = pickupBodies[pickup.id];
      if (body) {
        body.setTransform(Vec2(pickup.x / SCALE, pickup.y / SCALE), 0);
      }
    }
  }
  function spawnPickupOnPlatform(G, plat, random) {
    const id = G.nextPickupId++;
    const kind = random.float() < 0.5 ? "health" : "weapon";
    const targetY = plat.y - 20;
    const pickup = {
      id,
      kind,
      x: plat.x + plat.w / 2,
      y: kind === "weapon" ? plat.y - 58 : targetY,
      targetY: kind === "weapon" ? targetY : void 0,
      onPlatformId: plat.id
    };
    if (kind === "weapon") {
      pickup.weaponId = random.pick(WEAPON_ORDER);
    }
    G.pickups.push(pickup);
    createPickupBody(pickup);
  }
  function spawnIncomingElevator(G, random) {
    const fromLeft = random.bool();
    const mapDef = getMap(G.currentMapId);
    const yChoices = mapDef.elevatorYLevels;
    const y = yChoices.length ? random.pick(yChoices) : 273;
    const id = G.nextPlatformId++;
    const w = 100;
    const x = fromLeft ? -140 : ARENA_W + 40;
    const vx = fromLeft ? 27 : -27;
    const plat = {
      id,
      x,
      y,
      w,
      h: 12,
      health: PLATFORM_MAX_HEALTH,
      maxHealth: PLATFORM_MAX_HEALTH,
      broken: false,
      kind: "elevator",
      vx,
      minX: fromLeft ? -160 : ARENA_W - 260,
      maxX: fromLeft ? ARENA_W - 260 : ARENA_W + 160,
      ttlTicks: ELEVATOR_TTL_TICKS
    };
    G.platforms.push(plat);
    createPlatformBody(plat);
  }
  function runSpawnCycle(G, random) {
    G.spawnTick += 1;
    if (G.spawnTick % SPAWN_INTERVAL_TICKS !== 0) return;
    spawnIncomingElevator(G, random);
    const elev = getRandomElevator(G, random);
    if (elev) {
      spawnPickupOnPlatform(G, elev, random);
      if (random.float() > 0.4) {
        const elev2 = getRandomElevator(G, random);
        if (elev2) spawnPickupOnPlatform(G, elev2, random);
      }
    }
  }
  function processPendingHits(G) {
    for (const hit of pendingHits) {
      if (!hit.targetId) {
        if (hit.damage === 0) G.hitEvents.push(hit);
        continue;
      }
      const target = G.players[hit.targetId];
      if (!target) continue;
      if (target.health <= 0) {
        destroyPlayerPhysics(hit.targetId);
        continue;
      }
      target.health = Math.max(0, target.health - hit.damage);
      G.hitEvents.push(hit);
      if (target.health <= 0) {
        destroyPlayerPhysics(hit.targetId);
      }
    }
    pendingHits.length = 0;
    for (const hit of pendingPlatformDamages) {
      damagePlatform(G, hit.id, hit.damage, hit.x, hit.y);
    }
    pendingPlatformDamages.length = 0;
    for (const hit of pendingCrateDamages) {
      damageCrate(G, hit.id, hit.damage, hit.x, hit.y);
    }
    pendingCrateDamages.length = 0;
    for (const bulletId of pendingBulletDestroys) {
      destroyBullet(G, bulletId);
    }
    pendingBulletDestroys.clear();
  }
  function handleProjectileImpacts(G) {
    for (const b of [...G.bullets]) {
      const body = bulletBodies[b.id];
      if (!body) continue;
      if (b.kind === "rocket" || b.kind === "grenade") {
        for (let edge = body.getContactList(); edge; edge = edge.next) {
          const edgeContact = edge.contact;
          if (!edgeContact.isTouching()) continue;
          const fixtureA = edgeContact.getFixtureA();
          const fixtureB = edgeContact.getFixtureB();
          const otherFixture = fixtureA.getBody() === body ? fixtureB : fixtureA;
          const otherData = getFixtureData(otherFixture);
          if (otherData?.type === "player" || otherData?.type === "head" || otherData?.type === "platform" || otherData?.type === "crate" || otherData?.type === "ground") {
            const pos = body.getPosition();
            queueExplosion(
              pos.x * SCALE,
              pos.y * SCALE,
              b.aoeRadius ?? 70,
              b.damage,
              b.owner
            );
            pendingBulletDestroys.add(b.id);
            break;
          }
        }
      }
      if (b.fuseTicks != null) {
        b.fuseTicks -= 1;
        if (b.fuseTicks <= 0) {
          const pos = body.getPosition();
          queueExplosion(pos.x * SCALE, pos.y * SCALE, b.aoeRadius ?? 70, b.damage, b.owner);
          pendingBulletDestroys.add(b.id);
        }
      }
    }
  }
  function getContactHitPointPx(contact) {
    contact.getWorldManifold(sharedWorldManifold);
    if (sharedWorldManifold.pointCount > 0) {
      const p = sharedWorldManifold.points[0];
      return { x: p.x * SCALE, y: p.y * SCALE };
    }
    return null;
  }
  function isHeadshotHit(targetId, hitX, hitY) {
    const bodies = playerBodies[targetId];
    if (!bodies) return false;
    const hPos = bodies.head.getPosition();
    const hx = hPos.x * SCALE;
    const hy = hPos.y * SCALE;
    return Math.hypot(hitX - hx, hitY - hy) <= HEAD_HIT_RADIUS_PX;
  }
  function bulletHitsHeadZone(targetId, bulletBody) {
    const bodies = playerBodies[targetId];
    if (!bodies) return false;
    const pos = bulletBody.getPosition();
    const vel = bulletBody.getLinearVelocity();
    const bx = pos.x * SCALE;
    const by = pos.y * SCALE;
    if (isHeadshotHit(targetId, bx, by)) return true;
    const speed = Math.hypot(vel.x, vel.y);
    if (speed < 0.01) return false;
    const hPos = bodies.head.getPosition();
    const hx = hPos.x * SCALE;
    const hy = hPos.y * SCALE;
    const nx = vel.x / speed;
    const ny = vel.y / speed;
    const backPx = 88;
    const fwdPx = 14;
    const x1 = bx - nx * backPx;
    const y1 = by - ny * backPx;
    const x2 = bx + nx * fwdPx;
    const y2 = by + ny * fwdPx;
    if (distPointToSegment(hx, hy, x1, y1, x2, y2) <= HEAD_HIT_RADIUS_PX + 2) {
      return true;
    }
    const torsoPos = bodies.torso.getPosition();
    const tx = torsoPos.x * SCALE;
    const ty = torsoPos.y * SCALE;
    const toHeadX = hx - tx;
    const toHeadY = hy - ty;
    const toHeadLen = Math.hypot(toHeadX, toHeadY) || 1;
    const aimDot = (nx * toHeadX + ny * toHeadY) / toHeadLen;
    const closeRange = Math.hypot(bx - hx, by - hy) <= HEAD_HIT_RADIUS_PX + PLAYER_HALF_W * SCALE + 18;
    return closeRange && aimDot > 0.55;
  }
  function headHitPointPx(targetId) {
    const bodies = playerBodies[targetId];
    if (!bodies) return null;
    const hPos = bodies.head.getPosition();
    return { x: hPos.x * SCALE, y: hPos.y * SCALE };
  }
  function resolveBulletPlayerDamage(targetId, hitPart, bulletBody, contactPx, bulletDamage) {
    const headshot = hitPart === "head" || bulletHitsHeadZone(targetId, bulletBody) || contactPx != null && isHeadshotHit(targetId, contactPx.x, contactPx.y);
    if (headshot) {
      return {
        damage: HEADSHOT_DAMAGE,
        isHeadshot: true
      };
    }
    return { damage: BODY_BULLET_DAMAGE, isHeadshot: false };
  }
  function handleContactWithBulletDamage(G, contact) {
    const contactId = contact.getId();
    if (handledBulletContactsThisStep.has(contactId)) return;
    handledBulletContactsThisStep.add(contactId);
    const fixtureA = contact.getFixtureA();
    const fixtureB = contact.getFixtureB();
    const dataA = getFixtureData(fixtureA);
    const dataB = getFixtureData(fixtureB);
    const bulletData = dataA?.type === "bullet" ? dataA : dataB?.type === "bullet" ? dataB : null;
    if (!bulletData) return;
    if (pendingBulletDestroys.has(bulletData.id)) return;
    const bullet = G.bullets.find((b) => b.id === bulletData.id);
    const bulletDamage = bullet?.damage ?? BULLET_DAMAGE;
    const bulletKind = bullet?.kind ?? "bullet";
    const aoeRadius = bullet?.aoeRadius;
    const owner = bullet?.owner ?? bulletData.owner;
    const otherData = bulletData === dataA ? dataB : dataA;
    const bulletBody = bulletData === dataA ? fixtureA.getBody() : fixtureB.getBody();
    const bulletPos = bulletBody.getPosition();
    if (otherData?.type === "player" || otherData?.type === "head") {
      if (otherData.id === owner) return;
      const target = G.players[otherData.id];
      if (!target || target.health <= 0) return;
      if (G.roundPhase !== "playing") return;
      if (!canDamage(G, owner, otherData.id)) return;
      if (!playerBodies[otherData.id]) return;
      if (handledBulletPlayerHitsThisStep.has(String(bulletData.id))) return;
      handledBulletPlayerHitsThisStep.add(String(bulletData.id));
      pendingBulletDestroys.add(bulletData.id);
      const contactPoint = getContactHitPointPx(contact);
      const bulletPxX = bulletPos.x * SCALE;
      const bulletPxY = bulletPos.y * SCALE;
      const { damage, isHeadshot } = resolveBulletPlayerDamage(
        otherData.id,
        otherData.type,
        bulletBody,
        contactPoint,
        bulletDamage
      );
      const headPoint = isHeadshot ? headHitPointPx(otherData.id) : null;
      pendingHits.push({
        x: headPoint?.x ?? contactPoint?.x ?? bulletPxX,
        y: headPoint?.y ?? contactPoint?.y ?? bulletPxY,
        targetId: otherData.id,
        damage,
        isHeadshot
      });
      return;
    }
    if (otherData?.type === "crate") {
      pendingBulletDestroys.add(bulletData.id);
      pendingCrateDamages.push({
        id: otherData.id,
        damage: bulletDamage,
        x: bulletPos.x * SCALE,
        y: bulletPos.y * SCALE
      });
      return;
    }
    if (otherData?.type === "platform") {
      pendingBulletDestroys.add(bulletData.id);
      pendingPlatformDamages.push({
        id: otherData.id,
        damage: bulletDamage,
        x: bulletPos.x * SCALE,
        y: bulletPos.y * SCALE
      });
      return;
    }
    if (otherData?.type === "ground") {
      if (bulletKind === "rocket" || bulletKind === "grenade") {
        queueExplosion(bulletPos.x * SCALE, bulletPos.y * SCALE, aoeRadius ?? 70, bulletDamage, owner);
        pendingBulletDestroys.add(bulletData.id);
        return;
      }
      if (handledBulletWallBounceThisStep.has(bulletData.id)) return;
      handledBulletWallBounceThisStep.add(bulletData.id);
      const bounces = bulletBounceCounts[bulletData.id] ?? 0;
      pendingHits.push({
        x: bulletPos.x * SCALE,
        y: bulletPos.y * SCALE,
        targetId: "",
        damage: 0
      });
      if (bounces >= MAX_BULLET_BOUNCES) {
        pendingBulletDestroys.add(bulletData.id);
        return;
      }
      bulletBounceCounts[bulletData.id] = bounces + 1;
      const vel = bulletBody.getLinearVelocity();
      contact.getWorldManifold(sharedWorldManifold);
      let nx = sharedWorldManifold.normal.x;
      let ny = sharedWorldManifold.normal.y;
      if (Math.hypot(nx, ny) < 0.01) {
        nx = 0;
        ny = bulletPos.y * SCALE >= FLOOR_Y - 2 ? -1 : 1;
      }
      const dot = vel.x * nx + vel.y * ny;
      if (dot > 0) {
        nx = -nx;
        ny = -ny;
      }
      const reflectDot = vel.x * nx + vel.y * ny;
      const speed = Math.hypot(vel.x, vel.y);
      const bounce = speed > 28 ? 0.72 : speed > 12 ? 0.58 : 0.42;
      const rvx = (vel.x - 2 * reflectDot * nx) * bounce;
      const rvy = (vel.y - 2 * reflectDot * ny) * bounce;
      bulletBody.setBallisticVelocity(Vec2(rvx, rvy));
      const pos = bulletBody.getPosition();
      bulletBody.setTransform(
        Vec2(pos.x - nx * 0.06, pos.y - ny * 0.06),
        bulletBody.getAngle()
      );
    }
  }
  function applyMovementInput(G, playerId, random) {
    const p = G.players[playerId];
    const bodies = playerBodies[playerId];
    if (!p || !bodies || p.health <= 0 || !p.input) return;
    const data = p.input;
    const torso = bodies.torso;
    torso.setAwake(true);
    const vel = torso.getLinearVelocity();
    const crouching = data.crouching === true || data.action === "crouch";
    const grounded = isPlayerGrounded(playerId, torso);
    p.crouching = crouching && grounded;
    const speedMul = p.crouching ? 0.45 : 1;
    if (data.action === "left") {
      torso.setLinearVelocity(Vec2(-MOVE_SPEED * speedMul, torso.getLinearVelocity().y));
    } else if (data.action === "right") {
      torso.setLinearVelocity(Vec2(MOVE_SPEED * speedMul, torso.getLinearVelocity().y));
    } else if (data.action === "crouch" || crouching && !data.action) {
      torso.setLinearVelocity(Vec2(torso.getLinearVelocity().x * 0.35, torso.getLinearVelocity().y));
    } else {
      torso.setLinearVelocity(Vec2(0, torso.getLinearVelocity().y));
    }
    if (data.jumping) {
      const wall = playerWallContact[playerId];
      const standingJump = canPerformStandingJump(playerId, torso, p.crouching);
      if (standingJump) {
        applyVerticalJump(torso, playerId, { keepVx: torso.getLinearVelocity().x });
        playerGrounded[playerId] = false;
        playerWallJumpUsed[playerId] = false;
      } else if (wall && !playerWallJumpUsed[playerId]) {
        const awayX = wall.nx >= 0 ? 1 : -1;
        applyVerticalJump(torso, playerId, { horizImpulse: WALL_JUMP_IMPULSE_X * awayX });
        playerGrounded[playerId] = false;
        playerWallJumpUsed[playerId] = true;
      }
      data.jumping = false;
    }
    if (data.shooting) {
      fireWeapon(G, playerId, data.aimAngle, data.facing, random);
    }
    if (data.action !== "left" && data.action !== "right" && data.action !== "crouch" && !(crouching && !data.action)) {
      const vy = torso.getLinearVelocity().y;
      if (Math.abs(torso.getLinearVelocity().x) > 0.05) {
        torso.setLinearVelocity(Vec2(0, vy));
      }
    }
  }
  function syncHeadBodiesFromTorso() {
    for (const [, bodies] of Object.entries(playerBodies)) {
      const tPos = bodies.torso.getPosition();
      bodies.head.setTransform(
        Vec2(tPos.x, tPos.y - HEAD_OFFSET / SCALE),
        0
      );
    }
  }
  function advanceWorld(G, random) {
    setCurrentG(G);
    G.hitEvents = [];
    G.worldTick += 1;
    if (G.roundPhase === "playing") {
      handledBulletContactsThisStep.clear();
      handledBulletPlayerHitsThisStep.clear();
      handledBulletWallBounceThisStep.clear();
      runSpawnCycle(G, random);
      advancePlatformMotion(G);
      updatePickupDrops(G);
      syncHeadBodiesFromTorso();
      world.step(PHYSICS_DT);
      syncHeadBodiesFromTorso();
      updatePlayerGroundedState();
      updatePlayerWallContacts();
      resolvePlayerSideStick();
      snapPlayersToGround();
      handleProjectileImpacts(G);
      processExplosions(G);
      processPendingHits(G);
      fixOrphanedPickups(G);
      updatePickupDrops(G);
      collectPickupsForPlayers(G);
      for (let i = G.bullets.length - 1; i >= 0; i--) {
        const b = G.bullets[i];
        const body = bulletBodies[b.id];
        if (body) {
          const pos = body.getPosition();
          if (pos.x * SCALE < -20 || pos.x * SCALE > ARENA_W + 20 || pos.y * SCALE > ARENA_H + 20 || pos.y * SCALE < -20) {
            destroyBullet(G, b.id);
          }
        }
      }
      syncStateFromPhysics(G);
      checkRoundEnd(G);
    }
  }
  function resetRound(G) {
    for (const [, b] of Object.entries(playerBodies)) {
      world.destroyBody(b.torso);
      world.destroyBody(b.head);
    }
    for (const b of Object.values(bulletBodies)) {
      world.destroyBody(b);
    }
    for (const b of Object.values(crateBodies)) {
      world.destroyBody(b);
    }
    for (const b of Object.values(pickupBodies)) {
      world.destroyBody(b);
    }
    for (const b of Object.values(platformBodies)) {
      world.destroyBody(b);
    }
    playerBodies = {};
    platformBodies = {};
    crateBodies = {};
    pickupBodies = {};
    bulletBodies = {};
    bulletBounceCounts = {};
    handledBulletContactsThisStep.clear();
    handledBulletPlayerHitsThisStep.clear();
    handledBulletWallBounceThisStep.clear();
    playerGrounded = {};
    playerWallJumpUsed = {};
    playerWallContact = {};
    playerJumpGrace = {};
    G.bullets = [];
    G.crates = [];
    G.pickups = [];
    G.hitEvents = [];
    G.spawnTick = 0;
    G.worldTick = 0;
    pendingHits.length = 0;
    pendingPlatformDamages.length = 0;
    pendingCrateDamages.length = 0;
    pendingExplosions.length = 0;
    pendingBulletDestroys.clear();
    initPlatforms(G);
    const mapDef = getMap(G.currentMapId);
    const spawns = mapDef.spawns;
    let index = 0;
    for (const [id, p] of Object.entries(G.players)) {
      const spawn = spawnOnFloor(spawns[index % spawns.length]);
      p.health = MAX_HEALTH;
      p.crouching = false;
      p.currentWeapon = START_WEAPON;
      p.ownedWeapons = defaultOwnedWeapons();
      p.lastFireTick = 0;
      p.input = {
        action: null,
        jumping: false,
        aimAngle: p.aimAngle,
        facing: p.facing,
        crouching: false,
        shooting: false
      };
      createPlayerPhysics(id, spawn.x, spawn.y);
      index++;
    }
    syncStateFromPhysics(G);
  }
  function countActiveProjectiles(G, owner, weaponId) {
    return G.bullets.filter((b) => b.owner === owner && b.weaponId === weaponId).length;
  }
  function fireWeapon(G, playerId, aimAngle, facing, random) {
    const p = G.players[playerId];
    const bodies = playerBodies[playerId];
    if (!p || !bodies || p.health <= 0) return false;
    const weaponId = p.currentWeapon;
    const weapon = WEAPONS[weaponId];
    if (!weapon) return false;
    if (p.lastFireTick >= 0 && G.worldTick - p.lastFireTick < weapon.fireRateTicks) return false;
    if (weapon.kind === "melee") {
      const torso2 = bodies.torso;
      const onGround2 = isPlayerGrounded(playerId, torso2);
      applyRecoil(torso2, aimAngle, onGround2, p.crouching, weaponId);
      resolveMeleeSwingHits(G, playerId, aimAngle, facing, weapon);
      p.lastFireTick = G.worldTick;
      return true;
    }
    const pellets = weapon.pelletCount ?? 1;
    const activeCount = G.bullets.filter((b) => b.owner === playerId).length;
    if (activeCount + pellets > weapon.maxActive) {
      if (activeCount >= weapon.maxActive) return false;
    }
    const weaponActive = countActiveProjectiles(G, playerId, weaponId);
    if (weaponActive >= weapon.maxActive) return false;
    const torso = bodies.torso;
    const tPos = torso.getPosition();
    const onGround = isPlayerGrounded(playerId, torso);
    applyRecoil(torso, aimAngle, onGround, p.crouching, weaponId);
    const muzzle = computeMuzzleMeters(
      tPos.x * SCALE,
      tPos.y * SCALE,
      aimAngle,
      facing,
      p.crouching,
      weaponId
    );
    const spawnPad = 0.38;
    for (let i = 0; i < pellets; i++) {
      if (G.bullets.filter((b) => b.owner === playerId).length >= weapon.maxActive) break;
      const spread = (random.float() - 0.5) * weapon.spread * 2;
      const shotAngle = aimAngle + spread;
      const startX = muzzle.x + Math.cos(shotAngle) * spawnPad;
      const startY = muzzle.y + Math.sin(shotAngle) * spawnPad;
      spawnProjectile(G, playerId, weaponId, weapon, startX, startY, shotAngle);
    }
    p.lastFireTick = G.worldTick;
    return true;
  }
  var game_default = defineGame({
    name: "counter-stick",
    meta: {
      displayName: "Counter Stick",
      categories: ["action"]
    },
    minPlayers: 2,
    maxPlayers: 4,
    // @ts-ignore - Force real-time mode for the production build
    realtime: {
      tick: true,
      tickRate: 30
    },
    initialActive: (G) => Object.keys(G.players),
    // @ts-ignore
    tick: (G, dt, ctx) => {
      try {
        if (!world) return;
        setCurrentG(G);
        const steps = PHYSICS_STEPS_PER_TICK;
        for (let i = 0; i < steps; i++) {
          if (G.roundPhase === "intermission") {
            G.intermissionTicksLeft -= 1;
            if (G.intermissionTicksLeft <= 0) {
              startNextRound(G);
            }
          } else {
            for (const playerId of Object.keys(G.players)) {
              applyMovementInput(G, playerId, ctx.random);
            }
            advanceWorld(G, ctx.random);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.stack ?? err.message : String(err);
        ctx.emit("debug", { message: `WASM CRASH (tick): ${message}` });
      }
    },
    setup: (ctx) => {
      const preflightErr = getPhysicsInitError();
      if (preflightErr) {
        throw new Error(`WASM INIT (preflight): ${preflightErr}`);
      }
      try {
        const gameMode = parseGameConfig(ctx.config);
        if (gameMode === "teams2v2" && ctx.numPlayers !== 4) {
          throw new Error("teams2v2 requires exactly 4 players");
        }
        world = new World({ gravity: Vec2(0, GRAVITY) });
        playerBodies = {};
        platformBodies = {};
        crateBodies = {};
        pickupBodies = {};
        bulletBodies = {};
        bulletBounceCounts = {};
        handledBulletContactsThisStep.clear();
        handledBulletPlayerHitsThisStep.clear();
        handledBulletWallBounceThisStep.clear();
        playerGrounded = {};
        playerWallJumpUsed = {};
        playerWallContact = {};
        playerJumpGrace = {};
        pendingHits.length = 0;
        pendingPlatformDamages.length = 0;
        pendingCrateDamages.length = 0;
        pendingExplosions.length = 0;
        pendingBulletDestroys.clear();
        world.on("begin-contact", (contact) => {
          if (!currentG) return;
          handleContactPickupCollection(currentG, contact);
          handleContactWithBulletDamage(currentG, contact);
        });
        const addGroundEdge = (v1, v2, opts) => {
          const edge = world.createBody();
          edge.createFixture(Edge(v1, v2), opts);
        };
        addGroundEdge(
          Vec2(0, FLOOR_Y / SCALE),
          Vec2(ARENA_W / SCALE, FLOOR_Y / SCALE),
          { friction: 1, userData: { type: "ground" } }
        );
        addGroundEdge(Vec2(0, 0), Vec2(0, ARENA_H / SCALE), {
          friction: 0,
          userData: { type: "ground" }
        });
        addGroundEdge(
          Vec2(ARENA_W / SCALE, 0),
          Vec2(ARENA_W / SCALE, ARENA_H / SCALE),
          { friction: 0, userData: { type: "ground" } }
        );
        addGroundEdge(Vec2(0, 0), Vec2(ARENA_W / SCALE, 0), {
          friction: 0.2,
          restitution: 0.12,
          userData: { type: "ground" }
        });
        const players = {};
        const teams = gameMode === "teams2v2" ? assignTeams(ctx.players) : {};
        const mapDef = getMap("default");
        const spawns = mapDef.spawns;
        ctx.players.forEach((id, index) => {
          const spawn = spawnOnFloor(spawns[index % spawns.length]);
          const team = gameMode === "teams2v2" ? teams[id] : void 0;
          players[id] = {
            health: MAX_HEALTH,
            aimAngle: 0,
            facing: 1,
            crouching: false,
            currentWeapon: START_WEAPON,
            ownedWeapons: defaultOwnedWeapons(),
            lastFireTick: -1,
            torso: { x: spawn.x, y: spawn.y, angle: 0 },
            head: { x: spawn.x, y: spawn.y - HEAD_OFFSET, angle: 0 },
            team
          };
          createPlayerPhysics(id, spawn.x, spawn.y);
        });
        const G = {
          players,
          bullets: [],
          platforms: [],
          crates: [],
          pickups: [],
          nextBulletId: 1,
          nextPlatformId: 100,
          nextCrateId: 1,
          nextPickupId: 1,
          spawnTick: 0,
          worldTick: 0,
          matchSeed: ctx.players.slice().sort().join("|"),
          scores: initScores(ctx.players, gameMode),
          hitEvents: [],
          gameMode,
          teams,
          currentMapId: "default",
          currentRound: 1,
          roundPhase: "playing",
          intermissionTicksLeft: 0,
          lastRoundWinner: null,
          matchPhase: "active"
        };
        initPlatforms(G);
        syncStateFromPhysics(G);
        setCurrentG(G);
        return G;
      } catch (err) {
        const message = err instanceof Error ? err.stack ?? err.message : String(err);
        throw new Error(`WASM INIT (setup): ${message}`);
      }
    },
    moves: {
      input: (G, payload, ctx) => {
        try {
          setCurrentG(G);
          const p = G.players[ctx.playerId];
          if (!p || p.health <= 0) return;
          const data = payload;
          p.input = {
            action: data.action ?? null,
            jumping: !!data.jumping,
            aimAngle: typeof data.aimAngle === "number" ? data.aimAngle : p.aimAngle,
            facing: typeof data.facing === "number" ? data.facing >= 0 ? 1 : -1 : p.facing,
            crouching: !!data.crouching,
            shooting: !!data.shooting
          };
          p.aimAngle = p.input.aimAngle;
          p.facing = p.input.facing;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          ctx.log(`WASM CRASH (input): ${message}`);
        }
      },
      switchWeapon: (G, payload, ctx) => {
        try {
          setCurrentG(G);
          if (G.roundPhase === "intermission") return;
          const p = G.players[ctx.playerId];
          if (!p || p.health <= 0) return INVALID_MOVE;
          const data = payload;
          if (data.cycle) {
            if (p.ownedWeapons.length <= 1) return INVALID_MOVE;
            cycleOwnedWeapon(p);
          } else if (data.weaponId && WEAPONS[data.weaponId]) {
            if (!playerOwnsWeapon(p, data.weaponId)) return INVALID_MOVE;
            p.currentWeapon = data.weaponId;
          } else {
            return INVALID_MOVE;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          ctx.log(`WASM CRASH (switchWeapon): ${message}`);
          return INVALID_MOVE;
        }
      }
    },
    endIf: (G) => buildMatchResult(G),
    enumerate: (G, playerId) => {
      const p = G.players[playerId];
      if (!p || p.health <= 0 || G.roundPhase === "intermission") return [];
      return [
        {
          type: "input",
          payload: {
            action: null,
            jumping: false,
            aimAngle: p.aimAngle,
            facing: p.facing,
            crouching: false,
            shooting: false
          }
        }
      ];
    }
  });

  // .bordiko-entry.js
  var guest = createGuest(game_default);
  function readAllStdin() {
    const chunks = [];
    const buf = new Uint8Array(65536);
    for (; ; ) {
      const n = Javy.IO.readSync(0, buf);
      if (n === 0) break;
      chunks.push(buf.slice(0, n));
    }
    let total = 0;
    for (const c of chunks) total += c.length;
    const all = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      all.set(c, off);
      off += c.length;
    }
    return new TextDecoder().decode(all);
  }
  Javy.IO.writeSync(1, new TextEncoder().encode(guest.dispatch(readAllStdin().trim())));
})();
/*! Bundled license information:

matter-js/build/matter.js:
  (*!
   * matter-js 0.20.0 by @liabru
   * http://brm.io/matter-js/
   * License MIT
   * 
   * The MIT License (MIT)
   * 
   * Copyright (c) Liam Brummitt and contributors.
   * 
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   * 
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   * 
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   *)
*/
