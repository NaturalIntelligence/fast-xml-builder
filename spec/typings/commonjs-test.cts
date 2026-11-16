import builderModule = require('fast-xml-builder');

const constructors = [builderModule.default, builderModule.Builder, builderModule.XMLBuilder];
for (const Constructor of constructors) {
  const builder: builderModule.XMLBuilder = new Constructor({ ignoreAttributes: false });
  const xml: string = builder.build({ root: { '@_id': 'test' } });
  void xml;
}

// The CommonJS bundle exports an object containing the constructors.
// @ts-expect-error The module object is not a constructor
new builderModule();
// @ts-expect-error XMLBuilder requires new
builderModule.XMLBuilder();
// @ts-expect-error Builder requires new
builderModule.Builder();
// @ts-expect-error The default export requires new
builderModule.default();
