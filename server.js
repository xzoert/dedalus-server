var http = require("http");
var Tagman=require('tagman');
var Inotify=require('inotify').Inotify;
const fs=require('fs');

/*
fs.watch('/home/xzoert', (event,fn) => {
	console.log('WATCH:',event,fn);
});
*/
/*
fs.watchFile('/home/xzoert/test/pluto.txt',(cur,prev) => {
	console.log('CUR',cur,'PREV',prev);
});
*/

/*
var callback = function(event) {
	var mask = event.mask;
	var type = mask & Inotify.IN_ISDIR ? 'directory ' : 'file ';
	event.name ? type += ' ' + event.name + ' ': ' ';

	//the porpuse of this hell of 'if' 
	//statements is only illustrative. 

	if(mask & Inotify.IN_ACCESS) {
		console.log(type + 'was accessed ');
	} else if(mask & Inotify.IN_MODIFY) {
		console.log(type + 'was modified ');
	} else if(mask & Inotify.IN_OPEN) {
		console.log(type + 'was opened ');
	} else if(mask & Inotify.IN_CLOSE_NOWRITE) {
		console.log(type + ' opened for reading was closed ');
	} else if(mask & Inotify.IN_CLOSE_WRITE) {
		console.log(type + ' opened for writing was closed ');
	} else if(mask & Inotify.IN_ATTRIB) {
		console.log(type + 'metadata changed ');
	} else if(mask & Inotify.IN_CREATE) {
		console.log(type + 'created');
	} else if(mask & Inotify.IN_DELETE) {
		console.log(type + 'deleted');
	} else if(mask & Inotify.IN_DELETE_SELF) {
		console.log(type + 'watched deleted ');
	} else if(mask & Inotify.IN_MOVE_SELF) {
		console.log(type + 'watched moved');
		console.log(event);
	} else if(mask & Inotify.IN_IGNORED) {
		console.log(type + 'watch was removed');
	} else if(mask & Inotify.IN_MOVED_FROM) {
		data = event;
		data.type = type;
	} else if(mask & Inotify.IN_MOVED_TO) {
		if( Object.keys(data).length &&
			data.cookie === event.cookie) {
			console.log(type + ' moved to ' + data.type);
			data = {};
		}
	}
}
var inotify=new Inotify();
var watcher = inotify.addWatch({
	path: '/home/xzoert',
	watch_for: Inotify.IN_ALL_EVENTS,
	callback: callback
});
*/

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
	return tagman.define(' label ',Tagman.Text);
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

