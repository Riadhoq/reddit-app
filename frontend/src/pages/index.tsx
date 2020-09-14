import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useState } from "react";
import { UpvoteSection } from "../components/UpvoteSection";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });

  const [{ data: meData }] = useMeQuery();

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  const [, deletePost] = useDeletePostMutation();
  if (!fetching && !data) {
    <div>No data was found</div>;
  }

  return (
    <Layout>
      {fetching && !data ? (
        <div>loading....</div>
      ) : (
        <Stack mb={8} spacing={8}>
          {data?.posts?.posts?.map((p) =>
            p?.id ? (
              <Flex key={p.id} p={5} shadow="md">
                <UpvoteSection postSnippet={p} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${p.id}`}>
                    <Link>
                      <Heading fontSize="lg">{p.title}</Heading>
                    </Link>
                  </NextLink>
                  <Text>posted by {p.creator.username}</Text>
                  <Flex>
                    <Text flex={1} mt={4}>
                      {p.textSnippet}
                    </Text>
                    {meData?.me?.id === p.creator.id ? (
                      <Box>
                        <NextLink
                          href="/post/edit/[id]"
                          as={`/post/edit/${p.id}`}
                        >
                          <IconButton
                            mr={2}
                            aria-label="edit post"
                            icon="edit"
                          />
                        </NextLink>
                        <IconButton
                          aria-label="delete post"
                          icon="delete"
                          onClick={() => {
                            deletePost({ id: p.id });
                          }}
                        />
                      </Box>
                    ) : null}
                  </Flex>
                </Box>
              </Flex>
            ) : null
          )}
        </Stack>
      )}
      {data && data.posts.hasMore ? (
        <Flex mb={8}>
          <Button
            isLoading={fetching}
            onClick={() =>
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            m="auto"
          >
            Load More
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
