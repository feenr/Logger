window.onload=initialize;

//Global Vars;
var lines = new Array();
var range = 60;
var currentDateTime = Date.parse(new Date());
var svg;
var socket

function initialize(){
	initWebSocket();
	initChart();
	loadLogDirs();
}

function logChange(){
	lines = new Array();
	$('#chart').empty();
	$('#tail').empty();
	initChart();
	var event = new Object();
	event.dirName = $('#logSelect').val();
	socket.emit('logChange', event);
	
}

function loadLogDirs(){
	var event = new Object();
	socket.emit('loadLogDirs', event);
	socket.on('loadLogDirs', function(event){
		fileSelect = $('#logSelect');
		for(var i =0; i<event.logs.length; i++){
			var logName = event.logs[i].name;
			var logURL = event.logs[i].url;
			fileSelect.append($('<option value = "'+logName+'">'+logName+'</option>'));
		}
	});
}

function initChart(){
		svg = d3.select("#chart").append("svg:svg")
		.attr("width", 1000)
		.attr("height", 250);
		d3.scale.linear();

		var minDomain = -range;
		var maxDomain = 0;
		var x = d3.scale.linear().domain([minDomain, maxDomain]).range([0,950]);
		var y = d3.scale.linear().domain([0, 400]).range([200,0]);

		lines=[];
		svg.selectAll("line")
		.data(x.ticks(10))
		.enter().append("svg:line")
		.attr("x1", function(d){return x(d)-11;})
		.attr("x2", function(d){return x(d)-11;})
		.attr("y1", 0)
		.attr("y2", 220)
		.attr("stroke", "#ccc");

		svg.selectAll("text.rule")
		.data(x.ticks(10))
		.enter().append("svg:text")
		.attr("class", "rule")
		.attr("x", function(d){return x(d)-11;})
		.attr("y", 240)
		.attr("dy", -3)
		.attr("text-anchor", "middle")
		.attr("stroke", "#eee")
		.text(String);
}

function initWebSocket(){
	socket = io.connect('http://lloaner-xp11.rpega.com:81/');
	var lines = 0, notice = $("#info"), buffer = $('#tail')
	socket.on('news', function (data) {});
	socket.on('tail', function (data) {
		for(i in data.tail){
			buffer.append("<div style='white-space:nowrap;'>"+data.tail[i]+"</div>");
		}
		//$("#tailContainer").scrollTop(buffer.height());
		$("#tailContainer").animate({scrollTop:buffer.height()}, 2000)
		addEvent(data);
	});
}

//This funtion parses a log dat in the format of 2011-01-01 00:00:00,000 into a unix timestamp with minute prescision.
function parseDateTime(datetime){
	var year = datetime.substring(0,4);
	var month = datetime.substring(5,7);
	var day = datetime.substring(8,10);
	var hours = datetime.substring(11,13);
	var minutes= datetime.substring(14,16);
	var seconds = '00'
	var miliseconds = '000';
	var date = (Date.parse(new Date(year, month-1, day, hours, minutes, seconds, miliseconds))-currentDateTime);
	return date/60000
}

//Get current date in Unix time.
function getCurrentDate(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!	
	var yyyy = today.getFullYear();
	if(dd<10){
		dd='0'+dd;
	} 
	if(mm<10){
		mm='0'+mm;
	} 
	var hh = today.getHours();
	var mi = today.getMinutes();
	var ss = today.getSeconds();
	var today = yyyy+mm+dd+hh+mi+ss;
	var time = hh+":"+mi+":00,000"
	currentTime = parseTime(time);
}

//Update the graph every second.
setInterval(reDraw, 1000);
function reDraw(){
	currentDateTime = Date.parse(new Date());	
	var minDomain = -range;
	var maxDomain = 0;
	var x = d3.scale.linear().domain([minDomain, maxDomain]).range([0,950]);
	var y = d3.scale.linear().domain([0, 400]).range([200,0]);
	svg.selectAll('rect').data(lines)
	.attr("x", function(d){
		return x(parseDateTime(d.datetime));
	})
	/** 
	//y should never be changing, so we should not need this.
	.attr("y", function(d){
		var count = 0;
		for(i=0; i<lines.length;i++){
			if(parseDateTime(lines[i].datetime)==parseDateTime(d.datetime)){
				if(lines[i].datetime!=d.datetime || lines[i].message!=d.message){
					count++;
				}else{
					break;
				}
			}
		}
		var height = 30 * count;
		return y(height);
	})
	**/
}

function addEvent(events){

	for(i=0; i<events.tail.length; i++){
		text=events.tail[i];
		//A silly way of determining if this is the first line in an entry. We are looking for date. We should instead use a regex here.
		if(text.substring(0,3)=="201"){
			line = new Object();
			var tokens = text.split(" ", 2);
			line.date = tokens[0];
			line.time = tokens[1];
			line.datetime = tokens[0]+' '+tokens[1];
			line.message = text.substring(text.indexOf("["));
			lines.push(line);
			//svg.selectAll('.event').data(lines).append('event');
		}else{ // If this is not an inital line, we should appen to the message of the previous entry.
			lines[lines.length-1].message += text;
		}
	}

	currentDateTime = Date.parse(new Date());
	var minDomain = -range;
	var maxDomain = 0;
	var x = d3.scale.linear().domain([minDomain, maxDomain]).range([0,950]);
	var y = d3.scale.linear().domain([0, 400]).range([200,0]);
	svg.selectAll('rect').data(lines).enter().append('svg:rect')
	.attr("class","event")
		.style("stroke-width", 2)
		.style("stroke", "gray")
		.style("fill", function(d){
			if(d.message.indexOf("ERROR")>0){
				return "red";
			}if(d.message.indexOf("FATAL")>0){
				return "red";
			}else if(d.message.indexOf("INFO")>0){
				return "yellow";
			}else {
				return "blue";
			}
		})
		.attr("x", function(d){
			return x(parseDateTime(d.datetime));
	
		})
		.attr("y", function(d){
			var count = 0;
			for(i=0; i<lines.length;i++){
				if(parseDateTime(lines[i].datetime)==parseDateTime(d.datetime)){
					if(lines[i].datetime!=d.datetime  || lines[i].message!=d.message){
						count++;
					}else{
						break;
					}
				}
			}
			var height = 30 * count;
			return y(height);
		})
		.attr("fill", "blue")
		.attr("height",10)
		.attr("width",10)
		.attr("title", function(d){
			return d.message;
		})
		.on("click", function(d){
	
			var messageInfo = $("<div id=''></div>");
			messageInfo.dialog({
				buttons: {
					Okay: function(){
						$(this).dialog("close");
					}
				},
				width: 600,
				height: 400,
				modal: true	
			});
			messageInfo.append(d.message);	
	});
}

function deleteEvents(){

}