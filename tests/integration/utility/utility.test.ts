import * as dbHandler from 'tests/integration/setup';
import { AobApplicationModel } from '@/models/aob-application.model';

jest.setTimeout(30000);

describe('Utility Integration Tests', () => {
  beforeAll(async () => {
    await dbHandler.connect();
  });

  afterAll(async () => {
    await dbHandler.closeDatabase();
  });

  afterEach(async () => {
    await dbHandler.clearDatabase();
  });

  describe('Email Verification', () => {
    it('should check if an email exists in applications', async () => {
      const applicationData = {
        firstName: 'John',
        lastName: 'Doe',
        emailAddress: 'john.doe@example.com',
        mobileNumber: '+1234567890',
        applicationStatus: 'applicationSubmitted',
        applicationId: 'APP12345',
      };

      await new AobApplicationModel(applicationData).save();

      const foundApplication = await AobApplicationModel.findOne({
        emailAddress: applicationData.emailAddress,
      });

      expect(foundApplication).not.toBeNull();
      expect(foundApplication?.firstName).toBe(applicationData.firstName);
      expect(foundApplication?.lastName).toBe(applicationData.lastName);
    });
  });
});
