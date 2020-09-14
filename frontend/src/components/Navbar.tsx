import React from "react";
import { Box, Button, Flex, Heading, Link } from "@chakra-ui/core";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(), //to stop it from running on server isServer= () => (window === 'undefined')
  });
  const [{ fetching: logOutFetching }, logout] = useLogoutMutation();
  let body = null;

  if (fetching) {
    //data loading
  } else if (!data?.me) {
    // user not logged in
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    // user is logged in
    body = (
      <Flex>
        <NextLink href="/create-post">
          <Button mr={4} ml="auto">
            Create Post
          </Button>
        </NextLink>
        <Box alignSelf="center" mr={2}>
          {data.me.username}
        </Box>
        <Button
          onClick={() => logout()}
          isLoading={logOutFetching}
          variant="link"
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex
      position="sticky"
      top="0"
      alignItems="center"
      zIndex={1}
      bg="azure"
      p={4}
    >
      <Flex maxW={800} flex={1} m="auto">
        <NextLink href="/">
          <Link>
            <Heading>Updeddit</Heading>
          </Link>
        </NextLink>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
