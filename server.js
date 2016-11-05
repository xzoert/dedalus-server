var http = require("http");
var Tagman=require('tagman');
const fs=require('fs');


process.on('uncaughtException', (err) => {
	console.log('ERROR',err)
});


function handleError(res,err,data) {
	if (err) {
		if (typeof err === 'object' && 'code' in err && 'msg' in err) {
			res.writeHead(err.code);
			res.end(err.msg);
		} else {
			res.writeHead(500);
			if (typeof err === 'string') res.end(err);
			else res.end();
		}
		return 1;
	} else if (typeof data==='undefined') {
		res.writeHead(500);
		res.end();
		return 1;
	} 
	return 0;
}

var restHandler;

var tagman;

Tagman.q.get()
.then(function(t) {
	tagman=t;
	tagman.define('label',Tagman.Text)
	.then( () => {
		return tagman.define('isdir',Tagman.Float)
	});
})
.then( () => {
	return Tagman.q.getRest(tagman);
}, (reason) => {
	throw reason;
})
.then( (rh) => {
	restHandler=rh;
}, (reason) => {
	throw reason;
})
.done();

var port=8000; 
http.createServer( (req, res) => {
	if (!restHandler) {
		res.writeHead(500);
		res.end();
	} else {
		restHandler.handleRequest(req,res, (err,data) => {
			if (handleError(res,err,data)) return;
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.end(JSON.stringify(data));
		});
	}
}).listen(port);

