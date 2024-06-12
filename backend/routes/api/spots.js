const express = require('express');
const { Spot, Review, SpotImage, User, sequelize } = require('../../db/models');
const router = express.Router();

// 获取所有 Spots
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

// 获取指定 Spot
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
        as: 'Owner',
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

// 创建新的 Spot
router.post('/', async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price, ownerId } = req.body;
  const spot = await Spot.create({ address, city, state, country, lat, lng, name, description, price, ownerId });
  res.status(201).json(spot);
});

// 更新指定 Spot
router.put('/:spotId', async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId);
  if (spot) {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    await spot.update({ address, city, state, country, lat, lng, name, description, price });
    res.json(spot);
  } else {
    res.status(404).json({ message: "Spot couldn't be found" });
  }
});

// 删除指定 Spot
router.delete('/:spotId', async (req, res) => {
  const spot = await Spot.findByPk(req.params.spotId);
  if (spot) {
    await spot.destroy();
    res.json({ message: "Successfully deleted" });
  } else {
    res.status(404).json({ message: "Spot couldn't be found" });
  }
});

module.exports = router;
