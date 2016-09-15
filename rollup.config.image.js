import rollupBabel from 'rollup-plugin-babel';

export default {
  entry: 'image.js',
  plugins: [
    rollupBabel({
      babelrc: false,
      plugins: [
        'transform-async-to-generator',
        'external-helpers-2',
        'transform-class-properties',
      ],
    }),
  ],
  format: 'umd',
  targets: [{ dest: 'dist/image.js', format: 'cjs' }],
};
