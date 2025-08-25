# Validation des nuitées – PWA Offline

Cette application permet de **vérifier et analyser les fichiers de nuitées** en se basant sur un **document de référence issu du téléservice de la Mairie de Paris**.  

⚠️ **Important** : nous n’avons **pas accès aux données réelles**.  
Tout se fait côté **frontend**, dans une **PWA Vue 3 / Vuetify**, entièrement **offline**.  

## Objectif

Fournir une **vue globale et synthétique** des fichiers de nuitées, détecter les anomalies et doublons, comparer plusieurs fichiers simultanément et générer des tableaux clairs pour faciliter l’analyse et la correction.

## Fonctionnement

- Import de fichiers de nuitées.  
- Contrôle des incohérences et doublons.  
- Génération de **tableaux synthétiques** pour visualiser rapidement les erreurs.  
- Traitement **100% local**, aucune donnée n’est envoyée à un serveur.

## Technologies

- **Frontend** : Vue 3 + Vuetify  
- **PWA** : traitement offline complet  
- **JavaScript** : traitement et comparaison ligne par ligne  
- **Affichage** : tableaux dynamiques côté client

## Utilisation

1. Ouvrir l’application dans un navigateur compatible PWA.  
2. Importer un ou plusieurs fichiers de nuitées.  
3. Consulter les tableaux générés pour identifier et corriger les incohérences.  
4. Tout se fait **localement**, aucune donnée n’est partagée.
