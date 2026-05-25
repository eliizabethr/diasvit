import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1779742391579 implements MigrationInterface {
    name = 'InitSchema1779742391579'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "item_category" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, "searchName" nvarchar(255) NOT NULL, CONSTRAINT "UQ_3776df63b26aee9f2089a70403d" UNIQUE ("name"), CONSTRAINT "PK_91ba90f150e8804bdaad7b17ff8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_502aa0884d73e6cc3cb43b33cb" ON "item_category" ("searchName") `);
        await queryRunner.query(`CREATE TABLE "inventory_operation" ("id" int NOT NULL IDENTITY(1,1), "itemId" int NOT NULL, "type" varchar(255) NOT NULL, "quantity" int NOT NULL, "stockBefore" int NOT NULL, "stockAfter" int NOT NULL, "applicationId" int, "applicationItemId" int, "performedByUserId" int NOT NULL, "comment" varchar(255), "createdAt" datetime2 NOT NULL CONSTRAINT "DF_37315c218931ce10a66819485cd" DEFAULT getdate(), CONSTRAINT "PK_e94fef7430db55d0352e0c337bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_52f2d86dc66f1237898c4a585b" ON "inventory_operation" ("applicationItemId", "type") WHERE "applicationItemId" IS NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_8b01b830e339357cd609f34dfe" ON "inventory_operation" ("itemId", "id") `);
        await queryRunner.query(`CREATE TABLE "item" ("id" int NOT NULL IDENTITY(1,1), "name" nvarchar(255) NOT NULL, "searchName" nvarchar(255) NOT NULL, "categoryId" int NOT NULL, "unit" varchar(255) NOT NULL, "currentStock" int NOT NULL CONSTRAINT "DF_3b9f25f69e98fd1c8f736ef41cf" DEFAULT 0, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_c5b036dd322fd93235dd6cc9711" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_e151cc43edaf5ddb4ee7c9e9e96" DEFAULT getdate(), CONSTRAINT "UQ_c6ae12601fed4e2ee5019544ddf" UNIQUE ("name"), CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_54141a459348525f1e7234be7a" ON "item" ("searchName") `);
        await queryRunner.query(`CREATE TABLE "application_item" ("id" int NOT NULL IDENTITY(1,1), "quantity" int NOT NULL, "applicationId" int, "itemId" int, CONSTRAINT "UQ_4aeda6136c973ef80f8ccccb421" UNIQUE ("applicationId", "itemId"), CONSTRAINT "PK_1211cc6463214f968f5c5886043" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application_status_transition" ("id" int NOT NULL IDENTITY(1,1), "applicationId" int NOT NULL, "fromStatus" varchar(255) NOT NULL, "toStatus" varchar(255) NOT NULL, "changedByUserId" int NOT NULL, "comment" varchar(255), "createdAt" datetime2 NOT NULL CONSTRAINT "DF_0fc2e610ce5dd4521f37dbf3b77" DEFAULT getdate(), CONSTRAINT "PK_d7c1fe3d842065dee43de16c945" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application" ("id" int NOT NULL IDENTITY(1,1), "fulfillmentType" varchar(255) NOT NULL, "deliveryCity" varchar(255), "deliveryAddress" varchar(255), "pickupLocation" varchar(255), "pickupDate" datetime, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_fbf7c30df9874c9687cd1a4d9e3" DEFAULT getdate(), "updatedAt" datetime2 NOT NULL CONSTRAINT "DF_6cefcb167bb871c0cb979cdb6cd" DEFAULT getdate(), "comment" varchar(255), "currentStatus" varchar(255) NOT NULL CONSTRAINT "DF_087e5077123668d95be8a81d1e4" DEFAULT 'new', "userId" int, CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" int NOT NULL IDENTITY(1,1), "phone" nvarchar(255) NOT NULL, "firstName" nvarchar(255) NOT NULL, "middleName" nvarchar(255) NOT NULL, "lastName" nvarchar(255) NOT NULL, "searchFullName" nvarchar(255) NOT NULL, "dateOfBirth" date NOT NULL, "roles" varchar(255) NOT NULL, CONSTRAINT "UQ_8e1f623798118e629b46a9e6299" UNIQUE ("phone"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_737950582127525badd9a5044b" ON "user" ("searchFullName") `);
        await queryRunner.query(`CREATE TABLE "verification_ticket" ("id" int NOT NULL IDENTITY(1,1), "tokenHash" varchar(255), "phone" nvarchar(255) NOT NULL, "purpose" nvarchar(255) NOT NULL, "userIp" varchar(255), "userAgent" varchar(255), "channel" nvarchar(255) NOT NULL, "createdAt" datetime2 NOT NULL CONSTRAINT "DF_abc84a7afdcdfaec5c1e11ca3d5" DEFAULT getdate(), "issuedAt" datetime, "expiresAt" datetime, "consumedAt" datetime, "provider" nvarchar(255) NOT NULL, "providerRequestId" nvarchar(255) NOT NULL, CONSTRAINT "PK_6c3974f2e830aefac692fee73e0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "inventory_operation" ADD CONSTRAINT "FK_035c3ba1c962d51cc6d5d98bd7e" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_operation" ADD CONSTRAINT "FK_6741b2901bfc410638b6fb6e3ce" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_operation" ADD CONSTRAINT "FK_c71883a5085963c07d67324e7b7" FOREIGN KEY ("applicationItemId") REFERENCES "application_item"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory_operation" ADD CONSTRAINT "FK_ce55c7769fef76cf4455e218df8" FOREIGN KEY ("performedByUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "item" ADD CONSTRAINT "FK_c0c8f47a702c974a77812169bc2" FOREIGN KEY ("categoryId") REFERENCES "item_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_item" ADD CONSTRAINT "FK_d7b225868af5d177467944ddf0a" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_item" ADD CONSTRAINT "FK_b59b25ab49e314cb874432b3e66" FOREIGN KEY ("itemId") REFERENCES "item"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_status_transition" ADD CONSTRAINT "FK_3afc21ae1526fc573b0a1de68fe" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application_status_transition" ADD CONSTRAINT "FK_814be70d751082af8118475a1bf" FOREIGN KEY ("changedByUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_b4ae3fea4a24b4be1a86dacf8a2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_b4ae3fea4a24b4be1a86dacf8a2"`);
        await queryRunner.query(`ALTER TABLE "application_status_transition" DROP CONSTRAINT "FK_814be70d751082af8118475a1bf"`);
        await queryRunner.query(`ALTER TABLE "application_status_transition" DROP CONSTRAINT "FK_3afc21ae1526fc573b0a1de68fe"`);
        await queryRunner.query(`ALTER TABLE "application_item" DROP CONSTRAINT "FK_b59b25ab49e314cb874432b3e66"`);
        await queryRunner.query(`ALTER TABLE "application_item" DROP CONSTRAINT "FK_d7b225868af5d177467944ddf0a"`);
        await queryRunner.query(`ALTER TABLE "item" DROP CONSTRAINT "FK_c0c8f47a702c974a77812169bc2"`);
        await queryRunner.query(`ALTER TABLE "inventory_operation" DROP CONSTRAINT "FK_ce55c7769fef76cf4455e218df8"`);
        await queryRunner.query(`ALTER TABLE "inventory_operation" DROP CONSTRAINT "FK_c71883a5085963c07d67324e7b7"`);
        await queryRunner.query(`ALTER TABLE "inventory_operation" DROP CONSTRAINT "FK_6741b2901bfc410638b6fb6e3ce"`);
        await queryRunner.query(`ALTER TABLE "inventory_operation" DROP CONSTRAINT "FK_035c3ba1c962d51cc6d5d98bd7e"`);
        await queryRunner.query(`DROP TABLE "verification_ticket"`);
        await queryRunner.query(`DROP INDEX "IDX_737950582127525badd9a5044b" ON "user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "application"`);
        await queryRunner.query(`DROP TABLE "application_status_transition"`);
        await queryRunner.query(`DROP TABLE "application_item"`);
        await queryRunner.query(`DROP INDEX "IDX_54141a459348525f1e7234be7a" ON "item"`);
        await queryRunner.query(`DROP TABLE "item"`);
        await queryRunner.query(`DROP INDEX "IDX_8b01b830e339357cd609f34dfe" ON "inventory_operation"`);
        await queryRunner.query(`DROP INDEX "IDX_52f2d86dc66f1237898c4a585b" ON "inventory_operation"`);
        await queryRunner.query(`DROP TABLE "inventory_operation"`);
        await queryRunner.query(`DROP INDEX "IDX_502aa0884d73e6cc3cb43b33cb" ON "item_category"`);
        await queryRunner.query(`DROP TABLE "item_category"`);
    }

}
