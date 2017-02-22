import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/index.js',
    format: 'cjs',
    dest: 'build/index.js',
    plugins: [
        babel()
    ]
};