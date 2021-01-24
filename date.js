var today = new Date()
var yesterday = new Date(today)


yesterday.setDate(yesterday.getDate() - 1)
today = today.setHours(23,59,59);
yesterday = yesterday.setHours(0,0,0);
console.log(new Date(today))
console.log(new Date(yesterday))

//console.log(today,yesterday);