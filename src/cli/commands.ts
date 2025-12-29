enum Command {
  /** AuthService commands **/ 
  GetUsers = "get-users",
  GetUserById = "get-user-by-id",
  GetOrders = "get-orders",
  CreateUser = "create-user",
  EditUser = "edit-user",
  DeleteUser = "delete-user",
  Login = "login",
  Logout = "logout",
  Repl = "repl",
  /** ProductService commands **/
  GetProducts = "get-products",
  GetFilteredProducts = "get-filtered-products",
  GetProductById = "get-product-by-id",
  CreateProduct = "create-product",
  UpdateProduct = "update-product",
  DeleteProduct = "delete-product",
  /** OrderService commands **/
  /** CartService commands **/
  /** PaymentService commands **/
}

export default Command;