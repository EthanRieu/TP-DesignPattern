# TP-DesignPattern

## Quick start

### Install the project

```
git clone https://github.com/EthanRieu/TP-DesignPattern/
cd TP-DesignPattern
npm i
```

### Prisma Config

1. Générer le client Prisma :

```bash
npx prisma generate
```

2. Créer la base de données et appliquer les migrations :

```bash
npx prisma migrate dev
```

Cela va créer automatiquement le fichier `src/prisma/dev.db` avec toutes les tables (User, Product, Order, OrderItem).

3. Visualiser sa DB -> Interface web de la DB SQLite
```bash
npm run db:studio
```

### Build the project with hot reloading

`npm run dev`

### Run the project

`npm start`
