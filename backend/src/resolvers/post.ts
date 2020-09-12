import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  // Query is for fetching data
  @Query(() => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
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
  async createPost(@Arg("title") title: string): Promise<Post> {
    // 1 sql queries
    return Post.create({ title }).save();
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
