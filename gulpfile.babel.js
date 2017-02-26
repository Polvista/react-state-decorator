import gulp from 'gulp';
import uglify from 'uglify-js';
import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import fs from 'fs';

const innerMethods = [
    'startedActions',
    'startedUntrackedActions',
    'afterActionsEndedCallbacks',
    'values',
    'callbacks',
    'shallowCallbacks',
    'subscriptions',
    'propsScopes',
    '_setValue',
    '_makeTrackable',
    'setValueSilently',
    'initValue',
    'deleteValue',
    'stopListen',
    'getValue',
    'onChange',
    'onShallowChange',
    '_addCallback',
    'reportChange',
    'setPropScope',
    'isWaitingForActionsToEnd',
    'setWaitingForActionsToEnd',
    'isRerenderCallbackSetted',
    'setRerenderCallback',
    'stopRerender',
    'setMounted',
    'waitingForActionsToEnd',
    'rerenderCallbackSubscription',
    'isMounted'
];

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
        dest: 'build/lib/index.js'
    }));
});

gulp.task('build', ['rollup'], () => {
    const result = uglify.minify('build/lib/index.js', {
        mangle: {
            toplevel: true
        },
        mangleProperties: {
            regex: new RegExp(`^(${innerMethods.join('|')})$`)
        }
    });

    fs.writeFile('build/lib/index.min.js', result.code);
});


gulp.task('copy', () => {
    gulp.src(['src/index.d.ts', 'package.json', 'LICENSE', 'README.md'])
        .pipe(gulp.dest('build/lib'));
});