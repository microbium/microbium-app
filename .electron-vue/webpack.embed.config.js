'use strict'

process.env.BABEL_ENV = 'embed'

const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

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
      /*{
        test: /\.(js|vue)$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: {
          loader: 'eslint-loader',
          options: {
            formatter: require('eslint-friendly-formatter')
          }
        }
      },*/
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            extractCSS: process.env.NODE_ENV === 'production'
          }
        }
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.scss$/,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'vue-style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'vue-style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.html$/,
        use: 'vue-html-loader'
      },
      {
        test: /\.svg$/,
        loader: 'vue-svg-loader',
        options: {
          // optional [svgo](https://github.com/svg/svgo) options
          svgo: {
            plugins: [
              {removeDoctype: true},
              {removeComments: true}
            ]
          }
        }
      },
      {
        test: /\.(png|jpe?g|gif)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'imgs/[name]--[folder].[ext]'
          }
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name]--[folder].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]'
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
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin({ filename: 'styles.css' }),
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
      '@main': path.join(__dirname, '../src/main'),
      '@renderer': path.join(__dirname, '../src/renderer'),
      'vue$': 'vue/dist/vue.esm.js',
      'regl': '@microbium/regl'
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
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      generateStatsFile: true,
      reportFilename: 'stats-report.html',
      statsFilename: 'stats.json'
    })
  )
}

module.exports = embedConfig
