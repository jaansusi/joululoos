import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.use(cookieParser(process.env.COOKIE_SECRET));

  console.log('Starting up...')
  console.log('Node env', process.env.NODE_ENV);
  console.log('Host', process.env.HOST);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
