import codecs
import os
import subprocess
from enum import Enum

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

class EtatTv(Enum):
    Demarre=1
    Arrete=2
    Erreur=3

def lance_command(s):
    s2 = s.encode("utf-8")
    # s2.encode="utf-8"
    s2 = s2.decode('utf-8')
    list_files = subprocess.run(
        "cec-client -s",
        # ["echo", "\"on 0\"", "|", "cec-client", "-s"],
        shell=True,  # , text=True#,
        # capture_output=True
        capture_output=True, text=True, timeout=60,
        input=s2, encoding="utf-8"
    )
    return list_files

def alume_tv():
    print('alume TV')
    s="on 0"
    list_files=lance_command(s)
    # s2=s.encode("utf-8")
    # #s2.encode="utf-8"
    # s2=s2.decode('utf-8')
    # list_files = subprocess.run(
    #     "cec-client -s",
    #     # ["echo", "\"on 0\"", "|", "cec-client", "-s"],
    #     shell=True,  # , text=True#,
    #     # capture_output=True
    #     capture_output=True, text=True,timeout=60,
    #     input=s2,encoding="utf-8"
    # )
    # list_files = subprocess.run(
    #     "echo \"on0\" | cec-client -s",
    #     #["echo", "\"on 0\"", "|", "cec-client", "-s"],
    #                             shell=True, #, text=True#,
    #                             #capture_output=True
    #                             capture_output = True, text = True
    #                             )
    #print("The exit code was: %d" % list_files)
    print("The exit code was: %d" % list_files.returncode)
    print("stdout:", list_files.stdout)
    print("stderr:", list_files.stderr)
    #res = os.system('echo "on 0" | cec-client -s')
    #print("The exit code was: %d" % res)
    if list_files.returncode==0 and "powering on 'TV'" in list_files.stdout:
        return EtatTv.Demarre
    else:
        return EtatTv.Erreur


def eteint_tv():
    print('eteint TV')
    list_files = lance_command("standby 0")
    # list_files = subprocess.run(["echo", "\"standby 0\"", "|", "cec-client", "-s"])
    #res = os.system('echo "standby 0" | cec-client -s')
    #print("The exit code was: %d" % res)
    print("The exit code was: %d" % list_files.returncode)
    print("stdout:", list_files.stdout)
    print("stderr:", list_files.stderr)
    # res = os.system('echo "on 0" | cec-client -s')
    # print("The exit code was: %d" % res)
    if list_files.returncode == 0 and "putting 'TV' (0) in standby mode" in list_files.stdout:
        return EtatTv.Arrete
    else:
        return EtatTv.Erreur


def status_tv():
    print('status TV')
    # list_files = subprocess.run(["echo", "\"pow 0\"", "|", "cec-client", "-s"])
    #res = os.system('echo "pow 0" | cec-client -s')
    #print("The exit code was: %d" % res)
    list_files = lance_command("pow 0")
    # list_files = subprocess.run(["echo", "\"standby 0\"", "|", "cec-client", "-s"])
    #res = os.system('echo "standby 0" | cec-client -s')
    #print("The exit code was: %d" % res)
    print("The exit code was: %d" % list_files.returncode)
    print("stdout:", list_files.stdout)
    print("stderr:", list_files.stderr)
    # res = os.system('echo "on 0" | cec-client -s')
    # print("The exit code was: %d" % res)
    if list_files.returncode == 0:
        if "power status: on" in list_files.stdout:
            return EtatTv.Demarre
        elif "power status: in transition from on to standby" in list_files.stdout or "power status: standby" in list_files.stdout:
            return EtatTv.Arrete
        else:
            return EtatTv.Erreur
    else:
        return EtatTv.Erreur

@app.route('/tv')
def tv():
    args = request.args

    print(args)

    action = ''

    if "action" in args:
        action = args["action"]

    print('action:', action)

    if action == 'on':
        res=alume_tv()
        if res==EtatTv.Demarre:
            return "ok", 200
        else:
            return "Error", 201
    elif action == 'off':
        res=eteint_tv()
        if res==EtatTv.Demarre:
            return "ok", 200
        else:
            return "Error", 201
    elif action == 'status':
        res=status_tv()
        if res==EtatTv.Demarre:
            return "demarre", 201
        elif res==EtatTv.Arrete:
            return "arrete", 202
        else:
            return "Error", 203
    else:
        print(f'action {action} inconnue')

    return "No query string received", 200


if __name__ == '__main__':
    # app.run(host="0.0.0.0", ssl_context='adhoc')
    app.run(host="0.0.0.0")
