const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// SignUp Function
// SignUp Function
exports.signUp = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).render('auth/inscription', {
        title: 'Inscription', // Pass title
        message: 'User already exists',
        messageType: 'danger',
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save user to MongoDB
    await newUser.save();

    // Générer le token JWT
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Sauvegarder le token dans les cookies
    res.cookie('token', token, { httpOnly: true });

    // Ajoute l'utilisateur à req.user pour l'utiliser dans les futures requêtes
    req.user = newUser;

    // Rediriger vers la page d'accueil avec isLoggedIn à true
    res.render('home', {
      title: 'Documents',
      isLoggedIn: true, // L'utilisateur est connecté après l'inscription
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('auth/inscription', {
      title: 'Inscription', // Pass title
      message: 'Server error. Please try again later.',
      messageType: 'danger',
    });
  }
};





// Login Function
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render('auth/login', {
        title: 'Connexion',
        message: 'Invalid credentials',
        messageType: 'danger',
      });
    }

    // Comparer les mots de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('auth/login', {
        title: 'Connexion',
        message: 'Invalid credentials',
        messageType: 'danger',
      });
    }

    // Générer le token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Sauvegarder le token dans les cookies
    res.cookie('token', token, { httpOnly: true });

    // Ajoute l'utilisateur à req.user pour l'utiliser dans les futures requêtes
    req.user = user;

    // Rediriger vers la page d'accueil
    res.redirect('/'); // Redirection vers la page d'accueil
  } catch (err) {
    return res.status(500).render('auth/login', {
      title: 'Connexion',
      message: 'Server error',
      messageType: 'danger',
    });
  }
};




// Logout Function
exports.logout = (req, res) => {
  res.clearCookie('token');  // Clear the JWT token cookie
  res.render('home',{
    title:"home",
    isLoggedIn:false

  })
};
