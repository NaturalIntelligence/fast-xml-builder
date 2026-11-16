"use strict";

import * as builderModule from "../src/fxb.js";

describe("builder exports", function () {
    it("should export the same constructor as Builder, XMLBuilder and default", function () {
        expect(builderModule.Builder).toBe(builderModule.default);
        expect(builderModule.XMLBuilder).toBe(builderModule.default);
        [builderModule.Builder, builderModule.XMLBuilder, builderModule.default].forEach(Constructor => {
            const builder = new Constructor({ arrayNodeName: 'item' });
            expect(builder.build(['value'])).toEqual('<item>value</item>');
        });
    });

    it("requires new when creating a builder", function () {
        const Constructor = builderModule.XMLBuilder;
        expect(() => Constructor()).toThrowError(TypeError);
    });
});
