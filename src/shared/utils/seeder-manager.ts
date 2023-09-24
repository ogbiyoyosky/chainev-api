import { SeederTable } from '../../components/seeders/entities/seeder.entity';
import { Connection, EntityTarget } from 'typeorm';

export default class SeederManager {
  constructor(
    private readonly entity: EntityTarget<any>,
    public seeds: any[],
  ) {}

  public async exec(name: string, connection: Connection): Promise<any> {
    return connection
      .createEntityManager()
      .transaction(async (entiyManager) => {
        const result: any[] = await connection.query(
          `SELECT * FROM seeders WHERE name = $1;`,
          [name],
        );
        if (result.length) return;
        await entiyManager
          .createQueryBuilder()
          .insert()
          .into(this.entity)
          .values(this.seeds)
          .execute();
        await entiyManager
          .createQueryBuilder()
          .insert()
          .into(SeederTable)
          .values([{ name }])
          .execute();
      });
  }
}
