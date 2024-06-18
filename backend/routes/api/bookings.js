const express = require('express');
const { Booking, Review, ReviewImage, User, Spot, SpotImage,sequelize  } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');
const router = express.Router();

// Get all of the Current User's Bookings
router.get('/current', requireAuth, async (req, res) => {
  const currentUser = req.user.id;
  const bookings = await Booking.findAll({
    where: { userId: currentUser },
    include: [
      {
        model: Spot,
        attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
        include: {
          model: SpotImage,
          attributes: ['url'],
          where: { preview: true },
          required: false
        }
      }
    ]
  });

  const bookingList = bookings.map(booking => {
    const bookingData = booking.toJSON();
    if (bookingData.Spot && bookingData.Spot.SpotImages && bookingData.Spot.SpotImages.length > 0) {
      bookingData.Spot.previewImage = bookingData.Spot.SpotImages[0].url;
    } else {
      bookingData.Spot.previewImage = null;
    }
    delete bookingData.Spot.SpotImages;
    return bookingData;
  });

  
  res.json({ Bookings: bookingList });
});

module.exports = router;
