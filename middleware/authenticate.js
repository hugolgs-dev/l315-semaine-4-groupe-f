const jwt = require('jsonwebtoken');

// middleware d'authentification
const authenticate = (req, res, next) => {
    const token = req.cookies.token;  // vérifie si un token existe dans les cookies
    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);  // vérifie et décode le token
            req.user = decoded;  // ajoute l'utilisateur décodé à la requête
        } catch (err) {
            console.error('Token invalide', err);  // affiche une erreur si le token est invalide
        }
    }
    next();  // continue vers la prochaine étape, même si l'utilisateur n'est pas authentifié
};

module.exports = authenticate;
