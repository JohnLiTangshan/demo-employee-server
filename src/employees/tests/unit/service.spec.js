const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const proxyquire = require('proxyquire');

const expect = chai.expect;
chai.use(sinonChai);

process.env.Table = 'employees';

describe('Test employee service', () => {
    let sandbox;
    let employeeService;

    let putItemStub;
    let scanStub;
    let getItemStub;
    let deleteItemStub;
    beforeEach(() => {
        sandbox = sinon.createSandbox();

        putItemStub = sandbox.stub();
        scanStub = sandbox.stub();
        getItemStub = sandbox.stub();
        deleteItemStub = sandbox.stub();

        let dynamoDBstub = {
            putItem: putItemStub,
            scan: scanStub,
            getItem: getItemStub,
            deleteItem: deleteItemStub
        };
        const mockAws = { DynamoDB: sandbox.stub().returns(dynamoDBstub) };

        employeeService = proxyquire('../../service', {
            'aws-sdk': mockAws
        });
    });

    it('should be able to add employee', async () => {
        // GIVEN
        const employee = {
            "email": "test@test.com",
            "firstName": "John",
            "lastName": "Li",
            "location": "Dalian",
            "title": "Test",
            "phone": "123456",
            "department": "PI"
        };
        putItemStub.yields(null, {});

        // WHEN
        let result = await employeeService.addEmployee(employee);

        // THEN
        expect(putItemStub).to.have.been.calledWith({
            TableName: 'employees', 
            Item: {
              email: { S: 'test@test.com' }, firstName: { S: 'John' }, lastName: { S: 'Li' }, location: { S: 'Dalian' }, title: { S: 'Test' }, phone: {S: '123456'}, department: {S: 'PI'}
            }
        });
        expect(result).to.be.eql({
            isSuccess: true,
            result: employee,
            errorMessage: ''
        })
    });

    it('should get error when fail to add to dynamodb table', async () => {
        // GIVEN
        const employee = {
            "email": "test@test.com",
            "firstName": "John",
            "lastName": "Li",
            "location": "Dalian",
            "title": "Test",
            "phone": "123456",
            "department": "PI"
        };
        putItemStub.yields({error: "fail"}, null);

        // WHEN
        const result = await employeeService.addEmployee(employee);

        // THEN
        expect(putItemStub).to.have.been.calledWith({
            TableName: 'employees', 
            Item: {
              email: { S: 'test@test.com' }, firstName: { S: 'John' }, lastName: { S: 'Li' }, location: { S: 'Dalian' }, title: { S: 'Test' }, phone: {S: '123456'}, department: {S: 'PI'}
            }
        });
        expect(result).to.be.eql({
            isSuccess: false,
            result: '',
            errorMessage: 'Fail to add employee'
        })
    });

    it('should be able to get employees', async () => {
        // GIVEN
        const data =  {
            "Items": [
              {
                "firstName": {
                  "S": "Test"
                },
                "lastName": {
                  "S": "Test"
                },
                "phone": {
                  "S": "123456"
                },
                "location": {
                  "S": "Dalian"
                },
                "title": {
                  "S": "Architect"
                },
                "department": {
                  "S": "PI"
                },
                "email": {
                  "S": "test@fil.com"
                }
              },
              {
                "firstName": {
                  "S": "John"
                },
                "lastName": {
                  "S": "Li"
                },
                "phone": {
                  "S": "12345"
                },
                "location": {
                  "S": "Dalian"
                },
                "title": {
                  "S": "Test"
                },
                "department": {
                  "S": "PI"
                },
                "email": {
                  "S": "john@fil.com"
                }
              }
            ],
            "Count": 2,
            "ScannedCount": 2
          };
          scanStub.yields(null, data);
          // WHEN
          const result = await employeeService.getEmployees();

          // THEN
          expect(scanStub).to.have.been.calledWith({
              TableName: 'employees'
          });
          expect(result).to.be.eql({
            "isSuccess": true,
            "result": [
                {
                    "email": "test@fil.com",
                    "firstName": "Test",
                    "lastName": "Test",
                    "location": "Dalian",
                    "title": "Architect",
                    "phone": "123456",
                    "department": "PI"
                },
                {
                    "email": "john@fil.com",
                    "firstName": "John",
                    "lastName": "Li",
                    "location": "Dalian",
                    "title": "Test",
                    "phone": "12345",
                    "department": "PI"
                }
            ],
            "errorMessage": ""
        });
    });

    it('should fail to get employees when DB failed', async () => {

        // GIVEN
        scanStub.yields({error: "Fail"}, null);

        // WHEN
        const result = await employeeService.getEmployees();

        //THEN
        expect(result).to.be.eql({
            isSuccess: false,
            errorMessage: 'Fail to get employees',
            result: []
        })

    });

    it('should fail to get employee when db failed', async () => {

        // GIVEN
        getItemStub.yields({error: 'Fail'}, null);
        
        // WHEN
        const result = await employeeService.getEmployee('test@test.com');

        // THEN
        expect(getItemStub).to.have.been.calledWith({
            TableName: 'employees',
            Key: {
                email: {
                    S: 'test@test.com'
                }
            }
        });
        expect(result).to.be.eql({
            isSuccess: false,
            result: '',
            errorMessage: 'Fail to get employee'
        })
    });

    it('should fail to get employee when employee does not exist', async () => {
        // GIVEN
        getItemStub.yields(null, {});

        // WHEN
        const result = await employeeService.getEmployee('test@test.com');

        // THEN
        expect(getItemStub).to.have.been.calledWith({
            TableName: 'employees',
            Key: {
                email: {
                    S: 'test@test.com'
                }
            }
        });
        expect(result).to.be.eql({
            isSuccess: false,
            result: '',
            errorMessage: 'Not found'
        });
    });

    it('Update employee',async () => {
        // GIVEN
        const employee = {
            "email": "test@test.com",
            "firstName": "John",
            "lastName": "Li",
            "location": "Dalian",
            "title": "Test",
            "phone": "123456",
            "department": "PI"
        };
        putItemStub.yields(null, {});

        // WHEN
        let result = await employeeService.updateEmployee(employee);

        // THEN
        expect(putItemStub).to.have.been.calledWith({
            TableName: 'employees', 
            Item: {
              email: { S: 'test@test.com' }, firstName: { S: 'John' }, lastName: { S: 'Li' }, location: { S: 'Dalian' }, title: { S: 'Test' }, phone: {S: '123456'}, department: {S: 'PI'}
            }
        });
        expect(result).to.be.eql({
            isSuccess: true,
            result: employee,
            errorMessage: ''
        });
    });

    it('should be able to delete employee', async () => {
        // GIVEN
        deleteItemStub.yields(null, {});
        // WHEN
        const result = await employeeService.deleteEmployee('test@test.com');

        // THEN
        expect(deleteItemStub).to.have.been.calledWith({
            TableName: 'employees',
            Key: {
                email: {
                    S: 'test@test.com'
                }
            }
        });
        expect(result).to.be.eql({
            isSuccess: true,
            result: {},
            errorMessage: ''
        })
    });

    it('should get error when failed to delete employee', async () => {
        // GIVEN
        deleteItemStub.yields({error: 'Failed'}, null);

        // WHEN
        const result = await employeeService.deleteEmployee('test@test.com');

        expect(deleteItemStub).to.have.been.calledWith({
            TableName: 'employees',
            Key: {
                email: {
                    S: 'test@test.com'
                }
            }
        });
        expect(result).to.be.eql({
            isSuccess: false,
            result: '',
            errorMessage: 'Fail to delete employee'
        })
    });

    it('should pass', () => {
        expect(true).to.be.true;
    });

    afterEach(() => sandbox.restore());
})