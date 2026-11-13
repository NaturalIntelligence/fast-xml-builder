"use strict";

import * as builderModule from "../src/fxb.js";

describe("builder exports", function () {
    // 2026-10-11: The named constructor promised by the declarations must be available at runtime.
    it("should export the same constructor as Builder and default", function () {
        expect(builderModule.Builder).toBe(builderModule.default);
        const builder = new builderModule.Builder();
        expect(builder.build({ root: 'value' })).toEqual('<root>value</root>');
    });
});
