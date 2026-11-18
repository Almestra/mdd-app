# Captures d’écran

Annexe du document [Documentation et rapport du projet MDD](../documentation-projet.md).

Cette annexe a pour but de montrer les vues principales de MDD, sur ordinateur (1440 × 900) et sur mobile (375 × 812), avec les composants Angular qui les composent. Les captures sont prises sur la build de production, avec des données de démonstration.

## Accueil, inscription et connexion

Composant `Home` pour l’accueil ; composants `Register` et `Login` pour les formulaires, dans la mise en page `AuthLayout`, avec la flèche de retour `BackLink`.

![Accueil sur ordinateur](captures-ecran/ordinateur/accueil.png)

![Inscription sur ordinateur](captures-ecran/ordinateur/inscription.png)

![Connexion sur ordinateur](captures-ecran/ordinateur/connexion.png)

<img src="captures-ecran/mobile/accueil.png" alt="Accueil sur mobile" width="260"> <img src="captures-ecran/mobile/inscription.png" alt="Inscription sur mobile" width="260"> <img src="captures-ecran/mobile/connexion.png" alt="Connexion sur mobile" width="260">

## Fil d’actualité

Composant `Feed`, qui affiche une carte `PostCard` par article, dans la mise en page `MainLayout` : sous 768 px de large, son bandeau replie la navigation dans un menu ☰, ouvert en panneau latéral.

![Fil d’actualité sur ordinateur](captures-ecran/ordinateur/fil.png)

<img src="captures-ecran/mobile/fil.png" alt="Fil d’actualité sur mobile" width="260" align="top"> <img src="captures-ecran/mobile/menu.png" alt="Menu sur mobile" width="260" align="top">

## Article et création d’article

Composant `PostDetail` pour la lecture, avec la liste et le formulaire des commentaires dans `Comments` ; composant `PostCreate` pour la création, dont la liste ne propose que les thèmes suivis.

![Article sur ordinateur](captures-ecran/ordinateur/article.png)

![Création d’article sur ordinateur](captures-ecran/ordinateur/creation-article.png)

<img src="captures-ecran/mobile/article.png" alt="Article sur mobile" width="260" align="top"> <img src="captures-ecran/mobile/creation-article.png" alt="Création d’article sur mobile" width="260" align="top">

## Thèmes et profil

Composant `Topics`, qui affiche une carte `TopicCard` par thème ; composant `Profile`, qui réunit `ProfileForm`, `PasswordForm`, `DeleteAccount` et `Subscriptions`, lequel réutilise `TopicCard` pour les thèmes suivis.

![Thèmes sur ordinateur](captures-ecran/ordinateur/themes.png)

![Profil sur ordinateur](captures-ecran/ordinateur/profil.png)

<img src="captures-ecran/mobile/themes.png" alt="Thèmes sur mobile" width="260" align="top"> <img src="captures-ecran/mobile/profil.png" alt="Profil sur mobile" width="260" align="top">

## Pages légales

Composants `PrivacyPolicy` et `LegalNotice`, dans la mise en page `LegalLayout` ; le pied de page `Footer` y mène depuis chaque page.

![Politique de confidentialité sur ordinateur](captures-ecran/ordinateur/politique-confidentialite.png)