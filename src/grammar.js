// grammar.js
const fs = require('fs');
const path = require('path');
const ohm = require('ohm-js');

const grammarFile = path.join(__dirname, 'nudgelang.ohm');
const grammarContent = fs.readFileSync(grammarFile, 'utf-8');

const nudgeLangGrammar = ohm.grammar(grammarContent);

module.exports = nudgeLangGrammar;