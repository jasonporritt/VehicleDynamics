# Radius from outside tire turning angle (degrees) and wheelbase (inches)
calculateTurnRadius = (wheelbase, angle) ->
  if angle == 0
    return 0
  else
    return (wheelbase / Math.sin(angle * (Math.PI/180.0))) / 12.0

calculateSteeringAngleFromTurnRadius = (wheelbase, turnRadius) ->
  if turnRadius == 0
    return 0
  else
    itsa = (wheelbase / 12.0) / (turnRadius * 1.0)
    return Math.asin(itsa) * (180.0/Math.PI)

# Wheel speed ratio in a turn
#   trackWidth -- distance between front tire midpoints (inches)
#   turnRadius -- radius of the turn (feet)
# returns ratio of inside wheel speed to outside wheel speed
calculateInnerWheelSpeedRatio = (trackWidth, turnRadius) ->
  if turnRadius == 0
    return 1
  else
    return (turnRadius - (trackWidth / 12.0)) / (turnRadius * 1.0)

calculateGForce = (mph, radius) ->
  if radius == 0
    return 0
  else
    fps = mph * 5280.0 * (1.0/3600.0)
    return (Math.pow(fps,2)/ radius) / 32.2

# Returns yaw rate in degrees per second
calculateYawRate = (mph, radius) ->
  if radius == 0
    return 0
  else
    fps = mph * 5280.0 * (1.0/3600.0)
    return (fps / (Math.PI * 2.0 * radius)) * 360.0

class GForceGraphVsSpeed
  constructor: () ->
    @width =  300
    @height = 140
    @padding = 40
    @x = d3.scale.linear().domain([0, 155]).range([0+@padding, @width - @padding])
    @yGForce = d3.scale.linear().domain([0, 1.5]).range([0+@padding, @height - @padding])
    @yYaw = d3.scale.linear().domain([0, 30]).range([0+@padding, @height - @padding])
    @gforceGraph = d3.select("#gforce_graph_vs_speed")
      .attr("width", @width + @padding * 2)
      .attr("height", @height - 20)
    @axisGroup = @gforceGraph.append("svg:g")
      .attr("transform", "translate(#{@padding/2},#{@height - 20})")

  draw: () =>
    @axisGroup.selectAll(".yTicks").
      data(d3.range(0, 1.51, .5)).
      enter().append("svg:line").
      attr("x1", @padding - 10).
      attr("y1", (d) => -1 * @yGForce(d)).
      attr("x2", @width - @padding + 10).
      attr("y2", (d) => -1 * @yGForce(d)).
      attr("stroke", "lightgray").
      attr("class", "yTicks")

    @axisGroup.selectAll(".yGForceLabel")
      .data(@yGForce.ticks(4))
      .enter().append("svg:text")
      .attr("class", "yGForceLabel")
      .text(String)
      .attr("x", @padding - 30)
      .attr("y", (d) => -1 * @yGForce(d))
      .attr("text-anchor", "right")
      .attr("dy", 4)
    @axisGroup
      .append("svg:text")
      .attr("class", "yGForceLabel")
      .attr("x", 50)
      .attr("y", -135)
      .text("lateral g")
      .attr("transform", "rotate(90,0,#{-1 * @height})")

    @axisGroup.selectAll(".yYawLabel")
      .data(@yYaw.ticks(4))
      .enter().append("svg:text")
      .attr("class", "yYawLabel")
      .text(String)
      .attr("x", @width - @padding + 15)
      .attr("y", (d) => -1 * @yYaw(d))
      .attr("text-anchor", "right")
      .attr("dy", 4)
    @axisGroup
      .append("svg:text")
      .attr("class", "yYawLabel")
      .attr("x", @width + 73)
      .attr("y", -100)
      .text("deg. / second")
      .attr("transform", "rotate(90,#{@width + @padding},#{-1 * @height})")

    @axisGroup.selectAll(".xLabel")
      .data(@x.ticks(4))
      .enter().append("svg:text")
      .attr("class", "xLabel")
      .text(String)
      .attr("x", (d) => @x(d))
      .attr("y", -25)
      .attr("text-anchor", "right")
    @axisGroup
      .append("svg:text")
      .attr("class", "xLabel")
      .attr("x", @padding)
      .attr("y", -10)
      .text("mph")
  
  update: (mph, wheelbase, steeringAngle) =>
    $("#gforce_graph_vs_speed .gforceLine").remove()
    $("#gforce_graph_vs_speed .yawLine").remove()
    $("#gforce_graph_vs_speed .currentMph").remove()
    gForceLine = d3.svg.line()
      .x((d,i) => @x(i*5))
      .y((d) =>  -1 * @yGForce(d))
    yawLine = d3.svg.line()
      .x((d,i) => @x(i*5))
      .y((d) =>  -1 * @yYaw(d))
    lineGraph = @axisGroup.
      append("svg:path").
      attr("class", "gforceLine").
      attr("d", gForceLine(d3.range(0, 155, 5).
      map((i) => calculateGForce(i, calculateTurnRadius(wheelbase, steeringAngle)))))
    lineGraph = @axisGroup.
      append("svg:path").
      attr("class", "yawLine").
      attr("d", yawLine(d3.range(0, 155, 5).
      map((i) => calculateYawRate(i, calculateTurnRadius(wheelbase, steeringAngle)))))
    currentSpeed = @axisGroup.
      append("svg:line").
      attr("x1", @x(mph)).
      attr("y1", -1 * @yGForce(0)).
      attr("x2", @x(mph)).
      attr("y2", -1 * @yGForce(1.5)).
      attr("stroke", "red").
      attr("class", "currentMph")


class GForceGraph
  constructor: () ->
    @width =  300
    @height = 140
    @padding = 40
    @x = d3.scale.linear().domain([0, 40]).range([0+@padding, @width - @padding])
    @yGForce = d3.scale.linear().domain([0, 1.5]).range([0+@padding, @height - @padding])
    @yYaw = d3.scale.linear().domain([0, 30]).range([0+@padding, @height - @padding])
    @gforceGraph = d3.select("#gforce_graph")
      .attr("width", @width + @padding * 2)
      .attr("height", @height - 20)
    @axisGroup = @gforceGraph.append("svg:g")
      .attr("transform", "translate(#{@padding/2},#{@height - 20})")

  draw: () =>
    @axisGroup.selectAll(".yTicks").
      data(d3.range(0, 1.51, .5)).
      enter().append("svg:line").
      attr("x1", @padding - 10).
      attr("y1", (d) => -1 * @yGForce(d)).
      attr("x2", @width - @padding + 10).
      attr("y2", (d) => -1 * @yGForce(d)).
      attr("stroke", "lightgray").
      attr("class", "yTicks")

    @axisGroup.selectAll(".yGForceLabel")
      .data(@yGForce.ticks(4))
      .enter().append("svg:text")
      .attr("class", "yGForceLabel")
      .text(String)
      .attr("x", @padding - 30)
      .attr("y", (d) => -1 * @yGForce(d))
      .attr("text-anchor", "right")
      .attr("dy", 4)
    @axisGroup
      .append("svg:text")
      .attr("class", "yGForceLabel")
      .attr("x", 50)
      .attr("y", -135)
      .text("lateral g")
      .attr("transform", "rotate(90,0,#{-1 * @height})")

    @axisGroup.selectAll(".yYawLabel")
      .data(@yYaw.ticks(4))
      .enter().append("svg:text")
      .attr("class", "yYawLabel")
      .text(String)
      .attr("x", @width - @padding + 15)
      .attr("y", (d) => -1 * @yYaw(d))
      .attr("text-anchor", "right")
      .attr("dy", 4)
    @axisGroup
      .append("svg:text")
      .attr("class", "yYawLabel")
      .attr("x", @width + 73)
      .attr("y", -100)
      .text("deg. / second")
      .attr("transform", "rotate(90,#{@width + @padding},#{-1 * @height})")

    @axisGroup.selectAll(".xLabel")
      .data(@x.ticks(4))
      .enter().append("svg:text")
      .attr("class", "xLabel")
      .text(String)
      .attr("x", (d) => @x(d))
      .attr("y", -25)
      .attr("text-anchor", "right")
    @axisGroup
      .append("svg:text")
      .attr("class", "xLabel")
      .attr("x", @padding)
      .attr("y", -10)
      .text("degrees steering input")
  
  update: (mph, wheelbase, steeringAngle) =>
    $("#gforce_graph .gforceLine").remove()
    $("#gforce_graph .yawLine").remove()
    $("#gforce_graph .currentAngle").remove()
    gForceLine = d3.svg.line()
      .x((d,i) => @x(i*5))
      .y((d) =>  -1 * @yGForce(d))
    yawLine = d3.svg.line()
      .x((d,i) => @x(i*5))
      .y((d) =>  -1 * @yYaw(d))
    lineGraph = @axisGroup.
      append("svg:path").
      attr("class", "gforceLine").
      attr("d", gForceLine(d3.range(0, 61, 5).
      map((i) => calculateGForce(mph, calculateTurnRadius(wheelbase, i)))))
    lineGraph = @axisGroup.
      append("svg:path").
      attr("class", "yawLine").
      attr("d", yawLine(d3.range(0, 61, 5).
      map((i) => calculateYawRate(mph, calculateTurnRadius(wheelbase, i)))))
    currentAngle = @axisGroup.
      append("svg:line").
      attr("x1", @x(steeringAngle)).
      attr("y1", -1 * @yGForce(0)).
      attr("x2", @x(steeringAngle)).
      attr("y2", -1 * @yGForce(1.5)).
      attr("stroke", "red").
      attr("class", "currentAngle")



bootstrap = () ->
  gForceGraph = new GForceGraph
  gForceGraph.draw()
  gForceGraphVsSpeed = new GForceGraphVsSpeed
  gForceGraphVsSpeed.draw()
  tangle = new Tangle document, 
    initialize: () ->
      @steeringAngle = 0
      @steeringAngleInner = 0
      @steeringAngleAverage = 0
      @wheelbase = 100
      @trackWidth = 50
      @mph = 30
    update: () ->
      @turnRadius = calculateTurnRadius @wheelbase, @steeringAngle
      ratio = calculateInnerWheelSpeedRatio(@trackWidth, @turnRadius)
      halfRatio = ((ratio - 1) / 2.0) + 1
      @innerWheelSpeed = @mph * halfRatio
      @outerWheelSpeed = @mph / halfRatio
      @gForce = calculateGForce @mph, @turnRadius
      @yawRate = calculateYawRate @mph, @turnRadius
      gForceGraph.update(@mph, @wheelbase, @steeringAngle)
      gForceGraphVsSpeed.update(@mph, @wheelbase, @steeringAngle)

      innerTurnRadius = if @turnRadius != 0 then @turnRadius - (@trackWidth/12.0) else 0
      averageTurnRadius = if @turnRadius != 0 then @turnRadius - (@trackWidth/12.0) * 0.5 else 0
      @steeringAngleInner = calculateSteeringAngleFromTurnRadius(@wheelbase, innerTurnRadius)
      @steeringAngleAverage = calculateSteeringAngleFromTurnRadius(@wheelbase, averageTurnRadius)

$ ->
  bootstrap()


