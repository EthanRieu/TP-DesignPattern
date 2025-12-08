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
  /** OrderService commands **/
  /** CartService commands **/
  /** PaymentService commands **/
}

export default Command;