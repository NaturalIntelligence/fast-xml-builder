"use strict";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the file URL of the current module
const __filename = fileURLToPath(import.meta.url);

// Derive the directory name
const __dirname = dirname(__filename);

export default [
    {
        entry: "./src/fxb.js",
        mode: "production",
        output: {
            path: __dirname,
            filename: "./lib/fxb.cjs",
            // library: "fxp",
            libraryTarget: "commonjs2"
        },
        target: "node"
    }, {
        context: __dirname,
        entry: "./src/fxb.js",
        mode: "production",
        devtool: "source-map",
        output: {
            path: __dirname,
            filename: "./lib/fxb.min.js",
            library: "fxb",
            libraryTarget: "umd",
            globalObject: "this"
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    loader: "babel-loader"
                }
            ]
        },
        target: "web"
    }
];
