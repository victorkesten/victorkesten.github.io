
var test = "1014";
function changeto(a){
	test = a;
	document.getElementById("example-progressive").innerHTML = "";
	temp();
}


//Generate the Parcoords
var tempT = "";
var tes = 0;
function temp(){
	d3.csv('data/'+test + '.csv', function(data) {
	  var colorgen = d3.scale.ordinal()
	    .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
	            "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
	            "#cab2d6","#6a3d9a","#ffff99","#b15928"]);

	  var parcoords = d3.parcoords()("#example-progressive")
	    .data(data)
	    // .hideAxis(["name"])
	    .color(function(d, i){
	    	return colorgen(i);
	  	})
	    .alpha(0.5)
	    .composite("darken")
	    .margin({ top: 24, left: 150, bottom: 12, right: 0 })
	    .mode("queue")
      .nullValueSeparator("bottom")
	    .render()
	    .reorderable()
	    .brushMode("1D-axes");  // enable brushing

	  parcoords.svg.selectAll("text")
	    .style("font", "10px sans-serif");
	  
    //Genearte the legend   
    var grid = d3.divgrid();
	  grid.columns(["Country"]);
	  d3.select("#grid")
	    .datum(data.slice(0,10))
	    .call(grid)
	    .selectAll(".row")
      .attr("id", function(d,i) { return "country_" + d.Country;})
      .attr("onclick", function(d,i){ return "displayBlob(\"" + d.Country + "\")"})
	    .on({
	      "mouseover": function(d) { parcoords.highlight([d]) },
	      "mouseout": parcoords.unhighlight
	    });

	  // update data table on brush event
	  parcoords.on("brush", function(d) {
	    d3.select("#grid")
	      .datum(d.slice(0,10))
	      .call(grid)
	      .selectAll(".row")
        .attr("id", function(d,i) { return "country_" + d.Country;})
        .attr("onclick", function(d,i){ return "displayBlob(\"" + d.Country + "\")"})
	      .on({
	        "mouseover": function(d) { parcoords.highlight([d]) },
	        "mouseout": parcoords.unhighlight
	      });
	  });

    //Reset button.
	  d3.select('#btnReset').on('click', function(d) {parcoords.brushReset();  
	  	d3.select("#grid")
		    .datum(data.slice(0,10))
		    .call(grid)
		    .selectAll(".row")
        .attr("id", function(d,i) { return "country_" + d.Country;})
        .attr("onclick", function(d,i){ return "displayBlob(\"" + d.Country + "\")"})
		    .on({
		      "mouseover": function(d) { parcoords.highlight([d]) },
		      "mouseout": parcoords.unhighlight
		    });
		});
	});
}


//Generate Pie chart
var currentlySelectedPieChart = 'Azerbaijan_4_0';
function pieChart(){
	   (function(d3) {
        'use strict';

        var width = 420;
        var height = 420;
        var radius = Math.min(width, height) / 2;
        var donutWidth = 75;
        var legendRectSize = 18;
        var legendSpacing = 3;


        var color = d3.scale.category20();
        var svg = d3.select('#chart')
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + (width / 2) + 
            ',' + (height / 2) + ')');

        var arc = d3.svg.arc()
          .innerRadius(radius - donutWidth)
          .outerRadius(radius);

        var pie = d3.layout.pie()
          .value(function(d) { return d.count; })
          .sort(null);

        var tooltip = d3.select('#chart')
          .append('div')
          .attr('class', 'tooltip');
        
        tooltip.append('div')
          .attr('class', 'label');

        tooltip.append('div')
          .attr('class', 'count');

        tooltip.append('div')
          .attr('class', 'percent');

        // try {
        d3.csv('data/'+ yearSelected + "/" + currentlySelectedPieChart + '.csv', function(error, dataset) {
          if(error){
            document.getElementById("chart").innerHTML = "<b id=\"titlehead\">" + country + " " + yearStr[yearSelected] + ": " + tempT + "</b><br>\nThere is unfortunately no data for this category!";
          } else {
          dataset.forEach(function(d) {
            d.count = +d.count;
            d.enabled = true;                                         
          });


          var path = svg.selectAll('path')
            .data(pie(dataset))
            .enter()
            .append('path')
            .attr('d', arc)
            .attr('fill', function(d, i) { 
              return color(d.data.label); 
            })                                                        
            .each(function(d) { this._current = d; });                

          path.on('mouseover', function(d) {
            var total = d3.sum(dataset.map(function(d) {
              return (d.enabled) ? d.count : 0;                       
            }));
            var percent = Math.round(1000 * d.data.count / total) / 10;
            tooltip.select('.label').html(d.data.label);
            tooltip.select('.count').html(d.data.count); 
            tooltip.select('.percent').html(percent + '%'); 
            tooltip.style('display', 'block');
          });
          
          path.on('mouseout', function() {
            tooltip.style('display', 'none');
          });

           // Mouse over funciton 
          path.on('mousemove', function(d) {
            tooltip.style('top', (d3.event.layerY + 10) + 'px')
              .style('left', (d3.event.layerX + 10) + 'px');
          });
          
            
          var legend = svg.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
              var height = legendRectSize + legendSpacing;
              var offset =  height * color.domain().length / 2;
              var horz = -2 * legendRectSize;
              var vert = i * height - offset;
              return 'translate(' + horz + ',' + vert + ')';
            });

          legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)                                   
            .style('fill', color)
            .style('stroke', color)                                   
            .on('click', function(label) {                            
              var rect = d3.select(this);                             
              var enabled = true;                                     
              var totalEnabled = d3.sum(dataset.map(function(d) {     
                return (d.enabled) ? 1 : 0;                           
              }));                                                    
              
              if (rect.attr('class') === 'disabled') {                
                rect.attr('class', '');                               
              } else {                                                
                if (totalEnabled < 2) return;                         
                rect.attr('class', 'disabled');                       
                enabled = false;                                      
              }                                                       

              pie.value(function(d) {                                 
                if (d.label === label) d.enabled = enabled;           
                return (d.enabled) ? d.count : 0;                     
              });                                                     

              path = path.data(pie(dataset));                         

              path.transition()                                       
                .duration(750)                                        
                .attrTween('d', function(d) {                         
                  var interpolate = d3.interpolate(this._current, d); 
                  this._current = interpolate(0);                     
                  return function(t) {                                
                    return arc(interpolate(t));                       
                  };                                                  
                });                                                   
            });                                                       
          legend.append('text')
            .attr('x', legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function(d) { return d; });
        }
        });
      })(window.d3);
}




/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


var yearSelected = 4;
var years = ["","9599", "0004", "0509", "1014"];
var defaultColor = ["","","","","","","","","","",""];
var groupColors = ["#ff7373","#ffc0cb","#d3ffce","#e6e6fa","#7fffd4","#ffa500","#b0e0e6","#008080","#00ff00", "#ff00ff"];

function setYear(year){
  defaultColor[yearSelected-1] = "";
  document.getElementById("ye"+yearSelected).style.backgroundColor = "";
  document.getElementById("ye"+yearSelected).style.color = "white";

  yearSelected = year;

  defaultColor[yearSelected-1] = groupColors[yearSelected-1];
  document.getElementById("ye"+yearSelected).style.color = "black";
  document.getElementById("ye"+yearSelected).style.backgroundColor = defaultColor[yearSelected-1];

  yearSelected = year;
  var filename = "1014";
  if(year == 1){
    filename = "9599"; 
  } else if (year == 2){
    filename = "0004";
  } else if (year == 3){
    filename = "0509";
  }
  changeto(filename);
  generateDropDown();
}

function setCol(a){
  document.getElementById("ye"+a).style.color = "black";
  document.getElementById("ye"+a).style.backgroundColor = groupColors[a-1];
}

function unsetCol(a){
    if(defaultColor[a-1] == ""){
      document.getElementById("ye"+a).style.color = "white";
    }
  document.getElementById("ye"+a).style.backgroundColor = defaultColor[a-1];
}


// Donut Chart Code
var country = "Azerbaijan";
var categoriesYear1 = ["Religious Person","Confidence in Police","Happiness","Having Democracy","Woman earning more than man","Family Importance","Religious Importance","Homosexuality Stance","Men make better Leaders"];
var categoriesYear2 = ["Confidence in Police ","Family Importance","Patriotism","Homosexuality Stance","Men make better leaders","Religious Importance"];
var categoriesYear3 = ["Confidence in Police","Family Importance","Happiness","Patriotism","Homosexuality Stance","Men make better leaders","Religion Importance","Religious Person","Voted in National Election"];
var categoriesYear4 = ["Confidence in Police","Happiness","Patriotism","Woman earning more than men","Family Importance","Religious Importance","Homosexuality Stance","Men make better leaders","Religious Person", "Voted in National Election"];
var currentlySelectedCategory = 0;
var yearStr = ["", "1995-1999", "2000-2004", "2005-2009", "2010-2014"];
function generateDropDown(){
  var title = categoriesYear4;
  var at = "";
  if(yearSelected == 1){
    title = categoriesYear1;
  } else if (yearSelected == 2){
    title = categoriesYear2;
  } else if (yearSelected == 3){
    title = categoriesYear3;
  }

  for(var a = 0; title.length > a; a++){
    at += "<a onclick=\"categoryChoice("+a+")\">"+title[a]+"</a>\n";
  }
  document.getElementById("myDropdown").innerHTML = at;

}
//Take the drop down number
function categoryChoice(a){
  currentlySelectedCategory = a;
  displayBlob(country);
}

function displayBlob(d){
  document.getElementById("titlehead").innerHTML = d;
  country = d;
  setCategory(country + "_" + yearSelected + "_" + currentlySelectedCategory);
}

//country_year_category where filename=d, year=currentlySelectedYear, category=Question asked. 

function setCategory(name){
  var title = categoriesYear4[currentlySelectedCategory];
  if(yearSelected == 1){
    title = categoriesYear1[currentlySelectedCategory];
  } else if (yearSelected == 2){
    title = categoriesYear2[currentlySelectedCategory];
  } else if (yearSelected == 3){
    title = categoriesYear3[currentlySelectedCategory];
  }
  tempT = title;
  document.getElementById("chart").innerHTML = "<b id=\"titlehead\">" + country + " " + yearStr[yearSelected] + ": " + title + "</b>";
  console.log(name);
  currentlySelectedPieChart = name;
  pieChart();
  //Generate new chart using selected variables.
}

var learning = false;
function showLearning(){
  if(learning == false){
    learning = true;
    document.getElementById("learning").style.display = "initial";
  } else {
    learning = false;
      document.getElementById("learning").style.display = "none";
  }
}
