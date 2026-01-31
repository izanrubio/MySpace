import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import prisma from '../lib/prisma.js'; // ← usa el singleton

// GitHub OAuth Strategy
passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL:
                process.env.GITHUB_CALLBACK_URL ||
                'http://localhost:3000/api/auth/github/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 1️⃣ Buscar usuario por GitHub ID
                let user = await prisma.user.findUnique({
                    where: { githubId: profile.id },
                });

                if (user) {
                    // Actualizar token y avatar si ya existe
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            githubAccessToken: accessToken,
                            githubUsername: profile.username,
                            avatarUrl: profile.photos?.[0]?.value,
                        },
                    });

                    return done(null, user);
                }

                // 2️⃣ Buscar por email si existe
                const email = profile.emails?.[0]?.value;

                if (email) {
                    user = await prisma.user.findUnique({
                        where: { email },
                    });
                }

                if (user) {
                    // Vincular cuenta GitHub a usuario existente
                    user = await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            githubId: profile.id,
                            githubUsername: profile.username,
                            githubAccessToken: accessToken,
                            avatarUrl: profile.photos?.[0]?.value,
                        },
                    });

                    return done(null, user);
                }

                // 3️⃣ Crear nuevo usuario
                user = await prisma.user.create({
                    data: {
                        email: email || `${profile.username}@github.user`,
                        name: profile.displayName || profile.username,
                        githubId: profile.id,
                        githubUsername: profile.username,
                        githubAccessToken: accessToken,
                        avatarUrl: profile.photos?.[0]?.value,
                    },
                });

                return done(null, user);
            } catch (error) {
                console.error('GitHub auth error:', error);
                return done(error, null);
            }
        }
    )
);

// Serialización del usuario
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
