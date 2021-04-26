import {packEnclose} from "./siblings.js";
import {optional} from "./accessors.js";
import constant, {constantZero} from "./constant.js";
import d3 from "d3";

function defaultRadius(d) {
    return Math.sqrt(d.value);
}

function setsAccessorFn(d) {
    return d.set || [];
}

function extractSets(data) {
    let sets = d3.map({}, function(d) {
            return d.__key__
        }),
        individualSets = d3.map(),
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
                    })
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

export default function() {
    var radius = null,
        dx = 1,
        dy = 1,
        padding = constantZero;

    function pack(root) {

        const sets = extractSets(data);
        console.log(sets);
        return root;

        root.x = dx / 2, root.y = dy / 2;
        if (radius) {
            root.eachBefore(radiusLeaf(radius))
                .eachAfter(packChildren(padding, 0.5))
                .eachBefore(translateChild(1));
        } else {
            root.eachBefore(radiusLeaf(defaultRadius))
                .eachAfter(packChildren(constantZero, 1))
                .eachAfter(packChildren(padding, root.r / Math.min(dx, dy)))
                .eachBefore(translateChild(Math.min(dx, dy) / (2 * root.r)));
        }
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

function radiusLeaf(radius) {
    return function(node) {
        if (!node.children) {
            node.r = Math.max(0, +radius(node) || 0);
        }
    };
}

function packChildren(padding, k) {
    return function(node) {
        if (children = node.children) {
            var children,
                i,
                n = children.length,
                r = padding(node) * k || 0,
                e;

            if (r) for (i = 0; i < n; ++i) children[i].r += r;
            e = packEnclose(children);
            if (r) for (i = 0; i < n; ++i) children[i].r -= r;
            node.r = e + r;
        }
    };
}

function translateChild(k) {
    return function(node) {
        var parent = node.parent;
        node.r *= k;
        if (parent) {
            node.x = parent.x + k * node.x;
            node.y = parent.y + k * node.y;
        }
    };
}