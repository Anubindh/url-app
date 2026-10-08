const crypto = require('crypto');
const axios = require('axios');
const cheerio = require('cheerio');
const Link = require('../models/Link');

async function getWebsiteMetadata(url) {
  try {
    const response = await axios.get(url, {
      timeout: 8000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const $ = cheerio.load(response.data);

    const title =
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      'Saved Link';

    const description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const thumbnail =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    const parsedUrl = new URL(url);

    return {
      title: title.trim().substring(0, 150),
      description: description.trim().substring(0, 250),
      thumbnail,
      domain: parsedUrl.hostname.replace('www.', '')
    };
  } catch (error) {
    try {
      const parsedUrl = new URL(url);

      return {
        title: parsedUrl.hostname.replace('www.', ''),
        description: '',
        thumbnail: '',
        domain: parsedUrl.hostname.replace('www.', '')
      };
    } catch {
      return {
        title: 'Saved Link',
        description: '',
        thumbnail: '',
        domain: ''
      };
    }
  }
}

exports.getLinks = async (req, res) => {
  try {
    const links = await Link.find({ user: req.session.userId })
      .sort({ createdAt: -1 });

    const totalClicks = links.reduce(
      (sum, link) => sum + (link.clicks || 0),
      0
    );

    res.render('links', {
      links,
      totalClicks,
      pageTitle: 'Dashboard'
    });
  } catch (err) {
    console.error('Get links error:', err);

    res.render('links', {
      links: [],
      totalClicks: 0,
      pageTitle: 'Dashboard',
      error: 'Failed to load links'
    });
  }
};

exports.showAddForm = (req, res) => {
  res.render('add');
};

exports.addLink = async (req, res) => {
  const { url, note, tag } = req.body;

  try {
    let cleanUrl = url.trim();

    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }

    new URL(cleanUrl);

    const metadata = await getWebsiteMetadata(cleanUrl);

    const shortCode = crypto.randomBytes(4).toString('hex');

    await Link.create({
      url: cleanUrl,
      shortCode,
      title: metadata.title,
      description: metadata.description,
      thumbnail: metadata.thumbnail,
      domain: metadata.domain,
      note,
      tag,
      user: req.session.userId
    });

    res.redirect('/links');
  } catch (err) {
    console.error('Add link error:', err);

    res.render('add', {
      error: 'Please enter a valid URL'
    });
  }
};

exports.redirectLink = async (req, res) => {
  try {
    const link = await Link.findOneAndUpdate(
      { shortCode: req.params.shortCode },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!link) {
      return res.status(404).send('Short URL not found');
    }

    console.log(
      `Short URL ${link.shortCode} clicked. Total clicks: ${link.clicks}`
    );

    res.redirect(link.url);
  } catch (err) {
    console.error('Redirect error:', err);
    res.status(500).send('Server error');
  }
};

exports.deleteLink = async (req, res) => {
  try {
    await Link.deleteOne({
      _id: req.params.id,
      user: req.session.userId
    });

    res.redirect('/links');
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).send('Failed to delete link');
  }
};