//****************** GLOBAL VARIABLES AND CONNECTION SETUP: **********************************************//
const mysql = require('mysql');
const inquirer = require('inquirer');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Fallen Falling',
    database: 'bamazon'
});
//*******************************************************************************************************//


//****************** TABLE CONSTRUCTION FUNCTION JUNCTION: **********************************************//
//First, truncate shortens strings that excede their cell's width:
const truncate = (datum, maxLength) => {
    if(datum.length > maxLength) return datum.slice(0, maxLength) + '…';
    return datum;
}
const formatPrice = (price) => {
    return '$' + price.toFixed(2).toString();
}
//Second, makeCell creates cells for data with a fixed width:
const makeCell = (datum, width) => {
    let cell = '|';
    //If the datum is too long, truncate is called:
    const content = datum.length > (width - 2) ? truncate(datum.toString(), width - 2) : datum.toString();
    //I determine the amount of padding needed:
    const padLength = width - content.length;
    //The content is padded by half the needed length on either side:
    //If padLength is odd, the extra padding will fall on the right.
    cell += ' '.repeat(Math.floor(padLength / 2)) + content + ' '.repeat(Math.ceil(padLength / 2));
    return cell;
}
//Third, makeRow creates a full table row:
const makeRow = (dataRow) => {
    //Cells of the correct width are created by calling makeCell for each piece of product information:
    //('Correct' here being a purely aesthetic judgement call...)
    const contents = makeCell(dataRow.item_id, 4) + makeCell(dataRow.product_name, 40) + makeCell(dataRow.price, 9) + '|';
    const padRow = '|' + ' '.repeat(4) + '|' + ' '.repeat(40) + '|' + ' '.repeat(9) + '|'
    const row = '_'.repeat(contents.length) + '\n' + padRow + '\n' + contents;
    return row;
}
//Finally, I construct the final table:
const makeTable = (allDataRows) => {
    //A 'headers' item is created to make the header row:
    const headers = {
        item_id: 'ID',
        product_name: 'Product Name',
        price: 'Price'
    };
    let table = makeRow(headers);
    //makeRow is called for each item in the MySQL response;
    allDataRows.forEach(dataRow => {
        dataRow.price = formatPrice(parseFloat(dataRow.price));
        table += '\n' + makeRow(dataRow);
    });
    //And the table is finished off with a bottom line!
    table += '\n' + '_'.repeat(4 + 4 + 40 + 9);
    return table;
}
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
        console.log(makeTable(res) + '\n');
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