import XMLBuilder from "../src/fxb.js";

describe("stopNodes Builder - Basic Tests", function () {

  describe("preserveOrder: false", function () {

    it("should preserve raw content when stopNode matches (simple case)", function () {
      const jsObj = {
        issue: {
          title: "test 1",
          fix1: "<p>p 1</p><div class=\"show\">div 1</div>"
        }
      };

      const options = {
        ignoreAttributes: false,
        stopNodes: ["issue.fix1"],
        preserveOrder: false
      };

      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      // console.log("Output:", output);

      // stopNode content should NOT be entity-encoded
      expect(output).toContain("<fix1><p>p 1</p><div class=\"show\">div 1</div></fix1>");
    });

    it("should preserve raw content with attributes (parser output format)", function () {
      const jsObj = {
        issue: {
          title: "test 1",
          fix1: {
            "#text": "<p>p 1</p><div class=\"show\">div 1</div>",
            "@_lang": "en"
          }
        }
      };

      const options = {
        ignoreAttributes: false,
        stopNodes: ["issue.fix1"],
        preserveOrder: false
      };

      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      // console.log("Output:", output);

      // stopNode content should NOT be entity-encoded, attributes preserved
      expect(output).toContain('<fix1 lang="en"><p>p 1</p><div class="show">div 1</div></fix1>');
    });

    it("should select with attribute expression", function () {
      const jsObj = {
        issue: {
          title: "test 1",
          fix1: [{
            "#text": "<p>p 1</p><div class=\"show\">div 1</div>",
            "@_lang": "en"
          }, {
            "#text": "<p>p 1</p><div class=\"show\">div 1</div>",
            "@_lang": "hi"
          }]
        }
      };

      const options = {
        ignoreAttributes: false,
        stopNodes: ["issue.fix1[lang=hi]"], //"..fix1[lang=hi]"
        preserveOrder: false,
        format: true
      };

      const expected = `<issue>
  <title>test 1</title>
  <fix1 lang="en">&lt;p&gt;p 1&lt;/p&gt;&lt;div class=&quot;show&quot;&gt;div 1&lt;/div&gt;</fix1>
  <fix1 lang="hi">
<p>p 1</p><div class="show">div 1</div>  </fix1>
</issue>`
      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      //console.log("Output:", output);

      // stopNode content should NOT be entity-encoded, attributes preserved
      // expect(output).toContain('<fix1 lang="en"><p>p 1</p><div class="show">div 1</div></fix1>');
      expect(output.replace(/\s+/g, "")).toEqual(expected.replace(/\s+/g, ""));
    });

    it("should preserve special characters in stopNode", function () {
      const jsObj = {
        root: {
          div: {
            pre: "test > < &",
            "@_class": "code"
          }
        }
      };

      const options = {
        ignoreAttributes: false,
        stopNodes: ["..div"],
        preserveOrder: false
      };

      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      // console.log("Output:", output);

      // Both content and attributes should be raw
      expect(output).toContain('class="code"');
      expect(output).toContain("<pre>test > < &</pre>");
    });

    it("should encode when NOT a stopNode", function () {
      const jsObj = {
        root: {
          div: {
            pre: "test > < &",
            "@_class": "code"
          }
        }
      };

      const options = {
        ignoreAttributes: false,
        stopNodes: ["..script"], // Different pattern, won't match div
        preserveOrder: false
      };

      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      // console.log("Output:", output);

      // Should be entity-encoded
      expect(output).toContain("<pre>test &gt; &lt; &amp;</pre>");
    });

    it("should handle array of same tag with stopNode", function () {
      const jsObj = {
        root: {
          fix1: [
            "<p>first</p>",
            "<p>second</p>"
          ]
        }
      };

      const options = {
        ignoreAttributes: false,
        stopNodes: ["..fix1"],
        preserveOrder: false
      };

      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      // console.log("Output:", output);

      expect(output).toContain("<fix1><p>first</p></fix1>");
      expect(output).toContain("<fix1><p>second</p></fix1>");
    });

    it("should handle deep wildcard pattern", function () {
      const jsObj = {
        root: {
          fix1: "<p>p 1</p>",
          another: {
            fix1: "<nested>str</nested>"
          }
        }
      };

      const options = {
        ignoreAttributes: false,
        stopNodes: ["..fix1"],
        preserveOrder: false
      };

      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      // console.log("Output:", output);

      // Both fix1 nodes should preserve raw content
      expect(output).toContain("<fix1><p>p 1</p></fix1>");
      expect(output).toContain("<fix1><nested>str</nested></fix1>");
    });

  });

  describe("preserveOrder: true", function () {

    it("should preserve raw content when stopNode matches", function () {
      const jsObj = [
        {
          "issue": [
            {
              "title": [
                {
                  "#text": "test 1"
                }
              ]
            },
            {
              "fix1": [
                {
                  "#text": "<p>p 1</p><div class=\"show\">div 1</div>"
                }
              ]
            }
          ]
        }
      ];

      const options = {
        ignoreAttributes: false,
        stopNodes: ["issue.fix1"],
        preserveOrder: true
      };

      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      // console.log("Output:", output);

      // stopNode content should NOT be entity-encoded
      expect(output).toContain("<fix1><p>p 1</p><div class=\"show\">div 1</div></fix1>");
    });

    it("should preserve raw content with attributes", function () {
      const jsObj = [
        {
          "issue": [
            {
              "fix1": [
                {
                  "#text": "<p>p 1</p><div class=\"show\">div 1</div>"
                }
              ],
              ":@": {
                "@_lang": "en"
              }
            }
          ]
        }
      ];

      const options = {
        ignoreAttributes: false,
        stopNodes: ["issue.fix1"],
        preserveOrder: true
      };

      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      // console.log("Output:", output);

      expect(output).toContain('<fix1 lang="en"><p>p 1</p><div class="show">div 1</div></fix1>');
    });

    it("should preserve special characters in stopNode", function () {
      const jsObj = [
        {
          "root": [
            {
              "div": [
                {
                  "pre": [
                    {
                      "#text": "test > < &"
                    }
                  ]
                }
              ],
              ":@": {
                "@_class": "code"
              }
            }
          ]
        }
      ];

      const options = {
        ignoreAttributes: false,
        stopNodes: ["..div"],
        preserveOrder: true
      };

      const builder = new XMLBuilder(options);
      const output = builder.build(jsObj);

      // console.log("Output:", output);

      expect(output).toContain('class="code"');
      expect(output).toContain("<pre>test > < &</pre>");
    });

  });

});