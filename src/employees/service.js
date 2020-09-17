const sdk = require('aws-sdk');

const ddbOptions = {
    apiVersion: '2012-08-10'
};

if (process.env.AWS_SAM_LOCAL) {
    ddbOptions.endpoint = new sdk.Endpoint('http://dynamodb:8000')
}

if (process.env.E2E_TEST) {
    ddbOptions.endpoint = new sdk.Endpoint('http://localhost:8000')
}

const client = new sdk.DynamoDB(ddbOptions);



//const tableName = process.env.TABLE;
const tableName = 'employees';


function buildResult(isSuccess, result, errorMessage) {
    return {
        isSuccess,
        result,
        errorMessage
    }
}



async function addEmployee(employee) {
    const params = {
        TableName: tableName,
        Item: {
            "email": {S: employee.email},
            "firstName": {S: employee.firstName},
            "lastName": {S: employee.lastName},
            "location": {S: employee.location},
            "title": {S: employee.title},
            "phone": {S: employee.phone},
            "department": {S: employee.department}
        }
    };
    const result = await new Promise((resolve, reject) => {
        client.putItem(params, function(err, data) {
            if (err) {
                console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                resolve(buildResult(false, '', 'Fail to add employee'));
            } else {
                console.log("Added item:", JSON.stringify(data, null, 2));
                resolve(buildResult(true, employee, ''));
            }
        });
    });
    return result;
}
async function getEmployees() {
    const params = {
        TableName: tableName
    };
    const result = await new Promise((resolve, reject) => {
        client.scan(params, (err, data) => {
            if(err) {
                console.error("Unable to get employees from table. Error JSON: ", JSON.stringify(err, null, 2));
                resolve(buildResult(false, '', 'Fail to get employees'));
            } else {
                console.log(data);
                const employees = data.Items.map(e => {
                    return {
                        email: e.email.S,
                        firstName: e.firstName.S,
                        lastName: e.lastName.S,
                        location: e.location.S,
                        title: e.title.S,
                        phone: e.phone.S,
                        department: e.department.S
                    }
                });
                resolve(buildResult(true, employees, ''));
            }
        });
    })
    return result;
}

async function getEmployee(email) {
    const params = {
        TableName: tableName,
        Key: {
            "email": {
                S: email
            }
        }
    };
    const result = await new Promise((resolve, reject) => {
        client.getItem(params, (err, data) => {
            if(err) {
                console.error("Unable to get employee from table. Error JSON: ", JSON.stringify(err, null, 2));
                resolve(buildResult(false, '', 'Fail to get employee'));
            } else {
                if(data.Item === undefined) {
                    console.log("No employee with email " + email);
                    return resolve(buildResult(false, '', 'Not found',));
                }
                const employee = {
                    email: data.Item.email.S,
                    firstName: data.Item.firstName.S,
                    lastName: data.Item.lastName.S,
                    location: data.Item.location.S,
                    title: data.Item.title.S,
                    phone: data.Item.phone.S,
                    department: data.Item.department.S 
                };
                resolve(buildResult(true, employee, ''));
            }
        })
    });

    return result;
}
async function updateEmployee(employee) {
    return await addEmployee(employee);
}

async function deleteEmployee(email) {
    const params = {
        TableName: tableName,
        Key: {
            'email': {
                S: email
            }
        }
    };
    const result = await new Promise((resolve, reject) => {
        client.deleteItem(params, (err, data) => {
            if(err) {
                console.error("Unable to delete employee from table. Error JSON: ", JSON.stringify(err, null, 2));
                resolve(buildResult(false, '', 'Fail to delete employee'));
            } else {
                resolve(buildResult(true, {}, ''));
            }
        });
    });
    return result;
}
module.exports = {
    addEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee
}