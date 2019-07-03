authAsAdmin = () => {
    return async (req, res, next) => {
        try {
            let token = req.header('authorization');
            if (!token) throw new Error('Token not found.');
            let user = await req.model('user').findOne({ 'access_token.token': token, roles: 'admin' });
            if (user === null) throw new Error('User not found.');
            req.user = user;
            next();
        }
        catch (ex) {
            return next(ex);
        }
    }
}
module.exports = { authAsAdmin };