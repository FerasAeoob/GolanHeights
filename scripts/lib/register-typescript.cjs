/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

const REGISTERED = Symbol.for("golanwiki.register-typescript");

function loadCompilerOptions(projectRoot) {
  const configPath = path.join(projectRoot, "tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);

  if (configFile.error) {
    throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, "\n"));
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    projectRoot,
  );

  return parsedConfig.options;
}

function createTranspileOptions(projectRoot) {
  const compilerOptions = loadCompilerOptions(projectRoot);

  return {
    ...compilerOptions,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.Node10,
    jsx: ts.JsxEmit.ReactJSX,
    noEmit: false,
    sourceMap: false,
    inlineSourceMap: true,
    inlineSources: true,
  };
}

function registerTypeScript(options = {}) {
  if (globalThis[REGISTERED]) {
    return globalThis[REGISTERED];
  }

  const projectRoot =
    options.projectRoot || path.resolve(__dirname, "..", "..");
  const transpileOptions = createTranspileOptions(projectRoot);

  const originalResolveFilename = Module._resolveFilename;

  Module._resolveFilename = function resolveFilename(request, parent, isMain, resolveOptions) {
    if (typeof request === "string" && request.startsWith("@/")) {
      const relativePath = request.slice(2);
      request = path.join(projectRoot, relativePath);
    }

    return originalResolveFilename.call(this, request, parent, isMain, resolveOptions);
  };

  const compileTypeScript = (module, filename) => {
    const source = fs.readFileSync(filename, "utf8");
    const { outputText, diagnostics } = ts.transpileModule(source, {
      compilerOptions: transpileOptions,
      fileName: filename,
      reportDiagnostics: true,
    });

    if (diagnostics?.length) {
      const message = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCurrentDirectory: () => projectRoot,
        getCanonicalFileName: (fileName) => fileName,
        getNewLine: () => "\n",
      });

      if (message.trim()) {
        throw new Error(message);
      }
    }

    module._compile(outputText, filename);
  };

  require.extensions[".ts"] = compileTypeScript;
  require.extensions[".tsx"] = compileTypeScript;

  const registration = { projectRoot };
  globalThis[REGISTERED] = registration;
  return registration;
}

module.exports = registerTypeScript;
module.exports.registerTypeScript = registerTypeScript;

registerTypeScript();
