import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateProjectsTable1690048579292 implements MigrationInterface {
    name = 'CreateProjectsTable1690048579292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "projects" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "abi" text NOT NULL, "eventNames" text NOT NULL, "userId" character varying NOT NULL, "state" character varying NOT NULL DEFAULT 'STARTING_UP', "createdAtDateOnly" date NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "projects"`);
    }

}
