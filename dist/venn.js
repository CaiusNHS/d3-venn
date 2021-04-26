// https://github.com/christophe-g/d3-venn v1.0.1 Copyright 2021 Caius Eugene
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3 = global.d3 || {}, global.d3));
}(this, (function (exports, d3) { 'use strict';

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var d3__default = /*#__PURE__*/_interopDefaultLegacy(d3);

function optional(f) {
    return f == null ? null : required(f);
}

function required(f) {
    if (typeof f !== "function") throw new Error;
    return f;
}

function constantZero() {
    return 0;
}

function constant(x) {
    return function() {
        return x;
    };
}

function setsAccessorFn(d) {
    return d.set || [];
}

function extractSets(data) {
    let sets = d3__default['default'].map({}, function(d) {
            return d.__key__
        }),
        individualSets = d3__default['default'].map(),
        accessor = setsAccessorFn(),
        size = (size) => {
            return size;
        },
        set,
        s,
        key,
        i,
        n = data.length;

    for (i = -1; ++i < n;) {
        set = accessor(data[i]);
        if (set.length) {
            key = set.sort().join(','); //so taht we have the same key as in https://github.com/benfred/venn.js
            set.forEach(function(val) {
                if (s = individualSets.get(val)) {
                    s.size += 1;
                    // s.nodes.push([data[i]]);

                } else {
                    individualSets.set(val, {
                        __key__: val,
                        size: 1,
                        sets: [val],
                        nodes: []
                        // nodes: [data[i]]
                    });
                }
            });
            data[i].__setKey__ = key;
            if (s = sets.get(key)) {
                s.size++;
                s.nodes.push(data[i]);
            } else {
                sets.set(key, {
                    __key__: key,
                    sets: set,
                    size: 1,
                    nodes: [data[i]]
                });
            }
        }

    }
    individualSets.forEach(function(k, v) {
        if (!sets.get(k)) {
            sets.set(k, v);
        }
    });
    // reset the size for each set.
    sets.forEach(function(k, v) {
        v.size = size(v.size);
    });
    // sets = sets.values();

    return sets;
}

function index() {
    var radius = null,
        dx = 1,
        dy = 1,
        padding = constantZero;

    function pack(root) {

        const sets = extractSets(data);
        console.log(sets);
        return root;
    }

    pack.radius = function(x) {
        return arguments.length ? (radius = optional(x), pack) : radius;
    };

    pack.size = function(x) {
        return arguments.length ? (dx = +x[0], dy = +x[1], pack) : [dx, dy];
    };

    pack.padding = function(x) {
        return arguments.length ? (padding = typeof x === "function" ? x : constant(+x), pack) : padding;
    };

    return pack;
}

exports.venn = index;

Object.defineProperty(exports, '__esModule', { value: true });

})));
