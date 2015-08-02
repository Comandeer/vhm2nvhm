"use strict";

var fs = require('fs')
,mock = require('mock-fs')
,dir = __dirname
,mockedFs = {
	'templates': {
		'apache2': fs.readFileSync(dir + '/../templates/apache2', 'utf-8')
		,'nginx': fs.readFileSync(dir + '/../templates/nginx', 'utf-8')
	}
	,'/etc/apache2': {
		'sites-available': {
			'default.conf': ''
			,'invalid.conf': ''
			,'wildcard.conf': mock.file({
				content: fs.readFileSync(dir + '/templates/apache2/wildcard', 'utf-8')
				,ctime: new Date(1)
				,mtime: new Date(1)
			})
			,'nowildcard.conf': mock.file({
				content: fs.readFileSync(dir + '/templates/apache2/nowildcard', 'utf-8')
				,ctime: new Date(1)
				,mtime: new Date(1)
			})
		}
	}
	,'/etc/nginx': {
		'sites-available': {
			'default': ''
			,'invalid': ''
			,'wildcard': mock.file({
				content: fs.readFileSync(dir + '/templates/nginx/wildcard', 'utf-8')
				,ctime: new Date(1)
				,mtime: new Date(1)
			})
			,'nowildcard': mock.file({
				content: fs.readFileSync(dir + '/templates/nginx/nowildcard', 'utf-8')
				,ctime: new Date(1)
				,mtime: new Date(1)
			})
		}
	}
}

mockedFs['/etc/apache2']['sites-enabled'] = mockedFs['/etc/apache2']['sites-available'];
mockedFs['/etc/nginx']['sites-enabled'] = mockedFs['/etc/nginx']['sites-available'];

module.exports = mockedFs;
