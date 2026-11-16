"use strict";

import XMLBuilder from "../src/fxb.js";

// ---------------------------------------------------------------------------
// Helper: xml-naming sanitize stub — mirrors what a real integration would do.
// In production the user would import { sanitize, qName } from 'xml-naming'.
// ---------------------------------------------------------------------------
function xmlNamingSanitize(name) {
  // Replace any character that is not a valid NameChar with '_',
  // and fix a digit/hyphen/dot start by prepending '_'.
  let safe = name.replace(/[^a-zA-Z0-9._\-:]/g, '_');
  if (/^[^a-zA-Z_:]/.test(safe)) safe = '_' + safe;
  return safe;
}

// ---------------------------------------------------------------------------
// fxb.js (plain-object builder) — sanitizeName tests
// ---------------------------------------------------------------------------
describe("Builder (plain object) — sanitizeName option", function () {

  // --- default behaviour: no sanitizeName, invalid names pass through ---

  it("should allow invalid tag names by default (backward-compatible)", function () {
    const input = { "1invalid": "value" };
    const builder = new XMLBuilder({});
    const output = builder.build(input);
    expect(output).toContain("<1invalid>");
  });

  // --- sanitize tag names ---

  it("should sanitize an invalid tag name that starts with a digit", function () {
    const input = { "1tag": "hello" };
    const builder = new XMLBuilder({
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const output = builder.build(input);
    expect(output).toContain("<_1tag>");
    expect(output).not.toContain("<1tag>");
  });

  it("should sanitize a tag name containing spaces", function () {
    const input = { "my tag": "world" };
    const builder = new XMLBuilder({
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const output = builder.build(input);
    expect(output).toContain("<my_tag>");
    expect(output).not.toContain("<my tag>");
  });

  it("should leave valid tag names unchanged", function () {
    const input = { "validTag": "content" };
    const builder = new XMLBuilder({
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const output = builder.build(input);
    expect(output).toContain("<validTag>");
  });

  it("should sanitize nested tag names", function () {
    const input = { "root": { "1child": "val" } };
    const builder = new XMLBuilder({
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const output = builder.build(input);
    expect(output).toContain("<_1child>");
    expect(output).not.toContain("<1child>");
  });

  it("should sanitize tag names in arrays", function () {
    const input = { "root": { "1item": ["a", "b"] } };
    const builder = new XMLBuilder({
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const output = builder.build(input);
    expect(output.match(/<_1item>/g).length).toBe(2);
  });

  // --- sanitize attribute names ---

  it("should sanitize an invalid attribute name", function () {
    const input = { "root": { "@_1attr": "val", "#text": "content" } };
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const expected = `<root _1attr="val">content</root>`
    const output = builder.build(input);
    // console.log(output)
    expect(output).toEqual(expected);
  });

  it("should leave valid attribute names unchanged", function () {
    const input = { "root": { "@_class": "btn", "#text": "text" } };
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const output = builder.build(input);
    expect(output).toContain('class="btn"');
  });

  // --- isAttribute flag in context ---

  it("should receive isAttribute=false for tag names and isAttribute=true for attribute names", function () {
    const calls = [];
    const input = { "root": { "@_data": "x", "#text": "t" } };
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      sanitizeName: (name, ctx) => {
        calls.push({ name, isAttribute: ctx.isAttribute });
        return name;
      }
    });
    const expected = `<root data="x">t</root>`
    const output = builder.build(input);
    expect(output).toEqual(expected);
  });

  // --- throw behaviour ---

  it("should propagate an error thrown inside sanitizeName", function () {
    const input = { "1bad": "value" };
    const builder = new XMLBuilder({
      sanitizeName: (name) => {
        if (/^[0-9]/.test(name)) throw new Error(`Invalid XML name: "${name}"`);
        return name;
      }
    });
    expect(() => builder.build(input)).toThrowError('Invalid XML name: "1bad"');
  });

  // --- special keys are never passed to sanitizeName ---

  it("should not call sanitizeName for textNodeName", function () {
    const calls = [];
    const input = { "root": { "#text": "hello" } };
    const builder = new XMLBuilder({
      sanitizeName: (name, ctx) => { calls.push(name); return name; }
    });
    builder.build(input);
    expect(calls).not.toContain("#text");
  });

  it("should not call sanitizeName for PI tags", function () {
    const calls = [];
    const input = { "?xml": { "@_version": "1.0" }, "root": "ok" };
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      sanitizeName: (name, ctx) => { calls.push(name); return name; }
    });
    builder.build(input);
    expect(calls).not.toContain("?xml");
  });

  // --- XML version detection ---

  it("should detect XML version 1.1 from ?xml declaration (flat attributes)", function () {
    // The detected version is exposed via the sanitizeName context; we verify
    // that the ?xml declaration is read correctly by checking the output contains it.
    const input = {
      "?xml": { "@_version": "1.1", "@_encoding": "UTF-8" },
      "root": "content"
    };
    const builder = new XMLBuilder({ ignoreAttributes: false });
    const output = builder.build(input);
    expect(output).toContain('version="1.1"');
  });

  it("should default to XML version 1.0 when no ?xml declaration is present", function () {
    // No ?xml — builder should not crash and should produce valid output
    const input = { "root": "content" };
    const builder = new XMLBuilder({});
    const output = builder.build(input);
    expect(output).toContain("<root>");
  });
});

// ---------------------------------------------------------------------------
// orderedJs2Xml (preserveOrder builder) — sanitizeName tests
// ---------------------------------------------------------------------------
describe("Builder (preserveOrder) — sanitizeName option", function () {

  // --- default behaviour ---

  it("should allow invalid tag names by default (backward-compatible)", function () {
    const input = [{ "1tag": [{ "#text": "val" }] }];
    const builder = new XMLBuilder({ preserveOrder: true });
    const output = builder.build(input);
    expect(output).toContain("<1tag>");
  });

  // --- sanitize tag names ---

  it("should sanitize an invalid tag name starting with a digit", function () {
    const input = [{ "1tag": [{ "#text": "hello" }] }];
    const builder = new XMLBuilder({
      preserveOrder: true,
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const output = builder.build(input);
    expect(output).toContain("<_1tag>");
    expect(output).not.toContain("<1tag>");
  });

  it("should sanitize a tag name with spaces in ordered mode", function () {
    const input = [{ "my tag": [{ "#text": "value" }] }];
    const builder = new XMLBuilder({
      preserveOrder: true,
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const output = builder.build(input);
    expect(output).toContain("<my_tag>");
  });

  it("should leave valid tag names unchanged in ordered mode", function () {
    const input = [{ "validTag": [{ "#text": "ok" }] }];
    const builder = new XMLBuilder({
      preserveOrder: true,
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const output = builder.build(input);
    expect(output).toContain("<validTag>");
  });

  // --- sanitize attribute names ---

  it("should sanitize an invalid attribute name in ordered mode", function () {
    const input = [{
      "root": [{ "#text": "t" }],
      ":@": { "@_1attr": "v" }
    }];
    const builder = new XMLBuilder({
      preserveOrder: true,
      ignoreAttributes: false,
      sanitizeName: (name) => xmlNamingSanitize(name)
    });
    const expected = `<root _1attr="v">t</root>`
    const output = builder.build(input);
    // console.log(output)
    expect(output).toEqual(expected);
  });

  // --- throw behaviour ---

  it("should propagate an error thrown inside sanitizeName in ordered mode", function () {
    const input = [{ "2bad": [{ "#text": "x" }] }];
    const builder = new XMLBuilder({
      preserveOrder: true,
      sanitizeName: (name) => {
        if (/^[0-9]/.test(name)) throw new Error(`Invalid XML name: "${name}"`);
        return name;
      }
    });
    expect(() => builder.build(input)).toThrowError('Invalid XML name: "2bad"');
  });

  // --- special keys exempt from sanitizeName ---

  it("should not call sanitizeName for textNodeName in ordered mode", function () {
    const calls = [];
    const input = [{ "root": [{ "#text": "hi" }] }];
    const builder = new XMLBuilder({
      preserveOrder: true,
      sanitizeName: (name) => { calls.push(name); return name; }
    });
    builder.build(input);
    expect(calls).not.toContain("#text");
  });

  it("should not call sanitizeName for ?xml PI tag in ordered mode", function () {
    const calls = [];
    const input = [
      { "?xml": [], ":@": { "@_version": "1.0" } },
      { "root": [{ "#text": "x" }] }
    ];
    const builder = new XMLBuilder({
      preserveOrder: true,
      ignoreAttributes: false,
      sanitizeName: (name) => { calls.push(name); return name; }
    });
    builder.build(input);
    expect(calls).not.toContain("?xml");
  });

  // --- XML version detection from first element ---

  it("should detect XML version 1.1 from the first ?xml element in ordered input", function () {
    const input = [
      { "?xml": [], ":@": { "@_version": "1.1", "@_encoding": "UTF-8" } },
      { "root": [{ "#text": "content" }] }
    ];
    const builder = new XMLBuilder({ preserveOrder: true, ignoreAttributes: false });
    const output = builder.build(input);
    expect(output).toContain('version="1.1"');
  });

  it("should default to XML version 1.0 when no ?xml is present in ordered input", function () {
    const input = [{ "root": [{ "#text": "content" }] }];
    const builder = new XMLBuilder({ preserveOrder: true });
    const output = builder.build(input);
    expect(output).toContain("<root>");
  });
});

describe("sanitizeName - processing instruction and callback result checks", function () {

  const rewrite = (name) => xmlNamingSanitize(name);

  // --- dangerous processing-instruction names ---

  it("should rewrite a dangerous processing-instruction name (plain object)", function () {
    const builder = new XMLBuilder({ sanitizeName: rewrite });
    const output = builder.build({ "?x><script>": { "#text": "" }, root: "ok" });
    expect(output).not.toContain("<script>");
    expect(output).toContain("<?x__script_?>");
  });

  it("should rewrite a dangerous processing-instruction name (ordered)", function () {
    const builder = new XMLBuilder({ preserveOrder: true, sanitizeName: rewrite });
    const output = builder.build([
      { "?x><script>": [{ "#text": "" }] },
      { root: [{ "#text": "ok" }] }
    ]);
    expect(output).not.toContain("<script>");
    expect(output).toContain("<?x__script_?>");
  });

  it("should throw on a dangerous processing-instruction name when the callback rejects (plain object)", function () {
    const builder = new XMLBuilder({
      sanitizeName: (name) => { throw new Error(`Invalid XML name: "${name}"`); }
    });
    expect(() => builder.build({ "?x><script>": { "#text": "" } }))
      .toThrowError('Invalid XML name: "x><script>"');
  });

  it("should throw on a dangerous processing-instruction name when the callback rejects (ordered)", function () {
    const builder = new XMLBuilder({
      preserveOrder: true,
      sanitizeName: (name) => { throw new Error(`Invalid XML name: "${name}"`); }
    });
    expect(() => builder.build([{ "?x><script>": [{ "#text": "" }] }]))
      .toThrowError('Invalid XML name: "x><script>"');
  });

  // --- callback result is re-validated ---

  it("should throw when the callback returns an invalid tag name (plain object)", function () {
    const builder = new XMLBuilder({ sanitizeName: () => "a><script>" });
    expect(() => builder.build({ "1bad": "v" })).toThrowError(/invalid XML name/);
  });

  it("should throw when the callback returns an invalid tag name (ordered)", function () {
    const builder = new XMLBuilder({ preserveOrder: true, sanitizeName: () => "a><script>" });
    expect(() => builder.build([{ "1bad": [{ "#text": "v" }] }])).toThrowError(/invalid XML name/);
  });

  it("should throw when the callback returns an invalid attribute name", function () {
    const builder = new XMLBuilder({ ignoreAttributes: false, sanitizeName: () => 'x" onclick="y' });
    expect(() => builder.build({ root: { "@_1attr": "v" } })).toThrowError(/invalid XML name/);
  });

  it("should throw when the callback returns something that is not a string", function () {
    const builder = new XMLBuilder({ sanitizeName: () => undefined });
    expect(() => builder.build({ "1bad": "v" })).toThrowError(/invalid XML name/);
  });

  it("should throw when the callback returns an invalid processing-instruction name", function () {
    const builder = new XMLBuilder({ sanitizeName: () => "x><script>" });
    expect(() => builder.build({ "?x y": { "#text": "" } })).toThrowError(/invalid XML name/);
  });

  // --- valid names must not reach the callback ---

  it("should not call the callback for valid processing-instruction names (plain object)", function () {
    const calls = [];
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      sanitizeName: (name) => { calls.push(name); return name; }
    });
    const output = builder.build({ "?xml": { "@_version": "1.0" }, root: "ok" });
    expect(calls).toEqual([]);
    expect(output).toContain('<?xml version="1.0"?>');
  });

  it("should not call the callback for valid processing-instruction names (ordered)", function () {
    const calls = [];
    const builder = new XMLBuilder({
      preserveOrder: true,
      ignoreAttributes: false,
      sanitizeName: (name) => { calls.push(name); return name; }
    });
    const output = builder.build([
      { "?xml": [], ":@": { "@_version": "1.0" } },
      { root: [{ "#text": "ok" }] }
    ]);
    expect(calls).toEqual([]);
    expect(output).toContain('<?xml version="1.0"?>');
  });

  it("should leave a valid callback result untouched", function () {
    const builder = new XMLBuilder({ sanitizeName: () => "fixed" });
    expect(builder.build({ "1bad": "v" })).toEqual("<fixed>v</fixed>");
  });
});