const crypto    = require('crypto');
const ShortLink = require('../models/ShortLink');
const Visitor   = require('../models/Visitor');

const generateCode = () => crypto.randomBytes(4).toString('base64url').slice(0, 7);

// POST /api/links
const createLink = async (req, res, next) => {
  try {
    const { destinationUrl, campaignName, expiresAt } = req.body;
    if (!destinationUrl) return res.status(400).json({ success: false, message: 'destinationUrl required' });

    let code;
    let attempts = 0;
    do { code = generateCode(); attempts++; } while (await ShortLink.findOne({ code }) && attempts < 10);

    const link = await ShortLink.create({
      code, destinationUrl,
      campaignName: campaignName || '',
      expiresAt: expiresAt || null,
      createdBy: req.user?._id || null,
    });
    res.status(201).json({ success: true, data: link });
  } catch (err) { next(err); }
};

// GET /api/links  (admin)
const getLinks = async (req, res, next) => {
  try {
    const links = await ShortLink.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: links });
  } catch (err) { next(err); }
};

// GET /r/:code  (public redirect)
const redirect = async (req, res, next) => {
  try {
    const link = await ShortLink.findOne({ code: req.params.code });
    if (!link || !link.isActive) return res.status(404).json({ success: false, message: 'Link not found' });
    if (link.expiresAt && new Date() > link.expiresAt)
      return res.status(410).json({ success: false, message: 'Link expired' });

    await ShortLink.updateOne({ _id: link._id }, { $inc: { clicks: 1 } });
    res.redirect(link.destinationUrl);
  } catch (err) { next(err); }
};

module.exports = { createLink, getLinks, redirect };
