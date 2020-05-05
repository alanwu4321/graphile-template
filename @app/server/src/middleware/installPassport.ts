import { Express } from "express";
import { get } from "lodash";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";

import { getWebsocketMiddlewares } from "../app";
import installPassportStrategy from "./installPassportStrategy";

var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;

interface DbSession {
  session_id: string;
}

declare global {
  namespace Express {
    interface User {
      session_id: string;
    }
  }
}

export default async (app: Express) => {
  passport.serializeUser((sessionObject: DbSession, done) => {
    done(null, sessionObject.session_id);
  });

  passport.deserializeUser((session_id: string, done) => {
    done(null, { session_id });
  });

  const passportInitializeMiddleware = passport.initialize();
  app.use(passportInitializeMiddleware);
  getWebsocketMiddlewares(app).push(passportInitializeMiddleware);

  const passportSessionMiddleware = passport.session();
  app.use(passportSessionMiddleware);
  getWebsocketMiddlewares(app).push(passportSessionMiddleware);

  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });

  if (process.env.FACEBOOK_KEY) {
    await installPassportStrategy(
      app,
      "facebook",
      FacebookStrategy,
      {
        clientID: process.env.FACEBOOK_KEY,
        clientSecret: process.env.FACEBOOK_SECRET,
        scope: ["public_profile", "email"],
      },
      {},
      async (profile, _accessToken, _refreshToken, _extra, _req) => ({
        id: profile.id,
        displayName: profile.displayName || "",
        username: profile.username,
        avatarUrl: get(profile, "photos.0.value"),
        email: profile.email || get(profile, "emails.0.value"),
      }),
      ["token", "tokenSecret"]
    );
  }

  if (process.env.GOOGLE_KEY) {
    await installPassportStrategy(
      app,
      "google",
      GoogleStrategy,
      {
        clientID: process.env.GOOGLE_KEY,
        clientSecret: process.env.GOOGLE_SECRET,
        scope: ["email", "profile"],
      },
      {},
      async (profile, _accessToken, _refreshToken, _extra, _req) => ({
        id: profile.id,
        displayName: profile.displayName || "",
        username: profile.username,
        avatarUrl: get(profile, "photos.0.value"),
        email: profile.email || get(profile, "emails.0.value"),
      }),
      ["token", "tokenSecret"]
    );
  }

  if (process.env.GITHUB_KEY) {
    await installPassportStrategy(
      app,
      "github",
      GitHubStrategy,
      {
        clientID: process.env.GITHUB_KEY,
        clientSecret: process.env.GITHUB_SECRET,
        scope: ["user:email"],
      },
      {},
      async (profile, _accessToken, _refreshToken, _extra, _req) => ({
        id: profile.id,
        displayName: profile.displayName || "",
        username: profile.username,
        avatarUrl: get(profile, "photos.0.value"),
        email: profile.email || get(profile, "emails.0.value"),
      }),
      ["token", "tokenSecret"]
    );
  }
};
