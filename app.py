import os
import subprocess

from flask_cors import CORS
from flask import Flask, render_template, request

app = Flask(__name__)
# cors = CORS(app, resource={
#     r"/*":{
#         "origins":"*"
#     }
# })
CORS(app)

# @blueprint.after_request # blueprint can also be app~~
# def after_request(response):
#     header = response.headers
#     header['Access-Control-Allow-Headers'] = 'Content-Type'
#     header['Access-Control-Allow-Origin'] = '*'
#     return response

@app.route('/')
def init():  # put application's code here
    return redirect("http://www.example.com", code=302)

@app.route('/ggg')
def hello_world():  # put application's code here
    return 'Hello World!'

@app.route('/abc')
def abc():  # put application's code here
    return 'abc!'

@app.route('/aaa')
def index():
    return render_template('index.html')

def alume_tv():
    print('alume TV')
    #list_files = subprocess.run(["echo", "\"on 0\"", "|", "cec-client", "-s"])
    #print("The exit code was: %d" % list_files.returncode)
    res=os.system('echo "on 0" | cec-client -s')
    print("The exit code was: %d" % res)

def eteint_tv():
    print('eteint TV')
    list_files = subprocess.run(["echo", "\"standby 0\"", "|", "cec-client", "-s"])
    print("The exit code was: %d" % list_files.returncode)

@app.route('/tv')
def tv():
    args = request.args

    print(args)

    action=''

    if "action" in args:
        action = args["action"]

    print('action:',action)

    if action=='on':
        alume_tv()
    elif action=='off':
        eteint_tv()
    else:
        print(f'action {action} inconnue')

    return "No query string received", 200

if __name__ == '__main__':
    #app.run(host="0.0.0.0", ssl_context='adhoc')
    app.run(host="0.0.0.0")
