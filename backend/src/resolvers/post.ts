import { Upvote } from "../entities/Upvote";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { MyContext } from "../types";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  //runs everytime the post is called
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const isUpvote = value !== -1;
    const realValue = isUpvote ? 1 : -1;
    const { userId } = req.session;

    const upvote = await Upvote.findOne({ where: { postId, userId } });
    if (upvote && upvote.value !== realValue) {
      await getConnection().transaction(async (transactionManager) => {
        await transactionManager.query(
          `update upvote 
          set value = $1
          where "postId"=$2 and "userId"=$3`,
          [2 * realValue, postId, userId]
        );

        await transactionManager.query(
          `
        update post
        set points = points + $1
        where id = $2;
        `,
          [realValue, postId]
        );
      });
    } else if (!upvote) {
      // never voted before
      await getConnection().transaction(async (transactionManager) => {
        await transactionManager.query(
          `insert into upvote ("userId","postId", value)
        values ($1,$2,$3)`,
          [userId, postId, realValue]
        );
        await transactionManager.query(
          `    update post
        set points = points + $1
        where id = $2`,
          [realValue, postId]
        );
      });
    }

    return true;
  }

  // Query is for fetching data
  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;

    const replacements: any[] = [realLimitPlusOne];
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)));
    }

    const posts = await getConnection().query(
      `
      select p.*, 
      json_build_object(
        'id', u.id,
        'email',u.email, 
        'username', u.username,
        'createdAt',u."createdAt",
        'updatedAt',u."updatedAt") creator 
      from post p 
      inner join public.user as u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""} order by p."createdAt" DESC
      limit $1
    `,
      replacements
    );

    // const queryBuilder = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder("p")
    //   .innerJoinAndSelect("p.creator", "user")
    //   .orderBy('p."createdAt"', "DESC") // have to add double quotations
    //   .take(realLimitPlusOne);

    // if (cursor) {
    //   queryBuilder.where('"createdAt" < :cursor', {
    //     cursor: new Date(parseInt(cursor)),
    //   });
    // }

    // const posts = await queryBuilder.getMany();

    console.log(posts);

    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    };
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
