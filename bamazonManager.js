var inquirer = require('inquirer');
var mysql = require('mysql');
var consoleTable = require('console.table');

var connection = mysql.createConnection(
    {
        host: "localhost",
        port: 3306,
        user: "root",
        password: "motiv8er",
        database: "bamazon"
    }
);

connection.connect(function(err){
    if(err) throw err;
    console.log("connected as id " + connection.threadId);
   
    start();
})

function start(){
      inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            name: "choice",
            choices: ["products", "low products", "add inventory", "add product"]
        }
    ]).then(function(response){
          if(response.choice == "products"){
              displayProducts();
          }else if(response.choice == "low products"){
              lowProducts();
          }else if(response.choice == "add inventory"){
              addInventory();
          }else if(response.choice == "add product"){
              addProduct();
          }
      })
}
function displayProducts(){
    var query = "SELECT * FROM products";
    connection.query(query, function(err, res){
        if(err) throw err;
        console.table(res);
        
        start();
    })
}

function lowProducts(){
    var query = "SELECT * FROM products WHERE stock_quantity < 5";
    connection.query(query, function(err, res){
        if(err) throw err;
        console.table(res);
        
        start();
    })
}

function addInventory(){
    var query1 = "SELECT item_id, product_name, stock_quantity FROM products";
    
    connection.query(query1, function(err, res){
        if(err) throw err;
        console.table(res);
        inquirer.prompt([
            {
                type: "input",
                message: "Enter the item_id you want to add stock to.",
                name: "item",
                validate: function(item){
                    for( var i = 0; i < res.length; i++){
                        if(item == res[i].item_id){
                            return true;
                        }
                    }
                    
                    return "Please enter a valid item_id";
                }
            },
            {
                type: "input",
                message: "How much would you like to add?",
                name: "amount",
                validate: function(quantity){
                    var result = quantity % 1;
                    if(quantity > 0 && result == 0){
                        return true;
                    }
                    else{
                        return "Please enter a valid quantity.";
                    }
                }
            }
        ]).then(function(response){
            var query2 = "UPDATE products SET stock_quantity = stock_quantity + " + response.amount + " WHERE item_id = " + response.item;
            connection.query(query2, function(err, res){
               if(err) throw err;
                
                console.log("product updated");
                start();
            })
        })
        
    })
}

function addProduct(){
    inquirer.prompt([
        {
            type: "input",
            message: "name of product",
            name: "product_name"
        },
        {
            type: "input",
            message: "name of department",
            name: "department_name"
        },
        {
            type: "input",
            message: "price of product",
            name: "price"
        },
        {
            type: "input",
            message: "stock of product",
            name: "stock_quantity"
        }
    ]).then(function(response){
        var query = "INSERT INTO products SET ?";
        connection.query(query, response, function(err, res){
            if(err) throw err;
            
            console.log("Product added.");
            
            start();
        })
    })
}