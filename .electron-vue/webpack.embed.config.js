'use strict'

process.env.BABEL_ENV = 'embed'

const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const BabiliWebpackPlugin = require('babili-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const { version } = require('../package.json')
const whiteListedModules = ['vue', 'events']

const embedConfig = {
  devtool: '#cheap-module-eval-source-map',
  stats: 'verbose',
  entry: {
    embed: path.join(__dirname, '../src/renderer/embed.js')
  },
  module: {
    rules: [
      {
        test: /\.(js|vue)$/,
        enforce: 'pre',
        exclude: /node_modules|Libraries/, // Hacky fix for linked libs
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.html$/,
        use: 'vue-html-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: [ path.resolve(__dirname, '../src/renderer') ],
        exclude: /node_modules/
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: true,
            loaders: {
              sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax=1',
              scss: 'vue-style-loader!css-loader!sass-loader'
            }
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name].[ext]'
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name].[ext]'
          }
        }
      },
      {
        test: /\.(glsl|frag|vert)$/,
        use: 'raw-loader'
      },
      {
        test: /\.(glsl|frag|vert)$/,
        use: 'glslify-loader'
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css'),
    new webpack.DefinePlugin({
      'process.env.IS_WEB': 'true'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  output: {
    filename: `[name]-${version}.js`,
    path: path.join(__dirname, '../dist/embed'),
    library: 'MicrobiumEmbed',
    libraryTarget: 'var'
  },
  resolve: {
    alias: {
      '@root': path.join(__dirname, '../'),
      '@src': path.join(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.json', '.css']
  },
  target: 'web'
}

// Development (embed)
if (process.env.NODE_ENV !== 'production' &&
  process.env.BUILD_TARGET === 'embed') {
  const fixtureName = process.env.SCENE_FIXTURE

  embedConfig.plugins.push(
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, '../src/embed.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true
      },
      sceneData: fs.readFileSync(path.resolve(__dirname,
        `../test/fixtures/scene-${fixtureName}.json`))
    }))
}

// Production
if (process.env.NODE_ENV === 'production') {
  embedConfig.devtool = ''

  embedConfig.plugins.push(
    new BabiliWebpackPlugin(),
    new UglifyJsPlugin({
      sourceMap: false,
      parallel: true,
      extractComments: true,
      uglifyOptions: {
        ecma: 5,
        mangle: {
          safari10: true
        }
      }
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true,
      reportFilename: 'stats-report.html',
      statsFilename: 'stats.json'
    })
  )
}

module.exports = embedConfig
