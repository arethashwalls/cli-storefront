const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'bamazon'
});

connection.connect((err) => {
    if(err) throw err;
    console.log('\nAccessing Bamazon...\n');
    connection.query('SELECT item_id, product_name, price FROM products', (err, res) => {
        if(err) throw err;
        console.log(res);
    })
})