
import XMLBuilder from "../src/fxb.js";

describe("Processing Instruction Tag", function () {

  it("should process PI tag without attributes", function () {
    const xmlData = `
        <?xml version="1.0"?>
        <?mso-contentType?>
        <h1></h1>
        `;
    const jsObj = [
      {
        "?xml": [
          {
            "#text": ""
          }
        ],
        ":@": {
          "@_version": "1.0"
        }
      },
      {
        "?mso-contentType": [
          {
            "#text": ""
          }
        ]
      },
      {
        "h1": []
      }
    ];
    const options = {
      ignoreAttributes: false,
      format: true,
      preserveOrder: true,
    };

    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    //   console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
  });

  it("should process PI tag with attributes", function () {
    const xmlData = `
        <?xml version="1.0"?>
        <?xml-stylesheet href="mystyle.xslt" type="text/xsl"?>
        <?TeamAlpha member="Jesper" date="2008-04-15" comment="I strongly feel that the attributes in the product element below are really not needed and should be dropped." ?> 
        <h1></h1>
        `;
    const jsObj = [
      {
        "?xml": [
          {
            "#text": ""
          }
        ],
        ":@": {
          "@_version": "1.0"
        }
      },
      {
        "?xml-stylesheet": [
          {
            "#text": ""
          }
        ],
        ":@": {
          "@_href": "mystyle.xslt",
          "@_type": "text/xsl"
        }
      },
      {
        "?TeamAlpha": [
          {
            "#text": ""
          }
        ],
        ":@": {
          "@_member": "Jesper",
          "@_date": "2008-04-15",
          "@_comment": "I strongly feel that the attributes in the product element below are really not needed and should be dropped."
        }
      },
      {
        "h1": []
      }
    ]
    const options = {
      ignoreAttributes: false,
      format: true,
      preserveOrder: true,
    };
    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    //   console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
  });

  it("should process PI tag with boolean attributes", function () {
    const xmlData = `
        <?xml version="1.0"?>
        <?textinfo whitespace is allowed ?>
        
        <h1></h1>
        `;

    const jsObj = [
      {
        "?xml": [
          {
            "#text": ""
          }
        ],
        ":@": {
          "@_version": "1.0"
        }
      },
      {
        "?textinfo": [
          {
            "#text": ""
          }
        ],
        ":@": {
          "@_whitespace": true,
          "@_is": true,
          "@_allowed": true
        }
      },
      {
        "h1": []
      }
    ]

    const options = {
      ignoreAttributes: false,
      format: true,
      preserveOrder: true,
      allowBooleanAttributes: true
    };

    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    // console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
  });

  it("should process PI tag with tag attributes", function () {
    const xmlData = `<?xml version="1.0"?>
        <?elementnames <fred>, <bert>, <harry> ?>
        <h1></h1>
        `;
    const jsObj = [
      {
        "?xml": [
          {
            "#text": ""
          }
        ],
        ":@": {
          "@_version": "1.0"
        }
      },
      {
        "?elementnames": [
          {
            "#text": ""
          }
        ],
        ":@": {
          "@_<fred>,": true,
          "@_<bert>,": true,
          "@_<harry>": true
        }
      },
      {
        "h1": []
      }
    ]
    const options = {
      ignoreAttributes: false,
      format: true,
      preserveOrder: true,
      allowBooleanAttributes: true
    };

    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    // console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
  });

  it("should process PI tag with tag attributes when order is not preserved", function () {
    const xmlData = `<?xml version="1.0"?>
        <?elementnames <fred>, <bert>, <harry> ?>
        <h1></h1>
        `;

    const jsObj = {
      "?xml": {
        "attr": {
          "version": "1.0"
        }
      },
      "?elementnames": {
        "attr": {
          "<fred>,": true,
          "<bert>,": true,
          "<harry>": true
        }
      },
      "h1": {
        "text": ""
      }
    }
    const builderOptions = {
      allowBooleanAttributes: true,
      attributeNamePrefix: '',
      attributesGroupName: 'attr',
      textNodeName: 'text',
      ignoreAttributes: false,
      format: true,
      // suppressEmptyNode: true,
      suppressBooleanAttributes: true
    };

    const parseOptions = {
      attributeNamePrefix: '',
      attributesGroupName: 'attr',
      textNodeName: 'text',
      ignoreAttributes: false,
      removeNSPrefix: false,
      allowBooleanAttributes: true,
      parseTagValue: true,
      parseAttributeValue: false,
      trimValues: true,
      parseTrueNumberOnly: false,
      arrayMode: false,
      alwaysCreateTextNode: true,
      numberParseOptions: {
        hex: true,
        leadingZeros: false
      }
    }
    const builder = new XMLBuilder(builderOptions);
    const output = builder.build(jsObj);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
    // console.log(output);
  });


  it("should not add any empty line in the start", function () {
    const xmlData = `
      <?xml version="1.0"?>
      <?mso-contentType?>
      <h1></h1>
      `;
    const jsObj = [
      {
        "?xml": [
          {
            "#text": ""
          }
        ],
        ":@": {
          "@_version": "1.0"
        }
      },
      {
        "?mso-contentType": [
          {
            "#text": ""
          }
        ]
      },
      {
        "h1": []
      }
    ]
    const options = {
      ignoreAttributes: false,
      format: true,
      preserveOrder: true,
    };

    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    // console.log("something", output);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
  });

  it("should ignore text when preserve order", function () {
    const xmlData = `
      <?xml version="1.0"?>
      <?mso-contentType?>
      <h1></h1>
      `;
    const jsObj = [
      {
        "?xml": [
          {
            "#text": "anything"
          }
        ],
        ":@": {
          "@_version": "1.0"
        }
      },
      {
        "?mso-contentType": [
          {
            "#text": "something"
          }
        ]
      },
      {
        "h1": []
      }
    ]
    const options = {
      ignoreAttributes: false,
      format: true,
      preserveOrder: true,
    };

    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    // console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
  });
  it("should ignore text", function () {
    const xmlData = `
      <?xml version="1.0"?>
      <?mso-contentType version="1.0"?>
      <h1></h1>
      `;
    const jsObj = {
      "?xml": {
        "#text": "anything",
        "@_version": "1.0"
      },
      "?mso-contentType": {
        "#text": "something",
        "@_version": "1.0"
      },
      "h1": {
        "#text": ""
      }
    }
    const options = {
      ignoreAttributes: false,
      format: true,
      preserveOrder: false,
    };

    const builder = new XMLBuilder(options);
    const output = builder.build(jsObj);
    // console.log(output);
    expect(output.replace(/\s+/g, "")).toEqual(xmlData.replace(/\s+/g, ""));
  });
});