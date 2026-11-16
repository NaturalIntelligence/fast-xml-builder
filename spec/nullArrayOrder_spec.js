import XMLBuilder from "../src/fxb.js";

// 2026-10-11: Null entries must keep their position among repeated nodes.
describe("Null array entries", function () {
  it("should keep null between primitive entries", function () {
    const builder = new XMLBuilder();
    expect(builder.build({ item: ["first", null, "last"] }))
      .toEqual("<item>first</item><item/><item>last</item>");
  });

  it("should keep null after an object entry", function () {
    const builder = new XMLBuilder();
    expect(builder.build({ item: [{ value: "first" }, null] }))
      .toEqual("<item><value>first</value></item><item/>");
  });

  it("should preserve multiple null positions while omitting undefined", function () {
    const builder = new XMLBuilder();
    expect(builder.build({ item: [null, "first", undefined, null, "last", null] }))
      .toEqual("<item/><item>first</item><item/><item>last</item><item/>");
  });

  it("should preserve null positions when formatting nested nodes", function () {
    const builder = new XMLBuilder({ format: true });
    expect(builder.build({ root: { item: ["first", null, "last"] } }))
      .toEqual("<root>\n  <item>first</item>\n  <item/>\n  <item>last</item>\n</root>\n");
  });

  it("should preserve null positions between processing instructions", function () {
    const builder = new XMLBuilder({ ignoreAttributes: false });
    expect(builder.build({ "?check": [{ "@_id": "first" }, null, { "@_id": "last" }] }))
      .toEqual('<?check id="first"?><?check?><?check id="last"?>');
  });

  it("should retain the existing grouped null representation", function () {
    const builder = new XMLBuilder({ oneListGroup: true });
    expect(builder.build({ root: { item: ["first", null, "last"] } }))
      .toEqual("<root><item/><item>firstlast</item></root>");
  });

  it("should retain a leading null and scalar null output", function () {
    const builder = new XMLBuilder();
    expect(builder.build({ item: [null, "last"], empty: null }))
      .toEqual("<item/><item>last</item><empty/>");
  });
});
