import { ICluster, Digraph, Graph, RootCluster } from 'ts-graphviz';
import { AST } from './ast';

function applyStatements(cluster: ICluster, statements: AST.ClusterStatement[]): void {
  for (const stmt of statements) {
    switch (stmt.type) {
      case AST.Types.Subgraph:
        const subgraph = stmt.id ? cluster.subgraph(stmt.id) : cluster.subgraph();
        applyStatements(subgraph, stmt.body);
        break;
      case AST.Types.Attribute:
        cluster.set(stmt.key, stmt.value);
        break;
      case AST.Types.Node:
        cluster.node(
          stmt.id,
          stmt.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
        );
        break;
      case AST.Types.Edge:
        cluster.edge(
          stmt.targets.map((t) => ({ id: t.id, port: t.port, compass: t.commpass })),
          stmt.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {}),
        );
        break;
      case AST.Types.Attributes:
        const attrs = stmt.attributes.reduce((prev, curr) => ({ ...prev, [curr.key]: curr.value }), {});
        switch (stmt.target) {
          case AST.Attributes.Target.Edge:
            cluster.edge(attrs);
            break;
          case AST.Attributes.Target.Node:
            cluster.node(attrs);
            break;
          case AST.Attributes.Target.Graph:
            cluster.graph(attrs);
            break;
        }
        break;
    }
  }
}

export function convert(root: AST.Graph): RootCluster {
  const Root = root.directed ? Digraph : Graph;
  const g = new Root(root.id, root.strict);
  applyStatements(g, root.body);
  return g;
}
