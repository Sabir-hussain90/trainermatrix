import 'dotenv/config';
import { definePrismaConfig } from 'prisma/config';
import { defineConfig as ormConfig, prisma7Schema } from '@prisma/orm-postgres/config';

export default definePrismaConfig({
  orm: ormConfig({
    // This tells Prisma 8 to read your existing Prisma 7 schema
    contract: prisma7Schema('prisma/schema.prisma'),
    db: {
      connection: process.env['DATABASE_URL']!,
    },
  }),
});