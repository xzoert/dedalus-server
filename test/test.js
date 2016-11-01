const http = require('http');
const Q=require('../node_modules/tagman/node_modules/q');



var testData=[
	{url: 'file:///home/xzoert/Desktop/razzo/nando/buttero.txt', tags: ['buttero', 'buttero2'], data: { label: 'Buttero' }},
	{url: 'file:///home/xzoert/Desktop/razzo/nando/ciliegia', tags: ['ciliegia', 'ciliegia2'], data: { label: 'Ciliegia' }},
	{url: 'file:///home/xzoert/Desktop/razzo/nando', tags: ['nando', 'nando2','trasversale'], data: { label: 'Nando' }},
	{url: 'file:///home/xzoert/Desktop/razzo/pippo.txt', tags: ['pippo', 'pippo2'], data: { label: 'Pippo' }},
	{url: 'file:///home/xzoert/Desktop/razzo/pluto.txt', tags: ['pluto', 'pluto2'], data: { label: 'Pluto' }},
	{url: 'file:///home/xzoert/Desktop/razzo', tags: ['razzo', 'razzo2'], data: { label: 'Razzo' }},
	{url: 'file:///home/xzoert/Desktop/mandola', tags: ['mandola', 'mandola2','trasversale'], data: { label: 'Mandola' }},
	{url: 'file:///home/xzoert/Desktop/mandola/tiorba', tags: ['tiorba', 'tiorba2'], data: { label: 'Tiorba' }},
	{url: 'file:///home/xzoert/Desktop/razzo/nando/carpazi/danubio.txt', tags: ['danubio', 'danubio2'], data: { label: 'Danubio' }}
];



function request(f,data) {
	var d=Q.defer();
	
	var options = {
		host: 'localhost',
		path: '/'+f,
		port: '8000',
		method: 'POST'
	};
	
	var req = http.request(options, function (r) {
		var str = ''
		r.on('data', function (chunk) {
			str += chunk;
		});
	
		r.on('error', function (err) {
			d.reject(err);
		});
		
		r.on('end', function () {
			d.resolve(JSON.parse(str));
		});
	});
	
	
	if (data) {
		req.write(JSON.stringify(data));
	}
	req.end();	
	return d.promise;
}




request('clear').
then(function() {
	return request('load',testData);
})
.then(function() {
	return request('rename',{
		url:'file:///home/xzoert/Desktop/razzo/nando/buttero.txt',
		newUrl:'file:///home/xzoert/Desktop/mandola/buttero.txt',
		renameDescendants:true
	})
	.then( (res)=> {
		console.log(res);
	});
})
.then(function(r) {
	return request('find',{tagCloud:'true'})
	.then( (res) => {
		console.log(res);
		for (var i =0; i<res.resources.length; ++i) {
			var r=res.resources[i];
			request('resource',{url:r._url})
			.then(function(res) {
				console.log('RESOURCE',res);
			});
		}
	});
})
.then( () => {
	return request('resource',{url:'file:///home/xzoert/Desktop/razzo/nando/algenore.txt'})
	.then( (res) => {
		console.log('ALGENORE',res);
	});
})
.done(function() {
	console.log('DONE');
});



