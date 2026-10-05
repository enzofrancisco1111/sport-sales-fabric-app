"""Génère model.bim (Direct Lake) pour le modèle sémantique Sport Sales."""
import json, os, pathlib, sys

# Point de terminaison SQL du lakehouse (Lakehouse > Paramètres > Point de terminaison SQL).
SQL_SERVER = os.environ.get("SPORT_SALES_SQL_SERVER")
SQL_ENDPOINT_ID = os.environ.get("SPORT_SALES_SQL_ENDPOINT_ID")
if not SQL_SERVER or not SQL_ENDPOINT_ID:
    sys.exit("Définissez SPORT_SALES_SQL_SERVER et SPORT_SALES_SQL_ENDPOINT_ID avant de lancer ce script.")


def col(name, src, dtype, fmt=None, hidden=False, **extra):
    c = {"name": name, "dataType": dtype, "sourceColumn": src}
    if fmt:
        c["formatString"] = fmt
    if hidden:
        c["isHidden"] = True
    c.update(extra)
    return c


def table(name, entity, columns, measures=None, **extra):
    t = {
        "name": name,
        "columns": columns,
        "partitions": [{
            "name": entity,
            "mode": "directLake",
            "source": {"type": "entity", "entityName": entity,
                       "schemaName": "dbo", "expressionSource": "DatabaseQuery"},
        }],
    }
    if measures:
        t["measures"] = measures
    t.update(extra)
    return t


def m(name, expr, fmt, folder=None):
    x = {"name": name, "expression": expr, "formatString": fmt}
    if folder:
        x["displayFolder"] = folder
    return x


EUR = "#,##0"
PCT = "0.0%"

measures = [
    m("Total Sales", "SUM(Sales[Sales Amount])", EUR, "Core"),
    m("Total Profit", "SUM(Sales[Profit Amount])", EUR, "Core"),
    m("Units Sold", "SUM(Sales[Units])", "#,##0", "Core"),
    m("Transactions", "COUNTROWS(Sales)", "#,##0", "Core"),
    m("Operating Margin %", "DIVIDE([Total Profit], [Total Sales])", PCT, "Core"),
    m("Avg Price per Unit", "DIVIDE([Total Sales], [Units Sold])", "#,##0.00", "Core"),
    m("Sales PY", "CALCULATE([Total Sales], SAMEPERIODLASTYEAR('Date'[Date]))", EUR, "Time"),
    m("Sales YoY %", "DIVIDE([Total Sales] - [Sales PY], [Sales PY])", PCT, "Time"),
    m("Profit PY", "CALCULATE([Total Profit], SAMEPERIODLASTYEAR('Date'[Date]))", EUR, "Time"),
    m("Profit YoY %", "DIVIDE([Total Profit] - [Profit PY], [Profit PY])", PCT, "Time"),
    m("Units PY", "CALCULATE([Units Sold], SAMEPERIODLASTYEAR('Date'[Date]))", "#,##0", "Time"),
    m("Units YoY %", "DIVIDE([Units Sold] - [Units PY], [Units PY])", PCT, "Time"),
    m("Total Cost", "[Total Sales] - [Total Profit]", EUR, "Core"),
]
# Mois précédent (cartes KPI "vs <mois>")
for base, short in [("Total Sales", "Sales"), ("Total Profit", "Profit"), ("Units Sold", "Units"),
                    ("Total Cost", "Cost"), ("Avg Price per Unit", "Avg Price")]:
    fmt = next(x["formatString"] for x in measures if x["name"] == base)
    measures.append(m(f"{short} PM", f"CALCULATE([{base}], DATEADD('Date'[Date], -1, MONTH))", fmt, "Time"))
    measures.append(m(f"{short} MoM %", f"DIVIDE([{base}] - [{short} PM], [{short} PM])", PCT, "Time"))

tables = [
    table("Sales", "fact_sales", [
        col("Invoice Date", "invoice_date", "dateTime", "yyyy-mm-dd", hidden=True),
        col("Retailer ID", "retailer_id", "int64", hidden=True),
        col("Product ID", "product_id", "int64", hidden=True),
        col("City ID", "city_id", "int64", hidden=True),
        col("Sales Method ID", "sales_method_id", "int64", hidden=True),
        col("Price per Unit", "price_per_unit", "double", "#,##0.00", summarizeBy="none"),
        col("Units", "units_sold", "int64", "#,##0", hidden=True),
        col("Sales Amount", "total_sales", "double", EUR, hidden=True),
        col("Profit Amount", "operating_profit", "double", EUR, hidden=True),
        col("Operating Margin", "operating_margin", "double", PCT, summarizeBy="none"),
    ], measures),
    table("Retailer", "dim_retailer", [
        col("Retailer ID", "retailer_id", "int64", hidden=True, isKey=True),
        col("Retailer", "retailer", "string"),
    ]),
    table("Product", "dim_product", [
        col("Product ID", "product_id", "int64", hidden=True, isKey=True),
        col("Product", "product", "string"),
    ]),
    table("Geography", "dim_city", [
        col("City ID", "city_id", "int64", hidden=True, isKey=True),
        col("City", "city", "string"),
        col("State", "state", "string"),
        col("Region", "region", "string"),
    ]),
    table("Sales Method", "dim_sales_method", [
        col("Sales Method ID", "sales_method_id", "int64", hidden=True, isKey=True),
        col("Sales Method", "sales_method", "string"),
    ]),
    table("Date", "dim_date", [
        col("Date", "date", "dateTime", "yyyy-mm-dd", isKey=True),
        col("Year", "year", "int64", "0", summarizeBy="none"),
        col("Quarter", "quarter", "string"),
        col("Month Num", "month_num", "int64", hidden=True, summarizeBy="none"),
        col("Month", "month", "string", sortByColumn="Month Num"),
        col("Year Month", "year_month", "dateTime", "yyyy-mm"),
    ], dataCategory="Time"),
]

rel = lambda n, f, t, tc: {"name": n, "fromTable": "Sales", "fromColumn": f,
                           "toTable": t, "toColumn": tc}
relationships = [
    rel("Sales_Retailer", "Retailer ID", "Retailer", "Retailer ID"),
    rel("Sales_Product", "Product ID", "Product", "Product ID"),
    rel("Sales_Geography", "City ID", "Geography", "City ID"),
    rel("Sales_SalesMethod", "Sales Method ID", "Sales Method", "Sales Method ID"),
    rel("Sales_Date", "Invoice Date", "Date", "Date"),
]

bim = {
    "compatibilityLevel": 1604,
    "model": {
        "culture": "en-US",
        "defaultPowerBIDataSourceVersion": "powerBI_V3",
        "tables": tables,
        "relationships": relationships,
        "expressions": [{
            "name": "DatabaseQuery",
            "kind": "m",
            "expression": ["let",
                           f'    database = Sql.Database("{SQL_SERVER}", "{SQL_ENDPOINT_ID}")',
                           "in", "    database"],
        }],
        "annotations": [{"name": "PBI_ProTooling", "value": "[\"DirectLake\"]"}],
    },
}

out = pathlib.Path(__file__).parent
(out / "model.bim").write_text(json.dumps(bim, indent=2), encoding="utf-8")
(out / "definition.pbism").write_text(json.dumps({"version": "1.0", "settings": {}}), encoding="utf-8")
print("model.bim written")
