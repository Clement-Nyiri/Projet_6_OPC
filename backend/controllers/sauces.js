const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  const SauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    id: SauceObject.id,
    userId: SauceObject.userId,
    name: SauceObject.name,
    manufacturer: SauceObject.manufacturer,
    description: SauceObject.description,
    mainPepper: SauceObject.mainPepper,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    heat: SauceObject.heat,
    likes: SauceObject.likes,
    dislikes: SauceObject.dislikes,
    usersLiked: SauceObject.usersLiked,
    usersDisliked: SauceObject.usersDisliked
  });
  sauce.save()
  .then(() => res.status(201).json({message: 'Votre sauce a bien été ajoutée!'}))
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
    .catch(error => res.status(400).json({error: error}));
};

exports.postLike = (req,res,next) =>{
  const userId = req.body.userId;
  const likes = req.body.likes;
  Sauce.findOne({_id: req.params.id})
  .then((sauce) =>{
    const tableauLike = sauce.userLiked;
    const tableauDislike = sauce.usersDisliked;
    const ilike = tableauLike.indexOf(userId)
    if(ilike != -1){
      tableauLike.splice(ilike, 1);
    }
    const idislike = tableauDislike.indexOf(userId)
    if(idislike != -1){
      tableauDislike.splice(idislike, 1);
    }
    
    if(likes = 1){

    }else if{likes = -1}

  })
  .catch(error =>res.status(500).json(error));

}


/*
fonction like: 
Avoir le userId -> req.body.userId OK

Avoir likes OK
si j'aime = 1, le user avec ce userId like
si j'aime = 0, le user annule son like/dislike
si j'aime = -1, le user avec ce userId dislike

le userId doit être ajouté/supprimé de userLiked[] ou userDisliked[]
un userId ne peut liker ou disliker qu'une fois
Le nombre de likes et dislikes doit être mis à jour avec chaque like
*/