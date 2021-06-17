import { ICluster, Digraph, Graph, RootCluster, Subgraph, Node, Edge } from 'ts-graphviz';
import { AST } from './ast';

function applyStatements(cluster: ICluster, statements: AST.ClusterStatement[]): void {
  for (const stmt of statements) {
    switch (stmt.type) {
      case AST.Types.Subgraph:
        const subgraph = stmt.id ? cluster.subgraph(stmt.id.value) : cluster.subgraph();
        applyStatements(subgraph, stmt.body);
        break;
      case AST.Types.Attribute:
        cluster.set(stmt.key.value, stmt.value.value);
        break;
      case AST.Types.Node:
        cluster.node(
          stmt.id.value,
          stmt.body.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
        );
        break;
      case AST.Types.Edge:
        cluster.edge(
          stmt.targets.map((t) => ({ id: t.id.value, port: t.port?.value, compass: t.commpass?.value })),
          stmt.body.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
        );
        break;
      case AST.Types.Attributes:
        const attrs: { [key: string]: string } = stmt.body
          .filter<AST.Attribute>((v): v is AST.Attribute => v.type === AST.Types.Attribute)
          .reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {});
        switch (stmt.kind) {
          case AST.Attributes.Kind.Edge:
            cluster.edge(attrs);
            break;
          case AST.Attributes.Kind.Node:
            cluster.node(attrs);
            break;
          case AST.Attributes.Kind.Graph:
            cluster.graph(attrs);
            break;
        }
        break;
    }
  }
}

export function convert(ast: AST.Dot): RootCluster;
export function convert(ast: AST.Graph): RootCluster;
export function convert(ast: AST.Subgraph): Subgraph;
export function convert(ast: AST.Node): Node;
export function convert(ast: AST.Edge): Edge;
export function convert(
  ast: AST.Dot | AST.Graph | AST.Subgraph | AST.Node | AST.Edge,
): RootCluster | Subgraph | Node | Edge;
export function convert(
  ast: AST.Dot | AST.Graph | AST.Subgraph | AST.Node | AST.Edge,
): RootCluster | Subgraph | Node | Edge {
  switch (ast.type) {
    case AST.Types.Graph:
      const Root = ast.directed ? Digraph : Graph;
      const root = new Root(ast.id, ast.strict);
      applyStatements(root, ast.body);
      return root;
    case AST.Types.Subgraph:
      const subgraph = new Subgraph(ast.id?.value);
      applyStatements(subgraph, ast.body);
      return subgraph;
    case AST.Types.Edge:
      const edge = new Edge(
        ast.targets.map((t) => ({ id: t.id.value, port: t.port?.value, compass: t.commpass?.value })),
        ast.body.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
      );
      return edge;
    case AST.Types.Node:
      const node = new Node(
        ast.id.value,
        ast.body.reduce((prev, curr) => ({ ...prev, [curr.key.value]: curr.value.value }), {}),
      );
      return node;
    case AST.Types.Dot:
      const graph = ast.body.find((n): n is AST.Graph => n.type === AST.Types.Graph);
      if (graph) {
        return convert(graph);
      }
    default:
      throw Error();
  }
}
