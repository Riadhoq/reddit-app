import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME, __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

const main = async () => {
  const typeOrmConnection = await createConnection({
    type: "postgres",
    database: "lireddit2",
    username: "postgres",
    password: "postgres",
    logging: true,
    synchronize: true,
    entities: [Post, User],
  });

  // await Post.delete({});

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis();

  //using cors to set cors globally
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
  // Order matters: needs to come before apollo because we'll use it in appollo
  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 1year
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
      },
      saveUninitialized: false,
      secret: "akldsjfhpawoia;sldkfj",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res, redis }),
  });

  //by default apollo sets cors to '*'
  apolloServer.applyMiddleware({ app, cors: false });

  // app.get("/", (_, res) => {
  //   res.send("askldjf;");
  // });

  app.listen(4000, () => {
    console.log("server started on", process.env.port || 4000);
  });

  // const post = orm.em.create(Post, { title: "my first post 2" });
  // await orm.em.persistAndFlush(post);
};

main().catch((err) => {
  console.log(err);
});
