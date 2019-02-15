var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')

app.use(cookieParser())
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//function to generate random string:

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

generateRandomString();

//Function to check if there's already an account

function checkUser(email){
  for (let user in users){
    if (email === users[user].email){
     return users[user]
    }
  } return null
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
 };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  var randomURL = generateRandomString();
  urlDatabase[randomURL] = req.body["longURL"]
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];

  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body["longURL"];

  res.redirect("/urls");
})

app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/urls");
})

//Register Page

app.get("/register", (req, res) => {
  res.render("register")
})

app.post("/register", (req, res) => {
  let newUserId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password){
    res.status(400).send("Please enter email and password.");
  };

  if (checkUser(email)){
    res.status(400).send("Email already in use.");
  } else if (checkUser(email) === null){
      users[newUserId] = {
      id: newUserId,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', users[newUserId].id);
    res.redirect('/urls');
  }
})

//LOGIN

app.post("/login", (req, res) => {
  let emailLogin = checkUser(req.body.email);

  if (emailLogin && emailLogin.password === req.body.password){
    res.cookie("user_id", emailLogin.id);
    res.redirect("/urls");
    return;
  } else {
    res.status(400).send("Invalid email or password.")
  }
})

app.get("/login", (req, res) => {
  res.render("login")
})


