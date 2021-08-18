//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//database start
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemSchema);

const item = new Item({
  name: "Have a Nice day :)"
});

const defaultItem = [item];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
})


const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({},function(err,result){
    if(result.length===0){

      Item.insertMany(defaultItem, function(err){
        if(err){
          console.log("Error");
        }
        else{
          console.log("Sucess");
        }
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  });

});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newitem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newitem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName},function(err, foundList){
      if(!err){
        foundList.items.push(newitem);
        foundList.save();
        res.redirect("/"+listName);
      }
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({_id: checkedItemId}, function(err){
      if(err){
        console.log("Error in delete");
      }
      else{
        res.redirect("/");
      }
    })
  }
  else{

    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){

        res.redirect("/"+listName);
      }
    })

  }

})

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, result){
    if(err){
      console.log("Error in finding");
    }
    else{
      if(!result){
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItem
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list",{listTitle: result.name, newListItems: result.items})
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
