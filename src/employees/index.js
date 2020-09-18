
const express = require('express');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const employeeService = require('./service');
const app = express();

app.use(bodyParser.json());

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

module.exports.handler = serverless(app, {
    basePath: '/api'
});
