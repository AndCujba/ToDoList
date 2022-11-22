const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js"); //require a local module
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs"); //pentru a folosi ejs

app.use(bodyParser.urlencoded({extended: true})); //pentru a transmite datele la server folosim bodyParser
app.use(express.static("public")); //pentru a putea merge css si alte tipuri de doc statice

// db   

mongoose.connect("mongodb+srv://andreeaC:pescarus33@cluster0.s1epyvo.mongodb.net/todolistDB", {useNewUrlParser: true}); //cream DB

const itemsSchema = {     //schema pentru DB
    name: String
};

const Item = mongoose.model("Item", itemsSchema); //modelul pentru lista DB

const item1 = new Item ({
    name: "buy food"
});

const item2 = new Item ({
    name: "clean the room"
});

const item3 = new Item ({
    name: "make homework"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


  

app.get("/", function(req, res) { //res from our server - app.js; res.redirect se intoarce aici inapoi cand este apelat
    
    //const day = date.getDate(); //atribuim unei variabile raspunsul functiei din file-ul date.js

    Item.find({}, function(err, foundItems) {

        if(foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("Success!");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems}); //transmitem variabila catre file-ul list.ejs
        }
    });
});


//crearea unei noi pagini cu url diferit
app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
        if(!err) {
            if(!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });

});

 
app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if(listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }
    
}); 

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if(!err) {
                console.log("successfully deleted the item!");
                res.redirect("/");
            }
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
            if(!err) {
                res.redirect("/" + listName);
            }
        });

    }


});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
    console.log("Server started successfully.");
}); 
