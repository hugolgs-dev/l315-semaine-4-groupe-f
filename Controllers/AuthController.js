const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    res.status(201).render('pages/documents', {
      title: 'documents', // Pass title
  
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
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render('auth/login', {
       title: 'connexion', // Pass title
       message: 'Invalid credentials',
       messageType: 'danger',
     });      
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render('auth/login', {
       title: 'connexion', // Pass title
       message: 'Invalid credentials',
       messageType: 'danger',
     });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.cookie('token', token, { httpOnly: true })

    res.status(201).render('pages/documents', {
      title: 'documents', // Pass title
    });


  } catch (err) {
    return res.status(500).render('auth/login', {
      title: 'connexion', // Pass title
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
