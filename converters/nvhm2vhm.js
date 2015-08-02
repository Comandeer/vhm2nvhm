//Converts nginx's vhosts to Apache's vhosts
"use strict";

var dir = __dirname
,fs = require('fs')
,Converter = function(apacheDir, nginxDir)
{
	if(!(this instanceof Converter))
		throw new Error('Converter can be called only as constructor');

	this.apacheDir = apacheDir || '/etc/apache2';
	this.nginxDir = nginxDir || '/etc/nginx';

	this.template = fs.readFileSync(dir + '/../templates/apache2', 'utf-8');
};

Converter.prototype = {
	constructor: Converter
	,listVHosts: function()
	{
		var files = fs.readdirSync(this.nginxDir + '/sites-enabled')
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
		return fs.readFileSync(this.nginxDir + '/sites-enabled/' + vhost, 'utf-8');
 	}
 	,convertVHost: function(vhost)
 	{
 		var file = this.template
 		,serverName = vhost.match(/server_name (\S+)/)
		,root = vhost.match(/root (.+);\n/)
		,wildcard = !!vhost.match(/server_name (\S+) \*\.\1/g);

 		if(!Array.isArray(serverName) || !Array.isArray(root))
 			throw new Error('vhost file must contain server name and document root');

 		file = file.replace('<domain>', serverName[1].replace(';', ''));
 		file = file.replace('<alias>', wildcard ? 'ServerAlias *.' + serverName[1] : '');
 		file = file.replace('<root>', root[1]);

 		return file;
 	}
 	,saveVHost: function(name, content)
 	{
 		var apacheDir = this.apacheDir
 		,path = apacheDir + '/sites-available/' + name;

 		fs.writeFileSync(path, content);
 		fs.symlinkSync(path, apacheDir + '/sites-enabled/' + name);
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

 				this.saveVHost(name + '.conf', converted);
 			}
 			catch(e)
 			{
 				console.error(e);
 			}
 		}, this);
 	}
};

module.exports = Converter;
