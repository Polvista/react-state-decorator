import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/index.js',
    format: 'cjs',
    dest: 'build/index.js',
    plugins: [
        babel({
            babelrc: false,
            "presets":[
                [ "es2015", { "modules": false } ]
            ],
            "plugins": ["external-helpers"]
        })
    ]
};