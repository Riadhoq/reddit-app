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
        variantColor={postSnippet.voteStatus === 1 ? "green" : undefined}
        onClick={async () => {
          console.log(postSnippet);

          if (postSnippet.voteStatus === 1) {
            return;
          }
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
        variantColor={postSnippet.voteStatus === -1 ? "red" : undefined}
        onClick={async () => {
          if (postSnippet.voteStatus === -1) {
            return;
          }
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
