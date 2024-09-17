# NudgeLang: A Declarative Language for LLM Prompts

[![GitHub license](https://img.shields.io/github/license/terraprompt/nudgelang.svg)](https://github.com/terraprompt/nudgelang/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/terraprompt/nudgelang.svg)](https://github.com/terraprompt/nudgelang/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/terraprompt/nudgelang.svg)](https://github.com/terraprompt/nudgelang/issues)

NudgeLang is a powerful, declarative language designed for crafting sophisticated prompts for Large Language Models (LLMs). It provides a structured, modular, and reusable approach to prompt engineering, incorporating advanced techniques and best practices in the field.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Language Overview](#language-overview)
5. [Advanced Techniques](#advanced-techniques)
6. [Examples](#examples)
7. [API Reference](#api-reference)
8. [Contributing](#contributing)
9. [License](#license)

## Features

- **Declarative Syntax**: Write clear, readable prompts with a structured syntax.
- **Modularity**: Import and reuse prompts across your projects.
- **Advanced Techniques**: Built-in support for Chain-of-Thought, Tree-of-Thoughts, ReAct, and more.
- **Type System**: Optional type annotations for improved safety and clarity.
- **Dynamic Content**: Use interpolation and control structures for flexible prompt generation.
- **Execution Hooks**: Pre-process inputs and post-process outputs with custom logic.
- **Output Specification**: Define structured outputs, including JSON schemas.
- **Extensibility**: Easily extend the language with new techniques and features.

## Installation

To install NudgeLang, use npm:

```bash
npm install nudgelang
```

## Quick Start

Here's a simple example to get you started with NudgeLang:

```nudgelang
prompt SimpleMathSolver {
  meta {
    name: "Simple Math Solver";
    version: "1.0";
  }

  params {
    problem: string;
  }

  body {
    text`Let's solve this math problem step by step:
    
    Problem: ${params.problem}
    
    Steps:`;

    chainOfThought {
      step("Understand the problem") {
        text`First, let's identify the key information and what we need to solve.`;
      }
      step("Plan the solution") {
        text`Now, let's outline the steps we'll take to solve this problem.`;
      }
      step("Solve") {
        text`Let's perform the calculations:`;
      }
      step("Check") {
        text`Finally, let's verify our solution:`;
      }
    }
  }

  output {
    format: "json";
    schema: {
      solution: number,
      steps: string[]
    }
  }
}
```

To use this prompt:

```javascript
import { parsePrompt, executePrompt } from 'nudgelang';

const promptCode = '...'; // Your NudgeLang code here
const parsedPrompt = parsePrompt(promptCode);

const result = await executePrompt(parsedPrompt, {
  problem: "What is 15% of 80?"
});

console.log(result.solution); // Outputs the numeric solution
console.log(result.steps);    // Outputs the reasoning steps
```

## Language Overview

NudgeLang is structured into several key sections:

- **meta**: Metadata about the prompt
- **params**: Input parameters for the prompt
- **body**: The main content of the prompt
- **technique**: Advanced prompting techniques to be used
- **constraints**: Execution constraints (e.g., max tokens)
- **output**: Specification for the expected output
- **hooks**: Pre-processing and post-processing logic

For a complete language specification, please refer to our [Language Guide](https://github.com/terraprompt/nudgelang/blob/main/docs/LANGUAGE_GUIDE.md).

## Advanced Techniques

NudgeLang supports a variety of advanced prompting techniques, including:

- Chain of Thought (CoT)
- Tree of Thoughts (ToT)
- ReAct (Reasoning and Acting)
- ReWOO (Reasoning Without Observation)
- Active Prompting
- Self-Consistency
- Automatic Prompt Engineering (APE)
- Expert Prompting

For details on how to use these techniques, check our [Advanced Techniques Guide](https://github.com/terraprompt/nudgelang/blob/main/docs/ADVANCED_TECHNIQUES.md).

## Examples

We provide a variety of examples to help you get started:

- [Simple Math Solver](https://github.com/terraprompt/nudgelang/blob/main/examples/math_solver.nudge)
- [Creative Writing Assistant](https://github.com/terraprompt/nudgelang/blob/main/examples/creative_writer.nudge)
- [Multi-step Reasoning Problem Solver](https://github.com/terraprompt/nudgelang/blob/main/examples/problem_solver.nudge)

## API Reference

For detailed information about the NudgeLang API, including the `parsePrompt` and `executePrompt` functions, please refer to our [API Documentation](https://github.com/terraprompt/nudgelang/blob/main/docs/API.md).

## Contributing

We welcome contributions to NudgeLang! Please see our [Contributing Guide](https://github.com/terraprompt/nudgelang/blob/main/CONTRIBUTING.md) for more information on how to get started.

## License

NudgeLang is released under the MIT License. See the [LICENSE](https://github.com/terraprompt/nudgelang/blob/main/LICENSE) file for more details.

---

For more information, updates, and community discussions, please visit our [GitHub repository](https://github.com/terraprompt/nudgelang). If you encounter any issues or have suggestions, please [open an issue](https://github.com/terraprompt/nudgelang/issues/new).

Happy prompting with NudgeLang!
