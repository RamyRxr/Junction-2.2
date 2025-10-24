module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            // Add WASM support
            webpackConfig.resolve.fallback = {
                ...webpackConfig.resolve.fallback,
                fs: false,
                path: false,
            };

            // Handle ffmpeg WASM files
            webpackConfig.module.rules.push({
                test: /\.wasm$/,
                type: 'javascript/auto',
                loader: 'file-loader',
                options: {
                    name: 'static/media/[name].[hash:8].[ext]',
                },
            });

            return webpackConfig;
        },
    },
};
