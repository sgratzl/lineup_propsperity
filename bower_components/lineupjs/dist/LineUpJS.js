/*! LineUpJS - v0.2.0 - 2016-01-15
* https://github.com/sgratzl/lineup.js
* Copyright (c) 2016 ; Licensed BSD */

//based on https://github.com/ForbesLindesay/umd but with a custom list of external dependencies
;(function (f) {
  // CommonJS
  if (typeof exports === "object" && typeof module !== "undefined") {
    module.exports = f(require)(1);

    // RequireJS
  } else if (typeof define === "function" && define.amd) {
    var deps = ['d3'];
    define(deps, function () {
      var resolved_deps = arguments;
      return f(function(name) { return resolved_deps[deps.indexOf(name)]; })(1);
    });
    // <script>
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      // works providing we're not in "use strict";
      // needed for Java 8 Nashorn
      // seee https://github.com/facebook/react/issues/3037
      g = this;
    }
    g.LineUpJS = f(function(name) { return g[name]; })(1);
  }

})(function (require) {
  return  (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var model_ = require('./model');
var provider_ = require('./provider');
var renderer_ = require('./renderer');
var ui_ = require('./ui');
var utils_ = require('./utils');
var ui_dialogs_ = require('./ui_dialogs');
var d3 = require('d3');
exports.model = model_;
exports.provider = provider_;
exports.renderer = renderer_;
exports.ui = ui_;
exports.utils = utils_;
exports.ui_dialogs = ui_dialogs_;
var LineUp = (function (_super) {
    __extends(LineUp, _super);
    function LineUp(container, data, config) {
        var _this = this;
        if (config === void 0) { config = {}; }
        _super.call(this);
        this.data = data;
        this.config = {
            idPrefix: Math.random().toString(36).slice(-8).substr(0, 3),
            numberformat: d3.format('.3n'),
            htmlLayout: {
                headerHeight: 20,
                headerHistogramHeight: 40,
                autoRotateLabels: false,
                rotationHeight: 50,
                rotationDegree: -20,
                headerOffset: 1,
                buttonTopPadding: 10,
                labelLeftPadding: 5
            },
            renderingOptions: {
                stacked: false,
                animation: true,
                visibleRowsOnly: true,
                histograms: false,
                meanLine: false,
            },
            svgLayout: {
                rowHeight: 17,
                rowPadding: 0.2,
                rowBarPadding: 1,
                visibleRowsOnly: true,
                backupScrollRows: 4,
                animationDuration: 1000,
                freezeCols: 0,
                rowActions: []
            },
            manipulative: true,
            interaction: {
                tooltips: true,
                multiselect: function () {
                    return false;
                },
                rangeselect: function () {
                    return false;
                }
            },
            pool: false
        };
        this.body = null;
        this.header = null;
        this.pools = [];
        this.contentScroller = null;
        this.$container = container instanceof d3.selection ? container : d3.select(container);
        this.$container = this.$container.append('div').classed('lu', true);
        exports.utils.merge(this.config, config);
        this.data.on('selectionChanged.main', this.triggerSelection.bind(this));
        this.header = new ui_.HeaderRenderer(data, this.node, {
            manipulative: this.config.manipulative,
            headerHeight: this.config.htmlLayout.headerHeight,
            headerHistogramHeight: this.config.htmlLayout.headerHistogramHeight,
            histograms: this.config.renderingOptions.histograms,
            autoRotateLabels: this.config.htmlLayout.autoRotateLabels,
            rotationHeight: this.config.htmlLayout.rotationHeight,
            rotationDegree: this.config.htmlLayout.rotationDegree,
            freezeCols: this.config.svgLayout.freezeCols
        });
        this.body = new ui_.BodyRenderer(data, this.node, this.slice.bind(this), {
            rowHeight: this.config.svgLayout.rowHeight,
            rowPadding: this.config.svgLayout.rowPadding,
            rowBarPadding: this.config.svgLayout.rowBarPadding,
            animationDuration: this.config.svgLayout.animationDuration,
            meanLine: this.config.renderingOptions.meanLine,
            animation: this.config.renderingOptions.animation,
            stacked: this.config.renderingOptions.stacked,
            actions: this.config.svgLayout.rowActions,
            idPrefix: this.config.idPrefix,
            freezeCols: this.config.svgLayout.freezeCols
        });
        this.body.histCache = this.header.sharedHistCache;
        this.forward(this.body, 'hoverChanged');
        if (this.config.pool && this.config.manipulative) {
            this.addPool(new ui_.PoolRenderer(data, this.node, this.config));
        }
        if (this.config.svgLayout.visibleRowsOnly) {
            this.contentScroller = new utils_.ContentScroller(this.$container.node(), this.body.node, {
                backupRows: this.config.svgLayout.backupScrollRows,
                rowHeight: this.config.svgLayout.rowHeight,
                topShift: function () { return _this.header.currentHeight(); }
            });
            this.contentScroller.on('scroll', function (top, left) {
                _this.header.$node.style('transform', 'translate(' + 0 + 'px,' + top + 'px)');
                if (_this.config.svgLayout.freezeCols > 0) {
                    _this.header.updateFreeze(left);
                    _this.body.updateFreeze(left);
                }
            });
            this.contentScroller.on('redraw', this.body.update.bind(this.body));
        }
    }
    LineUp.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['hoverChanged', 'selectionChanged', 'multiSelectionChanged']);
    };
    LineUp.prototype.addPool = function (pool_node, config) {
        if (config === void 0) { config = this.config; }
        if (pool_node instanceof ui_.PoolRenderer) {
            this.pools.push(pool_node);
        }
        else {
            this.pools.push(new ui_.PoolRenderer(this.data, pool_node, config));
        }
        return this.pools[this.pools.length - 1];
    };
    Object.defineProperty(LineUp.prototype, "node", {
        get: function () {
            return this.$container.node();
        },
        enumerable: true,
        configurable: true
    });
    LineUp.prototype.slice = function (start, length, row2y) {
        if (this.contentScroller) {
            return this.contentScroller.select(start, length, row2y);
        }
        return { from: start, to: length };
    };
    LineUp.prototype.destroy = function () {
        this.pools.forEach(function (p) { return p.remove(); });
        this.$container.remove();
        if (this.contentScroller) {
            this.contentScroller.destroy();
        }
    };
    LineUp.prototype.sortBy = function (column, ascending) {
        if (ascending === void 0) { ascending = false; }
        var col = this.data.find(column);
        if (col) {
            col.sortByMe(ascending);
        }
        return col !== null;
    };
    LineUp.prototype.dump = function () {
        var s = this.data.dump();
        return s;
    };
    LineUp.prototype.changeDataStorage = function (data, dump) {
        if (this.data) {
            this.data.on('selectionChanged.main', null);
        }
        this.data = data;
        if (dump) {
            this.data.restore(dump);
        }
        this.data.on('selectionChanged.main', this.triggerSelection.bind(this));
        this.header.changeDataStorage(data);
        this.body.changeDataStorage(data);
        this.pools.forEach(function (p) { return p.changeDataStorage(data); });
        this.update();
    };
    LineUp.prototype.triggerSelection = function (data_indices) {
        this.fire('selectionChanged', data_indices.length > 0 ? data_indices[0] : -1);
        this.fire('multiSelectionChanged', data_indices);
    };
    LineUp.prototype.restore = function (dump) {
        this.changeDataStorage(this.data, dump);
    };
    LineUp.prototype.update = function () {
        this.header.update();
        this.body.update();
        this.pools.forEach(function (p) { return p.update(); });
    };
    LineUp.prototype.changeRenderingOption = function (option, value) {
        this.config.renderingOptions[option] = value;
        if (option === 'animation' || option === 'stacked') {
            this.body.setOption(option, value);
            this.body.update();
        }
    };
    return LineUp;
})(utils_.AEventDispatcher);
exports.LineUp = LineUp;
function deriveColors(columns) {
    var colors = d3.scale.category10().range().slice();
    columns.forEach(function (col) {
        switch (col.type) {
            case 'number':
                col.color = colors.shift();
                break;
        }
    });
    return columns;
}
exports.deriveColors = deriveColors;
function createLocalStorage(data, columns, options) {
    if (options === void 0) { options = {}; }
    return new provider_.LocalDataProvider(data, columns, options);
}
exports.createLocalStorage = createLocalStorage;
function create(data, container, config) {
    if (config === void 0) { config = {}; }
    return new LineUp(container, data, config);
}
exports.create = create;

},{"./model":3,"./provider":4,"./renderer":5,"./ui":6,"./ui_dialogs":7,"./utils":8,"d3":undefined}],2:[function(require,module,exports){
var d3 = require('d3');
var utils = require('./utils');
var model = require('./model');
'use strict';
function clamp(v, min, max) {
    return Math.max(Math.min(v, max), min);
}
var MappingEditor = (function () {
    function MappingEditor(parent, scale_, original, dataPromise, options) {
        if (options === void 0) { options = {}; }
        this.parent = parent;
        this.scale_ = scale_;
        this.original = original;
        this.dataPromise = dataPromise;
        this.options = {
            width: 320,
            height: 200,
            padding_hor: 5,
            padding_ver: 5,
            radius: 5,
            callback: function (d) { return d; },
            callbackThisArg: null,
            triggerCallback: 'change'
        };
        utils.merge(this.options, options);
        this.scale_ = scale_.clone();
        this.build(d3.select(parent));
    }
    Object.defineProperty(MappingEditor.prototype, "scale", {
        get: function () {
            return this.scale_;
        },
        enumerable: true,
        configurable: true
    });
    MappingEditor.prototype.build = function ($root) {
        var options = this.options, that = this;
        $root = $root.append('div').classed('lugui-me', true);
        $root.node().innerHTML = "<div>\n    <span class=\"raw_min\">0</span>\n    <span class=\"center\"><label><select>\n        <option value=\"linear\">Linear</option>\n        <option value=\"linear_invert\">Invert</option>\n        <option value=\"linear_abs\">Absolute</option>\n        <option value=\"log\">Log</option>\n        <option value=\"pow1.1\">Pow 1.1</option>\n        <option value=\"pow2\">Pow 2</option>\n        <option value=\"pow3\">Pow 3</option>\n        <option value=\"sqrt\">Sqrt</option>\n        <option value=\"script\">Custom Script</option>\n      </select></label>\n      </span>\n    <span class=\"raw_max\">1</span>\n  </div>\n  <svg width=\"" + options.width + "\" height=\"" + options.height + "\">\n    <rect width=\"100%\" height=\"10\"></rect>\n    <rect width=\"100%\" height=\"10\" y=\"" + (options.height - 10) + "\"></rect>\n    <g transform=\"translate(" + options.padding_hor + "," + options.padding_ver + ")\">\n      <g class=\"samples\">\n\n      </g>\n      <g class=\"mappings\">\n\n      </g>\n    </g>\n  </svg>\n  <div>\n    <input type=\"text\" class=\"raw_min\" value=\"0\">\n    <span class=\"center\">Raw</span>\n    <input type=\"text\" class=\"raw_max\" value=\"1\">\n  </div>\n  <div class=\"script\">\n    <textarea>\n\n    </textarea>\n    <button>Apply</button>\n  </div>";
        var width = options.width - options.padding_hor * 2;
        var height = options.height - options.padding_ver * 2;
        var raw2pixel = d3.scale.linear().domain([Math.min(this.scale.domain[0], this.original.domain[0]), Math.min(this.scale.domain[1], this.original.domain[1])])
            .range([0, width]);
        var normal2pixel = d3.scale.linear().domain([0, 1])
            .range([0, width]);
        $root.select('input.raw_min')
            .property('value', raw2pixel.domain()[0])
            .on('blur', function () {
            var d = raw2pixel.domain();
            d[0] = parseFloat(this.value);
            raw2pixel.domain(d);
            updateRaw();
        });
        $root.select('input.raw_max')
            .property('value', raw2pixel.domain()[1])
            .on('blur', function () {
            var d = raw2pixel.domain();
            d[1] = parseFloat(this.value);
            raw2pixel.domain(d);
            updateRaw();
        });
        var datalines = $root.select('g.samples').selectAll('line').data([]);
        this.dataPromise.then(function (data) {
            data = d3.set(data.map(String)).values().map(parseFloat);
            datalines = datalines.data(data);
            datalines.enter()
                .append('line')
                .attr({
                x1: function (d) { return normal2pixel(that.scale.apply(d)); },
                y1: 0,
                x2: raw2pixel,
                y2: height
            }).style('visibility', function (d) {
                var domain = that.scale.domain;
                return (d < domain[0] || d > domain[domain.length - 1]) ? 'hidden' : null;
            });
        });
        function updateDataLines() {
            datalines.attr({
                x1: function (d) { return normal2pixel(that.scale.apply(d)); },
                x2: raw2pixel
            }).style('visibility', function (d) {
                var domain = that.scale.domain;
                return (d < domain[0] || d > domain[domain.length - 1]) ? 'hidden' : null;
            });
        }
        function createDrag(move) {
            return d3.behavior.drag()
                .on('dragstart', function () {
                d3.select(this)
                    .classed('dragging', true)
                    .attr('r', options.radius * 1.1);
            })
                .on('drag', move)
                .on('dragend', function () {
                d3.select(this)
                    .classed('dragging', false)
                    .attr('r', options.radius);
                triggerUpdate(true);
            });
        }
        var mapping_lines = [];
        function renderMappingLines() {
            if (!(that.scale instanceof model.ScaleMappingFunction)) {
                return;
            }
            var sscale = that.scale;
            var domain = sscale.domain;
            var range = sscale.range;
            mapping_lines = domain.map(function (d, i) { return ({ r: d, n: range[i] }); });
            function updateScale() {
                mapping_lines.sort(function (a, b) { return a.r - b.r; });
                sscale.domain = mapping_lines.map(function (d) { return d.r; });
                sscale.range = mapping_lines.map(function (d) { return d.n; });
                updateDataLines();
            }
            function removePoint(i) {
                if (mapping_lines.length <= 2) {
                    return;
                }
                mapping_lines.splice(i, 1);
                updateScale();
                renderMappingLines();
            }
            function addPoint(x) {
                x = clamp(x, 0, width);
                mapping_lines.push({
                    n: normal2pixel.invert(x),
                    r: raw2pixel.invert(x)
                });
                updateScale();
                renderMappingLines();
            }
            $root.selectAll('rect').on('click', function () {
                addPoint(d3.mouse($root.select('svg > g').node())[0]);
            });
            var $mapping = $root.select('g.mappings').selectAll('g.mapping').data(mapping_lines);
            var $mapping_enter = $mapping.enter().append('g').classed('mapping', true).on('contextmenu', function (d, i) {
                d3.event.preventDefault();
                d3.event.stopPropagation();
                removePoint(i);
            });
            $mapping_enter.append('line').attr({
                y1: 0,
                y2: height
            }).call(createDrag(function (d) {
                var dx = d3.event.dx;
                var nx = clamp(normal2pixel(d.n) + dx, 0, width);
                var rx = clamp(raw2pixel(d.r) + dx, 0, width);
                d.n = normal2pixel.invert(nx);
                d.r = raw2pixel.invert(rx);
                d3.select(this).attr('x1', nx).attr('x2', rx);
                d3.select(this.parentElement).select('circle.normalized').attr('cx', nx);
                d3.select(this.parentElement).select('circle.raw').attr('cx', rx);
                updateScale();
            }));
            $mapping_enter.append('circle').classed('normalized', true).attr('r', options.radius).call(createDrag(function (d) {
                var x = clamp(d3.event.x, 0, width);
                d.n = normal2pixel.invert(x);
                d3.select(this).attr('cx', x);
                d3.select(this.parentElement).select('line').attr('x1', x);
                updateScale();
            }));
            $mapping_enter.append('circle').classed('raw', true).attr('r', options.radius).attr('cy', height).call(createDrag(function (d) {
                var x = clamp(d3.event.x, 0, width);
                d.r = raw2pixel.invert(x);
                d3.select(this).attr('cx', x);
                d3.select(this.parentElement).select('line').attr('x2', x);
                updateScale();
            }));
            $mapping.select('line').attr({
                x1: function (d) { return normal2pixel(d.n); },
                x2: function (d) { return raw2pixel(d.r); }
            });
            $mapping.select('circle.normalized').attr('cx', function (d) { return normal2pixel(d.n); });
            $mapping.select('circle.raw').attr('cx', function (d) { return raw2pixel(d.r); });
            $mapping.exit().remove();
        }
        function renderScript() {
            if (!(that.scale instanceof model.ScriptMappingFunction)) {
                $root.select('div.script').style('display', 'none');
                return;
            }
            $root.select('div.script').style('display', null);
            var sscale = that.scale;
            var $text = $root.select('textarea').text(sscale.code);
            $root.select('div.script').select('button').on('click', function () {
                var code = $text.property('value');
                sscale.code = code;
                updateDataLines();
                triggerUpdate();
            });
        }
        renderMappingLines();
        renderScript();
        function triggerUpdate(isDragEnd) {
            if (isDragEnd === void 0) { isDragEnd = false; }
            if (isDragEnd && (options.triggerCallback !== 'dragend')) {
                return;
            }
            options.callback.call(options.callbackThisArg, that.scale.clone());
        }
        function updateRaw() {
            var d = raw2pixel.domain();
            $root.select('input.raw_min').property('value', d[0]);
            $root.select('input.raw_max').property('value', d[1]);
            updateDataLines();
            renderMappingLines();
        }
        updateRaw();
        $root.select('select').on('change', function () {
            var v = this.value;
            if (v === 'linear_invert') {
                that.scale_ = new model.ScaleMappingFunction(raw2pixel.domain(), 'linear', [1, 0]);
            }
            else if (v === 'linear_abs') {
                var d = raw2pixel.domain();
                that.scale_ = new model.ScaleMappingFunction([d[0], (d[1] - d[0]) / 2, d[1]], 'linear', [1, 0, 1]);
            }
            else if (v === 'script') {
                that.scale_ = new model.ScriptMappingFunction(raw2pixel.domain());
            }
            else {
                that.scale_ = new model.ScaleMappingFunction(raw2pixel.domain(), v);
            }
            updateDataLines();
            renderMappingLines();
            renderScript();
            triggerUpdate();
        }).property('selectedIndex', function () {
            var name = 'script';
            if (that.scale_ instanceof model.ScaleMappingFunction) {
                name = that.scale.scaleType;
            }
            var types = ['linear', 'linear_invert', 'linear_abs', 'log', 'pow1.1', 'pow2', 'pow3', 'sqrt', 'script'];
            return types.indexOf(name);
        });
    };
    return MappingEditor;
})();
function create(parent, scale, original, dataPromise, options) {
    if (options === void 0) { options = {}; }
    return new MappingEditor(parent, scale, original, dataPromise, options);
}
exports.create = create;

},{"./model":3,"./utils":8,"d3":undefined}],3:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var d3 = require('d3');
var utils = require('./utils');
function fixCSS(id) {
    return id.replace(/[\s!#$%&'\(\)\*\+,\.\/:;<=>\?@\[\\\]\^`\{\|}~]/g, '_');
}
function numberCompare(a, b) {
    if (a === b || (isNaN(a) && isNaN(b))) {
        return 0;
    }
    return a - b;
}
var Column = (function (_super) {
    __extends(Column, _super);
    function Column(id, desc) {
        _super.call(this);
        this.desc = desc;
        this.width_ = 100;
        this.parent = null;
        this._compressed = false;
        this.id = fixCSS(id);
        this.label = this.desc.label || this.id;
        this.cssClass = this.desc.cssClass || '';
        this.color = this.desc.color || (this.cssClass !== '' ? null : Column.DEFAULT_COLOR);
    }
    Object.defineProperty(Column.prototype, "headerCssClass", {
        get: function () {
            return this.desc.type;
        },
        enumerable: true,
        configurable: true
    });
    Column.prototype.assignNewId = function (idGenerator) {
        this.id = fixCSS(idGenerator());
    };
    Column.prototype.init = function (callback) {
        return Promise.resolve(true);
    };
    Object.defineProperty(Column.prototype, "fqid", {
        get: function () {
            return this.parent ? this.parent.fqid + '_' + this.id : this.id;
        },
        enumerable: true,
        configurable: true
    });
    Column.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['widthChanged', 'filterChanged', 'labelChanged', 'compressChanged', 'addColumn', 'removeColumn', 'dirty', 'dirtyHeader', 'dirtyValues']);
    };
    Column.prototype.getWidth = function () {
        return this.width_;
    };
    Object.defineProperty(Column.prototype, "compressed", {
        get: function () {
            return this._compressed;
        },
        set: function (value) {
            if (this._compressed === value) {
                return;
            }
            this.fire(['compressChanged', 'dirtyHeader', 'dirtyValues', 'dirty'], this._compressed, this._compressed = value);
        },
        enumerable: true,
        configurable: true
    });
    Column.prototype.flatten = function (r, offset, levelsToGo, padding) {
        if (levelsToGo === void 0) { levelsToGo = 0; }
        if (padding === void 0) { padding = 0; }
        var w = this.compressed ? Column.COMPRESSED_WIDTH : this.getWidth();
        r.push({ col: this, offset: offset, width: w });
        return w;
    };
    Column.prototype.setWidth = function (value) {
        if (this.width_ === value) {
            return;
        }
        this.fire(['widthChanged', 'dirtyHeader', 'dirtyValues', 'dirty'], this.width_, this.width_ = value);
    };
    Column.prototype.setWidthImpl = function (value) {
        this.width_ = value;
    };
    Column.prototype.setMetaData = function (value, color) {
        if (color === void 0) { color = this.color; }
        if (value === this.label && this.color === color) {
            return;
        }
        var events = this.color === color ? ['labelChanged', 'dirtyHeader', 'dirty'] : ['labelChanged', 'dirtyHeader', 'dirtyValues', 'dirty'];
        this.fire(events, { label: this.label, color: this.color }, {
            label: this.label = value,
            color: this.color = color
        });
    };
    Column.prototype.sortByMe = function (ascending) {
        if (ascending === void 0) { ascending = false; }
        var r = this.findMyRanker();
        if (r) {
            return r.sortBy(this, ascending);
        }
        return false;
    };
    Column.prototype.toggleMySorting = function () {
        var r = this.findMyRanker();
        if (r) {
            return r.toggleSorting(this);
        }
        return false;
    };
    Column.prototype.removeMe = function () {
        if (this.parent) {
            return this.parent.remove(this);
        }
        return false;
    };
    Column.prototype.insertAfterMe = function (col) {
        if (this.parent) {
            return this.parent.insertAfter(col, this);
        }
        return false;
    };
    Column.prototype.findMyRanker = function () {
        if (this.parent) {
            return this.parent.findMyRanker();
        }
        return null;
    };
    Column.prototype.dump = function (toDescRef) {
        var r = {
            id: this.id,
            desc: toDescRef(this.desc),
            width: this.width_,
            compressed: this.compressed
        };
        if (this.label !== (this.desc.label || this.id)) {
            r.label = this.label;
        }
        if (this.color !== (this.desc.color || Column.DEFAULT_COLOR) && this.color) {
            r.color = this.color;
        }
        return r;
    };
    Column.prototype.restore = function (dump, factory) {
        this.width_ = dump.width || this.width_;
        this.label = dump.label || this.label;
        this.color = dump.color || this.color;
        this.compressed = dump.compressed === true;
    };
    Column.prototype.getLabel = function (row) {
        return '' + this.getValue(row);
    };
    Column.prototype.getValue = function (row) {
        return '';
    };
    Column.prototype.compare = function (a, b) {
        return 0;
    };
    Column.prototype.isFiltered = function () {
        return false;
    };
    Column.prototype.filter = function (row) {
        return row !== null;
    };
    Column.DEFAULT_COLOR = '#C1C1C1';
    Column.FLAT_ALL_COLUMNS = -1;
    Column.COMPRESSED_WIDTH = 16;
    return Column;
})(utils.AEventDispatcher);
exports.Column = Column;
var ValueColumn = (function (_super) {
    __extends(ValueColumn, _super);
    function ValueColumn(id, desc) {
        _super.call(this, id, desc);
        this.accessor = desc.accessor || (function (row, id, desc) { return null; });
    }
    ValueColumn.prototype.getLabel = function (row) {
        return '' + this.getValue(row);
    };
    ValueColumn.prototype.getValue = function (row) {
        return this.accessor(row, this.id, this.desc);
    };
    ValueColumn.prototype.compare = function (a, b) {
        return 0;
    };
    return ValueColumn;
})(Column);
exports.ValueColumn = ValueColumn;
var DummyColumn = (function (_super) {
    __extends(DummyColumn, _super);
    function DummyColumn(id, desc) {
        _super.call(this, id, desc);
    }
    DummyColumn.prototype.getLabel = function (row) {
        return '';
    };
    DummyColumn.prototype.getValue = function (row) {
        return '';
    };
    DummyColumn.prototype.compare = function (a, b) {
        return 0;
    };
    return DummyColumn;
})(Column);
exports.DummyColumn = DummyColumn;
function isNumberColumn(col) {
    return (col instanceof Column && typeof col.getNumber === 'function' || (!(col instanceof Column) && col.type.match(/(number|stack|ordinal)/) != null));
}
exports.isNumberColumn = isNumberColumn;
function isCategoricalColumn(col) {
    return (col instanceof Column && typeof col.getCategories === 'function' || (!(col instanceof Column) && col.type.match(/(categorical|ordinal)/) != null));
}
exports.isCategoricalColumn = isCategoricalColumn;
function toScale(type) {
    if (type === void 0) { type = 'linear'; }
    switch (type) {
        case 'log':
            return d3.scale.log().clamp(true);
        case 'sqrt':
            return d3.scale.sqrt().clamp(true);
        case 'pow1.1':
            return d3.scale.pow().exponent(1.1).clamp(true);
        case 'pow2':
            return d3.scale.pow().exponent(2).clamp(true);
        case 'pow3':
            return d3.scale.pow().exponent(3).clamp(true);
        default:
            return d3.scale.linear().clamp(true);
    }
}
function isSame(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.every(function (ai, i) { return ai === b[i]; });
}
function fixDomain(domain, type) {
    if (type === 'log' && domain[0] === 0) {
        domain[0] = 0.0000001;
    }
    return domain;
}
var ScaleMappingFunction = (function () {
    function ScaleMappingFunction(domain, type, range) {
        if (domain === void 0) { domain = [0, 1]; }
        if (type === void 0) { type = 'linear'; }
        if (range === void 0) { range = [0, 1]; }
        this.type = type;
        this.s = toScale(type).domain(fixDomain(domain, this.type)).range(range);
    }
    Object.defineProperty(ScaleMappingFunction.prototype, "domain", {
        get: function () {
            return this.s.domain();
        },
        set: function (domain) {
            this.s.domain(fixDomain(domain, this.type));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScaleMappingFunction.prototype, "range", {
        get: function () {
            return this.s.range();
        },
        set: function (range) {
            this.s.range(range);
        },
        enumerable: true,
        configurable: true
    });
    ScaleMappingFunction.prototype.apply = function (v) {
        return this.s(v);
    };
    Object.defineProperty(ScaleMappingFunction.prototype, "scaleType", {
        get: function () {
            return this.type;
        },
        enumerable: true,
        configurable: true
    });
    ScaleMappingFunction.prototype.dump = function () {
        return {
            type: this.type,
            domain: this.domain,
            range: this.range
        };
    };
    ScaleMappingFunction.prototype.eq = function (other) {
        if (!(other instanceof ScaleMappingFunction)) {
            return false;
        }
        var that = other;
        return that.type === this.type && isSame(this.domain, that.domain) && isSame(this.range, that.range);
    };
    ScaleMappingFunction.prototype.restore = function (dump) {
        this.type = dump.type;
        this.s = toScale(dump.type).domain(dump.domain).range(dump.range);
    };
    ScaleMappingFunction.prototype.clone = function () {
        return new ScaleMappingFunction(this.domain, this.type, this.range);
    };
    return ScaleMappingFunction;
})();
exports.ScaleMappingFunction = ScaleMappingFunction;
var ScriptMappingFunction = (function () {
    function ScriptMappingFunction(domain_, code_) {
        if (domain_ === void 0) { domain_ = [0, 1]; }
        if (code_ === void 0) { code_ = 'return this.linear(value,this.value_min,this.value_max);'; }
        this.domain_ = domain_;
        this.code_ = code_;
        this.f = new Function('value', code_);
    }
    Object.defineProperty(ScriptMappingFunction.prototype, "domain", {
        get: function () {
            return this.domain_;
        },
        set: function (domain) {
            this.domain_ = domain;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ScriptMappingFunction.prototype, "code", {
        get: function () {
            return this.code_;
        },
        set: function (code) {
            if (this.code_ === code) {
                return;
            }
            this.code_ = code;
            this.f = new Function('value', code);
        },
        enumerable: true,
        configurable: true
    });
    ScriptMappingFunction.prototype.apply = function (v) {
        var min = this.domain_[0], max = this.domain_[this.domain_.length - 1];
        var r = this.f.call({
            value_min: min,
            value_max: max,
            value_range: max - min,
            value_domain: this.domain_.slice(),
            linear: function (v, mi, ma) { return (v - mi) / (ma - mi); }
        }, v);
        if (typeof r === 'number') {
            return Math.max(Math.min(r, 1), 0);
        }
        return NaN;
    };
    ScriptMappingFunction.prototype.dump = function () {
        return {
            type: 'script',
            code: this.code
        };
    };
    ScriptMappingFunction.prototype.eq = function (other) {
        if (!(other instanceof ScriptMappingFunction)) {
            return false;
        }
        var that = other;
        return that.code === this.code;
    };
    ScriptMappingFunction.prototype.restore = function (dump) {
        this.code = dump.code;
    };
    ScriptMappingFunction.prototype.clone = function () {
        return new ScriptMappingFunction(this.domain, this.code);
    };
    return ScriptMappingFunction;
})();
exports.ScriptMappingFunction = ScriptMappingFunction;
function createMappingFunction(dump) {
    if (dump.type === 'script') {
        var s = new ScriptMappingFunction();
        s.restore(dump);
        return s;
    }
    else {
        var l = new ScaleMappingFunction();
        l.restore(dump);
        return l;
    }
}
exports.createMappingFunction = createMappingFunction;
var NumberColumn = (function (_super) {
    __extends(NumberColumn, _super);
    function NumberColumn(id, desc) {
        _super.call(this, id, desc);
        this.missingValue = 0;
        this.filter_ = { min: -Infinity, max: Infinity };
        if (desc.map) {
            this.mapping = createMappingFunction(desc.map);
        }
        else if (desc.domain) {
            this.mapping = new ScaleMappingFunction(desc.domain, 'linear', desc.range || [0, 1]);
        }
        this.original = this.mapping.clone();
    }
    NumberColumn.prototype.init = function (callback) {
        var _this = this;
        var d = this.mapping.domain;
        if (isNaN(d[0]) || isNaN(d[1])) {
            return callback(this.desc).then(function (stats) {
                _this.mapping.domain = [stats.min, stats.max];
                _this.original.domain = [stats.min, stats.max];
                return true;
            });
        }
        return Promise.resolve(true);
    };
    NumberColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.map = this.mapping.dump();
        r.filter = this.filter;
        r.missingValue = this.missingValue;
        return r;
    };
    NumberColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        if (dump.map) {
            this.mapping = createMappingFunction(dump.map);
        }
        else if (dump.domain) {
            this.mapping = new ScaleMappingFunction(dump.domain, 'linear', dump.range || [0, 1]);
        }
        if (dump.filter) {
            this.filter_ = dump.filter;
        }
        if (dump.missingValue) {
            this.missingValue = dump.missingValue;
        }
    };
    NumberColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['mappingChanged']);
    };
    NumberColumn.prototype.getLabel = function (row) {
        return '' + _super.prototype.getValue.call(this, row);
    };
    NumberColumn.prototype.getRawValue = function (row) {
        var v = _super.prototype.getValue.call(this, row);
        if (typeof (v) === 'undefined' || v == null || isNaN(v) || v === '' || v === 'NA' || (typeof (v) === 'string' && (v.toLowerCase() === 'na'))) {
            return this.missingValue;
        }
        return +v;
    };
    NumberColumn.prototype.getValue = function (row) {
        var v = this.getRawValue(row);
        if (isNaN(v)) {
            return v;
        }
        return this.mapping.apply(v);
    };
    NumberColumn.prototype.getNumber = function (row) {
        return this.getValue(row);
    };
    NumberColumn.prototype.compare = function (a, b) {
        return numberCompare(this.getValue(a), this.getValue(b));
    };
    NumberColumn.prototype.getOriginalMapping = function () {
        return this.original.clone();
    };
    NumberColumn.prototype.getMapping = function () {
        return this.mapping.clone();
    };
    NumberColumn.prototype.setMapping = function (mapping) {
        if (this.mapping.eq(mapping)) {
            return;
        }
        this.fire(['mappingChanged', 'dirtyValues', 'dirty'], this.mapping.clone(), this.mapping = mapping);
    };
    NumberColumn.prototype.isFiltered = function () {
        return isFinite(this.filter_.min) || isFinite(this.filter_.max);
    };
    Object.defineProperty(NumberColumn.prototype, "filterMin", {
        get: function () {
            return this.filter_.min;
        },
        set: function (min) {
            var bak = { min: this.filter_.min, max: this.filter_.max };
            this.filter_.min = isNaN(min) ? -Infinity : min;
            this.fire(['filterChanged', 'dirtyValues', 'dirty'], bak, this.filter_);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NumberColumn.prototype, "filterMax", {
        get: function () {
            return this.filter_.max;
        },
        set: function (max) {
            var bak = { min: this.filter_.min, max: this.filter_.max };
            this.filter_.max = isNaN(max) ? Infinity : max;
            this.fire(['filterChanged', 'dirtyValues', 'dirty'], bak, this.filter_);
        },
        enumerable: true,
        configurable: true
    });
    NumberColumn.prototype.getFilter = function () {
        return this.filter_;
    };
    NumberColumn.prototype.setFilter = function (min, max) {
        if (min === void 0) { min = -Infinity; }
        if (max === void 0) { max = +Infinity; }
        var bak = { min: this.filter_.min, max: this.filter_.max };
        this.filter_.min = isNaN(min) ? -Infinity : min;
        this.filter_.max = isNaN(max) ? Infinity : max;
        this.fire(['filterChanged', 'dirtyValues', 'dirty'], bak, this.filter_);
    };
    NumberColumn.prototype.filter = function (row) {
        if (!this.isFiltered()) {
            return true;
        }
        var v = this.getRawValue(row);
        if (isNaN(v)) {
            return true;
        }
        return !((isFinite(this.filter_.min) && v < this.filter_.min) || (isFinite(this.filter_.max) && v < this.filter_.max));
    };
    return NumberColumn;
})(ValueColumn);
exports.NumberColumn = NumberColumn;
var StringColumn = (function (_super) {
    __extends(StringColumn, _super);
    function StringColumn(id, desc) {
        _super.call(this, id, desc);
        this.filter_ = null;
        this._alignment = 'left';
        this.setWidthImpl(200);
        this._alignment = desc.alignment || 'left';
    }
    Object.defineProperty(StringColumn.prototype, "alignment", {
        get: function () {
            return this._alignment;
        },
        enumerable: true,
        configurable: true
    });
    StringColumn.prototype.getValue = function (row) {
        var v = _super.prototype.getValue.call(this, row);
        if (typeof (v) === 'undefined' || v == null) {
            return '';
        }
        return v;
    };
    StringColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        if (this.filter_ instanceof RegExp) {
            r.filter = 'REGEX:' + this.filter_.source;
        }
        else {
            r.filter = this.filter_;
        }
        r.alignment = this.alignment;
        return r;
    };
    StringColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        if (dump.filter && dump.filter.slice(0, 6) === 'REGEX:') {
            this.filter_ = new RegExp(dump.filter.slice(6));
        }
        else {
            this.filter_ = dump.filter || null;
        }
        this._alignment = dump.alignment || this._alignment;
    };
    StringColumn.prototype.isFiltered = function () {
        return this.filter_ != null;
    };
    StringColumn.prototype.filter = function (row) {
        if (!this.isFiltered()) {
            return true;
        }
        var r = this.getLabel(row), filter = this.filter_;
        if (typeof filter === 'string' && filter.length > 0) {
            return r && r.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
        }
        if (filter instanceof RegExp) {
            return r && filter.test(r);
        }
        return true;
    };
    StringColumn.prototype.getFilter = function () {
        return this.filter_;
    };
    StringColumn.prototype.setFilter = function (filter) {
        if (filter === '') {
            filter = null;
        }
        this.fire(['filterChanged', 'dirtyValues', 'dirty'], this.filter_, this.filter_ = filter);
    };
    StringColumn.prototype.compare = function (a, b) {
        return d3.ascending(this.getValue(a), this.getValue(b));
    };
    return StringColumn;
})(ValueColumn);
exports.StringColumn = StringColumn;
var LinkColumn = (function (_super) {
    __extends(LinkColumn, _super);
    function LinkColumn(id, desc) {
        _super.call(this, id, desc);
        this.link = null;
        this.link = desc.link;
    }
    Object.defineProperty(LinkColumn.prototype, "headerCssClass", {
        get: function () {
            return this.link == null ? 'link' : 'link link_pattern';
        },
        enumerable: true,
        configurable: true
    });
    LinkColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['linkChanged']);
    };
    LinkColumn.prototype.setLink = function (link) {
        if (link == this.link) {
            return;
        }
        this.fire(['linkChanged', 'dirtyHeader', 'dirtyValues', 'dirty'], this.link, this.link = link);
    };
    LinkColumn.prototype.getLink = function () {
        return this.link || '';
    };
    LinkColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        if (this.link != this.desc.link) {
            r.link = this.link;
        }
        return r;
    };
    LinkColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        if (dump.link) {
            this.link = dump.link;
        }
    };
    LinkColumn.prototype.getLabel = function (row) {
        var v = _super.prototype.getValue.call(this, row);
        if (v.alt) {
            return v.alt;
        }
        return '' + v;
    };
    LinkColumn.prototype.isLink = function (row) {
        if (this.link) {
            return true;
        }
        var v = _super.prototype.getValue.call(this, row);
        return v.href != null;
    };
    LinkColumn.prototype.getValue = function (row) {
        var v = _super.prototype.getValue.call(this, row);
        if (v.href) {
            return v.href;
        }
        else if (this.link) {
            return this.link.replace(/\$1/g, v);
        }
        return v;
    };
    return LinkColumn;
})(StringColumn);
exports.LinkColumn = LinkColumn;
var AnnotateColumn = (function (_super) {
    __extends(AnnotateColumn, _super);
    function AnnotateColumn(id, desc) {
        _super.call(this, id, desc);
        this.annotations = d3.map();
    }
    AnnotateColumn.prototype.getValue = function (row) {
        var index = String(row._index);
        if (this.annotations.has(index)) {
            return this.annotations.get(index);
        }
        return _super.prototype.getValue.call(this, row);
    };
    AnnotateColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.annotations = {};
        this.annotations.forEach(function (k, v) {
            r.annotations[k] = v;
        });
        return r;
    };
    AnnotateColumn.prototype.restore = function (dump, factory) {
        var _this = this;
        _super.prototype.restore.call(this, dump, factory);
        if (dump.annotations) {
            Object.keys(dump.annotations).forEach(function (k) {
                _this.annotations.set(k, dump.annotations[k]);
            });
        }
    };
    AnnotateColumn.prototype.setValue = function (row, value) {
        var old = this.getValue(row);
        if (old === value) {
            return true;
        }
        if (value === '' || value == null) {
            this.annotations.remove(String(row._index));
        }
        else {
            this.annotations.set(String(row._index), value);
        }
        this.fire(['dirtyValues', 'dirty'], value, old);
        return true;
    };
    return AnnotateColumn;
})(StringColumn);
exports.AnnotateColumn = AnnotateColumn;
var CategoricalColumn = (function (_super) {
    __extends(CategoricalColumn, _super);
    function CategoricalColumn(id, desc) {
        _super.call(this, id, desc);
        this.colors = d3.scale.category10();
        this.filter_ = null;
        this.separator = ';';
        this.separator = desc.separator || this.separator;
        this.initCategories(desc);
    }
    CategoricalColumn.prototype.initCategories = function (desc) {
        if (desc.categories) {
            var cats = [], cols = this.colors.range();
            desc.categories.forEach(function (cat, i) {
                if (typeof cat === 'string') {
                    cats.push(cat);
                }
                else {
                    cats.push(cat.name);
                    cols[i] = cat.color;
                }
            });
            this.colors.domain(cats).range(cols);
        }
    };
    Object.defineProperty(CategoricalColumn.prototype, "categories", {
        get: function () {
            return this.colors.domain();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CategoricalColumn.prototype, "categoryColors", {
        get: function () {
            return this.colors.range();
        },
        enumerable: true,
        configurable: true
    });
    CategoricalColumn.prototype.colorOf = function (cat) {
        return this.colors(cat);
    };
    CategoricalColumn.prototype.getLabel = function (row) {
        return '' + StringColumn.prototype.getValue.call(this, row);
    };
    CategoricalColumn.prototype.getFirstLabel = function (row) {
        var l = this.getLabels(row);
        return l.length > 0 ? l[0] : null;
    };
    CategoricalColumn.prototype.getLabels = function (row) {
        var v = StringColumn.prototype.getValue.call(this, row);
        var r = v.split(this.separator);
        return r;
    };
    CategoricalColumn.prototype.getValue = function (row) {
        var r = this.getValues(row);
        return r.length > 0 ? r[0] : null;
    };
    CategoricalColumn.prototype.getValues = function (row) {
        var v = StringColumn.prototype.getValue.call(this, row);
        var r = v.split(this.separator);
        return r;
    };
    CategoricalColumn.prototype.getCategories = function (row) {
        return this.getValues(row);
    };
    CategoricalColumn.prototype.getColor = function (row) {
        var cat = this.getFirstLabel(row);
        if (cat === null || cat === '') {
            return null;
        }
        return this.colors(cat);
    };
    CategoricalColumn.prototype.getColors = function (row) {
        return this.getLabels(row).map(this.colors);
    };
    CategoricalColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.filter = this.filter_;
        r.colors = {
            domain: this.colors.domain(),
            range: this.colors.range(),
            separator: this.separator
        };
        return r;
    };
    CategoricalColumn.prototype.restore = function (dump, factory) {
        _super.prototype.restore.call(this, dump, factory);
        this.filter_ = dump.filter || null;
        if (dump.colors) {
            this.colors.domain(dump.colors.domain).range(dump.colors.range);
        }
        this.separator = dump.separator || this.separator;
    };
    CategoricalColumn.prototype.isFiltered = function () {
        return this.filter_ != null;
    };
    CategoricalColumn.prototype.filter = function (row) {
        if (!this.isFiltered()) {
            return true;
        }
        var vs = this.getValues(row), filter = this.filter_;
        return vs.every(function (v) {
            if (Array.isArray(filter) && filter.length > 0) {
                return filter.indexOf(v) >= 0;
            }
            else if (typeof filter === 'string' && filter.length > 0) {
                return v && v.toLowerCase().indexOf(filter.toLowerCase()) >= 0;
            }
            else if (filter instanceof RegExp) {
                return v != null && v.match(filter).length > 0;
            }
            return true;
        });
    };
    CategoricalColumn.prototype.getFilter = function () {
        return this.filter_;
    };
    CategoricalColumn.prototype.setFilter = function (filter) {
        this.fire(['filterChanged', 'dirtyValues', 'dirty'], this, this.filter_, this.filter_ = filter);
    };
    CategoricalColumn.prototype.compare = function (a, b) {
        var va = this.getValues(a);
        var vb = this.getValues(b);
        for (var i = 0; i < Math.min(va.length, vb.length); ++i) {
            var ci = d3.ascending(va[i], vb[i]);
            if (ci !== 0) {
                return ci;
            }
        }
        return va.length - vb.length;
    };
    return CategoricalColumn;
})(ValueColumn);
exports.CategoricalColumn = CategoricalColumn;
var CategoricalNumberColumn = (function (_super) {
    __extends(CategoricalNumberColumn, _super);
    function CategoricalNumberColumn(id, desc) {
        _super.call(this, id, desc);
        this.colors = d3.scale.category10();
        this.scale = d3.scale.ordinal().rangeRoundPoints([0, 1]);
        this.filter_ = null;
        this.separator = ';';
        this.combiner = d3.max;
        this.separator = desc.separator || this.separator;
        CategoricalColumn.prototype.initCategories.call(this, desc);
        this.scale.domain(this.colors.domain());
        if (desc.categories) {
            var values = [];
            desc.categories.forEach(function (d) {
                if (typeof d !== 'string' && typeof (d.value) === 'number') {
                    values.push(d.value);
                }
                else {
                    values.push(0.5);
                }
            });
            this.scale.range(values);
        }
    }
    CategoricalNumberColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['mappingChanged']);
    };
    Object.defineProperty(CategoricalNumberColumn.prototype, "categories", {
        get: function () {
            return this.colors.domain();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CategoricalNumberColumn.prototype, "categoryColors", {
        get: function () {
            return this.colors.range();
        },
        enumerable: true,
        configurable: true
    });
    CategoricalNumberColumn.prototype.colorOf = function (cat) {
        return this.colors(cat);
    };
    CategoricalNumberColumn.prototype.getLabel = function (row) {
        return CategoricalColumn.prototype.getLabel.call(this, row);
    };
    CategoricalNumberColumn.prototype.getFirstLabel = function (row) {
        return CategoricalColumn.prototype.getFirstLabel.call(this, row);
    };
    CategoricalNumberColumn.prototype.getLabels = function (row) {
        return CategoricalColumn.prototype.getLabels.call(this, row);
    };
    CategoricalNumberColumn.prototype.getValue = function (row) {
        var r = this.getValues(row);
        return r.length > 0 ? this.combiner(r) : 0;
    };
    CategoricalNumberColumn.prototype.getValues = function (row) {
        var r = CategoricalColumn.prototype.getValues.call(this, row);
        return r.map(this.scale);
    };
    CategoricalNumberColumn.prototype.getCategories = function (row) {
        return CategoricalColumn.prototype.getValues.call(this, row);
    };
    CategoricalNumberColumn.prototype.getNumber = function (row) {
        return this.getValue(row);
    };
    CategoricalNumberColumn.prototype.getColor = function (row) {
        var vs = this.getValues(row);
        var cs = this.getColors(row);
        if (this.combiner === d3.max) {
            return cs.slice(1).reduce(function (prev, act, i) { return vs[i + 1] > prev.v ? { c: act, v: vs[i + 1] } : prev; }, {
                c: cs[0],
                v: vs[0]
            }).c;
        }
        else if (this.combiner === d3.min) {
            return cs.slice(1).reduce(function (prev, act, i) { return vs[i + 1] < prev.v ? { c: act, v: vs[i + 1] } : prev; }, {
                c: cs[0],
                v: vs[0]
            }).c;
        }
        else {
            return cs[0] || null;
        }
    };
    CategoricalNumberColumn.prototype.getColors = function (row) {
        return CategoricalColumn.prototype.getColors.call(this, row);
    };
    CategoricalNumberColumn.prototype.dump = function (toDescRef) {
        var r = CategoricalColumn.prototype.dump.call(this, toDescRef);
        r.scale = {
            domain: this.scale.domain(),
            range: this.scale.range(),
            separator: this.separator
        };
        return r;
    };
    CategoricalNumberColumn.prototype.restore = function (dump, factory) {
        CategoricalColumn.prototype.restore.call(this, dump, factory);
        if (dump.scale) {
            this.scale.domain(dump.scale.domain).range(dump.scale.range);
        }
        this.separator = dump.separator || this.separator;
    };
    CategoricalNumberColumn.prototype.getScale = function () {
        return {
            domain: this.scale.domain(),
            range: this.scale.range()
        };
    };
    CategoricalNumberColumn.prototype.setRange = function (range) {
        var bak = this.getScale();
        this.scale.range(range);
        this.fire(['mappingChanged', 'dirtyValues', 'dirty'], bak, this.getScale());
    };
    CategoricalNumberColumn.prototype.isFiltered = function () {
        return this.filter_ != null;
    };
    CategoricalNumberColumn.prototype.filter = function (row) {
        return CategoricalColumn.prototype.filter.call(this, row);
    };
    CategoricalNumberColumn.prototype.getFilter = function () {
        return this.filter_;
    };
    CategoricalNumberColumn.prototype.setFilter = function (filter) {
        this.fire(['filterChanged', 'dirtyValues', 'dirty'], this.filter_, this.filter_ = filter);
    };
    CategoricalNumberColumn.prototype.compare = function (a, b) {
        return NumberColumn.prototype.compare.call(this, a, b);
    };
    return CategoricalNumberColumn;
})(ValueColumn);
exports.CategoricalNumberColumn = CategoricalNumberColumn;
var StackColumn = (function (_super) {
    __extends(StackColumn, _super);
    function StackColumn(id, desc) {
        _super.call(this, id, desc);
        this.missingValue = 0;
        this.children_ = [];
        this._collapsed = false;
        var that = this;
        this.adaptChange = function (old, new_) {
            that.adaptWidthChange(this.source, old, new_);
        };
    }
    StackColumn.desc = function (label) {
        if (label === void 0) { label = 'Combined'; }
        return { type: 'stack', label: label };
    };
    StackColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['collapseChanged']);
    };
    StackColumn.prototype.assignNewId = function (idGenerator) {
        _super.prototype.assignNewId.call(this, idGenerator);
        this.children_.forEach(function (c) { return c.assignNewId(idGenerator); });
    };
    Object.defineProperty(StackColumn.prototype, "children", {
        get: function () {
            return this.children_.slice();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StackColumn.prototype, "length", {
        get: function () {
            return this.children_.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StackColumn.prototype, "weights", {
        get: function () {
            var w = this.getWidth();
            return this.children_.map(function (d) { return d.getWidth() / w; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(StackColumn.prototype, "collapsed", {
        get: function () {
            return this._collapsed;
        },
        set: function (value) {
            if (this._collapsed === value) {
                return;
            }
            this.fire(['collapseChanged', 'dirtyHeader', 'dirtyValues', 'dirty'], this._collapsed, this._collapsed = value);
        },
        enumerable: true,
        configurable: true
    });
    StackColumn.prototype.flatten = function (r, offset, levelsToGo, padding) {
        if (levelsToGo === void 0) { levelsToGo = 0; }
        if (padding === void 0) { padding = 0; }
        var self = null;
        if (levelsToGo === 0 || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
            var w = this.compressed ? Column.COMPRESSED_WIDTH : this.getWidth();
            if (!this.collapsed && !this.compressed) {
                w += (this.children_.length - 1) * padding;
            }
            r.push(self = { col: this, offset: offset, width: w });
            if (levelsToGo === 0) {
                return w;
            }
        }
        var acc = offset;
        this.children_.forEach(function (c) {
            acc += c.flatten(r, acc, levelsToGo - 1, padding) + padding;
        });
        if (self) {
            self.width = acc - offset - padding;
        }
        return acc - offset - padding;
    };
    StackColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.children = this.children_.map(function (d) { return d.dump(toDescRef); });
        r.missingValue = this.missingValue;
        r.collapsed = this.collapsed;
        return r;
    };
    StackColumn.prototype.restore = function (dump, factory) {
        var _this = this;
        if (dump.missingValue) {
            this.missingValue = dump.missingValue;
        }
        dump.children.map(function (child) {
            var c = factory(child);
            if (c) {
                _this.push(c);
            }
        });
        this.collapsed = dump.collapsed === true;
        _super.prototype.restore.call(this, dump, factory);
    };
    StackColumn.prototype.insert = function (col, index, weight) {
        if (weight === void 0) { weight = NaN; }
        if (!isNumberColumn(col)) {
            return null;
        }
        if (col instanceof StackColumn) {
        }
        if (!isNaN(weight)) {
            col.setWidth((weight / (1 - weight) * this.getWidth()));
        }
        this.children_.splice(index, 0, col);
        col.parent = this;
        this.forward(col, 'dirtyHeader.stack', 'dirtyValues.stack', 'dirty.stack', 'filterChanged.stack');
        col.on('widthChanged.stack', this.adaptChange);
        _super.prototype.setWidth.call(this, this.children_.length === 1 ? col.getWidth() : (this.getWidth() + col.getWidth()));
        this.fire(['addColumn', 'dirtyHeader', 'dirtyValues', 'dirty'], col, col.getWidth() / this.getWidth(), index);
        return true;
    };
    StackColumn.prototype.push = function (col, weight) {
        if (weight === void 0) { weight = NaN; }
        return this.insert(col, this.children_.length, weight);
    };
    StackColumn.prototype.indexOf = function (col) {
        var j = -1;
        this.children_.some(function (d, i) {
            if (d === col) {
                j = i;
                return true;
            }
            return false;
        });
        return j;
    };
    StackColumn.prototype.insertAfter = function (col, ref, weight) {
        if (weight === void 0) { weight = NaN; }
        var i = this.indexOf(ref);
        if (i < 0) {
            return false;
        }
        return this.insert(col, i + 1, weight);
    };
    StackColumn.prototype.adaptWidthChange = function (col, old, new_) {
        if (old === new_) {
            return;
        }
        var full = this.getWidth(), change = (new_ - old) / full;
        var oldWeight = old / full;
        var factor = (1 - oldWeight - change) / (1 - oldWeight);
        this.children_.forEach(function (c) {
            if (c === col) {
            }
            else {
                c.setWidthImpl(c.getWidth() * factor);
            }
        });
        this.fire(['widthChanged', 'dirtyHeader', 'dirtyValues', 'dirty'], full, full);
    };
    StackColumn.prototype.setWeights = function (weights) {
        var s, delta = weights.length - this.length;
        if (delta < 0) {
            s = d3.sum(weights);
            if (s <= 1) {
                for (var i = 0; i < -delta; ++i) {
                    weights.push((1 - s) * (1 / -delta));
                }
            }
            else if (s <= 100) {
                for (var i = 0; i < -delta; ++i) {
                    weights.push((100 - s) * (1 / -delta));
                }
            }
        }
        weights = weights.slice(0, this.length);
        s = d3.sum(weights) / this.getWidth();
        weights = weights.map(function (d) { return d / s; });
        this.children_.forEach(function (c, i) {
            c.setWidthImpl(weights[i]);
        });
        this.fire(['widthChanged', 'dirtyHeader', 'dirtyValues', 'dirty'], this.getWidth(), this.getWidth());
    };
    StackColumn.prototype.remove = function (child) {
        var i = this.children_.indexOf(child);
        if (i < 0) {
            return false;
        }
        this.children_.splice(i, 1);
        child.parent = null;
        if (child instanceof StackColumn) {
        }
        this.unforward(child, 'dirtyHeader.stack', 'dirtyValues.stack', 'dirty.stack', 'filterChanged.stack');
        child.on('widthChanged.stack', null);
        _super.prototype.setWidth.call(this, this.length === 0 ? 100 : this.getWidth() - child.getWidth());
        this.fire(['removeColumn', 'dirtyHeader', 'dirtyValues', 'dirty'], child);
        return true;
    };
    StackColumn.prototype.setWidth = function (value) {
        var factor = value / this.getWidth();
        this.children_.forEach(function (child) {
            child.setWidthImpl(child.getWidth() * factor);
        });
        _super.prototype.setWidth.call(this, value);
    };
    StackColumn.prototype.getValue = function (row) {
        var w = this.getWidth();
        var v = this.children_.reduce(function (acc, d) { return acc + d.getValue(row) * (d.getWidth() / w); }, 0);
        if (typeof (v) === 'undefined' || v == null || isNaN(v)) {
            return this.missingValue;
        }
        return v;
    };
    StackColumn.prototype.getNumber = function (row) {
        return this.getValue(row);
    };
    StackColumn.prototype.compare = function (a, b) {
        return numberCompare(this.getValue(a), this.getValue(b));
    };
    StackColumn.prototype.isFiltered = function () {
        return this.children_.some(function (d) { return d.isFiltered(); });
    };
    StackColumn.prototype.filter = function (row) {
        return this.children_.every(function (d) { return d.filter(row); });
    };
    return StackColumn;
})(Column);
exports.StackColumn = StackColumn;
var RankColumn = (function (_super) {
    __extends(RankColumn, _super);
    function RankColumn(id, desc) {
        var _this = this;
        _super.call(this, id, desc);
        this.sortBy_ = null;
        this.ascending = false;
        this.columns_ = [];
        this.comparator = function (a, b) {
            if (_this.sortBy_ === null) {
                return 0;
            }
            var r = _this.sortBy_.compare(a, b);
            return _this.ascending ? r : -r;
        };
        this.dirtyOrder = function () {
            _this.fire(['dirtyOrder', 'dirtyValues', 'dirty'], _this.sortCriteria());
        };
        this.order = [];
        this.setWidthImpl(50);
    }
    RankColumn.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['sortCriteriaChanged', 'dirtyOrder', 'orderChanged']);
    };
    RankColumn.prototype.assignNewId = function (idGenerator) {
        _super.prototype.assignNewId.call(this, idGenerator);
        this.columns_.forEach(function (c) { return c.assignNewId(idGenerator); });
    };
    RankColumn.prototype.setOrder = function (order) {
        this.fire(['orderChanged', 'dirtyValues', 'dirty'], this.order, this.order = order);
    };
    RankColumn.prototype.getOrder = function () {
        return this.order;
    };
    RankColumn.prototype.dump = function (toDescRef) {
        var r = _super.prototype.dump.call(this, toDescRef);
        r.columns = this.columns_.map(function (d) { return d.dump(toDescRef); });
        r.sortCriteria = {
            asc: this.ascending
        };
        if (this.sortBy_) {
            r.sortCriteria.sortBy = this.sortBy_.id;
        }
        return r;
    };
    RankColumn.prototype.restore = function (dump, factory) {
        var _this = this;
        _super.prototype.restore.call(this, dump, factory);
        dump.columns.map(function (child) {
            var c = factory(child);
            if (c) {
                _this.push(c);
            }
        });
        if (dump.sortCriteria) {
            this.ascending = dump.sortCriteria.asc;
            if (dump.sortCriteria.sortBy) {
                var help = this.columns_.filter(function (d) { return d.id === dump.sortCriteria.sortBy; });
                this.sortBy(help.length === 0 ? null : help[0], dump.sortCriteria.asc);
            }
        }
    };
    RankColumn.prototype.flatten = function (r, offset, levelsToGo, padding) {
        if (levelsToGo === void 0) { levelsToGo = 0; }
        if (padding === void 0) { padding = 0; }
        r.push({ col: this, offset: offset, width: this.getWidth() });
        var acc = offset + this.getWidth() + padding;
        if (levelsToGo > 0 || levelsToGo <= Column.FLAT_ALL_COLUMNS) {
            this.columns_.forEach(function (c) {
                acc += c.flatten(r, acc, levelsToGo - 1, padding) + padding;
            });
        }
        return acc - offset;
    };
    RankColumn.prototype.sortCriteria = function () {
        return {
            col: this.sortBy_,
            asc: this.ascending
        };
    };
    RankColumn.prototype.sortByMe = function (ascending) {
        if (ascending === void 0) { ascending = false; }
        return false;
    };
    RankColumn.prototype.toggleMySorting = function () {
        return false;
    };
    RankColumn.prototype.findMyRanker = function () {
        return this;
    };
    RankColumn.prototype.insertAfterMe = function (col) {
        return this.insert(col, 0) !== null;
    };
    RankColumn.prototype.toggleSorting = function (col) {
        if (this.sortBy_ === col) {
            return this.sortBy(col, !this.ascending);
        }
        return this.sortBy(col);
    };
    RankColumn.prototype.sortBy = function (col, ascending) {
        if (ascending === void 0) { ascending = false; }
        if (col !== null && col.findMyRanker() !== this) {
            return false;
        }
        if (this.sortBy_ === col && this.ascending === ascending) {
            return true;
        }
        if (this.sortBy_) {
            this.sortBy_.on('dirtyValues.order', null);
        }
        var bak = this.sortCriteria();
        this.sortBy_ = col;
        if (this.sortBy_) {
            this.sortBy_.on('dirtyValues.order', this.dirtyOrder);
        }
        this.ascending = ascending;
        this.fire(['sortCriteriaChanged', 'dirtyOrder', 'dirtyHeader', 'dirtyValues', 'dirty'], bak, this.sortCriteria());
        return true;
    };
    Object.defineProperty(RankColumn.prototype, "children", {
        get: function () {
            return this.columns_.slice();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RankColumn.prototype, "length", {
        get: function () {
            return this.columns_.length;
        },
        enumerable: true,
        configurable: true
    });
    RankColumn.prototype.insert = function (col, index) {
        if (index === void 0) { index = this.columns_.length; }
        this.columns_.splice(index, 0, col);
        col.parent = this;
        this.forward(col, 'dirtyValues.ranking', 'dirtyHeader.ranking', 'dirty.ranking', 'filterChanged.ranking');
        col.on('filterChanged.order', this.dirtyOrder);
        this.fire(['addColumn', 'dirtyHeader', 'dirtyValues', 'dirty'], col, index);
        if (this.sortBy_ === null) {
            this.sortBy(col);
        }
        return col;
    };
    RankColumn.prototype.insertAfter = function (col, ref) {
        if (ref === this) {
            return this.insert(col, 0) != null;
        }
        var i = this.columns_.indexOf(ref);
        if (i < 0) {
            return false;
        }
        return this.insert(col, i + 1) != null;
    };
    RankColumn.prototype.push = function (col) {
        return this.insert(col);
    };
    RankColumn.prototype.remove = function (col) {
        var i = this.columns_.indexOf(col);
        if (i < 0) {
            return false;
        }
        this.unforward(col, 'dirtyValues.ranking', 'dirtyHeader.ranking', 'dirty.ranking', 'filterChanged.ranking');
        col.parent = null;
        this.columns_.splice(i, 1);
        this.fire(['removeColumn', 'dirtyHeader', 'dirtyValues', 'dirty'], col);
        if (this.sortBy_ === col) {
            this.sortBy(this.columns_.length > 0 ? this.columns_[0] : null);
        }
        return true;
    };
    Object.defineProperty(RankColumn.prototype, "flatColumns", {
        get: function () {
            var r = [];
            this.flatten(r, 0, Column.FLAT_ALL_COLUMNS);
            return r.map(function (d) { return d.col; });
        },
        enumerable: true,
        configurable: true
    });
    RankColumn.prototype.find = function (id_or_filter) {
        var filter = typeof (id_or_filter) === 'string' ? function (col) { return col.id === id_or_filter; } : id_or_filter;
        var r = this.flatColumns;
        for (var i = 0; i < r.length; ++i) {
            if (filter(r[i])) {
                return r[i];
            }
        }
        return null;
    };
    RankColumn.prototype.toSortingDesc = function (toId) {
        var resolve = function (s) {
            if (s === null) {
                return null;
            }
            if (s instanceof StackColumn) {
                var w = s.weights;
                return s.children.map(function (child, i) {
                    return {
                        weight: w[i],
                        id: resolve(child)
                    };
                });
            }
            return toId(s.desc);
        };
        var id = resolve(this.sortBy_);
        if (id === null) {
            return null;
        }
        return {
            id: id,
            asc: this.ascending
        };
    };
    RankColumn.prototype.isFiltered = function () {
        return this.columns_.some(function (d) { return d.isFiltered(); });
    };
    RankColumn.prototype.filter = function (row) {
        return this.columns_.every(function (d) { return d.filter(row); });
    };
    return RankColumn;
})(ValueColumn);
exports.RankColumn = RankColumn;
exports.createStackDesc = StackColumn.desc;
function createActionDesc(label) {
    if (label === void 0) { label = 'actions'; }
    return { type: 'actions', label: label };
}
exports.createActionDesc = createActionDesc;
function models() {
    return {
        number: NumberColumn,
        string: StringColumn,
        link: LinkColumn,
        stack: StackColumn,
        rank: RankColumn,
        categorical: CategoricalColumn,
        ordinal: CategoricalNumberColumn,
        actions: DummyColumn,
        annotate: AnnotateColumn
    };
}
exports.models = models;

},{"./utils":8,"d3":undefined}],4:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var model = require('./model');
var utils = require('./utils');
var d3 = require('d3');
function computeStats(arr, acc, range) {
    if (arr.length === 0) {
        return {
            min: NaN,
            max: NaN,
            mean: NaN,
            count: 0,
            maxBin: 0,
            hist: []
        };
    }
    var hist = d3.layout.histogram().value(acc);
    if (range) {
        hist.range(function () { return range; });
    }
    var ex = d3.extent(arr, acc);
    var hist_data = hist(arr);
    return {
        min: ex[0],
        max: ex[1],
        mean: d3.mean(arr, acc),
        count: arr.length,
        maxBin: d3.max(hist_data, function (d) { return d.y; }),
        hist: hist_data
    };
}
function computeHist(arr, acc, categories) {
    var m = d3.map();
    categories.forEach(function (cat) { return m.set(cat, 0); });
    arr.forEach(function (a) {
        var vs = acc(a);
        if (vs == null) {
            return;
        }
        vs.forEach(function (v) {
            m.set(v, (m.get(v) || 0) + 1);
        });
    });
    return {
        maxBin: d3.max(m.values()),
        hist: m.entries().map(function (entry) { return ({ cat: entry.key, y: entry.value }); })
    };
}
var DataProvider = (function (_super) {
    __extends(DataProvider, _super);
    function DataProvider() {
        _super.call(this);
        this.rankings_ = [];
        this.selection = d3.set();
        this.uid = 0;
        this.columnTypes = model.models();
        var that = this;
        this.reorder = function () {
            that.triggerReorder(this.source);
        };
    }
    DataProvider.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['addColumn', 'removeColumn', 'addRanking', 'removeRanking', 'dirty', 'dirtyHeader', 'dirtyValues', 'orderChanged', 'selectionChanged']);
    };
    DataProvider.prototype.getColumns = function () {
        return [];
    };
    DataProvider.prototype.pushRanking = function (existing) {
        var r = this.cloneRanking(existing);
        this.pushRankingImpl(r);
        return r;
    };
    DataProvider.prototype.pushRankingImpl = function (r) {
        this.rankings_.push(r);
        this.forward(r, 'addColumn.provider', 'removeColumn.provider', 'dirty.provider', 'dirtyHeader.provider', 'orderChanged.provider', 'dirtyValues.provider');
        r.on('dirtyOrder.provider', this.reorder);
        this.fire(['addRanking', 'dirtyHeader', 'dirtyValues', 'dirty'], r);
    };
    DataProvider.prototype.triggerReorder = function (ranking) {
        this.sort(ranking).then(function (order) { return ranking.setOrder(order); });
    };
    DataProvider.prototype.removeRanking = function (ranking) {
        var i = this.rankings_.indexOf(ranking);
        if (i < 0) {
            return false;
        }
        this.unforward(ranking, 'addColumn.provider', 'removeColumn.provider', 'dirty.provider', 'dirtyHeader.provider', 'orderChanged.provider', 'dirtyOrder.provider', 'dirtyValues.provider');
        this.rankings_.splice(i, 1);
        ranking.on('dirtyOrder.provider', null);
        this.cleanUpRanking(ranking);
        this.fire(['removeRanking', 'dirtyHeader', 'dirtyValues', 'dirty'], ranking);
        return true;
    };
    DataProvider.prototype.clearRankings = function () {
        var _this = this;
        this.rankings_.forEach(function (ranking) {
            _this.unforward(ranking, 'addColumn.provider', 'removeColumn.provider', 'dirty.provider', 'dirtyHeader.provider', 'dirtyOrder.provider', 'dirtyValues.provider');
            ranking.on('dirtyOrder.provider', null);
            _this.cleanUpRanking(ranking);
        });
        this.rankings_ = [];
        this.fire(['removeRanking', 'dirtyHeader', 'dirtyValues', 'dirty']);
    };
    DataProvider.prototype.getRankings = function () {
        return this.rankings_.slice();
    };
    DataProvider.prototype.getLastRanking = function () {
        return this.rankings_[this.rankings_.length - 1];
    };
    DataProvider.prototype.cleanUpRanking = function (ranking) {
    };
    DataProvider.prototype.cloneRanking = function (existing) {
        return null;
    };
    DataProvider.prototype.push = function (ranking, desc) {
        var r = this.create(desc);
        if (r) {
            ranking.push(r);
            return r;
        }
        return null;
    };
    DataProvider.prototype.insert = function (ranking, index, desc) {
        var r = this.create(desc);
        if (r) {
            ranking.insert(r, index);
            return r;
        }
        return null;
    };
    DataProvider.prototype.nextId = function () {
        return 'col' + (this.uid++);
    };
    DataProvider.prototype.create = function (desc) {
        var type = this.columnTypes[desc.type];
        if (type) {
            return new type(this.nextId(), desc);
        }
        return null;
    };
    DataProvider.prototype.clone = function (col) {
        var dump = col.dump(function (d) { return d; });
        return this.restoreColumn(dump);
    };
    DataProvider.prototype.restoreColumn = function (dump) {
        var _this = this;
        var create = function (d) {
            var type = _this.columnTypes[d.desc.type];
            var c = new type('', d.desc);
            c.restore(d, create);
            c.assignNewId(_this.nextId.bind(_this));
            return c;
        };
        return create(dump);
    };
    DataProvider.prototype.find = function (id_or_filter) {
        var filter = typeof (id_or_filter) === 'string' ? function (col) { return col.id === id_or_filter; } : id_or_filter;
        for (var i = 0; i < this.rankings_.length; ++i) {
            var r = this.rankings_[i].find(filter);
            if (r) {
                return r;
            }
        }
        return null;
    };
    DataProvider.prototype.dump = function () {
        var _this = this;
        return {
            uid: this.uid,
            selection: this.selection.values().map(Number),
            rankings: this.rankings_.map(function (r) { return r.dump(_this.toDescRef); })
        };
    };
    DataProvider.prototype.dumpColumn = function (col) {
        return col.dump(this.toDescRef);
    };
    DataProvider.prototype.toDescRef = function (desc) {
        return desc;
    };
    DataProvider.prototype.fromDescRef = function (descRef) {
        return descRef;
    };
    DataProvider.prototype.restore = function (dump) {
        var _this = this;
        var create = function (d) {
            var desc = _this.fromDescRef(d.desc);
            var c = null;
            if (desc && desc.type) {
                var type = _this.columnTypes[desc.type];
                c = new type(d.id, desc);
                c.restore(d, create);
            }
            return c;
        };
        this.clearRankings();
        this.uid = dump.uid || 0;
        if (dump.selection) {
            dump.selection.forEach(function (s) { return _this.selection.add(String(s)); });
        }
        if (dump.rankings) {
            dump.rankings.forEach(function (r) {
                var ranking = _this.pushRanking();
                ranking.restore(r, create);
            });
        }
        if (dump.layout) {
            Object.keys(dump.layout).forEach(function (key) {
                _this.deriveRanking(dump.layout[key]);
            });
        }
        var idGenerator = this.nextId.bind(this);
        this.rankings_.forEach(function (r) {
            r.children.forEach(function (c) { return c.assignNewId(idGenerator); });
        });
    };
    DataProvider.prototype.findDesc = function (ref) {
        return null;
    };
    DataProvider.prototype.deriveDefault = function () {
        var _this = this;
        if (this.rankings_.length > 0) {
            return;
        }
        var r = this.pushRanking();
        this.getColumns().forEach(function (col) {
            _this.push(r, col);
        });
    };
    DataProvider.prototype.deriveRanking = function (bundle) {
        var _this = this;
        var toCol = function (column) {
            if (column.type === 'rank') {
                return null;
            }
            if (column.type === 'actions') {
                var r_1 = _this.create(model.createActionDesc(column.label || 'actions'));
                r_1.restore(column, null);
                return r_1;
            }
            if (column.type === 'stacked') {
                var r_2 = _this.create(model.StackColumn.desc(column.label || 'Combined'));
                (column.children || []).forEach(function (col) {
                    var c = toCol(col);
                    if (c) {
                        r_2.push(c);
                    }
                });
                return r_2;
            }
            else {
                var desc = _this.findDesc(column.column);
                if (desc) {
                    var r_3 = _this.create(desc);
                    column.label = column.label || desc.label || desc.column;
                    r_3.restore(column, null);
                    return r_3;
                }
            }
            return null;
        };
        var r = this.pushRanking();
        bundle.forEach(function (column) {
            var col = toCol(column);
            if (col) {
                r.push(col);
            }
        });
        return r;
    };
    DataProvider.prototype.sort = function (ranking) {
        return Promise.reject('not implemented');
    };
    DataProvider.prototype.view = function (indices) {
        return Promise.reject('not implemented');
    };
    DataProvider.prototype.mappingSample = function (col) {
        return Promise.reject('not implemented');
    };
    DataProvider.prototype.stats = function (indices) {
        return {
            stats: function (col) { return Promise.reject('not implemented'); },
            hist: function (col) { return Promise.reject('not implemented'); }
        };
    };
    DataProvider.prototype.rowKey = function (row, i) {
        return typeof (row) === 'number' ? String(row) : String(row._index);
    };
    DataProvider.prototype.isSelected = function (index) {
        return this.selection.has(String(index));
    };
    DataProvider.prototype.select = function (index) {
        this.selection.add(String(index));
        this.fire('selectionChanged', this.selection.values().map(Number));
    };
    DataProvider.prototype.searchSelect = function (search, col) {
    };
    DataProvider.prototype.selectAll = function (indices) {
        var _this = this;
        indices.forEach(function (index) {
            _this.selection.add(String(index));
        });
        this.fire('selectionChanged', this.selection.values().map(Number));
    };
    DataProvider.prototype.setSelection = function (indices) {
        var _this = this;
        if (this.selection.size() === indices.length && indices.every(function (i) { return _this.selection.has(String(i)); })) {
            return;
        }
        this.selection = d3.set();
        this.selectAll(indices);
    };
    DataProvider.prototype.toggleSelection = function (index, additional) {
        if (additional === void 0) { additional = false; }
        if (this.isSelected(index)) {
            if (additional) {
                this.deselect(index);
            }
            else {
                this.clearSelection();
            }
            return false;
        }
        else {
            if (additional) {
                this.select(index);
            }
            else {
                this.setSelection([index]);
            }
            return true;
        }
    };
    DataProvider.prototype.deselect = function (index) {
        this.selection.remove(String(index));
        this.fire('selectionChanged', this.selection.values().map(Number));
    };
    DataProvider.prototype.selectedRows = function () {
        if (this.selection.empty()) {
            return Promise.resolve([]);
        }
        return this.view(this.getSelection());
    };
    DataProvider.prototype.getSelection = function () {
        var indices = [];
        this.selection.forEach(function (s) { return indices.push(+s); });
        indices.sort();
        return indices;
    };
    DataProvider.prototype.clearSelection = function () {
        this.selection = d3.set();
        this.fire('selectionChanged', []);
    };
    DataProvider.prototype.exportTable = function (ranking, options) {
        if (options === void 0) { options = {}; }
        var op = {
            separator: '\t',
            newline: '\n',
            header: true,
            quote: false,
            quoteChar: '"'
        };
        function quote(l, c) {
            if (op.quote && (!c || !model.isNumberColumn(c))) {
                return op.quoteChar + l + op.quoteChar;
            }
            return l;
        }
        utils.merge(op, options);
        var columns = ranking.flatColumns;
        return this.view(ranking.getOrder()).then(function (data) {
            var r = [];
            if (op.header) {
                r.push(columns.map(function (d) { return quote(d.label); }).join(op.separator));
            }
            data.forEach(function (row) {
                r.push(columns.map(function (c) { return quote(c.getLabel(row), c); }).join(op.separator));
            });
            return r.join(op.newline);
        });
    };
    return DataProvider;
})(utils.AEventDispatcher);
exports.DataProvider = DataProvider;
var CommonDataProvider = (function (_super) {
    __extends(CommonDataProvider, _super);
    function CommonDataProvider(columns) {
        var _this = this;
        if (columns === void 0) { columns = []; }
        _super.call(this);
        this.columns = columns;
        this.rankingIndex = 0;
        this.rowGetter = function (row, id, desc) { return row[desc.column]; };
        this.columns = columns.slice();
        columns.forEach(function (d) {
            d.accessor = _this.rowGetter;
            d.label = d.label || d.column;
        });
    }
    CommonDataProvider.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['addDesc']);
    };
    CommonDataProvider.prototype.pushDesc = function (column) {
        var d = column;
        d.accessor = this.rowGetter;
        d.label = column.label || d.column;
        this.columns.push(column);
        this.fire('addDesc', d);
    };
    CommonDataProvider.prototype.getColumns = function () {
        return this.columns.slice();
    };
    CommonDataProvider.prototype.findDesc = function (ref) {
        return this.columns.filter(function (c) { return c.column === ref; })[0];
    };
    CommonDataProvider.prototype.toDescRef = function (desc) {
        return desc.column ? desc.type + '@' + desc.column : desc;
    };
    CommonDataProvider.prototype.fromDescRef = function (descRef) {
        if (typeof (descRef) === 'string') {
            return this.columns.filter(function (d) { return d.type + '@' + d.column === descRef; })[0];
        }
        return descRef;
    };
    CommonDataProvider.prototype.restore = function (dump) {
        _super.prototype.restore.call(this, dump);
        this.rankingIndex = 1 + d3.max(this.getRankings(), function (r) { return +r.id.substring(4); });
    };
    CommonDataProvider.prototype.nextRankingId = function () {
        return 'rank' + (this.rankingIndex++);
    };
    return CommonDataProvider;
})(DataProvider);
exports.CommonDataProvider = CommonDataProvider;
var LocalDataProvider = (function (_super) {
    __extends(LocalDataProvider, _super);
    function LocalDataProvider(data, columns, options) {
        if (columns === void 0) { columns = []; }
        if (options === void 0) { options = {}; }
        _super.call(this, columns);
        this.data = data;
        this.options = {
            filterGlobally: false
        };
        utils.merge(this.options, options);
        data.forEach(function (d, i) {
            d._rankings = {};
            d._index = i;
        });
        var that = this;
        this.reorderall = function () {
            var ranking = this.source;
            that.getRankings().forEach(function (r) {
                if (r !== ranking) {
                    r.dirtyOrder();
                }
            });
        };
    }
    LocalDataProvider.prototype.cloneRanking = function (existing) {
        var _this = this;
        var id = this.nextRankingId();
        var rankDesc = {
            label: 'Rank',
            type: 'rank',
            accessor: function (row, id) { return (row._rankings[id] + 1) || 1; }
        };
        var new_ = new model.RankColumn(id, rankDesc);
        if (existing) {
            this.data.forEach(function (row) {
                var r = row._rankings;
                r[id] = r[existing.id];
            });
            existing.children.forEach(function (child) {
                _this.push(new_, child.desc);
            });
        }
        if (this.options.filterGlobally) {
            new_.on('filterChanged.reorderall', this.reorderall);
        }
        return new_;
    };
    LocalDataProvider.prototype.cleanUpRanking = function (ranking) {
        if (this.options.filterGlobally) {
            ranking.on('filterChanged.reorderall', null);
        }
        this.data.forEach(function (d) { return delete d._rankings[ranking.id]; });
    };
    LocalDataProvider.prototype.sort = function (ranking) {
        var helper = this.data.map(function (r, i) { return ({ row: r, i: i, prev: r._rankings[ranking.id] || 0 }); });
        if (this.options.filterGlobally) {
            var filtered = this.getRankings().filter(function (d) { return d.isFiltered(); });
            if (filtered.length > 0) {
                helper = helper.filter(function (d) { return filtered.every(function (f) { return f.filter(d.row); }); });
            }
        }
        else if (ranking.isFiltered()) {
            helper = helper.filter(function (d) { return ranking.filter(d.row); });
        }
        helper.sort(function (a, b) { return ranking.comparator(a.row, b.row); });
        var argsort = helper.map(function (r, i) {
            r.row._rankings[ranking.id] = i;
            return r.i;
        });
        return Promise.resolve(argsort);
    };
    LocalDataProvider.prototype.view = function (indices) {
        var _this = this;
        var slice = indices.map(function (index) { return _this.data[index]; });
        return Promise.resolve(slice);
    };
    LocalDataProvider.prototype.stats = function (indices) {
        var _this = this;
        var d = null;
        var getD = function () { return d === null ? (d = _this.view(indices)) : d; };
        return {
            stats: function (col) { return getD().then(function (data) { return computeStats(data, col.getNumber.bind(col), [0, 1]); }); },
            hist: function (col) { return getD().then(function (data) { return computeHist(data, col.getCategories.bind(col), col.categories); }); }
        };
    };
    LocalDataProvider.prototype.mappingSample = function (col) {
        return Promise.resolve(this.data.map(col.getRawValue.bind(col)));
    };
    LocalDataProvider.prototype.searchSelect = function (search, col) {
        var f = typeof search === 'string' ? function (v) { return v.indexOf(search) >= 0; } : function (v) { return v.match(search) != null; };
        var indices = this.data.filter(function (row) {
            return f(col.getLabel(row));
        }).map(function (row) { return row._index; });
        this.setSelection(indices);
    };
    return LocalDataProvider;
})(CommonDataProvider);
exports.LocalDataProvider = LocalDataProvider;
var RemoteDataProvider = (function (_super) {
    __extends(RemoteDataProvider, _super);
    function RemoteDataProvider(server, columns) {
        if (columns === void 0) { columns = []; }
        _super.call(this, columns);
        this.server = server;
        this.ranks = {};
    }
    RemoteDataProvider.prototype.cloneRanking = function (existing) {
        var _this = this;
        var id = this.nextRankingId();
        var rankDesc = {
            label: 'Rank',
            type: 'rank',
            accessor: function (row, id) { return _this.ranks[id][row._index] || 0; }
        };
        if (existing) {
            this.ranks[id] = this.ranks[existing.id];
        }
        return new model.RankColumn(id, rankDesc);
    };
    RemoteDataProvider.prototype.cleanUpRanking = function (ranking) {
        delete this.ranks[ranking.id];
    };
    RemoteDataProvider.prototype.sort = function (ranking) {
        var _this = this;
        var desc = ranking.toSortingDesc(function (desc) { return desc.column; });
        return this.server.sort(desc).then(function (argsort) {
            _this.ranks[ranking.id] = argsort;
            return argsort;
        });
    };
    RemoteDataProvider.prototype.view = function (argsort) {
        return this.server.view(argsort).then(function (view) {
            view.forEach(function (d, i) { return d._index = argsort[i]; });
            return view;
        });
    };
    RemoteDataProvider.prototype.mappingSample = function (col) {
        return this.server.mappingSample(col.desc.column);
    };
    RemoteDataProvider.prototype.searchSelect = function (search, col) {
        var _this = this;
        this.server.search(search, col.desc.column).then(function (indices) {
            _this.setSelection(indices);
        });
    };
    return RemoteDataProvider;
})(CommonDataProvider);
exports.RemoteDataProvider = RemoteDataProvider;

},{"./model":3,"./utils":8,"d3":undefined}],5:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var model = require('./model');
var DefaultCellRenderer = (function () {
    function DefaultCellRenderer() {
        this.textClass = 'text';
        this.align = 'left';
    }
    DefaultCellRenderer.prototype.render = function ($col, col, rows, context) {
        var $rows = $col.datum(col).selectAll('text.' + this.textClass).data(rows, context.rowKey);
        $rows.enter().append('text').attr({
            'class': this.textClass,
            'clip-path': 'url(#' + context.idPrefix + 'clipCol' + col.id + ')',
            y: function (d, i) { return context.cellPrevY(i); }
        });
        var alignmentShift = 2;
        if (this.align === 'right') {
            alignmentShift = col.getWidth() - 5;
        }
        else if (this.align === 'center') {
            alignmentShift = col.getWidth() * 0.5;
        }
        $rows.attr({
            x: function (d, i) { return context.cellX(i) + alignmentShift; },
            'data-index': function (d, i) { return i; }
        }).text(function (d) { return col.getLabel(d); });
        context.animated($rows).attr({
            y: function (d, i) { return context.cellY(i); }
        });
        $rows.exit().remove();
    };
    DefaultCellRenderer.prototype.findRow = function ($col, index) {
        return $col.selectAll('text.' + this.textClass + '[data-index="' + index + '"]');
    };
    DefaultCellRenderer.prototype.mouseEnter = function ($col, $row, col, row, index, context) {
        var rowNode = $row.node();
        var n = this.findRow($col, index).node();
        if (n) {
            rowNode.appendChild(n);
        }
    };
    DefaultCellRenderer.prototype.mouseLeave = function ($col, $row, col, row, index, context) {
        var colNode = $col.node();
        var rowNode = $row.node();
        if (rowNode.hasChildNodes()) {
            colNode.appendChild(rowNode.firstChild);
        }
        $row.selectAll('*').remove();
    };
    return DefaultCellRenderer;
})();
exports.DefaultCellRenderer = DefaultCellRenderer;
var DerivedCellRenderer = (function (_super) {
    __extends(DerivedCellRenderer, _super);
    function DerivedCellRenderer(extraFuncs) {
        var _this = this;
        _super.call(this);
        Object.keys(extraFuncs).forEach(function (key) {
            _this[key] = extraFuncs[key];
        });
    }
    return DerivedCellRenderer;
})(DefaultCellRenderer);
var BarCellRenderer = (function (_super) {
    __extends(BarCellRenderer, _super);
    function BarCellRenderer() {
        _super.apply(this, arguments);
    }
    BarCellRenderer.prototype.render = function ($col, col, rows, context) {
        var _this = this;
        var $rows = $col.datum(col).selectAll('rect.bar').data(rows, context.rowKey);
        $rows.enter().append('rect').attr({
            'class': 'bar ' + col.cssClass,
            x: function (d, i) { return context.cellX(i); },
            y: function (d, i) { return context.cellPrevY(i) + context.option('rowPadding', 1); },
            width: function (d) {
                var n = col.getWidth() * col.getValue(d);
                return isNaN(n) ? 0 : n;
            }
        }).style('fill', col.color);
        $rows.attr({
            'data-index': function (d, i) { return i; },
            height: function (d, i) { return context.rowHeight(i) - context.option('rowPadding', 1) * 2; }
        });
        context.animated($rows).attr({
            x: function (d, i) { return context.cellX(i); },
            y: function (d, i) { return context.cellY(i) + context.option('rowPadding', 1); },
            width: function (d) {
                var n = col.getWidth() * col.getValue(d);
                return isNaN(n) ? 0 : n;
            }
        }).style({
            fill: function (d, i) { return _this.colorOf(d, i, col); }
        });
        $rows.exit().remove();
    };
    BarCellRenderer.prototype.colorOf = function (d, i, col) {
        return col.color;
    };
    BarCellRenderer.prototype.findRow = function ($col, index) {
        return $col.selectAll('rect.bar[data-index="' + index + '"]');
    };
    BarCellRenderer.prototype.mouseEnter = function ($col, $row, col, row, index, context) {
        var rowNode = this.findRow($col, index);
        if (!rowNode.empty()) {
            $row.node().appendChild((rowNode.node()));
            $row.append('text').datum(rowNode.datum()).attr({
                'class': 'number',
                'clip-path': 'url(#' + context.idPrefix + 'clipCol' + col.id + ')',
                transform: 'translate(' + context.cellX(index) + ',' + context.cellY(index) + ')'
            }).text(function (d) { return col.getLabel(d); });
        }
    };
    return BarCellRenderer;
})(DefaultCellRenderer);
exports.BarCellRenderer = BarCellRenderer;
var HeatMapCellRenderer = (function (_super) {
    __extends(HeatMapCellRenderer, _super);
    function HeatMapCellRenderer() {
        _super.apply(this, arguments);
    }
    HeatMapCellRenderer.prototype.render = function ($col, col, rows, context) {
        var _this = this;
        var $rows = $col.datum(col).selectAll('rect.heatmap').data(rows, context.rowKey);
        $rows.enter().append('rect').attr({
            'class': 'bar ' + col.cssClass,
            x: function (d, i) { return context.cellX(i); },
            y: function (d, i) { return context.cellPrevY(i) + context.option('rowPadding', 1); },
            width: function (d, i) { return context.rowHeight(i) - context.option('rowPadding', 1) * 2; }
        }).style('fill', col.color);
        $rows.attr({
            'data-index': function (d, i) { return i; },
            width: function (d, i) { return context.rowHeight(i) - context.option('rowPadding', 1) * 2; },
            height: function (d, i) { return context.rowHeight(i) - context.option('rowPadding', 1) * 2; }
        });
        context.animated($rows).attr({
            x: function (d, i) { return context.cellX(i); },
            y: function (d, i) { return context.cellY(i) + context.option('rowPadding', 1); }
        }).style({
            fill: function (d, i) { return _this.colorOf(d, i, col); }
        });
        $rows.exit().remove();
    };
    HeatMapCellRenderer.prototype.colorOf = function (d, i, col) {
        var v = col.getValue(d);
        if (isNaN(v)) {
            v = 0;
        }
        var color = d3.hsl(col.color || model.Column.DEFAULT_COLOR);
        color.l = v;
        return color.toString();
    };
    HeatMapCellRenderer.prototype.findRow = function ($col, index) {
        return $col.selectAll('rect.heatmap[data-index="' + index + '"]');
    };
    HeatMapCellRenderer.prototype.mouseEnter = function ($col, $row, col, row, index, context) {
        var rowNode = this.findRow($col, index);
        if (!rowNode.empty()) {
            $row.node().appendChild((rowNode.node()));
            $row.append('text').datum(rowNode.datum()).attr({
                'class': 'number',
                'clip-path': 'url(#' + context.idPrefix + 'clipCol' + col.id + ')',
                transform: 'translate(' + context.cellX(index) + ',' + context.cellY(index) + ')'
            }).text(function (d) { return col.getLabel(d); });
        }
    };
    return HeatMapCellRenderer;
})(DefaultCellRenderer);
exports.HeatMapCellRenderer = HeatMapCellRenderer;
var DerivedBarCellRenderer = (function (_super) {
    __extends(DerivedBarCellRenderer, _super);
    function DerivedBarCellRenderer(extraFuncs) {
        var _this = this;
        _super.call(this);
        Object.keys(extraFuncs).forEach(function (key) {
            _this[key] = extraFuncs[key];
        });
    }
    return DerivedBarCellRenderer;
})(BarCellRenderer);
var ActionCellRenderer = (function () {
    function ActionCellRenderer() {
    }
    ActionCellRenderer.prototype.render = function ($col, col, rows, context) {
    };
    ActionCellRenderer.prototype.mouseEnter = function ($col, $row, col, row, index, context) {
        var actions = context.option('actions', []);
        var $actions = $row.append('text').attr({
            'class': 'actions fa',
            x: context.cellX(index),
            y: context.cellPrevY(index),
            'data-index': index
        }).selectAll('tspan').data(actions);
        $actions.enter().append('tspan')
            .text(function (d) { return d.icon; })
            .attr('title', function (d) { return d.name; })
            .on('click', function (d) {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            d.action(row);
        });
    };
    ActionCellRenderer.prototype.mouseLeave = function ($col, $row, col, row, index, context) {
        $row.selectAll('*').remove();
    };
    return ActionCellRenderer;
})();
exports.ActionCellRenderer = ActionCellRenderer;
var AnnotateCellRenderer = (function (_super) {
    __extends(AnnotateCellRenderer, _super);
    function AnnotateCellRenderer() {
        _super.apply(this, arguments);
    }
    AnnotateCellRenderer.prototype.mouseEnter = function ($col, $row, col, row, index, context) {
        this.findRow($col, index).attr('display', 'none');
        $row.append('foreignObject').attr({
            x: context.cellX(index) - 2,
            y: context.cellPrevY(index) - 2,
            'data-index': index,
            width: col.getWidth(),
            height: context.rowHeight(index)
        }).append('xhtml:input').attr({
            type: 'text',
            value: col.getValue(row)
        }).style({
            width: col.getWidth() + 'px'
        }).on('change', function () {
            var text = this.value;
            col.setValue(row, text);
        }).on('click', function () { return d3.event.stopPropagation(); });
    };
    AnnotateCellRenderer.prototype.mouseLeave = function ($col, $row, col, row, index, context) {
        this.findRow($col, index).attr('display', null);
        var node = $row.select('input').node();
        if (node) {
            col.setValue(row, node.value);
        }
        $row.selectAll('*').remove();
    };
    return AnnotateCellRenderer;
})(DefaultCellRenderer);
var defaultRendererInstance = new DefaultCellRenderer();
var barRendererInstance = new BarCellRenderer();
function defaultRenderer(extraFuncs) {
    if (!extraFuncs) {
        return defaultRendererInstance;
    }
    return new DerivedCellRenderer(extraFuncs);
}
exports.defaultRenderer = defaultRenderer;
function barRenderer(extraFuncs) {
    if (!extraFuncs) {
        return barRendererInstance;
    }
    return new DerivedBarCellRenderer(extraFuncs);
}
exports.barRenderer = barRenderer;
var LinkCellRenderer = (function (_super) {
    __extends(LinkCellRenderer, _super);
    function LinkCellRenderer() {
        _super.apply(this, arguments);
    }
    LinkCellRenderer.prototype.render = function ($col, col, rows, context) {
        var $rows = $col.datum(col).selectAll('text.link').data(rows, context.rowKey);
        $rows.enter().append('text').attr({
            'class': 'text link',
            'clip-path': 'url(#' + context.idPrefix + 'clipCol' + col.id + ')',
            y: function (d, i) { return context.cellPrevY(i); }
        });
        $rows.attr({
            x: function (d, i) { return context.cellX(i); },
            'data-index': function (d, i) { return i; }
        }).html(function (d) { return col.isLink(d) ? "<a class=\"link\" xlink:href=\"" + col.getValue(d) + "\" target=\"_blank\">" + col.getLabel(d) + "</a>" : col.getLabel(d); });
        context.animated($rows).attr({
            y: function (d, i) { return context.cellY(i); }
        });
        $rows.exit().remove();
    };
    LinkCellRenderer.prototype.findRow = function ($col, index) {
        return $col.selectAll('text.link[data-index="' + index + '"]');
    };
    return LinkCellRenderer;
})(DefaultCellRenderer);
var StringCellRenderer = (function (_super) {
    __extends(StringCellRenderer, _super);
    function StringCellRenderer() {
        _super.apply(this, arguments);
    }
    StringCellRenderer.prototype.render = function ($col, col, rows, context) {
        this.align = col.alignment;
        this.textClass = 'text' + (col.alignment === 'left' ? '' : '_' + col.alignment);
        return _super.prototype.render.call(this, $col, col, rows, context);
    };
    return StringCellRenderer;
})(DefaultCellRenderer);
var CategoricalRenderer = (function (_super) {
    __extends(CategoricalRenderer, _super);
    function CategoricalRenderer() {
        _super.apply(this, arguments);
        this.textClass = 'cat';
    }
    CategoricalRenderer.prototype.render = function ($col, col, rows, context) {
        var $rows = $col.datum(col).selectAll('g.' + this.textClass).data(rows, context.rowKey);
        var $rows_enter = $rows.enter().append('g').attr({
            'class': this.textClass,
            'data-index': function (d, i) { return i; },
            transform: function (d, i) { return 'translate(' + context.cellX(i) + ',' + context.cellPrevY(i) + ')'; }
        });
        $rows_enter.append('text').attr({
            'clip-path': 'url(#' + context.idPrefix + 'clipCol' + col.id + ')',
            x: function (d, i) { return context.rowHeight(i); }
        });
        $rows_enter.append('rect').attr({
            y: context.option('rowPadding', 1)
        });
        $rows.attr({
            'data-index': function (d, i) { return i; },
            transform: function (d, i) { return 'translate(' + context.cellX(i) + ',' + context.cellY(i) + ')'; }
        });
        $rows.select('text').attr({
            x: function (d, i) { return context.rowHeight(i); }
        }).text(function (d) { return col.getLabel(d); });
        $rows.select('rect').style({
            fill: function (d) { return col.getColor(d); }
        }).attr({
            height: function (d, i) { return Math.max(context.rowHeight(i) - context.option('rowPadding', 1) * 2, 0); },
            width: function (d, i) { return Math.max(context.rowHeight(i) - context.option('rowPadding', 1) * 2, 0); }
        });
        context.animated($rows).attr({
            transform: function (d, i) { return 'translate(' + context.cellX(i) + ',' + context.cellY(i) + ')'; }
        });
        $rows.exit().remove();
    };
    CategoricalRenderer.prototype.findRow = function ($col, index) {
        return $col.selectAll('g.' + this.textClass + '[data-index="' + index + '"]');
    };
    return CategoricalRenderer;
})(DefaultCellRenderer);
var StackCellRenderer = (function (_super) {
    __extends(StackCellRenderer, _super);
    function StackCellRenderer() {
        _super.apply(this, arguments);
    }
    StackCellRenderer.prototype.renderImpl = function ($base, col, context, perChild, rowGetter, animated) {
        if (animated === void 0) { animated = true; }
        var $group = $base.datum(col), children = col.children;
        var offset = 0, shifts = children.map(function (d) {
            var r = offset;
            offset += d.getWidth();
            return r;
        });
        var baseclass = 'component' + context.option('stackLevel', '');
        var ueber = context.cellX;
        var ueberOption = context.option;
        context.option = function (option, default_) {
            var r = ueberOption(option, default_);
            return option === 'stackLevel' ? r + 'N' : r;
        };
        var $children = $group.selectAll('g.' + baseclass).data(children, function (d) { return d.id; });
        $children.enter().append('g').attr({
            'class': baseclass,
            transform: function (d, i) { return 'translate(' + shifts[i] + ',0)'; }
        });
        $children.attr({
            'class': function (d) { return baseclass + ' ' + d.desc.type; },
            'data-stack': function (d, i) { return i; }
        }).each(function (d, i) {
            if (context.showStacked(col)) {
                var preChildren = children.slice(0, i);
                context.cellX = function (index) {
                    return ueber(index) - preChildren.reduce(function (prev, child) { return prev + child.getWidth() * (1 - child.getValue(rowGetter(index))); }, 0);
                };
            }
            perChild(d3.select(this), d, i, context);
        });
        (animated ? context.animated($children) : $children).attr({
            transform: function (d, i) { return 'translate(' + shifts[i] + ',0)'; }
        });
        $children.exit().remove();
        context.cellX = ueber;
        context.option = ueberOption;
    };
    StackCellRenderer.prototype.render = function ($col, stack, rows, context) {
        this.renderImpl($col, stack, context, function ($child, col, i, ccontext) {
            ccontext.render(col, $child, rows, ccontext);
        }, function (index) { return rows[index]; });
    };
    StackCellRenderer.prototype.mouseEnter = function ($col, $row, stack, row, index, context) {
        var baseclass = 'component' + context.option('stackLevel', '');
        this.renderImpl($row, stack, context, function ($row_i, col, i, ccontext) {
            var $col_i = $col.select('g.' + baseclass + '[data-stack="' + i + '"]');
            if (!$col_i.empty()) {
                ccontext.renderer(col).mouseEnter($col_i, $row_i, col, row, index, ccontext);
            }
        }, function (index) { return row; }, false);
    };
    StackCellRenderer.prototype.mouseLeave = function ($col, $row, satck, row, index, context) {
        var baseclass = 'component' + context.option('stackLevel', '');
        this.renderImpl($row, satck, context, function ($row_i, col, i, ccontext) {
            var $col_i = $col.select('g.' + baseclass + '[data-stack="' + i + '"]');
            if (!$col_i.empty()) {
                ccontext.renderer(col).mouseLeave($col_i, $row_i, col, row, index, ccontext);
            }
        }, function (index) { return row; }, false);
        $row.selectAll('*').remove();
    };
    return StackCellRenderer;
})(DefaultCellRenderer);
function renderers() {
    return {
        string: new StringCellRenderer(),
        link: new LinkCellRenderer(),
        number: barRenderer(),
        rank: defaultRenderer({
            textClass: 'rank',
            align: 'right'
        }),
        heatmap: new HeatMapCellRenderer(),
        stack: new StackCellRenderer(),
        categorical: new CategoricalRenderer(),
        ordinal: barRenderer({
            colorOf: function (d, i, col) { return col.getColor(d); }
        }),
        max: barRenderer({
            colorOf: function (d, i, col) { return col.getColor(d); }
        }),
        actions: new ActionCellRenderer(),
        annotate: new AnnotateCellRenderer()
    };
}
exports.renderers = renderers;

},{"./model":3}],6:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var d3 = require('d3');
var utils = require('./utils');
var model = require('./model');
var renderer = require('./renderer');
var dialogs = require('./ui_dialogs');
var PoolEntry = (function () {
    function PoolEntry(desc) {
        this.desc = desc;
        this.used = 0;
    }
    return PoolEntry;
})();
var PoolRenderer = (function () {
    function PoolRenderer(data, parent, options) {
        if (options === void 0) { options = {}; }
        this.data = data;
        this.options = {
            layout: 'vertical',
            elemWidth: 100,
            elemHeight: 40,
            width: 100,
            height: 500,
            additionalDesc: [],
            hideUsed: true,
            addAtEndOnClick: false
        };
        utils.merge(this.options, options);
        this.$node = d3.select(parent).append('div').classed('lu-pool', true);
        this.changeDataStorage(data);
    }
    PoolRenderer.prototype.changeDataStorage = function (data) {
        var _this = this;
        if (this.data) {
            this.data.on(['addColumn.pool', 'removeColumn.pool', 'addRanking.pool', 'removeRanking.pool', 'addDesc.pool'], null);
        }
        this.data = data;
        this.entries = data.getColumns().concat(this.options.additionalDesc).map(function (d) { return new PoolEntry(d); });
        data.on(['addDesc.pool'], function (desc) {
            _this.entries.push(new PoolEntry(desc));
            _this.update();
        });
        if (this.options.hideUsed) {
            var that = this;
            data.on(['addColumn.pool', 'removeColumn.pool'], function (col) {
                var desc = col.desc, change = this.type === 'addColumn' ? 1 : -1;
                that.entries.some(function (entry) {
                    if (entry.desc !== desc) {
                        return false;
                    }
                    entry.used += change;
                    return true;
                });
                that.update();
            });
            data.on(['addRanking.pool', 'removeRanking.pool'], function (ranking) {
                var descs = ranking.flatColumns.map(function (d) { return d.desc; }), change = this.type === 'addRanking' ? 1 : -1;
                that.entries.some(function (entry) {
                    if (descs.indexOf(entry.desc) < 0) {
                        return false;
                    }
                    entry.used += change;
                    return true;
                });
                that.update();
            });
            data.getRankings().forEach(function (ranking) {
                var descs = ranking.flatColumns.map(function (d) { return d.desc; }), change = +1;
                that.entries.some(function (entry) {
                    if (descs.indexOf(entry.desc) < 0) {
                        return false;
                    }
                    entry.used += change;
                });
            });
        }
    };
    PoolRenderer.prototype.remove = function () {
        this.$node.remove();
        if (this.data) {
            this.data.on(['addColumn.pool', 'removeColumn.pool', 'addRanking.pool', 'removeRanking.pool', 'addDesc.pool'], null);
        }
    };
    PoolRenderer.prototype.update = function () {
        var _this = this;
        var data = this.data;
        var descToShow = this.entries.filter(function (e) { return e.used === 0; }).map(function (d) { return d.desc; });
        var $headers = this.$node.selectAll('div.header').data(descToShow);
        var $headers_enter = $headers.enter().append('div').attr({
            'class': 'header',
            'draggable': true
        }).on('dragstart', function (d) {
            var e = d3.event;
            e.dataTransfer.effectAllowed = 'copyMove';
            e.dataTransfer.setData('text/plain', d.label);
            e.dataTransfer.setData('application/caleydo-lineup-column', JSON.stringify(data.toDescRef(d)));
            if (model.isNumberColumn(d)) {
                e.dataTransfer.setData('application/caleydo-lineup-column-number', JSON.stringify(data.toDescRef(d)));
            }
        }).style({
            width: this.options.elemWidth + 'px',
            height: this.options.elemHeight + 'px'
        });
        if (this.options.addAtEndOnClick) {
            $headers_enter.on('click', function (d) {
                _this.data.push(_this.data.getLastRanking(), d);
            });
        }
        $headers_enter.append('span').classed('label', true).text(function (d) { return d.label; });
        $headers.attr('class', function (d) { return ("header " + (d.cssClass || '') + " " + d.type); });
        $headers.style({
            'transform': function (d, i) {
                var pos = _this.layout(i);
                return 'translate(' + pos.x + 'px,' + pos.y + 'px)';
            },
            'background-color': function (d) {
                var s = d;
                return s.cssClass ? null : s.color || model.Column.DEFAULT_COLOR;
            }
        });
        $headers.attr({
            title: function (d) { return d.label; }
        });
        $headers.select('span').text(function (d) { return d.label; });
        $headers.exit().remove();
        switch (this.options.layout) {
            case 'horizontal':
                this.$node.style({
                    width: (this.options.elemWidth * descToShow.length) + 'px',
                    height: (this.options.elemHeight * 1) + 'px'
                });
                break;
            case 'grid':
                var perRow = d3.round(this.options.width / this.options.elemWidth, 0);
                this.$node.style({
                    width: perRow * this.options.elemWidth + 'px',
                    height: Math.ceil(descToShow.length / perRow) * this.options.elemHeight + 'px'
                });
                break;
            default:
                this.$node.style({
                    width: (this.options.elemWidth * 1) + 'px',
                    height: (this.options.elemHeight * descToShow.length) + 'px'
                });
                break;
        }
    };
    PoolRenderer.prototype.layout = function (i) {
        switch (this.options.layout) {
            case 'horizontal':
                return { x: i * this.options.elemWidth, y: 0 };
            case 'grid':
                var perRow = d3.round(this.options.width / this.options.elemWidth, 0);
                return { x: (i % perRow) * this.options.elemWidth, y: Math.floor(i / perRow) * this.options.elemHeight };
            default:
                return { x: 0, y: i * this.options.elemHeight };
        }
    };
    return PoolRenderer;
})();
exports.PoolRenderer = PoolRenderer;
var HeaderRenderer = (function () {
    function HeaderRenderer(data, parent, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.data = data;
        this.options = {
            slopeWidth: 150,
            columnPadding: 5,
            headerHistogramHeight: 40,
            headerHeight: 20,
            manipulative: true,
            histograms: false,
            filterDialogs: dialogs.filterDialogs(),
            searchAble: function (col) { return col instanceof model.StringColumn; },
            sortOnLabel: true,
            autoRotateLabels: false,
            rotationHeight: 50,
            rotationDegree: -20,
            freezeCols: 0
        };
        this.histCache = d3.map();
        this.dragHandler = d3.behavior.drag()
            .on('dragstart', function () {
            d3.select(this).classed('dragging', true);
            d3.event.sourceEvent.stopPropagation();
            d3.event.sourceEvent.preventDefault();
        })
            .on('drag', function (d) {
            var newValue = Math.max(d3.mouse(this.parentNode)[0], 2);
            d.setWidth(newValue);
            d3.event.sourceEvent.stopPropagation();
            d3.event.sourceEvent.preventDefault();
        })
            .on('dragend', function () {
            d3.select(this).classed('dragging', false);
            d3.event.sourceEvent.stopPropagation();
            d3.event.sourceEvent.preventDefault();
        });
        this.dropHandler = utils.dropAble(['application/caleydo-lineup-column-ref', 'application/caleydo-lineup-column'], function (data, d, copy) {
            var col = null;
            if ('application/caleydo-lineup-column-ref' in data) {
                var id = data['application/caleydo-lineup-column-ref'];
                col = _this.data.find(id);
                if (copy) {
                    col = _this.data.clone(col);
                }
                else {
                    col.removeMe();
                }
            }
            else {
                var desc = JSON.parse(data['application/caleydo-lineup-column']);
                col = _this.data.create(_this.data.fromDescRef(desc));
            }
            if (d instanceof model.Column) {
                return d.insertAfterMe(col);
            }
            else {
                var r = _this.data.getLastRanking();
                return r.push(col) !== null;
            }
        });
        utils.merge(this.options, options);
        this.$node = d3.select(parent).append('div').classed('lu-header', true);
        this.$node.append('div').classed('drop', true).call(this.dropHandler);
        this.changeDataStorage(data);
    }
    HeaderRenderer.prototype.changeDataStorage = function (data) {
        var _this = this;
        if (this.data) {
            this.data.on(['dirtyHeader.headerRenderer', 'orderChanged.headerRenderer', 'selectionChanged.headerRenderer'], null);
        }
        this.data = data;
        data.on('dirtyHeader.headerRenderer', utils.delayedCall(this.update.bind(this), 1));
        if (this.options.histograms) {
            data.on('orderChanged.headerRenderer', function () {
                _this.updateHist();
                _this.update();
            });
            data.on('selectionChanged.headerRenderer', utils.delayedCall(this.drawSelection.bind(this), 1));
        }
    };
    Object.defineProperty(HeaderRenderer.prototype, "sharedHistCache", {
        get: function () {
            return this.histCache;
        },
        enumerable: true,
        configurable: true
    });
    HeaderRenderer.prototype.currentHeight = function () {
        return parseInt(this.$node.style('height'), 10);
    };
    HeaderRenderer.prototype.updateHist = function () {
        var _this = this;
        var rankings = this.data.getRankings();
        rankings.forEach(function (ranking) {
            var order = ranking.getOrder();
            var cols = ranking.flatColumns;
            var histo = order == null ? null : _this.data.stats(order);
            cols.filter(function (d) { return d instanceof model.NumberColumn; }).forEach(function (col) {
                _this.histCache.set(col.id, histo === null ? null : histo.stats(col));
            });
            cols.filter(model.isCategoricalColumn).forEach(function (col) {
                _this.histCache.set(col.id, histo === null ? null : histo.hist(col));
            });
        });
    };
    HeaderRenderer.prototype.drawSelection = function () {
        var _this = this;
        if (!this.options.histograms) {
            return;
        }
        var node = this.$node.node();
        [].slice.call(node.querySelectorAll('div.bar')).forEach(function (d) { return d.classList.remove('selected'); });
        var indices = this.data.getSelection();
        if (indices.length <= 0) {
            return;
        }
        this.data.view(indices).then(function (data) {
            var rankings = _this.data.getRankings();
            rankings.forEach(function (ranking) {
                var cols = ranking.flatColumns;
                cols.filter(function (d) { return d instanceof model.NumberColumn; }).forEach(function (col) {
                    var bars = [].slice.call(node.querySelectorAll("div.header[data-id=\"" + col.id + "\"] div.bar"));
                    data.forEach(function (d) {
                        var v = col.getValue(d);
                        for (var i = 1; i < bars.length; ++i) {
                            var bar = bars[i];
                            if (bar.dataset.x > v) {
                                bars[i - 1].classList.add('selected');
                                break;
                            }
                            else if (i === bars.length - 1) {
                                bar.classList.add('selected');
                                break;
                            }
                        }
                    });
                });
                cols.filter(model.isCategoricalColumn).forEach(function (col) {
                    var header = node.querySelector("div.header[data-id=\"" + col.id + "\"]");
                    data.forEach(function (d) {
                        var cats = col.getCategories(d);
                        (cats || []).forEach(function (cat) {
                            header.querySelector("div.bar[data-cat=\"" + cat + "\"]").classList.add('selected');
                        });
                    });
                });
            });
        });
    };
    HeaderRenderer.prototype.update = function () {
        var _this = this;
        var that = this;
        var rankings = this.data.getRankings();
        var shifts = [], offset = 0;
        rankings.forEach(function (ranking) {
            offset += ranking.flatten(shifts, offset, 1, _this.options.columnPadding) + _this.options.slopeWidth;
        });
        offset -= this.options.slopeWidth;
        var columns = shifts.map(function (d) { return d.col; });
        if (this.options.histograms && this.histCache.empty() && rankings.length > 0) {
            this.updateHist();
        }
        this.renderColumns(columns, shifts);
        function countStacked(c) {
            if (c instanceof model.StackColumn && !c.collapsed && !c.compressed) {
                return 1 + Math.max.apply(Math, c.children.map(countStacked));
            }
            return 1;
        }
        var levels = Math.max.apply(Math, columns.map(countStacked));
        var height = (this.options.histograms ? this.options.headerHistogramHeight : this.options.headerHeight) + (levels - 1) * this.options.headerHeight;
        if (this.options.autoRotateLabels) {
            var rotatedAny = false;
            this.$node.selectAll('div.header')
                .style('height', height + 'px').select('div.lu-label').each(function (d) {
                var w = this.querySelector('span.lu-label').offsetWidth;
                var actWidth = d.getWidth();
                if (w > (actWidth + 30)) {
                    d3.select(this).style('transform', "rotate(" + that.options.rotationDegree + "deg)");
                    rotatedAny = true;
                }
                else {
                    d3.select(this).style('transform', null);
                }
            });
            this.$node.selectAll('div.header').style('margin-top', rotatedAny ? this.options.rotationHeight + 'px' : null);
            height += rotatedAny ? this.options.rotationHeight : 0;
        }
        this.$node.style('height', height + 'px');
    };
    HeaderRenderer.prototype.createToolbar = function ($node) {
        var _this = this;
        var filterDialogs = this.options.filterDialogs, provider = this.data;
        var $regular = $node.filter(function (d) { return !(d instanceof model.RankColumn); }), $stacked = $node.filter(function (d) { return d instanceof model.StackColumn; });
        $stacked.append('i').attr('class', 'fa fa-tasks').attr('title', 'Edit Weights').on('click', function (d) {
            dialogs.openEditWeightsDialog(d, d3.select(this.parentNode.parentNode));
            d3.event.stopPropagation();
        });
        $regular.append('i').attr('class', 'fa fa-pencil-square-o').attr('title', 'Rename').on('click', function (d) {
            dialogs.openRenameDialog(d, d3.select(this.parentNode.parentNode));
            d3.event.stopPropagation();
        });
        $regular.append('i').attr('class', 'fa fa-code-fork').attr('title', 'Generate Snapshot').on('click', function (d) {
            var r = provider.pushRanking();
            r.push(provider.clone(d));
            d3.event.stopPropagation();
        });
        $node.filter(function (d) { return d instanceof model.LinkColumn; }).append('i').attr('class', 'fa fa-external-link').attr('title', 'Edit Link Pattern').on('click', function (d) {
            dialogs.openEditLinkDialog(d, d3.select(this.parentNode.parentNode));
            d3.event.stopPropagation();
        });
        $node.filter(function (d) { return filterDialogs.hasOwnProperty(d.desc.type); }).append('i').attr('class', 'fa fa-filter').attr('title', 'Filter').on('click', function (d) {
            filterDialogs[d.desc.type](d, d3.select(this.parentNode.parentNode), provider);
            d3.event.stopPropagation();
        });
        $node.filter(function (d) { return _this.options.searchAble(d); }).append('i').attr('class', 'fa fa-search').attr('title', 'Search').on('click', function (d) {
            dialogs.openSearchDialog(d, d3.select(this.parentNode.parentNode), provider);
            d3.event.stopPropagation();
        });
        $regular.append('i')
            .attr('class', 'fa')
            .classed('fa-toggle-left', function (d) { return !d.compressed; })
            .classed('fa-toggle-right', function (d) { return d.compressed; })
            .attr('title', '(Un)Collapse')
            .on('click', function (d) {
            d.compressed = !d.compressed;
            d3.select(this)
                .classed('fa-toggle-left', !d.compressed)
                .classed('fa-toggle-right', d.compressed);
            d3.event.stopPropagation();
        });
        $stacked.append('i')
            .attr('class', 'fa')
            .classed('fa-compress', function (d) { return !d.collapsed; })
            .classed('fa-expand', function (d) { return d.collapsed; })
            .attr('title', 'Compress/Expand')
            .on('click', function (d) {
            d.collapsed = !d.collapsed;
            d3.select(this)
                .classed('fa-compress', !d.collapsed)
                .classed('fa-expand', d.collapsed);
            d3.event.stopPropagation();
        });
        $node.append('i').attr('class', 'fa fa-times').attr('title', 'Hide').on('click', function (d) {
            if (d instanceof model.RankColumn) {
                provider.removeRanking(d);
                if (provider.getRankings().length === 0) {
                    provider.pushRanking();
                }
            }
            else {
                d.removeMe();
            }
            d3.event.stopPropagation();
        });
    };
    HeaderRenderer.prototype.updateFreeze = function (left) {
        var numColumns = this.options.freezeCols;
        this.$node.selectAll('div.header')
            .style('z-index', function (d, i) { return i < numColumns ? 1 : null; })
            .style('transform', function (d, i) { return i < numColumns ? "translate(" + left + "px,0)" : null; });
    };
    HeaderRenderer.prototype.renderColumns = function (columns, shifts, $base, clazz) {
        var _this = this;
        if ($base === void 0) { $base = this.$node; }
        if (clazz === void 0) { clazz = 'header'; }
        var $headers = $base.selectAll('div.' + clazz).data(columns, function (d) { return d.id; });
        var $headers_enter = $headers.enter().append('div').attr({
            'class': clazz
        });
        var $header_enter_div = $headers_enter.append('div').classed('lu-label', true).on('click', function (d) {
            if (_this.options.manipulative && !d3.event.defaultPrevented) {
                d.toggleMySorting();
            }
        })
            .on('dragstart', function (d) {
            var e = d3.event;
            e.dataTransfer.effectAllowed = 'copyMove';
            e.dataTransfer.setData('text/plain', d.label);
            e.dataTransfer.setData('application/caleydo-lineup-column-ref', d.id);
            var ref = JSON.stringify(_this.data.toDescRef(d.desc));
            e.dataTransfer.setData('application/caleydo-lineup-column', ref);
            if (model.isNumberColumn(d)) {
                e.dataTransfer.setData('application/caleydo-lineup-column-number', ref);
                e.dataTransfer.setData('application/caleydo-lineup-column-number-ref', d.id);
            }
        });
        $header_enter_div.append('i').attr('class', 'fa fa sort_indicator');
        $header_enter_div.append('span').classed('lu-label', true).attr({
            'draggable': this.options.manipulative
        });
        if (this.options.manipulative) {
            $headers_enter.append('div').classed('handle', true)
                .call(this.dragHandler)
                .style('width', this.options.columnPadding + 'px')
                .call(this.dropHandler);
            $headers_enter.append('div').classed('toolbar', true).call(this.createToolbar.bind(this));
        }
        if (this.options.histograms) {
            $headers_enter.append('div').classed('histogram', true);
        }
        $headers.style({
            width: function (d, i) { return (shifts[i].width + _this.options.columnPadding) + 'px'; },
            left: function (d, i) { return shifts[i].offset + 'px'; },
            'background-color': function (d) { return d.color; }
        });
        $headers.attr({
            'class': function (d) { return (clazz + " " + (d.cssClass || '') + " " + (d.compressed ? 'compressed' : '') + " " + d.headerCssClass + " " + (_this.options.autoRotateLabels ? 'rotateable' : '') + " " + (d.isFiltered() ? 'filtered' : '')); },
            title: function (d) { return d.label; },
            'data-id': function (d) { return d.id; },
        });
        $headers.select('i.sort_indicator').attr('class', function (d) {
            var r = d.findMyRanker();
            if (r && r.sortCriteria().col === d) {
                return 'sort_indicator fa fa-sort-' + (r.sortCriteria().asc ? 'asc' : 'desc');
            }
            return 'sort_indicator fa';
        });
        $headers.select('span.lu-label').text(function (d) { return d.label; });
        var that = this;
        $headers.filter(function (d) { return d instanceof model.StackColumn; }).each(function (col) {
            if (col.collapsed || col.compressed) {
                d3.select(this).selectAll('div.' + clazz + '_i').remove();
            }
            else {
                var s_shifts = [];
                col.flatten(s_shifts, 0, 1, that.options.columnPadding);
                var s_columns = s_shifts.map(function (d) { return d.col; });
                that.renderColumns(s_columns, s_shifts, d3.select(this), clazz + (clazz.substr(clazz.length - 2) !== '_i' ? '_i' : ''));
            }
        }).call(utils.dropAble(['application/caleydo-lineup-column-number-ref', 'application/caleydo-lineup-column-number'], function (data, d, copy) {
            var col = null;
            if ('application/caleydo-lineup-column-number-ref' in data) {
                var id = data['application/caleydo-lineup-column-number-ref'];
                col = _this.data.find(id);
                if (copy) {
                    col = _this.data.clone(col);
                }
                else {
                    col.removeMe();
                }
            }
            else {
                var desc = JSON.parse(data['application/caleydo-lineup-column-number']);
                col = _this.data.create(_this.data.fromDescRef(desc));
            }
            return d.push(col);
        }));
        if (this.options.histograms) {
            $headers.filter(function (d) { return model.isCategoricalColumn(d); }).each(function (col) {
                var $this = d3.select(this).select('div.histogram');
                var hist = that.histCache.get(col.id);
                if (hist) {
                    hist.then(function (stats) {
                        var $bars = $this.selectAll('div.bar').data(stats.hist);
                        $bars.enter().append('div').classed('bar', true);
                        var sx = d3.scale.ordinal().domain(col.categories).rangeBands([0, 100], 0.1);
                        var sy = d3.scale.linear().domain([0, stats.maxBin]).range([0, 100]);
                        $bars.style({
                            left: function (d) { return sx(d.cat) + '%'; },
                            width: function (d) { return sx.rangeBand() + '%'; },
                            top: function (d) { return (100 - sy(d.y)) + '%'; },
                            height: function (d) { return sy(d.y) + '%'; },
                            'background-color': function (d) { return col.colorOf(d.cat); }
                        }).attr({
                            title: function (d) { return (d.cat + ": " + d.y); },
                            'data-cat': function (d) { return d.cat; }
                        });
                        $bars.exit().remove();
                    });
                }
            });
            $headers.filter(function (d) { return d instanceof model.NumberColumn; }).each(function (col) {
                var $this = d3.select(this).select('div.histogram');
                var hist = that.histCache.get(col.id);
                if (hist) {
                    hist.then(function (stats) {
                        var $bars = $this.selectAll('div.bar').data(stats.hist);
                        $bars.enter().append('div').classed('bar', true);
                        var sx = d3.scale.ordinal().domain(d3.range(stats.hist.length).map(String)).rangeBands([0, 100], 0.1);
                        var sy = d3.scale.linear().domain([0, stats.maxBin]).range([0, 100]);
                        $bars.style({
                            left: function (d, i) { return sx(String(i)) + '%'; },
                            width: function (d, i) { return sx.rangeBand() + '%'; },
                            top: function (d) { return (100 - sy(d.y)) + '%'; },
                            height: function (d) { return sy(d.y) + '%'; }
                        }).attr({
                            title: function (d, i) { return ("Bin " + i + ": " + d.y); },
                            'data-x': function (d) { return d.x; }
                        });
                        $bars.exit().remove();
                        var $mean = $this.select('div.mean');
                        if ($mean.empty()) {
                            $mean = $this.append('div').classed('mean', true);
                        }
                        $mean.style('left', (stats.mean * 100) + '%');
                    });
                }
            });
        }
        $headers.exit().remove();
    };
    return HeaderRenderer;
})();
exports.HeaderRenderer = HeaderRenderer;
var BodyRenderer = (function (_super) {
    __extends(BodyRenderer, _super);
    function BodyRenderer(data, parent, slicer, options) {
        if (options === void 0) { options = {}; }
        _super.call(this);
        this.data = data;
        this.slicer = slicer;
        this.options = {
            rowHeight: 20,
            rowPadding: 1,
            rowBarPadding: 1,
            idPrefix: '',
            slopeWidth: 150,
            columnPadding: 5,
            stacked: true,
            animation: false,
            animationDuration: 1000,
            renderers: renderer.renderers(),
            meanLine: false,
            actions: [],
            freezeCols: 0
        };
        this.currentFreezeLeft = 0;
        this.histCache = d3.map();
        utils.merge(this.options, options);
        this.$node = d3.select(parent).append('svg').classed('lu-body', true);
        this.changeDataStorage(data);
    }
    BodyRenderer.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['hoverChanged']);
    };
    Object.defineProperty(BodyRenderer.prototype, "node", {
        get: function () {
            return this.$node.node();
        },
        enumerable: true,
        configurable: true
    });
    BodyRenderer.prototype.setOption = function (key, value) {
        this.options[key] = value;
    };
    BodyRenderer.prototype.changeDataStorage = function (data) {
        if (this.data) {
            this.data.on(['dirtyValues.bodyRenderer', 'selectionChanged.bodyRenderer'], null);
        }
        this.data = data;
        data.on('dirtyValues.bodyRenderer', utils.delayedCall(this.update.bind(this), 1));
        data.on('selectionChanged.bodyRenderer', utils.delayedCall(this.drawSelection.bind(this), 1));
    };
    BodyRenderer.prototype.createContext = function (index_shift) {
        var options = this.options;
        return {
            rowKey: this.data.rowKey,
            cellY: function (index) {
                return (index + index_shift) * (options.rowHeight);
            },
            cellPrevY: function (index) {
                return (index + index_shift) * (options.rowHeight);
            },
            cellX: function (index) {
                return 0;
            },
            rowHeight: function (index) {
                return options.rowHeight * (1 - options.rowPadding);
            },
            renderer: function (col) {
                if (col.compressed && model.isNumberColumn(col)) {
                    return options.renderers.heatmap;
                }
                if (col instanceof model.StackColumn && col.collapsed) {
                    return options.renderers.number;
                }
                var l = options.renderers[col.desc.type];
                return l || renderer.defaultRenderer();
            },
            render: function (col, $this, data, context) {
                if (context === void 0) { context = this; }
                var tthis = ($this.node());
                var old_renderer = tthis.__renderer__;
                var act_renderer = this.renderer(col);
                if (old_renderer !== act_renderer) {
                    $this.selectAll('*').remove();
                    tthis.__renderer__ = act_renderer;
                }
                act_renderer.render($this, col, data, context);
            },
            showStacked: function (col) {
                return options.stacked;
            },
            idPrefix: options.idPrefix,
            animated: function ($sel) { return options.animation ? $sel.transition().duration(options.animationDuration) : $sel; },
            showMeanLine: function (col) { return options.meanLine && model.isNumberColumn(col) && !col.compressed && col.parent instanceof model.RankColumn; },
            option: function (key, default_) { return (key in options) ? options[key] : default_; }
        };
    };
    BodyRenderer.prototype.updateClipPathsImpl = function (r, context, height) {
        var $base = this.$node.select('defs.body');
        if ($base.empty()) {
            $base = this.$node.append('defs').classed('body', true);
        }
        var textClipPath = $base.selectAll(function () {
            return this.getElementsByTagName('clipPath');
        }).data(r, function (d) { return d.id; });
        textClipPath.enter().append('clipPath')
            .attr('id', function (d) { return context.idPrefix + 'clipCol' + d.id; })
            .append('rect').attr({
            y: 0
        });
        textClipPath.exit().remove();
        textClipPath.select('rect')
            .attr({
            x: 0,
            width: function (d) { return Math.max(d.getWidth() - 5, 0); },
            height: height
        });
    };
    BodyRenderer.prototype.updateClipPaths = function (rankings, context, height) {
        var _this = this;
        var shifts = [], offset = 0;
        rankings.forEach(function (r) {
            var w = r.flatten(shifts, offset, 2, _this.options.columnPadding);
            offset += w + _this.options.slopeWidth;
        });
        this.updateClipPathsImpl(shifts.map(function (s) { return s.col; }), context, height);
        var $elem = this.$node.select('clipPath#c' + context.idPrefix + 'Freeze');
        if ($elem.empty()) {
            $elem = this.$node.append('clipPath').attr('id', 'c' + context.idPrefix + 'Freeze').append('rect').attr({
                y: 0,
                width: 20000,
                height: height
            });
        }
        $elem.select('rect').attr({
            height: height
        });
    };
    BodyRenderer.prototype.renderRankings = function ($body, rankings, orders, shifts, context, height) {
        var _this = this;
        var that = this;
        var dataPromises = orders.map(function (r) { return _this.data.view(r); });
        var $rankings = $body.selectAll('g.ranking').data(rankings, function (d) { return d.id; });
        var $rankings_enter = $rankings.enter().append('g').attr({
            'class': 'ranking',
            transform: function (d, i) { return 'translate(' + shifts[i].shift + ',0)'; }
        });
        $rankings_enter.append('g').attr('class', 'rows');
        $rankings_enter.append('g').attr('class', 'cols');
        context.animated($rankings).attr({
            transform: function (d, i) { return 'translate(' + shifts[i].shift + ',0)'; }
        });
        var $cols = $rankings.select('g.cols').selectAll('g.uchild').data(function (d) { return [d].concat(d.children); }, function (d) { return d.id; });
        $cols.enter().append('g').attr('class', 'uchild')
            .append('g').attr({
            'class': 'child',
            transform: function (d, i, j) { return 'translate(' + shifts[j].shifts[i] + ',0)'; }
        });
        $cols.exit().remove();
        $cols = $cols.select('g.child');
        $cols.attr({
            'data-index': function (d, i) { return i; }
        });
        context.animated($cols).attr({
            transform: function (d, i, j) {
                return 'translate(' + shifts[j].shifts[i] + ',0)';
            }
        }).each(function (d, i, j) {
            var $col = d3.select(this);
            dataPromises[j].then(function (data) {
                context.render(d, $col, data, context);
            });
            if (context.showMeanLine(d)) {
                var h = that.histCache.get(d.id);
                if (h) {
                    h.then(function (stats) {
                        var $mean = $col.selectAll('line.meanline').data([stats.mean]);
                        $mean.enter().append('line').attr('class', 'meanline');
                        $mean.exit().remove();
                        $mean.attr('x1', d.getWidth() * stats.mean)
                            .attr('x2', d.getWidth() * stats.mean)
                            .attr('y2', height);
                    });
                }
            }
            else {
                $col.selectAll('line.meanline').remove();
            }
        });
        function mouseOverRow($row, $cols, index, ranking, rankingIndex) {
            $row.classed('hover', true);
            var $value_cols = $row.select('g.values').selectAll('g.uchild').data([ranking].concat(ranking.children), function (d) { return d.id; });
            $value_cols.enter().append('g').attr({
                'class': 'uchild'
            }).append('g').classed('child', true);
            $value_cols.select('g.child').attr({
                transform: function (d, i) {
                    return 'translate(' + shifts[rankingIndex].shifts[i] + ',0)';
                }
            }).each(function (d, i) {
                var _this = this;
                dataPromises[rankingIndex].then(function (data) {
                    context.renderer(d).mouseEnter($cols.selectAll('g.child[data-index="' + i + '"]'), d3.select(_this), d, data[index], index, context);
                });
            });
            $value_cols.exit().remove();
        }
        function mouseLeaveRow($row, $cols, index, ranking, rankingIndex) {
            $row.classed('hover', false);
            $row.select('g.values').selectAll('g.uchild').each(function (d, i) {
                var _this = this;
                dataPromises[rankingIndex].then(function (data) {
                    context.renderer(d).mouseLeave($cols.selectAll('g.child[data-index="' + i + '"]'), d3.select(_this).select('g.child'), d, data[index], index, context);
                });
            }).remove();
        }
        this.mouseOverItem = function (data_index, hover) {
            if (hover === void 0) { hover = true; }
            $rankings.each(function (ranking, rankingIndex) {
                var $ranking = d3.select(this);
                var $row = $ranking.selectAll('g.row[data-index="' + data_index + '"]');
                var $cols = $ranking.select('g.cols');
                if (!$row.empty()) {
                    var index = $row.datum().i;
                    if (hover) {
                        mouseOverRow($row, $cols, index, ranking, rankingIndex);
                    }
                    else {
                        mouseLeaveRow($row, $cols, index, ranking, rankingIndex);
                    }
                }
            });
            that.updateFrozenRows();
        };
        var $rows = $rankings.select('g.rows').selectAll('g.row').data(function (d, i) { return orders[i].map(function (d, i) { return ({ d: d, i: i }); }); });
        var $rows_enter = $rows.enter().append('g').attr({
            'class': 'row'
        });
        $rows_enter.append('rect').attr({
            'class': 'bg'
        });
        $rows_enter.append('g').attr({ 'class': 'values' });
        $rows_enter.on('mouseenter', function (data_index) {
            _this.mouseOver(data_index.d, true);
        }).on('mouseleave', function (data_index) {
            _this.mouseOver(data_index.d, false);
        }).on('click', function (data_index) {
            _this.select(data_index.d, d3.event.ctrlKey);
        });
        $rows.attr({
            'data-index': function (d) { return d.d; }
        }).classed('selected', function (d) { return _this.data.isSelected(d.d); });
        $rows.select('rect').attr({
            y: function (d) { return context.cellY(d.i); },
            height: function (d) { return context.rowHeight(d.i); },
            width: function (d, i, j) { return shifts[j].width; },
            'class': function (d, i) { return 'bg ' + (i % 2 === 0 ? 'even' : 'odd'); }
        });
        $rows.exit().remove();
        $rankings.exit().remove();
    };
    BodyRenderer.prototype.select = function (dataIndex, additional) {
        if (additional === void 0) { additional = false; }
        var selected = this.data.toggleSelection(dataIndex, additional);
        this.$node.selectAll('g.row[data-index="' + dataIndex + '"], line.slope[data-index="' + dataIndex + '"]').classed('selected', selected);
    };
    BodyRenderer.prototype.drawSelection = function () {
        var indices = this.data.getSelection();
        if (indices.length === 0) {
            this.$node.selectAll('g.row.selected, line.slope.selected').classed('selected', false);
        }
        else {
            var s = d3.set(indices);
            this.$node.selectAll('g.row').classed('selected', function (d) { return s.has(String(d.d)); });
            this.$node.selectAll('line.slope').classed('selected', function (d) { return s.has(String(d.data_index)); });
        }
    };
    BodyRenderer.prototype.mouseOver = function (dataIndex, hover) {
        if (hover === void 0) { hover = true; }
        this.fire('hoverChanged', hover ? dataIndex : -1);
        this.mouseOverItem(dataIndex, hover);
        this.$node.selectAll('line.slope[data-index="' + dataIndex + '"]').classed('hover', hover);
    };
    BodyRenderer.prototype.renderSlopeGraphs = function ($body, rankings, orders, shifts, context) {
        var _this = this;
        var slopes = orders.slice(1).map(function (d, i) { return ({ left: orders[i], left_i: i, right: d, right_i: i + 1 }); });
        var $slopes = $body.selectAll('g.slopegraph').data(slopes);
        $slopes.enter().append('g').attr({
            'class': 'slopegraph'
        });
        $slopes.attr({
            transform: function (d, i) { return 'translate(' + (shifts[i + 1].shift - _this.options.slopeWidth) + ',0)'; }
        });
        var $lines = $slopes.selectAll('line.slope').data(function (d, i) {
            var cache = {};
            d.right.forEach(function (data_index, pos) {
                cache[data_index] = pos;
            });
            return d.left.map(function (data_index, pos) { return ({
                data_index: data_index,
                lpos: pos,
                rpos: cache[data_index]
            }); }).filter(function (d) { return d.rpos != null; });
        });
        $lines.enter().append('line').attr({
            'class': 'slope',
            x2: this.options.slopeWidth
        }).on('mouseenter', function (d) {
            _this.mouseOver(d.data_index, true);
        }).on('mouseleave', function (d) {
            _this.mouseOver(d.data_index, false);
        });
        $lines.attr({
            'data-index': function (d) { return d.data_index; }
        });
        $lines.attr({
            y1: function (d) {
                return context.rowHeight(d.lpos) * 0.5 + context.cellY(d.lpos);
            },
            y2: function (d) {
                return context.rowHeight(d.rpos) * 0.5 + context.cellY(d.rpos);
            }
        });
        $lines.exit().remove();
        $slopes.exit().remove();
    };
    BodyRenderer.prototype.updateFreeze = function (left) {
        var _this = this;
        var numColumns = this.options.freezeCols;
        var $cols = this.$node.select('g.cols');
        var $n = this.$node.select('#c' + this.options.idPrefix + 'Freeze').select('rect');
        var $col = $cols.select("g.child[data-index=\"" + numColumns + "\"]");
        if ($col.empty()) {
            $col = $cols.select('g.child:last-of-type');
        }
        var x = d3.transform($col.attr('transform') || '').translate[0];
        $n.attr('x', left + x);
        $cols.selectAll('g.uchild').attr({
            'clip-path': function (d, i) { return i < numColumns ? null : 'url(#c' + _this.options.idPrefix + 'Freeze)'; },
            'transform': function (d, i) { return i < numColumns ? 'translate(' + left + ',0)' : null; }
        });
        this.currentFreezeLeft = left;
        this.updateFrozenRows();
    };
    BodyRenderer.prototype.updateFrozenRows = function () {
        var _this = this;
        var numColumns = this.options.freezeCols;
        if (numColumns <= 0) {
            return;
        }
        var left = this.currentFreezeLeft;
        var $rows = this.$node.select('g.rows');
        $rows.select('g.row.hover g.values').selectAll('g.uchild').attr({
            'clip-path': function (d, i) { return i < numColumns ? null : 'url(#c' + _this.options.idPrefix + 'Freeze)'; },
            'transform': function (d, i) { return i < numColumns ? 'translate(' + left + ',0)' : null; }
        });
    };
    BodyRenderer.prototype.update = function () {
        var _this = this;
        var rankings = this.data.getRankings();
        var maxElems = d3.max(rankings, function (d) { return d.getOrder().length; }) || 0;
        var height = this.options.rowHeight * maxElems;
        var visibleRange = this.slicer(0, maxElems, function (i) { return i * _this.options.rowHeight; });
        var orderSlicer = function (order) {
            if (visibleRange.from === 0 && order.length <= visibleRange.to) {
                return order;
            }
            return order.slice(visibleRange.from, Math.min(order.length, visibleRange.to));
        };
        var orders = rankings.map(function (r) { return orderSlicer(r.getOrder()); });
        var context = this.createContext(visibleRange.from);
        var offset = 0, shifts = rankings.map(function (d, i) {
            var r = offset;
            offset += _this.options.slopeWidth;
            var o2 = 0, shift2 = [d].concat(d.children).map(function (o) {
                var r = o2;
                o2 += (o.compressed ? model.Column.COMPRESSED_WIDTH : o.getWidth()) + _this.options.columnPadding;
                if (o instanceof model.StackColumn && !o.collapsed && !o.compressed) {
                    o2 += _this.options.columnPadding * (o.length - 1);
                }
                return r;
            });
            offset += o2;
            return {
                shift: r,
                shifts: shift2,
                width: o2
            };
        });
        this.$node.attr({
            width: offset,
            height: height
        });
        this.updateClipPaths(rankings, context, height);
        var $body = this.$node.select('g.body');
        if ($body.empty()) {
            $body = this.$node.append('g').classed('body', true);
        }
        this.renderRankings($body, rankings, orders, shifts, context, height);
        this.renderSlopeGraphs($body, rankings, orders, shifts, context);
    };
    return BodyRenderer;
})(utils.AEventDispatcher);
exports.BodyRenderer = BodyRenderer;

},{"./model":3,"./renderer":5,"./ui_dialogs":7,"./utils":8,"d3":undefined}],7:[function(require,module,exports){
var utils = require('./utils');
var mappingeditor = require('./mappingeditor');
function dialogForm(title, body, buttonsWithLabel) {
    if (buttonsWithLabel === void 0) { buttonsWithLabel = false; }
    return '<span style="font-weight: bold">' + title + '</span>' +
        '<form onsubmit="return false">' +
        body + '<button type = "submit" class="ok fa fa-check" title="ok"></button>' +
        '<button type = "reset" class="cancel fa fa-times" title="cancel"></button>' +
        '<button type = "button" class="reset fa fa-undo" title="reset"></button></form>';
}
exports.dialogForm = dialogForm;
function makePopup(attachement, title, body) {
    var pos = utils.offset(attachement.node());
    var $popup = d3.select('body').append('div')
        .attr({
        'class': 'lu-popup2'
    }).style({
        left: pos.left + 'px',
        top: pos.top + 'px'
    }).html(dialogForm(title, body));
    $popup.on('keydown', function () {
        if (d3.event.which === 27) {
            $popup.remove();
        }
    });
    var auto = $popup.select('input[autofocus]').node();
    if (auto) {
        auto.focus();
    }
    return $popup;
}
exports.makePopup = makePopup;
function openRenameDialog(column, $header) {
    var popup = makePopup($header, 'Rename Column', "<input type=\"text\" size=\"15\" value=\"" + column.label + "\" required=\"required\" autofocus=\"autofocus\"><br><input type=\"color\" size=\"15\" value=\"" + column.color + "\" required=\"required\"><br>");
    popup.select('.ok').on('click', function () {
        var newValue = popup.select('input[type="text"]').property('value');
        var newColor = popup.select('input[type="color"]').property('value');
        column.setMetaData(newValue, newColor);
        popup.remove();
    });
    popup.select('.cancel').on('click', function () {
        popup.remove();
    });
}
exports.openRenameDialog = openRenameDialog;
function openEditLinkDialog(column, $header) {
    var t = "<input type=\"text\" size=\"15\" value=\"" + column.getLink() + "\" required=\"required\" autofocus=\"autofocus\"><br>";
    var popup = makePopup($header, 'Edit Link ($ as Placeholder)', t);
    popup.select('.ok').on('click', function () {
        var newValue = popup.select('input[type="text"]').property('value');
        column.setLink(newValue);
        popup.remove();
    });
    popup.select('.cancel').on('click', function () {
        popup.remove();
    });
}
exports.openEditLinkDialog = openEditLinkDialog;
function openSearchDialog(column, $header, provider) {
    var popup = makePopup($header, 'Search', '<input type="text" size="15" value="" required="required" autofocus="autofocus"><br><label><input type="checkbox">RegExp</label><br>');
    popup.select('input[type="text"]').on('input', function () {
        var search = d3.event.target.value;
        if (search.length >= 3) {
            var isRegex = popup.select('input[type="checkbox"]').property('checked');
            if (isRegex) {
                search = new RegExp(search);
            }
            provider.searchSelect(search, column);
        }
    });
    function updateImpl() {
        var search = popup.select('input[type="text"]').property('value');
        var isRegex = popup.select('input[type="text"]').property('checked');
        if (search.length > 0) {
            if (isRegex) {
                search = new RegExp(search);
            }
            provider.searchSelect(search, column);
        }
        popup.remove();
    }
    popup.select('input[type="checkbox"]').on('change', updateImpl);
    popup.select('.ok').on('click', updateImpl);
    popup.select('.cancel').on('click', function () {
        popup.remove();
    });
}
exports.openSearchDialog = openSearchDialog;
function openEditWeightsDialog(column, $header) {
    var weights = column.weights, children = column.children.map(function (d, i) { return ({ col: d, weight: weights[i] * 100 }); });
    var scale = d3.scale.linear().domain([0, 100]).range([0, 120]);
    var $popup = makePopup($header, 'Edit Weights', '<table></table>');
    var $rows = $popup.select('table').selectAll('tr').data(children);
    var $rows_enter = $rows.enter().append('tr');
    $rows_enter.append('td')
        .append('input').attr({
        type: 'number',
        value: function (d) { return d.weight; },
        size: 5
    }).on('input', function (d) {
        d.weight = +this.value;
        redraw();
    });
    $rows_enter.append('td').append('div')
        .attr('class', function (d) { return 'bar ' + d.col.cssClass; })
        .style('background-color', function (d) { return d.col.color; });
    $rows_enter.append('td').text(function (d) { return d.col.label; });
    function redraw() {
        $rows.select('.bar').transition().style({
            width: function (d) {
                return scale(d.weight) + 'px';
            }
        });
    }
    redraw();
    $popup.select('.cancel').on('click', function () {
        column.setWeights(weights);
        $popup.remove();
    });
    $popup.select('.ok').on('click', function () {
        column.setWeights(children.map(function (d) { return d.weight; }));
        $popup.remove();
    });
}
exports.openEditWeightsDialog = openEditWeightsDialog;
function markFiltered($header, filtered) {
    if (filtered === void 0) { filtered = false; }
    $header.classed('filtered', filtered);
}
function openCategoricalFilter(column, $header) {
    var bak = column.getFilter() || [];
    var popup = makePopup($header, 'Edit Filter', '<div class="selectionTable"><table><thead><th></th><th>Category</th></thead><tbody></tbody></table></div>');
    var trData = column.categories.map(function (d) {
        return { d: d, isChecked: bak.length === 0 || bak.indexOf(d) >= 0 };
    });
    var trs = popup.select('tbody').selectAll('tr').data(trData);
    trs.enter().append('tr');
    trs.append('td').attr('class', 'checkmark');
    trs.append('td').attr('class', 'datalabel').text(function (d) {
        return d.d;
    });
    function redraw() {
        var trs = popup.select('tbody').selectAll('tr').data(trData);
        trs.select('.checkmark').html(function (d) { return '<i class="fa fa-' + ((d.isChecked) ? 'check-' : '') + 'square-o"></i>'; })
            .on('click', function (d) {
            d.isChecked = !d.isChecked;
            redraw();
        });
        trs.select('.datalabel').style('opacity', function (d) { return d.isChecked ? '1.0' : '.8'; });
    }
    redraw();
    function updateData(filter) {
        markFiltered($header, filter && filter.length > 0 && filter.length < column.categories.length);
        column.setFilter(filter);
    }
    popup.select('.cancel').on('click', function () {
        updateData(bak);
        popup.remove();
    });
    popup.select('.reset').on('click', function () {
        trData.forEach(function (d) { return d.isChecked = true; });
        redraw();
        updateData(null);
    });
    popup.select('.ok').on('click', function () {
        var f = trData.filter(function (d) { return d.isChecked; }).map(function (d) { return d.d; });
        if (f.length === column.categories.length) {
            f = [];
        }
        updateData(f);
        popup.remove();
    });
}
function openStringFilter(column, $header) {
    var bak = column.getFilter() || '';
    var $popup = makePopup($header, 'Filter', "<input type=\"text\" placeholder=\"containing...\" autofocus=\"true\" size=\"15\" value=\"" + ((bak instanceof RegExp) ? bak.source : bak) + "\" autofocus=\"autofocus\">\n    <br><label><input type=\"checkbox\" " + ((bak instanceof RegExp) ? 'checked="checked"' : '') + ">RegExp</label>\n    <br>");
    function updateData(filter) {
        markFiltered($header, (filter && filter !== ''));
        column.setFilter(filter);
    }
    function updateImpl(force) {
        var search = $popup.select('input[type="text"]').property('value');
        if (search.length >= 3 || force) {
            var isRegex = $popup.select('input[type="checkbox"]').property('checked');
            if (isRegex) {
                search = new RegExp(search);
            }
            updateData(search);
        }
    }
    $popup.select('input[type="checkbox"]').on('change', updateImpl);
    $popup.select('input[type="text"]').on('input', updateImpl);
    $popup.select('.cancel').on('click', function () {
        $popup.select('input[type="text"]').property('value', bak);
        $popup.select('input[type="checkbox"]').property('checked', bak instanceof RegExp ? 'checked' : null);
        updateData(bak);
        $popup.remove();
    });
    $popup.select('.reset').on('click', function () {
        $popup.select('input[type="text"]').property('value', '');
        $popup.select('input[type="checkbox"]').property('checked', null);
        updateData(null);
    });
    $popup.select('.ok').on('click', function () {
        updateImpl(true);
        $popup.remove();
    });
}
function openMappingEditor(column, $header, data) {
    var pos = utils.offset($header.node()), bak = column.getMapping(), original = column.getOriginalMapping(), act = bak.clone();
    var popup = d3.select('body').append('div')
        .attr({
        'class': 'lu-popup'
    }).style({
        left: pos.left + 'px',
        top: pos.top + 'px'
    })
        .html(dialogForm('Change Mapping', '<div class="mappingArea"></div>' +
        '<label><input type="checkbox" id="filterIt" value="filterIt">Filter Outliers</label><br>'));
    var $filterIt = popup.select('input').on('change', function () {
        applyMapping(act);
    });
    $filterIt.property('checked', column.isFiltered());
    function applyMapping(newscale) {
        act = newscale;
        markFiltered($header, !newscale.eq(original));
        column.setMapping(newscale);
        var val = $filterIt.property('checked');
        if (val) {
            column.setFilter(newscale.domain[0], newscale.domain[1]);
        }
        else {
            column.setFilter();
        }
    }
    var editorOptions = {
        callback: applyMapping,
        triggerCallback: 'dragend'
    };
    var data_sample = data.mappingSample(column);
    var editor = mappingeditor.create(popup.select('.mappingArea').node(), act, original, data_sample, editorOptions);
    popup.select('.ok').on('click', function () {
        applyMapping(editor.scale);
        popup.remove();
    });
    popup.select('.cancel').on('click', function () {
        column.setMapping(bak);
        markFiltered($header, !bak.eq(original));
        popup.remove();
    });
    popup.select('.reset').on('click', function () {
        bak = original;
        act = bak.clone();
        applyMapping(act);
        popup.selectAll('.mappingArea *').remove();
        editor = mappingeditor.create(popup.select('.mappingArea').node(), act, original, data_sample, editorOptions);
    });
}
function openCategoricalMappingEditor(column, $header) {
    var range = column.getScale().range, colors = column.categoryColors, children = column.categories.map(function (d, i) { return ({ cat: d, range: range[i] * 100, color: colors[i] }); });
    var scale = d3.scale.linear().domain([0, 100]).range([0, 120]);
    var $popup = makePopup($header, 'Edit Categorical Mapping', '<table></table>');
    var $rows = $popup.select('table').selectAll('tr').data(children);
    var $rows_enter = $rows.enter().append('tr');
    $rows_enter.append('td')
        .append('input').attr({
        type: 'number',
        value: function (d) { return d.range; },
        min: 0,
        max: 100,
        size: 5
    }).on('input', function (d) {
        d.range = +this.value;
        redraw();
    });
    $rows_enter.append('td').append('div')
        .attr('class', 'bar')
        .style('background-color', function (d) { return d.color; });
    $rows_enter.append('td').text(function (d) { return d.cat; });
    function redraw() {
        $rows.select('.bar').transition().style({
            width: function (d) {
                return scale(d.range) + 'px';
            }
        });
    }
    redraw();
    $popup.select('.cancel').on('click', function () {
        column.setRange(range);
        $popup.remove();
    });
    $popup.select('.ok').on('click', function () {
        column.setRange(children.map(function (d) { return d.range / 100; }));
        $popup.remove();
    });
}
function filterDialogs() {
    return {
        string: openStringFilter,
        categorical: openCategoricalFilter,
        number: openMappingEditor,
        ordinal: openCategoricalMappingEditor
    };
}
exports.filterDialogs = filterDialogs;

},{"./mappingeditor":2,"./utils":8}],8:[function(require,module,exports){
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var d3 = require('d3');
function delayedCall(callback, timeToDelay, thisCallback) {
    if (timeToDelay === void 0) { timeToDelay = 100; }
    if (thisCallback === void 0) { thisCallback = this; }
    var tm = -1;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        if (tm >= 0) {
            clearTimeout(tm);
            tm = -1;
        }
        args.unshift(thisCallback);
        tm = setTimeout(callback.bind.apply(callback, args), timeToDelay);
    };
}
exports.delayedCall = delayedCall;
function forwardEvent(to, event) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        args.unshift(event || this.type);
        to.fire.apply(to, args);
    };
}
exports.forwardEvent = forwardEvent;
var AEventDispatcher = (function () {
    function AEventDispatcher() {
        this.forwarder = forwardEvent(this);
        this.listeners = d3.dispatch.apply(d3, this.createEventList());
    }
    AEventDispatcher.prototype.on = function (type, listener) {
        var _this = this;
        if (arguments.length > 1) {
            if (Array.isArray(type)) {
                type.forEach(function (d) { return _this.listeners.on(d, listener); });
            }
            else {
                this.listeners.on(type, listener);
            }
            return this;
        }
        return this.listeners.on(type);
    };
    AEventDispatcher.prototype.createEventList = function () {
        return [];
    };
    AEventDispatcher.prototype.fire = function (type) {
        var _this = this;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var fireImpl = function (t) {
            var context = {
                source: _this,
                type: t,
                args: args
            };
            _this.listeners[t].apply(context, args);
        };
        if (Array.isArray(type)) {
            type.forEach(fireImpl.bind(this));
        }
        else {
            fireImpl(type);
        }
    };
    AEventDispatcher.prototype.forward = function (from) {
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        from.on(types, this.forwarder);
    };
    AEventDispatcher.prototype.unforward = function (from) {
        var types = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            types[_i - 1] = arguments[_i];
        }
        from.on(types, null);
    };
    return AEventDispatcher;
})();
exports.AEventDispatcher = AEventDispatcher;
var TYPE_OBJECT = '[object Object]';
var TYPE_ARRAY = '[object Array]';
function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i - 0] = arguments[_i];
    }
    var result = null;
    for (var i = 0; i < args.length; i++) {
        var toMerge = args[i], keys = Object.keys(toMerge);
        if (result === null) {
            result = toMerge;
            continue;
        }
        for (var j = 0; j < keys.length; j++) {
            var keyName = keys[j];
            var value = toMerge[keyName];
            if (Object.prototype.toString.call(value) === TYPE_OBJECT) {
                if (result[keyName] === undefined) {
                    result[keyName] = {};
                }
                result[keyName] = merge(result[keyName], value);
            }
            else if (Object.prototype.toString.call(value) === TYPE_ARRAY) {
                if (result[keyName] === undefined) {
                    result[keyName] = [];
                }
                result[keyName] = value.concat(result[keyName]);
            }
            else {
                result[keyName] = value;
            }
        }
    }
    return result;
}
exports.merge = merge;
function offset(element) {
    var obj = element.getBoundingClientRect();
    return {
        left: obj.left + window.pageXOffset,
        top: obj.top + window.pageYOffset,
        width: obj.width,
        height: obj.height
    };
}
exports.offset = offset;
var ContentScroller = (function (_super) {
    __extends(ContentScroller, _super);
    function ContentScroller(container, content, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        _super.call(this);
        this.container = container;
        this.content = content;
        this.options = {
            topShift: function () { return 0; },
            backupRows: 5,
            rowHeight: 10
        };
        this.prevScrollTop = 0;
        this.shift = 0;
        merge(this.options, options);
        d3.select(container).on('scroll.scroller', function () { return _this.onScroll(); });
        this.prevScrollTop = container.scrollTop;
        this.shift = offset(content).top - offset(container).top;
    }
    ContentScroller.prototype.createEventList = function () {
        return _super.prototype.createEventList.call(this).concat(['scroll', 'redraw']);
    };
    ContentScroller.prototype.select = function (start, length, row2y) {
        var top = this.container.scrollTop - this.shift - this.options.topShift(), bottom = top + this.container.clientHeight, i = 0, j;
        if (top > 0) {
            i = Math.round(top / this.options.rowHeight);
            while (i >= start && row2y(i + 1) > top) {
                i--;
            }
            i -= this.options.backupRows;
        }
        {
            j = Math.round(bottom / this.options.rowHeight);
            while (j <= length && row2y(j - 1) < bottom) {
                j++;
            }
            j += this.options.backupRows;
        }
        return {
            from: Math.max(i, start),
            to: Math.min(j, length)
        };
    };
    ContentScroller.prototype.onScroll = function () {
        var top = this.container.scrollTop;
        var left = this.container.scrollLeft;
        this.fire('scroll', top, left);
        if (Math.abs(this.prevScrollTop - top) >= this.options.rowHeight * this.options.backupRows) {
            this.prevScrollTop = top;
            this.fire('redraw');
        }
    };
    ContentScroller.prototype.destroy = function () {
        d3.select(this.container).on('scroll.scroller', null);
    };
    return ContentScroller;
})(AEventDispatcher);
exports.ContentScroller = ContentScroller;
function hasDnDType(e, typesToCheck) {
    var types = e.dataTransfer.types;
    if (typeof types.indexOf === 'function') {
        return typesToCheck.some(function (type) { return types.indexOf(type) >= 0; });
    }
    if (typeof types.includes === 'function') {
        return typesToCheck.some(function (type) { return types.includes(type); });
    }
    if (typeof types.contains === 'function') {
        return typesToCheck.some(function (type) { return types.contains(type); });
    }
    return false;
}
exports.hasDnDType = hasDnDType;
function copyDnD(e) {
    var dT = e.dataTransfer;
    return (e.ctrlKey && dT.effectAllowed.match(/copy/gi) != null) || (dT.effectAllowed.match(/move/gi) == null);
}
exports.copyDnD = copyDnD;
function updateDropEffect(e) {
    var dT = e.dataTransfer;
    if (copyDnD(e)) {
        dT.dropEffect = 'copy';
    }
    else {
        dT.dropEffect = 'move';
    }
}
exports.updateDropEffect = updateDropEffect;
function dropAble(mimeTypes, onDrop) {
    return function ($node) {
        $node.on('dragenter', function () {
            var e = d3.event;
            if (hasDnDType(e, mimeTypes)) {
                d3.select(this).classed('drag_over', true);
                return false;
            }
            d3.select(this).classed('drag_over', false);
        }).on('dragover', function () {
            var e = d3.event;
            if (hasDnDType(e, mimeTypes)) {
                e.preventDefault();
                updateDropEffect(e);
                d3.select(this).classed('drag_over', true);
                return false;
            }
        }).on('dragleave', function () {
            d3.select(this).classed('drag_over', false);
        }).on('drop', function (d) {
            var e = d3.event;
            e.preventDefault();
            d3.select(this).classed('drag_over', false);
            if (hasDnDType(e, mimeTypes)) {
                var data = {};
                mimeTypes.forEach(function (mime) {
                    var value = e.dataTransfer.getData(mime);
                    if (value !== '') {
                        data[mime] = value;
                    }
                });
                return onDrop(data, d, copyDnD(e));
            }
        });
    };
}
exports.dropAble = dropAble;

},{"d3":undefined}]},{},[1]);
 
});
