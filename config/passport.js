var passport = require('passport');
var passportJWT = require('passport-jwt');
var JwtStrategy = passportJWT.Strategy;
var ExtractJwt = passportJWT.ExtractJwt;
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET; 

var LocalStrategy = require('passport-local').Strategy;
const db  = require('../database/db');
const helpers = require('./helpers');

passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    if (jwt_payload.admin != 1) {

        var checkToken = await db.Oauth.findOne({
            where: {
                id: jwt_payload.id,
                email: jwt_payload.email,
                iat: jwt_payload.iat,
                exp: jwt_payload.exp,
            }
        });
    
        if (!checkToken) {
            console.log('112')
            return done({
                message: "Unauthorized"
            });
        }

        await db.User.findOne({ where: { id: jwt_payload.id } })
            .then(user => {
                if (!user) {
                    console.log('223')
                    return done({
                        message: "Unauthorized"
                    });
                }

                return done(null, user)
            })
            .catch(err => {

                console.log('334')
                return done({
                    message: "Unauthorized"
                });
            });
    } else {
        var checkToken = await db.Oauth.findOne({
            where: {
                id: jwt_payload.id,
                email: jwt_payload.email,
                iat: jwt_payload.iat,
                exp: jwt_payload.exp,
            }
        });
    
        if (!checkToken) {
            return done({
                message: "Unauthorized"
            });
        }

        await db.Admin.findOne({ where: { id: jwt_payload.id } })
            .then(user => {
                if (!user) {
                    return done({
                        message: "Unauthorized"
                    });
                }

                return done(null, user)
            })
            .catch(err => {

                return done({
                    message: "Unauthorized"
                });
            });
    }
}));

passport.use(new LocalStrategy({
    usernameField: 'mobile'
}, async (email, password, done) => {

    try
    {
        const user = await db.User.findOne({ where: {mobile: mobile }});
    
        if(!user)
        {
            return done({ message: 'Mobile is invalid'});
        }

        return done(null, user);

    }
    catch(err)
    {
        return done({ message: 'Mobile is invalid'});
    }
    
}));