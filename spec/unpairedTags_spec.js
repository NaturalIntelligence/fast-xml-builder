"use strict";

import XMLBuilder from "../src/fxb.js";

describe("unpaired and empty tags", function () {

  it("should be parsed with paired tag when suppressEmptyNode:false", function () {
    const xmlData = `<rootNode>
            <tag>value</tag>
            <empty />
            <unpaired attr="1">
        </rootNode>`;
    const expectedXmlData = `<rootNode>
            <tag>value</tag>
            <empty></empty>
            <unpaired attr="1">
        </rootNode>`;

    const jsObj = {
      "rootNode": {
        "tag": "value",
        "empty": "",
        "unpaired": {
          "@_attr": "1"
        }
      }
    }
    const options = {
      // format: true,
      // preserveOrder: true,
      ignoreAttributes: false,
      unpairedTags: ["unpaired"]
    };


    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    //   console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(expectedXmlData.replace(/\s+/g, ""));
  });

  it("should be parsed without paired tag when suppressEmptyNode:true", function () {
    const xmlData = `<rootNode>
            <tag>value</tag>
            <empty />
            <unpaired attr="1">
        </rootNode>`;
    const jsObj = {
      "rootNode": {
        "tag": "value",
        "empty": "",
        "unpaired": {
          "@_attr": "1"
        }
      }
    }
    const options = {
      // format: true,
      // preserveOrder: true,
      suppressEmptyNode: true,
      ignoreAttributes: false,
      unpairedTags: ["unpaired"]
    };


    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    // console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
  });

  it("should be parsed without paired tag when suppressEmptyNode:true and tags order is preserved", function () {
    const xmlData = `<rootNode>
            <tag>value</tag>
            <empty />
            <unpaired attr="1">
        </rootNode>`;
    const jsObj = {
      "rootNode": {
        "tag": "value",
        "empty": "",
        "unpaired": {
          "@_attr": "1"
        }
      }
    }
    const options = {
      // format: true,
      // preserveOrder: true,
      suppressEmptyNode: true,
      ignoreAttributes: false,
      unpairedTags: ["unpaired"]
    };


    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    // console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
  });

  it("should be parsed when unpaired tag is self-closing or paired closing tag", function () {
    const xmlData = `<rootNode>
            <unpaired attr="1">
            <self />
            <unpaired>
            <unpaired />
            <unpaired>
            <unpaired />
            <unpaired>
        </rootNode>`;

    const expectedXml = `<rootNode>
        <unpaired attr="1">
        <self/>
        <unpaired>
        <unpaired>
        <unpaired>
        <unpaired>
        <unpaired>
      </rootNode>`;
    const jsObj = [
      {
        "rootNode": [
          {
            "unpaired": [],
            ":@": {
              "@_attr": "1"
            }
          },
          {
            "self": []
          },
          {
            "unpaired": []
          },
          {
            "unpaired": []
          },
          {
            "unpaired": []
          },
          {
            "unpaired": []
          },
          {
            "unpaired": []
          }
        ]
      }
    ]
    const options = {
      // format: true,
      preserveOrder: true,
      suppressEmptyNode: true,
      ignoreAttributes: false,
      unpairedTags: ["unpaired"]
    };


    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    // console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(expectedXml.replace(/\s+/g, ""));
  });

  it("should parsed unpaired tag before stop nodes", function () {
    const xmlData = `<rootNode>
            <unpaired attr="1">
            <stop>here</stop>
            <unpaired>
        </rootNode>`;

    const expectedXml = `<rootNode>
        <unpaired attr="1">
        <stop>here</stop>
        <unpaired>
      </rootNode>`;

    const jsObj = [
      {
        "rootNode": [
          {
            "unpaired": [],
            ":@": {
              "@_attr": "1"
            }
          },
          {
            "stop": [
              {
                "#text": "here"
              }
            ]
          },
          {
            "unpaired": []
          }
        ]
      }
    ]
    const options = {
      // format: true,
      preserveOrder: true,
      suppressEmptyNode: true,
      ignoreAttributes: false,
      unpairedTags: ["unpaired"],
      stopNodes: ["*.stop"]
    };


    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    // console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(expectedXml.replace(/\s+/g, ""));
  });

  it("should suppress paired tag but not unpaired tag when suppressUnpairedNode:false", function () {
    const xmlData = `<rootNode>
          <tag>value</tag>
          <empty />
          <unpaired attr="1">
          <unpaired>
      </rootNode>`;
    const expectedXmlData = `<rootNode>
          <tag>value</tag>
          <empty/>
          <unpaired attr="1"/>
          <unpaired/>
      </rootNode>`;
    const jsObj = {
      "rootNode": {
        "tag": "value",
        "empty": "",
        "unpaired": [
          {
            "@_attr": "1"
          },
          ""
        ]
      }
    }
    const options = {
      // format: true,
      // preserveOrder: true,
      suppressEmptyNode: true,
      suppressUnpairedNode: false,
      ignoreAttributes: false,
      unpairedTags: ["unpaired"]
    };


    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    //   console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(expectedXmlData.replace(/\s+/g, ""));
  });

  it("should not suppress paired tag but unpaired tag when suppressUnpairedNode:true", function () {
    const xmlData = `<rootNode>
          <tag>value</tag>
          <empty />
          <unpaired attr="1">
          <unpaired>
      </rootNode>`;
    const expectedXmlData = `<rootNode>
          <tag>value</tag>
          <empty></empty>
          <unpaired attr="1">
          <unpaired>
      </rootNode>`;
    const jsObj = {
      "rootNode": {
        "tag": "value",
        "empty": "",
        "unpaired": [
          {
            "@_attr": "1"
          },
          ""
        ]
      }
    }
    const options = {
      // format: true,
      // preserveOrder: true,
      // suppressEmptyNode: true,
      suppressUnpairedNode: true,
      ignoreAttributes: false,
      unpairedTags: ["unpaired"]
    };


    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    //   console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(expectedXmlData.replace(/\s+/g, ""));
  });

  it("should suppress paired tag but not unpaired tag when suppressUnpairedNode:false (ordered)", function () {
    const xmlData = `<rootNode>
          <tag>value</tag>
          <empty />
          <unpaired attr="1">
          <unpaired>
      </rootNode>`;
    const expectedXmlData = `<rootNode>
          <tag>value</tag>
          <empty/>
          <unpaired attr="1"/>
          <unpaired/>
      </rootNode>`;
    const jsObj = [
      {
        "rootNode": [
          {
            "tag": [
              {
                "#text": "value"
              }
            ]
          },
          {
            "empty": []
          },
          {
            "unpaired": [],
            ":@": {
              "@_attr": "1"
            }
          },
          {
            "unpaired": []
          }
        ]
      }
    ]
    const options = {
      // format: true,
      preserveOrder: true,
      suppressEmptyNode: true,
      suppressUnpairedNode: false,
      ignoreAttributes: false,
      unpairedTags: ["unpaired"]
    };


    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    //   console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(expectedXmlData.replace(/\s+/g, ""));
  });

  it("should not suppress paired tag but unpaired tag when suppressUnpairedNode:true  (ordered)", function () {
    const xmlData = `<rootNode>
          <tag>value</tag>
          <empty />
          <unpaired attr="1">
          <unpaired>
      </rootNode>`;
    const expectedXmlData = `<rootNode>
          <tag>value</tag>
          <empty></empty>
          <unpaired attr="1">
          <unpaired>
      </rootNode>`;
    const jsObj = [
      {
        "rootNode": [
          {
            "tag": [
              {
                "#text": "value"
              }
            ]
          },
          {
            "empty": []
          },
          {
            "unpaired": [],
            ":@": {
              "@_attr": "1"
            }
          },
          {
            "unpaired": []
          }
        ]
      }
    ]
    const options = {
      // format: true,
      preserveOrder: true,
      // suppressEmptyNode: true,
      suppressUnpairedNode: true,
      ignoreAttributes: false,
      unpairedTags: ["unpaired"]
    };


    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    //   console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(expectedXmlData.replace(/\s+/g, ""));
  });

});