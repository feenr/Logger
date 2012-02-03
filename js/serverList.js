

var logs = new Array();
logs[0] = new Object();
logs[0].name = "PAC Dev";
logs[0].url = "\\\\vpacdev2k3\\pacdev_logs";
logs[0].identifier = "PACDEVv54SP1-2012-Feb";
logs[1] = new Object();
logs[1].name = "PAC QA";
logs[1].url = "\\\\vpacqa2k3\\pacqa_logs";
logs[1].identifier = "PAC54qe-2012-Feb";
logs[2] = new Object();
logs[2].name = "PAC Prod";
logs[2].url = "\\\\sibasrv05\\pacprd_logs";
logs[2].identifier = "PACPrd";



if(typeof module != "undefined"){
	module.exports = {logs: logs}
}