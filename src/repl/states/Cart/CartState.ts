import type {State} from "../../State.js";
import type {Interface} from "node:readline";
import {AuthService} from "../../../features/auth/AuthService.js";
import {CartService} from "../../../features/cart/CartService.js";
import {ProductService} from "../../../features/catalog/ProductService.js";
import {
  AccountState,
  CartPaymentState,
  CatalogState,
  type Choice,
  defaultErrorMessage, HomeState,
  promptForChoices
} from "../index.js";
import {readChar, questionAsync} from "../../utils.js";
import {SessionService} from "../../../features/auth/SessionService.js";

export class CartState implements State {
  public static instance: CartState = new CartState();

  private isInvalidChoice = false;
  private authService: AuthService;
  private sessionService: SessionService;
  private cartService: CartService;
  private productService: ProductService;
  
  private constructor() {
    this.authService = AuthService.instance;
    this.sessionService = SessionService.instance;
    this.cartService = CartService.instance;
    this.productService = ProductService.instance;
  }

  async printAndRead(rl: Interface): Promise<State> {
    if (!this.sessionService.isLoggedIn()) {
      rl.write("You need to be logged in before accessing your cart.\n\n");
      rl.write("Press anything to continue to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    const session = this.sessionService.getSession();
    if (!session) {
      rl.write("Error: Couldn't retrieve authentication session.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    const user = await this.authService.getUserById(this.sessionService.getSession()!.userId);
    if (!user) {
      rl.write("Error: Couldn't retrieve user.\n\n");
      rl.write("Press anything to go back to the Account page.\n");
      await readChar();
      return AccountState.instance;
    }

    rl.write("Cart page:\n\n");

    // Afficher le panier
    const cart = this.cartService.getCart();
    
    if (cart.items.length === 0) {
      rl.write("🛒 Your cart is empty.\n\n");
    } else {
      rl.write("🛒 Your Cart:\n");
      rl.write("─────────────────────────────────────────────────────\n");
      
      let index = 1;
      for (const item of cart.items) {
        const product = await this.productService.getProductById(item.productId);
        if (product) {
          const subtotal = item.price * item.quantity;
          rl.write(`${index}. ${product.name}\n`);
          rl.write(`   Price: $${item.price} × ${item.quantity} = $${subtotal.toFixed(2)}\n`);
          rl.write(`   Stock available: ${product.stock}\n\n`);
          index++;
        }
      }
      
      rl.write("─────────────────────────────────────────────────────\n");
      rl.write(`💰 TOTAL: $${cart.total.toFixed(2)}\n\n`);
    }

    // Construire les choix dynamiquement selon le contenu du panier
    const choices: Choice[] = [];
    
    // L'option "Continue to payment" n'est disponible que si le panier contient des articles
    if (cart.items.length > 0) {
      choices.push({
        choiceCharacter: '1',
        description: 'Continue to payment',
        state: CartPaymentState.instance
      });
    }
    
    choices.push(
      {
        choiceCharacter: cart.items.length > 0 ? '2' : '1',
        description: 'Browse catalog',
        state: CatalogState.instance
      },
      {
        choiceCharacter: cart.items.length > 0 ? '3' : '2',
        description: 'Go back to home',
        state: HomeState.instance
      }
    );

    const choice = await promptForChoices(rl, choices, this.isInvalidChoice ? defaultErrorMessage: undefined);
    
    if (!choice) {
      // Menu d'actions spéciales pour le panier
      rl.write("\n--- Cart Actions ---\n");
      rl.write("a) Add item to cart\n");
      rl.write("r) Remove item from cart\n");
      rl.write("c) Clear cart\n");
      rl.write("Enter your choice: ");
      
      const action = await readChar();
      rl.write(`\n\n`);
      
      if (action === 'a') {
        const productId = await questionAsync(rl, "Enter product ID: ");
        const quantity = await questionAsync(rl, "Enter quantity: ");
        
        try {
          await this.cartService.addItem(productId.trim(), parseInt(quantity));
          rl.write(`\n✅ Item added to cart!\n`);
        } catch (error) {
          rl.write(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
        }
        
        rl.write("Press any key to continue...");
        await readChar();
        return CartState.instance;
        
      } else if (action === 'r') {
        const productId = await questionAsync(rl, "Enter product ID to remove: ");
        
        try {
          await this.cartService.removeItem(productId.trim());
          rl.write(`\n✅ Item removed from cart!\n`);
        } catch (error) {
          rl.write(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
        }
        
        rl.write("Press any key to continue...");
        await readChar();
        return CartState.instance;
        
      } else if (action === 'c') {
        this.cartService.clearCart();
        rl.write(`\n✅ Cart cleared!\n`);
        rl.write("Press any key to continue...");
        await readChar();
        return CartState.instance;
      }
      
      this.isInvalidChoice = true;
      return CartState.instance;
    }

    this.isInvalidChoice = false;
    return choice;
  }
}