import React from "react";
import { Formik, Form } from "formik";
import { Box, Button } from "@chakra-ui/core";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
// import { useMutation } from "urql";
import { useRegisterMutation } from "../generated/graphql";

interface registerProps {}

// const REGISTER_MUTATION = `mutation Register($username: String!, $password: String!) {
//   register(options: { username: $username, password: $password }) {
//     errors {
//       field
//       message
//     }
//     user {
//       id
//       username
//     }
//   }
// }
// `;

const Register: React.FC<registerProps> = ({}) => {
  // const [, register] = useMutation(REGISTER_MUTATION);
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => {
          return register(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              placeholder="John Doe"
              label="Username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              isLoading={isSubmitting}
              variantColor="teal"
              type="submit"
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
