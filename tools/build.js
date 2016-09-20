"use strict";

const rollup = require("rollup"),
    babel = require("rollup-plugin-babel"),
    eslint = require("rollup-plugin-eslint"),
    resolve = require("rollup-plugin-node-resolve"),
    commonjs = require("rollup-plugin-commonjs"),
    replace = require("rollup-plugin-replace"),
    uglify = require("rollup-plugin-uglify");

const watch = require("watch"),
    path = require("path");


const args = process.argv.splice(2),
    PROD = args.indexOf('--prod') !== -1;

const srcPath = path.join(__dirname, "../src/js/main.js"),
    destPath = path.join(__dirname, "../dist/js/bundle.js");

let cache,
    buildHandle = () => rollup.rollup({
        entry: srcPath,
        plugins: [
            resolve({
                jsnext: true,
                main: true,
                browser: true,
            }),
            commonjs(),
            babel({
                exclude: 'node_modules/**'
            }),
            eslint({
                exclude: [
                    'src/css/**',
                ]
            }),
            PROD && uglify()
        ],
        cache: cache
    }).then(bundle => {
        cache = bundle;

        bundle.write({
            dest: destPath,
            format: "iife"
        });
    }).catch(err => console.log(err.stack));


const srcDir = path.join(srcPath, '../');

(PROD && buildHandle()) || watch.watchTree(srcDir, (file, curr, prev) => {
    let time,
        changedFileDir;
    if (curr) {
        time = +new Date();
        changedFileDir = path.basename(file, srcDir);
        curr && console.log(`File Changed  ${changedFileDir}`);
    } else {
        console.log(`${srcDir}`);
        console.log(`watching...`)
    }
    buildHandle();

    if (curr) {
        let costTime = +new Date() - time;
        console.log(`${costTime} ms cost`);
    }
});


// replace({
//     ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
// }),
// export default {
//     entry: 'src/js/main.js',
//     dest: 'build/js/main.min.js',
//     format: 'iife',
//     sourceMap: 'inline',
// };
