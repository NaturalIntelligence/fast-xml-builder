"use strict";

import { XMLParser } from "fast-xml-parser";
import XMLBuilder from "../src/fxb.js";

describe("Attributes", function () {
  it("should parse and build with tag name 'attributes' ", function () {
    const XMLdata = `
        <test attr="test bug">
          <a name="a">123</a>
          <b name="b"/>
          <attributes>
            <attribute datatype="string" name="DebugRemoteType">dev</attribute>
            <attribute datatype="string" name="DebugWireType">2</attribute>
            <attribute datatype="string" name="TypeIsVarchar">1</attribute>
          </attributes>
        </test>`;

    const options = {
      ignoreAttributes: false,
      format: true,
      preserveOrder: true,
      suppressEmptyNode: true,
      unpairedTags: ["star"]
    };
    const parser = new XMLParser(options);
    let result = parser.parse(XMLdata);
    //   console.log(JSON.stringify(result, null,4));

    const builder = new XMLBuilder(options);
    const output = builder.build(result);
    //   console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(XMLdata.replace(/\s+/g, ""));
  });
});
