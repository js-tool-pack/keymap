import * as Fs from 'fs';
import { Config, RepoType } from './init-pkg';
import { execa } from 'execa';
import { createSrcAndTests, rootDir, useFile } from './utils';
import { toCamel } from '@mxssfd/core';

const paths = {
  typedoc: rootDir('typedoc.json'),
  tsconfig: rootDir('tsconfig.json'),
  pnpmWorkspace: rootDir('pnpm-workspace.yaml'),
  pkgs: rootDir('packages'),
  src: rootDir('src'),
};
const mono = {
  createPnpmWorkspace() {
    const PnpmWorkspaceContent = `
packages:
  # all packages in subdirs of packages/ and components/
  - 'packages/**'
  # exclude packages that are inside test directories
  - '!**/tests/**'
  - '!**/test/**'
`.trim();
    Fs.writeFileSync(paths.pnpmWorkspace, PnpmWorkspaceContent);
  },
  updateTsconfig() {
    const [tsconfigContent, setTsconfig] = useFile(paths.tsconfig);
    setTsconfig(
      tsconfigContent
        .replace(
          /("include": \[)/,
          `$1
    "packages/*/src",
    "packages/*/__tests__",`,
        )
        .trim(),
    );
  },
  newPkg() {
    execa('npm', ['run', 'pkg:new'], { stdio: 'inherit' });
  },
  createPkgsDir() {
    Fs.mkdirSync(paths.pkgs);
  },
};
const multi = {
  updatePkg(config: Config) {
    const [pkgJson, updatePkg] = useFile(rootDir('package.json'), true);

    pkgJson['main'] = `dist/${config.name}.cjs.js`;
    pkgJson['module'] = `dist/${config.name}.esm-bundler.js`;
    pkgJson['types'] = `dist/${config.name}.d.ts`;
    pkgJson['exports'] = {
      '.': {
        import: {
          node: `./dist/${config.name}.cjs.js`,
          default: `./dist/${config.name}.esm-bundler.js`,
        },
        require: `./dist/${config.name}.cjs.js`,
      },
    };
    pkgJson['buildOptions'] = {
      name: toCamel(pkgJson['name'], '-', true),
      formats: ['esm-bundler', 'esm-browser', 'cjs', 'global'],
    };
    pkgJson['publishConfig'] = {
      access: 'public',
      registry: 'https://registry.npmjs.org/',
    };
    updatePkg(pkgJson);
  },
  updateApiExtractor() {
    const [apiJson, updateApiJson] = useFile(rootDir('api-extractor.json'), true);

    apiJson['mainEntryPointFilePath'] = './dist/src/index.d.ts';
    apiJson['dtsRollup'] = {
      enabled: true,
      publicTrimmedFilePath: './dist/<unscopedPackageName>.d.ts',
    };
    updateApiJson(apiJson);
  },
};

export async function setRepo(config: Config) {
  const [typedocJson, updateTypedoc] = useFile(paths.typedoc, true);
  typedocJson['navigationLinks'].GitHub = config.git.replace(/\.git$/, '');
  if (config.repoType === RepoType.mono) {
    // 1.??????pnpm-workspace.yaml
    mono.createPnpmWorkspace();

    // 2.??????tsconfig.json
    mono.updateTsconfig();

    // 3.??????packages??????
    mono.createPkgsDir();

    // 4.??????typedoc.json
    typedocJson['entryPointStrategy'] = 'packages';
    updateTypedoc(typedocJson);

    // 5.??????repo
    mono.newPkg();
    return;
  }

  typedocJson['name'] = config.name;
  updateTypedoc(typedocJson);

  // ??????package.json
  multi.updatePkg(config);

  // ??????api-extractor.json
  multi.updateApiExtractor();

  // ??????src???????????????????????????
  createSrcAndTests(rootDir(), config.name);
}
