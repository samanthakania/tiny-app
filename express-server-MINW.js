//express_server.js

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
  keys: ['123456'],
}));

const urlDatabase = {
  b6UTxQ: { longURL: "http://www.lighthouselabs.ca", userID: "b2xVn2" },
  i3BoGr: { longURL: "http://www.google.com", userID: "9sm5xK" },
  b6UTxQ: { longURL: "http://www.linkedin.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "http://www.facebook.com", userID: "userRandomID" },
  b6UTxQ: { longURL: "http://www.gmail.ca", userID: "user2RandomID" },
  i3BoGr: { longURL: "http://www.amazon.com", userID: "user2RandomID" }
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
  console.log('id',id);
  const userUrl = {};
  for (let i in urlDatabase){
    console.log('i value', i);
    console.log("check", urlDatabase[i].userID, id);
    if (urlDatabase[i]['userID'] == id){
      console.log(i);
      userUrl[i] = urlDatabase[i];
    }
  }
    return userUrl;
}

//

app.get("/", (req, res) => {
  res.redirect('/urls');
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//URLS PAGE
app.post("/urls", (req, res) => {
  if (req.session.id === undefined){
    res.redirect('/urls');
  } else {
    var randomURL = generateRandomString();
    urlDatabase[randomURL] = {
      url: req.body["longURL"],
      userID: req.session.id
    };
  }
  res.redirect(`/urls/${randomURL}`);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.id),
    user: users[req.session.id],
 };
 console.log(templateVars.urls);
 console.log(templateVars.user);
  res.render("urls_index", templateVars);
});



//NEW URLS
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.id],
    urls: urlsForUser(req.session.id),
  };
  if (templateVars.user === undefined){
    res.redirect("/login");
    } else {
  res.render("urls_new", templateVars);
  }
});

//short url

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.id],
  };
    if(users[req.session.id]){
        res.render("urls_show", templateVars);
    } else {
      res.redirect("/login");
    }
});

app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase){
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  } else {
    res.status(400).send("Please login.")
  }
});


// DELETE
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].user === req.session.id){
    delete urlDatabase[req.params.shortURL]
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }

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
    return;
  } else if (checkUser(email)){
    res.status(400).send("Email already in use.");
    return;
  } else {
      let newUserId = generateRandomString();
      users[newUserId] = {
        id: newUserId,
        email: req.body.email,
        password: bcrypt.hashSync(password, 10)
      }
    req.session.id = newUserId;
    res.redirect('/urls');
  }
  });
//LOGIN PAGE

app.post("/login", (req, res) => {
  let emailLogin = checkUser(req.body.email);
  if (emailLogin && emailLogin.password === req.body.password){
    req.session.id = emailLogin.id;
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

//PORT

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});