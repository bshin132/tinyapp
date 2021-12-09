const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");

function generateRandomString(len, arr) {
  let result = '';
  for (let i = len; i > 0; i--) {
      result += arr[Math.floor(Math.random() * arr.length)];
  }
  return result;
}


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function getUserByEmail(email) {
  for(const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  
  const userCookie = req.cookies["user_id"];
  console.log('cokkie',userCookie)
  const templateVars = { 
    urls: urlDatabase,
    //user[userRandomID]
    //user[user2@example.com] <== cookie
    email: users?.[userCookie]?.['email'] || ''
  };
  res.render("urls_index", templateVars);
}); 

app.get("/urls/new", (req, res) => {
  const userCookie = req.cookies["user_id"];

  const templateVars = { 
    email: users?.[userCookie]?.['email'] || ''
  };
  res.render("urls_new", templateVars);
});

app.get("/register",(req,res) => {
  res.render("register");
});

app.post("/register", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === ""){
    return res.status(404).send("Email and password cannot be empty");
  }
  
  if(getUserByEmail(email)) {
    return res.status(404).send("User already exists");
  }

  const id = generateRandomString(6,'1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM');

  const user = {id, email, password}
  users[id] = user;
  res.cookie('user_id', id);
  res.redirect("/urls");
})

app.get("/urls/:shortURL", (req, res) => {
  const userCookie = req.cookies["user_id"];
  const longURL = urlDatabase[req.params.shortURL];

  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: longURL, 
    email: users?.[userCookie]?.['email'] || ''
  };
  console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const longURL = req.body.longURL
  const shortURL = generateRandomString(6, '1234567890qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM');
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id", (req, res) => {
  res.redirect(`/urls/${req.params.id}`);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  console.log(req.params)
  const longUrl = req.body.longURL;
  urlDatabase[req.params.shortURL] = longUrl;
  res.redirect("/urls");
  
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const deleteUrl = req.params.shortURL;
  delete urlDatabase[deleteUrl];
  res.redirect("/urls");
});

app.get("/login", (req,res) => {
  res.render('login')
})


app.post("/login",(req,res) => {
  const username = req.body.username;
  if(!username) {
    return res.redirect("/urls")
  }
  //check if the username matches any email inside of our users Object
  for (const user of Object.keys(users)) {
    if(username === users[user]['email']) {
      res.cookie('user_id',users[user]['id']);
      console.log('we made it')
    }
    console.log(user)
    console.log('user', users[user]['email'])
  }
  //res.cookie('user_id',user_id);
  res.redirect("/urls");
});


app.post("/logout",(req,res) => {
  res.clearCookie('user_id');
  res.redirect("/urls")
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

