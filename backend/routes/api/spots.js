const express = require('express');
const { Spot, Review, SpotImage, User,ReviewImage, sequelize } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');
const { check, validationResult } = require('express-validator');
const router = express.Router();

// 公共的 Spot 验证器
const spotValidators = [
  check('address').exists({ checkFalsy: true }).withMessage('Street address is required'),
  check('city').exists({ checkFalsy: true }).withMessage('City is required'),
  check('state').exists({ checkFalsy: true }).withMessage('State is required'),
  check('country').exists({ checkFalsy: true }).withMessage('Country is required'),
  check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
  check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
  check('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
  check('description').exists({ checkFalsy: true }).withMessage('Description is required'),
  check('price').isFloat({ gt: 0 }).withMessage('Price per day must be a positive number')
];

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

// 公共的 Spot 权限检查函数
const checkSpotOwnership = async (req, res, next) => {
  const { spotId } = req.params;
  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found"
    });
  }

  if (spot.ownerId !== req.user.id) {
    return res.status(403).json({
      message: 'Forbidden'
    });
  }

  req.spot = spot;
  next();
};

// Get all Spots
router.get('/', async (req, res) => {
  const spots = await Spot.findAll({
    include: [
      {
        model: Review,
        attributes: []
      },
      {
        model: SpotImage,
        attributes: ['url']
      }
    ],
    attributes: {
      include: [
        [
          sequelize.fn('AVG', sequelize.col('Reviews.stars')),
          'avgRating'
        ]
      ]
    },
    group: ['Spot.id', 'SpotImages.url']
  });

  const spotList = spots.map(spot => {
    const spotData = spot.toJSON();
    spotData.previewImage = spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
    delete spotData.SpotImages;
    return spotData;
  });

  res.json({ Spots: spotList });
});

// Get all Spots owned by the Current User
router.get('/current', requireAuth, async (req, res) => {
  const currentUser = req.user.id;
  const spots = await Spot.findAll({
    where: { ownerId: currentUser },
    include: [
      {
        model: Review,
        attributes: []
      },
      {
        model: SpotImage,
        attributes: ['url']
      }
    ],
    attributes: {
      include: [
        [
          sequelize.fn('AVG', sequelize.col('Reviews.stars')),
          'avgRating'
        ]
      ]
    },
    group: ['Spot.id', 'SpotImages.url']
  });

  const spotList = spots.map(spot => {
    const spotData = spot.toJSON();
    spotData.previewImage = spotData.SpotImages.length > 0 ? spotData.SpotImages[0].url : null;
    delete spotData.SpotImages;
    return spotData;
  });

  res.json({ Spots: spotList });
});

// Get details of a Spot from an id
router.get('/:spotId', async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId, {
    include: [
      {
        model: Review,
        attributes: ['id', 'userId', 'review', 'stars', 'createdAt', 'updatedAt'],
        include: {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        }
      },
      {
        model: SpotImage,
        attributes: ['id', 'url', 'preview']
      },
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      }
    ]
  });

  if (spot) {
    const spotData = spot.toJSON();
    spotData.numReviews = spotData.Reviews.length;
    spotData.avgStarRating = spotData.Reviews.reduce((acc, review) => acc + review.stars, 0) / spotData.numReviews;
    res.json(spotData);
  } else {
    res.status(404).json({ message: "Spot couldn't be found" });
  }
});

// Create a Spot
router.post('/', requireAuth, spotValidators, handleValidationErrors, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const ownerId = req.user.id;  // 使用当前登录用户的ID作为ownerId

  const spot = await Spot.create({ address, city, state, country, lat, lng, name, description, price, ownerId });

  res.status(201).json(spot);
});

// Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', requireAuth, [
  check('url').exists({ checkFalsy: true }).withMessage('URL is required'),
  check('preview').isBoolean().withMessage('Preview must be a boolean')
], handleValidationErrors, checkSpotOwnership, async (req, res) => {
  const { url, preview } = req.body;
  const { spotId } = req.params;

  const spotImage = await SpotImage.create({ spotId, url, preview });

  res.status(201).json(spotImage);
});

// Edit a Spot
router.put('/:spotId', requireAuth, spotValidators, handleValidationErrors, checkSpotOwnership, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  await req.spot.update({ address, city, state, country, lat, lng, name, description, price });

  res.json(req.spot);
});

// delete Spot
router.delete('/:spotId', requireAuth, checkSpotOwnership, async (req, res) => {
  await req.spot.destroy();
  res.json({ message: "Successfully deleted" });
});

//Get all Reviews by a Spot's id
router.get('/:spotId/reviews', async (req, res) => {
  const spotId = req.params.spotId;
  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const reviews = await Review.findAll({
    where: { spotId },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: ReviewImage,
        attributes: ['id', 'url']
      }
    ]
  });

  res.json({ Reviews: reviews });
});

//Create a Review for a Spot based on the Spot's id(need fix)
router.post('/:spotId/reviews', requireAuth, [
  check('review').exists({ checkFalsy: true }).withMessage('Review text is required'),
  check('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be an integer from 1 to 5')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Bad Request',
      errors: errors.mapped()
    });
  }

  const { spotId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    return res.status(404).json({ message: "Spot couldn't be found" });
  }

  const existingReview = await Review.findOne({
    where: { spotId, userId }
  });

  if (existingReview) {
    return res.status(500).json({
      message: "User already has a review for this spot"
    });
  }

  const newReview = await Review.create({
    userId,
    spotId,
    review,
    stars
  });

  res.status(201).json(newReview);
});


//Add an Image to a Review based on the Review's id



module.exports = router;
