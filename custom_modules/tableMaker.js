//****************** TABLE CONSTRUCTION FUNCTION JUNCTION: **********************************************//
//First, truncate shortens strings that excede their cell's width:
const truncate = (datum, maxLength) => {
    if(datum.length > maxLength) return datum.slice(0, maxLength) + '…';
    return datum;
}
//A helper function, formatPrice, will be used on our prices:
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
module.exports.makeTable = makeTable;
//*******************************************************************************************************//