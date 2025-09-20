const User = require('../models/User');


exports.showRegister = (req, res) => {
  res.render('auth/register');
};

// Register new user
exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await User.findOne({ username });
    if (userExists) return res.render('auth/register', { error: 'Username taken' });
    const user = new User({ username, password });
    await user.save();
    req.session.userId = user._id;
    res.redirect('/links');
  } catch (err) {
    res.render('auth/register', { error: 'Something went wrong' });
  }
};


exports.showLogin = (req, res) => {
  res.render('auth/login');
};

// Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.render('auth/login', { error: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.render('auth/login', { error: 'Invalid credentials' });
    req.session.userId = user._id;
    res.redirect('/links');
  } catch (err) {
    res.render('auth/login', { error: 'Something went wrong' });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};
