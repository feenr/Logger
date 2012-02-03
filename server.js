var 	app = 	require('http').createServer(handler);
var	io = 	require('socket.io').listen(app);
var	fs = 	require('fs'); 
var	sys = 	require('util');
var 	spawn = require('child_process').spawn; 
var	logs =  require('./js/serverList.js').logs;

var	currentLog = "PAC Dev"
var 	tail;


app.listen(81);

function handler (req, res) {
  url="";
  if(req.url=="/"){
  	url="/index.html"	
  }else{
  	url=req.url;
  }
  fs.readFile(__dirname + url,
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.end(data);
  });
}

io.sockets.on('connection', function (socket) {
  var tail;
  var dirname = "";
  var identifier = "";
  var filename = "";
  for(var j = 0; j<logs.length; j++){
  	if(logs[j].name == currentLog){
  		dirname = logs[j].url;
  		identifier = logs[j].identifier;
  	}
  }

  fs.readdir(dirname, function(err,dir){
	files = dir.toString().split(",");
	files.sort();
	for(var i=files.length-1; i>=0; i--){
		if(files[i].indexOf(identifier)!=-1){
			if(files[i].indexOf("ALERT")==-1){
				filename = dirname+"\\"+files[i];
				break;
			}
		}
		
	}
	    tail = spawn("tail", ["-f", filename]);
	    tail.stdout.on('data',function(data){ 	
		x = data+""
		socket.emit("tail",{ tail : x.split("\n")});
	    });

	    tail.stderr.on('data',function(data){
		sys.puts("Err: "+data);
	    });

  });
  
  //Log List Requester
  socket.on('loadLogDirs',function(request){
  	var response = new Object();
  	response.logs = logs;
  	socket.emit('loadLogDirs', response);
   });
  
   //Log Change Requester
   socket.on('logChange',function(request){
   	dirname = request.dirName;
	tail.kill();
	for(var j = 0; j<logs.length; j++){
	  	if(logs[j].name == dirname){
	  		dirname = logs[j].url;
	  		identifier = logs[j].identifier;
	  	}
  	}
	fs.readdir(dirname, function(err,dir){
	   files = dir.toString().split(",");
	   files.sort();
	   for(var i=files.length-1; i>=0; i--){
	      if(files[i].indexOf(identifier)!=-1){
	         if(files[i].indexOf("ALERT")==-1){     
	            filename = dirname+"\\"+files[i];
	            break;
	         }
	      }		
	   }
	   var tail = spawn("tail", ["-f", filename]);
	   tail.stdout.on('data',function(data){ 	
	      x = data+""
	      socket.emit("tail",{ tail : x.split("\n")});
	   });
	   tail.stderr.on('data',function(data){
	      sys.puts("Err: "+data);
	   });
        });
   });
   
   socket.on('saveLogs',function(request){
   	var logBuffer = new Object;
   	logBuffer.logs = request.logs;
   	var moduleBuffer = "if(typeof module != 'undefined'){module.exports = {logs: logs}}";
   	var buffer = JSON.stringify(logBuffer)+"\n"+moduleBuffer;
   	sys.puts(buffer);
   	/**
   	fs.open("./js/serverList.js","w", "",function(err, response){
   		fs.write(response, buffer, 0, 1000, 0, function(){});
   	});
   	**/
   });
   
});