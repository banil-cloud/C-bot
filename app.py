from flask import Flask, request, jsonify, render_template
import requests
import csv
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)  # Enable CORS for frontend

# Confluence API details
CONFLUENCE_BASE_URL = "https://xxx.atlassian.net/wiki/rest/api/content/search"
CONFLUENCE_USERNAME = "xxx@mail.com"
CONFLUENCE_API_TOKEN = os.getenv("ATLASSIAN_API_TOKEN")

# Function to fetch Confluence documents
def search_confluence(query):
    auth = (CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN)  # Use tuple authentication
    headers = {"Content-Type": "application/json"}
    params = {"cql": f'text~"{query}"'}

    response = requests.get(CONFLUENCE_BASE_URL, headers=headers, params=params, auth=auth)

    if response.status_code == 200:
        data = response.json()
        results = [
            {
                "title": page["title"],
                "link": f"https://sunilksn3.atlassian.net/wiki{page['_links']['webui']}",
                "summary": "Click the link to view more details"
            }
            for page in data.get("results", [])
        ]
        return results
    else:
        return [{"title": "Error", "summary": "Failed to fetch documents", "link": ""}]

# Load FAQs from CSV file
def load_faqs():
    faqs = []
    try:
        with open("faqs.csv", newline="", encoding="utf-8") as csvfile:
            reader = csv.reader(csvfile)
            for row in reader:
                if len(row) == 2:
                    faqs.append({"question": row[0], "answer": row[1]})
    except FileNotFoundError:
        print("FAQs file not found.")
    return faqs

# API Endpoint to fetch Confluence documents
@app.route("/api/confluence", methods=["POST"])
def get_confluence_docs():
    query = request.json.get("query")
    if not query:
        return jsonify({"error": "Query is required"}), 400

    documents = search_confluence(query)
    return jsonify({"documents": documents})

# API Endpoint to fetch FAQs
@app.route("/api/faqs", methods=["GET"])
def get_faqs():
    faqs = load_faqs()
    return jsonify({"faqs": faqs})

# Serve the main page
@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
