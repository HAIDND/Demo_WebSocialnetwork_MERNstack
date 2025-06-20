import RightRequest from "~/components/Elements/Friend/RightRequest";

import { useContext, useState } from "react";
import { Grid } from "@mui/material";
import NewsfeedContent from "./newfeed.midle";
import NewPost from "./newPost";
import RightListFriend from "~/components/Elements/Friend/RightListFriend";
import { CurrentUser } from "~/context/GlobalContext";
import RecommendExtension from "../RecommendLocation/RecommendExtension";
import CreatePost from "~/components/Elements/Post/CreatePost";
import { NewsFeedProvider } from "./NewsFeedContext";
import Post from "./PostClaude";
import FriendSuggestionList from "~/components/RecommendNeo4j/FriendSuggestionList";

function Newsfeed() {
  const { isMobile } = useContext(CurrentUser);
  return (
    <NewsFeedProvider>
      <Grid container>
        <Grid
          item
          flex={2}
          sx={{ overflow: "auto" }}
          display={{ xs: "none", md: "block" }}
        ></Grid>
        <Grid item flex={3} sx={{ mt: 12, height: "100%" }}>
          {/* <NewPost /> */}
          {/* <Post visibility="public" /> */}
          <CreatePost />
          <FriendSuggestionList />
          <NewsfeedContent />
          {/* <Post />{" "} */}
        </Grid>
        {!isMobile && (
          <Grid item flex={2} sx={{ mt: 12, height: "100%", overflow: "auto" }}>
            <RightRequest />
            <RightListFriend />
            <RecommendExtension />
          </Grid>
        )}
      </Grid>
    </NewsFeedProvider>
  );
}

export default Newsfeed;
