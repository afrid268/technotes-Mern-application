const rateLimit = require('express-rate-limit')
const { logEvents } = require('./logger')

const loginLimiter = rateLimit({
    windowMs : 60 * 1000 , //1 minute
    max : 5, //limit each ip to 5 login requests pe window per minute
    message:
            {message : 'Too many login attempts from this IP , please try again after 60 seconds'},
            handler :(req,res,next,options) => {
                logEvents(`Too many Requests: $(options.message.message)\t${req.method}\t${req.url}\t${req.headers.origin}`,'errLog.log')
                res.status(options.statusCode).send(options.message)
            },
            standardHeaders :true,//returns rate limit info in RateLimit headers
            legacyHeaders : false,//disables the x-RateLimit headers
})

module.exports = loginLimiter