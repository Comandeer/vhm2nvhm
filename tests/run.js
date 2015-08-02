"use strict";
var Mocha = require('mocha');

new Mocha()
.ui('bdd')
.reporter('spec')
.addFile('./tests/vhm2nvhm')
.addFile('./tests/nvhm2vhm')
.run();
