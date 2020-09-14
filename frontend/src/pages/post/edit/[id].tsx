import { Box, Button, Flex } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import { useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetPostFromURl } from "../../../utils/useGetPostFromUrl";

const EditPost = () => {
  const [{ data, fetching }] = useGetPostFromURl();
  const router = useRouter();

  const [, updatePost] = useUpdatePostMutation();

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
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          const { error } = await updatePost({
            id:
              typeof router.query.id === "string"
                ? parseInt(router.query.id)
                : -1,
            ...values,
            // title: values.text,
            // text: values.text,
          });
          if (!error) {
            router.push(`/post/${router.query.id}`);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" placeholder="Title" label="Title" />
            <Box mt={4}>
              <InputField
                textarea
                name="text"
                placeholder="text"
                label="Body"
              />
            </Box>
            <Flex mt={2} align="baseline">
              <Button
                mt={4}
                isLoading={isSubmitting}
                variantColor="teal"
                type="submit"
              >
                Update Post
              </Button>
            </Flex>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
