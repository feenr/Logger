var sys   = require('util');
var spawn = require('child_process').spawn; 
var http  = require('http');
var exec  = require('child_process').exec;

var filename = "TailMe.txt";
if (!filename){
  return sys.puts("Usage: node <server.js> <filename>");
}

var tail = spawn("tail", ["-f", filename]);

tail.stdout.on('data',function(data){
	sys.puts("Data: "+data);

});

tail.stderr.on('data',function(data){
	sys.puts("Err: "+data);
});
