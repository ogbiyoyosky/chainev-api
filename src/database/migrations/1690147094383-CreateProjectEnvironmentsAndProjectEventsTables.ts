import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateProjectEnvironmentsAndProjectEventsTables1690147094383 implements MigrationInterface {
    name = 'CreateProjectEnvironmentsAndProjectEventsTables1690147094383'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project_environments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "networkType" character varying NOT NULL, "address" character varying NOT NULL, "webhookUrl" character varying NOT NULL, "projectId" uuid NOT NULL, "lastRecordedBlockNumber" integer NOT NULL, "state" character varying NOT NULL DEFAULT 'ACTIVE', "userId" character varying NOT NULL, "createdAtDateOnly" date NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3f3521151702ce859e6b9c623f7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payload" text NOT NULL, "projectId" uuid NOT NULL, "environmentId" uuid NOT NULL, "userId" uuid NOT NULL, "webhookAckAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "createdAtDateOnly" date NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4a8f4006922953e0fc56b38afe3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "project_environments" ADD CONSTRAINT "FK_2cd6868ecb452a543999fed8093" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_events" ADD CONSTRAINT "FK_91fd3874c57c8e5af126168e306" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_events" ADD CONSTRAINT "FK_89e071ad144b0df4292585eda45" FOREIGN KEY ("environmentId") REFERENCES "project_environments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_events" DROP CONSTRAINT "FK_89e071ad144b0df4292585eda45"`);
        await queryRunner.query(`ALTER TABLE "project_events" DROP CONSTRAINT "FK_91fd3874c57c8e5af126168e306"`);
        await queryRunner.query(`ALTER TABLE "project_environments" DROP CONSTRAINT "FK_2cd6868ecb452a543999fed8093"`);
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "project_events"`);
        await queryRunner.query(`DROP TABLE "project_environments"`);
    }

}
