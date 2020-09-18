const chai = require('chai');
const expect = chai.expect;

const sdk = require('aws-sdk');

const ddbOptions = {
  apiVersion: '2012-08-10',
  region: 'ap-northeast-1',
  endpoint: new sdk.Endpoint('http://localhost:8000')
};
const ddbClient = new sdk.DynamoDB(ddbOptions);

const handler = require('../../index').handler;

describe('Employee test', () => {

    async function addEmployee() {
        const addEvent = require('./addEmployee-event.json');
        const result = await handler(addEvent);
        return result;
    }

    it('should be able to add employee', async () => {
        // WHEN
        const result = await addEmployee();

        // THEN
        const ddbParams = {
            TableName: process.env.TABLE,
            Key: {email: {S: 'test@test.com'}},
            ConsistentRead: true
          };
    
        const {Item} = await ddbClient.getItem(ddbParams).promise();
        //console.log(Item);
        expect(Item).not.to.be.undefined;
    });

    it('should be able to get employees', async () => {
        const getEvent = require('./getEmployees-event.json');
        await addEmployee();

        const res = await handler(getEvent);
        const body = JSON.parse(res.body);
        expect(body.result.length).to.be.greaterThan(0);
        
    });

    it('should be able to update employee', async () => {
        await addEmployee();
        const updateEvent = require('./updateEmployee-event.json');
        const res = await handler(updateEvent);

        // THEN
        const ddbParams = {
            TableName: process.env.TABLE,
            Key: {email: {S: 'test@test.com'}},
            ConsistentRead: true
          };
    
        const {Item} = await ddbClient.getItem(ddbParams).promise();
        expect(Item.firstName.S).to.be.eql('Test22');
    });

    it('should be able to delete employee', async() => {
        // GIVEN
        await addEmployee();

        // WHEN
        const deleteEvent = require('./deleteEmployees-event.json');
        const res = await handler(deleteEvent);
        const body = JSON.parse(res.body);

        // THEN
        expect(body).to.eql({
            isSuccess: true,
            result: {},
            errorMessage: ''
        });
        
        const ddbParams = {
            TableName: process.env.TABLE,
            Key: {email: {S: 'test@test.com'}},
            ConsistentRead: true
          };
    
        const item = await ddbClient.getItem(ddbParams).promise();
        expect(item).to.eql({})
        
    })

});
