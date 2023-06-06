import { useMutation } from "@apollo/client"
import { DELETE_LIKE, LIKE_CONTENT } from "../../graphql/likes/mutations"
import { GET_POST, GET_USER_POSTS } from "../../graphql/posts/queries"
import { Post } from "../../graphql/types/graphql"

const LikeButton = (props: {likes: number, contentId: string, contentType: string, userLiked: boolean }) => {
  const {likes, contentId, contentType, userLiked} = props

  const [likeContent, likeResults] = useMutation(LIKE_CONTENT, {
    variables: (contentType === 'post' 
      ? {postId: contentId} 
      : {commentId: contentId}),
    refetchQueries: [
      {query: GET_POST, variables: {postId: contentId}}
    ],
    update(cache) {
      cache.modify({
        fields: {
          getFeedPosts(existingPosts = []) {
            return existingPosts.map((post: Post) => {
              if(contentType === 'post' && post.postId === contentId) {
                let likesCount = post.likesCount + 1
                return {...post, likesCount, currentUserLike: true}
              } else return post
            })
          },
          getUserPosts(existingPosts = []) {
            return existingPosts.map((post: Post) => {
              if(post.postId === contentId) {
                let likesCount = post.likesCount + 1
                return {...post, likesCount, currentUserLike: true}
              } else return post
            })
          }
        }
      })
    }
  })

  const [unlikeContent, unlikeResults] = useMutation(DELETE_LIKE, {
    variables: (contentType === 'post' 
      ? {postId: contentId} 
      : {commentId: contentId}),
    refetchQueries: [
      {query: GET_POST, variables: {postId: contentId}}
    ], 
    update(cache) {
      cache.modify({
        fields: {
          getFeedPosts(existingPosts = []) {
            return existingPosts.map((post: Post) => {
              if(contentType === 'post' && post.postId === contentId) {
                let likesCount = post.likesCount - 1
                return {...post, likesCount, currentUserLike: null}
              } else return post
            })
          },
          getUserPosts(existingPosts = []) {
            return existingPosts.map((post: Post) => {
              if(post.postId === contentId) {
                let likesCount = post.likesCount - 1
                return {...post, likesCount, currentUserLike: null}
              } else return post
            })
          }
        }
      })
    }
  })

  const clickLike = () => {
    if(!userLiked) likeContent()
    else unlikeContent()
  }

  return (
    <div>
      <button onClick={() => clickLike()}> [{likes}] {userLiked ? 'unlike' : 'like'}</button>
    </div>
  )
}

export default LikeButton