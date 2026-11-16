import DefaultBuilder, { Builder, XMLBuilder, XMLBuilderConstructor } from 'fast-xml-builder';

const constructors: XMLBuilderConstructor[] = [DefaultBuilder, Builder, XMLBuilder];
for (const Constructor of constructors) {
  const builder: XMLBuilder = new Constructor({ ignoreAttributes: false });
  const xml: string = builder.build({ root: { '@_id': 'test' } });
  void xml;
}

// Constructors require new at runtime.
// @ts-expect-error XMLBuilder is not callable
XMLBuilder();
// @ts-expect-error Builder is not callable
Builder();
// @ts-expect-error DefaultBuilder is not callable
DefaultBuilder();
