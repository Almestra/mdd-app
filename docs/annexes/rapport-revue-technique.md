# Rapport de revue technique

Annexe du document [Documentation et rapport du projet MDD](../documentation-projet.md).

Cette annexe a pour but de présenter la revue du code de MDD au 18/11/2026 : ses points forts, ses limites et les améliorations prévues, classées par priorité. Chaque limite indique, dans la mesure du possible, son risque et la correction envisagée.

## Points forts

- **Structure** : le front-end et le back-end sont rangés par fonctionnalité (`auth`, `user`, `topic`, `post`, `comment`…), le back-end en couches contrôleur, service et repository. Ajouter une fonctionnalité revient à ajouter un dossier, sans toucher aux autres.
- **Sécurité** : le jeton JWT voyage dans un cookie HttpOnly, hors de portée des scripts ; un second jeton bloque le CSRF, et l’attribut SameSite=Strict s’y ajoute. Les mots de passe sont hachés avec Argon2id, les requêtes SQL sont paramétrées, et les erreurs suivent le format Problem Details sans exposer de détail technique ; une connexion refusée ne dit pas si l’e-mail ou le mot de passe est faux.
- **Lisibilité** : presque toutes les classes du back-end portent une Javadoc ; le code reprend les termes du glossaire des spécifications.
- **Tests** : unitaires et d’intégration écrits avant le code, ils vérifient le comportement à travers l’API ou l’interface, sur une vraie base MySQL ; la couverture dépasse 98 % des lignes et des branches (voir l’annexe [Rapports de tests et de couverture](rapports-tests-couverture.md)).
- **Qualité outillée** : Spotless, Prettier et angular-eslint, les tests et les seuils de couverture tournent à chaque pull request ; SonarQube Cloud ne relève ni bug, ni faille, ni défaut de maintenabilité, avec 1,2 % de code dupliqué.

## Actions correctives appliquées

- **Anomalies révélées par les tests** : corrigées avant chaque fusion (voir l’annexe [Rapports de tests et de couverture](rapports-tests-couverture.md)).
- **Audits** : décalage de la mise en page, référencement et installation des dépendances dans l’intégration continue, corrigés à la suite de Lighthouse et de SonarQube Cloud (voir la section 3.2).
- **Branches protégées** : depuis la revue, une fusion dans `develop` ou `main` exige une pull request dont l’intégration continue a réussi.

## Améliorations à prévoir rapidement

- **Mot de passe pour les changements sensibles** : changer d’adresse e-mail ou supprimer son compte ne redemande pas le mot de passe actuel, alors que l’[OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) le recommande au moins pour l’e-mail. Une session restée ouverte suffit donc pour supprimer le compte, ou pour remplacer l’e-mail et bloquer ainsi l’accès de son titulaire, qui se connecte avec cette adresse.
- **Confirmation de la nouvelle adresse e-mail** : une nouvelle adresse devrait être confirmée par un lien qui lui est envoyé, avant de remplacer l’ancienne. Cela demande un service d’envoi d’e-mails, que le MVP n’utilise pas.
- **Mot de passe oublié** : aucun moyen de le réinitialiser seul. Correction : un lien de réinitialisation envoyé par e-mail, à usage unique et limité dans le temps, avec le même service d’envoi que la confirmation d’adresse.
- **Jeton non révocable** : valable 24 heures, le jeton reste utilisable après une déconnexion ou un changement de mot de passe s’il a été copié. Correction : un jeton d’accès de quelques minutes, renouvelé par un jeton de rafraîchissement que le back-end peut révoquer.
- **Double abonnement simultané** : si deux demandes d’abonnement au même thème arrivent au même instant, la seconde heurte la clé primaire et reçoit une erreur 500. L’interface bloque le double clic, mais pas un autre client de l’API. Correction : traiter la clé en double comme un abonnement déjà présent, donc comme un succès.
- **Mentions légales complètes** : il y manque le siège social d’ORION, son numéro d’immatriculation et le directeur de la publication, que la loi pour la confiance dans l’économie numérique (LCEN) impose avant une ouverture au public.
- **Aucun journal des événements** : rien de sensible ne peut fuir, mais une erreur ou une tentative d’attaque ne laisse aucune trace. Correction : journaliser les erreurs et les refus de connexion, sans mot de passe, jeton ni donnée personnelle.

## Évolutions si MDD s’ouvre à un large public

- **Pagination du fil d’actualité** : le fil charge en une fois tous les articles des thèmes suivis. Avec des milliers d’articles, la réponse deviendrait lourde ; une pagination par curseur, sur la date et l’identifiant, garderait chaque page légère.
- **Recherche d’articles** : avec le volume, retrouver un article ancien deviendrait difficile en faisant défiler le fil ; un filtre par thème, puis une recherche par mots-clés, y répondraient.
- **Vérification de l’abonnement en mémoire** : pour s’assurer qu’un utilisateur suit le thème d’un nouvel article, le back-end parcourt ses abonnements en mémoire. Le coût reste borné par les sept thèmes existants ; il faudra une requête ciblée le jour où les utilisateurs pourront créer des thèmes, ce qui demandera d’abord de paginer la page des thèmes.
- **Lecture et commentaires réservés aux thèmes suivis** : publier exige de suivre le thème, mais tout utilisateur connecté peut lire et commenter n’importe quel article, par exemple depuis un lien partagé. Réserver aussi la lecture aux abonnés ferait de chaque thème une communauté fermée : un choix de produit qui revient à ORION.
- **Date d’inscription** : les utilisateurs n’ont pas de date de création, utile pour les statistiques ou pour une durée de conservation des comptes inactifs. Une migration Flyway l’ajouterait sans perdre l’existant.
- **Afficher ou masquer le mot de passe** : un bouton dans les champs de mot de passe éviterait les fautes de frappe, surtout sur mobile, et aiderait les personnes qui ont du mal à taper sans voir.

## Dépendances et outillage

- **Logback 1.5.38** : une faille connue ne concerne que le `SiftingAppender` avec un discriminateur MDC, que MDD n’utilise pas ; elle n’est corrigée que dans Logback 1.6, que Spring Boot n’intègre pas encore.
- **Alertes des outils de développement** : minimatch (gravité modérée, tiré par ESLint) et picomatch (gravité élevée, tiré par Angular CLI, Vite et Vitest), sans version corrigée compatible. Ils ne servent qu’à construire et tester l’application : l’audit des dépendances de production (`npm audit --omit=dev`) ne relève aucune vulnérabilité.
- **Bibliothèques des tests** : `android-json`, `json-smart` et `asm` font l’objet d’alertes, mais ne servent qu’aux tests du back-end.
- **Versions forcées** : le `pom.xml` impose `jackson-bom` 3.1.8 et le pilote MySQL 26.10.0, plus récents que ceux de Spring Boot 4.1.2, pour corriger des failles connues. À retirer quand Spring Boot les intégrera.
- **Flyway et MySQL 9.7** : Flyway 12.4 avertit au démarrage que MySQL 9.7 dépasse la dernière version qu’il a validée (9.4). Les tests d’intégration, qui tournent sur un vrai MySQL 9.7, appliquent les migrations sans erreur.
- **Route `/.well-known/oauth-protected-resource`** : Spring Security l’ajoute d’office et la rend publique. Elle annonce un jeton transmis dans l’en-tête `Authorization`, alors que MDD le lit dans un cookie : une description inexacte, sans risque. Correction : la désactiver.

## Leçon du projet

- **Analyse SonarQube mise en place tard** : SonarQube Cloud n’a été branché qu’à la fin du développement. Idéalement, son quality gate tourne dès la première pull request, pour qu’un défaut soit signalé dans la pull request qui l’introduit. Le coût est resté faible ici, parce que la mise en forme, le lint et les seuils de couverture étaient vérifiés à chaque pull request depuis le début.