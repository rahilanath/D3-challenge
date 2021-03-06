// Height, width and margins
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by leftS and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(incData, chosenXAxis) {
    // create x scale
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(incData, d => d[chosenXAxis]) * 0.8,
            d3.max(incData, d => d[chosenXAxis]) * 1.2])
        .range([0, width]);

    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(incData, chosenYAxis) {
     // create y scale
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(incData, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;   
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}


// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]))

    return circlesGroup;
}

// function used for updating circle text with a transition to new circles
function renderCircleText(circlesText, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesText.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]) + margin.left)
        .attr("y", d => newYScale(d[chosenYAxis]) + margin.top)
        .text(d => d.abbr)

    return circlesText;
}

// function used for updating circles group with new tooltip
function updateToolTip(circlesText, chosenXAxis, chosenYAxis) {
    var xLabel;
    var xType;
    var yLabel;
    var yType;

    if (chosenXAxis === "poverty") {
        xLabel = "Poverty:";
        xType = "%";
    }
    else if (chosenXAxis === "age") {
        xLabel = "Age:";
        xType = ""
    }
    else if (chosenXAxis === "income"){
        xLabel = "Income:";
        xType = "";
    }

    if (chosenYAxis === "healthcare") {
        yLabel = "Lacks Healthcare:";
        yType = "%";
    }
    else if (chosenYAxis === "smokes") {
        yLabel = "Smokes:";
        yType = "%";
    }
    else if (chosenYAxis === "obesity"){
        yLabel = "Obesity:";
        yType = "%";
    }
    
    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([0, 0])
        .html(d => `${d.state}<br>${yLabel} ${d[chosenYAxis]}${yType}<br>${xLabel} ${d[chosenXAxis]}${xType}`);

    circlesText.call(toolTip);

    circlesText.on("mouseover", function(data) {
        toolTip.show(data);
        })

    // onmouseout event
    .on("mouseout", function(data) {
        toolTip.hide(data);
    });

    return circlesText;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(incData => {

    // parse data
    incData.forEach(data => {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(incData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(incData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(incData)
        .join("circle")
        .attr("class", "stateCircle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 10)
        .attr("opacity", 0.5)
        .attr("stroke", "black");

    // append initial circle text
    var circlesText = svg.append("g")
        .attr("font-weight", 700)
        .attr("text-anchor", "middle")
        .selectAll("text")
        .data(incData)
        .join("text")
        .attr("class", "stateText")
        .attr("dy", "0.35em")
        .attr("x", d => xLinearScale(d[chosenXAxis]) + margin.left)
        .attr("y", d => yLinearScale(d[chosenYAxis]) + margin.top)
        .text(d => d.abbr);

    // Create group for three x-axis labels
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");
    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");

    // Create group for three y-axis labels
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(0, ${height / width})`);
    // append y axis
    var healthcareLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - (margin.left - 60))
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Lacks Healthcare (%)");
    var smokesLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - (margin.left - 40))
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes (%)");
    var obesityLabel = ylabelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - (margin.left - 20))
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity") // value to grab for event listener
        .classed("inactive", true)
        .text("Obesity (%)");

    // updateToolTip function above csv import
    var circlesText = updateToolTip(circlesText, chosenXAxis, chosenYAxis);

    // x axis labels event listener
    xlabelsGroup.selectAll("text").on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
            // replaces chosenXAxis with value
            chosenXAxis = value;

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(incData, chosenXAxis);

            // updates axes with transition
            xAxis = renderXAxis(xLinearScale, xAxis);

            // updates circles with new x/y values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates circles with new text values
            circlesText = renderCircleText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesText = updateToolTip(circlesText, chosenXAxis, chosenYAxis);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "age") {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                incomeLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === 'income') {
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                incomeLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }    
    });

    // y axis labels event listener
    ylabelsGroup.selectAll("text").on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
            // replaces chosenXAxis with value
            chosenYAxis = value;
    
            // functions here found above csv import
            // updates x scale for new data
            yLinearScale = yScale(incData, chosenYAxis);
    
            // updates axes with transition
            yAxis = renderYAxis(yLinearScale, yAxis);
    
            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates circles with new text values
            circlesText = renderCircleText(circlesText, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesText = updateToolTip(circlesText, chosenXAxis, chosenYAxis);
    
            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "obesity") {
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                
            }
        }    
    });
}).catch(error => console.log(error));