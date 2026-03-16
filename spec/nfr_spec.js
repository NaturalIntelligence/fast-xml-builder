
import { XMLParser } from "fast-xml-parser";
import XMLBuilder from "../src/fxb.js";

describe("XMLBuilder", function () {

  it("should throw error for deeply nested tags", function () {
    const depth = 11;
    const xmlData = '<a>'.repeat(depth) + 'x' + '</a>'.repeat(depth);

    const parser = new XMLParser({ maxNestedTags: 15 });
    const jsObj = parser.parse(xmlData)
    const builder = new XMLBuilder({ maxNestedTags: 10 });
    expect(() => builder.build(jsObj)).toThrowError("Maximum nested tags exceeded");
  });
  it("should not throw error for deeply nested tags when under limit", function () {
    const depth = 10;
    const xmlData = '<a>'.repeat(depth) + 'x' + '</a>'.repeat(depth);

    const parser = new XMLParser({ maxNestedTags: 15 });
    const jsObj = parser.parse(xmlData)
    const builder = new XMLBuilder({ maxNestedTags: 10 });
    builder.build(jsObj)
  });
  it("should throw error for deeply nested tags with preserveOrder", function () {
    const depth = 11;
    const xmlData = '<a>'.repeat(depth) + 'x' + '</a>'.repeat(depth);

    const parser = new XMLParser({ maxNestedTags: 15, preserveOrder: true });
    const jsObj = parser.parse(xmlData)
    const builder = new XMLBuilder({ maxNestedTags: 10, preserveOrder: true });
    expect(() => builder.build(jsObj)).toThrowError("Maximum nested tags exceeded");
  });
  it("should not throw error for deeply nested tags when under limit with preserveOrder", function () {
    const depth = 10;
    const xmlData = '<a>'.repeat(depth) + 'x' + '</a>'.repeat(depth);

    const parser = new XMLParser({ maxNestedTags: 15, preserveOrder: true });
    const jsObj = parser.parse(xmlData)
    const builder = new XMLBuilder({ maxNestedTags: 10, preserveOrder: true });
    builder.build(jsObj)
  });
});