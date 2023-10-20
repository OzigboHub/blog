const express = require('express');
const Datastore = require('nedb');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const db = new Datastore({ filename: 'database/model.txt', autoload: true });

// Home Page
app.get('/', (req, res) => {
    res.render("index");
});

// About Page
app.get('/about', (req, res) => {
    res.render("about");
});

// Blog Page
app.get('/blog', (req, res) => {
    db.find({}, function (err, docs) {
        res.render('blog', {
            docs
        });
    });

});

// Adding new Blog
app.get('/blog/new', (req, res) => {
    res.render('blog/new');
});

// Submit Blog
app.post('/blog/create', (req, res) => {
    const { title, description } = req.body;
    
    db.insert({ title, description }, function (err, newDocs) {
        // Two documents were inserted in the database
        // newDocs is an array with these documents, augmented with their _id
        if(err) res.redirect('/error', { error: 'Unable to create blog' });
        res.redirect('/blog');
    });
    
});

app.put('/blog/update/:id', (req, res) => {
    const blogId = req.params.id;
    const { title, description } = req.body;

    // Debugging: Check the values of blogId, title, and description
    console.log('Updating Blog:', blogId, title, description);

    db.update({ _id: blogId }, { $set: { title, description } }, {}, function (err, numReplaced) {
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
app.get('/blog/delete/:id', (req, res) => {
    const blogId = req.params.id;
    
    db.remove({ _id: blogId }, {}, function (err, numRemoved) {
        if (err) res.redirect('/error', { error: 'Unable to delete blog' });
        res.redirect('/blog');
    });
});

//View blog by ID
app.get('/blog/view/:id', (req, res) => {
    const blogId = req.params.id;
    db.findOne({ _id: blogId }, function (err, doc) {
        if (err) {
            res.redirect('/error', { error: 'Unable to read blog'});
        } else {
            // Render the HTML template with the blog post data
            res.render('view-blog', { blog: doc });
        }
    });
});


// Contact page
app.get('/contact', (req, res) => {
    res.render("contact");
});

// Port Runing
const port = process.env.PORT || 3022;

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
