import express from 'express';
import type { Express, Request, Response, NextFunction } from 'express';
import type { Server } from 'http';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import type { IAppConfig } from '@/common/interfaces/app.interface';
import { DatabaseProvider } from '@/providers/database.provider';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec, swaggerUiOptions } from '@/config/swagger';
import { configurePassport } from '@/config/passport';
import logger from '@/common/utils/logger';
import { requestLogger } from '@/middleware/requestLogger';
import userRoutes from '@/modules/user/user.routes';
import channelRoutes from '@/modules/channel/channel.routes';
import hierarchyRoutes from '@/modules/hierarchy/hierarchy.routes';
import roleRoutes from '@/modules/role/role.routes';
import { HTTP_STATUS } from '@/common/constants/http-status.constants';
import eventRoutes from '@/modules/event/event.routes';
import taskRoutes from '@/modules/task/task.routes';
import agentRoutes from '@/modules/agent/agent.routes';
import designationRoutes from '@/modules/designation/designation.routes';
import projectRoutes from '@/modules/project/project.routes';
import productRoutes from '@/modules/product/product.routes';
import productCategoryRoutes from '@/modules/product-category/product-category.routes';
import permissionRoutes from '@/modules/permission/permission.routes';
import permissionResourceRoutes from '@/modules/permissionResources/permissionResource.routes';
import moduleRoutes from '@/modules/module/module.routes';
import moduleConfigRoutes from '@/modules/module-config/module-config.routes';
import resourceCenterMasterRoutes from '@/modules/resourceMaster/resource-center-master.routes';
import cookieParser from 'cookie-parser';

// Session constants
const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
const ONE_DAY_IN_MS = ONE_DAY_IN_SECONDS * 1000;
const TEN_MINUTES = 10;

export class App {
  private app: Express;
  private server: Server | null = null;
  private config: IAppConfig;
  private databaseProvider: DatabaseProvider;
  private readonly SESSION_SECRET =
    process.env.SESSION_SECRET ?? 'your-very-secure-session-secret-key-12345';

  constructor(config: IAppConfig) {
    this.config = config;
    this.app = express();
    this.databaseProvider = new DatabaseProvider(config.database);
    this.initializeMiddlewares();
    this.initializePassport();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(
      cors({
        origin: this.config.corsOrigin ?? '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
      }),
    );
    this.app.use(requestLogger);

    // Skip JSON parsing for multipart/form-data requests
    this.app.use((req, res, next) => {
      if (req.headers['content-type']?.includes('multipart/form-data')) {
        next();
      } else {
        express.json()(req, res, next);
      }
    });
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use(
      session({
        secret: this.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: this.config.database.uri,
          dbName: this.config.database.dbName,
          collectionName: 'sessions',
          ttl: ONE_DAY_IN_SECONDS,
          autoRemove: 'interval',
          autoRemoveInterval: TEN_MINUTES,
          touchAfter: ONE_DAY_IN_SECONDS,
        }),
        cookie: {
          secure: process.env.NODE_ENV === 'production',
          httpOnly: true,
          maxAge: ONE_DAY_IN_MS,
          sameSite: 'lax',
        },
      }),
    );

    this.app.use(cookieParser());
  }

  private initializePassport(): void {
    configurePassport();
    this.app.use(passport.initialize());
    this.app.use(passport.session());
  }

  private initializeSwagger(): void {
    this.app.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, swaggerUiOptions),
    );
  }

  private initializeRoutes(): void {
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/channels', channelRoutes);
    this.app.use('/api/hierarchies', hierarchyRoutes);
    this.app.use('/api/roles', roleRoutes);
    this.app.use('/api/events', eventRoutes);
    this.app.use('/api/tasks', taskRoutes);
    this.app.use('/api/agents', agentRoutes);
    this.app.use('/api/designations', designationRoutes);
    this.app.use('/api/projects', projectRoutes);
    this.app.use('/api/products', productRoutes);
    this.app.use('/api/product-categories', productCategoryRoutes);
    this.app.use('/api/permissions', permissionRoutes);
    this.app.use('/api/permission-resources', permissionResourceRoutes);
    this.app.use('/api/modules', moduleRoutes);
    this.app.use('/api/module-configs', moduleConfigRoutes);
    this.app.use('/api/resource-center-masters', resourceCenterMasterRoutes);

    // Handle 404
    this.app.use((req: Request, res: Response) => {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        status: 'error',
        message: `Route ${req.path} not found`,
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(
      (err: Error, req: Request, res: Response, _next: NextFunction) => {
        logger.error('Unhandled error:', {
          error: err.message,
          stack: err.stack,
          path: req.path,
          method: req.method,
          ip: req.ip,
        });

        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          status: 'error',
          message: 'Internal server error',
        });
      },
    );
  }

  public async start(): Promise<void> {
    try {
      await this.databaseProvider.connect();

      return new Promise(resolve => {
        this.server = this.app.listen(this.config.port, () => {
          logger.info(`Server is running on port ${this.config.port}`);
          resolve();
        });
      });
    } catch (error) {
      const err =
        error instanceof Error ? error : new Error('Failed to start server');
      logger.error('Failed to start server:', {
        error: err.message,
        stack: err.stack,
      });
      throw err;
    }
  }

  public async stop(): Promise<void> {
    if (this.server) {
      await this.databaseProvider.disconnect();
      this.server.close();
      logger.info('Server stopped');
    }
  }

  public getApp(): Express {
    return this.app;
  }
}
