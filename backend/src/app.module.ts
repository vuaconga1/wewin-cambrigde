import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { PermissionModule } from './permission/permission.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { GameModule } from './game/game.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { StudentModule } from './student/student.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { GameProgressModule } from './game-progress/game-progress.module';
import { VocabImagesModule } from './vocab-images/vocab-images.module';

function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim() ?? '';
  if (!raw) return raw;
  try {
    const parsed = new URL(raw);
    parsed.searchParams.delete('channel_binding');
    if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }
    return parsed.toString();
  } catch {
    return raw.replace(/[&?]channel_binding=[^&]*/g, '');
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: resolveDatabaseUrl(),
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: process.env.DATABASE_URL?.includes('localhost')
        ? false
        : { rejectUnauthorized: false },
      retryAttempts: 10,
      retryDelay: 3000,
    }),
    UserModule,
    RoleModule,
    AuthModule,
    PermissionModule,
    CloudinaryModule,
    GameModule,
    VocabularyModule,
    StudentModule,
    LeaderboardModule,
    GameProgressModule,
    VocabImagesModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
