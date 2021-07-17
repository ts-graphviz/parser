/* eslint-disable jest/valid-title */
import fs from 'fs';
import path from 'path';
import glob from 'glob';

import { AST, SyntaxError } from '../src';

const files = glob.sync(`${__dirname}/e2e/*`).sort();

for (const file of files) {
  const title = path.basename(file);
  const dot = fs.readFileSync(file, 'utf-8').toString();

  test(title, () => {
    try {
      expect(AST.parse(dot)).toMatchSnapshot();
    } catch (e) {
      if (e instanceof SyntaxError) {
        console.log(e.location);
      }
      throw e;
    }
  });
}
