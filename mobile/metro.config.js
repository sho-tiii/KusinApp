const { getDefaultConfig } = require("expo/metro-config");
const http = require("http");

/**
 * Sanitize incoming 'X-Forwarded-Proto: exp' and 'Forwarded: ...;proto=exp'
 * headers sent by newer Expo Go iOS clients so that @expo/cli always resolves
 * http/https bundle URLs instead of throwing:
 * "Warning: Unable to resolve manifest assets. Icons and fonts might not work.
 *  Cannot read properties of null (reading '0')."
 */
if (!http.Server.prototype.__kusinappHeaderSanitizerInstalled) {
  const originalEmit = http.Server.prototype.emit;
  http.Server.prototype.emit = function (event, req, ...args) {
    if (event === "request" && req && req.headers) {
      const forwardedProto = req.headers["x-forwarded-proto"];
      if (forwardedProto === "exp") {
        req.headers["x-forwarded-proto"] = "http";
      } else if (forwardedProto === "exps") {
        req.headers["x-forwarded-proto"] = "https";
      }

      if (typeof req.headers["forwarded"] === "string") {
        req.headers["forwarded"] = req.headers["forwarded"]
          .replace(/proto=exps\b/gi, "proto=https")
          .replace(/proto=exp\b/gi, "proto=http");
      }
    }
    return originalEmit.call(this, event, req, ...args);
  };
  http.Server.prototype.__kusinappHeaderSanitizerInstalled = true;
}

const config = getDefaultConfig(__dirname);

config.resolver = config.resolver || {};
config.resolver.sourceExts = Array.from(
  new Set([...(config.resolver.sourceExts || []), "cjs"])
);
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
