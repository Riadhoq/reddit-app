import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Post } from "../entities/Post";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  // Query is for fetching data
  @Query(() => [Post])
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
    const queryBuilder = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy('"createdAt"', "DESC") // have to add double quotations
      .take(realLimit);

    if (cursor) {
      queryBuilder.where('"createdAt" < :cursor', {
        cursor: new Date(parseInt(cursor)),
      });
    }

    return queryBuilder.getMany();
    // return Post.find();
  }

  //nullable for type-graphql
  @Query(() => Post, { nullable: true })
  post(
    //"id" controlls the post query argument
    @Arg("id") id: number
  ): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  //Mutation to add /update /delete
  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    // 1 sql queries
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save();
  }

  //Mutation to add /update /delete
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    //"id" controlls the post query
    @Arg("id") id: number,
    @Arg("title", { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOne(id);
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      Post.update({ id }, { title });
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    //"id" controlls the post query
    @Arg("id") id: number
  ): Promise<boolean> {
    Post.delete(id);
    return true;
  }
}
