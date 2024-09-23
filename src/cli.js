#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { program } = require('commander');
const OpenAI = require('openai');
const createNudgeLang = require('./index');
require('dotenv').config();

program
  .version('1.0.0')
  .description('NudgeLang CLI - Execute NudgeLang programs from the command line')
  .argument('<file>', 'Path to the .nudge file')
  .option('-p, --params <file>', 'Path to a JSON file with parameters')
  .option('-o, --output <file>', 'Path to output file (if not specified, outputs to console)')
  .option('-v, --verbose', 'Enable verbose logging')
  .parse(process.argv);

async function main() {
  try {
    const options = program.opts();
    const filePath = program.args[0];

    if (options.verbose) {
      console.log('Reading NudgeLang file:', filePath);
    }

    // Read the .nudge file
    const nudgeCode = await fs.readFile(filePath, 'utf8');

    // Read params file if provided
    let params = {};
    if (options.params) {
      if (options.verbose) {
        console.log('Reading params file:', options.params);
      }
      const paramsJson = await fs.readFile(options.params, 'utf8');
      params = JSON.parse(paramsJson);
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Initialize NudgeLang
    const nudgeLang = createNudgeLang(openai);

    if (options.verbose) {
      console.log('Parsing NudgeLang code...');
    }
    // Parse the NudgeLang code
    const ast = nudgeLang.parsePrompt(nudgeCode);

    if (options.verbose) {
      console.log('Executing prompt...');
    }
    // Execute the prompt
    const result = await nudgeLang.executePrompt(ast, params);

    const output = JSON.stringify(result, null, 2);

    if (options.output) {
      if (options.verbose) {
        console.log('Writing output to file:', options.output);
      }
      await fs.writeFile(options.output, output);
      console.log(`Output written to ${options.output}`);
    } else {
      console.log(output);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();