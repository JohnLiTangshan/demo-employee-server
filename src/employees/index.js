const sdk = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const employeeService = require('./service');
const app = express();

app.use(bodyParser.json());

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

app.get('/', (req, res) => {
    console.log(req);
    res.send("Hell world");
});
app.post('/employees', async (req, res) => {
    res.json(await employeeService.addEmployee(req.body))

});
app.get('/employees', async (req, res) => {
    res.json(await employeeService.getEmployees());
});

app.get('/employees/:email', async (req, res) => {
    
    res.json(await employeeService.getEmployee(req.params.email));
    
});

app.put('/employees', async (req, res) => {
    res.json(await employeeService.updateEmployee(req.body));
});

app.delete('/employees/:email', async (req, res) => {
    res.json(await employeeService.deleteEmployee(req.params.email));
});

module.exports.handler = serverless(app);
