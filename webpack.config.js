// NOTE: By default webpack output directory is dist directory
// In this file all nodejs things can be used
const path = require('path');
const webpack = require('webpack');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const extractPlugin = new ExtractTextWebpackPlugin({
    filename:'all.css'
});

module.exports = {
    // entry can be string, javascript array for multiple entry points
    // or it can be object if we want to create certain alias
    entry: {
        app:'./src/js/app.js'
    },
    output: {
        // We use path package for output but not for entry
        // as output path cannot be relative path like entry path
        path:path.resolve(__dirname, 'dist'),
        filename:'bundle.js',
        // Default value of publicPath is /. webpack-dev-server cause 404 error if publicPath not specified.
        // Because it don't look for 'path' property, it only look for 'filename' by default. As here it finds
        // bundle.js, so it looks for this file /bundle.js, while it is in /dist/bundle.js, so we need to update public path
        // public path is not required, if we are keeping index.html also in dist, because in that case public path would be / which is default value
        //publicPath:'/dist'
    },
    module: {
        // Every import we made is module
        rules:[
            // To transform module, we have to set some rules
            {
                // test helps to identify module which has to be transformed
                // like here it will identify all the module(imported files) which has .css at its end
                test:/\.css$/,
                // Add loader which will transform the code. css-loader helps to import css in the javascript
                // css-loader will simply helps to resolve css imports, but not include css
                // This way is used when single loader has to be applied
                //loader:'css-loader'
                // As we require multiple loader to include css file, we do as:
                use: [
                    // Order is important here, and webpack execute loaders in reverse order. So as we need to execute
                    // css-loader before style-loader, so include it in last
                    // Importing the css code and add it to head section of the html code
                    'style-loader',
                    // To resolve css imports
                    'css-loader'
                ]
            },
            {
                test:/\.js$/,
                use: [
                    // we cannot simple mention babel-loader, but we will
                    // go with long form, as we need tell babel-loader that which preset to use
                    {
                        loader:'babel-loader',
                        options: {
                            presets:['es2015']
                        }
                    }
                ]
            },
            {
                test:/\.scss$/,
                use:extractPlugin.extract({
                    use:['css-loader', 'sass-loader']
                })
            },
            {
                // html-loader returns html string which is used by HTML Webpack Plugin to inject build artifacts
                test:/\.html$/,
                use:['html-loader']
            },
            {
                test:/\.(jpg|png)$/,
                use:[
                    {
                        loader:'file-loader',
                        options: {
                            name:'[name].[ext]',
                            // outputPath tells that where image should be kept
                            // path is relative to /dist directory(mentioned outside rules publicPath)
                            outputPath:'img/',
                            // publicPath tells that of what location html path reference should be changed. Mentioned
                            // path is relative to /dist directory(mentioned outside rules publicPath)
                            publicPath:'img/'
                        }
                    }
                ]
            },
            {
                // This rule will copy html in dist as they are except index.html and second.html(in which we are injecting bundles, css and images)
                test:/\.html$/,
                use:[
                    {
                        loader:'file-loader',
                        options:{
                            name:'[name].[ext]'
                        }
                    }
                ],
                exclude:[path.resolve(__dirname, 'src/index.html'), path.resolve(__dirname, 'src/second.html')]
            }
        ]
    },
    // To transform bundle code(instead of module), we use plugins
    plugins:[
        // Order not matters in plugins
        new CleanWebpackPlugin(['dist']),
        new webpack.ProvidePlugin({
            // Here we tell whenever in code encounter $,jQuery variable, then use jquery package to find its values
            $: 'jquery',
            jQuery: 'jQuery'
        }),
        // If we pass no template, then it will create dummy index.html in which bundle js files, css and scss files will be loaded
        // otherwise our template will be considered. It will still create index.html but with code in our template file
        new HtmlWebpackPlugin({
            filename:'index.html',
            template:'src/index.html',
            // For this html bundle formed from entry point app is injected
            chunks:['app']
        }),
        new HtmlWebpackPlugin({
            // If filename is not included, then second.html content will be merged in index.html, and seperate file will not be created
            filename:'second.html',
            template:'src/second.html',
            // chunks is used to tell that which build artifact should be included in .html
            // If this is not specified then all build artifacts will be included in .html
            // For now no build artifact will be included
            chunks:[]
        }),
        extractPlugin,
        new webpack.optimize.UglifyJsPlugin({
            // ... we can look on google for possible options
        })
    ]
};