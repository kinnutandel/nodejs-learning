exports.get404 = (req, res, nexr) => {
    res.status(404).render('404', {
        pageTitle: '404',
        path: '/404',
        isAuthenticated: req.session.isLoggedIn
    });
};