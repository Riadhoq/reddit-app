import { Box, Heading } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import React from "react";
import { Layout } from "../../components/Layout";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetPostFromURl } from "../../utils/useGetPostFromUrl";

const Post = ({}) => {
  const [{ data, fetching }] = useGetPostFromURl();

  if (fetching) {
    return (
      <Layout>
        <Box>Loading...</Box>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find the post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading>{data.post.title}</Heading>
      <Box mt={4}>{data.post.text}</Box>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
