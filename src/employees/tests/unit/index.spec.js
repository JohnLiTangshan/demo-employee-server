const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const express = require('express');
const expect = chai.expect;
const proxyquire = require('proxyquire');

chai.use(sinonChai);


describe('Employee service index', () => {
    let sandbox;
    let useStub;
    let postStub;
    let getStub;
    let putStub;
    let deleteStub;
    let employeeService;
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        useStub = sandbox.stub();
        postStub = sandbox.stub();
        getStub = sandbox.stub();
        putStub = sandbox.stub();
        deleteStub = sandbox.stub();
        
        employeeService = {
            addEmployee: sandbox.stub(),
            getEmployees: sandbox.stub(),
            getEmployee: sandbox.stub(),
            updateEmployee: sandbox.stub(),
            deleteEmployee: sandbox.stub()
        }

        proxyquire('../../index', {
            'express': () => {
                return {
                    use: useStub,
                    post: postStub,
                    get: getStub,
                    put: putStub,
                    delete: deleteStub,
                    options: sandbox.stub()
                }
            },
            './service': employeeService,
            'serverless-http': () => {}
        });    });

    it('should register methods', () => {
       
        expect(useStub).to.have.been.called;
        expect(postStub).to.have.been.calledWith('/employees', sandbox.match.any);
        expect(getStub).to.have.been.calledWith('/employees/:email', sandbox.match.any);
        expect(getStub).to.have.been.calledWith('/employees', sandbox.match.any);
        expect(putStub).to.have.been.calledWith('/employees', sandbox.match.any);
        expect(deleteStub).to.have.been.calledWith('/employees/:email', sandbox.match.any);
    });

    it('should be able to create employee', async () => {
        
        const req = {body: 'test'};
        const res = {
            json: sandbox.stub()
        }
        const handler = postStub.firstCall.args[1];
        await handler(req, res);
        expect(employeeService.addEmployee).to.have.been.calledWith('test')
        expect(res.json.calledOnce).to.be.true
    });
    it('should get employees', async () => {
        
        const handler = getStub.firstCall.args[1];
        const res = {
            json: sandbox.stub()
        }
        await handler({}, res);
        expect(employeeService.getEmployees.calledOnce).to.be.true;
        expect(res.json.calledOnce).to.be.true
    });
    it('should get employee with email', async () => {
        // GIVEN
        const req = {
            params: {
                email: 'test@test.com'
            }
        };
        const res = {
            json: sandbox.stub()
        }
        const handler = getStub.secondCall.args[1];

        // WHEN
        await handler(req, res);

        // THEN
        expect(employeeService.getEmployee).to.have.been.calledWith('test@test.com');
        expect(res.json.calledOnce).to.be.true
    });

    it('should be able to update employee', async () => {
        // GIVEN
        const req = {
            body: 'test'
        };
        const res = {
            json: sandbox.stub()
        }
        const handler = putStub.firstCall.args[1];

        // WHEN
        await handler(req, res);

        // THEN
        expect(employeeService.updateEmployee).to.have.been.calledWith('test');
        expect(res.json.calledOnce).to.be.true
    });

    it('should be able to delete employee', async () => {
        const req = {
            params: {
                email: 'test@test.com'
            }
        };
        const res = {
            json: sandbox.stub()
        };
        const handler = deleteStub.firstCall.args[1];
        await handler(req, res);
        expect(employeeService.deleteEmployee).to.have.been.calledWith('test@test.com');
        expect(res.json.calledOnce).to.be.true
    });




    afterEach(() => {
        sandbox.restore()
    })
});