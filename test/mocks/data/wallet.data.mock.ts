import { Wallet } from '../../../src/components/wallet/entities/wallet.entity';
import { CountryId } from './country.data.mock';

export const WalletId = 'Id';

export class MockWalletData extends Wallet {
  id = WalletId;
  firstName = 'Steve';
  lastName = 'Ify';
  email = 'test@mail.com';
  password = 'secret';
  isDeveloper = true;
  countryId = CountryId;
  phoneNumber = '+2347012345678';
}
