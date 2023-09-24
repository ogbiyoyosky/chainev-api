import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveForeignKeyContraintOfEnvironmentFromProjectEventsTable1692311780468
  implements MigrationInterface
{
  name =
    'RemoveForeignKeyContraintOfEnvironmentFromProjectEventsTable1692311780468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_events" DROP CONSTRAINT "FK_89e071ad144b0df4292585eda45"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "project_events" ADD CONSTRAINT "FK_89e071ad144b0df4292585eda45" FOREIGN KEY ("environmentId") REFERENCES "project_environments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
