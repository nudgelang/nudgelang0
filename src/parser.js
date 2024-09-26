// parser.js
const ohm = require('ohm-js');
const fs = require('fs');
const path = require('path');

class NudgeLangParser {
  constructor() {
    const grammarFile = path.join(__dirname, 'nudgelang.ohm');
    const grammarContent = fs.readFileSync(grammarFile, 'utf-8');
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
      ParamDeclaration(name, _colon, paramType, _equals, defaultValue, _semicolon) {
        return {
          type: 'ParamDeclaration',
          name: name.sourceString,
          paramType: paramType.toAST(),
          defaultValue: defaultValue.toAST()[0] || null,
        };
      },
      Type(type) {
        return type.sourceString;
      },
      ArrayType(baseType, _brackets) {
        return `${baseType.toAST()}[]`;
      },
      OptionalType(baseType, _question) {
        return `${baseType.toAST()}?`;
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
          content: content.toAST(),
        };
      },
      BacktickString(_open, content, _close) {
        return content.toAST();
      },
      BacktickContent(_content) {
        return this.sourceString;
      },
      Interpolation(_open, expr, _close) {
        return {
          type: 'Interpolation',
          expression: expr.toAST(),
        };
      },
      CodeBlock(_code, _open, language, content, _close, _semicolon) {
        return {
          type: 'CodeBlock',
          language: language.sourceString,
          content: content.toAST(),
        };
      },
      ImageBlock(_image, _open, src, _comma, alt, _close, _semicolon) {
        return {
          type: 'ImageBlock',
          src: src.toAST(),
          alt: alt.toAST(),
        };
      },
      ControlStructure(structure) {
        return structure.toAST();
      },
      IfStatement(_if, _open, condition, _close, thenBlock, _else, elseBlock) {
        return {
          type: 'IfStatement',
          condition: condition.toAST(),
          thenBlock: thenBlock.toAST(),
          elseBlock: elseBlock.toAST()[0] || null,
        };
      },
      ForLoop(_for, _open, variable, _of, iterable, _close, block) {
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
      UseStatement(_use, promptName, _with, _open, params, _close, _semicolon) {
        return {
          type: 'UseStatement',
          promptName: promptName.sourceString,
          params: params.toAST(),
        };
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
      HookDefinition(name, _open, param, _close, block) {
        return {
          type: 'HookDefinition',
          name: name.sourceString,
          param: param.sourceString,
          block: block.toAST(),
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
      ChainOfThoughtStep(_step, _open, name, _close, block) {
        return {
          type: 'ChainOfThoughtStep',
          name: name.toAST(),
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
      ReWOOComponent(name, _open, content, _close) {
        return {
          type: 'ReWOOComponent',
          name: name.sourceString,
          content: content.toAST(),
        };
      },
      ReAct(_react, _open, components, _close) {
        return {
          type: 'ReAct',
          components: components.toAST(),
        };
      },
      ReActComponent(name, _open, content, _close) {
        return {
          type: 'ReActComponent',
          name: name.sourceString,
          content: content.toAST(),
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
      BinaryExpression_binary(left, op, right) {
        return {
          type: 'BinaryExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      BinaryExpression_comparison(expr) {
        return expr.toAST();
      },
      ComparisonExpression(left, op, right) {
        return {
          type: 'ComparisonExpression',
          operator: op.sourceString,
          left: left.toAST(),
          right: right.toAST(),
        };
      },
      UnaryExpression(op, expr) {
        return {
          type: 'UnaryExpression',
          operator: op.sourceString,
          expression: expr.toAST(),
        };
      },
      CallExpression(callee, _open, args, _close) {
        return {
          type: 'CallExpression',
          callee: callee.toAST(),
          arguments: args.asIteration().toAST(),
        };
      },
      MemberExpression(object, _dots, properties) {
        return {
          type: 'MemberExpression',
          object: object.toAST(),
          properties: properties.asIteration().sourceString,
        };
      },
      PrimaryExpression(expr) {
        return expr.toAST();
      },
      ParenExpression(_open, expr, _close) {
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
          key: key.toAST(),
          value: value.toAST(),
        };
      },
      ArrayLiteral(_open, elements, _close) {
        return {
          type: 'ArrayLiteral',
          elements: elements.asIteration().toAST(),
        };
      },
      Literal(value) {
        const sourceString = this.sourceString;
        if (sourceString === 'true' || sourceString === 'false') {
          return {
            type: 'BooleanLiteral',
            value: sourceString === 'true',
          };
        } else if (sourceString === 'null') {
          return {
            type: 'NullLiteral',
            value: null,
          };
        } else {
          return value.toAST();
        }
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
      string(_open, _content, _close) {
        return {
          type: 'StringLiteral',
          value: this.sourceString.slice(1, -1), // Remove quotes
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
      return this.semantics(matchResult).toAST();
    } else {
      throw new Error('Parsing failed: ' + matchResult.message);
    }
  }
}

module.exports = NudgeLangParser;