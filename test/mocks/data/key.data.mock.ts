import { KeyType } from '../../../src/components/key/enums/key.enum';
import { Key } from '../../../src/components/key/entities/key.entity';
import { RequestContext } from '../../../src/shared/enums/request-context.enum';
import { CountryId } from './country.data.mock';
import { UserId } from './user.data.mock';

export const MockKeyId = 'keyId';
export const MockPublicAPIKey =
  'pk_N0v3r2NKm2kPrpdh5GVkDRw47N9vvzsn948CamgBhPiq0wYEiGnZbV4nbbHDqGmQ';
export const MockSecretAPIKey =
  'sk_N0v3r2NKm2kPrpdh5GVkDRw47N9vvzsn948CamgBhPiq0wYEiGnZbV4nbbHDqGmQ';

export class MockAPIKeyData extends Key {
  id = MockKeyId;
  businessId = '2ee7af3d-17a4-41c3-b9ff-29e5a8ff2a88';
  context = RequestContext.TEST;
  type = KeyType.SECRET;
  value = MockPublicAPIKey;
  userId = UserId;
  createdAt = new Date('2022-04-23T10:06:05.035Z');
}
