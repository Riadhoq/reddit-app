import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";

const main = async () => {
  // console.log("dirname", __dirname);
  const orm = await MikroORM.init(mikroConfig);
  await orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    context: () => ({ em: orm.em }),
  });

  apolloServer.applyMiddleware({ app });

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
