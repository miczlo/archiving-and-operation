/*
 Copyright 2020 Siemens AG
This file is subject to the terms and conditions of the MIT License.  
See LICENSE file in the top-level directory.
*/

/*#################################
    Requirements 
#################################*/
const API_SECURITY = require('./global').API_SECURITY

/*#################################
    Check Authorization
#################################*/
module.exports = (req, res, next) => {
    if (req.headers.username === API_SECURITY.USERNAME && req.headers.password === API_SECURITY.PASSWORD) {
        next()
    } else {
        res.status(401).send('unauthorized')
    }
}