const Admin = require('../models/Admin'); // Import Admin model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Admin SignUp Function
exports.adminSignUp = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).render('admin/signup', { // Chemin corrigé
        title: 'Inscription Admin',
        message: 'Admin already exists',
        messageType: 'danger',
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel admin
    const newAdmin = new Admin({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
    });

    // Sauvegarder l'admin dans MongoDB
    await newAdmin.save();

    // Générer le token JWT
    const token = jwt.sign({ id: newAdmin._id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Sauvegarder le token dans les cookies
    res.cookie('admin_token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

    req.user = newAdmin; // Ajouter l'admin à req.user

    // Redirection après l'inscription
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/signup', { // Chemin corrigé
      title: 'Inscription Admin',
      message: 'Server error. Please try again later.',
      messageType: 'danger',
    });
  }
};

// Admin Login Function
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Trouver l'admin par email
    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(400).render('admin/login', { // Chemin corrigé
        title: 'Connexion Admin',
        message: 'Invalid credentials',
        messageType: 'danger',
      });
    }

    // Comparer les mots de passe
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).render('admin/login', { // Chemin corrigé
        title: 'Connexion Admin',
        message: 'Invalid credentials',
        messageType: 'danger',
      });
    }

    // Générer le token JWT
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    // Sauvegarder le token dans les cookies
    res.cookie('admin_token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

    req.user = admin; // Ajouter l'admin à req.user

    // Redirection vers le dashboard admin
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).render('admin/login', { // Chemin corrigé
      title: 'Connexion Admin',
      message: 'Server error',
      messageType: 'danger',
    });
  }
};

// Admin Logout Function
exports.adminLogout = (req, res) => {
  res.clearCookie('admin_token'); // Supprimer le token JWT
  res.redirect('/admin/login'); // Redirection vers la page de connexion
};