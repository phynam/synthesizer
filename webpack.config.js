const path = require('path');

module.exports = {
    entry: "./src/app.js",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    output: {
        filename: "./app.js"
    },
    resolve: {
        alias: {
            components: path.resolve(__dirname, 'src/components/'),
            base: path.resolve(__dirname, 'src/base/'),
            pianoRoll: path.resolve(__dirname, 'src/components/piano-roll'),
            app: path.resolve(__dirname, 'src/')
        }
    }
};