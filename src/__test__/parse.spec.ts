import { Digraph } from 'ts-graphviz';
import { parse } from '../parse';

describe('parse function', () => {
  test('simple digraph', () => {
    const G = parse('digraph {}');
    expect(G).toBeInstanceOf(Digraph);
    expect(G.strict).toStrictEqual(false);
  });
});
