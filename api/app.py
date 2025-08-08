
from flask import Flask, request, jsonify
import os
from web3 import Web3
import json
import requests
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
