//****************** GLOBAL VARIABLES AND CONNECTION SETUP: **********************************************//
const mysql = require('mysql');
const inquirer = require('inquirer');
const tableMaker = require('./custom_modules/tableMaker');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Fallen Falling',
    database: 'bamazon'
});
//*******************************************************************************************************//

//****************** VALIDATION FUNCTIONS: **************************************************************//
//isValidId is called during an inquirer prompt to check the customer provided ID against existing IDs:
const isValidId = (num, allIds) => {
    const intNum = parseInt(num);
    if(isNaN(intNum) || !allIds.includes(intNum)) {
        return 'Please enter a valid ID.';
    }
    return true;
}
//isValidQuantity similarly is used to validate user-inputed quantities"
const isValidQuantity = (num) => {
    const intNum = parseInt(num);
    if(isNaN(intNum)) {
        return 'Please enter a number.';
    } else if(intNum < 1) {
        return 'Please enter a quantity greater than 0.'
    }
    return true;
}
//*******************************************************************************************************//
   
//****************** CORE APP FUNCTIONS: ****************************************************************//
//First, I connect to my database:
connection.connect((err) => {
    if(err) throw err;
    console.log('\nAccessing Bamazon...\n');
    accessStore();
})
//Once the connection is established, I query the database for the id, name, and price of each item:
const accessStore = () => {
    connection.query('SELECT item_id, product_name, price FROM products', (err, res) => {
        if(err) throw err;
        console.log('Items availabe for purchase:\n');
        //The tableMaker module is called to display the data:
        console.log(tableMaker.makeTable(res) + '\n');
        //Call askPurchase:
        askPurchase(res);
    })
}
const askPurchase = allData => {
    //An array of all possible item IDs is pulled from the database:
    let allValidIds = allData.map(dataRow => parseInt(dataRow.item_id));
    //I ask the user which item they'd like to purchase:
    inquirer.prompt([
        {
            name: 'productId',
            type: 'input',
            message: 'Enter a product ID: ',
            //The ID validator is called and compared to the array of valid IDs:
            validate: input => isValidId(input, allValidIds)
        }, {
            name: 'quantity',
            type: 'input',
            message: 'How many units would you like to purchase?',
            //The quantity validator is called:
            validate: input => isValidQuantity(input)
        }
    ])
    .then(({productId, quantity}) => {
        //I call makePurchase with the customer's answer:
        makePurchase(parseInt(productId), parseInt(quantity), allData);
    });
}
const makePurchase = (itemId, quantity, allData) => {
    //First, I retrieve all the info on the purchased item from the database by filtering by ID:
    let orderedItem = allData.filter(item => {
        if(parseInt(item.item_id) === itemId) return true;
    })[0];
    console.log(`\nYou ordered ${quantity} unit(s) of ${orderedItem.product_name}.\n`);
    //Then, I query the database again for that particular item and it's quantity:
    connection.query('SELECT item_id, product_name, price, stock_quantity FROM products WHERE item_id = ?', [orderedItem.item_id], (err, res) => {
        if(err) throw err;
        //res should only contain one item:
        orderedItem = res[0];
        //If there's insufficient stock, the restart function runs right away:
        if(quantity > orderedItem.stock_quantity) {
            console.log('Oops! Bamazon is unable to fufill your order due to insufficient stock.\n');
            restart();
        //If there's sufficient stock, the database is updated *then* the restart function runs:
        } else {
            connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE ?', [quantity, {'item_id' : orderedItem.item_id}], (err, res) => {
                if(err) throw err;
                console.log(`Your order has been processed successfully.\n
                \r$${parseFloat(orderedItem.price) * quantity} has been billed to your account.\n`);
                restart();
            });
        }
    })
}
//restart allows users to either make another purchase or close the program:
const restart = () => {
    //Before the program can be closed or restarted, any rows with a quantity of 0 are deleted:
    connection.query('DELETE FROM products WHERE stock_quantity = 0', (err, res) => {
        if(err) throw err;
        inquirer.prompt({
            name: 'restart',
            type: 'confirm',
            message: 'Would you like to make another purchase?'
       })
        .then(answer => {
            //If the user choses to restart, I call accessStore again:
            if(answer.restart) {
                accessStore();
            //Otherwise, I end the connection:
            } else {
                console.log('\nHave a wonderful day!\n')
                connection.end();
            }
        })
    })
}
//*******************************************************************************************************//