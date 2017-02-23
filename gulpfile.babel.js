import gulp from 'gulp';
import uglify from 'uglify-js';
import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import fs from 'fs';

gulp.task('default', ['build', 'copy']);

gulp.task('rollup', () => {
    return rollup({
        entry: 'src/index.js',
        plugins: [
            babel({
                babelrc: false,
                "presets":[
                    [ "es2015", { "modules": false } ]
                ],
                "plugins": ["external-helpers"]
            })
        ]
    }).then(bundle => bundle.write({
        format: 'cjs',
        dest: 'build/index.js'
    }));
});

gulp.task('build', ['rollup'], () => {
    const result = uglify.minify('build/index.js', {
        mangle: {
            toplevel: true
        },
        mangleProperties: {
            regex: /^startedUntrackedActions/
        }
    });

    fs.writeFile('build/index.min.js', result.code);
});


gulp.task('copy', () => {
    gulp.src(['package.json', 'LICENSE', 'README.md'])
        .pipe(gulp.dest('build'));
});