import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNetworkTypeColumnToProjectEventsTable1692153670939 implements MigrationInterface {
    name = 'AddNetworkTypeColumnToProjectEventsTable1692153670939'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_events" DROP COLUMN "networkType"`);
        await queryRunner.query(`ALTER TABLE "project_events" ADD "networkType" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "project_events" DROP COLUMN "networkType"`);
        await queryRunner.query(`ALTER TABLE "project_events" ADD "networkType" uuid NOT NULL`);
    }

}
