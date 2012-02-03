
window.onload=initialize;

var currentID = 0;
var socket;

function initialize(){
	initWebSocket();
	initLogList();
}

function initWebSocket(){
	socket = io.connect('http://lloaner-xp11.rpega.com:81/');
}

function initLogList(){
	for(i in logs){
		serverDetail =  $('<div id="log_'+currentID+'" class="serverDetail"></div>');
		serverDetail.append("<div><input class='logName' value='"+logs[i].name+"'></input></div>");	
		serverDetail.append("<div><input class='logUrl' value='"+logs[i].url+"'></input></div>");
		serverDetail.append("<button onclick='deleteLog("+i+")'>Delete</button>");
		$('#serverDetails').append(serverDetail);
		currentID++;
	}
}

function newLog(){
	var index = logs.length;
	logs[index] = new Object();
	logs[index].name = "";
	logs[index].url = "";
	serverDetail =  $('<div id="log_'+currentID+'" class="serverDetail"></div>');
	serverDetail.append("<div><input class='logName' value=''></input></div>");	
	serverDetail.append("<div><input class='logUrl' value=''></input></div>");
	serverDetail.append("<button onclick='deleteLog("+index+")'>Delete</button>");
	$('#serverDetails').append(serverDetail);
	currentID++;
}

function deleteLog(logID){
	serverDetail = $("#log_"+logID);
	serverDetail.detach();
}

function saveLogs(){
	var valid = true;
	logsForSave =$('.serverDetail');
	logs = new Array();
	for(i=0; i<logsForSave.length; i++){
		logID=$($('.serverDetail')[i]).attr("id");
		var name = $("#"+logID+" div input.logName").val();
		var url = $("#"+logID+" div input.logUrl").val();
		log = new Object();
		log.name = name;
		log.url = url;
		if(validateLogInfo(log)){
			logs.push(log);
		}else{
			valid = false;
			break;
		}
	}

	if(valid){
		var request = new Object();
		request.logs = logs;
		socket.emit('saveLogs', request);
	} else{
		alert("Logs invalid, unable to save.");
	}
}

function validateLogInfo(log){
	if(log.name!="" && log.url!=""){
		return true;
	} else{
		return false;
	}
}