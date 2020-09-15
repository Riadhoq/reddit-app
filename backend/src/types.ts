import { Request, Response } from "express";
import { Redis } from "ioredis";
import { createUserLoader } from "./utils/createUserLoader";

export type MyContext = {
  req: Request & { session: Express.Session }; // & joins the two types together as opposed to, | which says either types
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
};
