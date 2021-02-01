import http from "../http-common";

class PostDataService {
  getAll() {
    return http.get("/posts");
  }

  get(id) {
    return http.get(`/posts/${id}`);
  }

  createBlog(data) {
    return http.post("/create_blog", data);
  }

  findByTag(tag) {
    return http.get(`/posts?tag=${tag}`);
  }

  getPopularTags(){
    return http.get(`/popular_tags?limit=5`)
  }
  getAllBlogPosts(filterTag){
    return http.get(`/blogs`,{
      params:{
        order_type: "DESC",
        filter_tag: filterTag === undefined ? "" : filterTag,
      }
    })
  }
  updateVisitorCount(id) {                                                    
    return http.put(`/count_visitor/blog/${id}`)
  }

  getBlog(id) {
    return http.get(`/blog`,{
      params:{
        blog_id: id,
      }
    })
  }
  addNewComment(id, newComment) {
    return http.post(`/add_comment/blog/${id}`, newComment)
  }
}

export default new PostDataService();