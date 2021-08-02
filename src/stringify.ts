import { AST } from './ast';

export interface StringifyOption {
  directed?: boolean;
  indentSize?: number;
}

class Compiler {
  private directed: boolean;
  private indentSize: number;
  constructor({ directed = true, indentSize = 2 }: StringifyOption = {}) {
    this.directed = directed;
    this.indentSize = indentSize;
  }

  private indent(line: string): string {
    return ' '.repeat(this.indentSize) + line;
  }
  private pad(pad: string): (l: string) => string {
    return (l: string) => pad + l;
  }
  public stringify(ast: AST.ASTNode): string {
    switch (ast.type) {
      case AST.Types.Attribute:
        return `${this.stringify(ast.key)} = ${this.stringify(ast.value)};`;
      case AST.Types.Attributes:
        return `${ast.kind} [\n${ast.body.map(this.stringify.bind(this)).map(this.indent).join('\n')}\n]`;
      case AST.Types.Comment:
        switch (ast.kind) {
          case AST.Comment.Kind.Block:
            return '/**\n' + ast.value.split('\n').map(this.pad(' * ')).join('\n') + '\n */';
          case AST.Comment.Kind.Slash:
            return ast.value.split('\n').map(this.pad('// ')).join('\n');
          case AST.Comment.Kind.Macro:
            return ast.value.split('\n').map(this.pad('# ')).join('\n');
        }
      case AST.Types.Dot:
        return ast.body.map(this.stringify.bind(this)).join('\n');
      case AST.Types.Edge:
        return `${ast.targets.map(this.stringify.bind(this)).join(this.directed ? ' -> ' : ' -- ')} [\n${ast.body
          .map(this.stringify.bind(this))
          .map(this.indent)
          .join('\n')}\n];`;
      case AST.Types.Node:
        return `${this.stringify(ast.id)} [\n${ast.body
          .map(this.stringify.bind(this))
          .map(this.indent)
          .join('\n')}\n];`;
      case AST.Types.NodeRef:
        return [this.stringify(ast.id), ast.port ? this.stringify(ast.port) : null, ast.compass ? ast.compass : null]
          .filter((v) => v !== null)
          .join(':');
      case AST.Types.NodeRefGroup:
        return `{${ast.body.map(this.stringify).join(' ')}}`;
      case AST.Types.Graph:
        this.directed = ast.directed;
        return [
          ast.strict ? 'strict' : null,
          ast.directed ? 'digraph' : 'graph',
          ast.id ? this.stringify(ast.id) : null,
          `{\n${ast.body.map(this.stringify).map(this.indent).join('\n')}\n}`,
        ]
          .filter((v) => v !== null)
          .join(' ');
      case AST.Types.Subgraph:
        return [
          'subgraph',
          ast.id ? this.stringify(ast.id) : null,
          `{\n${ast.body.map(this.stringify).map(this.indent).join('\n')}\n}`,
        ]
          .filter((v) => v !== null)
          .join(' ');
      case AST.Types.Literal:
        switch (ast.quoted) {
          case true:
            return `"${ast.value}"`;
          case false:
            return ast.value;
          case 'html':
            return `<${ast.value}>`;
        }
    }
  }
}

export function stringify(ast: AST.ASTNode, options?: StringifyOption): string {
  return new Compiler(options).stringify(ast);
}
