"use strict";

import XMLBuilder from "../src/fxb.js"

describe("Builder", function () {
    it("should build XML with CDATA for repeated values without parseOrder", function () {
        const input = {
            "any_name": {
                "person": {
                    "phone": [
                        122233344550,
                        122233344551,
                        ""
                    ],
                    "name": [
                        `<some>Jack</some>Jack`,
                        `<some>Mohan</some>`
                    ],
                    "blank": "",
                    "regx": "^[ ].*$"
                }
            }
        };
        const expected = `
        <any_name>
            <person>
                <![CDATA[122233344550]]>
                <![CDATA[122233344551]]>
                <![CDATA[]]>
                <name><some>Jack</some>Jack</name>
                <name><some>Mohan</some></name>
                <blank></blank>
                <regx>^[ ].*$</regx>
            </person>
        </any_name>`;

        const options = {
            processEntities: false,
            format: true,
            ignoreAttributes: false,
            cdataPropName: "phone"
        };

        const builder = new XMLBuilder(options);
        const xmlOutput = builder.build(input);
        // console.log(xmlOutput);
        expect(xmlOutput.replace(/\s+/g, "")).toEqual(expected.replace(/\s+/g, ""));
    });

    it("should build XML with CDATA for single value without parseOrder", function () {
        const input = {
            "any_name": {
                "person": {
                    "phone": [
                        122233344550,
                        122233344551,
                        ""
                    ],
                    "name": [
                        `<some>Jack</some>Jack`,
                        `<some>Mohan</some>`
                    ],
                    "blank": "",
                    "regx": "^[ ].*$"
                }
            }
        };
        const expected = `
        <any_name>
            <person>
                <phone>122233344550</phone>
                <phone>122233344551</phone>
                <phone></phone>
                <name><some>Jack</some>Jack</name>
                <name><some>Mohan</some></name>
                <blank></blank>
                <![CDATA[^[ ].*$]]>
            </person>
        </any_name>`;

        const options = {
            processEntities: false,
            format: true,
            ignoreAttributes: false,
            cdataPropName: "regx"
        };

        const builder = new XMLBuilder(options);
        const xmlOutput = builder.build(input);
        // console.log(xmlOutput);
        expect(xmlOutput.replace(/\s+/g, "")).toEqual(expected.replace(/\s+/g, ""));
    });

});
