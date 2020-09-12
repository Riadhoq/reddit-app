import { MikroORM } from "@mikro-orm/core";
import { COOKIE_NAME, __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import cors from "cors";

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

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
      store: new RedisStore({ client: redisClient, disableTouch: true }),
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
    context: ({ req, res }) => ({ em: orm.em, req, res }),
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
