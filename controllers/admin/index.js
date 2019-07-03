const login = async (req, res, next) => {
    const userObj = req.body;
    try {
        let user = await req.model('user').loginUser(userObj, 'admin');
        res.sendResponse({user}, 'User logged in successfully')
    }
    catch (ex) {
       next(ex);
    }
};
const seed = async (ctx) => {

};

module.exports = { login, seed };