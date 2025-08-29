# generate_report.py
import pandas as pd
import json
from datetime import datetime

# --- CONFIG ---
DATA_FILE = "data.csv"
OUTPUT_HTML = "rapport.html"
STYLE_FILE = "style.css"
SCRIPT_FILE = "script.js"
PROJECT_TITLE = "Générateur de rapports - 2025"

# --- Lire les données ---
df = pd.read_csv(DATA_FILE)

# Normaliser noms de colonnes
df.columns = [c.strip() for c in df.columns]

# Assurer types numériques pour calculs
for col in df.columns:
    if col.lower() not in ["mois", "month", "name"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

# Calculs du bénéfice
if "Ventes" in df.columns and "Depenses" in df.columns:
    df["Benefice"] = df["Ventes"] - df["Depenses"]
else:
    numeric_cols = [c for c in df.columns if c != df.columns[0]]
    if len(numeric_cols) >= 2:
        df["Benefice"] = df[numeric_cols[0]] - df[numeric_cols[1]]
    else:
        df["Benefice"] = 0

# Totaux
totaux = {
    "TotalVentes": int(df.get("Ventes", pd.Series([0])).sum()),
    "TotalDepenses": int(df.get("Depenses", pd.Series([0])).sum()),
    "TotalBenefice": int(df.get("Benefice", pd.Series([0])).sum()),
    "Lignes": len(df)
}

# Préparer données JSON
data_for_js = {
    "rows": df.to_dict(orient="records"),
    "columns": list(df.columns),
    "totaux": totaux,
    "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
}
data_json = json.dumps(data_for_js, ensure_ascii=False)

# --- Générer HTML complet ---
html_code = f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{PROJECT_TITLE}</title>
  <link rel="stylesheet" href="{STYLE_FILE}">
  <script src="https://cdn.plot.ly/plotly-2.26.0.min.js"></script>
</head>
<body>
  <div class="container">
    <header class="topbar">
      <div class="logo">✨ RapportPro</div>

      <!-- MENU DE NAVIGATION -->
      <nav class="menu">
        <a href="rapport.html">Rapport</a>
        <a href="historique.html">Historique</a>
        <a href="ajouter.html">Ajouter</a>
        <a href="comparaison.html">Comparaison</a>
        <a href="stats.html">Stats</a>
      </nav>

      <div class="meta">
        <div>Généré : <strong>{data_for_js["generated_at"]}</strong></div>
        <button id="exportPdf" class="btn">Exporter / Imprimer</button>
      </div>
    </header>

    <main>
      <section class="hero">
        <h1>📊 Rapport interactif</h1>
        <p class="subtitle">Synthèse automatique — données lues depuis <code>{DATA_FILE}</code></p>
      </section>

      <section class="cards">
        <article class="card">
          <div class="card-title">Total Ventes</div>
          <div class="card-value" id="totalVentes">--</div>
        </article>
        <article class="card">
          <div class="card-title">Total Dépenses</div>
          <div class="card-value" id="totalDepenses">--</div>
        </article>
        <article class="card">
          <div class="card-title">Total Bénéfices</div>
          <div class="card-value" id="totalBenefice">--</div>
        </article>
      </section>

      <section class="visual">
        <div class="visual-left">
          <h2>Évolution mensuelle</h2>
          <div id="chart" class="chart"></div>
        </div>
        <div class="visual-right">
          <h2>Options</h2>
          <div class="controls">
            <label><input type="checkbox" id="toggleVentes" checked /> Ventes</label><br>
            <label><input type="checkbox" id="toggleDepenses" checked /> Dépenses</label><br>
            <label><input type="checkbox" id="toggleBenefice" checked /> Bénéfice</label>
          </div>
          <h3>Filtrer mois</h3>
          <select id="selectMonth">
            <option value="all">Tous les mois</option>
          </select>
          <div style="height:20px"></div>
          <button id="refresh" class="btn">Rafraîchir le graphique</button>
        </div>
      </section>

      <section class="table-section">
        <h2>Détails des données</h2>
        <div id="tableWrap"></div>
      </section>

      <footer class="footer">
        <small>Rapport généré automatiquement — script Python</small>
      </footer>
    </main>
  </div>

  <!-- Données embarquées pour JS -->
  <script>
    window.REPORT_DATA = {data_json};
  </script>

  <!-- Script externe -->
  <script src="{SCRIPT_FILE}"></script>
</body>
</html>
"""

# Écrire le HTML final
with open(OUTPUT_HTML, "w", encoding="utf-8") as f:
    f.write(html_code)

print(f"✅ '{OUTPUT_HTML}' créé avec succès !")
print("ℹ️ Pour actualiser les données : modifie 'data.csv' puis relance 'python generate_report.py'.")
