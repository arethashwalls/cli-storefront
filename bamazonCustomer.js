//****************** GLOBAL VARIABLES AND CONNECTION SETUP: **********************************************//
const mysql = require('mysql');
const inquirer = require('inquirer');
const tableMaker = require('./custom_modules/tableMaker');
console.log(tableMaker)
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

connection.connect((err) => {
    if(err) throw err;
    console.log('\nAccessing Bamazon...\n');
    connection.query('SELECT item_id, product_name, price FROM products', (err, res) => {
        if(err) throw err;
        console.log('Items availabe for purchase:\n');
        let allValidIds = res.map(dataRow => parseInt(dataRow.item_id));
        console.log(tableMaker.makeTable(res) + '\n');
        inquirer.prompt([
            {
                name: 'productId',
                type: 'input',
                message: 'Enter a product ID: ',
                validate: input => isValidId(input, allValidIds)
            }, {
                name: 'quantity',
                type: 'input',
                message: 'How many units would you like to purchase?',
                validate: input => isValidQuantity(input)
            }
        ])
        .then(answer => {
            let orderedItem = res.filter(item => {
                if(parseInt(item.item_id) === parseInt(answer.productId)) return true;
            })[0];
            console.log(`\nYou ordered ${answer.quantity} units of ${orderedItem.product_name}.\n`);
            connection.query('SELECT item_id, product_name, price, stock_quantity FROM products WHERE item_id = ?', [orderedItem.item_id], (err, res) => {
                if(err) throw err;
                orderedItem = res[0];
                if(answer.quantity > orderedItem.stock_quantity) {
                    console.log('Oops! Bamazon is unable to fufill your order due to insufficient stock.');
                    connection.end();
                } else {
                    connection.query('UPDATE products SET stock_quantity = stock_quantity - ? WHERE ?', [answer.quantity, {'item_id' : orderedItem.item_id}], (err, res) => {
                        if(err) throw err;
                        console.log(`Your order has been processed successfully.\n
                        \r$${parseFloat(orderedItem.price) * answer.quantity} has been billed to your account.\n
                        \rHave a great day!\n`);
                        connection.end();
                    })
                }
            })
        })
        
    })
})