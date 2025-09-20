const Link = require('../models/Link');


exports.getLinks = async (req, res) => {
  const links = await Link.find({ user: req.session.userId }).sort({ createdAt: -1 });
  res.render('links', { links });
};


exports.showAddForm = (req, res) => {
  res.render('add');
};


exports.addLink = async (req, res) => {
  const { url, note, tag } = req.body;
  try {
    await Link.create({ url, note, tag, user: req.session.userId });
    res.redirect('/links');
  } catch (err) {
    res.render('add', { error: 'Failed to add link' });
  }
};


exports.deleteLink = async (req, res) => {
  await Link.deleteOne({ _id: req.params.id, user: req.session.userId });
  res.redirect('/links');
};
