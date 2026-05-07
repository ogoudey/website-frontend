from flask import Flask, jsonify, render_template
import requests
import os

app = Flask(__name__)

OLIMN_API_KEY = os.environ.get("OLIMN_API_KEY", None)

if not OLIMN_API_KEY:
    raise ValueError("Please set OLIMN_API_KEY")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/graph")
def get_graph():

    response = requests.get(
        "https://olimn.com/vlanet/api/graph",

        headers={
            "X-API-Key": OLIMN_API_KEY
        }
    )

    response.raise_for_status()

    data = response.json()

    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)