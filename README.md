# Sport Sales — app analytique sur Microsoft Fabric

Un fichier Excel de ventes d'articles de sport devient un tableau de bord web qui interroge un modèle sémantique en direct : ingestion dans un lakehouse, modélisation en étoile, mesures DAX et application React hébergée dans Fabric.

![Page Overview](docs/overview.png)

## Architecture

```
Excel ──► Lakehouse (6 tables Delta) ──► Modèle sémantique Direct Lake ──► App React (Rayfin)
          SportSalesLH                    Sport Sales Model                  hébergée dans Fabric
```

| Étape | Ce qui se passe |
|---|---|
| **Données** | La feuille Excel (9 644 ventes, 2020–2021) est nettoyée et découpée en schéma en étoile : `fact_sales` + `dim_date`, `dim_retailer`, `dim_product`, `dim_city`, `dim_sales_method`. |
| **Modèle** | Modèle sémantique en **Direct Lake** : relations, table calendrier marquée, 23 mesures DAX (CA, profit, coût, marge, prix moyen, comparaisons mois précédent et année précédente). |
| **App** | Application React + TypeScript. Chaque filtre envoie une requête DAX au modèle : aucune donnée n'est stockée dans l'app. |
| **Hébergement** | Déployée dans Fabric avec Rayfin, authentification Microsoft : seuls les utilisateurs ayant accès au modèle voient les données. |

## Fonctionnalités

- **Overview** : filtres année / mois / enseigne, 5 cartes KPI avec écart au mois précédent et mini-courbe, onglets Sales / Profit / Units / Cost, répartitions par canal, enseigne, produit, région, carte des États en tuiles, tendance mensuelle avec min, max et moyenne.
- **Summary** : tableaux détaillés enseigne × produit et région × État, avec CA, profit, unités, marge et évolution sur un an.
- Mode clair / sombre, export PNG, états de chargement et d'erreur sur chaque visuel.

![Page Summary](docs/summary.png)

## Structure du dépôt

```
data/        CSV du schéma en étoile, générés depuis l'Excel source
model/       build_model.py : génère la définition du modèle sémantique (Direct Lake)
dashboard/   l'application React (Rayfin)
  src/queries/   une requête .dax + une spec Vega-Lite + une fonction par visuel
  src/components/ cartes KPI, graphiques, filtres
  src/pages/      pages Overview et Summary
docs/        captures d'écran
```

## Validation

Les totaux du modèle ont été comparés à l'Excel source :

| Année | CA | Profit | Unités |
|---|---:|---:|---:|
| 2020 | 18 208 068 $ | 6 337 566 $ | 462 349 |
| 2021 | 71 782 145 $ | 26 875 910 $ | 2 016 512 |

Chaque requête de l'app a été exécutée contre le modèle avant d'être intégrée, pour utiliser les noms de colonnes exacts.

## Lancer le projet

Prérequis : Node.js LTS, Azure CLI, un workspace Fabric sur une capacité (essai possible) avec les paramètres de tenant *Fabric App Items* et *Semantic Model Execute Queries REST API* activés.

Les identifiants Fabric ne sont pas dans le dépôt : `dashboard/fabric.yaml` est créé par la commande `fabric-app-data add` ci-dessous (modèle dans `dashboard/fabric.example.yaml`), et `model/build_model.py` lit le point de terminaison SQL dans les variables `SPORT_SALES_SQL_SERVER` et `SPORT_SALES_SQL_ENDPOINT_ID`.

```bash
cd dashboard
npm install
npx rayfin login --tenant <tenant-id>
npx fabric-app-data add semanticModel sportSales -w <workspace-id> -i <semantic-model-id>
npx rayfin up --workspace-id <workspace-id>   # déploie l'app dans Fabric
npm run dev                                   # développement local
npm run test:fabric                           # ouvre l'app dans le portail Fabric (devUri)
```

## Stack

Microsoft Fabric (Lakehouse, Direct Lake, REST API) · DAX · React 19 · TypeScript · Tailwind CSS · Vega-Lite · Rayfin
