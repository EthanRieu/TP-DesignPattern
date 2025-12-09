import * as bcrypt from 'bcrypt';
import { PrismaClientSingleton } from "./client.js";
import { AppLogger } from "../AppLogger.js";

const prisma = PrismaClientSingleton.getInstance();

async function main() {

  // Nettoyer la DB
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Créer des users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const customer = await prisma.user.create({
    data: {
      email: 'client@test.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'CUSTOMER'
    }
  });

  const seller = await prisma.user.create({
    data: {
      email: 'vendeur@test.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: 'SELLER'
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });

  AppLogger.info('✅ Users created');

  // Créer des produits
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'iPhone 15 Pro',
        description: 'Dernier iPhone avec puce A17',
        price: 1199.99,
        stock: 50,
        category: 'ELECTRONICS'
      }
    }),
    prisma.product.create({
      data: {
        name: 'MacBook Pro M3',
        description: 'Laptop puissant pour développeurs',
        price: 2499.99,
        stock: 30,
        category: 'ELECTRONICS'
      }
    }),
    prisma.product.create({
      data: {
        name: 'T-shirt Nike',
        description: 'T-shirt sport respirant',
        price: 29.99,
        stock: 100,
        category: 'CLOTHING'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Jean Levi\'s 501',
        description: 'Jean classique coupe droite',
        price: 89.99,
        stock: 75,
        category: 'CLOTHING'
      }
    }),
    prisma.product.create({
      data: {
        name: 'Café en grains bio',
        description: 'Arabica 100% commerce équitable',
        price: 12.99,
        stock: 200,
        category: 'FOOD'
      }
    })
  ]);

  AppLogger.info('✅ Products created');

  // Créer une commande exemple
  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      status: 'DELIVERED',
      total: 1229.98,
      shippingAddress: '123 Rue de la Paix, 75001 Paris',
      paymentMethod: 'CREDIT_CARD',
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price
          },
          {
            productId: products[2].id,
            quantity: 1,
            price: products[2].price
          }
        ]
      }
    }
  });

  AppLogger.info('✅ Sample order created');

  AppLogger.info('\n📊 Database seeded with:');
  AppLogger.info(`- ${await prisma.user.count()} users`);
  AppLogger.info(`- ${await prisma.product.count()} products`);
  AppLogger.info(`- ${await prisma.order.count()} orders`);
  AppLogger.info('\n🔑 Test credentials:');
  AppLogger.info('   Client: client@test.com / password123');
  AppLogger.info('   Vendeur: vendeur@test.com / password123');
  AppLogger.info('   Admin: admin@test.com / password123');
}

main()
  .catch((e) => {
    AppLogger.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });