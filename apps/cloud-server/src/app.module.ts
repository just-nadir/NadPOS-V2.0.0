import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { SyncModule } from './sync/sync.module';
import { SyncController } from './sync/sync.controller';
import { SyncService } from './sync/sync.service';
import { SyncGateway } from './sync/sync.gateway';
import { RestaurantModule } from './restaurant/restaurant.module';
import { Restaurant } from './restaurant/entities/restaurant.entity';
import { Supply } from './restaurant/entities/supply.entity';
import { SupplyItem } from './restaurant/entities/supply-item.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE'),
        entities: [Restaurant, Supply, SupplyItem],
        synchronize: config.get<string>('NODE_ENV') !== 'production', // Only true in dev
        logging: false,
      }),
      inject: [ConfigService],
    }),
    RestaurantModule,
  ],
  controllers: [AppController, SyncController],
  providers: [AppService, SyncService, SyncGateway],
})
export class AppModule { }
