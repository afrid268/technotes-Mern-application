const User = require('../models/UserSchema')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

const login = asyncHandler(async(req,res)=>{
const {username , password } = req.body

    if(!username || !password){
        return res.status(400).json({message: 'All fields are required'})
    }

    const foundUser = await User.findOne({ user_name : username }).exec()

    if(!foundUser || !foundUser.active_user){
        return res.status(401).json({message : 'Unauthorized'})
    }

    const match = await bcrypt.compare(password , foundUser.user_password)

    if(!match){
        return res.status(401).json({message : 'Unauthorized'})
    }

    const accessToken = jwt.sign(
        {
        "UserInfo":{
            "username" : foundUser.user_name,
            "roles" : foundUser.user_roles
        }
    },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn:'1d'}
    )

    const refreshToken = jwt.sign(
        {"username" : foundUser.user_name,},
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn:'7d'}
    )

    //create secure cookie with refresh token
    res.cookie('jwt',refreshToken, {
        httpOnly : true , //accessible only by web server
        secure : true , //https
        sameSite : 'None' , //cross site cookie
        maxAge : 7 * 24 * 60 * 60 * 1000 //cookie expiry  , match refresh token expiry
    })

    res.json({ accessToken })

})


const refresh = (req , res) => {

    const cookies = req.cookies
    
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        asyncHandler(async (err, decoded) => {

            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ user_name: decoded.username }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.user_name,
                        "roles": foundUser.user_roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1d' }
            )

            res.json({ accessToken })
        })
    )
}

const logout = asyncHandler(async(req,res)=>{
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(204) //No content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.json({ message: 'Cookie cleared' })
})

module.exports = {
    login,
    refresh,
    logout
}
