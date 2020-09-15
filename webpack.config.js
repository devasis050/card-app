
var path = require('path');

module.exports = {
    entry : './index.js',
    output : 
    {
        path : path.resolve(__dirname,'dist'),
        filename: 'bundle.js',
        publicPath : '/dist/'
    },
    module : 
    {
        rules : [
            {
                exclude : /node-modules/,
                use : {
                    loader : 'babel-loader'
                }
            }
        ]
    },
    devServer : 
    {
        port:3000,
        historyApiFallback:true
    }

}