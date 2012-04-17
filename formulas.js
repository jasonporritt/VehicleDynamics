(function() {
  var GForceGraph, GForceGraphVsSpeed, bootstrap, calculateGForce, calculateInnerWheelSpeedRatio, calculateSteeringAngleFromTurnRadius, calculateTurnRadius, calculateYawRate;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  calculateTurnRadius = function(wheelbase, angle) {
    if (angle === 0) {
      return 0;
    } else {
      return (wheelbase / Math.sin(angle * (Math.PI / 180.0))) / 12.0;
    }
  };
  calculateSteeringAngleFromTurnRadius = function(wheelbase, turnRadius) {
    var itsa;
    if (turnRadius === 0) {
      return 0;
    } else {
      itsa = (wheelbase / 12.0) / (turnRadius * 1.0);
      return Math.asin(itsa) * (180.0 / Math.PI);
    }
  };
  calculateInnerWheelSpeedRatio = function(trackWidth, turnRadius) {
    if (turnRadius === 0) {
      return 1;
    } else {
      return (turnRadius - (trackWidth / 12.0)) / (turnRadius * 1.0);
    }
  };
  calculateGForce = function(mph, radius) {
    var fps;
    if (radius === 0) {
      return 0;
    } else {
      fps = mph * 5280.0 * (1.0 / 3600.0);
      return (Math.pow(fps, 2) / radius) / 32.2;
    }
  };
  calculateYawRate = function(mph, radius) {
    var fps;
    if (radius === 0) {
      return 0;
    } else {
      fps = mph * 5280.0 * (1.0 / 3600.0);
      return (fps / (Math.PI * 2.0 * radius)) * 360.0;
    }
  };
  GForceGraphVsSpeed = (function() {
    function GForceGraphVsSpeed() {
      this.update = __bind(this.update, this);;
      this.draw = __bind(this.draw, this);;      this.width = 300;
      this.height = 140;
      this.padding = 40;
      this.x = d3.scale.linear().domain([0, 155]).range([0 + this.padding, this.width - this.padding]);
      this.yGForce = d3.scale.linear().domain([0, 1.5]).range([0 + this.padding, this.height - this.padding]);
      this.yYaw = d3.scale.linear().domain([0, 30]).range([0 + this.padding, this.height - this.padding]);
      this.gforceGraph = d3.select("#gforce_graph_vs_speed").attr("width", this.width + this.padding * 2).attr("height", this.height - 20);
      this.axisGroup = this.gforceGraph.append("svg:g").attr("transform", "translate(" + (this.padding / 2) + "," + (this.height - 20) + ")");
    }
    GForceGraphVsSpeed.prototype.draw = function() {
      this.axisGroup.selectAll(".yTicks").data(d3.range(0, 1.51, .5)).enter().append("svg:line").attr("x1", this.padding - 10).attr("y1", __bind(function(d) {
        return -1 * this.yGForce(d);
      }, this)).attr("x2", this.width - this.padding + 10).attr("y2", __bind(function(d) {
        return -1 * this.yGForce(d);
      }, this)).attr("stroke", "lightgray").attr("class", "yTicks");
      this.axisGroup.selectAll(".yGForceLabel").data(this.yGForce.ticks(4)).enter().append("svg:text").attr("class", "yGForceLabel").text(String).attr("x", this.padding - 30).attr("y", __bind(function(d) {
        return -1 * this.yGForce(d);
      }, this)).attr("text-anchor", "right").attr("dy", 4);
      this.axisGroup.append("svg:text").attr("class", "yGForceLabel").attr("x", 50).attr("y", -135).text("lateral g").attr("transform", "rotate(90,0," + (-1 * this.height) + ")");
      this.axisGroup.selectAll(".yYawLabel").data(this.yYaw.ticks(4)).enter().append("svg:text").attr("class", "yYawLabel").text(String).attr("x", this.width - this.padding + 15).attr("y", __bind(function(d) {
        return -1 * this.yYaw(d);
      }, this)).attr("text-anchor", "right").attr("dy", 4);
      this.axisGroup.append("svg:text").attr("class", "yYawLabel").attr("x", this.width + 73).attr("y", -100).text("deg. / second").attr("transform", "rotate(90," + (this.width + this.padding) + "," + (-1 * this.height) + ")");
      this.axisGroup.selectAll(".xLabel").data(this.x.ticks(4)).enter().append("svg:text").attr("class", "xLabel").text(String).attr("x", __bind(function(d) {
        return this.x(d);
      }, this)).attr("y", -25).attr("text-anchor", "right");
      return this.axisGroup.append("svg:text").attr("class", "xLabel").attr("x", this.padding).attr("y", -10).text("mph");
    };
    GForceGraphVsSpeed.prototype.update = function(mph, wheelbase, steeringAngle) {
      var currentSpeed, gForceLine, lineGraph, yawLine;
      $("#gforce_graph_vs_speed .gforceLine").remove();
      $("#gforce_graph_vs_speed .yawLine").remove();
      $("#gforce_graph_vs_speed .currentMph").remove();
      gForceLine = d3.svg.line().x(__bind(function(d, i) {
        return this.x(i * 5);
      }, this)).y(__bind(function(d) {
        return -1 * this.yGForce(d);
      }, this));
      yawLine = d3.svg.line().x(__bind(function(d, i) {
        return this.x(i * 5);
      }, this)).y(__bind(function(d) {
        return -1 * this.yYaw(d);
      }, this));
      lineGraph = this.axisGroup.append("svg:path").attr("class", "gforceLine").attr("d", gForceLine(d3.range(0, 155, 5).map(__bind(function(i) {
        return calculateGForce(i, calculateTurnRadius(wheelbase, steeringAngle));
      }, this))));
      lineGraph = this.axisGroup.append("svg:path").attr("class", "yawLine").attr("d", yawLine(d3.range(0, 155, 5).map(__bind(function(i) {
        return calculateYawRate(i, calculateTurnRadius(wheelbase, steeringAngle));
      }, this))));
      return currentSpeed = this.axisGroup.append("svg:line").attr("x1", this.x(mph)).attr("y1", -1 * this.yGForce(0)).attr("x2", this.x(mph)).attr("y2", -1 * this.yGForce(1.5)).attr("stroke", "red").attr("class", "currentMph");
    };
    return GForceGraphVsSpeed;
  })();
  GForceGraph = (function() {
    function GForceGraph() {
      this.update = __bind(this.update, this);;
      this.draw = __bind(this.draw, this);;      this.width = 300;
      this.height = 140;
      this.padding = 40;
      this.x = d3.scale.linear().domain([0, 40]).range([0 + this.padding, this.width - this.padding]);
      this.yGForce = d3.scale.linear().domain([0, 1.5]).range([0 + this.padding, this.height - this.padding]);
      this.yYaw = d3.scale.linear().domain([0, 30]).range([0 + this.padding, this.height - this.padding]);
      this.gforceGraph = d3.select("#gforce_graph").attr("width", this.width + this.padding * 2).attr("height", this.height - 20);
      this.axisGroup = this.gforceGraph.append("svg:g").attr("transform", "translate(" + (this.padding / 2) + "," + (this.height - 20) + ")");
    }
    GForceGraph.prototype.draw = function() {
      this.axisGroup.selectAll(".yTicks").data(d3.range(0, 1.51, .5)).enter().append("svg:line").attr("x1", this.padding - 10).attr("y1", __bind(function(d) {
        return -1 * this.yGForce(d);
      }, this)).attr("x2", this.width - this.padding + 10).attr("y2", __bind(function(d) {
        return -1 * this.yGForce(d);
      }, this)).attr("stroke", "lightgray").attr("class", "yTicks");
      this.axisGroup.selectAll(".yGForceLabel").data(this.yGForce.ticks(4)).enter().append("svg:text").attr("class", "yGForceLabel").text(String).attr("x", this.padding - 30).attr("y", __bind(function(d) {
        return -1 * this.yGForce(d);
      }, this)).attr("text-anchor", "right").attr("dy", 4);
      this.axisGroup.append("svg:text").attr("class", "yGForceLabel").attr("x", 50).attr("y", -135).text("lateral g").attr("transform", "rotate(90,0," + (-1 * this.height) + ")");
      this.axisGroup.selectAll(".yYawLabel").data(this.yYaw.ticks(4)).enter().append("svg:text").attr("class", "yYawLabel").text(String).attr("x", this.width - this.padding + 15).attr("y", __bind(function(d) {
        return -1 * this.yYaw(d);
      }, this)).attr("text-anchor", "right").attr("dy", 4);
      this.axisGroup.append("svg:text").attr("class", "yYawLabel").attr("x", this.width + 73).attr("y", -100).text("deg. / second").attr("transform", "rotate(90," + (this.width + this.padding) + "," + (-1 * this.height) + ")");
      this.axisGroup.selectAll(".xLabel").data(this.x.ticks(4)).enter().append("svg:text").attr("class", "xLabel").text(String).attr("x", __bind(function(d) {
        return this.x(d);
      }, this)).attr("y", -25).attr("text-anchor", "right");
      return this.axisGroup.append("svg:text").attr("class", "xLabel").attr("x", this.padding).attr("y", -10).text("degrees steering input");
    };
    GForceGraph.prototype.update = function(mph, wheelbase, steeringAngle) {
      var currentAngle, gForceLine, lineGraph, yawLine;
      $("#gforce_graph .gforceLine").remove();
      $("#gforce_graph .yawLine").remove();
      $("#gforce_graph .currentAngle").remove();
      gForceLine = d3.svg.line().x(__bind(function(d, i) {
        return this.x(i * 5);
      }, this)).y(__bind(function(d) {
        return -1 * this.yGForce(d);
      }, this));
      yawLine = d3.svg.line().x(__bind(function(d, i) {
        return this.x(i * 5);
      }, this)).y(__bind(function(d) {
        return -1 * this.yYaw(d);
      }, this));
      lineGraph = this.axisGroup.append("svg:path").attr("class", "gforceLine").attr("d", gForceLine(d3.range(0, 61, 5).map(__bind(function(i) {
        return calculateGForce(mph, calculateTurnRadius(wheelbase, i));
      }, this))));
      lineGraph = this.axisGroup.append("svg:path").attr("class", "yawLine").attr("d", yawLine(d3.range(0, 61, 5).map(__bind(function(i) {
        return calculateYawRate(mph, calculateTurnRadius(wheelbase, i));
      }, this))));
      return currentAngle = this.axisGroup.append("svg:line").attr("x1", this.x(steeringAngle)).attr("y1", -1 * this.yGForce(0)).attr("x2", this.x(steeringAngle)).attr("y2", -1 * this.yGForce(1.5)).attr("stroke", "red").attr("class", "currentAngle");
    };
    return GForceGraph;
  })();
  bootstrap = function() {
    var gForceGraph, gForceGraphVsSpeed, tangle;
    gForceGraph = new GForceGraph;
    gForceGraph.draw();
    gForceGraphVsSpeed = new GForceGraphVsSpeed;
    gForceGraphVsSpeed.draw();
    return tangle = new Tangle(document, {
      initialize: function() {
        this.steeringAngle = 0;
        this.steeringAngleInner = 0;
        this.steeringAngleAverage = 0;
        this.wheelbase = 103.9;
        this.trackWidth = 60.4;
        return this.mph = 30;
      },
      update: function() {
        var averageTurnRadius, halfRatio, innerTurnRadius, ratio;
        this.turnRadius = calculateTurnRadius(this.wheelbase, this.steeringAngle);
        ratio = calculateInnerWheelSpeedRatio(this.trackWidth, this.turnRadius);
        halfRatio = ((ratio - 1) / 2.0) + 1;
        this.innerWheelSpeed = this.mph * halfRatio;
        this.outerWheelSpeed = this.mph / halfRatio;
        this.gForce = calculateGForce(this.mph, this.turnRadius);
        this.yawRate = calculateYawRate(this.mph, this.turnRadius);
        gForceGraph.update(this.mph, this.wheelbase, this.steeringAngle);
        gForceGraphVsSpeed.update(this.mph, this.wheelbase, this.steeringAngle);
        innerTurnRadius = this.turnRadius !== 0 ? this.turnRadius - (this.trackWidth / 12.0) : 0;
        averageTurnRadius = this.turnRadius !== 0 ? this.turnRadius - (this.trackWidth / 12.0) * 0.5 : 0;
        this.steeringAngleInner = calculateSteeringAngleFromTurnRadius(this.wheelbase, innerTurnRadius);
        return this.steeringAngleAverage = calculateSteeringAngleFromTurnRadius(this.wheelbase, averageTurnRadius);
      }
    });
  };
  $(function() {
    return bootstrap();
  });
}).call(this);
