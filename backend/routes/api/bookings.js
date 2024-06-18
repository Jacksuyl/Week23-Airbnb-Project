const express = require('express');
const { Op,Booking, Review, ReviewImage, User, Spot, SpotImage,sequelize  } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');
const { check, validationResult } = require('express-validator');
const router = express.Router();

// 公共的错误处理函数
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Bad Request',
        errors: errors.mapped()
      });
    }
    next();
  };

  // 验证预订日期的验证器
const bookingValidators = [
    check('startDate')
      .exists({ checkFalsy: true })
      .withMessage('Start date is required')
      .isISO8601()
      .withMessage('Start date is invalid'),
    check('endDate')
      .exists({ checkFalsy: true })
      .withMessage('End date is required')
      .isISO8601()
      .withMessage('End date is invalid')
  ];

  //预订检查函数
  const checkBookingOwnership = async (req, res, next) => {
    const { bookingId } = req.params;
    const currentUser = req.user.id;
    const booking = await Booking.findByPk(bookingId);
  
    if (!booking) {
      return res.status(404).json({
        message: "Booking couldn't be found"
      });
    }
  
    if (booking.userId !== currentUser) {
      return res.status(403).json({
        message: 'Forbidden'
      });
    }
  
    req.booking = booking;
    next();
  };

  //预订日期冲突检查函数
  const checkBookingConflicts = async (spotId, startDate, endDate, bookingId = null) => {
    const whereCondition = {
      spotId,
      [sequelize.Op.or]: [
        {
          startDate: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        {
          endDate: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        {
          [sequelize.Op.and]: [
            {
              startDate: {
                [sequelize.Op.lte]: startDate
              }
            },
            {
              endDate: {
                [sequelize.Op.gte]: endDate
              }
            }
          ]
        }
      ]
    };
  
    if (bookingId) {
      whereCondition.id = { [sequelize.Op.ne]: bookingId };
    }
  
    const existingBookings = await Booking.findAll({ where: whereCondition });
    return existingBookings.length > 0;
  };

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

//edit booking
router.put('/:bookingId', requireAuth, bookingValidators, handleValidationErrors, checkBookingOwnership, async (req, res) => {
    const { startDate, endDate } = req.body;
    const booking = req.booking;
    const spotId = booking.spotId;
  
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        message: 'Bad Request',
        errors: {
          endDate: 'endDate cannot be on or before startDate'
        }
      });
    }
  
    if (new Date() > new Date(booking.endDate)) {
      return res.status(403).json({
        message: "Past bookings can't be modified"
      });
    }
  
    const hasConflicts = await checkBookingConflicts(spotId, startDate, endDate, booking.id);
    if (hasConflicts) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking"
        }
      });
    }
  
    await booking.update({ startDate, endDate });
  
    res.json(booking);
  });

  //delete booking
  router.delete('/:bookingId', requireAuth, async (req, res) => {
    const { bookingId } = req.params;
    const currentUser = req.user.id;
    const booking = await Booking.findByPk(bookingId);
  
    if (!booking) {
      return res.status(404).json({
        message: "Booking couldn't be found"
      });
    }
  
    const spot = await Spot.findByPk(booking.spotId);
  
    if (booking.userId !== currentUser && spot.ownerId !== currentUser) {
      return res.status(403).json({
        message: 'Forbidden'
      });
    }
  
    if (new Date() >= new Date(booking.startDate)) {
      return res.status(403).json({
        message: "Bookings that have been started can't be deleted"
      });
    }
  
    await booking.destroy();
  
    res.json({ message: "Successfully deleted" });
  });

module.exports = router;
