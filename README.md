# Aniteve TV

<div align="center">
  <img src="https://github.com/user-attachments/assets/e1e6e3e2-84b8-4122-b7b1-a7dd03c8ff63" />
  <p>Une application React Native pour Android TV permettant de regarder des animes en streaming.</p>
</div>


## Description

Aniteve TV est une application de streaming d'animes conçue spécifiquement pour Android TV. Elle offre une interface utilisateur optimisée pour la navigation avec une télécommande et permet aux utilisateurs de parcourir, rechercher et regarder des animes avec une expérience adaptée aux grands écrans.

### Fonctionnalités principales

- 🎬 Interface optimisée pour Android TV avec navigation télécommande
- 👥 Support multi-utilisateurs
- 📺 Lecteur vidéo intégré avec support de multiples sources
- 🎨 Interface personnalisable avec choix de couleurs
- 💾 Sauvegarde de la progression de visionnage et reprise sur un autre appareil
- 🔐 Système d'authentification sécurisé
- ⚙️ Paramètres configurables
- ❌ Aucune publicité

## Prérequis

- Node.js (version 18 ou supérieure)
- npm
- Android Studio avec SDK Android
- Java Development Kit (JDK 17 ou supérieure)
- Un appareil Android TV ou un émulateur Android TV
- [Serveur Aniteve](https://github.com/Edd-io/Aniteve)

## Serveur requis

⚠️ **Important** : Cette application nécessite un serveur Aniteve fonctionnel pour accéder au contenu.

Aniteve TV est une application client qui se connecte au serveur Aniteve pour récupérer les données des animes, gérer l'authentification et la synchronisation entre appareils.


## Installation pour le développement

### 1. Cloner le projet

```bash
git clone https://github.com/Edd-io/Aniteve_TV
cd Aniteve_TV
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Android

Assurez-vous que les variables d'environnement suivantes sont configurées :

```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 4. Préparer l'environnement Metro

```bash
npm start
```

### 5. Lancer l'application

Dans un nouveau terminal :

```bash
npm run android
```

## Structure du projet

```
├── android/               # Code natif Android
├── srcs/
│   ├── constants/         # Constantes de l'application
│   ├── data/              # Services API et gestion des données
│   ├── models/            # Modèles de données
│   ├── types/             # Définitions TypeScript
│   ├── ui/                # Composants d'interface utilisateur
│   │   ├── anime/         # Écrans liés aux animes
│   │   ├── components/    # Composants réutilisables
│   │   ├── home/          # Écran d'accueil
│   │   ├── player/        # Lecteur vidéo
│   │   └── settings/      # Paramètres
│   └── utils/             # Utilitaires
├── App.tsx                # Point d'entrée principal
└── index.js               # Point d'entrée React Native
```

## Installation de l'APK de release sur Android TV

### 1. Activer le mode développeur

Sur votre Android TV :
1. Allez dans **Paramètres** > **Préférences de l'appareil** > **À propos**
2. Appuyez 7 fois sur **Version** pour activer le mode développeur
3. Retournez dans **Préférences de l'appareil** > **Options pour les développeurs**
4. Activez **Débogage USB**

### 2. Téléchager l'APK de release

```bash
wget https://github.com/Edd-io/Aniteve_TV/releases/download/V1/Aniteve_1.0.0.apk
```

Ou depuis la page des [releases](https://github.com/Edd-io/Aniteve_TV/releases/tag/V1)

### 3. Installer via ADB

```bash
# Connecter votre Android TV via USB ou réseau
adb connect <IP_DE_VOTRE_TV>:5555

# Installer l'APK
adb install Aniteve_1.0.0.apk
```

Bravo, vous avez installé l'application !

## Technologies utilisées

- **React Native** - Framework principal
- **TypeScript** - Typage statique
- **React Navigation** - Navigation entre écrans
- **AsyncStorage** - Stockage local
- **Linear Gradient** - Gradients d'interface
- **Vector Icons** - Icônes vectorielles

## Screenshots

<div align="center">
  <table>
    <tr>
      <td>
        <img width="480" height="270" alt="resume" src="https://github.com/user-attachments/assets/39a3f37d-85af-4dd7-8e84-ea549b0219f6" />
      </td>
      <td>
        <img width="480" height="270" alt="player" src="https://github.com/user-attachments/assets/f68159cb-3814-4bbf-884a-1bc97b2c58cd" />
      </td>
    </tr>
    <tr>
      <td>
        <img width="480" height="270" alt="home" src="https://github.com/user-attachments/assets/be81f4ac-06ed-4f08-a8c0-373b602c26b2" />
      </td>
      <td>
        <img width="480" height="270" alt="anime" src="https://github.com/user-attachments/assets/090665a7-4fe4-433a-9bc4-0d62b8e1cac5" />
      </td>
    </tr>
  </table>
</div>

## Contribution

1. Fork le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Committez vos changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Poussez vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrez une Pull Request

## Auteurs
- [Edd-io](https://github.com/Edd-io) - App
- [Nnaik0](https://github.com/Nnaik0) - Logo 

Pour toute question ou support, ouvrez un ticket sur GitHub.

###### Readme partially generated by AI
