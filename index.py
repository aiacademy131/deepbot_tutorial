#!/usr/bin/python
# -*- coding: utf-8 -*
'''
api.py: DeepBot Api Server
'''

import json
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__, static_url_path='')
CORS(app)


@app.route('/', methods=['GET', 'POST'])
def index():
    return render_template('index.html')

@app.route('/test', methods=['POST'])
def test():
    try:
        r = request.json
        return jsonify({"hi":"hi"})
    except Exception as e:
        return jsonify({"hi":str(e)})

@app.route('/message', methods=['GET', 'POST'])
def chatting():
    # request
    content = request.json['content']
    message = content['message']['text']

    return jsonify({'content' : content})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
