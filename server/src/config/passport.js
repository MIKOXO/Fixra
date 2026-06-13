import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findOrCreateGoogleUser } from '../services/auth.service.js';

const configurePassport = () => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    return passport;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('Google account does not expose an email address'));
          }

          const user = await findOrCreateGoogleUser({
            googleId: profile.id,
            email,
            name: profile.displayName || profile.name?.givenName || 'Google User',
            profile: {
              avatarUrl: profile.photos?.[0]?.value ?? null,
            },
          });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  return passport;
};

export default configurePassport;
