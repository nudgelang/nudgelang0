// parser.js
const { createToken, Lexer, CstParser } = require("chevrotain");

// Define tokens
const Prompt = createToken({ name: "Prompt", pattern: /prompt/ });
const Meta = createToken({ name: "Meta", pattern: /meta/ });
const Params = createToken({ name: "Params", pattern: /params/ });
const Body = createToken({ name: "Body", pattern: /body/ });
const Technique = createToken({ name: "Technique", pattern: /technique/ });
const Constraints = createToken({ name: "Constraints", pattern: /constraints/ });
const Output = createToken({ name: "Output", pattern: /output/ });
const Hooks = createToken({ name: "Hooks", pattern: /hooks/ });
const Identifier = createToken({ name: "Identifier", pattern: /[a-zA-Z]\w*/ });
const LCurly = createToken({ name: "LCurly", pattern: /{/ });
const RCurly = createToken({ name: "RCurly", pattern: /}/ });
const Colon = createToken({ name: "Colon", pattern: /:/ });
const Semicolon = createToken({ name: "Semicolon", pattern: /;/ });
const Text = createToken({ name: "Text", pattern: /text/ });
const BacktickString = createToken({ name: "BacktickString", pattern: /`[^`]*`/ });
const StringLiteral = createToken({ name: "StringLiteral", pattern: /"(?:[^"\\]|\\.)*"/ });
const NumberLiteral = createToken({ name: "NumberLiteral", pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/ });
const BooleanLiteral = createToken({ name: "BooleanLiteral", pattern: /true|false/ });
const WhiteSpace = createToken({
    name: "WhiteSpace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
});

// Add these to your token definitions
const Equals = createToken({ name: "Equals", pattern: /=/ });

const If = createToken({ name: "If", pattern: /if/ });
const Else = createToken({ name: "Else", pattern: /else/ });
const For = createToken({ name: "For", pattern: /for/ });
const Of = createToken({ name: "Of", pattern: /of/ });
const Step = createToken({ name: "Step", pattern: /step/ });
const LParen = createToken({ name: "LParen", pattern: /\(/ });
const RParen = createToken({ name: "RParen", pattern: /\)/ });
const LBracket = createToken({ name: "LBracket", pattern: /\[/ });
const RBracket = createToken({ name: "RBracket", pattern: /\]/ });
const Comma = createToken({ name: "Comma", pattern: /,/ });
const AnyToken = createToken({ name: "AnyToken", pattern: /[^}]+/ });

const Context = createToken({ name: "Context", pattern: /context/ });

const Arrow = createToken({ name: "Arrow", pattern: /=>/ });
const Return = createToken({ name: "Return", pattern: /return/ });

const allTokens = [
    WhiteSpace,
    // Tokens that don't conflict with Arrow
    Prompt, Meta, Context, Params, Body, Technique, Constraints, Output, Hooks,
    LParen, RParen, LBracket, RBracket, LCurly, RCurly,
    // Put Arrow before Equals and Colon
    Arrow, Equals, Colon,
    // Rest of the tokens
    Text, Identifier, Semicolon, BacktickString,
    StringLiteral, NumberLiteral, BooleanLiteral,
    // AnyToken should be last
    AnyToken
];

const NudgeLexer = new Lexer(allTokens);

class NudgeParser extends CstParser {
    constructor() {
        super(allTokens);

        const $ = this;

        $.RULE("program", () => {
            $.MANY(() => {
                $.SUBRULE($.prompt);
            });
        });

        $.RULE("prompt", () => {
            $.CONSUME(Prompt);
            $.CONSUME(Identifier);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.section);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("section", () => {
            $.OR([
                { ALT: () => $.SUBRULE($.metaSection) },
                { ALT: () => $.SUBRULE($.contextSection) },
                { ALT: () => $.SUBRULE($.paramsSection) },
                { ALT: () => $.SUBRULE($.bodySection) },
                { ALT: () => $.SUBRULE($.constraintsSection) },
                { ALT: () => $.SUBRULE($.outputSection) },
                { ALT: () => $.SUBRULE($.hooksSection) },
                { ALT: () => $.SUBRULE($.techniqueSection) }
            ]);
        });

        $.RULE("metaSection", () => {
            $.CONSUME(Meta);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.field);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("contextSection", () => {
            $.CONSUME(Context);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.field);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("paramsSection", () => {
            $.CONSUME(Params);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.field);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("bodySection", () => {
            $.CONSUME(Body);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.OR([
                    { ALT: () => $.SUBRULE($.textBlock) },
                    { ALT: () => $.SUBRULE($.ifStatement) },
                    { ALT: () => $.SUBRULE($.forLoop) }
                ]);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("techniqueSection", () => {
            $.CONSUME(Technique);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.techniqueDef);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("constraintsSection", () => {
            $.CONSUME(Constraints);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.field);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("outputSection", () => {
            $.CONSUME(Output);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.field);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("hooksSection", () => {
            $.CONSUME(Hooks);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.hookDef);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("field", () => {
            $.CONSUME(Identifier);
            $.CONSUME(Colon);
            $.SUBRULE($.value);
            $.OPTION(() => {
                $.CONSUME(Semicolon);
            });
        });

        $.RULE("value", () => {
            $.OR([
                { ALT: () => $.CONSUME(StringLiteral) },
                { ALT: () => $.CONSUME(NumberLiteral) },
                { ALT: () => $.CONSUME(BooleanLiteral) },
                { ALT: () => $.SUBRULE($.textBlock) },
                { ALT: () => $.CONSUME(Identifier) },
                { ALT: () => $.SUBRULE($.objectLiteral) },
                { ALT: () => $.SUBRULE($.arrayLiteral) }
            ]);
        });

        $.RULE("textBlock", () => {
            $.CONSUME(Text);
            $.CONSUME(BacktickString);
        });

        $.RULE("objectLiteral", () => {
            $.CONSUME(LCurly);
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => {
                    $.CONSUME(Identifier);
                    $.CONSUME(Colon);
                    $.SUBRULE($.value);
                }
            });
            $.CONSUME(RCurly);
        });

        $.RULE("arrayLiteral", () => {
            $.CONSUME(LBracket);
            $.MANY_SEP({
                SEP: Comma,
                DEF: () => {
                    $.SUBRULE($.value);
                }
            });
            $.CONSUME(RBracket);
        });

        $.RULE("ifStatement", () => {
            $.CONSUME(If);
            $.CONSUME(LParen);
            $.SUBRULE($.expression);
            $.CONSUME(RParen);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.textBlock);
            });
            $.CONSUME(RCurly);
            $.OPTION(() => {
                $.CONSUME(Else);
                $.CONSUME2(LCurly);
                $.MANY2(() => {
                    $.SUBRULE2($.textBlock);
                });
                $.CONSUME2(RCurly);
            });
        });

        $.RULE("forLoop", () => {
            $.CONSUME(For);
            $.CONSUME(LParen);
            $.CONSUME(Identifier);
            $.CONSUME(Of);
            $.SUBRULE($.expression);
            $.CONSUME(RParen);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.textBlock);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("expression", () => {
            // Implement expression parsing (this is a simplified version)
            $.OR([
                { ALT: () => $.CONSUME(Identifier) },
                { ALT: () => $.CONSUME(StringLiteral) },
                { ALT: () => $.CONSUME(NumberLiteral) },
                { ALT: () => $.CONSUME(BooleanLiteral) }
            ]);
        });

        $.RULE("techniqueDef", () => {
            $.CONSUME(Technique);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.OR([
                    { ALT: () => $.SUBRULE($.field) },
                    { ALT: () => $.SUBRULE($.techniqueDef) },
                    { ALT: () => $.SUBRULE($.stepDef) }
                ]);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("stepDef", () => {
            $.CONSUME(Step);
            $.CONSUME(LParen);
            $.CONSUME(StringLiteral);
            $.CONSUME(RParen);
            $.CONSUME(LCurly);
            $.MANY(() => {
                $.SUBRULE($.textBlock);
            });
            $.CONSUME(RCurly);
        });

        $.RULE("hookDef", () => {
            $.CONSUME(Identifier);
            $.CONSUME(Colon);
            $.OR([
                {
                    ALT: () => {
                        $.CONSUME(LParen);
                        $.MANY_SEP({
                            SEP: Comma,
                            DEF: () => $.CONSUME2(Identifier)
                        });
                        $.CONSUME(RParen);
                        $.CONSUME(Arrow);
                        $.CONSUME(LCurly);
                        $.MANY(() => $.SUBRULE($.statement));
                        $.CONSUME(RCurly);
                    }
                },
                { ALT: () => $.SUBRULE($.value) }
            ]);
        });

        $.RULE("statement", () => {
            $.OR([
                { ALT: () => $.SUBRULE($.expression) },
                { ALT: () => $.SUBRULE($.ifStatement) },
                { ALT: () => $.SUBRULE($.forLoop) },
                { ALT: () => $.SUBRULE($.returnStatement) }
            ]);
            $.OPTION(() => $.CONSUME(Semicolon));
        });

        $.RULE("returnStatement", () => {
            $.CONSUME(Return);
            $.SUBRULE($.expression);
        });

        this.performSelfAnalysis();
    }
}

const parser = new NudgeParser();

class NudgeLangParser {
    parse(inputText) {
        const lexingResult = NudgeLexer.tokenize(inputText);
        parser.input = lexingResult.tokens;
        const cst = parser.program();

        if (parser.errors.length > 0) {
            throw new Error("Parsing errors detected: " + parser.errors.map(err => err.message).join(", "));
        }

        // Convert CST to AST (you'll need to implement this conversion)
        return this.cstToAst(cst);
    }

    cstToAst(cst) {
        if (!cst.children.program || !cst.children.program[0] || !cst.children.program[0].children.prompt) {
            return { type: 'Program', prompts: [] };
        }

        const prompts = cst.children.program[0].children.prompt.map(promptCst => {
            const name = promptCst.children.Identifier[0].image;
            const sections = promptCst.children.section.map(sectionCst => {
                const sectionType = Object.keys(sectionCst.children)[0];
                if (sectionType === 'bodySection') {
                    const content = sectionCst.children.bodySection[0].children.textBlock.map(textBlockCst => {
                        return {
                            type: 'TextBlock',
                            content: textBlockCst.children.BacktickString[0].image,
                        };
                    });
                    return {
                        type: 'BodySection',
                        content,
                    };
                }
                // Handle other section types similarly
                return {
                    type: sectionType,
                    // Add more properties based on the section type
                };
            });
            return {
                type: 'Prompt',
                name,
                sections,
            };
        });

        return {
            type: 'Program',
            prompts,
        };
    }
}

module.exports = NudgeLangParser;
