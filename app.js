var express = require('express');
var app = express();
// Remember to install body-parser (npm install body-parser --save).
var bodyParser = require('body-parser');
methodOverride = require('method-override');
// You must npm install  express-sanitizer --save. It must also be listed after body-parser.
expressSanitizer = require('express-sanitizer');
// app.use(express.static('/public'));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.set('view engine','ejs');
app.use(methodOverride('_method'));


var mongoose = require('mongoose');
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect('mongodb://localhost/restful_blog_app', { useNewUrlParser: true });

// Create the Schema
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}

});

// Compile the schema.(Remember to capitalise)
var Blog = mongoose.model('Blog', blogSchema);

// Let us just create a test blog to see if our mongoose is working
// Blog.create({
//     title:'Test Blog',
//     image:"https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80.jpg",
//     body:'Hello, this is a test blog post'
// });

// RESTfull Routes

app.get('/', function(req,res){
    res.redirect('/blogs');
});

// THE INDEX(BLOGS) ROUTE
app.get('/blogs', function(req,res){
    Blog.find({}, function(err,blogs){
        if(err){
            console.log('Error')
        }else{
            res.render('blogs',{blogs:blogs});
        }
    });
    
});

// THE NEW ROUTE
app.get('/blogs/new',function(req,res){
    res.render('new');
});

// THE CREATE ROUTE
app.post('/blogs',function(req,res){
    // We need to load our sanitizer in our create and update routes.
    // This will prevent users from writing script to our app.
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // Create blog
    // In our new file we already grouped the data as blog when we 
    // listed it as blog[..] in the form.
    Blog.create(req.body.blog, function(err,newBlog){
        if(err){
            res.render('new')
    // Redirect
        }else{
            res.redirect('/blogs')
        };
    });
    
});

// THE SHOW ROUTE
app.get('/blogs/:id', function(req,res){
    // Lets just test.
    // res.send('The Show Page');
     Blog.findById(req.params.id, function(err,foundBlog){
         if(err){
             res.redirect('/blogs');
           } else {
             res.render('show',{blog: foundBlog});
         };
     });
});

// THE EDIT ROUTE
app.get('/blogs/:id/edit', function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect('/blogs');
        } else{
            res.render('edit',{blog: foundBlog});
        };
    });
});


// THIS IS THE UPDATE ROUTE
app.put('/blogs/:id', function(req,res){
    // We need to load our sanitizer in our create and update routes.
    // This will prevent users from writing script to our app.
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id , req.body.blog , function(err,updateBlog){
        if(err){
            res.redirect('/blogs');
        }else{
        // Note the second / behind /blogs/ because this is a route to the updated blog
        // (Also known as the show page).
            res.redirect('/blogs/' + req.params.id)
        }
    });
});

// THE DELETE ROUTE
app.delete('/blogs/:id', function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err,){
        if(err){
            res.redirect('/blogs')
        } else{
            res.redirect('/blogs');
        };
            
    });
});



app.listen(3000,function(){
    console.log('Server is on port 3000');
});