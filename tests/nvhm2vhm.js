"use strict";

var Converter = require('../converters/nvhm2vhm.js')
,converter
,expect = require('chai').expect
,fs = require('fs')
,mock = require('mock-fs')
,mockedFs = require('./mock-fs.js');

beforeEach(function()
{
	mock(mockedFs);
	
	converter = new Converter();

	converter.template = mockedFs['templates']['apache2'];
});

afterEach(function()
{
	mock.restore();
});

describe('converter',function()
{
	it('could be called only as constructor', function()
	{
		expect(Converter).to.throw(Error, 'Converter can be called only as constructor');
	});

	it('finds 3 vhosts to convert', function()
	{
		expect(converter.listVHosts()).to.be.an('array')
		.and.have.length(3)
		.and.have.members([
			'invalid'
			,'nowildcard'
			,'wildcard'
		]);
	});

	it('returns proper file content', function()
	{
		expect(converter.getVHost('nowildcard'))
		.to.be.equal(fs.readFileSync('/etc/nginx/sites-enabled/nowildcard', 'utf-8'));
	});

	it('throws error for invalid vhost file', function()
	{
		expect(function()
		{
			converter.convertVHost(fs.readFileSync('/etc/nginx/sites-enabled/invalid', 'utf-8'));
		})
		.to.throw(Error, 'vhost file must contain server name and document root');
	})

	it('returns proper vhost for nowildcard variant', function()
	{
		expect(converter.convertVHost(fs.readFileSync('/etc/nginx/sites-enabled/nowildcard', 'utf-8')))
		.to.be.equal(fs.readFileSync('/etc/apache2/sites-enabled/nowildcard.conf', 'utf8'));
	});

	it('returns proper vhost for wildcard variant', function()
	{
		expect(converter.convertVHost(fs.readFileSync('/etc/nginx/sites-enabled/wildcard', 'utf-8')))
		.to.be.equal(fs.readFileSync('/etc/apache2/sites-enabled/wildcard.conf', 'utf-8'));
	});

	it('can save and properly symlink vhost file', function()
	{
		converter.saveVHost('test.conf', 'test');

		var availPath = '/etc/apache2/sites-available/test.conf'
		,enabledPath = '/etc/apache2/sites-enabled/test.conf'
		,availStats = fs.lstatSync(availPath)
		,enabledStats = fs.lstatSync(enabledPath);

		expect(availStats.isFile()).to.be.true;
		expect(enabledStats.isSymbolicLink()).to.be.true;

		expect(fs.realpathSync(enabledPath)).to.equal(availPath);

		expect(availStats.mtime.getTime()).to.be.at.least(Date.now() - 1000);

	});

	it('can convert and save all at once, excluding invalid ones', function()
	{
		var availPath = '/etc/apache2/sites-available/'
		,enabledPath = '/etc/apache2/sites-enabled/'
		,files = [
			'wildcard.conf'
			,'nowildcard.conf'
		];

		//first of all we must clean up apache2 dir to test symlink
		//yup, super mega ugly, but who cares…
		files.forEach(function(file)
		{
			fs.unlinkSync(availPath + file);
			fs.unlinkSync(enabledPath + file);
		});

		//now the proper test
		converter.processAll();

		files.forEach(function(file)
		{
			var availStats = fs.lstatSync(availPath + file)
			,enabledStats = fs.lstatSync(enabledPath + file);

			expect(availStats.isFile()).to.be.true;
			expect(enabledStats.isSymbolicLink()).to.be.true;

			expect(fs.realpathSync(enabledPath + file)).to.equal(availPath + file);

			expect(availStats.mtime.getTime()).to.be.at.least(Date.now() - 1000);
		});

	})
});
