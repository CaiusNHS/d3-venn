(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('../venn.js/src/layout.js'), require('../venn.js/src/diagram.js'), require('../venn.js/src/circleintersection.js')) :
  typeof define === 'function' && define.amd ? define('d3-venn', ['exports', '../venn.js/src/layout.js', '../venn.js/src/diagram.js', '../venn.js/src/circleintersection.js'], factory) :
  factory((global.d3_venn = {}),global.___venn_js_src_layout_js,global.___venn_js_src_diagram_js,global.___venn_js_src_circleintersection_js);
}(this, function (exports,___venn_js_src_layout_js,___venn_js_src_diagram_js,___venn_js_src_circleintersection_js) { 'use strict';

  /**
   * getSet creates a getter/setter function for a re-usable D3.js component. 
   *
   * @method getSet
   * @param  {string}   option    - the name of the object in the string you want agetter/setter for.
   * @param  {function} component - the D3 component this getter/setter relates to.
   *
   * @return {mixed} The value of the option or the component.
   */

  function getSet(option, component) {
    return function(_) {
      if (! arguments.length) {
        return this[option];
      }

      this[option] = _;

      return component;
    };
  }

  function applier(component, options) {
  	for (var key in options) {
          if(component[key] && (typeof component[key] == "function")) {
              component[key](options[key]);
          }
      }
      return component;
  }

  function binder(component, options) {
  	for (var key in options) {
          if(!component[key]) {
              component[key] = getSet(key, component).bind(options);
          }
      }
  }

  //return true when the point is out of all circles
  function outOfCircles(point, circles) {
    for (var i = 0; i < circles.length; ++i) {
      if (___venn_js_src_circleintersection_js.distance(point, circles[i]) < circles[i].radius + ___venn_js_src_circleintersection_js.SMALL) {
        return false;
      }
    }
    return true;
  }


  // function called from d3.layout.venn 
  // used to pack child nodes insiside inner circle of a venn set.
  function pack(layout) {
    // var valueFn = layout.value();
    var packingConfig = layout.packingConfig();

    layout.sets().forEach(function(k,set) {
      // function pack(set, valueFn) {
      var innerRadius = set.innerRadius,
        center = set.center,
        children = set.nodes,
        x = center.x - innerRadius,
        y = center.y - innerRadius;

      applier(d3.layout.pack(), packingConfig)
        .size([innerRadius * 2, innerRadius * 2])
        .nodes({
          children: children
        });
      // translate the notes to the center    
      if (children) {
        children.forEach(function(n) {
          n.x += x;
          n.y += y;
        });
      }
    })
  }

  // function called from d3.layout.venn 
  // used to randomly distribute child nodes insiside a venn set.
  // d3.layout.venn.packCircles looks prettier.
  function distribute(layout) {
    // var valueFn = layout.value(),
    var circles = layout.circles();

    layout.sets().forEach(function(k,set) {
      var queue = [],
        maxAttempt = 500,
        k,
        inCircles = [],
        outCircles = [],
        center = set.center,
        innerRadius = set.innerRadius;


      for (k in circles) {
        if (set.sets.indexOf(k) > -1) {
          inCircles.push(circles[k])
        } else {
          outCircles.push(circles[k])
        }
      }

      // distanceToCircles.set(set.__key, computeDistanceToCircles(set))
      set.nodes.map(function(n, i) {
        var attempt = 0,
          candidate = null;

        if (i == 0) { // first node centered
          n.x = center.x;
          n.y = center.y;
          queue.push(n)
        } else {
          while (!candidate && (attempt < maxAttempt)) {
            var i = Math.random() * queue.length | 0,
              s = queue[i],
              a = 2 * Math.PI * Math.random(),
              r = Math.sqrt(Math.random() * ((innerRadius * innerRadius) + (10 * 10))),
              p = {
                x: s.x + r * Math.cos(a),
                y: s.y + r * Math.sin(a)
              };
            attempt++;
            if (___venn_js_src_circleintersection_js.containedInCircles(p, inCircles) && (outOfCircles(p, outCircles))) {
              candidate = p;
              queue.push(p)
            }

          }
          if (!candidate) {
            console.warn('NO CANDIDATE')
            candidate = {
              x: center.x,
              y: center.y
            }
          }
          n.x = candidate.x;
          n.y = candidate.y;

          // nodes.push(n);
        }
      });
    })
  }

  // apply a d3.fore layout with foci on venn area center to set foci
  // d3.layout.venn.packCircles looks prettier.
  function force(layout, data) {

    var force = layout.packer()
    if (!force) {
      force = d3.layout.force();
      binder(force, {
      	padding : 3,
      	maxRadius : 8,
        collider : true,
        ticker: null,
        ender : null,
        starter : null
      });
    }

    var packingConfig = layout.packingConfig(),
      size = layout.size(),
      sets = layout.sets(),
     
      padding = force.padding(), // separation between nodes
      maxRadius = force.maxRadius(),
      collider = force.collider;
    // foci = d3.map({}, function(d) {
    //   return d.__key__
    // });

    // layout.sets().forEach(function(set) {
    //   foci.set(set.__key__, set.center);
    // })

    applier(force, packingConfig)
      .nodes(data)
      .links([])
      .gravity(0)
      .charge(0)
      .size(size)
      .on('start', init)
      .on('tick', tick)
      
    var ender ;
    if(ender = force.ender()) {
  		force.on('end', ender)
    }  
      
    function init(e) {
      data.forEach(function(d) {
      	var center = sets.get(d.__setKey__).center;
        d.x = d.x ? d.x * 1 : center.x;
        d.y = d.y ? d.y * 1 : center.y;
      })
      var starter ;
      if(starter = force.starter()) {
  			starter(layout)
      }
    }

    function tick(e) {
      var ticker;
      data
        .forEach(gravity(.2 * e.alpha))
      
       if(collider) {
       data
      	 	.forEach(collide(.5))
  		}
      if (ticker = force.ticker()) {
        ticker(layout)
      }
    }
      // Move nodes toward cluster focus.
      function gravity(alpha) {
        return function(d) {
          var center = sets.get(d.__setKey__).center;
          d.y += (center.y - d.y) * alpha;
          d.x += (center.x - d.x) * alpha;
       };
      }
      // Resolve collisions between nodes.
      function collide(alpha) {
        var  quadtree = d3.geom.quadtree(data);
        return function(d) {
          var r = d.r + maxRadius + padding,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
              var x = d.x - quad.point.x,
                y = d.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = d.r + quad.point.r + (d.__setKey__ !== quad.point.__setKey__) * padding;
              if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
        };
      }
      return force;

    }

  function venn() {
    // d3.layout.venn = function() {

    var opts = {
      sets: null,
      setsAccessor: setsAccessorFn,
      setsSize: setsSize,
      packingStragegy: pack,
      packingConfig: {
        value: valueFn,
      },
      size: [1, 1],
      padding: 0,

      // options from venn (https://github.com/benfred/venn.js)
      layoutFunction: ___venn_js_src_layout_js.venn,
      orientation: Math.PI / 2,
      normalize: true

    };

    var circles,
      nodes,
      packer,
      centres;


    // Build simple getter and setter Functions
    binder(venn, opts);

    //The layout function
    function venn(data) {
      if (!arguments.length) return nodes;
       nodes = compute(data);
       return venn;
    }



    function compute(data) {
      var sets = venn.sets(),
          setsValues,
        layout = venn.layoutFunction(),
        packingStragegy = venn.packingStragegy(),
        size = venn.size(),
        width = size[0],
        height = size[1],
        // normalizeSolution = normalizeSolution,
        // scaleSolution = scaleSolution,
        // computeTextCentres = computeTextCentres,

        solution,
        oldCircles;


      sets = extractSets(data);
      setsValues = sets.values()
      solution = layout(setsValues);

      console.info("data: ", data)
      console.info("sets: ", sets)

      if (venn.normalize()) {
        solution = ___venn_js_src_layout_js.normalizeSolution(solution, venn.orientation());
      }

      oldCircles = circles;
      circles = ___venn_js_src_layout_js.scaleSolution(solution, width, height, venn.padding());

      for (var k in oldCircles) {
        if (circles[k]) {
          circles[k].previous = oldCircles[k];
        }
      }
      oldCircles = null;

      centres = ___venn_js_src_diagram_js.computeTextCentres(circles, setsValues);

      // store intersectionAreaPath into sets
      sets.forEach(function(k,set) {
        set.d = pathTween(set);
        set.center = centres[k];
        set.innerRadius = computeDistanceToCircles(set);
        // packingStragegy(set, valueFunction, circles);
      });

      packer = packingStragegy(venn, data)

      function computeDistanceToCircles(set) {
        var sets = set.sets,
          center = set.center,
          // hasOneSet = set.length ==1,
          k, circle, dist, isInside, isOverlapp,
          candidate = Infinity;
        // if(sets.length ==1)  {
        for (k in circles) {
          circle = circles[k];
          isInside = sets.indexOf(k) > -1;
          isOverlapp = sets.indexOf(k) < -1 && checkOverlapp(sets, circle);
          dist = ___venn_js_src_circleintersection_js.distance(center, circle);
          dist = isInside ? circle.radius - dist : isOverlapp ? dist - circle.radius : dist + circle.radius;
          if (dist < candidate) {
            candidate = dist;
          }

        }
        return candidate;
      }

      function checkOverlapp(sets, circle) {
        var i = 0,
          l = sets.length,
          c;
        for (i; i < l; i++) {
          c = circles[sets[i]];
          if (___venn_js_src_circleintersection_js.distance(c, circle) < c.radius) {
            return true;
          }
        }
        return false;
      }
      // interpolate intersection area paths between previous and
      // current paths
      function pathTween(set) {
        return function(t) {
          var c = set.sets.map(function(set) {
            // var start = previous[set],
            var circle = circles[set];

            var start = circle && circle["previous"],
              end = circle;
            if (!start) {
              start = {
                x: width / 2,
                y: height / 2,
                radius: 1
              };
            }
            if (!end) {
              end = {
                x: width / 2,
                y: height / 2,
                radius: 1
              };
            }
            if (t == 1 && circle) {
              circle["previous"] = end;
            }
            return {
              'x': start.x * (1 - t) + end.x * t,
              'y': start.y * (1 - t) + end.y * t,
              'radius': start.radius * (1 - t) + end.radius * t
            };
          });

          return ___venn_js_src_diagram_js.intersectionAreaPath(c);
        };
      };
      return data
    }

    // loop over data and build the set so that they comply with https://github.com/benfred/venn.js
    /*
    from  data = [
        {"set":["A"],"name":"node_0"},
        {"set":["B"],"name":"node_1"},
        {"set":["B","A"],"name":"node_2"}
        {"set":["B","A"],"name":"node_3"}
        ]

    to sets = [ 
        {sets: ['A'], size: 1, nodes : ['node_0']}, 
        {sets: ['B'], size: 1, nodes : ['node_1']},
        {sets: ['A','B'], size: 2, nodes ['node_2', 'node_3']}
        ];
    */
    function extractSets(data) {
      var sets = d3.map({}, function(d) {
          return d.__key__
        }),
        individualSets = d3.map(),
        accessor = venn.setsAccessor(),
        size = venn.setsSize(),
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
      })
      // sets = sets.values();

      venn.sets(sets);
      return sets;
    }

    function setsSize(size) {
      return size;
    }

    // data accessors 
    function setsAccessorFn(d) {
      return d.set || [];
    }

    function valueFn(d) {
      return d.value;
    }
    venn.packingConfig = function(_) {
      var config = opts.packingConfig;
      if (!arguments.length) {
        return config;
      }
      for (var k in _) {
        config[k] = _[k]
      }
      if(packer) {
          applier(packer, _)
      }
      return venn;

    };

    venn.packer = function() {
      return packer;
    }

    venn.circles = function() {
      return circles;
    };

    venn.centres = function() {
      return centres;
    };

    venn.nodes = venn;

    return venn;
    // return d3.rebind(venn, event, "on");
  };

  var version = "0.0.9";

  exports.version = version;
  exports.venn = venn;
  exports.pack = pack;
  exports.distribute = distribute;
  exports.force = force;

}));(function(target, export_name, name) {
  if (target) {
    target[name] = this[export_name] && this[export_name][name];

    for (var k in this[export_name]) {
      if (k != name) {
        target[name][k] = this[export_name][k];
      }
    }
    delete this[export_name];
  }
}(this.d3 && this.d3.layout, 'd3_venn', 'venn'));
