const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const {generateRandomString, getUserByEmail, urlsForUser} = require('./helper');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['S3cR3t'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));



/*
// DATA
*/
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync('123', 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync('123', 10)
  }
}

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};


//
//CONNECT TO SERVER
//
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});




//
//HOME
//
app.get("/", (req, res) => {
  res.redirect("/login");
});




//
//REGISTER
//
app.get("/register",(req,res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId]
  };
  res.render("register", templateVars);
});

app.post("/register", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString(6,"1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM");

  if (email === "" || password === ""){
    return res.status(404).send("Email and password cannot be empty");
  }
  const userEmail = getUserByEmail(users, email);
  if(userEmail) {
    return res.status(404).send("User already exists");
  }
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  req.session["user_id"] = id;
  res.redirect("/urls");
})



//
//LOGIN
//
app.get("/login", (req,res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId]
  };
  res.render("login", templateVars);
});

app.post("/login",(req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    return res.status(403).send("Email and password cannot be blank");
  }

  const user = getUserByEmail(users, email);
  if (!user) {
    return res.status(403).send("Email does not exist");
  }

  if(!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send("Password does not match")
  }
  
  req.session["user_id"] = user.id;
  res.redirect("/urls");
});

//
//LOGOUT
//
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});



//
//SHOWS SHORTURL AND LONGURL/ INDEX.EJS
//
app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const longURL = req.body.longURL;
  const shortURL = generateRandomString(6, "1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM");
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId]
  };

  if (!users[userId]) {
    res.status(403).send("Must be logged in to use the app. <br></br>Click <a href='/login'>here</a> to login.");
  }

  res.render("urls_index", templateVars);
});



//
//CREATE NEW URLS/ NEW.EJS
//
app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];  
  if (!users[userId]) {
    res.redirect("/login");
  } else {
    const templateVars = {
      urls: urlsForUser(userId, urlDatabase),
      user: users[userId]
    };
    res.render("urls_new", templateVars);
  }
});



//
//GETS/GENERATES SHORTURL AND EDITS LONGURL
//
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  const userID = req.session["user_id"];
  urlDatabase[shortURL] = { longURL, userID };

  if (!users[userID]) {
    res.status(400).send("You are not logged in.");
  }

  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session["user_id"];
  if (!urlDatabase[shortURL]) {
    res.status(404).send("This URL does not exist.");
  }
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL,
    user: users[userId]
  };
  if (userId !== urlDatabase[shortURL].userID) {
    return res.status(401).send("You do not have the permission to access this page.");
  }
  if (!userId) {
    return res.status(401).send("You do not have the permission to access this page.");
  }
  res.render("urls_show", templateVars);
});


//
//REDIRECTS SHORTURL TO LONGURL
//
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send("This URL does not exist.");
  } else {
    const longURL = urlDatabase[shortURL].longURL;
    res.status(302).redirect(longURL);
  }
});


app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});



//
//EDITS EXISTING URL
//
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});



//
//DELETES EXISTING URL
//
app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session["user_id"];
  const shortURL = req.params.shortURL;
  if (!users[userId]) {
    res.status(401).send("You don't have the permission to delete this.");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});






