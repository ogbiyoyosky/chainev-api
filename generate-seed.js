const ormconfig = require('./ormconfig');
const { writeFile } = require('fs');
const { argv } = require('process');
const path = require('path');

const composeFileName = () => {
  const userSpecifiedName = argv[2];
  if (!userSpecifiedName) throw new Error('You must specify a name');
  const extension = ormconfig.cli.useTypescript ? 'ts' : 'js';
  return `${Date.now()}-${userSpecifiedName}.${extension}`;
};

const generateFileContent = (fileName) => {
  return `import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import SeederManager from '../../shared/utils/seeder-manager';

const data = [];

export default class NewSeeder
  extends SeederManager
  implements Seeder
{
  constructor() {
    super(ReplaceWithYourEntity, data);
  }

  public async run(factory: Factory, connection: Connection): Promise<any> {
    await this.exec('${fileName}', connection);
  }
}
`;
}

const fileName = composeFileName();
const seedersDir = (Array.isArray(ormconfig.cli.seedersDir) && ormconfig.cli.seedersDir.length) ? ormconfig.cli.seedersDir[0] : '';
const filePath = path.join(__dirname, seedersDir, fileName);

writeFile(filePath, generateFileContent(fileName), (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Generated seeder ${fileName} successfully`);
  }
});
