//Converts Apache's vhosts to nginx's vhosts
"use strict";

var dir = __dirname
,fs = require('fs')
,Converter = function(apacheDir, nginxDir)
{
	if(!(this instanceof Converter))
		throw new Error('Converter can be called only as constructor');

	this.apacheDir = apacheDir || '/etc/apache2';
	this.nginxDir = nginxDir || '/etc/nginx';

	this.template = fs.readFileSync(dir + '/../templates/nginx', 'utf-8');
};

Converter.prototype = {
	constructor: Converter
	,listVHosts: function()
	{
		var files = fs.readdirSync(this.apacheDir + '/sites-enabled')
		,result = [];

		files.forEach(function(file)
		{
			if(!file.match(/default/i))
				result.push(file);
		});

		return result;
	}
	,getVHost: function(vhost)
	{
		return fs.readFileSync(this.apacheDir + '/sites-enabled/' + vhost, 'utf-8');
 	}
 	,convertVHost: function(vhost)
 	{
 		var file = this.template
 		,serverName = vhost.match(/ServerName (.+)\n/)
 		,root = vhost.match(/DocumentRoot (.+)\n/)
 		,wildcard = !!vhost.match(/ServerAlias/g);

 		if(!Array.isArray(serverName) || !Array.isArray(root))
 			throw new Error('vhost file must contain server name and document root');

 		file = file.replace('<alias>', wildcard ? serverName[1] + ' *.' + serverName[1] : serverName[1]);
 		file = file.replace('<root>', root[1]);

 		return file;
 	}
 	,saveVHost: function(name, content)
 	{
 		var nginxDir = this.nginxDir
 		,path = nginxDir + '/sites-available/' + name;

 		fs.writeFileSync(path, content);
 		fs.symlinkSync(path, nginxDir + '/sites-enabled/' + name);
 	}
 	,processAll: function()
 	{
 		var vhosts = this.listVHosts();

 		vhosts.forEach(function(vhost)
 		{
 			try
 			{
 				var converted = this.convertVHost(this.getVHost(vhost))
 				,name = vhost.replace('.conf', '');

 				this.saveVHost(name, converted);
 			}
 			catch(e)
 			{
 				console.error(e);
 			}
 		}, this);
 	}
};

module.exports = Converter;
