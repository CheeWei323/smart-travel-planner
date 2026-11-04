const Favorite = require("../models/Favorite");
const { fields, text, id, fail } = require("../utils/validation");
const addFavorite = async (req, res) => {
  fields(req.body, ["destination"]);
  const destination = text(req.body.destination, "Destination", 200);
  if (
    await Favorite.findOne({ destination, userId: req.user.id }).collation({
      locale: "en",
      strength: 2,
    })
  )
    fail("Already in favorites", 409);
  res
    .status(201)
    .json(await Favorite.create({ destination, userId: req.user.id }));
};
const getFavorites = async (req, res) =>
  res.json(
    await Favorite.find({ userId: req.user.id }).sort({ createdAt: -1 }),
  );
const deleteFavorite = async (req, res) => {
  if (
    !(await Favorite.findOneAndDelete({
      _id: id(req.params.id),
      userId: req.user.id,
    }))
  )
    fail("Favorite not found", 404);
  res.json({ message: "Favorite removed" });
};
module.exports = { addFavorite, getFavorites, deleteFavorite };
