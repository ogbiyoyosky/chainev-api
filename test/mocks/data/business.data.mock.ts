import { Business } from '../../../src/components/business/entities/business.entity';
import { RequestContext } from '../../../src/shared/enums/request-context.enum';
import { CountryId } from './country.data.mock';
import { UserId } from './user.data.mock';
export const BusinessId = 'businessId';

export class MockBusinessData extends Business {
  id = '2ee7af3d-17a4-41c3-b9ff-29e5a8ff2a88';
  name = 'Odogwu Compass';
  description = null;
  email = 'nwakasistephen52@gmail.com';
  phoneNumber = '+2347038202584';
  address = null;
  countryId = CountryId;
  userId = UserId;
  isVerified = false;
  status = 'active';
  context = RequestContext.TEST;
  createdAt = new Date('2022-04-17T12:49:16.846Z');
}
