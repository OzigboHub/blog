const express = require('express');
const Datastore = require('nedb');
const cors = require('cors');
const path = require('path');
const user = require('./user');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

const db = new Datastore({ filename: 'database/model.txt', autoload: true });

app.post('/createUser', (req, res) => {
    const userData = req.body;
    userController.createUser(userData, (err, message) => {
      if (err) {
        res.status(500).send('Error creating user');
      } else {
        res.send(message);
      }
    });
  });

//Middleware to check if user logged in
const checkLogin = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.redirect('/login');
    }
};

//Register Page
app.get('/register', (req, res) => {
    res.render("register");
});

//Handle registration
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    //Check if username is already taken
    if (users.some(user => user.username === username)) {
        res.redirect('/register');
    } else {
        //Add user
        users.push({ id: users.length + 1, username, email, password });
        res.redirect('/login');
    }
});

// Define the 'users' variable
const users = [
    { username: 'user1', password: 'pass1', id: 1 },
    { username: 'user2', password: 'pass2', id: 2 },
  ];
  
  // Middleware for sessions
  app.use(session({
    secret: "ozigbo-emmanuel-key",
    resave: true,
    saveUninitialized: true
}));
  
  // Sample middleware for checking if the user is logged in
  const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    next();
  };
  
  app.get('/users', (req, res) => {
    res.json(users);
  });
  
  app.get('/login', (req, res) => {
    res.render('login');
  });
  
  // Login
  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    // Check if valid
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
      req.session.userId = user.id;
      res.redirect('/blog'); // Corrected the path to '/blog'
    } else {
      res.redirect('/register');
    }
  });


//Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
});

// Home Page
app.get('/', checkLogin, (req, res) => {
    res.render("index");
});

// About Page
app.get('/about', checkLogin, (req, res) => {
    res.render("about");
});

// Blog Page
app.get('/blog', checkLogin, (req, res) => {
    db.find({}, function (err, docs) {
        res.render('blog', {
            docs
        });
    });

});

// Adding new Blog
app.get('/blog/new', checkLogin, (req, res) => {
    res.render('blog/new');
});

// Submit Blog
app.post('/blog/create', checkLogin, (req, res) => {
    const { title, description } = req.body;
    
    db.insert({ title, description }, function (err, newDocs) {
        // Two documents were inserted in the database
        // newDocs is an array with these documents, augmented with their _id
        if(err) res.redirect('/error', { error: 'Unable to create blog' });
        res.redirect('/blog');
    });
    
});

//Update Blog
app.get('/blog/update/:id', checkLogin, (req, res) => {
    const { id } = req.params;

    // The same rules apply when you want to only find one document
    db.findOne({ _id: id }, function (err, doc) {
        // doc is the document Mars
        if(err) res.redirect('/error', { error: 'Invalid ID passed to update' });
        // If no document is found, doc is null
        res.render('blog/edit', {
            doc
        });
    });
});

app.post('/blog/update/:id', checkLogin, (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    // Debugging: Check the values of blogId, title, and description
    console.log('Updating Blog:', id, title, description);

    db.update({ _id: id }, { $set: { title, description } }, {}, function (err, numReplaced) {
        if (err) {
            console.error('Error updating blog:', err);
            res.redirect('/error', { error: 'Unable to update blog' });
        } else {
            console.log('Successfully updated', numReplaced, 'blog(s).');
            res.redirect('/blog');
        }
    });
});

// Delete a blog by ID
app.get('/blog/delete/:id', checkLogin, (req, res) => {
    const blogId = req.params.id;
    
    db.remove({ _id: blogId }, {}, function (err, numRemoved) {
        if (err) res.redirect('/error', { error: 'Unable to delete blog' });
        res.redirect('/blog');
    });
});

//View blog by ID
app.get('/blog/view/:id', checkLogin, (req, res) => {
    const blogId = req.params.id;
    console.log('Requested blog ID:', blogId);
    db.findOne({ _id: blogId }, function (err, doc) {
        if (err) {
            res.redirect('/error', { error: 'Unable to read blog'});
        } else {
            // Render the HTML template with the blog post data
            res.render('blog/view', { doc });
        }
    });
});


// Contact page
app.get('/contact', checkLogin, (req, res) => {
    res.render("contact");
});

const port = process.env.PORT || 3022;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
