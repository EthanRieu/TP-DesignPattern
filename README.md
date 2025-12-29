# TP-DesignPattern

## Présentation rapide du projet

Ce projet contient une application qui gère des produits et commandes de plusieurs catégories provenant de multiples utilisateurs et stocke les informations dans une base de données.  
2 modes d'utilisation sont disponibles:
- Une interface de ligne de commande (CLI) permettant d'exécuter des opérations en passant des commandes en paramètres avec leurs arguments
- Une interface intéractive en format read, eval and print loop (REPL). Cette interface est recommandée car elle est plus simple et pratique d'utilisation

## Quick start

### Installation du projet

```
git clone https://github.com/EthanRieu/TP-DesignPattern/
cd TP-DesignPattern
npm i
```

### Setup environment

1. Copier le fichier d'exemple pour créer votre configuration locale :
```bash
cp .env.example .env
```
Cela configurera automatiquement la `DATABASE_URL` correcte pour Prisma.

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

4. Initialiser les datas de test par défaut (du `src/prisma/seed.ts`)
```bash
npm run db:seed
```

### Build du projet avec hot reloading

`npm run dev`

### Lancement du projet

#### Utilisation de l'interface REPL :
`npm start repl`

#### Utilisation des commandes CLI :
`npm start -- (command) (arguments)`

## Fonctionnalités de l'application :

L'application est divisée en 3 parties distinctes :
- **Account** : gestion utilisateur (création et authentification) et gestion des produits et commandes de l'utilisateur
- **Catalog** : affichage et filtrage des produits disponibles à l'achat. Création de produits et ajout de produits à son panier
- **Cart** : récapitulatif des produits dans le panier. Passage de commandes avec paiement par PayPal ou par carte bancaire 

Lorsque l'utilisateur se connecte à l'application, une session sera également sauvegardée pour ne pas avoir a se reconnecter la prochaine fois.

## Architecture technique de l'application :

```
TP-DesignPattern
│   .env.example                        - Variables d'environnement nécessaires au fonctionnement de l'application
│   package.json                        - Configuration du projet NodeJS
│   prisma.config.ts                    - Configuration de l'ORM Prisma pour intéragir avec la base de données de l'application
│   README.md                           - Fichier de documentation de l'application
│   tsconfig.json                       - Configuration de TypeScript et des options de transpilation
│
├───dist                                - Fichiers TypeScript transpilés en JavaScript
│
└───src
    │   AppLogger.ts                    - Facade permettant d'obtenir un Logger approprié à l'environnement sans se soucier de son initialisation
    │   index.ts                        - Point d'entrée de l'application, gère la résolution des commandes et redirige l'opération vers le fichier approprié 
    │
    ├───cli
    │   │   commands.ts                 - Énumération des commandes disponibles pour l'interface CLI
    │   │   parser.ts                   - Résolution des arguments en fonction de la commande et des arguments passés en paramètres
    │   │
    │   └───sub-command-arguments       - Définition des types d'arguments additionnels des commandes
    │
    ├───features
    │   ├───auth
    │   │       AuthService.ts          - Service singleton permettant de créer, modifier, supprimer, connecter, déconnecter des utilisateurs 
    │   │       SessionService.ts       - Service singleton permettant de gérer et persister la session d'un utilisateur sur son appareil
    │   │       UserFactory.ts          - Fichier exposant une Factory Method aux utilisateurs et utilisant des Abstract Factories en interne pour simplifier la création de différents types d'utilisateurs
    │   │
    │   ├───cart
    │   │       CartService.ts          - Service singleton permettant de lire, créer, modifier, supprimer et valider le panier d'un utilisateur
    │   │       CartValidator.ts        - Vérifie le stock des produits dans le panier 
    │   │
    │   ├───catalog
    │   │       ProductFactory.ts       - Fichier exposant des Abstract Factories pour simplifier la création de différents types de produits
    │   │       ProductService.ts       - Service singleton qui implémente la lecture, création, modification et suppression de produits en base de données  
    │   │       ProductUpdateBuilder.ts - Classe utilisant le pattern Builder pour construire un objet de mise à jour de produit étape par étape
    │   │
    │   ├───orders                      - Gestion des commandes
    │   │       OrderService.ts         - Service singleton permettant la lecture, creation et annulation d'une commande. S'abonne aux évènements de paiement pour que lorsque le paiement est validé, la commande est mise à l'état PENDING
    │   │
    │   └───payment                     - Gestion du paiement des commandes
    │           CreditCardAdapter.ts    - Implémentation d'un adapteur de paiement pour les cartes bancaires
    │           IPaymentAdapter.ts      - Interface Adapter permettant d'avoir une interface commune pour pouvoir traiter des paiements venant de différents moyens de paiement
    │           IPaymentObserver.ts     - Interface définissant la structure à implémenter pour souscrire à des évènements de paiement 
    │           PaymentService.ts       - Service singleton utilisant les adapters et contenant des évènements auquel d'autres classes peuvent souscrire (Observer Pattern)
    │           PayPalAdapter.ts        - Implémentation d'un adapteur de paiement pour les paiements par PayPal
    ├───prisma
    │   │   client.ts                   - Client singleton gérant la connexion unique à la base de données et le logging des opérations sur la base de données
    │   │   dev.db                      - Base de données SQLite
    │   │   schema.prisma               - Fichier représentant les tables de la base de données qui seront ensuite mappées à des objets TypeScript par Prisma
    │   │   seed.ts                     - Utilitaire permettant d'initialiser la base de données avec des données par défaut
    │   │
    │   └───migrations                  - Dossier contenant les différentes migrations de la base de données permettant un suivi des changements de modèle de base de données simplifié
    │
    ├───repl                            - Dossier contenant l'implémentation de l'interface REPL de l'application
    │   │   repl.ts                     - Point d'entrée de l'interface REPL utilisant le pattern State qui va exécuter la state actuelle jusqu'à ce qu'on atteigne la state "ExitState"
    │   │   State.ts                    - Classe abstraite définissant la structure d'une state. Une state contient une instance unique avec une méthode printAndRead qui va retourner une nouvelle state à la fin que la boucle principale va ensuite exécuter 
    │   │   utils.ts                    - Utilitaires utiles pour toutes les fonctionnalités de l'interface REPL
    │   │
    │   └───states                      - Contient tous les etats possibles de l'interface REPL
    │       │   ExitState.ts            - Etat final quand l'utilisateur quitte l'application
    │       │   HomeState.ts            - Premier etat de l'application, accueil permettant de se déplacer vers la page Account, Catalog et Cart
    │       │   utils.ts                - Utilitaires utiles pour l'ensemble des états de l'application
    │       │
    │       ├───Account                 - Page de gestion utilisateur : création de compte, connexion, déconnexion, gestion des produits et ocmmandes de l'utilisateur 
    │       │   │
    │       │   ├───MyOrders            - Gestion des commandes de l'utilisateur actuel
    │       │   └───MyProducts          - Gestion des produits de l'utilisateur actuel
    │       │
    │       ├───Cart                    - Page de gestion du panier utilisateur : récapitulatif, confirmation de commande et paiement
    │       │
    │       └───Catalog                 - Page de gestion du catalogue de produits : filtrage par catégorie, création de produits et ajout de produits au panier
    │
    └───types
            index.ts                    - Interfaces globales pour les utilisateurs, produits, et commandes. Contient aussi des constantes utilisés dans toute l'application             
```

## Explication détailée des Design Patterns utilisés dans l'application :

Cette application utilise les Design Patterns de manière extensive afin de parvenir à des problèmes rencontrés de manière efficace.
Voici les Design Patterns utilisés par l'application en fonction de leur catégorie :
- Patterns de Création :
  - Factory Method : création d'utilisateurs de différents types de manière simplifiée en passant par une méthode qui va s'occuper de sa création selon les paramètres passés 
  - Abstract Factory : facilite l'implémentation interne de la Factory Method pour la création d'utilisateurs. Egalement utilisée pour la création de produits
  - Builder : construction étape par étape une modification d'un produit. Utilisé par l'interface REPL depuis les informations donnés étape par étape par l'utilisateur
  - Singleton : Permet de n'avoir qu'une seule instance d'un objet pour éviter la création d'instances inutiles. Utilisé par les services d'authentification, session, produits et aussi par tous les états de l'interface REPL 
- Patterns de Structure :
  - Facade : simplification de création et d'utilisation d'un logger global. 
  - Adapter : sert d'interface commune entre les différents moyens de paiement avec des systèmes fonctionnant différemment
- Patterns de Comportement :
  - Observer : Permet la récéption de notifications de paiements par le service de commandes afin qu'il puisse la valider
  - State : utilisé par toute l'interface REPL pour définir des états de l'interface. La boucle principale n'a juste qu'à exécuter la méthode redéfinie de l'état actuelle