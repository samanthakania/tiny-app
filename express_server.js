var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')
const bodyParser = require("body-parser");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: [123456],
}));

const urlDatabase = {
  b6UTxQ: { longURL: "http://www.lighthouselabs.ca", userID: "b2xVn2" },
  i3BoGr: { longURL: "http://www.google.com", userID: "9sm5xK" }
};

const users = {
  "userRandomID": {
    id: "sam",
    email: "user@example.com",
    password: "123456"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
}
};


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
//URLS FUNCTION

function urlsForUser(id){
  let userUrl = {};
    for (let i in urlDatabase){
      if (urlDatabase[i].user === id){
        userUrl[i] = urlDatabase[i];
      }
    }
    return userUrl
}

//PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//

app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//URLS
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user),
    user: users[req.session.user_id],
 };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.user_id === undefined){
    res.redirect('/urls');
  } else{
    var randomURL = generateRandomString();
    urlDatabase[randomURL] = {
      url: req.body["longURL"],
      user: req.session.user
    };
  }
  res.redirect(`"/urls/${randomURL}`);
});


//NEW URLS
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user),
  };
  if (templateVars.user === undefined){
    res.redirect("/login");
    console.log("Please login.")
  } else {
  res.render("urls_new", templateVars);
  }
});

//short url

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {

  if (urlDatabase[req.params.shortURL].user === req.session.user_id){
    delete urlDatabase[req.params.shortURL]
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }

});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body["longURL"];

  res.redirect("/urls");
});

//REGISTER PAGE

app.get("/register", (req, res) => {
  res.render("register")
})

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password){
    res.status(400).send("Please enter email and password.");
  } else if (checkUser(email)){
    res.status(400).send("Email already in use.");
  } else {
      let newUserId = generateRandomString();
      users[newUserId] = {
        id: newUserId,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      };
    res.session.user_id = newUserId;
    res.redirect('/urls');
  }
  });

//LOGIN PAGE

app.post("/login", (req, res) => {
  let emailLogin = checkUser(req.body.email);
  if (emailLogin && emailLogin.password === req.body.password){
    req.session.user_id = emailLogin.id;
    res.redirect("/urls");
    return;
  } else {
    res.status(400).send("Invalid email or password.")
  }
});

app.get("/login", (req, res) => {
  res.render("login")
});

//LOGOUT

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls");
});
