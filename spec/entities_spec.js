import { XMLParser } from "fast-xml-parser";
import XMLBuilder from "../src/fxb.js";

describe("Entities", function () {

    it("should build by decoding default entities", function () {
        const jsObj = {
            "note": {
                "@heading": "Reminder > \"Alert",
                "body": {
                    "#text": " 3 < 4",
                    "attr": "Writer: Donald Duck."
                },
            }
        };

        const expected = `
        <note heading="Reminder &gt; &quot;Alert">
            <body>
             3 &lt; 4
             <attr>Writer: Donald Duck.</attr>
            </body>
        </note>`;

        const options = {
            attributeNamePrefix: "@",
            ignoreAttributes: false,
            // processEntities: true
        };
        const builder = new XMLBuilder(options);
        const result = builder.build(jsObj);
        expect(result.replace(/\s+/g, "")).toEqual(expected.replace(/\s+/g, ""));
    });
    it("should build by decoding default entities in preserve mode", function () {
        const jsObj = [
            {
                "note": [
                    {
                        "body": [
                            {
                                "#text": "3 < 4"
                            },
                            {
                                "attr": [
                                    {
                                        "#text": "Writer: Donald Duck."
                                    }
                                ]
                            }
                        ]
                    }
                ],
                ":@": {
                    "@heading": "Reminder > \"Alert"
                }
            }
        ];

        const expected = `
        <note heading="Reminder &gt; &quot;Alert">
            <body>
             3 &lt; 4
             <attr>Writer: Donald Duck.</attr>
            </body>
        </note>`;

        const options = {
            attributeNamePrefix: "@",
            ignoreAttributes: false,
            preserveOrder: true,
            // processEntities: false
        };

        const builder = new XMLBuilder(options);
        let result = builder.build(jsObj);
        // console.log(result);
        expect(result.replace(/\s+/g, "")).toEqual(expected.replace(/\s+/g, ""));
    });

});

describe("External Entities", function () {

    it("should build by decoding '&' preserve mode", function () {
        const jsObj = [
            {
                "note": [
                    {
                        "body": [
                            { "#text": "(3 & 4) < 5" },
                            { "attr": [{ "#text": "Writer: Donald Duck." }] }
                        ]
                    }
                ],
                ":@": {
                    "@heading": "Reminder > \"Alert"
                }
            }
        ];

        const expected = `
        <note heading="Reminder &gt; &quot;Alert">
            <body>
             (3 &amp; 4) &lt; 5
             <attr>Writer: Donald Duck.</attr>
            </body>
        </note>`;

        const options = {
            attributeNamePrefix: "@",
            ignoreAttributes: false,
            preserveOrder: true,
            // processEntities: false
        };

        const builder = new XMLBuilder(options);
        let result = builder.build(jsObj);
        // console.log(result);
        expect(result.replace(/\s+/g, "")).toEqual(expected.replace(/\s+/g, ""));
    });
    it("should build by decoding '&'", function () {
        const jsObj = {
            "note": {
                "body": {
                    "attr": "Writer: Donald Duck.",
                    "#text": "(3 & 4) < 5"
                },
                "@heading": "Reminder > \"Alert"
            }
        };

        const expected = `
        <note heading="Reminder &gt; &quot;Alert">
            <body>
            <attr>Writer: Donald Duck.</attr>
             (3 &amp; 4) &lt; 5
            </body>
        </note>`;

        const options = {
            attributeNamePrefix: "@",
            ignoreAttributes: false,
        };

        const builder = new XMLBuilder(options);
        const output = builder.build(jsObj);
        // console.log(output);
        expect(output.replace(/\s+/g, "")).toEqual(expected.replace(/\s+/g, ""));
    });
});

describe("Carriage return", function () {
    const CR = String.fromCharCode(13);   // U+000D
    const LF = String.fromCharCode(10);   // U+000A
    const TAB = String.fromCharCode(9);   // U+0009

    it("escapes a carriage return as &#13; in text and attributes", function () {
        const builder = new XMLBuilder({ ignoreAttributes: false });
        expect(builder.build({ n: "A" + CR + "B" })).toEqual("<n>A&#13;B</n>");
        expect(builder.build({ n: { "@_a": "A" + CR + "B" } })).toEqual(`<n a="A&#13;B"></n>`);
    });

    it("preserves a carriage return through a build -> parse round trip", function () {
        // A raw CR would be silently folded to LF on parse (XML 1.0 2.11).
        const builder = new XMLBuilder({ ignoreAttributes: false });
        const parser = new XMLParser({ ignoreAttributes: false, htmlEntities: true });
        for (const value of ["A" + CR + "B", "line1" + CR + LF + "line2"]) {
            expect(parser.parse(builder.build({ n: value })).n).toEqual(value);
            expect(parser.parse(builder.build({ n: { "@_a": value } })).n["@_a"]).toEqual(value);
        }
    });

    it("leaves LF and TAB unescaped", function () {
        const builder = new XMLBuilder();
        expect(builder.build({ n: "A" + LF + "B" })).toEqual("<n>A" + LF + "B</n>");
        expect(builder.build({ n: "A" + TAB + "B" })).toEqual("<n>A" + TAB + "B</n>");
    });
});
