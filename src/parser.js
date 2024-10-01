// parser.js
const ohm = require('ohm-js');
const fs = require('fs');
const path = require('path');

class NudgeLangParser {
  constructor() {
    const grammarContent = fs.readFileSync(path.join(__dirname, 'nudgelang.ohm'), 'utf-8');
    this.grammar = ohm.grammar(grammarContent);
    this.semantics = this.grammar.createSemantics();
    this.defineSemantics();
  }

  defineSemantics() {
    this.semantics.addOperation('toAST', {
      Program(prompts) {
        return {
          type: 'Program',
          prompts: prompts.toAST(),
        };
      },
      Prompt(_prompt, name, _open, sections, _close) {
        return {
          type: 'Prompt',
          name: name.sourceString,
          sections: sections.toAST(),
        };
      },
      Section(section) {
        return section.toAST();
      },
      MetaSection(_meta, _open, fields, _close) {
        return {
          type: 'MetaSection',
          fields: fields.toAST(),
        };
      },
      MetaField(name, _colon, value, _semicolon) {
        return {
          type: 'MetaField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      ContextSection(_context, _open, fields, _close) {
        return {
          type: 'ContextSection',
          fields: fields.toAST(),
        };
      },
      ContextField(name, _colon, value, _semicolon) {
        return {
          type: 'ContextField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      ParamsSection(_params, _open, declarations, _close) {
        return {
          type: 'ParamsSection',
          params: declarations.toAST(),
        };
      },
      ParamDeclaration(name, _colon, paramType, _eq, defaultValue, _semicolon) {
        return {
          type: 'ParamDeclaration',
          name: name.sourceString,
          paramType: paramType.toAST(),
          defaultValue: defaultValue.children.length > 0 ? defaultValue.toAST() : null,
        };
      },
      Type(baseType, arrayModifier, optionalModifier) {
        let type = baseType.sourceString;
        if (arrayModifier.children.length > 0) {
          type += '[]';
        }
        if (optionalModifier.children.length > 0) {
          type += '?';
        }
        return type;
      },
      BodySection(_body, _open, content, _close) {
        return {
          type: 'BodySection',
          content: content.toAST(),
        };
      },
      BodyContent(content) {
        return content.toAST();
      },
      TextBlock(_text, content, _semicolon) {
        return {
          type: 'TextBlock',
          content: content.toAST().filter(item => item !== ''),
        };
      },
      BacktickString(_open, elements, _close) {
        return elements.toAST().reduce((acc, curr) => {
          if (typeof curr === 'string' && typeof acc[acc.length - 1] === 'string') {
            acc[acc.length - 1] += curr;
          } else {
            acc.push(curr);
          }
          return acc;
        }, []);
      },
      BacktickElement_interpolation(interp) {
        return interp.toAST();
      },
      BacktickElement_text(content) {
        return content.sourceString;
      },
      InterpolationContent(_open, expr, _close) {
        return {
          type: 'Interpolation',
          expression: expr.toAST(),
        };
      },
      CodeBlock(_code, _openParen, language, content, _closeParen, _semicolon) {
        return {
          type: 'CodeBlock',
          language: language.sourceString,
          content: content.toAST(),
        };
      },
      ImageBlock(_image, _openParen, src, _comma, alt, _closeParen, _semicolon) {
        return {
          type: 'ImageBlock',
          src: src.toAST(),
          alt: alt.toAST(),
        };
      },
      ControlStructure(structure) {
        return structure.toAST();
      },
      IfStatement(_if, _openParen, condition, _closeParen, thenBlock, elseClause) {
        return {
          type: 'IfStatement',
          condition: condition.toAST(),
          thenBlock: thenBlock.toAST(),
          elseBlock: elseClause.children.length > 0 ? elseClause.toAST()[0] : null,
        };
      },
      ElseClause(_else, block) {
        return block.toAST();
      },
      ForLoop(_for, _openParen, variable, _of, iterable, _closeParen, block) {
        return {
          type: 'ForLoop',
          variable: variable.sourceString,
          iterable: iterable.toAST(),
          block: block.toAST(),
        };
      },
      Block(_open, content, _close) {
        return content.toAST();
      },
      UseStatement(_use, promptName, withClause, _semicolon) {
        return {
          type: 'UseStatement',
          promptName: promptName.sourceString,
          params: withClause.children.length > 0 ? withClause.toAST()[0] : [],
        };
      },
      WithClause(_with, _open, assignments, _close) {
        return assignments.toAST();
      },
      ParamAssignment(name, _colon, value, _comma) {
        return {
          type: 'ParamAssignment',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      ExpressionStatement(expr, _semicolon) {
        return {
          type: 'ExpressionStatement',
          expression: expr.toAST(),
        };
      },
      ConstraintsSection(_constraints, _open, fields, _close) {
        return {
          type: 'ConstraintsSection',
          constraints: fields.toAST(),
        };
      },
      ConstraintField(name, _colon, value, _semicolon) {
        return {
          type: 'ConstraintField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      OutputSection(_output, _open, fields, _close) {
        return {
          type: 'OutputSection',
          fields: fields.toAST(),
        };
      },
      OutputField(name, _colon, value, _semicolon) {
        return {
          type: 'OutputField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      HooksSection(_hooks, _open, definitions, _close) {
        return {
          type: 'HooksSection',
          hooks: definitions.toAST(),
        };
      },
      HookDefinition(name, _open, param, _close, _openBrace, statements, _closeBrace) {
        return {
          type: 'HookDefinition',
          name: name.sourceString,
          param: param.sourceString,
          body: statements.toAST(),
        };
      },
      Statement(stmt) {
        return stmt.toAST();
      },
      ReturnStatement(_return, expr, _semi) {
        return {
          type: 'ReturnStatement',
          argument: expr.toAST(),
        };
      },
      AssignmentStatement(left, _eq, right, _semi) {
        return {
          type: 'AssignmentStatement',
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      TechniqueSection(_technique, _open, definitions, _close) {
        return {
          type: 'TechniqueSection',
          techniques: definitions.toAST(),
        };
      },
      TechniqueDefinition(technique) {
        return technique.toAST();
      },
      ChainOfThought(_cot, _open, steps, _close) {
        return {
          type: 'ChainOfThought',
          steps: steps.toAST(),
        };
      },
      ChainOfThoughtStep(_step, _openParen, name, _closeParen, block) {
        return {
          type: 'ChainOfThoughtStep',
          name: name.toAST().value, // Extract the string value
          block: block.toAST(),
        };
      },
      FewShot(_fewShot, _open, examples, _close) {
        return {
          type: 'FewShot',
          examples: examples.toAST(),
        };
      },
      FewShotExample(_example, _open, _input, _colon1, input, _output, _colon2, output, _close) {
        return {
          type: 'FewShotExample',
          input: input.toAST(),
          output: output.toAST(),
        };
      },
      ZeroShot(_zeroShot, _open, fields, _close) {
        return {
          type: 'ZeroShot',
          fields: fields.toAST(),
        };
      },
      SelfConsistency(_selfConsistency, _open, fields, _close) {
        return {
          type: 'SelfConsistency',
          fields: fields.toAST(),
        };
      },
      TreeOfThoughts(_tot, _open, fields, _close) {
        return {
          type: 'TreeOfThoughts',
          fields: fields.toAST(),
        };
      },
      ActivePrompting(_activePrompting, _open, fields, _close) {
        return {
          type: 'ActivePrompting',
          fields: fields.toAST(),
        };
      },
      ReWOO(_rewoo, _open, components, _close) {
        return {
          type: 'ReWOO',
          components: components.toAST(),
        };
      },
      ReWOOComponent(name, block) {
        return {
          type: 'ReWOOComponent',
          name: name.sourceString,
          block: block.toAST(),
        };
      },
      ReAct(_react, _open, components, _close) {
        return {
          type: 'ReAct',
          components: components.toAST(),
        };
      },
      ReActComponent(name, block) {
        return {
          type: 'ReActComponent',
          name: name.sourceString,
          block: block.toAST(),
        };
      },
      Reflection(_reflection, _open, fields, _close) {
        return {
          type: 'Reflection',
          fields: fields.toAST(),
        };
      },
      ExpertPrompting(_expertPrompting, _open, fields, _close) {
        return {
          type: 'ExpertPrompting',
          fields: fields.toAST(),
        };
      },
      APE(_ape, _open, fields, _close) {
        return {
          type: 'APE',
          fields: fields.toAST(),
        };
      },
      AutoCoT(_autoCot, _open, fields, _close) {
        return {
          type: 'AutoCoT',
          fields: fields.toAST(),
        };
      },
      ART(_art, _open, fields, _close) {
        return {
          type: 'ART',
          fields: fields.toAST(),
        };
      },
      TechniqueField(name, _colon, value, _semicolon) {
        return {
          type: 'TechniqueField',
          name: name.sourceString,
          value: value.toAST(),
        };
      },
      Expression(expr) {
        return expr.toAST();
      },
      LogicalExpression_binary(left, op, right) {
        return {
          type: 'LogicalExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      ComparisonExpression_binary(left, op, right) {
        return {
          type: 'BinaryExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      AdditiveExpression_binary(left, op, right) {
        return {
          type: 'BinaryExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      MultiplicativeExpression_binary(left, op, right) {
        return {
          type: 'BinaryExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      UnaryExpression_prefix(op, expr) {
        return {
          type: 'UnaryExpression',
          operator: op.sourceString,
          argument: expr.toAST(),
        };
      },
      MemberExpression_dot(object, _dot, property) {
        return {
          type: 'MemberExpression',
          object: object.toAST(),
          property: property.sourceString,
          computed: false,
        };
      },
      MemberExpression_bracket(object, _open, property, _close) {
        return {
          type: 'MemberExpression',
          object: object.toAST(),
          property: property.toAST(),
          computed: true,
        };
      },
      MemberExpression_call(callee, args) {
        return {
          type: 'CallExpression',
          callee: callee.toAST(),
          arguments: args.toAST(),
        };
      },
      Arguments(_open, args, _close) {
        return args.asIteration().toAST();
      },
      PrimaryExpression_paren(_open, expr, _close) {
        return expr.toAST();
      },
      ObjectLiteral(_open, properties, _close) {
        return {
          type: 'ObjectLiteral',
          properties: properties.asIteration().toAST(),
        };
      },
      PropertyAssignment(key, _colon, value) {
        return {
          type: 'PropertyAssignment',
          key: key.sourceString,
          value: value.toAST(),
        };
      },
      ArrayLiteral(_open, elements, _close) {
        return {
          type: 'ArrayLiteral',
          elements: elements.asIteration().toAST(),
        };
      },
      identifier(_first, _rest) {
        return {
          type: 'Identifier',
          name: this.sourceString,
        };
      },
      number(_whole, _dot, _fraction) {
        return {
          type: 'NumberLiteral',
          value: parseFloat(this.sourceString),
        };
      },
      string(_open, chars, _close) {
        return {
          type: 'StringLiteral',
          value: chars.sourceString,
        };
      },
      trueLiteral(_) {
        return {
          type: 'BooleanLiteral',
          value: true,
        };
      },
      falseLiteral(_) {
        return {
          type: 'BooleanLiteral',
          value: false,
        };
      },
      nullLiteral(_) {
        return {
          type: 'NullLiteral',
          value: null,
        };
      },
      _iter(...children) {
        return children.map(c => c.toAST());
      },
      _terminal() {
        return this.sourceString;
      },
    });
  }

  parse(code) {
    const matchResult = this.grammar.match(code);
    if (matchResult.succeeded()) {
      try {
        return this.semantics(matchResult).toAST();
      } catch (error) {
        console.error('Error during AST generation:', error);
        throw new Error('AST generation failed: ' + error.message);
      }
    } else {
      const expected = matchResult.getExpectedText();
      const position = matchResult.getRightmostFailurePosition();
      const lines = code.split('\n');
      let lineNumber = 1;
      let column = position;
      for (const line of lines) {
        if (column - line.length - 1 < 0) break;
        column -= line.length + 1;
        lineNumber++;
      }
      throw new Error(`Parsing failed at line ${lineNumber}, column ${column + 1}. Expected: ${expected}`);
    }
  }
}

module.exports = NudgeLangParser;