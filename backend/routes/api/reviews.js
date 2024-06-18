const express = require('express');
const { Review, ReviewImage, User, Spot, SpotImage } = require('../../db/models')
const { requireAuth } = require('../../utils/auth');
const { check, validationResult,param  } = require('express-validator');
const router = express.Router();

// get current user's review
router.get('/current', requireAuth, async (req, res) => {
  const currentUser = req.user.id;
  const reviews = await Review.findAll({
    where: { userId: currentUser },
    include: [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: Spot,
        attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price'],
        include: {
          model: SpotImage,
          attributes: ['url'],
          where: { preview: true },
          required: false
        }
      },
      {
        model: ReviewImage,
        attributes: ['id', 'url']
      }
    ]
  });

  const reviewList = reviews.map(review => {
    const reviewData = review.toJSON();
    if (reviewData.Spot && reviewData.Spot.SpotImages && reviewData.Spot.SpotImages.length > 0) {
      reviewData.Spot.previewImage = reviewData.Spot.SpotImages[0].url;
    } else {
      reviewData.Spot.previewImage = null;
    }
    delete reviewData.Spot.SpotImages;
    return reviewData;
  });

  res.json({ Reviews: reviewList });
});

// Add an Image to a Review based on the Review's id
router.post('/:reviewId/images', requireAuth, [
  check('url').exists({ checkFalsy: true }).withMessage('URL is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Bad Request',
      errors: errors.mapped()
    });
  }

  const { reviewId } = req.params;
  const { url } = req.body;
  const userId = req.user.id;

  const review = await Review.findByPk(reviewId);

  if (!review) {
    return res.status(404).json({ message: "Review couldn't be found" });
  }

  if (review.userId !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const imageCount = await ReviewImage.count({ where: { reviewId } });
  if (imageCount >= 10) {
    return res.status(403).json({ message: 'Maximum number of images for this resource was reached' });
  }

  const reviewImage = await ReviewImage.create({ reviewId, url });

  res.status(201).json(reviewImage);
});

//Edit a Review
router.put('/:reviewId', requireAuth, [
    param('reviewId').isInt().withMessage('Review ID must be an integer'),
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
  
    const { reviewId } = req.params;
    console.log(`Review ID: ${reviewId}`);  // 打印 reviewId 参数的值
    const { review, stars } = req.body;
    const userId = req.user.id;
  
    const existingReview = await Review.findByPk(reviewId);
  
    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
  
    if (existingReview.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  
    await existingReview.update({ review, stars });
  
    res.json(existingReview);
  });

//delete a review
router.delete('/:reviewId', requireAuth, [
    param('reviewId').isInt().withMessage('Review ID must be an integer')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Bad Request',
        errors: errors.mapped()
      });
    }
  
    const { reviewId } = req.params;
    const userId = req.user.id;
  
    const review = await Review.findByPk(reviewId);
  
    if (!review) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }
  
    if (review.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  
    await review.destroy();
  
    res.json({ message: "Successfully deleted" });
  });

module.exports = router;
