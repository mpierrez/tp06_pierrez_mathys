const { checkJwt } = require("./jwtMiddleware.js");

module.exports = app => {
    const cakes = require("../controllers/cake.controllers.js");

    let router = require("express").Router();
    
    router.get("/", checkJwt, cakes.get);
    
    app.use('/api/cakes', router);
  };
