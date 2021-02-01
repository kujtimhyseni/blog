import http from "../http-common";

class PostDataService {
  getAll() {
    return http.get("/posts");
  }

  get(id) {
    return http.get(`/posts/${id}`);
  }

  create(data) {
    return http.post("/posts", data);
  }

  update(id, data) {
    return http.put(`/posts/${id}`, data);
  }

  delete(id) {
    return http.delete(`/posts/${id}`);
  }

  deleteAll() {
    return http.delete(`/posts`);
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