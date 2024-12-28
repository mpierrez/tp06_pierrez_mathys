const { ACCESS_TOKEN_SECRET }  = require ("../config.js");

const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
    return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: '365d' });
}

function getUserFromToken(req) {
  const userId = req.user.id;
  const user = users.find(user => user.id === userId);
  return user;
}

const users = [
  {
    id: 1,
    lastname: "PIERREZ",
    firstname: "Mathys",
    login: "mpierrez",
    password: "abc",
    email: "mpierrez@cfai-formation.fr"
  },
  {
    id: 2,
    lastname: "MAURICE",
    firstname: "Emmanuel",
    login: "emaurice",
    password: "web",
    email: "emmanuel.maurice@gmail.com"

  }
];

exports.get = (req, res) => {
  res.status(200).send(users);
};

exports.login = (req, res) => {
  const { login, password } = req.body;
  let pattern = /^[A-Za-z0-9]{1,20}$/;
  if (pattern.test(login) && pattern.test(password)) {
    const user = users.find(user => user.login == login && user.password == password);
    if (user) {
      const accessToken = generateAccessToken(user);
      res.status(200).send({ accessToken });
    } else {
      res.status(404).send("Le login ou le mot de passe est incorrect");
    }
  } else {
    res.status(400).send("Le login et le mot de passe doivent être alphanumériques et inférieurs à 20 caractères");
  }
};

exports.register = (req, res) => {
  const utilisateur = {
    lastname: req.body.lastname,
    firstname: req.body.firstname,
    login: req.body.login,
    password: req.body.password,
    email: req.body.email
  };

  let pattern = /^[A-Za-z0-9]{1,20}$/;
  if (pattern.test(utilisateur.login) && pattern.test(utilisateur.password)) {
    let loginAlreadyExists = users.find(user => user.login == utilisateur.login);
    if (loginAlreadyExists) {
      res.status(401).send("Ce login existe déjà");
    } else {
      utilisateur.id = users.length + 1;
      users.push(utilisateur);
      const accessToken = generateAccessToken(user);
      res.status(200).send({ accessToken });
    }
  } else {
    res.status(400).send("Le login et le mot de passe doivent être alphanumériques et inférieurs à 20 caractères");
  }
}

exports.getUserFromToken = (req, res) => {
  const user = getUserFromToken(req);
  if (!user) {
      return res.status(404).json({ message: 'Utilisateur inexistant' });
  }
  res.json(user);
};

exports.updateUser = (req, res) => {
  const user = getUserFromToken(req);
  if (!user) {
      return res.status(404).json({ message: 'Utilisateur inexistant' });
  }
  user.lastname = req.body.lastname;
  user.firstname = req.body.firstname;
  user.email = req.body.email;
  user.login = req.body.login;
  user.password = req.body.password;
  res.json(user);
};

