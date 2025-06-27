const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");
const { withNativeWind } = require("nativewind/metro");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */

const defaultConfig = getDefaultConfig(__dirname);

const config = mergeConfig(defaultConfig, {
    transformer: {
        babelTransformerPath: require.resolve("react-native-svg-transformer"),
    },
    resolver: {
        assetExts: defaultConfig.resolver.assetExts.filter((ext) => ext !== "svg"),
        sourceExts: [...defaultConfig.resolver.sourceExts, "svg"],
    },
});

module.exports = withNativeWind(config, { input: "./global.css" });
