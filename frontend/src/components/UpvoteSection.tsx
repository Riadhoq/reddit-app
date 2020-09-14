import { Flex, IconButton, Text } from "@chakra-ui/core";
import React, { useState } from "react";
import { PostSnippetFragment, useVoteMutation } from "../generated/graphql";

interface UpvoteSectionProps {
  postSnippet: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({
  postSnippet,
}) => {
  const [loadingState, setLoadingState] = useState<
    "upvote-loading" | "downvote-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr={4}>
      <IconButton
        onClick={async () => {
          setLoadingState("upvote-loading");
          await vote({
            postId: postSnippet.id,
            value: 1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "upvote-loading"}
        aria-label="upvote"
        icon="chevron-up"
      />
      <Text>{postSnippet.points}</Text>
      <IconButton
        onClick={async () => {
          setLoadingState("upvote-loading");
          await vote({
            postId: postSnippet.id,
            value: -1,
          });
          setLoadingState("not-loading");
        }}
        isLoading={loadingState === "downvote-loading"}
        aria-label="downvote"
        icon="chevron-down"
      />
    </Flex>
  );
};
