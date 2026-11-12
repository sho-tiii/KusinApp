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

/**
 * Workaround for Firebase "dual-package hazard" in Expo / React Native:
 * Metro loads Firebase Web ESM for `firebase/*` imports while `@firebase/auth`
 * uses CJS `require('@firebase/app')`, resulting in duplicate instances of @firebase/app
 * and "Error: Component auth has not been registered yet".
 *
 * By intercepting `firebase/*` and `@firebase/*` and enforcing `isESMImport: false`,
 * Metro loads the unified React Native CJS entry points for all Firebase modules so
 * `app`, `auth`, and `database` share the exact same singleton component container.
 */
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "firebase/app") {
    return context.resolveRequest(
      { ...context, isESMImport: false },
      "@firebase/app",
      platform
    );
  }
  if (moduleName === "firebase/auth") {
    return context.resolveRequest(
      { ...context, isESMImport: false },
      "@firebase/auth",
      platform
    );
  }
  if (moduleName === "firebase/database") {
    return context.resolveRequest(
      { ...context, isESMImport: false },
      "@firebase/database",
      platform
    );
  }
  if (moduleName.startsWith("@firebase/")) {
    return context.resolveRequest(
      { ...context, isESMImport: false },
      moduleName,
      platform
    );
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
