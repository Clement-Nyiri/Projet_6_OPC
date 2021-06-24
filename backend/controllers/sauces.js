const Sauce = require('../models/sauce');
const fs = require('fs');
const sauce = require('../models/sauce');

exports.createSauce = (req, res, next) => {
  const SauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    userId: SauceObject.userId,
    name: SauceObject.name,
    manufacturer: SauceObject.manufacturer,
    description: SauceObject.description,
    mainPepper: SauceObject.mainPepper,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    heat: SauceObject.heat,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save()
  .then((sauce) => res.status(201).json({sauce}))
  .catch(error => res.status(400).json({error: error}));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body}
    const sauce = new Sauce({
      id: req.body.id,
      userId: req.body.userId,
      name: req.body.name,
      manufacturer: req.body.manufacturer,
      description: req.body.description,
      mainPepper: req.body.mainPepper,
      imageUrl: req.body.imageUrl,
      heat: req.body.heat,
      likes: req.body.likes,
      dislikes: req.body.dislikes,
      usersLiked: req.body.usersLiked,
      usersDisliked: req.body.usersDisliked
    });
    Sauce.updateOne({_id: req.params.id}, {...sauceObject, _id: req.params.id})
    .then(() => res.status(201).json({ message: 'Sauce mise à jour avec succès!'}))
    .catch(error => res.status(400).json({error: error}));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
    .then((sauce) =>res.status(200).json(sauce))
    .catch(error => res.status(404).json({error: error}));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then(sauce =>{
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () =>{
        Sauce.deleteOne({_id: req.params.id})
        .then(() => res.status(200).json({message: 'Sauce supprimée!'}))
        .catch(error => res.status(400).json({error: error}));
      });
    })
    .catch(error => res.status(500).json({error}))
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch(error => res.status(418).json({error: error}));
};

exports.postLike = (req,res,next) =>{
  const userId = req.body.userId;
  const likeUser = req.body.like;
  Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      const ilike = sauce.usersLiked.indexOf(userId)
      if(ilike != -1){
        sauce.usersLiked.splice(ilike, 1); // On l'enlève du tableau;
        sauce.likes=sauce.likes-1;
      };
      // On récupère l'indice de l'utilisateur dans le tableau dislike
      const idislike = sauce.usersDisliked.indexOf(userId);
      if(idislike != -1){
        sauce.usersDisliked.splice(idislike, 1); // On l'enlève du tableau
        sauce.dislikes=sauce.dislikes-1;
      };
      if(likeUser == 1){
        sauce.usersLiked.push(userId);//Ensuite, si le user aime, on le rajoute au tableau like
        sauce.likes = sauce.likes+1;
      };
      if(likeUser == -1){
        sauce.usersDisliked.push(userId); //Ensuite, si le user n'aime pas, on le rajoute au tableau dislike
        sauce.dislikes = sauce.dislikes+1;
      };
      sauce.save()
      res.status(200).json(sauce)})
    .catch(error => res.status(518).json({error: error}));
};