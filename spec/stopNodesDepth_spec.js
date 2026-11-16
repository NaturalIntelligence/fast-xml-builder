// spec/stopNodesDepth_spec.js
import XMLBuilder from "../src/fxb.js";

function deepObject(n) {
    let obj = { t: "leaf" };
    for (let i = 0; i < n; i++) obj = { a: obj };
    return obj;
}

// nesting happens through arrays of objects under the stop node
function deepArrayObject(n) {
    let obj = { t: "leaf" };
    for (let i = 0; i < n; i++) obj = { b: [obj] };
    return { a: obj };
}

function deepOrdered(n) {
    let inner = [{ t: [{ "#text": "leaf" }] }];
    for (let i = 0; i < n; i++) inner = [{ a: inner }];
    return inner;
}

const LIMIT_MSG = "Maximum nested tags exceeded";

describe("maxNestedTags inside stopNodes (GHSA-fj3w-jwp8-x2g3 bypass)", function () {

    describe("plain object builder", function () {
        [2000, 4000, 8000].forEach((depth) => {
            it(`should throw the limit error, not a stack overflow, at depth ${depth}`, function () {
                const builder = new XMLBuilder({ stopNodes: ["a"] });
                expect(() => builder.build(deepObject(depth))).toThrowError(LIMIT_MSG);
            });
        });

        it("should enforce the limit through arrays under a stop node", function () {
            const builder = new XMLBuilder({ stopNodes: ["a"] });
            expect(() => builder.build(deepArrayObject(4000))).toThrowError(LIMIT_MSG);
        });

        it("should enforce the limit with a deep wildcard stop node", function () {
            const builder = new XMLBuilder({ stopNodes: ["..a"] });
            expect(() => builder.build({ root: deepObject(500) })).toThrowError(LIMIT_MSG);
        });

        it("should honour a custom limit inside a stop node", function () {
            const builder = new XMLBuilder({ stopNodes: ["a"], maxNestedTags: 10 });
            expect(() => builder.build(deepObject(20))).toThrowError(LIMIT_MSG);
            expect(() => builder.build(deepObject(5))).not.toThrow();
        });

        it("should still build a shallow stop-node subtree unchanged", function () {
            const builder = new XMLBuilder({ stopNodes: ["a"] });
            expect(builder.build(deepObject(3))).toEqual("<a><a><a><t>leaf</t></a></a></a>");
        });

        it("should still build raw content under a stop node close to the default limit", function () {
            const builder = new XMLBuilder({ stopNodes: ["a"] });
            expect(() => builder.build(deepObject(90))).not.toThrow();
        });

        it("should not enforce a limit when it is disabled", function () {
            const builder = new XMLBuilder({ stopNodes: ["a"], maxNestedTags: 0 });
            expect(() => builder.build(deepObject(500))).not.toThrow();
        });
    });

    describe("preserveOrder builder", function () {
        [4000, 8000].forEach((depth) => {
            it(`should throw the limit error, not a stack overflow, at depth ${depth}`, function () {
                const builder = new XMLBuilder({ preserveOrder: true, stopNodes: ["a"] });
                expect(() => builder.build(deepOrdered(depth))).toThrowError(LIMIT_MSG);
            });
        });

        it("should enforce the limit with a deep wildcard stop node", function () {
            const builder = new XMLBuilder({ preserveOrder: true, stopNodes: ["..a"] });
            expect(() => builder.build([{ root: deepOrdered(500) }])).toThrowError(LIMIT_MSG);
        });

        it("should honour a custom limit inside a stop node", function () {
            const builder = new XMLBuilder({ preserveOrder: true, stopNodes: ["a"], maxNestedTags: 10 });
            expect(() => builder.build(deepOrdered(20))).toThrowError(LIMIT_MSG);
            expect(() => builder.build(deepOrdered(5))).not.toThrow();
        });

        it("should still build a shallow stop-node subtree unchanged", function () {
            const builder = new XMLBuilder({ preserveOrder: true, stopNodes: ["a"] });
            expect(builder.build(deepOrdered(3))).toEqual("<a><a><a><t>leaf</t></a></a></a>");
        });

        it("should not enforce a limit when it is disabled", function () {
            const builder = new XMLBuilder({ preserveOrder: true, stopNodes: ["a"], maxNestedTags: 0 });
            expect(() => builder.build(deepOrdered(500))).not.toThrow();
        });
    });
});