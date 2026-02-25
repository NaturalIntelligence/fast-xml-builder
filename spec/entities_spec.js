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
