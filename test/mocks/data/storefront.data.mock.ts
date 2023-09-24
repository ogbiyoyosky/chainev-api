import { Storefront } from '../../../src/components/storefront/entities/storefront.entity';
import { CountryId } from './country.data.mock';
import { BusinessId } from './business.data.mock';

export const StoreId = 'Id';

export class MockStorefrontData extends Storefront {
  id = StoreId;
  name = 'Semi';
  link = 'https://test.com/';
  message = 'test message';
  about = 'secret';
  email = 'test@ivorypay.io';
  phoneNumber = '+2347012345678';
  whatsapp = '+2347012345678';
  twitter = 'test';
  facebook = 'tester';
  instagram = 'super_test';
  orders = 0;
  countryId = CountryId;
  businessId = BusinessId;
}
