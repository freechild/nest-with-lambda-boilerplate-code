const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const WebPackIgnorePlugin =
{
  checkResource: function(resource)
  {
    const lazyImports =
    [
        '@nestjs/microservices',
        '@nestjs/microservices/microservices-module',
        'cache-manager',
        'class-transformer',
        'class-validator',
        'fastify-static',
    ];
  
    if (!lazyImports.includes(resource))
      return false;

    try
    {
      require.resolve(resource);
    }
    catch (err)
    {
      return true;
    }
  
    return false;
  }
};

module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  entry: slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal ? 'eval-cheap-module-source-map' : 'source-map',
  resolve: {
    alias: {
      '@env': path.resolve(__dirname, './env'),
    },
    extensions: ['.mjs', '.json', '.ts'],
    symlinks: false,
    cacheWithContext: false,
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  target: 'node',
  externals: [nodeExternals({
    modulesFromFile: true
  })],
  module: {
    rules: [
      // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.(tsx?)$/,
        loader: 'ts-loader',
        exclude: [
          [
            path.resolve(__dirname, 'node_modules'),
            path.resolve(__dirname, '.serverless'),
            path.resolve(__dirname, '.webpack'),
          ],
        ],
        options: {
          transpileOnly: true,
          experimentalWatchApi: true,
        },
      },
    ],
  },
  plugins: [
    new TsconfigPathsPlugin({ configFile: "./tsconfig.json" }),
  ],
};
