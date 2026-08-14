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

function isLocalDatabase(host: string) {
  return host === 'localhost' || host === '127.0.0.1' || host === '::1';
}

function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL?.trim() ?? '';
  if (!raw) return raw;
  try {
    const parsed = new URL(raw);
    parsed.searchParams.delete('channel_binding');
    if (isLocalDatabase(parsed.hostname)) {
      // Local Postgres thường không bật SSL -> không ép sslmode.
      parsed.searchParams.delete('sslmode');
    } else if (!parsed.searchParams.has('sslmode')) {
      parsed.searchParams.set('sslmode', 'require');
    }
    return parsed.toString();
  } catch {
    return raw.replace(/[&?]channel_binding=[^&]*/g, '');
  }
}

function shouldUseSsl() {
  const raw = process.env.DATABASE_URL?.trim() ?? '';
  if (!raw) return false;
  try {
    return !isLocalDatabase(new URL(raw).hostname);
  } catch {
    return !raw.includes('localhost');
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
      ssl: shouldUseSsl() ? { rejectUnauthorized: false } : false,
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
