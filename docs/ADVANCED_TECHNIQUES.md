# NudgeLang: Language Guide

NudgeLang is a declarative language designed for crafting sophisticated prompts for Large Language Models (LLMs). This guide provides a comprehensive overview of the language syntax, features, and advanced techniques.

## Table of Contents

1. [Basic Structure](#basic-structure)
2. [Sections](#sections)
3. [Body Content](#body-content)
4. [Advanced Techniques](#advanced-techniques)
5. [Expressions and Control Flow](#expressions-and-control-flow)
6. [Importing and Reusing Prompts](#importing-and-reusing-prompts)

## Basic Structure

A NudgeLang prompt consists of several optional sections, each serving a specific purpose:

```nudgelang
prompt PromptName {
  meta { ... }
  context { ... }
  params { ... }
  body { ... }
  constraints { ... }
  output { ... }
  hooks { ... }
  technique { ... }
}
```

## Sections

### Meta Section

The meta section provides metadata about the prompt:

```nudgelang
meta {
  name: "Example Prompt";
  version: "1.0";
  description: "This is an example prompt.";
}
```

### Context Section

The context section sets up the background for the LLM:

```nudgelang
context {
  role: "You are an expert mathematician.";
  background: "You specialize in algebra and calculus.";
}
```

### Params Section

The params section defines input parameters for the prompt:

```nudgelang
params {
  problem: string;
  difficulty: string = "medium";
  steps?: number;
}
```

### Constraints Section

The constraints section specifies execution constraints for the LLM:

```nudgelang
constraints {
  maxTokens: 500;
  temperature: 0.7;
}
```

### Output Section

The output section defines the expected output format:

```nudgelang
output {
  format: "json";
  schema: {
    solution: string,
    steps: string[]
  }
}
```

### Hooks Section

The hooks section allows for pre- and post-processing of inputs and outputs:

```nudgelang
hooks {
  preProcess(input) {
    // Pre-processing logic
  }
  postProcess(output) {
    // Post-processing logic
  }
}
```

## Body Content

The body section contains the main content of the prompt. It can include:

### Text Blocks

```nudgelang
text`This is a text block. It can include ${interpolated} values.`;
```

### Code Blocks

```nudgelang
code(python`
def example():
    return "This is a code block"
`);
```

### Image Blocks

```nudgelang
image("/path/to/image.jpg", "Description of the image");
```

### Annotations

```nudgelang
text`This is @emphasis("emphasized") text.`;
```

## Advanced Techniques

NudgeLang supports various advanced prompting techniques:

### Chain of Thought

```nudgelang
technique {
  chainOfThought {
    step("Step 1") {
      text`First, we need to...`;
    }
    step("Step 2") {
      text`Next, we should...`;
    }
  }
}
```

### Few-Shot Learning

```nudgelang
technique {
  fewShot {
    example {
      input: text`What is 2 + 2?`;
      output: text`4`;
    }
    example {
      input: text`What is 3 * 3?`;
      output: text`9`;
    }
  }
}
```

### Zero-Shot

```nudgelang
technique {
  zeroShot {
    instruction: "Solve the following problem step by step.";
  }
}
```

(Continue with other techniques: Self-Consistency, Tree of Thoughts, Active Prompting, ReWOO, ReAct, Reflection, Expert Prompting, APE, Auto-CoT, and ART)

## Expressions and Control Flow

NudgeLang supports basic expressions and control flow structures:

### Conditional Statements

```nudgelang
if (condition) {
  text`This will be included if the condition is true.`;
} else {
  text`This will be included if the condition is false.`;
}
```

### Loops

```nudgelang
for (item of items) {
  text`Current item: ${item}`;
}
```

## Importing and Reusing Prompts

You can import and reuse prompts:

```nudgelang
import { MathSolver } from "math_prompts.nudge";

prompt ComplexProblemSolver {
  // ...
  body {
    use MathSolver with {
      problem: ${params.mathProblem}
    };
  }
}
```

This guide covers the basic features of NudgeLang. For more detailed information on specific features or techniques, please refer to the API documentation or the examples in the repository.